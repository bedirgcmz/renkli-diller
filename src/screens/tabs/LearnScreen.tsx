import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { SentenceCard } from "@/components/SentenceCard";
import { GradientView } from "@/components/GradientView";
import { KeywordText } from "@/components/KeywordText";
import { Sentence } from "@/types";

type TabKey = "learning" | "learned";

// ─── Küçük "Öğrenildi" liste kartı ────────────────────────────────────────────

const LearnedCard = React.memo(function LearnedCard({
  sentence,
  onForgot,
  colors,
  t,
}: {
  sentence: Sentence;
  onForgot: () => void;
  colors: any;
  t: (k: string) => string;
}) {
  const colorSeed = String(sentence.id);
  return (
    <View style={[learnedStyles.card, { backgroundColor: colors.cardBackground }]}>
      <GradientView colors={["#49C98A", "#6EE7B7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
      <View style={learnedStyles.body}>
        <KeywordText
          text={sentence.source_text}
          baseColor={colors.text}
          fontSize={15}
          fontWeight="500"
          colorSeed={colorSeed}
        />
        <View style={{ marginTop: 4 }}>
          <KeywordText
            text={sentence.target_text}
            baseColor={colors.textSecondary}
            fontSize={13}
            colorSeed={colorSeed}
          />
        </View>
        <View style={learnedStyles.cardFooter}>
          {sentence.category_name ? (
            <View style={[learnedStyles.chip, { backgroundColor: colors.backgroundTertiary }]}>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                {sentence.category_name}
              </Text>
            </View>
          ) : null}
          <Pressable
            onPress={onForgot}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.95 : 1 }],
              marginLeft: "auto",
            })}
          >
            {({ pressed }) => (
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
              }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
                  {t("learn.mark_unlearned")}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const learnedStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  body: {
    flexDirection: "column",
    padding: 12,
    gap: 0,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 5,
  },
});

// ─── Ana ekran ─────────────────────────────────────────────────────────────────

