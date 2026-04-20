# Current Database Schema
> Last updated: 2026-03-28
> Source of truth: verified directly from Supabase (information_schema query).
> Use this as the reference when generating new sentences or reading texts.

---

## Table: `profiles`
One row per authenticated user (auto-created via trigger on `auth.users`).

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — |
| display_name | text | YES | null |
| ui_language | text | NO | 'tr' |
| target_language | text | NO | 'en' |
| is_premium | boolean | NO | false |
| theme | text | NO | 'light' |
| daily_goal | integer | NO | 10 |
| streak_count | integer | NO | 0 |
| last_active | date | YES | null |
| created_at | timestamptz | NO | now() |
| avatar_url | text | YES | null |

---

## Table: `categories`
Preset sentence categories. `is_free = true` olanlar free kullanıcılara açık.

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | integer (serial) | NO | auto |
| name_tr | text | NO | — |
| name_en | text | NO | — |
| name_sv | text | NO | — |
| name_de | text | NO | — |
| name_es | text | YES | null |
| name_fr | text | YES | null |
| name_pt | text | YES | null |
| icon | text | YES | null |
| sort_order | integer | NO | 0 |
| is_free | boolean | NO | false |

---

## Table: `sentences`
Curated preset sentences. All 7 languages required for content generation.

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | integer (serial) | NO | auto |
| category_id | integer | NO | — |
| text_tr | text | NO | — |
| text_en | text | NO | — |
| text_sv | text | NO | — |
| text_de | text | NO | — |
| text_es | text | YES | null |
| text_fr | text | YES | null |
| text_pt | text | YES | null |
| keywords_tr | jsonb | NO | `[]` |
| keywords_en | jsonb | NO | `[]` |
| keywords_sv | jsonb | NO | `[]` |
| keywords_de | jsonb | NO | `[]` |
| keywords_es | jsonb | YES | `[]` |
| keywords_fr | jsonb | YES | `[]` |
| keywords_pt | jsonb | YES | `[]` |
| difficulty | text | NO | 'beginner' |
| is_free | boolean | NO | false |
| sort_order | integer | NO | 0 |

### keywords JSONB format
```json
[{ "word": "word_in_that_language", "translation": "translation_to_ui_language" }]
```

---

## Table: `user_sentences`
Sentences added by users themselves.

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | NO | — |
| category_id | integer | YES | null |
| source_text | text | NO | — |
| target_text | text | NO | — |
| keywords | jsonb | NO | `[]` |
| state | text | NO | 'learning' |
| source_lang | text | YES | null |
| target_lang | text | YES | null |
| is_ai_generated | boolean | YES | false |
| learned_at | timestamptz | YES | null |
| created_at | timestamptz | NO | now() |

---

## Table: `user_progress`
Per-user learning state for **preset** sentences.

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | integer (serial) | NO | auto |
| user_id | uuid | NO | — |
| sentence_id | integer | NO | — |
| state | text | NO | 'learning' |
| learned_at | timestamptz | YES | null |
| created_at | timestamptz | NO | now() |

---

## Table: `sentence_favorites`
Favorited sentences (both preset and user-added).

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | NO | — |
| sentence_id | text | NO | — |
| is_preset | boolean | NO | false |
| created_at | timestamptz | YES | now() |

> `sentence_id` is text — for preset sentences it stores the integer id as string, for user sentences it stores the uuid.

---

## Table: `user_settings`
Per-user app settings. One row per user.

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | NO | — |
| ui_language | text | YES | 'tr' |
| target_language | text | YES | 'en' |
| theme | text | YES | 'system' |
| daily_goal | integer | YES | 5 |
| notifications | boolean | YES | true |
| reminder_time | text | YES | '19:00' |
| auto_mode_speed | numeric | YES | 1.0 |
| show_translations | boolean | YES | true |
| tts_enabled | boolean | YES | true |
| tts_voice | text | YES | 'default' |
| achievement_unlocked_ids | text[] | YES | `{}` |
| achievement_unlocked_dates | jsonb | YES | `{}` |
| updated_at | timestamptz | YES | now() |

