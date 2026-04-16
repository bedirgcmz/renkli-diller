-- ============================================================
-- Live DB inspection for game score pipeline
-- Purpose:
--   Audit the REAL production schema/state before deciding whether
--   migration 044_harden_game_score_rpc.sql is safe to apply.
--
-- How to use:
--   1. Run this whole file in the live DB SQL editor.
--   2. Copy all result grids / outputs and send them back.
--   3. If the SQL editor truncates long function bodies, run the
--      function-definition queries separately and send those too.
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Environment + search_path + current role
-- ----------------------------------------------------------------
select
  'environment' as section,
  current_database() as current_database,
  current_user as current_user,
  session_user as session_user,
  current_setting('search_path', true) as search_path,
  version() as postgres_version;

-- ----------------------------------------------------------------
-- 2. Migration metadata presence
--    Safe on projects that do not expose supabase_migrations.
-- ----------------------------------------------------------------
select
  'migration_metadata_presence' as section,
  to_regclass('supabase_migrations.schema_migrations') as schema_migrations_table,
  to_regclass('public.schema_migrations') as public_schema_migrations_table;

select
  'migration_related_relations' as section,
  schemaname,
  tablename
from pg_tables
where schemaname in ('supabase_migrations', 'public')
  and tablename ilike '%migration%'
order by schemaname, tablename;

-- ----------------------------------------------------------------
-- 3. Core relation existence checks
-- ----------------------------------------------------------------
select
  'relation_existence' as section,
  to_regclass('public.profiles') as profiles_table,
  to_regclass('public.game_scores') as game_scores_table,
  to_regclass('public.user_game_stats') as user_game_stats_table;

-- ----------------------------------------------------------------
-- 4. Relevant columns on profiles / game_scores / user_game_stats
-- ----------------------------------------------------------------
select
  'columns' as section,
  table_schema,
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles', 'game_scores', 'user_game_stats')
order by table_name, ordinal_position;

-- ----------------------------------------------------------------
-- 5. Constraints on the involved tables
-- ----------------------------------------------------------------
select
  'table_constraints' as section,
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
from information_schema.table_constraints tc
where tc.table_schema = 'public'
  and tc.table_name in ('profiles', 'game_scores', 'user_game_stats')
order by tc.table_name, tc.constraint_type, tc.constraint_name;

select
  'check_constraints' as section,
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
from information_schema.table_constraints tc
join information_schema.check_constraints cc
  on cc.constraint_name = tc.constraint_name
where tc.table_schema = 'public'
  and tc.constraint_type = 'CHECK'
  and tc.table_name in ('profiles', 'game_scores', 'user_game_stats')
order by tc.table_name, tc.constraint_name;

select
  'key_column_usage' as section,
  table_name,
  constraint_name,
  column_name,
  ordinal_position
from information_schema.key_column_usage
where table_schema = 'public'
  and table_name in ('profiles', 'game_scores', 'user_game_stats')
order by table_name, constraint_name, ordinal_position;

-- ----------------------------------------------------------------
-- 6. Indexes
-- ----------------------------------------------------------------
select
  'indexes' as section,
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('profiles', 'game_scores', 'user_game_stats')
order by tablename, indexname;

-- ----------------------------------------------------------------
-- 7. RLS policies
-- ----------------------------------------------------------------
select
  'policies' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'game_scores', 'user_game_stats')
order by tablename, policyname;

-- ----------------------------------------------------------------
-- 8. Triggers on profiles and game tables
-- ----------------------------------------------------------------
select
  'triggers' as section,
  event_object_table as table_name,
  trigger_name,
  action_timing,
  event_manipulation,
  action_statement
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in ('profiles', 'game_scores', 'user_game_stats')
order by event_object_table, trigger_name;

-- ----------------------------------------------------------------
-- 9. Functions that matter for this decision
-- ----------------------------------------------------------------
select
  'function_signatures' as section,
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_args,
  pg_get_function_result(p.oid) as result_type,
  p.prosecdef as security_definer,
  p.prokind as prokind
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'submit_game_score',
    'get_game_leaderboard',
    'check_inactivity_demotion',
    'is_premium_user',
    'set_premium',
    'grant_premium_override',
    'revoke_premium_override'
  )
order by p.proname, identity_args;

select
  'function_acl' as section,
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_args,
  p.proacl
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'submit_game_score',
    'get_game_leaderboard',
    'check_inactivity_demotion',
    'is_premium_user',
    'set_premium',
    'grant_premium_override',
    'revoke_premium_override'
  )
order by p.proname, identity_args;

