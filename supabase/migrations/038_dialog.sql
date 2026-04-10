-- ============================================================
-- Migration: Dialog Feature Core Schema
-- Compatible with current project style
-- - UUID-based new feature tables
-- - 7 languages
-- - auth.users user refs
-- - premium-aware RLS
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 0) Premium helper
-- Reuse the same pattern already used in project.
-- Safe to leave as-is if it already exists.
-- ------------------------------------------------------------
create or replace function public.is_premium_user()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(is_premium, false)
  from profiles
  where id = auth.uid();
$$;

-- ------------------------------------------------------------
-- 1) dialog_categories
-- ------------------------------------------------------------
create table if not exists public.dialog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,

  title_tr text not null,
  title_en text not null,
  title_sv text not null,
  title_de text not null,
  title_es text not null,
  title_fr text not null,
  title_pt text not null,

  description_tr text,
  description_en text,
  description_sv text,
  description_de text,
  description_es text,
  description_fr text,
  description_pt text,

  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2) dialog_scenarios
-- difficulty: 1=easy, 2=medium, 3=hard
-- ------------------------------------------------------------
create table if not exists public.dialog_scenarios (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.dialog_categories(id) on delete restrict,

  slug text not null unique,

  difficulty smallint not null
    check (difficulty between 1 and 3),

  is_premium boolean not null default false,
  is_active boolean not null default true,

  order_index integer not null default 0,
  estimated_seconds integer check (estimated_seconds is null or estimated_seconds > 0),
  turn_count smallint not null check (turn_count between 4 and 8),

  character_name text not null,
  character_role text not null,

  qa_status text not null default 'draft'
    check (qa_status in ('draft', 'review_pending', 'approved', 'rejected', 'needs_revision')),

  content_version integer not null default 1 check (content_version >= 1),

  title_tr text not null,
  title_en text not null,
  title_sv text not null,
  title_de text not null,
  title_es text not null,
  title_fr text not null,
  title_pt text not null,

  summary_tr text,
  summary_en text,
  summary_sv text,
  summary_de text,
  summary_es text,
  summary_fr text,
  summary_pt text,

  user_goal_tr text,
  user_goal_en text,
  user_goal_sv text,
  user_goal_de text,
  user_goal_es text,
  user_goal_fr text,
  user_goal_pt text,

  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3) dialog_turns
-- One row = one character/system message before options
-- ------------------------------------------------------------
create table if not exists public.dialog_turns (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.dialog_scenarios(id) on delete cascade,

  turn_index smallint not null check (turn_index >= 1),
  speaker_type text not null default 'character'
    check (speaker_type in ('character', 'system')),

  prompt_type text,
  grammar_focus text,
  vocabulary_focus text,

  message_tr text not null,
  message_en text not null,
  message_sv text not null,
  message_de text not null,
  message_es text not null,
  message_fr text not null,
  message_pt text not null,

  hint_tr text,
  hint_en text,
  hint_sv text,
  hint_de text,
  hint_es text,
  hint_fr text,
  hint_pt text,

  created_at timestamptz not null default now(),

  unique (scenario_id, turn_index)
);

-- ------------------------------------------------------------
-- 4) dialog_turn_options
-- Exactly 3 options per turn, exactly 1 correct (QA query enforced)
-- ------------------------------------------------------------
create table if not exists public.dialog_turn_options (
  id uuid primary key default gen_random_uuid(),
  turn_id uuid not null references public.dialog_turns(id) on delete cascade,

  option_index smallint not null check (option_index between 1 and 3),
  is_correct boolean not null default false,

  distractor_type text,
  rationale_tr text,
  rationale_en text,
  rationale_sv text,
  rationale_de text,
  rationale_es text,
  rationale_fr text,
  rationale_pt text,

  text_tr text not null,
  text_en text not null,
  text_sv text not null,
  text_de text not null,
  text_es text not null,
  text_fr text not null,
  text_pt text not null,

  created_at timestamptz not null default now(),

  unique (turn_id, option_index)
);

-- ------------------------------------------------------------
-- 5) user_dialog_progress
-- One row per user + scenario
-- Mirrors the spirit of user_reading_progress
-- ------------------------------------------------------------
create table if not exists public.user_dialog_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id uuid not null references public.dialog_scenarios(id) on delete cascade,

  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed', 'assigned')),

  shown_at date,
  completed_at timestamptz,

  total_sessions integer not null default 0 check (total_sessions >= 0),
  total_completed_sessions integer not null default 0 check (total_completed_sessions >= 0),

  best_score integer check (best_score is null or best_score >= 0),
  last_score integer check (last_score is null or last_score >= 0),

  total_correct_answers integer not null default 0 check (total_correct_answers >= 0),
  total_wrong_answers integer not null default 0 check (total_wrong_answers >= 0),

  best_first_try_accuracy numeric(5,2)
    check (
      best_first_try_accuracy is null
      or (best_first_try_accuracy >= 0 and best_first_try_accuracy <= 100)
    ),

  last_played_at timestamptz,
  created_at timestamptz not null default now(),

  unique (user_id, scenario_id)
);

-- ------------------------------------------------------------
-- 6) user_dialog_sessions
-- One row per play session
-- ------------------------------------------------------------
create table if not exists public.user_dialog_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id uuid not null references public.dialog_scenarios(id) on delete cascade,

  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'abandoned')),

  started_at timestamptz not null default now(),
  completed_at timestamptz,

  total_turns smallint not null check (total_turns >= 1),
  answered_turns smallint not null default 0 check (answered_turns >= 0),

  correct_on_first_try_count smallint not null default 0 check (correct_on_first_try_count >= 0),
  wrong_attempt_count integer not null default 0 check (wrong_attempt_count >= 0),

  final_score integer check (final_score is null or final_score >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),

  content_version integer check (content_version is null or content_version >= 1),

  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7) user_dialog_turn_attempts