---

## Table: `reading_texts`
Daily reading texts shown in `order_index` order.

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| slug | text | NO | — |
| category | text | NO | — |
| difficulty | smallint | NO | 1 |
| is_premium | boolean | NO | false |
| order_index | integer | NO | 0 |
| estimated_reading_seconds | integer | YES | null |
| title_tr | text | YES | null |
| title_en | text | YES | null |
| title_sv | text | YES | null |
| title_de | text | YES | null |
| title_es | text | YES | null |
| title_fr | text | YES | null |
| title_pt | text | YES | null |
| body_tr | text | YES | null |
| body_en | text | YES | null |
| body_sv | text | YES | null |
| body_de | text | YES | null |
| body_es | text | YES | null |
| body_fr | text | YES | null |
| body_pt | text | YES | null |
| created_at | timestamptz | NO | now() |

### body format
Keywords are wrapped in `**...**`. Position order (0-based) must match `reading_text_keywords.position_index`.

Example: `"Every morning I make **coffee** and read the **news**."`
→ position_index 0 = "coffee", position_index 1 = "news"

Max 6 keywords per text.

---

## Table: `reading_text_keywords`
One row per keyword per reading text.

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| reading_text_id | uuid | NO | — |
| position_index | smallint | NO | — |
| color_index | smallint | NO | — |
| keyword_tr | text | YES | null |
| keyword_en | text | YES | null |
| keyword_sv | text | YES | null |
| keyword_de | text | YES | null |
| keyword_es | text | YES | null |
| keyword_fr | text | YES | null |
| keyword_pt | text | YES | null |

> UNIQUE(reading_text_id, position_index). color_index: 0–9.

---

## Table: `user_reading_progress`
Tracks which reading texts each user has seen/completed.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | |
| user_id | uuid | NO | — | |
| reading_text_id | uuid | NO | — | |
| status | text | NO | 'read' | see values below |
| completed_at | timestamptz | YES | null | nullable since migration 017 |
| shown_at | date | YES | null | date of assignment, migration 017 |

> UNIQUE(user_id, reading_text_id)

### status values
- `assigned` — today's active text, not yet completed
- `completed` — user tapped Tamamladım
- `read` / `learned` — legacy values

---

## Table: `daily_stats`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | integer (serial) | NO | auto |
| user_id | uuid | NO | — |
| date | date | NO | — |
| sentences_studied | integer | NO | 0 |
| sentences_learned | integer | NO | 0 |
| quiz_correct | integer | NO | 0 |
| quiz_total | integer | NO | 0 |

---

## Table: `quiz_results`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | integer (serial) | NO | auto |
| user_id | uuid | NO | — |
| sentence_id | integer | YES | null |
| user_sentence_id | uuid | YES | null |
| quiz_type | text | NO | — |
| is_correct | boolean | NO | — |
| answered_at | timestamptz | NO | now() |

---

## Supported Languages

| Code | Language |
|---|---|
| tr | Türkçe |
| en | English |
| sv | Svenska |
| de | Deutsch |
| es | Español |
| fr | Français |
| pt | Português |

---

## Notes for Content Generation

### Generating new `sentences` rows
- Provide all 7 `text_*` columns
- Provide all 7 `keywords_*` columns (`[]` if no keywords)
- `difficulty`: `'beginner'` | `'intermediate'` | `'advanced'`
- `is_free`: typically false unless explicitly free-tier content
- `sort_order`: last sort_order in that category + 1

### Generating new `reading_texts` + `reading_text_keywords` rows
- Provide all 7 `title_*` and `body_*` columns
- Mark keywords in body with `**word**` — max 6 per text, 0-based position
- Create one `reading_text_keywords` row per keyword with exact spellings per language
- `color_index`: 0–9, assign sequentially per text (0, 1, 2…)
- `order_index`: last existing order_index + 1
- `is_premium = false` for free-tier content