-- ----------------------------------------------------------------
-- 10. Full function bodies
--     If this result is truncated, run each query separately.
-- ----------------------------------------------------------------
select
  'submit_game_score_definition' as section,
  pg_get_functiondef(p.oid) as function_sql
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'submit_game_score'
  and pg_get_function_identity_arguments(p.oid) =
      'p_session_id uuid, p_game_type text, p_correct integer, p_wrong integer, p_missed integer, p_duration_sec integer, p_combo_max integer, p_level_reached integer, p_pool_size integer, p_filter_used text, p_source_lang text, p_target_lang text';

select
  'get_game_leaderboard_definition' as section,
  pg_get_functiondef(p.oid) as function_sql
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'get_game_leaderboard';

select
  'check_inactivity_demotion_definition' as section,
  pg_get_functiondef(p.oid) as function_sql
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'check_inactivity_demotion';

select
  'is_premium_user_definition' as section,
  pg_get_functiondef(p.oid) as function_sql
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'is_premium_user';

-- ----------------------------------------------------------------
-- 11. Current data profile for game tables
-- ----------------------------------------------------------------
select
  'game_scores_counts_by_type' as section,
  game_type,
  count(*) as row_count,
  min(played_at) as earliest_played_at,
  max(played_at) as latest_played_at
from public.game_scores
group by game_type
order by game_type;

select
  'user_game_stats_count' as section,
  count(*) as row_count
from public.user_game_stats;

-- ----------------------------------------------------------------
-- 12. Existing data anomalies against intended rules
-- ----------------------------------------------------------------
select
  'anomaly_combo_gt_correct' as section,
  count(*) as bad_rows
from public.game_scores
where combo_max > correct_count;

select
  'anomaly_non_word_rain_shape' as section,
  count(*) as bad_rows
from public.game_scores
where game_type in ('speed_round', 'memory_match')
  and (coalesce(missed_count, 0) <> 0 or coalesce(level_reached, 1) <> 1);

select
  'anomaly_pool_size_too_small' as section,
  count(*) as bad_rows
from public.game_scores
where (game_type = 'speed_round' and coalesce(pool_size, 0) < 10)
   or (game_type = 'word_rain' and coalesce(pool_size, 0) < 15)
   or (game_type = 'memory_match' and coalesce(pool_size, 0) < 8);

select
  'anomaly_blank_languages' as section,
  count(*) as bad_rows
from public.game_scores
where nullif(btrim(coalesce(source_lang, '')), '') is null
   or nullif(btrim(coalesce(target_lang, '')), '') is null;

select
  'anomaly_negative_metrics' as section,
  count(*) as bad_rows
from public.game_scores
where score < 0
   or accuracy < 0
   or accuracy > 100
   or correct_count < 0
   or wrong_count < 0
   or coalesce(missed_count, 0) < 0
   or duration_sec < 0
   or level_reached < 1;

select
  'anomaly_duplicate_session_ids' as section,
  count(*) as duplicate_groups
from (
  select session_id
  from public.game_scores
  group by session_id
  having count(*) > 1
) d;

-- ----------------------------------------------------------------
-- 13. Memory match support really present?
-- ----------------------------------------------------------------
select
  'memory_match_support_check' as section,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_game_stats'
      and column_name = 'best_memory_match'
  ) as has_best_memory_match,
  exists (
    select 1
    from information_schema.check_constraints
    where constraint_schema = 'public'
      and check_clause ilike '%memory_match%'
  ) as has_memory_match_in_some_check;

-- ----------------------------------------------------------------
-- 14. profiles premium-related columns
-- ----------------------------------------------------------------
select
  'profiles_premium_columns' as section,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name in (
    'is_premium',
    'premium_override',
    'premium_override_reason',
    'premium_override_expires_at'
  )
order by column_name;

-- ----------------------------------------------------------------
-- 15. Existing rows shape in user_game_stats
-- ----------------------------------------------------------------
select
  'user_game_stats_null_health' as section,
  count(*) filter (where league is null) as null_league_rows,
  count(*) filter (where cumulative_score is null) as null_cumulative_rows,
  count(*) filter (where games_played is null) as null_games_played_rows,
  count(*) filter (where best_speed_round is null) as null_best_speed_rows,
  count(*) filter (where best_word_rain is null) as null_best_rain_rows,
  count(*) filter (where best_memory_match is null) as null_best_memory_rows
from public.user_game_stats;

-- ----------------------------------------------------------------
-- 16. Current submit_game_score dependency sanity snapshot
-- ----------------------------------------------------------------
select
  'submit_game_score_dependency_snapshot' as section,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'game_scores' and column_name = 'session_id'
  ) as has_game_scores_session_id,
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'game_scores'
      and indexname = 'game_scores_session_unique'
  ) as has_game_scores_session_unique,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_game_stats' and column_name = 'league_updated_at'
  ) as has_league_updated_at,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_premium'
  ) as has_profiles_is_premium;
