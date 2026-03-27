import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePremium } from "@/hooks/usePremium";
import { KeywordText } from "@/components/KeywordText";
import { GradientView } from "@/components/GradientView";
import { translateWithAI, initAITrial, getAITrialStatus } from "@/services/gemini";
import { parseKeywords } from "@/utils/keywords";
import { MainStackParamList, Category } from "@/types";

interface HistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
}

interface SaveModalProps {
  visible: boolean;
  sourceText: string;
  targetText: string;
  categories: Category[];
  uiLanguage: string;
  onSave: (categoryId: number | undefined, newCategoryName: string, keywords: string[]) => void;
  onClose: () => void;
  saving: boolean;
  t: (k: string, opts?: Record<string, string | number>) => string;
  colors: ReturnType<typeof useTheme>["colors"];
}

function SaveModal({
  visible,
  sourceText,
  targetText,
  categories,
  uiLanguage,
  onSave,
  onClose,
  saving,
  t,
  colors,
}: SaveModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    categories[0]?.id
  );
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Pre-fill keywords from **...** markers in target text (max 3)
  const autoKeywords = parseKeywords(targetText)
    .filter((s) => s.isPill)
    .slice(0, 3)
    .map((s) => s.text);
  const [keywords, setKeywords] = useState<string[]>(
    [...autoKeywords, "", "", ""].slice(0, 3)
  );

  useEffect(() => {
    if (visible) {
      setSelectedCategoryId(categories[0]?.id);
      setShowNewCategory(false);
      setNewCategoryName("");
      const kws = parseKeywords(targetText)
        .filter((s) => s.isPill)
        .slice(0, 3)
        .map((s) => s.text);
      setKeywords([...kws, "", "", ""].slice(0, 3));
    }
  }, [visible, targetText, categories]);

  const getCategoryName = (cat: Category): string => {
    const key = `name_${uiLanguage}` as keyof Category;
    return (cat[key] as string) || cat.name_en || "";
  };

  const handleSave = () => {
    const finalCategoryId = showNewCategory ? undefined : selectedCategoryId;
    const finalNewCatName = showNewCategory ? newCategoryName.trim() : "";
    const finalKeywords = keywords.filter((k) => k.trim() !== "");
    onSave(finalCategoryId, finalNewCatName, finalKeywords);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.cardBackground }]}>
            {/* Handle */}
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            {/* Title */}
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("ai_translator.save_modal_title")}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Source preview */}
              <View style={[styles.previewBox, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.previewLabel, { color: colors.textTertiary }]}>
                  {t("ai_translator.source_label")}
                </Text>
                <Text style={[styles.previewText, { color: colors.textSecondary }]} numberOfLines={2}>
                  {sourceText}
                </Text>
                <Text style={[styles.previewLabel, { color: colors.textTertiary, marginTop: 8 }]}>
                  {t("ai_translator.result_label")}
                </Text>
                <KeywordText
                  text={targetText}
                  baseColor={colors.text}
                  fontSize={14}
                  lineHeight={20}
                  fontWeight="500"
                  colorSeed={sourceText}
                />
              </View>

              {/* Category */}
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                {t("ai_translator.category_label")}
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryScrollContent}
              >
                {categories.map((cat) => {
                  const isSelected = !showNewCategory && selectedCategoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryPill,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => {
                        setSelectedCategoryId(cat.id);
                        setShowNewCategory(false);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          { color: isSelected ? "#fff" : colors.textSecondary },
                        ]}
                      >
                        {getCategoryName(cat)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: showNewCategory ? colors.primary : colors.backgroundSecondary,
                      borderColor: showNewCategory ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setShowNewCategory(true)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name="add"
                    size={14}
                    color={showNewCategory ? "#fff" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryPillText,
                      { color: showNewCategory ? "#fff" : colors.textSecondary },
                    ]}
                  >
                    {t("ai_translator.new_category_label")}
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {showNewCategory && (
                <TextInput
                  style={[
                    styles.newCategoryInput,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder={t("ai_translator.new_category_placeholder")}
                  placeholderTextColor={colors.textTertiary}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  autoFocus
                />
              )}

              {/* Keywords */}
              <View style={styles.keywordsHeader}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                  {t("ai_translator.keywords_label")}
                </Text>
                <Text style={[styles.keywordsHint, { color: colors.textTertiary }]}>
                  {t("ai_translator.keywords_hint")}
                </Text>
              </View>

              {[0, 1, 2].map((i) => (
                <TextInput
                  key={i}
                  style={[
                    styles.keywordInput,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder={t("ai_translator.keyword_placeholder", { n: String(i + 1) })}
                  placeholderTextColor={colors.textTertiary}
                  value={keywords[i] ?? ""}
                  onChangeText={(val) => {
                    const updated = [...keywords];
                    updated[i] = val;
                    setKeywords(updated);
                  }}
                />
              ))}

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Save button */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>{t("ai_translator.save_btn")}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.cancelBtn} activeOpacity={0.7}>
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function AITranslateScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { uiLanguage, targetLanguage } = useSettingsStore();
  const { categories, addSentence, loadCategories } = useSentenceStore();
  const { isPremium } = usePremium();

  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(3);
  const [hasAccess, setHasAccess] = useState(true);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (categories.length === 0) loadCategories();
    initTrialAndCheck();
  }, []);

  const initTrialAndCheck = async () => {
    await initAITrial();
    const status = await getAITrialStatus(isPremium);
    setHasAccess(status.hasAccess);
    setTrialDaysLeft(status.daysLeft === Infinity ? 99 : status.daysLeft);
  };

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    if (!hasAccess) return; // paywall banner handles this

    setLoading(true);
    try {
      const { translatedText: result } = await translateWithAI(
        inputText.trim(),
        uiLanguage,
        targetLanguage
      );
      setTranslatedText(result);

      // Add to session history (max 5, newest first)
      setHistory((prev) => {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          sourceText: inputText.trim(),
          translatedText: result,
        };
        return [newItem, ...prev].slice(0, 5);
      });
    } catch {
      Alert.alert(t("common.error"), t("ai_translator.translate_error"));
    } finally {
      setLoading(false);
    }
  }, [inputText, hasAccess, uiLanguage, targetLanguage, t]);

  const handleCopy = () => {
    Clipboard.setString(translatedText);
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setInputText(item.sourceText);
    setTranslatedText(item.translatedText);
    setHistoryOpen(false);
  };

  const handleSave = async (
    categoryId: number | undefined,
    newCategoryName: string,
    keywords: string[]
  ) => {
    setSaving(true);
    try {
      let finalCategoryId = categoryId;

      // Create new category if user typed one
      if (newCategoryName) {
        const { supabase } = await import("@/lib/supabase");
        const { data: newCat } = await supabase
          .from("categories")
          .insert({
            name_tr: newCategoryName,
            name_en: newCategoryName,
            name_sv: newCategoryName,
            name_de: newCategoryName,
            name_es: newCategoryName,
            name_fr: newCategoryName,
            name_pt: newCategoryName,
            icon: "folder-outline",
            sort_order: 999,
            is_free: true,
          })
          .select()
          .single();
        if (newCat) {
          finalCategoryId = (newCat as { id: number }).id;
          await loadCategories();
        }
      }

      const result = await addSentence({
        source_text: inputText.trim(),
        target_text: translatedText,
        keywords,
        category_id: finalCategoryId,
        source_lang: uiLanguage,
        target_lang: targetLanguage,
        is_ai_generated: true,
      });

      if (result.success) {
        setSaveModalVisible(false);
        Alert.alert("✓", t("ai_translator.save_success"));
      } else {
        Alert.alert(t("common.error"), t("ai_translator.save_error"));
      }
    } catch {
      Alert.alert(t("common.error"), t("ai_translator.save_error"));
    } finally {
      setSaving(false);
    }
  };

  const langLabel = (lang: string) => lang.toUpperCase();
  const charCount = inputText.length;
  const isOverLimit = charCount > 200;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("ai_translator.title")}
          </Text>
          <View style={[styles.langPairBadge, { backgroundColor: colors.primary + "18" }]}>
            <Text style={[styles.langPairText, { color: colors.primary }]}>
              {langLabel(uiLanguage)} → {langLabel(targetLanguage)}
            </Text>
          </View>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Trial banner */}
          {!isPremium && trialDaysLeft <= 3 && trialDaysLeft > 0 && (
            <View style={[styles.trialBanner, { backgroundColor: colors.warning + "18", borderColor: colors.warning + "40" }]}>
              <Ionicons name="time-outline" size={14} color={colors.warning} />
              <Text style={[styles.trialBannerText, { color: colors.warning }]}>
                {t("ai_translator.trial_days_left", { count: trialDaysLeft })}
              </Text>
            </View>
          )}

          {/* Paywall banner (trial expired) */}
          {!hasAccess && (
            <View style={[styles.paywallBanner, { backgroundColor: colors.premiumAccent + "15", borderColor: colors.premiumAccent + "40" }]}>
              <Ionicons name="lock-closed" size={18} color={colors.premiumAccent} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.paywallTitle, { color: colors.premiumAccent }]}>
                  {t("ai_translator.trial_expired_title")}
                </Text>
                <Text style={[styles.paywallBody, { color: colors.textSecondary }]}>
                  {t("ai_translator.trial_expired_body")}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.paywallBtn, { backgroundColor: colors.premiumAccent }]}
                onPress={() => navigation.navigate("Paywall")}
                activeOpacity={0.85}
              >
                <Text style={styles.paywallBtnText}>{t("ai_translator.go_premium")}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Input card */}
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>
              {t("ai_translator.source_label")} · {langLabel(uiLanguage)}
            </Text>

            <TextInput
              ref={inputRef}
              style={[styles.textInput, { color: colors.text }]}
              placeholder={t("ai_translator.placeholder")}
              placeholderTextColor={colors.textTertiary}
              multiline
              value={inputText}
              onChangeText={setInputText}
              maxLength={220}
              editable={hasAccess}
            />

            <View style={styles.inputFooter}>
              <Text style={[styles.charCount, { color: isOverLimit ? colors.error : colors.textTertiary }]}>
                {t("ai_translator.char_limit", { count: charCount })}
              </Text>

              <TouchableOpacity
                style={[
                  styles.translateBtn,
                  {
                    backgroundColor: hasAccess && !isOverLimit && inputText.trim()
                      ? colors.primary
                      : colors.border,
                  },
                ]}
                onPress={handleTranslate}
                disabled={!hasAccess || loading || isOverLimit || !inputText.trim()}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={14} color="#fff" />
                    <Text style={styles.translateBtnText}>{t("ai_translator.translate_btn")}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Result card */}
          {translatedText !== "" && (
            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <GradientView
                colors={["#4DA3FF22", "#7C5CF622"]}
                style={styles.resultHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={[styles.cardLabel, { color: colors.primary, marginBottom: 0 }]}>
                  {t("ai_translator.result_label")} · {langLabel(targetLanguage)}
                </Text>
              </GradientView>

              <View style={styles.resultBody}>
                <KeywordText
                  text={translatedText}
                  baseColor={colors.text}
                  fontSize={17}
                  lineHeight={26}
                  fontWeight="600"
                  colorSeed={inputText}
                />
              </View>

              <View style={[styles.resultActions, { borderTopColor: colors.divider }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.border }]}
                  onPress={() => handleTranslate()}
                  disabled={loading}
                  activeOpacity={0.75}
                >
                  <Ionicons name="refresh-outline" size={15} color={colors.textSecondary} />
                  <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>
                    {t("ai_translator.retranslate_btn")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.border }]}
                  onPress={handleCopy}
                  activeOpacity={0.75}
                >
                  <Ionicons name="copy-outline" size={15} color={colors.textSecondary} />
                  <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>
                    {t("ai_translator.copy_btn")}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.addToListBtn, { backgroundColor: colors.primary }]}
                onPress={() => setSaveModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.addToListText}>{t("ai_translator.add_to_list")}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Session history */}
          {history.length > 0 && (
            <View style={[styles.historyCard, { backgroundColor: colors.cardBackground }]}>
              <TouchableOpacity
                style={styles.historyHeader}
                onPress={() => setHistoryOpen((v) => !v)}
                activeOpacity={0.7}
              >
                <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>
                  {t("ai_translator.recent_title")}
                </Text>
                <Ionicons
                  name={historyOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>

              {historyOpen &&
                history.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.historyItem, { borderTopColor: colors.divider }]}
                    onPress={() => handleRestoreHistory(item)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.historySource, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.sourceText}
                      </Text>
                      <Text style={[styles.historyTarget, { color: colors.text }]} numberOfLines={1}>
                        {item.translatedText.replace(/\*\*/g, "")}
                      </Text>
                    </View>
                    <Ionicons name="arrow-undo-outline" size={14} color={colors.textTertiary} />
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Modal */}
      <SaveModal
        visible={saveModalVisible}
        sourceText={inputText}
        targetText={translatedText}
        categories={categories}
        uiLanguage={uiLanguage}
        onSave={handleSave}
        onClose={() => setSaveModalVisible(false)}
        saving={saving}
        t={t}
        colors={colors}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  langPairBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  langPairText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  trialBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  trialBannerText: {
    fontSize: 13,
    fontWeight: "600",
  },
  paywallBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  paywallTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  paywallBody: {
    fontSize: 12,
    lineHeight: 17,
  },
  paywallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  paywallBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  charCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  translateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  translateBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  resultBody: {
    marginBottom: 14,
  },
  resultActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  addToListBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addToListText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  historyCard: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  historySource: {
    fontSize: 12,
    marginBottom: 2,
  },
  historyTarget: {
    fontSize: 13,
    fontWeight: "600",
  },
  // ── Modal styles ─────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  previewBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 13,
    lineHeight: 19,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  newCategoryInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    marginBottom: 12,
  },
  keywordsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  keywordsHint: {
    fontSize: 11,
    fontWeight: "500",
  },
  keywordInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  saveBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
