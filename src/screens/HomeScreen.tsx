import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
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
const DASHBOARD_CARD_WIDTH_TRIM = 8;
const COMPACT_HOME_BREAKPOINT = 350;

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
  compact = false,
}: {
  title: string;
  description: string;
  colors: ReturnType<typeof useTheme>["colors"];
  compact?: boolean;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.text },
          compact && { fontSize: 17, marginBottom: 3 },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          { color: colors.textSecondary },
          compact && { fontSize: 12, lineHeight: 17 },
        ]}
      >
        {description}
      </Text>
    </View>
  );
}

function SetupActionButton({
  icon,
  label,
  iconColor,
  iconBackgroundColor,
  textColor,
  chevronColor,
  backgroundColor,
  borderColor,
  shadowColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor: string;
  iconBackgroundColor: string;
  textColor: string;
  chevronColor: string;
  backgroundColor: string;
  borderColor: string;
  shadowColor: string;
  onPress: () => void;
}) {
  // Shadow must live on the same element as backgroundColor — iOS ignores
  // shadow* props on transparent Views, so Animated.View + inner Pressable
  // split never shows a shadow. TouchableOpacity with all props merged fixes this.
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[
        styles.setupChip,
        { backgroundColor, borderColor, shadowColor },
      ]}
    >
      <View style={styles.setupChipContent}>
        <View style={[styles.setupChipIconWrap, { backgroundColor: iconBackgroundColor }]}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text style={[styles.setupChipText, { color: textColor }]}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color={chevronColor} style={styles.setupChipChevron} />
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const isCompactHome = screenWidth <= COMPACT_HOME_BREAKPOINT;
  const horizontalPadding = isCompactHome ? 14 : 16;
  const dashboardInnerPadding = isCompactHome ? 16 : 18;
  const compactCardWidthTrim = isCompactHome ? 4 : 0;
  const dashboardCardWidthTrim =
    DASHBOARD_CARD_WIDTH_TRIM + (isCompactHome ? 10 : 0);
  const cardWidth = Math.floor(
    (screenWidth - horizontalPadding * 2 - CARD_GAP - compactCardWidthTrim) / 2
  );
  const dashboardCardWidth = Math.floor(
    (
      screenWidth -
      horizontalPadding * 2 -
      dashboardInnerPadding * 2 -
      CARD_GAP -
      dashboardCardWidthTrim
    ) / 2
  );
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
      id: "dictation",
      icon: "create-outline",
      iconColor: "#EC4899",
      titleKey: "home.card_dictation_title",
      descKey: "home.card_dictation_desc",
      coachTitleKey: "coach_marks.dictation_title",
      coachDescKey: "coach_marks.dictation_desc",
      onPress: (nav) => nav.navigate("Quiz", { initialMode: "fill_blank" }),
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
    {
      id: "add_sentence",
      icon: "add-circle-outline",
      iconColor: "#0EA5E9",
      titleKey: "home.card_add_sentence_title",
      descKey: "home.card_add_sentence_desc",
      coachTitleKey: "coach_marks.add_sentence_title",
      coachDescKey: "coach_marks.add_sentence_desc",
      onPress: (nav) => nav.navigate("AddSentence"),
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
          style={[
            styles.card,
            {
              width,
              backgroundColor: colors.cardBackground,
              padding: isCompactHome ? 14 : 16,
            },
          ]}
          onPress={() => card.onPress(navigation)}
          activeOpacity={0.75}
        >
          <View style={styles.cardInner}>
            <View
              style={[
                styles.iconCircle,
                isCompactHome && styles.iconCircleCompact,
                { backgroundColor: `${card.iconColor}1A` },
              ]}
            >
              <Ionicons name={card.icon} size={isCompactHome ? 25 : 28} color={card.iconColor} />
            </View>
            <Text
              style={[
                styles.cardTitle,
                { color: colors.text },
                isCompactHome && { fontSize: 15, marginBottom: 3 },
              ]}
            >
              {t(card.titleKey)}
            </Text>
            <Text
              style={[
                styles.cardDesc,
                { color: colors.textTertiary },
                isCompactHome && { fontSize: 11, lineHeight: 14 },
              ]}
            >
              {t(card.descKey)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [cardIndexById, colors.cardBackground, colors.text, colors.textTertiary, isCompactHome, navigation, t]
  );

  const renderCardGrid = useCallback(
    (cards: ActivityCard[], width: number) => {
      return <View style={styles.cardGrid}>{cards.map((card) => renderCard(card, width))}</View>;
    },
    [renderCard]
  );

  const dashboardAccent = hasLearningList ? colors.success : colors.primary;
  const emptyCtaBackground = colors.cardBackground;
  const emptyCtaBorder = colors.border;
  const emptyCtaShadowColor = "#000000";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: isCompactHome ? 6 : 8,
            paddingBottom: isCompactHome ? 28 : 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!coachVisible}
      >
        <Text
          style={[
            styles.title,
            { color: colors.text },
            isCompactHome && { fontSize: 22, marginBottom: 14 },
          ]}
        >
          {t("app_name")}
        </Text>

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
              {
                backgroundColor: isDark ? "#182235" : "#FFF7EE",
                padding: dashboardInnerPadding,
              },
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
              <Text
                style={[
                  styles.badgeText,
                  { color: dashboardAccent },
                  isCompactHome && { fontSize: 11 },
                ]}
              >
                {hasLearningList
                  ? t("home.dashboard_ready_badge", { count: learningListCount })
                  : t("home.dashboard_empty_badge")}
              </Text>
            </View>

            <Text
              style={[
                styles.dashboardTitle,
                { color: colors.text },
                isCompactHome && { fontSize: 20, lineHeight: 25 },
              ]}
            >
              {hasLearningList
                ? t("home.dashboard_ready_title")
                : t("home.dashboard_empty_title")}
            </Text>
            <Text
              style={[
                styles.dashboardBody,
                { color: colors.textSecondary },
                isCompactHome && { fontSize: 13, lineHeight: 19, marginTop: 6 },
              ]}
            >
              {hasLearningList
                ? t("home.dashboard_ready_body")
                : t("home.dashboard_empty_body")}
            </Text>

            {hasLearningList ? (
              <View
                style={[
                  styles.dashboardPracticeGrid,
                  isCompactHome && { marginTop: 16 },
                ]}
              >
                <View style={styles.cardDeck}>{renderCardGrid(practiceCards, dashboardCardWidth)}</View>
              </View>
            ) : (
              <View
                style={[
                  styles.emptyCtaSection,
                  isCompactHome && { marginTop: 14 },
                ]}
              >
                <Text style={[styles.emptyCtaTitle, { color: colors.text }]}>
                  {t("home.dashboard_empty_cta_title")}
                </Text>
                <Text style={[styles.emptyCtaBody, { color: colors.textSecondary }]}>
                  {t("home.dashboard_empty_cta_body")}
                </Text>

                <View style={styles.setupActionsRow}>
                  <SetupActionButton
                    icon="sparkles"
                    label={t("home.dashboard_empty_secondary")}
                    iconColor={colors.primary}
                    iconBackgroundColor={`${colors.primary}14`}
                    textColor={colors.text}
                    chevronColor={colors.textTertiary}
                    backgroundColor={emptyCtaBackground}

                    borderColor={emptyCtaBorder}
                    shadowColor={emptyCtaShadowColor}
                    onPress={() => navigation.navigate("AITranslator")}
                  />

                  <SetupActionButton
                    icon="grid-outline"
                    label={t("home.dashboard_empty_primary")}
                    iconColor={colors.primary}
                    iconBackgroundColor={`${colors.primary}14`}
                    textColor={colors.text}
                    chevronColor={colors.textTertiary}
                    backgroundColor={emptyCtaBackground}

                    borderColor={emptyCtaBorder}
                    shadowColor={emptyCtaShadowColor}
                    onPress={() => navigation.navigate("CategoryBrowser")}
                  />

                  <SetupActionButton
                    icon="add-circle-outline"
                    label={t("home.dashboard_empty_tertiary")}
                    iconColor={colors.primary}
                    iconBackgroundColor={`${colors.primary}14`}
                    textColor={colors.text}
                    chevronColor={colors.textTertiary}
                    backgroundColor={emptyCtaBackground}

                    borderColor={emptyCtaBorder}
                    shadowColor={emptyCtaShadowColor}
                    onPress={() => navigation.navigate("AddSentence")}
                  />
                </View>

                <View
                  style={[
                    styles.dashboardPracticeGrid,
                    isCompactHome && { marginTop: 16 },
                  ]}
                >
                  <View style={styles.cardDeck}>
                    {renderCardGrid(practiceCards, dashboardCardWidth)}
                  </View>
                </View>
              </View>
            )}

          </View>
        </View>

        <View style={[styles.section, isCompactHome && { marginBottom: 16 }]}>
          <SectionHeader
            title={t("home.explore_section_title")}
            description={t("home.explore_section_desc")}
            colors={colors}
            compact={isCompactHome}
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
  dashboardPracticeGrid: {
    marginTop: 18,
  },
  emptyCtaSection: {
    marginTop: 18,
  },
  emptyCtaTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyCtaBody: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  cardDeck: {
    borderRadius: 20,
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
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
  },
  setupChipContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    width: "100%",
  },
  setupChipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  setupChipText: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  setupChipChevron: {
    flexShrink: 0,
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
  iconCircleCompact: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginBottom: 10,
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
