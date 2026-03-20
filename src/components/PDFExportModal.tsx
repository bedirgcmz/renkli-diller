import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { createAndSharePdf } from "@/services/pdf";
import { Sentence } from "@/types";

type FilterKey = "all" | "learned" | "learning" | "my_only";

function stripMarkers(text: string): string {
  return text.replace(/([*#%@+&{~])(.*?)\1/g, "$2");
}

function buildHtml(sentences: Sentence[], title: string, filterLabel: string): string {
  const rows = sentences
    .map(
      (s) => `
      <tr>
        <td class="source">${stripMarkers(s.source_text)}</td>
        <td class="target">${stripMarkers(s.target_text)}</td>
        <td class="status">${s.status}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; padding: 24px; color: #1a1a2e; }
  h1 { font-size: 22px; color: #3B8BD4; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #888; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #3B8BD4; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
  td { padding: 9px 12px; font-size: 13px; border-bottom: 1px solid #eee; vertical-align: top; }
  tr:nth-child(even) td { background: #f7f9fc; }
  .source { width: 40%; font-weight: 500; }
  .target { width: 45%; color: #444; }
  .status { width: 15%; font-size: 11px; color: #888; }
  .footer { margin-top: 24px; font-size: 11px; color: #aaa; text-align: right; }
</style>
</head>
<body>
  <h1>Parlio</h1>
  <div class="subtitle">${title} — ${filterLabel} (${sentences.length})</div>
  <table>
    <thead>
      <tr>
        <th>Kaynak / Source</th>
        <th>Hedef / Target</th>
        <th>Durum</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Parlio • ${new Date().toLocaleDateString()}</div>
</body>
</html>`;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function PDFExportModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { sentences, presetSentences } = useSentenceStore();
  const { progressMap } = useProgressStore();
  const { uiLanguage } = useSettingsStore();

  const [filter, setFilter] = useState<FilterKey>("all");
  const [generating, setGenerating] = useState(false);

  const FILTERS: Array<{ key: FilterKey; label: string; icon: string }> = [
    { key: "all", label: t("pdf_export.all_sentences"), icon: "📚" },
    { key: "learned", label: t("pdf_export.learned_only"), icon: "✅" },
    { key: "learning", label: t("pdf_export.learning_only"), icon: "📖" },
    { key: "my_only", label: t("pdf_export.my_sentences_only"), icon: "✏️" },
  ];

  const getFilteredSentences = (): Sentence[] => {
    const userWithStatus = sentences.map((s) => s);
    const presetWithStatus: Sentence[] = presetSentences.map((s) => ({
      ...s,
      status: (progressMap[s.id] ?? "new") as Sentence["status"],
    }));

    switch (filter) {
      case "all":
        return [...userWithStatus, ...presetWithStatus.filter((s) => s.status !== "new")];
      case "learned":
        return [
          ...userWithStatus.filter((s) => s.status === "learned"),
          ...presetWithStatus.filter((s) => s.status === "learned"),
        ];
      case "learning":
        return [
          ...userWithStatus.filter((s) => s.status === "learning"),
          ...presetWithStatus.filter((s) => s.status === "learning"),
        ];
      case "my_only":
        return userWithStatus;
    }
  };

  const handleGenerate = async () => {
    const filtered = getFilteredSentences();
    if (filtered.length === 0) {
      Alert.alert(t("common.error"), t("pdf_export.no_sentences"));
      return;
    }

    setGenerating(true);
    try {
      const filterLabel = FILTERS.find((f) => f.key === filter)?.label ?? "";
      const html = buildHtml(filtered, t("pdf_export.title"), filterLabel);
      await createAndSharePdf(html, `renkli_diller_${filter}`);
      onClose();
    } catch (err) {
      Alert.alert(t("common.error"), String(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t("pdf_export.title")}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            {t("pdf_export.select_filter").toUpperCase()}
          </Text>

          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterRow,
                {
                  backgroundColor: filter === f.key ? colors.primary + "15" : colors.surface,
                  borderColor: filter === f.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.filterIcon}>{f.icon}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  { color: filter === f.key ? colors.primary : colors.text },
                ]}
              >
                {f.label}
              </Text>
              {filter === f.key && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}

          <Text style={[styles.hint, { color: colors.textTertiary }]}>
            {getFilteredSentences().length} {t("sentences.title").toLowerCase()}
          </Text>

          <TouchableOpacity
            style={[
              styles.generateBtn,
              { backgroundColor: generating ? colors.primaryLight : colors.primary },
            ]}
            onPress={handleGenerate}
            disabled={generating}
            activeOpacity={0.85}
          >
            {generating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="document-text-outline" size={20} color="#fff" />
            )}
            <Text style={styles.generateBtnText}>
              {generating ? t("pdf_export.generating") : t("pdf_export.generate")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 18, fontWeight: "700" },
  body: { padding: 20, gap: 0 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 12,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  filterIcon: { fontSize: 20 },
  filterLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  hint: { fontSize: 13, marginTop: 4, marginBottom: 24 },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 8,
  },
  generateBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