export default function LearnScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { uiLanguage, targetLanguage } = useSettingsStore();
  const {
    sentences: userSentences,
    presetSentences,
    loadSentences,
    loadPresetSentences,
  } = useSentenceStore();
  const {
    progressMap,
    loadProgress,
    addToLearning,
    markAsLearned: presetMarkLearned,
    forgot,
  } = useProgressStore();

  const [activeTab, setActiveTab] = useState<TabKey>("learning");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await Promise.all([loadSentences(), loadPresetSentences(), loadProgress()]);
      } catch (e) {
        // show screen regardless of error
      } finally {
        if (mounted) setInitialized(true);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  const learningList: Sentence[] = [
    ...userSentences.filter((s) => s.status === "learning"),
    ...presetSentences.filter((s) => progressMap[s.id] === "learning"),
  ];

  const learnedList: Sentence[] = [
    ...userSentences.filter((s) => s.status === "learned"),
    ...presetSentences.filter((s) => progressMap[s.id] === "learned"),
  ];

  const total = learningList.length;
  const currentSentence = learningList[currentIndex] ?? null;

  // index sınırı koru
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(total - 1);
    }
  }, [total]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setCurrentIndex(0);
  };

  const getEffectiveState = (s: Sentence): "new" | "learning" | "learned" => {
    if (s.is_preset) return progressMap[s.id] ?? "new";
    return s.status as "new" | "learning" | "learned";
  };

  // ── Animasyon ──────────────────────────────────────────────────────────────

  const animateAndGo = useCallback(
    (direction: "next" | "prev", callback: () => void) => {
      const outX = direction === "next" ? -40 : 40;
      const inX = direction === "next" ? 40 : -40;
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(cardTranslateX, { toValue: outX, duration: 140, useNativeDriver: true }),
      ]).start(() => {
        cardTranslateX.setValue(inX);
        callback();
        Animated.parallel([
          Animated.timing(cardOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(cardTranslateX, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]).start();
      });
    },
    [cardOpacity, cardTranslateX],
  );

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) animateAndGo("next", () => setCurrentIndex((i) => i + 1));
  }, [currentIndex, total, animateAndGo]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) animateAndGo("prev", () => setCurrentIndex((i) => i - 1));
  }, [currentIndex, animateAndGo]);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -50) runOnJS(goNext)();
      else if (e.translationX > 50) runOnJS(goPrev)();
    });

  // ── Aksiyonlar ─────────────────────────────────────────────────────────────

  const handleLearn = async () => {
    if (!currentSentence) return;
    if (currentSentence.is_preset) {
      await addToLearning(currentSentence.id);
    } else {
      await useSentenceStore.getState().addToLearningList(currentSentence.id);
      await loadSentences();
    }
  };

  const handleMarkLearned = async () => {
    if (!currentSentence) return;
    animateAndGo("next", () => {});
    if (currentSentence.is_preset) {
      await presetMarkLearned(currentSentence.id);
    } else {
      await useSentenceStore.getState().updateSentence(currentSentence.id, { status: "learned" });
      await loadSentences();
    }
  };

  const handleForgotCard = async () => {
    if (!currentSentence) return;
    if (currentSentence.is_preset) {
      await forgot(currentSentence.id);
    } else {
      await useSentenceStore.getState().updateSentence(currentSentence.id, { status: "new" });
      await loadSentences();
    }
  };

  const handleForgotItem = async (sentence: Sentence) => {
    if (sentence.is_preset) {
      await forgot(sentence.id);
    } else {
      await useSentenceStore.getState().updateSentence(sentence.id, { status: "new" });
      await loadSentences();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {activeTab === "learning" ? t("learn.title") : t("learn.learned_title")}
          </Text>
          {activeTab === "learning" && total > 0 && (
            <View style={[styles.counterBadge, { backgroundColor: colors.primary + "18" }]}>
              <Text style={[styles.counterText, { color: colors.primary }]}>
                {currentIndex + 1}/{total}
              </Text>
            </View>
          )}
        </View>

        {/* Segment Control */}
        <View style={[styles.segmentContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === "learning" && styles.segmentTabActiveWrapper]}
            onPress={() => handleTabChange("learning")}
            activeOpacity={0.8}
          >
            {activeTab === "learning" ? (
              <GradientView
                colors={["#4DA3FF", "#7CC4FF"]}
                style={styles.segmentTabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.segmentLabel, { color: "#fff" }]}>
                  {t("sentences.filter_learning")}
                </Text>
                {learningList.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
                    <Text style={styles.badgeText}>{learningList.length}</Text>
                  </View>
                )}
              </GradientView>
            ) : (
              <View style={styles.segmentTabInner}>
                <Text style={[styles.segmentLabel, { color: colors.textSecondary }]}>
                  {t("sentences.filter_learning")}
                </Text>
                {learningList.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: "#4DA3FF" }]}>
                    <Text style={styles.badgeText}>{learningList.length}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentTab, activeTab === "learned" && styles.segmentTabActiveWrapper]}
            onPress={() => handleTabChange("learned")}
            activeOpacity={0.8}
          >
            {activeTab === "learned" ? (
              <GradientView
                colors={["#4DA3FF", "#7CC4FF"]}
                style={styles.segmentTabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.segmentLabel, { color: "#fff" }]}>
                  {t("sentences.filter_learned")}
                </Text>
                {learnedList.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
                    <Text style={styles.badgeText}>{learnedList.length}</Text>
                  </View>
                )}
              </GradientView>
            ) : (
              <View style={styles.segmentTabInner}>
                <Text style={[styles.segmentLabel, { color: colors.textSecondary }]}>
                  {t("sentences.filter_learned")}
                </Text>
                {learnedList.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: "#49C98A" }]}>
                    <Text style={styles.badgeText}>{learnedList.length}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Progress bar (sadece learning tab + veri varsa) ─────────────── */}
        {activeTab === "learning" && initialized && total > 0 && (
          <View style={[styles.progressRow, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.progressTrack, { backgroundColor: colors.backgroundTertiary }]}>
              <GradientView
                colors={["#4DA3FF", "#49C98A"]}
                style={[
                  styles.progressFill,
                  { width: `${Math.round(((currentIndex + 1) / total) * 100)}%` as any },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={[styles.progressPercent, { color: colors.textSecondary }]}>
              {Math.round(((currentIndex + 1) / total) * 100)}%
            </Text>
          </View>
        )}

        {/* ── Öğreniliyor sekmesi: swipeable kart ────────────────────────────── */}
        {activeTab === "learning" &&
          (!initialized ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : total === 0 ? (
            <EmptyState tab="learning" colors={colors} t={t} />
          ) : (
            <>
              <GestureDetector gesture={swipeGesture}>
                <Animated.View
                  style={[
                    styles.cardWrapper,
                    { opacity: cardOpacity, transform: [{ translateX: cardTranslateX }] },
                  ]}
                >
                  {currentSentence && (
                    <SentenceCard
                      sentence={currentSentence}
                      uiLanguage={uiLanguage}
                      targetLanguage={targetLanguage}
                      state={getEffectiveState(currentSentence)}
                      onLearn={handleLearn}
                      onMarkLearned={handleMarkLearned}
                      onForgot={handleForgotCard}
                    />
                  )}
                </Animated.View>
              </GestureDetector>

              <View style={styles.navRow}>
                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    { backgroundColor: colors.backgroundSecondary },
                    currentIndex === 0 && styles.navBtnDisabled,
                  ]}
                  onPress={goPrev}
                  disabled={currentIndex === 0}
                  activeOpacity={0.7}
                >
                  <GradientView
                    colors={["transparent", "rgba(236, 72, 153, 0.12)", "transparent"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                  />
                  <Text
                    style={[
                      styles.navBtnText,
                      { color: currentIndex === 0 ? colors.textTertiary : colors.text },
                    ]}
                  >
                    ‹ {t("learn.prev")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    { backgroundColor: colors.backgroundSecondary },
                    currentIndex === total - 1 && styles.navBtnDisabled,
                  ]}
                  onPress={goNext}
                  disabled={currentIndex === total - 1}
                  activeOpacity={0.7}
                >
                  <GradientView
                    colors={["transparent", "rgba(236, 72, 153, 0.12)", "transparent"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                  />
                  <Text
                    style={[
                      styles.navBtnText,
                      { color: currentIndex === total - 1 ? colors.textTertiary : colors.text },
                    ]}
                  >
                    {t("learn.next")} ›
                  </Text>
                </TouchableOpacity>
              </View>

              <MotivationBar
                remaining={total - currentIndex - 1}
                learnedCount={learnedList.length}
                colors={colors}
                t={t}
              />
            </>
          ))}

        {/* ── Öğrenildi sekmesi: FlatList ────────────────────────────────────── */}
        {activeTab === "learned" &&
          (learnedList.length === 0 ? (
            <EmptyState tab="learned" colors={colors} t={t} />
          ) : (
            <FlatList
              data={learnedList}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.learnedListContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <LearnedCard
                  sentence={item}
                  onForgot={() => handleForgotItem(item)}
                  colors={colors}
                  t={t}
                />
              )}
            />
          ))}
      </SafeAreaView>
    </View>
  );
}

