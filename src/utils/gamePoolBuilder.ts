import { supabase } from "@/lib/supabase";
import {
  GameFilter,
  GameType,
  GameVocabularyItem,
  MIN_POOL_SIZE,
  PoolBuildMeta,
  WORD_RAIN_MAX_CHARS,
} from "@/types/game";
import { stripMarkers } from "@/utils/keywords";

// ----------------------------------------------------------------
// Fisher-Yates shuffle (fair, deterministic)
// ----------------------------------------------------------------
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ----------------------------------------------------------------
// Length bucket helper
// ----------------------------------------------------------------
export function getLengthBucket(text: string): "short" | "medium" | "long" {
  const len = text.trim().length;
  if (len <= 18) return "short";
  if (len <= 32) return "medium";
  return "long";
}

// ----------------------------------------------------------------
// Eligibility check per game type
// Word Rain only accepts short + medium items
// ----------------------------------------------------------------
function isEligible(item: GameVocabularyItem, gameType: GameType): boolean {
  if (gameType === "word_rain") return item.lengthBucket !== "long";
  return true;
}

// ----------------------------------------------------------------
// Build game-ready pool from Supabase
//
// Priority:
//   1. User keywords (if filter is user_learning / user_learned / mixed)
//   2. Global game_vocabulary fills the rest up to a good pool size
//
// "mixed" = user keywords first, global vocabulary as fallback
// "global" = only game_vocabulary (ignores user words)
// ----------------------------------------------------------------
export async function buildGamePool(params: {
  userId: string;
  filter: GameFilter;
  gameType: GameType;
  sourceLang: string;
  targetLang: string;
}): Promise<{ items: GameVocabularyItem[]; meta: PoolBuildMeta }> {
  const { userId, filter, gameType, sourceLang, targetLang } = params;
  const minRequired = MIN_POOL_SIZE[gameType];

  let userItems: GameVocabularyItem[] = [];
  let globalItems: GameVocabularyItem[] = [];

  // ---- 1. User keywords ----
  if (filter !== "global") {
    const statusFilter =
      filter === "user_learning"
        ? ["learning"]
        : filter === "user_learned"
        ? ["learned"]
        : ["learning", "learned"]; // mixed

    const { data: userSentences } = await supabase
      .from("user_sentences")
      .select("id, source_text, target_text, source_lang, target_lang, state")
      .eq("user_id", userId)
      .eq("source_lang", sourceLang)
      .eq("target_lang", targetLang)
      .in("state", statusFilter);

    if (userSentences) {
      const seen = new Set<string>();

      for (const sentence of userSentences) {
        const sourceText = stripMarkers(sentence.source_text ?? "").trim();
        const targetText = stripMarkers(sentence.target_text ?? "").trim();
        if (!sourceText || !targetText) continue;

        const normalized = `${sourceText.toLowerCase()}__${targetText.toLowerCase()}`;
        if (seen.has(normalized)) continue;
        seen.add(normalized);

        const item: GameVocabularyItem = {
          id: `user_${sentence.id}`,
          sourceText,
          targetText,
          difficulty: 2,
          lengthBucket: getLengthBucket(targetText),
          origin: "user",
        };

        if (isEligible(item, gameType)) {
          userItems.push(item);
        }
      }
    }
  }

  // ---- 2. Global vocabulary ----
  // Always fetch global if: filter is "global", or user pool is too small
  const needsGlobal =
    filter === "global" || userItems.length < minRequired;

  if (needsGlobal) {
    let query = supabase
      .from("game_vocabulary")
      .select("id, source_text, target_text, difficulty, length_bucket")
      .eq("source_lang", sourceLang)
      .eq("target_lang", targetLang)
      .limit(200);

    if (gameType === "word_rain") {
      query = query.in("length_bucket", ["short", "medium"]);
    }

    const { data: vocab } = await query;

    if (vocab) {
      for (const row of vocab) {
        globalItems.push({
          id: `global_${row.id}`,
          sourceText: row.source_text,
          targetText: row.target_text,
          difficulty: row.difficulty as 1 | 2 | 3,
          lengthBucket: row.length_bucket as "short" | "medium" | "long",
          origin: "global",
        });
      }
    }
  }

  // ---- 3. Merge: user items first, then global (deduplicated by sourceText) ----
  const seenSource = new Set<string>();
  const merged: GameVocabularyItem[] = [];

  for (const item of [...userItems, ...globalItems]) {
    const key = item.sourceText.trim().toLowerCase();
    if (!seenSource.has(key)) {
      seenSource.add(key);
      merged.push(item);
    }
  }

  const shuffled = shuffle(merged);

  const meta: PoolBuildMeta = {
    totalRaw: merged.length,
    usable: shuffled.length,
    rejected: 0,
    globalCount: globalItems.length,
    userCount: userItems.length,
    isEnough: shuffled.length >= minRequired,
    minRequired,
  };

  return { items: shuffled, meta };
}

// ----------------------------------------------------------------
// Build distractors for a question
//
// Rules:
//   - Different item (by id)
//   - Different sourceText (normalized)
//   - Prefer same lengthBucket
//   - Fill remaining from other buckets if needed
// ----------------------------------------------------------------
export function buildDistractors(
  correct: GameVocabularyItem,
  pool: GameVocabularyItem[],
  count: number = 3
): GameVocabularyItem[] {
  const correctNorm = correct.sourceText.trim().toLowerCase();

  const sameBucket = pool.filter(
    (p) =>
      p.id !== correct.id &&
      p.sourceText.trim().toLowerCase() !== correctNorm &&
      p.lengthBucket === correct.lengthBucket
  );

  const otherBucket = pool.filter(
    (p) =>
      p.id !== correct.id &&
      p.sourceText.trim().toLowerCase() !== correctNorm &&
      p.lengthBucket !== correct.lengthBucket
  );

  const candidates = shuffle([
    ...shuffle(sameBucket),
    ...shuffle(otherBucket),
  ]);

  // Deduplicate by sourceText among candidates
  const seen = new Set<string>();
  const unique: GameVocabularyItem[] = [];
  for (const c of candidates) {
    const norm = c.sourceText.trim().toLowerCase();
    if (!seen.has(norm)) {
      seen.add(norm);
      unique.push(c);
    }
    if (unique.length >= count) break;
  }

  return unique;
}

// ----------------------------------------------------------------
// Build a full question list for Speed Round
// Each item gets exactly one round (no repeats)
// Returns items with shuffled options
// ----------------------------------------------------------------
export interface SpeedRoundQuestion {
  item: GameVocabularyItem;
  options: GameVocabularyItem[];  // 4 items: [0] = correct (shuffled after)
  correctIndex: number;
}

export function buildSpeedRoundQuestions(
  pool: GameVocabularyItem[]
): SpeedRoundQuestion[] {
  // Shuffle the pool (no repeats within a session)
  const shuffledPool = shuffle(pool);

  return shuffledPool.map((item) => {
    const distractors = buildDistractors(item, pool, 3);
    const allOptions = shuffle([item, ...distractors]);
    const correctIndex = allOptions.findIndex((o) => o.id === item.id);

    return { item, options: allOptions, correctIndex };
  });
}
