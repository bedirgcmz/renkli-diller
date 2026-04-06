import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { HeroHeader } from "@/components/HeroHeader";
import { HomeStackParamList, MainStackParamList } from "@/types";
import { CoachMarksOverlay, CoachMarkStep } from "@/components/CoachMarksOverlay";
import { useOnboarding } from "@/providers/OnboardingProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

const { width: SW, height: SH } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (SW - 32 - CARD_GAP) / 2;

interface ActivityCard {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  titleKey: string;
  descKey: string;
  coachTitleKey: string;
  coachDescKey: string;
  onPress: (nav: Nav) => void;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { isCoachMarksDone, isReady, markCoachMarksDone } = useOnboarding();

  // Refs for each card and their layout Y in the ScrollView
  const scrollRef = useRef<ScrollView>(null);
  const cardRefs = useRef<(View | null)[]>([]);
  const cardLayoutYs = useRef<number[]>([]);

  const [coachVisible, setCoachVisible] = useState(false);
  const [coachSteps, setCoachSteps] = useState<CoachMarkStep[]>([]);

  const cards: ActivityCard[] = [
    {
      icon: "sparkles",
      iconColor: "#7C5CF6",
      titleKey: "ai_translator.card_title",
      descKey: "ai_translator.card_desc",
      coachTitleKey: "coach_marks.ai_title",
      coachDescKey: "coach_marks.ai_desc",
      onPress: (nav) => nav.navigate("AITranslator"),
    },
    {
      icon: "book-outline",
      iconColor: "#4DA3FF",
      titleKey: "home.card_learn_title",
      descKey: "home.card_learn_desc",
      coachTitleKey: "coach_marks.learn_title",
      coachDescKey: "coach_marks.learn_desc",
      onPress: (nav) => nav.navigate("Learn", { initialTab: "study" }),
    },
    {
      icon: "school-outline",
      iconColor: "#F59E0B",
      titleKey: "home.card_quiz_title",
      descKey: "home.card_quiz_desc",
      coachTitleKey: "coach_marks.quiz_title",
      coachDescKey: "coach_marks.quiz_desc",
      onPress: (nav) => nav.navigate("Quiz"),
    },
    {
      icon: "extension-puzzle-outline",
      iconColor: "#10B981",
      titleKey: "home.card_build_title",
      descKey: "home.card_build_desc",
      coachTitleKey: "coach_marks.build_title",
      coachDescKey: "coach_marks.build_desc",
      onPress: (nav) => nav.navigate("BuildSentence"),
    },
    {
      icon: "newspaper-outline",
      iconColor: "#E85D5D",
      titleKey: "home.card_read_title",
      descKey: "home.card_read_desc",
      coachTitleKey: "coach_marks.read_title",
      coachDescKey: "coach_marks.read_desc",
      onPress: (nav) => nav.navigate("Reading"),
    },
    {
      icon: "headset-outline",
      iconColor: "#49C98A",
      titleKey: "home.card_listen_title",
      descKey: "home.card_listen_desc",
      coachTitleKey: "coach_marks.listen_title",
      coachDescKey: "coach_marks.listen_desc",
      onPress: (nav) => nav.navigate("Learn", { initialTab: "listening" }),
    },
    {
      icon: "play-circle-outline",
      iconColor: "#8B5CF6",
      titleKey: "home.card_auto_title",
      descKey: "home.card_auto_desc",
      coachTitleKey: "coach_marks.auto_title",
      coachDescKey: "coach_marks.auto_desc",
      onPress: (nav) => nav.navigate("AutoMode"),
    },
    {
      icon: "grid-outline",
      iconColor: "#F97316",
      titleKey: "home.card_explore_title",
      descKey: "home.card_explore_desc",
      coachTitleKey: "coach_marks.explore_title",
      coachDescKey: "coach_marks.explore_desc",
      onPress: (nav) => nav.navigate("CategoryBrowser"),
    },
  ];

  // Tab bar step layouts — calculated from screen geometry (4 equal tabs)
  const TAB_BAR_H = 56;
  const TAB_W = SW / 4;
  // Sentences = index 1, Me = index 2, More = index 3
  const tabLayouts = [1, 2, 3].map((i) => ({
    x: i * TAB_W,
    y: SH - TAB_BAR_H - insets.bottom,
    width: TAB_W,
    height: TAB_BAR_H,
  }));

  const tabCoachKeys = [
    { titleKey: "coach_marks.tab_sentences_title", descKey: "coach_marks.tab_sentences_desc" },
    { titleKey: "coach_marks.tab_me_title", descKey: "coach_marks.tab_me_desc" },
    { titleKey: "coach_marks.tab_more_title", descKey: "coach_marks.tab_more_desc" },
  ];

  const startCoachMarks = useCallback(() => {
    // Scroll to top first
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    // Build steps: 8 card refs + 3 tab bar layouts
    const cardSteps: CoachMarkStep[] = cards.map((card, i) => ({
      ref: { current: cardRefs.current[i] } as React.RefObject<View>,
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
  }, [t, insets.bottom]);

  // Auto-start on first launch once provider is ready
  const hasAutoStarted = useRef(false);
  React.useEffect(() => {
    if (isReady && !isCoachMarksDone && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      // Small delay to let the screen render fully
      const timer = setTimeout(startCoachMarks, 600);
      return () => clearTimeout(timer);
    }
  }, [isReady, isCoachMarksDone]);

  const handleCoachDone = useCallback(() => {
    setCoachVisible(false);
    markCoachMarksDone();
  }, [markCoachMarksDone]);

  const handleCoachSkip = useCallback(() => {
    setCoachVisible(false);
    markCoachMarksDone();
  }, [markCoachMarksDone]);

  // Scroll to card when coach marks advance to a card step
  // CoachMarksOverlay handles this internally via measureInWindow, but for
  // cards that are below the fold we need to pre-scroll. We expose a
  // scrollToCard helper that CoachMarksOverlay calls before measuring.
  const scrollToCard = useCallback((index: number) => {
    const y = cardLayoutYs.current[index];
    if (y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: false });
    }
  }, []);

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

        <View style={styles.grid}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={index}
              ref={(ref) => {
                cardRefs.current[index] = ref;
              }}
              onLayout={(e) => {
                cardLayoutYs.current[index] = e.nativeEvent.layout.y;
              }}
              style={[styles.card, { backgroundColor: colors.cardBackground }]}
              onPress={() => card.onPress(navigation)}
              activeOpacity={0.75}
            >
              <View style={styles.cardInner}>
                <View style={[styles.iconCircle, { backgroundColor: card.iconColor + "1A" }]}>
                  <Ionicons name={card.icon} size={28} color={card.iconColor} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t(card.titleKey)}</Text>
                <Text style={[styles.cardDesc, { color: colors.textTertiary }]}>
                  {t(card.descKey)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <CoachMarksOverlay
        steps={coachSteps}
        visible={coachVisible}
        onDone={handleCoachDone}
        onSkip={handleCoachSkip}
        onBeforeStep={(index) => {
          // Scroll to card before measuring (only for card steps)
          if (index < cards.length) scrollToCard(index);
        }}
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
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