// ─── Alt bileşenler ────────────────────────────────────────────────────────────

function EmptyState({ tab, colors, t }: { tab: TabKey; colors: any; t: (k: string) => string }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{tab === "learning" ? "📚" : "🎉"}</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {tab === "learning" ? t("learn.no_sentences") : t("learn.learned_title")}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {tab === "learning" ? t("learn.start_hint") : t("learn.no_learned_sentences")}
      </Text>
    </View>
  );
}

function MotivationBar({
  remaining,
  learnedCount,
  colors,
  t,
}: {
  remaining: number;
  learnedCount: number;
  colors: any;
  t: (k: string) => string;
}) {
  const message =
    remaining > 0
      ? `${remaining} ${t("learn.sentences_to_learn")} 💪`
      : learnedCount > 0
        ? `${learnedCount} ${t("learn.sentences_learned")} 🎉`
        : null;

  if (!message) return null;

  return (
    <View
      style={[
        styles.motivationBar,
        { backgroundColor: colors.backgroundSecondary, overflow: "hidden" },
      ]}
    >
      <GradientView
        colors={["transparent", "rgba(236, 72, 153, 0.12)", "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Text style={[styles.motivationText, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

// ─── Stiller ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  counterBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  counterText: { fontSize: 13, fontWeight: "600" },
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 4,
    marginBottom: 16,
  },
  segmentTab: {
    flex: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  segmentTabActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentTabActiveWrapper: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentTabGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 22,
    gap: 6,
  },
  segmentTabInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 22,
    gap: 6,
  },
  segmentLabel: { fontSize: 14, fontWeight: "500" },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardWrapper: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 15, fontWeight: "600" },
  motivationBar: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  motivationText: { fontSize: 13, fontWeight: "500" },
  learnedListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#4DA3FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },
});
