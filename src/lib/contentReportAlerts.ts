import { Alert } from "react-native";
import type { TFunction } from "i18next";
import type { ContentReportSubmitResult } from "@/types/contentReports";

export function showContentReportAlert(
  t: TFunction,
  result: ContentReportSubmitResult,
) {
  if (result.status === "ok") {
    Alert.alert(t("report.success_title"), t("report.success_body"));
    return;
  }

  if (result.status === "duplicate_report") {
    Alert.alert(t("report.duplicate_title"), t("report.duplicate_body"));
    return;
  }

  if (result.status === "rate_limited") {
    Alert.alert(t("report.rate_limited_title"), t("report.rate_limited_body"));
    return;
  }

  if (result.reason === "offline") {
    Alert.alert(t("common.offline_title"), t("common.offline_body"));
    return;
  }

  Alert.alert(t("report.validation_error_title"), t("report.validation_error_body"));
}