-- One row per click / attempt
-- ------------------------------------------------------------
create table if not exists public.user_dialog_turn_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.user_dialog_sessions(id) on delete cascade,

  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id uuid not null references public.dialog_scenarios(id) on delete cascade,
  turn_id uuid not null references public.dialog_turns(id) on delete cascade,
  selected_option_id uuid not null references public.dialog_turn_options(id) on delete cascade,

  is_correct boolean not null,
  attempt_order smallint not null check (attempt_order >= 1),
  answered_at timestamptz not null default now(),

  unique (session_id, turn_id, attempt_order)
);

-- ------------------------------------------------------------
-- 8) Indexes
-- ------------------------------------------------------------
create index if not exists idx_dialog_categories_sort_order
  on public.dialog_categories(sort_order);

create index if not exists idx_dialog_categories_is_active
  on public.dialog_categories(is_active);

create index if not exists idx_dialog_scenarios_category
  on public.dialog_scenarios(category_id);

create index if not exists idx_dialog_scenarios_difficulty
  on public.dialog_scenarios(difficulty);

create index if not exists idx_dialog_scenarios_order
  on public.dialog_scenarios(order_index);

create index if not exists idx_dialog_scenarios_premium
  on public.dialog_scenarios(is_premium);

create index if not exists idx_dialog_scenarios_active
  on public.dialog_scenarios(is_active);

create index if not exists idx_dialog_scenarios_qa
  on public.dialog_scenarios(qa_status);

create index if not exists idx_dialog_turns_scenario
  on public.dialog_turns(scenario_id);

create index if not exists idx_dialog_turns_scenario_turn
  on public.dialog_turns(scenario_id, turn_index);

create index if not exists idx_dialog_turn_options_turn
  on public.dialog_turn_options(turn_id);

create index if not exists idx_dialog_turn_options_turn_correct
  on public.dialog_turn_options(turn_id, is_correct);

create index if not exists idx_udp_user
  on public.user_dialog_progress(user_id);

create index if not exists idx_udp_user_status
  on public.user_dialog_progress(user_id, status);

create index if not exists idx_udp_user_shown_status
  on public.user_dialog_progress(user_id, shown_at, status);

create index if not exists idx_uds_user
  on public.user_dialog_sessions(user_id);

create index if not exists idx_uds_scenario
  on public.user_dialog_sessions(scenario_id);

create index if not exists idx_uds_user_status
  on public.user_dialog_sessions(user_id, status);

create index if not exists idx_udta_session
  on public.user_dialog_turn_attempts(session_id);

create index if not exists idx_udta_user
  on public.user_dialog_turn_attempts(user_id);

create index if not exists idx_udta_turn
  on public.user_dialog_turn_attempts(turn_id);

create index if not exists idx_udta_option
  on public.user_dialog_turn_attempts(selected_option_id);

-- ------------------------------------------------------------
-- 9) RLS
-- ------------------------------------------------------------

alter table public.dialog_categories enable row level security;
alter table public.dialog_scenarios enable row level security;
alter table public.dialog_turns enable row level security;
alter table public.dialog_turn_options enable row level security;

alter table public.user_dialog_progress enable row level security;
alter table public.user_dialog_sessions enable row level security;
alter table public.user_dialog_turn_attempts enable row level security;

-- Content read policies
create policy "dialog_categories_select"
  on public.dialog_categories for select
  using (true);

create policy "dialog_scenarios_select"
  on public.dialog_scenarios for select
  using (is_active = true and (is_premium = false or is_premium_user()));

create policy "dialog_turns_select"
  on public.dialog_turns for select
  using (
    exists (
      select 1
      from public.dialog_scenarios ds
      where ds.id = dialog_turns.scenario_id
        and ds.is_active = true
        and (ds.is_premium = false or is_premium_user())
    )
  );

create policy "dialog_turn_options_select"
  on public.dialog_turn_options for select
  using (
    exists (
      select 1
      from public.dialog_turns dt
      join public.dialog_scenarios ds on ds.id = dt.scenario_id
      where dt.id = dialog_turn_options.turn_id
        and ds.is_active = true
        and (ds.is_premium = false or is_premium_user())
    )
  );

-- User own-row policies
create policy "udp_select_own"
  on public.user_dialog_progress for select
  using (auth.uid() = user_id);

create policy "udp_insert_own"
  on public.user_dialog_progress for insert
  with check (auth.uid() = user_id);

create policy "udp_update_own"
  on public.user_dialog_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "udp_delete_own"
  on public.user_dialog_progress for delete
  using (auth.uid() = user_id);

create policy "uds_select_own"
  on public.user_dialog_sessions for select
  using (auth.uid() = user_id);

create policy "uds_insert_own"
  on public.user_dialog_sessions for insert
  with check (auth.uid() = user_id);

create policy "uds_update_own"
  on public.user_dialog_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "uds_delete_own"
  on public.user_dialog_sessions for delete
  using (auth.uid() = user_id);

create policy "udta_select_own"
  on public.user_dialog_turn_attempts for select
  using (auth.uid() = user_id);

create policy "udta_insert_own"
  on public.user_dialog_turn_attempts for insert
  with check (auth.uid() = user_id);

create policy "udta_update_own"
  on public.user_dialog_turn_attempts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "udta_delete_own"
  on public.user_dialog_turn_attempts for delete
  using (auth.uid() = user_id);

commit;