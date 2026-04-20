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
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { KeywordText } from "@/components/KeywordText";
import { FREE_USER_SENTENCE_LIMIT } from "@/utils/constants";
import { MainStackParamList } from "@/types";
import { HintBottomSheet } from "@/components/HintBottomSheet";
import { useOnboarding } from "@/providers/OnboardingProvider";
import { useNetworkStore } from "@/store/useNetworkStore";


export default function AddSentenceScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { uiLanguage, targetLanguage } = useSettingsStore();
  const { sentences, categories, addSentence, loadCategories } = useSentenceStore();
  const isPremium = useAuthStore((s) => s.user?.is_premium ?? false);

  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [keywords, setKeywords] = useState(["", "", ""]);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    categories[0]?.id
  );
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (categories.length === 0) loadCategories();
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;

    const hasSelectedCategory = categoryId !== undefined
      && categories.some((category) => category.id === categoryId);

    if (!hasSelectedCategory) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const [guideOpen, setGuideOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isHintShown, markHintShown } = useOnboarding();
  const [hintVisible, setHintVisible] = useState(false);

  const userSentenceCount = sentences.length;

  const handleSave = async () => {
    if (useNetworkStore.getState().isOnline === false) {
      Alert.alert(t("common.offline_title"), t("common.offline_body"));
      return;
    }
    if (!sourceText.trim() || !targetText.trim()) {
      Alert.alert(t("common.error"), t("add_sentence.fill_both"));
      return;
    }

    if (!isPremium && userSentenceCount >= FREE_USER_SENTENCE_LIMIT) {
      Alert.alert(
        t("add_sentence.limit_reached"),
        t("add_sentence.upgrade_to_add_more"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("premium.title"),
            onPress: () => navigation.navigate("Paywall", { source: "sentences" }),
          },
        ],
      );
      return;
    }

    setSaving(true);
    const result = await addSentence({
      source_text: sourceText.trim(),
      target_text: targetText.trim(),
      keywords: keywords.filter((k) => k.trim() !== ""),
      category_id: categoryId,
      source_lang: uiLanguage,
      target_lang: targetLanguage,
    });
    setSaving(false);

    if (result.success) {
      if (!isHintShown("addSentence")) {
        markHintShown("addSentence");
        setHintVisible(true);
      } else {
        navigation.goBack();
      }
    } else {
      Alert.alert(t("common.error"), result.error ?? t("add_sentence.save_failed"));
    }
  };

  const updateKeyword = (index: number, value: string) => {
    const updated = [...keywords];
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
            {t("add_sentence.title")}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Keyword guide */}
          <TouchableOpacity
            style={[styles.guideHeader, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={() => setGuideOpen((o) => !o)}
            activeOpacity={0.8}
          >
            <Text style={[styles.guideHeaderText, { color: colors.primary }]}>
              🎨 {t("add_sentence.keyword_hint").split(":")[0]}
            </Text>
            <Ionicons
              name={guideOpen ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
          {guideOpen && (
            <View style={[styles.guideBody, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <Text style={[styles.guideMarker, { color: colors.text }]}>
                {t("add_sentence.keyword_guide_instruction")}
              </Text>
              <View style={[styles.guideRow, { marginTop: 8 }]}>
                <Text style={[styles.guideMarker, { color: colors.textSecondary }]}>
                  {"I want to **get used to** this."}
                </Text>
              </View>
              <View style={[styles.guideRow, { marginTop: 4 }]}>
                <Text style={[styles.guideArrow, { color: colors.textSecondary }]}>→</Text>
                <Text style={[styles.guideSampleText, { color: "#54A0FF" }]}>get used to</Text>
                <Text style={[{ color: colors.textSecondary, fontSize: 13, marginLeft: 6 }]}>
                  {t("add_sentence.keyword_guide_shown_as")}
                </Text>
              </View>
            </View>
          )}

          {/* Source text input */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {t("add_sentence.source_sentence")} ({t(`languages.${uiLanguage}`)})
            </Text>
            <TextInput
              style={[styles.textarea, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text }]}
              value={sourceText}
              onChangeText={setSourceText}
              placeholder={`${t(`languages.${uiLanguage}`)} ${t("add_sentence.sentence_placeholder")}`}
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            {sourceText ? (
              <View style={[styles.preview, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={[styles.previewLabel, { color: colors.textTertiary }]}>
                  {t("add_sentence.preview")}
                </Text>
                <KeywordText text={sourceText} baseColor={colors.text} fontSize={14} lineHeight={20} colorSeed={sourceText} />
              </View>
            ) : null}
          </View>

          {/* Target text input */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {t("add_sentence.target_sentence")} ({t(`languages.${targetLanguage}`)})
            </Text>
            <TextInput
              style={[styles.textarea, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text }]}
              value={targetText}
              onChangeText={setTargetText}
              placeholder={`${t(`languages.${targetLanguage}`)} ${t("add_sentence.sentence_placeholder")}`}
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            {targetText ? (
              <View style={[styles.preview, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={[styles.previewLabel, { color: colors.textTertiary }]}>
                  {t("add_sentence.preview")}
                </Text>
                <KeywordText text={targetText} baseColor={colors.textSecondary} fontSize={14} lineHeight={20} colorSeed={sourceText} />
              </View>
            ) : null}
          </View>

          {/* Keywords */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              {t("add_sentence.keywords")} ({t("common.optional")})
            </Text>
            {keywords.map((kw, idx) => (
              <TextInput
                key={idx}
                style={[styles.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text, marginBottom: idx < 2 ? 8 : 0 }]}
                value={kw}
                onChangeText={(v) => updateKeyword(idx, v)}
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
              style={[styles.dropdownBtn, { backgroundColor: colors.backgroundSecondary, borderColor: colors.primary }]}
              onPress={() => setCategoryOpen((o) => !o)}
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
            {categoryOpen && (
              <View style={[styles.dropdownList, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
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

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: saving ? colors.primaryLight : colors.primary }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {saving ? t("common.loading") : t("add_sentence.save")}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <HintBottomSheet
        visible={hintVisible}
        title={t("hints.add_sentence_title")}
        body={t("hints.add_sentence_body")}
        onClose={() => {
          setHintVisible(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
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
  headerTitle: { fontSize: 18, fontWeight: "700" },
  scroll: { padding: 20, gap: 0 },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  guideHeaderText: { fontSize: 13, fontWeight: "600" },
  guideBody: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    gap: 6,
  },
  guideRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  guideMarker: { fontSize: 13, fontFamily: "monospace", flex: 1 },
  guideArrow: { fontSize: 13 },
  guideSample: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  guideSampleText: { fontSize: 12, fontWeight: "600" },
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
});
