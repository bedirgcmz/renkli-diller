import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useDialogStore } from "@/store/useDialogStore";
import { HomeStackParamList, SupportedLanguage, DialogTurn, DialogTurnOption } from "@/types";

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const CORRECT_COLOR = "#22C55E";
const WRONG_COLOR   = "#EF4444";
const ACCENT        = "#06B6D4";

function getMessage(turn: DialogTurn, lang: SupportedLanguage): string {
  const key = `message_${lang}` as keyof DialogTurn;
  return (turn[key] as string) || turn.message_en;
}

function getOptionText(option: DialogTurnOption, lang: SupportedLanguage): string {
  const key = `text_${lang}` as keyof DialogTurnOption;
  return (option[key] as string) || option.text_en;
}

function getRationale(option: DialogTurnOption, lang: SupportedLanguage): string | null {
  const key = `rationale_${lang}` as keyof DialogTurnOption;
  return (option[key] as string | null) || option.rationale_en;
}

export default function DialogPlayScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const scrollRef = useRef<ScrollView>(null);

  const { user } = useAuthStore();
  const { targetLanguage } = useSettingsStore();
  const lang = (targetLanguage as SupportedLanguage) ?? "en";

  const {
    activeScenario,
    turns,
    currentTurnIndex,
    selectedOptionId,
    isCorrect,
    selectOption,
    advanceToNextTurn,
    completeSession,
    abandonSession,
    loading,
  } = useDialogStore();

  const currentTurn = turns[currentTurnIndex] ?? null;
  const isLastTurn  = currentTurnIndex === turns.length - 1;
  const showAdvance = isCorrect === true;

  // Scroll to bottom when turn or answer changes
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  }, [currentTurnIndex, selectedOptionId]);

  const handleOptionPress = async (option: DialogTurnOption) => {
    if (!user || isCorrect) return; // already got it right → lock
    await selectOption(user.id, option.id, option);
  };

  const handleAdvance = async () => {
    if (!user) return;
    if (isLastTurn) {
      await completeSession(user.id);
      navigation.replace("DialogComplete");
    } else {
      advanceToNextTurn();
    }
  };

  const handleBack = async () => {
    if (user) await abandonSession(user.id);
    navigation.goBack();
  };

  if (!activeScenario || !currentTurn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={ACCENT} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const scenarioTitle = (activeScenario as any)[`title_${lang}`] || activeScenario.title_en;
  const totalTurns    = turns.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {scenarioTitle}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {activeScenario.character_name} · {activeScenario.character_role}
          </Text>
        </View>

        {/* Turn counter pill */}
        <View style={[styles.turnPill, { backgroundColor: ACCENT + "22" }]}>
          <Text style={[styles.turnPillText, { color: ACCENT }]}>
            {currentTurnIndex + 1}/{totalTurns}
          </Text>
        </View>
      </View>

      {/* ── Progress bar ── */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: ACCENT,
              width: `${((currentTurnIndex + 1) / totalTurns) * 100}%` as any,
            },
          ]}
        />
      </View>

      {/* ── Chat area ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Character bubble — LEFT */}
        <View style={styles.characterRow}>
          <View style={[styles.avatarCircle, { backgroundColor: ACCENT + "33" }]}>
            <Ionicons name="person" size={18} color={ACCENT} />
          </View>
          <View style={styles.characterBubbleWrap}>
            <Text style={[styles.speakerName, { color: colors.textSecondary }]}>
              {activeScenario.character_name}
            </Text>
            <View style={[styles.characterBubble, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.characterText, { color: colors.text }]}>
                {getMessage(currentTurn, lang)}
              </Text>
            </View>
          </View>
        </View>

        {/* Answer options — RIGHT */}
        <View style={styles.optionsSection}>
          <Text style={[styles.chooseLabel, { color: colors.textTertiary }]}>
            {t("dialog.play.choose_reply")}
          </Text>

          {(currentTurn.options ?? []).map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isThisCorrect = option.is_correct;

            let bgColor = colors.cardBackground;
            let borderColor = colors.border;
            let textColor = colors.text;

            if (isSelected && isCorrect === true && isThisCorrect) {
              bgColor    = CORRECT_COLOR + "22";
              borderColor = CORRECT_COLOR;
              textColor  = CORRECT_COLOR;
            } else if (isSelected && isCorrect === false) {
              bgColor    = WRONG_COLOR + "22";
              borderColor = WRONG_COLOR;
              textColor  = WRONG_COLOR;
            }

            // Once answered correctly, dim un-selected options
            const dimmed = isCorrect === true && !isSelected;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionBubble,
                  {
                    backgroundColor: bgColor,
                    borderColor,
                    opacity: dimmed ? 0.4 : 1,
                  },
                ]}
                onPress={() => handleOptionPress(option)}
                activeOpacity={isCorrect ? 1 : 0.75}
                disabled={!!isCorrect} // lock all after correct
              >
                <Text style={[styles.optionText, { color: textColor }]}>
                  {getOptionText(option, lang)}
                </Text>

                {/* Inline feedback icon */}
                {isSelected && isCorrect === true && isThisCorrect && (
                  <Ionicons name="checkmark-circle" size={18} color={CORRECT_COLOR} style={styles.optionIcon} />
                )}
                {isSelected && isCorrect === false && (
                  <Ionicons name="close-circle" size={18} color={WRONG_COLOR} style={styles.optionIcon} />
                )}
              </TouchableOpacity>
            );
          })}

          {/* Rationale / feedback text */}
          {isCorrect === true && selectedOptionId && (() => {
            const chosen = (currentTurn.options ?? []).find((o) => o.id === selectedOptionId);
            const rationale = chosen ? getRationale(chosen, lang) : null;
            return rationale ? (
              <View style={[styles.rationaleBox, { backgroundColor: CORRECT_COLOR + "11" }]}>
                <Ionicons name="information-circle-outline" size={15} color={CORRECT_COLOR} />
                <Text style={[styles.rationaleText, { color: CORRECT_COLOR }]}>{rationale}</Text>
              </View>
            ) : null;
          })()}

          {isCorrect === false && (
            <Text style={[styles.tryAgainText, { color: WRONG_COLOR }]}>
              {t("dialog.play.wrong_feedback")}
            </Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Advance button (sticky bottom) ── */}
      {showAdvance && (
        <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.advanceBtn, { backgroundColor: isLastTurn ? "#8B5CF6" : ACCENT }]}
            onPress={handleAdvance}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.advanceBtnText}>
                  {isLastTurn ? t("dialog.play.finish") : t("dialog.play.next_turn")}
                </Text>
                <Ionicons
                  name={isLastTurn ? "checkmark-done-outline" : "arrow-forward"}
                  size={18}
                  color="#fff"
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },

  // Header
  header:           { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  backBtn:          { width: 36, alignItems: "flex-start" },
  headerCenter:     { flex: 1 },
  headerTitle:      { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  headerSub:        { fontSize: 12, lineHeight: 16 },
  turnPill:         { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  turnPillText:     { fontSize: 13, fontWeight: "700" },

  // Progress
  progressTrack:    { height: 3 },
  progressFill:     { height: 3 },

  // Chat
  chatScroll:       { flex: 1 },
  chatContent:      { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },

  // Character bubble
  characterRow:     { flexDirection: "row", alignItems: "flex-start", marginBottom: 24, gap: 10 },
  avatarCircle:     { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 18 },
  characterBubbleWrap: { flex: 1 },
  speakerName:      { fontSize: 12, fontWeight: "600", marginBottom: 4, marginLeft: 4 },
  characterBubble:  { borderRadius: 18, borderTopLeftRadius: 4, borderWidth: 1, padding: 14, maxWidth: "90%" },
  characterText:    { fontSize: 15, lineHeight: 22 },

  // Options
  optionsSection:   { alignItems: "flex-end", gap: 8 },
  chooseLabel:      { fontSize: 11, fontWeight: "600", letterSpacing: 0.4, marginBottom: 2, textTransform: "uppercase" },
  optionBubble:     { flexDirection: "row", alignItems: "center", borderRadius: 18, borderTopRightRadius: 4, borderWidth: 1.5, paddingVertical: 12, paddingHorizontal: 16, width: "88%", justifyContent: "space-between", gap: 8 },
  optionText:       { fontSize: 14, lineHeight: 20, flex: 1 },
  optionIcon:       { flexShrink: 0 },

  // Feedback
  rationaleBox:     { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 10, borderRadius: 10, width: "88%", marginTop: 4 },
  rationaleText:    { fontSize: 12, lineHeight: 17, flex: 1 },
  tryAgainText:     { fontSize: 13, fontWeight: "600", marginTop: 4 },

  // Bottom
  bottomBar:        { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  advanceBtn:       { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 16 },
  advanceBtnText:   { color: "#fff", fontSize: 16, fontWeight: "700" },
});
