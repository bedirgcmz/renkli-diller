import type {
  DialogScenario,
  DialogTurn,
  ReadingText,
  ReadingTextKeyword,
  Sentence,
  SupportedLanguage,
} from "@/types";

export type ReportableContentType = "preset_sentence" | "reading_text" | "dialog_turn";

export type ContentReportReason =
  | "typo"
  | "translation"
  | "unnatural"
  | "keyword"
  | "tts"
  | "other";

export type ContentReportRpcStatus =
  | "ok"
  | "duplicate_report"
  | "rate_limited"
  | "validation_error";

export interface ContentReportSubmitResult {
  status: ContentReportRpcStatus;
  report_id?: string;
  reason?: string;
}

export interface SubmitContentReportInput {
  contentType: ReportableContentType;
  contentId: string;
  parentContentType?: "scenario";
  parentContentId?: string;
  reportReason: ContentReportReason;
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
  screenContext: string;
  userNote?: string;
  snapshotJson: Record<string, unknown>;
  anchorJson?: Record<string, unknown>;
}

export interface PresetSentenceReportContext {
  sentence: Sentence;
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
  screenContext: string;
}

export interface ReadingTextReportContext {
  readingText: ReadingText;
  keywords: ReadingTextKeyword[];
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
  visibleTitle: string;
  visibleSourceBody: string;
  visibleTargetBody: string;
  screenContext: string;
  anchorJson?: Record<string, unknown>;
}

export interface DialogTurnReportContext {
  scenario: DialogScenario;
  turn: DialogTurn;
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
  visibleScenarioTitle: string;
  visibleMessage: string;
  visibleOptions: Array<{
    id: string;
    optionIndex: number;
    isCorrect: boolean;
    visibleText: string;
  }>;
  screenContext: string;
  previousContext?: {
    turnId: string;
    turnIndex: number;
    message: string;
    chosenOption?: string;
  } | null;
}
