import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { HeroHeader } from "@/components/HeroHeader";
import { HintBottomSheet } from "@/components/HintBottomSheet";
import { HomeStackParamList, MainStackParamList } from "@/types";
import { CoachMarksOverlay, CoachMarkStep } from "@/components/CoachMarksOverlay";
import { useOnboarding } from "@/providers/OnboardingProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

const CARD_GAP = 12;

interface ActivityCard {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  titleKey: string;
  descKey: string;
  coachTitleKey: string;
  coachDescKey: string;
  onPress: (nav: Nav) => void;
}

function SectionHeader({
  title,
  description,
  colors,
}: {
  title: string;
  description: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const cardWidth = Math.floor((screenWidth - 32 - CARD_GAP) / 2);
  const dashboardCardWidth = Math.floor((screenWidth - 32 - 36 - CARD_GAP) / 2);
  const isPremium = useAuthStore((s) => s.user?.is_premium ?? false);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const { sentences, presetSentences, categories, loadCategories, loadSentences, loadPresetSentences } =
    useSentenceStore();
  const { progressMap, loadProgress } = useProgressStore();
  const { uiLanguage, targetLanguage } = useSettingsStore();
  const { isCoachMarksDone, isReady, markCoachMarksDone, isHintShown, markHintShown } =
    useOnboarding();

  const scrollRef = useRef<ScrollView>(null);
  const cardRefs = useRef<(View | null)[]>([]);
  const cardLayoutYs = useRef<number[]>([]);

  const [coachVisible, setCoachVisible] = useState(false);
  const [coachSteps, setCoachSteps] = useState<CoachMarkStep[]>([]);
  const [premiumHintVisible, setPremiumHintVisible] = useState(false);

  const practiceCards: ActivityCard[] = [
    {
      id: "learn",
      icon: "book-outline",
      iconColor: "#4DA3FF",
      titleKey: "home.card_learn_title",
      descKey: "home.card_learn_desc",
      coachTitleKey: "coach_marks.learn_title",
      coachDescKey: "coach_marks.learn_desc",
      onPress: (nav) => nav.navigate("Learn", { initialTab: "study" }),
    },
    {
      id: "listen",
      icon: "headset-outline",
      iconColor: "#49C98A",
      titleKey: "home.card_listen_title",
      descKey: "home.card_listen_desc",
      coachTitleKey: "coach_marks.listen_title",
      coachDescKey: "coach_marks.listen_desc",
      onPress: (nav) => nav.navigate("Learn", { initialTab: "listening" }),
    },
    {
      id: "quiz",
      icon: "school-outline",
      iconColor: "#F59E0B",
      titleKey: "home.card_quiz_title",
      descKey: "home.card_quiz_desc",
      coachTitleKey: "coach_marks.quiz_title",
      coachDescKey: "coach_marks.quiz_desc",
      onPress: (nav) => nav.navigate("Quiz"),
    },
    {
      id: "build",
      icon: "extension-puzzle-outline",
      iconColor: "#10B981",
      titleKey: "home.card_build_title",
      descKey: "home.card_build_desc",
      coachTitleKey: "coach_marks.build_title",
      coachDescKey: "coach_marks.build_desc",
      onPress: (nav) => nav.navigate("BuildSentence"),
    },
    {
      id: "auto",
      icon: "play-circle-outline",
      iconColor: "#8B5CF6",
      titleKey: "home.card_auto_title",
      descKey: "home.card_auto_desc",
      coachTitleKey: "coach_marks.auto_title",
      coachDescKey: "coach_marks.auto_desc",
      onPress: (nav) => nav.navigate("AutoMode"),
    },
  ];

  const exploreCards: ActivityCard[] = [
    {
      id: "explore",
      icon: "grid-outline",
      iconColor: "#F97316",
      titleKey: "home.card_explore_title",
      descKey: "home.card_explore_desc",
      coachTitleKey: "coach_marks.explore_title",
      coachDescKey: "coach_marks.explore_desc",
      onPress: (nav) => nav.navigate("CategoryBrowser"),
    },
    {
      id: "read",
      icon: "newspaper-outline",
      iconColor: "#E85D5D",
      titleKey: "home.card_read_title",
      descKey: "home.card_read_desc",
      coachTitleKey: "coach_marks.read_title",
      coachDescKey: "coach_marks.read_desc",
      onPress: (nav) => nav.navigate("Reading"),
    },
    {
      id: "dialog",
      icon: "chatbubbles-outline",
      iconColor: "#06B6D4",
      titleKey: "dialog.home_card_title",
      descKey: "dialog.home_card_subtitle",
      coachTitleKey: "dialog.home_card_title",
      coachDescKey: "dialog.home_card_subtitle",
      onPress: (nav) => nav.navigate("DialogSetup"),
    },
    {
      id: "games",
      icon: "game-controller-outline",
      iconColor: "#EC4899",
      titleKey: "games.hub.title",
      descKey: "games.hub.subtitle",
      coachTitleKey: "games.hub.title",
      coachDescKey: "games.hub.subtitle",
      onPress: (nav) => nav.navigate("GameHub"),
    },
    {
      id: "ai",
      icon: "sparkles",
      iconColor: "#7C5CF6",
      titleKey: "ai_translator.card_title",
      descKey: "ai_translator.card_desc",
      coachTitleKey: "coach_marks.ai_title",
      coachDescKey: "coach_marks.ai_desc",
      onPress: (nav) => nav.navigate("AITranslator"),
    },
  ];

  const visibleCards = useMemo(
    () => [...practiceCards, ...exploreCards],
    [practiceCards, exploreCards]
  );

  const cardIndexById = useMemo(
    () =>
      visibleCards.reduce<Record<string, number>>((acc, card, index) => {
        acc[card.id] = index;
        return acc;
      }, {}),
    [visibleCards]
  );

  const currentPairUserSentences = useMemo(
    () =>
      sentences.filter(
        (sentence) =>
          (sentence.source_lang ?? uiLanguage) === uiLanguage &&
          (sentence.target_lang ?? targetLanguage) === targetLanguage
      ),
    [sentences, targetLanguage, uiLanguage]
  );

  const learningListCount = useMemo(() => {
    const userLearningCount = currentPairUserSentences.filter(
      (sentence) => sentence.status === "learning"
    ).length;
    const presetLearningCount = presetSentences.filter(
      (sentence) => progressMap[sentence.id] === "learning"
    ).length;
    return userLearningCount + presetLearningCount;
  }, [currentPairUserSentences, presetSentences, progressMap]);

  const hasLearningList = learningListCount > 0;

  const practiceDescriptionKey = hasLearningList
    ? "home.practice_section_desc_ready"
    : "home.practice_section_desc_empty";

  const TAB_BAR_H = 56;
  const tabBarHeight = TAB_BAR_H + insets.bottom;
  const TAB_W = screenWidth / 4;
  const tabLayouts = [1, 2, 3].map((i) => ({
    x: i * TAB_W,
    y: screenHeight - tabBarHeight,
    width: TAB_W,
    height: tabBarHeight,
  }));

  const tabCoachKeys = [
    { titleKey: "coach_marks.tab_sentences_title", descKey: "coach_marks.tab_sentences_desc" },
    { titleKey: "coach_marks.tab_me_title", descKey: "coach_marks.tab_me_desc" },
    { titleKey: "coach_marks.tab_more_title", descKey: "coach_marks.tab_more_desc" },
  ];

  const syncHomeData = useCallback(() => {
    void refreshProfile();
    void loadCategories();
    void loadSentences();
    void loadPresetSentences(undefined, isPremium);
    void loadProgress();
  }, [isPremium, loadCategories, loadPresetSentences, loadProgress, loadSentences, refreshProfile]);

  const goToSentencesTab = useCallback(() => {
    navigation.getParent()?.navigate("Sentences" as never);
  }, [navigation]);

  const startCoachMarks = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    const cardSteps: CoachMarkStep[] = visibleCards.map((card) => ({
      ref: { current: cardRefs.current[cardIndexById[card.id]] } as React.RefObject<View>,
      title: t(card.coachTitleKey),
      description: t(card.coachDescKey),
    }));

    const tabSteps: CoachMarkStep[] = tabLayouts.map((layout, i) => ({
      layout,
      title: t(tabCoachKeys[i].titleKey),
      description: t(tabCoachKeys[i].descKey),
    }));

    setCoachSteps([...cardSteps, ...tabSteps]);
    setCoachVisible(true);
  }, [cardIndexById, screenHeight, screenWidth, t, tabLayouts, visibleCards]);

  const hasAutoStarted = useRef(false);
  React.useEffect(() => {
    if (isReady && !isCoachMarksDone && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      const timer = setTimeout(startCoachMarks, 600);
      return () => clearTimeout(timer);
    }
  }, [isReady, isCoachMarksDone, startCoachMarks]);

  React.useEffect(() => {
    if (!isReady || !isCoachMarksDone || coachVisible || isPremium || isHintShown("premiumIntro")) {
      return;
    }

    const timer = setTimeout(() => setPremiumHintVisible(true), 700);
    return () => clearTimeout(timer);
  }, [coachVisible, isCoachMarksDone, isHintShown, isPremium, isReady]);

  useFocusEffect(
    useCallback(() => {
      syncHomeData();
    }, [syncHomeData])
  );

  const handleCoachDone = useCallback(() => {
    setCoachVisible(false);
    markCoachMarksDone();
  }, [markCoachMarksDone]);

  const handleCoachSkip = useCallback(() => {
    setCoachVisible(false);
    markCoachMarksDone();
  }, [markCoachMarksDone]);

  const scrollToCard = useCallback((index: number) => {
    const y = cardLayoutYs.current[index];
    if (y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: false });
    }
  }, []);

  const closePremiumHint = useCallback(() => {
    setPremiumHintVisible(false);
    markHintShown("premiumIntro");
  }, [markHintShown]);

  const renderCard = useCallback(
    (card: ActivityCard, width: number) => {
      const cardIndex = cardIndexById[card.id];
      return (
        <TouchableOpacity
          key={card.id}
          ref={(ref) => {
            cardRefs.current[cardIndex] = ref;
          }}
          onLayout={(e) => {
            cardLayoutYs.current[cardIndex] = e.nativeEvent.layout.y;
          }}
          style={[styles.card, { width, backgroundColor: colors.cardBackground }]}
          onPress={() => card.onPress(navigation)}
          activeOpacity={0.75}
        >
          <View style={styles.cardInner}>
            <View style={[styles.iconCircle, { backgroundColor: `${card.iconColor}1A` }]}>
              <Ionicons name={card.icon} size={28} color={card.iconColor} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t(card.titleKey)}</Text>
            <Text style={[styles.cardDesc, { color: colors.textTertiary }]}>{t(card.descKey)}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [cardIndexById, colors.cardBackground, colors.text, colors.textTertiary, navigation, t]
  );

  const renderCardGrid = useCallback(
    (cards: ActivityCard[], width: number) => {
      return <View style={styles.cardGrid}>{cards.map((card) => renderCard(card, width))}</View>;
    },
    [renderCard]
  );

  const dashboardAccent = hasLearningList ? colors.success : colors.primary;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!coachVisible}
      >
        <Text style={[styles.title, { color: colors.text }]}>{t("app_name")}</Text>

        <HeroHeader />

        <View
          style={[
            styles.dashboardOuter,
            {
              borderColor: colors.border,
              backgroundColor: isDark ? "#182235" : "#FFF7EE",
              shadowColor: isDark ? "#000000" : "#C7B49C",
            },
          ]}
        >
          <View
            style={[
              styles.dashboardInner,
              { backgroundColor: isDark ? "#182235" : "#FFF7EE" },
            ]}
          >
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: hasLearningList
                    ? `${colors.success}20`
                    : `${colors.primary}16`,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: dashboardAccent }]}>
                {hasLearningList
                  ? t("home.dashboard_ready_badge", { count: learningListCount })
                  : t("home.dashboard_empty_badge")}
              </Text>
            </View>

            <Text style={[styles.dashboardTitle, { color: colors.text }]}>
              {hasLearningList
                ? t("home.dashboard_ready_title")
                : t("home.dashboard_empty_title")}
            </Text>
            <Text style={[styles.dashboardBody, { color: colors.textSecondary }]}>
              {hasLearningList
                ? t("home.dashboard_ready_body")
                : t("home.dashboard_empty_body")}
            </Text>

            {!hasLearningList && (
              <View
                style={[
                  styles.metaPill,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
                  },
                ]}
              >
                <Ionicons name="grid-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaPillText, { color: colors.textSecondary }]}>
                  {t("home.categories_count", { count: categories.length })}
                </Text>
              </View>
            )}

            {hasLearningList ? (
              <View style={styles.dashboardPracticeGrid}>
                <View style={styles.cardDeck}>{renderCardGrid(practiceCards, dashboardCardWidth)}</View>
              </View>
            ) : (
              <View style={styles.primaryActions}>
                <Pressable
                  onPress={() =>
                    hasLearningList
                      ? navigation.navigate("Learn", { initialTab: "study" })
                      : navigation.navigate("CategoryBrowser")
                  }
                  style={({ pressed }) => [
                    styles.primaryButton,
                    {
                      backgroundColor: dashboardAccent,
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {hasLearningList
                      ? t("home.dashboard_ready_primary")
                      : t("home.dashboard_empty_primary")}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    hasLearningList
                      ? navigation.navigate("Learn", { initialTab: "listening" })
                      : navigation.navigate("AITranslator")
                  }
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: pressed
                        ? colors.backgroundSecondary
                        : colors.cardBackground,
                    },
                  ]}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                    {hasLearningList
                      ? t("home.dashboard_ready_secondary")
                      : t("home.dashboard_empty_secondary")}
                  </Text>
                </Pressable>
              </View>
            )}

            {!hasLearningList && (
              <Pressable
                onPress={hasLearningList ? goToSentencesTab : () => navigation.navigate("AddSentence")}
                style={({ pressed }) => [
                  styles.tertiaryAction,
                  { opacity: pressed ? 0.68 : 1 },
                ]}
              >
                <Text style={[styles.tertiaryActionText, { color: colors.primary }]}>
                  {hasLearningList
                    ? t("home.dashboard_ready_tertiary")
                    : t("home.dashboard_empty_tertiary")}
                </Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </Pressable>
            )}
          </View>
        </View>

        {!hasLearningList && (
          <View style={[styles.setupStrip, { backgroundColor: colors.surfaceSecondary }]}>
            <SectionHeader
              title={t("home.setup_section_title")}
              description={t("home.setup_section_desc")}
              colors={colors}
            />
            <View style={styles.setupActionsRow}>
              <Pressable
                onPress={() => navigation.navigate("CategoryBrowser")}
                style={({ pressed }) => [
                  styles.setupChip,
                  {
                    backgroundColor: pressed ? colors.backgroundTertiary : colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="grid-outline" size={16} color={colors.primary} />
                <Text style={[styles.setupChipText, { color: colors.text }]}>
                  {t("home.dashboard_empty_primary")}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("AddSentence")}
                style={({ pressed }) => [
                  styles.setupChip,
                  {
                    backgroundColor: pressed ? colors.backgroundTertiary : colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                <Text style={[styles.setupChipText, { color: colors.text }]}>
                  {t("home.dashboard_empty_tertiary")}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {!hasLearningList && (
          <View style={styles.section}>
            <SectionHeader
              title={t("home.practice_section_title")}
              description={t(practiceDescriptionKey)}
              colors={colors}
            />
            <View style={styles.cardDeck}>{renderCardGrid(practiceCards, cardWidth)}</View>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader
            title={t("home.explore_section_title")}
            description={t("home.explore_section_desc")}
            colors={colors}
          />
          <View style={styles.cardDeck}>{renderCardGrid(exploreCards, cardWidth)}</View>
        </View>
      </ScrollView>

      <CoachMarksOverlay
        steps={coachSteps}
        visible={coachVisible}
        onDone={handleCoachDone}
        onSkip={handleCoachSkip}
        onBeforeStep={(index) => {
          if (index < visibleCards.length) scrollToCard(index);
        }}
      />
      <HintBottomSheet
        visible={premiumHintVisible}
        title={t("hints.premium_intro_title")}
        body={t("hints.premium_intro_body")}
        onClose={closePremiumHint}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  dashboardOuter: {
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  dashboardInner: {
    borderRadius: 23,
    padding: 18,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },
  dashboardBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 14,
    alignSelf: "flex-start",
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dashboardPracticeGrid: {
    marginTop: 18,
  },
  cardDeck: {
    borderRadius: 20,
  },
  primaryActions: {
    gap: 10,
    marginTop: 16,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tertiaryAction: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  tertiaryActionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  setupStrip: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  setupActionsRow: {
    gap: 10,
  },
  setupChip: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  setupChipText: {
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  cardInner: {
    alignItems: "center",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
});
