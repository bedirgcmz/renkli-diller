import type { ReadingTextKeyword } from "@/types";
import type {
  DialogTurnReportContext,
  PresetSentenceReportContext,
  ReadingTextReportContext,
  SubmitContentReportInput,
} from "@/types/contentReports";

export function buildPresetSentenceReportInput({
  sentence,
  sourceLang,
  targetLang,
  screenContext,
}: PresetSentenceReportContext): Omit<
  SubmitContentReportInput,
  "reportReason" | "userNote"
> {
  return {
    contentType: "preset_sentence",
    contentId: String(sentence.id),
    sourceLang,
    targetLang,
    screenContext,
    snapshotJson: {
      sentence_id: String(sentence.id),
      source_lang: sourceLang,
      target_lang: targetLang,
      source_text: sentence.source_text,
      target_text: sentence.target_text,
      keywords: sentence.keywords ?? [],
      category_id: sentence.category_id ?? null,
      category_name: sentence.category_name ?? null,
      difficulty: sentence.difficulty ?? null,
      visual_image_url: sentence.visual_image_url ?? null,
      is_preset: true,
    },
  };
}

function buildReadingKeywordSnapshot(keywords: ReadingTextKeyword[], targetLang: string) {
  const keywordField = `keyword_${targetLang}` as keyof ReadingTextKeyword;

  return keywords.map((keyword) => ({
    id: keyword.id,
    position_index: keyword.position_index,
    color_index: keyword.color_index,
    visible_keyword: (keyword[keywordField] as string | null) ?? null,
  }));
}

export function buildReadingTextReportInput({
  readingText,
  keywords,
  sourceLang,
  targetLang,
  visibleTitle,
  visibleSourceBody,
  visibleTargetBody,
  screenContext,
  anchorJson,
}: ReadingTextReportContext): Omit<
  SubmitContentReportInput,
  "reportReason" | "userNote"
> {
  return {
    contentType: "reading_text",
    contentId: String(readingText.id),
    sourceLang,
    targetLang,
    screenContext,
    anchorJson,
    snapshotJson: {
      reading_text_id: String(readingText.id),
      slug: readingText.slug,
      category: readingText.category,
      difficulty: readingText.difficulty,
      is_premium: readingText.is_premium,
      estimated_reading_seconds: readingText.estimated_reading_seconds ?? null,
      visible_title: visibleTitle,
      visible_source_body: visibleSourceBody,
      visible_target_body: visibleTargetBody,
      keyword_count: keywords.length,
      keywords: buildReadingKeywordSnapshot(keywords, targetLang),
    },
  };
}

export function buildDialogTurnReportInput({
  scenario,
  turn,
  sourceLang,
  targetLang,
  visibleScenarioTitle,
  visibleMessage,
  visibleOptions,
  screenContext,
  previousContext,
}: DialogTurnReportContext): Omit<
  SubmitContentReportInput,
  "reportReason" | "userNote"
> {
  return {
    contentType: "dialog_turn",
    contentId: String(turn.id),
    parentContentType: "scenario",
    parentContentId: String(scenario.id),
    sourceLang,
    targetLang,
    screenContext,
    anchorJson: {
      turn_index: turn.turn_index,
      speaker_type: turn.speaker_type,
    },
    snapshotJson: {
      scenario_id: String(scenario.id),
      scenario_slug: scenario.slug,
      scenario_title: visibleScenarioTitle,
      character_name: scenario.character_name,
      character_role: scenario.character_role,
      difficulty: scenario.difficulty,
      content_version: scenario.content_version,
      turn_id: String(turn.id),
      turn_index: turn.turn_index,
      speaker_type: turn.speaker_type,
      prompt_type: turn.prompt_type ?? null,
      grammar_focus: turn.grammar_focus ?? null,
      vocabulary_focus: turn.vocabulary_focus ?? null,
      visible_message: visibleMessage,
      visible_options: visibleOptions.map((option) => ({
        id: option.id,
        option_index: option.optionIndex,
        is_correct: option.isCorrect,
        visible_text: option.visibleText,
      })),
      previous_context: previousContext ?? null,
    },
  };
}
