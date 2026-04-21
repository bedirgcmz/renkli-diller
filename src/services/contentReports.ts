import { supabase } from "@/lib/supabase";
import { useNetworkStore } from "@/store/useNetworkStore";
import type {
  ContentReportSubmitResult,
  SubmitContentReportInput,
} from "@/types/contentReports";

function normalizeResult(value: unknown): ContentReportSubmitResult {
  if (
    value &&
    typeof value === "object" &&
    "status" in value &&
    typeof (value as { status?: unknown }).status === "string"
  ) {
    return value as ContentReportSubmitResult;
  }

  return { status: "validation_error", reason: "invalid_rpc_response" };
}

export async function submitContentReport(
  input: SubmitContentReportInput,
): Promise<ContentReportSubmitResult> {
  if (useNetworkStore.getState().isOnline === false) {
    return { status: "validation_error", reason: "offline" };
  }

  const { data, error } = await supabase.rpc("submit_content_report", {
    p_content_type: input.contentType,
    p_content_id: input.contentId,
    p_parent_content_type: input.parentContentType ?? null,
    p_parent_content_id: input.parentContentId ?? null,
    p_report_reason: input.reportReason,
    p_source_lang: input.sourceLang,
    p_target_lang: input.targetLang,
    p_screen_context: input.screenContext,
    p_user_note: input.userNote?.trim() || null,
    p_snapshot_json: input.snapshotJson,
    p_anchor_json: input.anchorJson ?? null,
  });

  if (error) {
    return { status: "validation_error", reason: error.message };
  }

  return normalizeResult(data);
}

