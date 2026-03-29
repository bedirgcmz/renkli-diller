import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { HeroHeader } from "@/components/HeroHeader";
import { HomeStackParamList, MainStackParamList } from "@/types";

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

const { width } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (width - 32 - CARD_GAP) / 2;

interface ActivityCard {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  titleKey: string;
  descKey: string;
  onPress: (nav: Nav) => void;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();

  const cards: ActivityCard[] = [
    {
      icon: "book-outline",
      iconColor: "#4DA3FF",
      titleKey: "home.card_learn_title",
      descKey: "home.card_learn_desc",
      onPress: (nav) => nav.navigate("Learn", { initialTab: "study" }),
    },
    {
      icon: "school-outline",
      iconColor: "#F59E0B",
      titleKey: "home.card_quiz_title",
      descKey: "home.card_quiz_desc",
      onPress: (nav) => nav.navigate("Quiz"),
    },
    {
      icon: "headset-outline",
      iconColor: "#49C98A",
      titleKey: "home.card_listen_title",
      descKey: "home.card_listen_desc",
      onPress: (nav) => nav.navigate("Learn", { initialTab: "listening" }),
    },
    {
      icon: "newspaper-outline",
      iconColor: "#E85D5D",
      titleKey: "home.card_read_title",
      descKey: "home.card_read_desc",
      onPress: (nav) => nav.navigate("Reading"),
    },
    {
      icon: "play-circle-outline",
      iconColor: "#8B5CF6",
      titleKey: "home.card_auto_title",
      descKey: "home.card_auto_desc",
      onPress: (nav) => nav.navigate("AutoMode"),
    },
    {
      icon: "grid-outline",
      iconColor: "#F97316",
      titleKey: "home.card_explore_title",
      descKey: "home.card_explore_desc",
      onPress: (nav) => nav.navigate("CategoryBrowser"),
    },
    {
      icon: "text-outline",
      iconColor: "#10B981",
      titleKey: "home.card_build_title",
      descKey: "home.card_build_desc",
      onPress: (nav) => nav.navigate("BuildSentence"),
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>{t("app_name")}</Text>

        <HeroHeader />

        {/* AI Translator Banner */}
        <TouchableOpacity
          style={[styles.aiBanner, { backgroundColor: colors.cardBackground }]}
          onPress={() => navigation.navigate("AITranslator")}
          activeOpacity={0.75}
        >
          <View style={styles.aiBannerIcon}>
            <Ionicons name="sparkles" size={22} color="#7C5CF6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.aiBannerTitle, { color: colors.text }]}>
              {t("ai_translator.card_title")}
            </Text>
            <Text style={[styles.aiBannerDesc, { color: colors.textTertiary }]}>
              {t("ai_translator.card_desc")}
            </Text>
          </View>
          <View style={styles.aiBannerBadge}>
            <Text style={styles.aiBannerBadgeText}>AI</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>

        <View style={styles.grid}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={index}
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
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  aiBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C5CF622",
  },
  aiBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  aiBannerDesc: {
    fontSize: 12,
  },
  aiBannerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#7C5CF620",
  },
  aiBannerBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7C5CF6",
  },
});
