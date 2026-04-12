import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { KeywordText } from "@/components/KeywordText";
import { TAG_OPTIONS } from "@/utils/constants";
import { MainStackParamList, SentenceTag } from "@/types";
import { useProgressStore } from "@/store/useProgressStore";


export default function EditSentenceScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, "EditSentence">>();
  const { uiLanguage, targetLanguage } = useSettingsStore();
  const { sentences, presetSentences, categories, updateSentence, loadCategories } = useSentenceStore();
  const { tagMap, updatePresetTag } = useProgressStore();

  const { sentenceId, isPreset } = route.params;
  const pool = isPreset ? presetSentences : sentences;
  const sentence = pool.find((s) => s.id === sentenceId);

  const [sourceText, setSourceText] = useState(sentence?.source_text ?? "");
  const [targetText, setTargetText] = useState(sentence?.target_text ?? "");
  const [keywords, setKeywords] = useState<[string, string, string]>([
    sentence?.keywords[0] ?? "",
    sentence?.keywords[1] ?? "",
    sentence?.keywords[2] ?? "",
  ]);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    sentence?.category_id,
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<SentenceTag | null>(
    sentence?.is_preset
      ? (tagMap[sentence.id] ?? null)
      : (sentence?.tag ?? null)
  );

  useEffect(() => {
    if (categories.length === 0) loadCategories();
  }, []);
  const [saving, setSaving] = useState(false);

  // Auto-navigate back if the sentence was deleted while this screen was open
  useEffect(() => {
    if (!sentence) navigation.goBack();
  }, [sentence]);

  if (!sentence) {
    return null;
  }

  const isUserSentence = !sentence.is_preset;

  const handleSave = async () => {
    if (!sourceText.trim() || !targetText.trim()) {
      Alert.alert(t("common.error"), t("add_sentence.fill_both"));
      return;
    }

    setSaving(true);
    if (sentence.is_preset) {
      await updatePresetTag(sentence.id, selectedTag);
      setSaving(false);
      navigation.goBack();
      return;
    }
    const result = await updateSentence(sentence.id, {
      source_text: sourceText.trim(),
      target_text: targetText.trim(),
      keywords: keywords.filter((k) => k.trim() !== ""),
      category_id: categoryId,
      tag: selectedTag,
    });
    setSaving(false);

    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert(t("common.error"), result.error ?? t("add_sentence.update_failed"));
    }
  };

  const updateKeyword = (index: number, value: string) => {
    const updated = [...keywords] as [string, string, string];
    updated[index] = value;
    setKeywords(updated);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("sentences.edit")}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {!isUserSentence && (
          <View style={[styles.readonlyBanner, { backgroundColor: colors.warning + "22" }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
            <Text style={[styles.readonlyText, { color: colors.warning }]}>
              {t("add_sentence.preset_readonly")}
            </Text>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Source text */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {t("add_sentence.source_sentence")} ({t(`languages.${uiLanguage}`)})
            </Text>
            <TextInput
              style={[
                styles.textarea,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                  color: colors.text,
                  opacity: isUserSentence ? 1 : 0.6,
                },
              ]}
              value={sourceText}
              onChangeText={isUserSentence ? setSourceText : undefined}
              editable={isUserSentence}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            {sourceText ? (
              <View style={[styles.preview, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={[styles.previewLabel, { color: colors.textTertiary }]}>
                  {t("add_sentence.preview")}
                </Text>
                <KeywordText text={sourceText} baseColor={colors.text} fontSize={14} lineHeight={20} colorSeed={String(sentence.id)} />
              </View>
            ) : null}
          </View>

          {/* Target text */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {t("add_sentence.target_sentence")} ({t(`languages.${targetLanguage}`)})
            </Text>
            <TextInput
              style={[
                styles.textarea,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                  color: colors.text,
                  opacity: isUserSentence ? 1 : 0.6,
                },
              ]}
              value={targetText}
              onChangeText={isUserSentence ? setTargetText : undefined}
              editable={isUserSentence}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            {targetText ? (
              <View style={[styles.preview, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={[styles.previewLabel, { color: colors.textTertiary }]}>
                  {t("add_sentence.preview")}
                </Text>
                <KeywordText text={targetText} baseColor={colors.textSecondary} fontSize={14} lineHeight={20} colorSeed={String(sentence.id)} />
              </View>
            ) : null}
          </View>

          {/* Keywords */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {t("add_sentence.keywords")}
            </Text>
            {keywords.map((kw, idx) => (
              <TextInput
                key={idx}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                    color: colors.text,
                    marginBottom: idx < 2 ? 8 : 0,
                    opacity: isUserSentence ? 1 : 0.6,
                  },
                ]}
                value={kw}
                onChangeText={isUserSentence ? (v) => updateKeyword(idx, v) : undefined}
                editable={isUserSentence}
                placeholder={`${t("add_sentence.word_placeholder")} ${idx + 1}`}
                placeholderTextColor={colors.textTertiary}
                maxLength={100}
              />
            ))}
          </View>

          {/* Category */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {t("add_sentence.select_category")}
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownBtn,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.primary,
                  opacity: isUserSentence ? 1 : 0.6,
                },
              ]}
              onPress={isUserSentence ? () => setCategoryOpen((o) => !o) : undefined}
              activeOpacity={0.8}
            >
              <Text style={[styles.dropdownBtnText, { color: colors.primary }]}>
                {categories.find((c) => c.id === categoryId)?.[`name_${uiLanguage}` as keyof typeof categories[0]] as string ?? "—"}
              </Text>
              <Ionicons
                name={categoryOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
            {categoryOpen && isUserSentence && (
              <View
                style={[
                  styles.dropdownList,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                ]}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.dropdownItem,
                      cat.id === categoryId && { backgroundColor: colors.primary + "18" },
                    ]}
                    onPress={() => { setCategoryId(cat.id); setCategoryOpen(false); }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: cat.id === categoryId ? colors.primary : colors.text },
                      ]}
                    >
                      {cat[`name_${uiLanguage}` as keyof typeof cat] as string}
                    </Text>
                    {cat.id === categoryId && (
                      <Ionicons name="checkmark" size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Tag */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {t("tags.label")} ({t("common.optional")})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagRow}>
              {TAG_OPTIONS.map((opt) => {
                const active = selectedTag === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.tagChip, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary + "18" : colors.backgroundSecondary }]}
                    onPress={() => setSelectedTag(active ? null : opt.value)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name={opt.icon as any} size={14} color={active ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.tagChipText, { color: active ? colors.primary : colors.textSecondary }]}>
                      {t(opt.i18nKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: saving ? colors.primaryLight : colors.primary },
            ]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {saving ? t("common.loading") : t("common.save")}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  readonlyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  readonlyText: { fontSize: 13 },
  scroll: { padding: 20 },
  fieldBlock: { marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  preview: {
    marginTop: 6,
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  previewLabel: { fontSize: 11, fontWeight: "500", marginBottom: 2 },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownBtnText: { fontSize: 15, fontWeight: "500" },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownItemText: { fontSize: 14 },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  tagRow: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagChipText: { fontSize: 13, fontWeight: "500" },
});
