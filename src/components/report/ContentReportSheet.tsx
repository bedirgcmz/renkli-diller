import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import type {
  ContentReportReason,
  ReportableContentType,
} from "@/types/contentReports";

const REPORT_REASONS: ContentReportReason[] = [
  "typo",
  "translation",
  "unnatural",
  "keyword",
  "tts",
  "other",
];

interface ContentReportSheetProps {
  visible: boolean;
  loading?: boolean;
  contentType: ReportableContentType;
  titleKey?: string;
  onClose: () => void;
  onSubmit: (reason: ContentReportReason, note: string) => Promise<void> | void;
}

export function ContentReportSheet({
  visible,
  loading = false,
  contentType,
  titleKey = "report.title",
  onClose,
  onSubmit,
}: ContentReportSheetProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState<ContentReportReason>("translation");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!visible) {
      setSelectedReason("translation");
      setNote("");
    }
  }, [visible]);

  const trimmedNote = useMemo(() => note.trim(), [note]);
  const subtitleKey = useMemo(() => {
    switch (contentType) {
      case "reading_text":
        return "report.subtitle_reading";
      case "dialog_turn":
        return "report.subtitle_dialog";
      case "preset_sentence":
      default:
        return "report.subtitle_sentence";
    }
  }, [contentType]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: "#000",
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.text }]}>{t(titleKey)}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t(subtitleKey)}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
              {t("report.reason_label")}
            </Text>

            <View style={styles.reasonList}>
              {REPORT_REASONS.map((reason) => {
                const selected = selectedReason === reason;
                return (
                  <Pressable
                    key={reason}
                    onPress={() => setSelectedReason(reason)}
                    style={({ pressed }) => [
                      styles.reasonOption,
                      {
                        borderColor: selected ? colors.primary + "40" : colors.border,
                        backgroundColor: selected
                          ? colors.primary + "10"
                          : colors.backgroundSecondary + "CC",
                        opacity: pressed ? 0.82 : 0.94,
                      },
                    ]}
                  >
                    <View style={styles.reasonRow}>
                      <View
                        style={[
                          styles.reasonDot,
                          {
                            borderColor: selected ? colors.primary : colors.border,
                            backgroundColor: selected ? colors.primary : "transparent",
                          },
                        ]}
                      />
                    <Text style={[styles.reasonText, { color: colors.text }]}>
                      {t(`report.reasons.${reason}`)}
                    </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
              {t("report.note_label")}
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={t("report.note_placeholder")}
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={500}
              style={[
                styles.noteInput,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text,
                },
              ]}
            />
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                paddingBottom: Math.max(insets.bottom, 10),
                borderTopColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.78}
              style={[
                styles.secondaryButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundSecondary,
                  opacity: loading ? 0.45 : 1,
                },
              ]}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSubmit(selectedReason, trimmedNote)}
              disabled={loading}
              activeOpacity={0.82}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primaryDark ?? colors.primary,
                  opacity: loading ? 0.65 : 1,
                },
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? t("report.sending") : t("report.submit")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 16,
    maxHeight: "82%",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
  },
  content: {
    marginTop: 18,
  },
  contentInner: {
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  reasonList: {
    gap: 10,
    marginBottom: 18,
  },
  reasonOption: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    width: "100%",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
  },
  reasonDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    marginTop: 2,
  },
  reasonText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
  },
  noteInput: {
    minHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1.35,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
