-- ============================================================
-- Migration 047: Content report foundation
-- Adds a shared reporting table and RPC for preset sentences,
-- reading texts, and dialog turns.
-- ============================================================

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null,
  status text not null default 'open',
  report_reason text not null,
  content_type text not null,
  content_id text not null,
  parent_content_type text,
  parent_content_id text,
  source_lang text not null,
  target_lang text not null,
  screen_context text not null,
  user_note text,
  snapshot_json jsonb not null,
  anchor_json jsonb,
  dedupe_key text not null,
  resolved_at timestamptz,
  resolved_by uuid,
  resolution_note text,
  constraint content_reports_status_check
    check (status in ('open', 'reviewing', 'resolved', 'dismissed', 'spam')),
  constraint content_reports_reason_check
    check (report_reason in ('typo', 'translation', 'unnatural', 'keyword', 'tts', 'other')),
  constraint content_reports_content_type_check
    check (content_type in ('preset_sentence', 'reading_text', 'dialog_turn')),
  constraint content_reports_parent_type_check
    check (parent_content_type is null or parent_content_type = 'scenario'),
  constraint content_reports_lang_check
    check (
      source_lang in ('tr', 'en', 'sv', 'de', 'es', 'fr', 'pt')
      and target_lang in ('tr', 'en', 'sv', 'de', 'es', 'fr', 'pt')
    ),
  constraint content_reports_screen_context_check
    check (char_length(btrim(screen_context)) between 1 and 64),
  constraint content_reports_note_length_check
    check (user_note is null or char_length(user_note) <= 500),
  constraint content_reports_resolution_note_length_check
    check (resolution_note is null or char_length(resolution_note) <= 1000)
);

create index if not exists idx_content_reports_status_created
  on public.content_reports(status, created_at desc);

create index if not exists idx_content_reports_content_lookup
  on public.content_reports(content_type, content_id, created_at desc);

create index if not exists idx_content_reports_parent_lookup
  on public.content_reports(parent_content_type, parent_content_id, created_at desc);

create index if not exists idx_content_reports_user_created
  on public.content_reports(user_id, created_at desc);

create unique index if not exists idx_content_reports_user_dedupe_open
  on public.content_reports(user_id, dedupe_key)
  where status in ('open', 'reviewing');

create or replace function public.touch_content_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_content_reports_updated_at on public.content_reports;
create trigger trg_content_reports_updated_at
before update on public.content_reports
for each row
execute function public.touch_content_reports_updated_at();

alter table public.content_reports enable row level security;

