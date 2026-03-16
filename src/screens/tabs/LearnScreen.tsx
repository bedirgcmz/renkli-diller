import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { SentenceCard } from "@/components/SentenceCard";
import { Sentence } from "@/types";

type TabKey = "learning" | "learned";

export default function LearnScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { uiLanguage, targetLanguage } = useSettingsStore();
  const { sentences, loading, loadSentences, markAsLearned, markAsUnlearned, addToLearningList, removeFromLearningList } =
    useSentenceStore();

  const [activeTab, setActiveTab] = useState<TabKey>("learning");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animasyon
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSentences();
  }, []);

  // Aktif taba göre cümleleri filtrele
  const filteredSentences: Sentence[] = sentences.filter(
    (s) => s.status === activeTab,
  );

  const currentSentence = filteredSentences[currentIndex] ?? null;
  const total = filteredSentences.length;

  // Tab değişince index sıfırla
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setCurrentIndex(0);
  };

  // Kart animasyonu ile geçiş
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
    if (currentIndex < total - 1) {
      animateAndGo("next", () => setCurrentIndex((i) => i + 1));
    }
  }, [currentIndex, total, animateAndGo]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      animateAndGo("prev", () => setCurrentIndex((i) => i - 1));
    }
  }, [currentIndex, animateAndGo]);

  // Swipe gesture
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -50) {
        runOnJS(goNext)();
      } else if (e.translationX > 50) {
        runOnJS(goPrev)();
      }
    });

  // Aksiyonlar — index koruma ile
  const handleMarkLearned = async () => {
    if (!currentSentence) return;
    await markAsLearned(currentSentence.id);
    await loadSentences();
    // Sınır kontrolü
    const newTotal = filteredSentences.length - 1;
    if (currentIndex >= newTotal && newTotal > 0) {
      setCurrentIndex(newTotal - 1);
    } else if (newTotal === 0) {
      setCurrentIndex(0);
    }
  };

  const handleMarkUnlearned = async () => {
    if (!currentSentence) return;
    await markAsUnlearned(currentSentence.id);
    await loadSentences();
    const newTotal = filteredSentences.length - 1;
    if (currentIndex >= newTotal && newTotal > 0) {
      setCurrentIndex(newTotal - 1);
    } else if (newTotal === 0) {
      setCurrentIndex(0);
    }
  };

  const handleAddToList = async () => {
    if (!currentSentence) return;
    await addToLearningList(currentSentence.id);
    await loadSentences();
  };

  const handleRemoveFromList = async () => {
    if (!currentSentence) return;
    await removeFromLearningList(currentSentence.id);
    await loadSentences();
    const newTotal = filteredSentences.length - 1;
    if (currentIndex >= newTotal && newTotal > 0) {
      setCurrentIndex(newTotal - 1);
    } else if (newTotal === 0) {
      setCurrentIndex(0);
    }
  };

  const learningCount = sentences.filter((s) => s.status === "learning").length;
  const learnedCount = sentences.filter((s) => s.status === "learned").length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {activeTab === "learning" ? t("learn.title") : t("learn.learned_title")}
        </Text>
        {total > 0 && (
          <View style={[styles.counterBadge, { backgroundColor: colors.primary + "18" }]}>
            <Text style={[styles.counterText, { color: colors.primary }]}>
              {currentIndex + 1}/{total}
            </Text>
          </View>
        )}
      </View>

      {/* Segment Control (Tab) */}
      <View style={[styles.segmentContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <TouchableOpacity
          style={[
            styles.segmentTab,
            activeTab === "learning" && [styles.segmentTabActive, { backgroundColor: colors.surface, shadowColor: colors.text }],
          ]}
          onPress={() => handleTabChange("learning")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentLabel,
              { color: activeTab === "learning" ? colors.text : colors.textSecondary },
            ]}
          >
            {t("sentences.filter_learning")}
          </Text>
          {learningCount > 0 && (
            <View style={[styles.badge, { backgroundColor: "#2ECC71" }]}>
              <Text style={styles.badgeText}>{learningCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentTab,
            activeTab === "learned" && [styles.segmentTabActive, { backgroundColor: colors.surface, shadowColor: colors.text }],
          ]}
          onPress={() => handleTabChange("learned")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentLabel,
              { color: activeTab === "learned" ? colors.text : colors.textSecondary },
            ]}
          >
            {t("sentences.filter_learned")}
          </Text>
          {learnedCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{learnedCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* İçerik */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : total === 0 ? (
        <EmptyState tab={activeTab} colors={colors} t={t} />
      ) : (
        <>
          {/* Swipe destekli kart alanı */}
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
                  state={activeTab === "learned" ? "learned" : currentSentence.status as "new" | "learning" | "learned"}
                  onMarkLearned={handleMarkLearned}
                  onMarkUnlearned={handleMarkUnlearned}
                  onAddToList={handleAddToList}
                  onRemoveFromList={handleRemoveFromList}
                />
              )}
            </Animated.View>
          </GestureDetector>

          {/* Prev / Next butonları */}
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
              <Text style={[styles.navBtnText, { color: currentIndex === 0 ? colors.textTertiary : colors.text }]}>
                ‹  {t("learn.prev")}
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
              <Text style={[styles.navBtnText, { color: currentIndex === total - 1 ? colors.textTertiary : colors.text }]}>
                {t("learn.next")}  ›
              </Text>
            </TouchableOpacity>
          </View>

          {/* Motivasyon mesajı */}
          <MotivationBar
            tab={activeTab}
            remaining={activeTab === "learning" ? total - currentIndex - 1 : 0}
            learnedCount={learnedCount}
            colors={colors}
            t={t}
          />
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Alt bileşenler ────────────────────────────────────────────────────────────

function EmptyState({
  tab,
  colors,
  t,
}: {
  tab: TabKey;
  colors: any;
  t: (key: string) => string;
}) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{tab === "learning" ? "📚" : "🎉"}</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {tab === "learning" ? t("learn.no_sentences") : t("learn.learned_title")}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {tab === "learning"
          ? "Cümleler ekranından cümle ekleyerek başlayabilirsiniz."
          : "Henüz öğrenilen cümle yok."}
      </Text>
    </View>
  );
}

function MotivationBar({
  tab,
  remaining,
  learnedCount,
  colors,
  t,
}: {
  tab: TabKey;
  remaining: number;
  learnedCount: number;
  colors: any;
  t: (key: string) => string;
}) {
  if (tab !== "learning") return null;

  const message =
    remaining > 0
      ? `${remaining} ${t("learn.sentences_to_learn")} 💪`
      : learnedCount > 0
        ? `${learnedCount} ${t("learn.sentences_learned")} 🎉`
        : null;

  if (!message) return null;

  return (
    <View style={[styles.motivationBar, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.motivationText, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  counterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  segmentTabActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
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
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  motivationBar: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  motivationText: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 52,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