drop policy if exists "content_reports_select_own" on public.content_reports;
create policy "content_reports_select_own"
  on public.content_reports
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.submit_content_report(
  p_content_type text,
  p_content_id text,
  p_parent_content_type text default null,
  p_parent_content_id text default null,
  p_report_reason text default null,
  p_source_lang text default null,
  p_target_lang text default null,
  p_screen_context text default null,
  p_user_note text default null,
  p_snapshot_json jsonb default null,
  p_anchor_json jsonb default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_note text := nullif(btrim(coalesce(p_user_note, '')), '');
  v_dedupe_key text;
  v_existing_id uuid;
  v_recent_count integer;
  v_turn_scenario_id uuid;
  v_report_id uuid;
begin
  if v_user_id is null then
    return jsonb_build_object('status', 'validation_error', 'reason', 'unauthenticated');
  end if;

  if p_content_type not in ('preset_sentence', 'reading_text', 'dialog_turn') then
    return jsonb_build_object('status', 'validation_error', 'reason', 'invalid_content_type');
  end if;

  if p_report_reason not in ('typo', 'translation', 'unnatural', 'keyword', 'tts', 'other') then
    return jsonb_build_object('status', 'validation_error', 'reason', 'invalid_report_reason');
  end if;

  if p_source_lang not in ('tr', 'en', 'sv', 'de', 'es', 'fr', 'pt')
     or p_target_lang not in ('tr', 'en', 'sv', 'de', 'es', 'fr', 'pt') then
    return jsonb_build_object('status', 'validation_error', 'reason', 'invalid_language_pair');
  end if;

  if nullif(btrim(coalesce(p_content_id, '')), '') is null then
    return jsonb_build_object('status', 'validation_error', 'reason', 'missing_content_id');
  end if;

  if nullif(btrim(coalesce(p_screen_context, '')), '') is null
     or char_length(btrim(p_screen_context)) > 64 then
    return jsonb_build_object('status', 'validation_error', 'reason', 'invalid_screen_context');
  end if;

  if p_snapshot_json is null or jsonb_typeof(p_snapshot_json) <> 'object' then
    return jsonb_build_object('status', 'validation_error', 'reason', 'invalid_snapshot');
  end if;

  if p_anchor_json is not null and jsonb_typeof(p_anchor_json) <> 'object' then
    return jsonb_build_object('status', 'validation_error', 'reason', 'invalid_anchor');
  end if;

  if v_note is not null and char_length(v_note) > 500 then
    return jsonb_build_object('status', 'validation_error', 'reason', 'note_too_long');
  end if;

  if p_content_type = 'preset_sentence' then
    if p_parent_content_type is not null or p_parent_content_id is not null then
      return jsonb_build_object('status', 'validation_error', 'reason', 'unexpected_parent');
    end if;

    if not exists (
      select 1
      from public.sentences s
      where s.id::text = p_content_id
    ) then
      return jsonb_build_object('status', 'validation_error', 'reason', 'content_not_found');
    end if;
  elsif p_content_type = 'reading_text' then
    if p_parent_content_type is not null or p_parent_content_id is not null then
      return jsonb_build_object('status', 'validation_error', 'reason', 'unexpected_parent');
    end if;

    if not exists (
      select 1
      from public.reading_texts rt
      where rt.id::text = p_content_id
    ) then
      return jsonb_build_object('status', 'validation_error', 'reason', 'content_not_found');
    end if;
  else
    if p_parent_content_type <> 'scenario'
       or nullif(btrim(coalesce(p_parent_content_id, '')), '') is null then
      return jsonb_build_object('status', 'validation_error', 'reason', 'missing_dialog_parent');
    end if;

    select dt.scenario_id
    into v_turn_scenario_id
    from public.dialog_turns dt
    where dt.id::text = p_content_id;

    if v_turn_scenario_id is null then
      return jsonb_build_object('status', 'validation_error', 'reason', 'content_not_found');
    end if;

    if v_turn_scenario_id::text <> p_parent_content_id then
      return jsonb_build_object('status', 'validation_error', 'reason', 'parent_mismatch');
    end if;
  end if;

  select count(*)
  into v_recent_count
  from public.content_reports cr
  where cr.user_id = v_user_id
    and cr.created_at >= now() - interval '10 minutes';

  if v_recent_count >= 6 then
    return jsonb_build_object('status', 'rate_limited');
  end if;

  v_dedupe_key := md5(
    concat_ws(
      '|',
      p_content_type,
      coalesce(p_parent_content_type, ''),
      coalesce(p_parent_content_id, ''),
      p_content_id,
      p_report_reason,
      p_source_lang,
      p_target_lang,
      coalesce(md5(p_anchor_json::text), '')
    )
  );

  select cr.id
  into v_existing_id
  from public.content_reports cr
  where cr.user_id = v_user_id
    and cr.dedupe_key = v_dedupe_key
    and cr.status in ('open', 'reviewing')
  limit 1;

  if v_existing_id is not null then
    return jsonb_build_object('status', 'duplicate_report', 'report_id', v_existing_id);
  end if;

  insert into public.content_reports (
    user_id,
    status,
    report_reason,
    content_type,
    content_id,
    parent_content_type,
    parent_content_id,
    source_lang,
    target_lang,
    screen_context,
    user_note,
    snapshot_json,
    anchor_json,
    dedupe_key
  ) values (
    v_user_id,
    'open',
    p_report_reason,
    p_content_type,
    p_content_id,
    p_parent_content_type,
    p_parent_content_id,
    p_source_lang,
    p_target_lang,
    p_screen_context,
    v_note,
    p_snapshot_json,
    p_anchor_json,
    v_dedupe_key
  )
  returning id into v_report_id;

  return jsonb_build_object('status', 'ok', 'report_id', v_report_id);
exception
  when unique_violation then
    return jsonb_build_object('status', 'duplicate_report');
end;
$$;

grant execute on function public.submit_content_report(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb
) to authenticated;
