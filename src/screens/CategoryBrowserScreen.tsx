import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePremium } from "@/hooks/usePremium";
import PremiumGate from "@/components/PremiumGate";
import { KeywordText } from "@/components/KeywordText";
import { Category, MainStackParamList } from "@/types";

export default function CategoryBrowserScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { categories, presetSentences, loading, loadCategories, loadPresetSentences, addToLearningList, removeFromLearningList } = useSentenceStore();
  const { progressMap } = useProgressStore();
  const { uiLanguage } = useSettingsStore();
  const { isPremium } = usePremium();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    loadCategories().finally(() => setInitialized(true));
  }, []);

  const getCategoryName = (cat: Category): string =>
    (cat[`name_${uiLanguage}` as keyof Category] as string) || cat.name_en;

  const handleCategoryPress = (cat: Category) => {
    if (!cat.is_free && !isPremium) {
      navigation.navigate("Paywall");
      return;
    }
    setSelectedCategory(cat);
    loadPresetSentences(cat.id);
  };

  // ─── Sentence list view ───────────────────────────────────────────────────

  if (selectedCategory) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {getCategoryName(selectedCategory)}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
        ) : (
          <FlatList
            data={presetSentences}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.sentenceList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const status = progressMap[item.id] ?? "new";
              const isLearning = status === "learning";
              const isLearned = status === "learned";

              return (
                <View style={[styles.sentenceCard, { backgroundColor: colors.cardBackground }]}>
                  <KeywordText
                    text={item.source_text}
                    baseColor={colors.text}
                    fontSize={15}
                    lineHeight={22}
                    colorSeed={item.id}
                  />
                  <KeywordText
                    text={item.target_text}
                    baseColor={colors.textSecondary}
                    fontSize={14}
                    lineHeight={21}
                    colorSeed={item.id}
                  />
                  <View style={styles.cardFooter}>
                    {isLearned ? (
                      <View style={[styles.statusBadge, { backgroundColor: "#2ECC7118" }]}>
                        <Text style={[styles.statusBadgeText, { color: "#2ECC71" }]}>
                          {t("sentences.status_learned")}
                        </Text>
                      </View>
                    ) : isLearning ? (
                      <View style={[styles.statusBadge, { backgroundColor: colors.primary + "18" }]}>
                        <Text style={[styles.statusBadgeText, { color: colors.primary }]}>
                          {t("sentences.status_learning")}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: colors.primary }]}
                        onPress={() => addToLearningList(item.id)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="add" size={14} color="#fff" />
                        <Text style={styles.addBtnText}>{t("learn.add_to_list")}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t("common.loading")}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // ─── Category grid view ───────────────────────────────────────────────────

  if (!initialized) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("sentences.preset_sentences")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isLocked = !item.is_free && !isPremium;

          const cardContent = (
            <View style={[styles.categoryCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text
                style={[styles.categoryName, { color: isLocked ? colors.textTertiary : colors.text }]}
                numberOfLines={2}
              >
                {getCategoryName(item)}
              </Text>
              {isLocked ? (
                <View style={[styles.lockBadge, { backgroundColor: colors.premiumAccent + "18" }]}>
                  <Ionicons name="lock-closed" size={10} color={colors.premiumAccent} />
                  <Text style={[styles.lockBadgeText, { color: colors.premiumAccent }]}>
                    {t("common.premium_badge")}
                  </Text>
                </View>
              ) : (
                <View style={[styles.freeBadge, { backgroundColor: colors.success + "18" }]}>
                  <Text style={[styles.freeBadgeText, { color: colors.success }]}>
                    {t("common.free")}
                  </Text>
                </View>
              )}
            </View>
          );

          if (isLocked) {
            return (
              <PremiumGate onUpgradePress={() => navigation.navigate("Paywall")}>
                {cardContent}
              </PremiumGate>
            );
          }

          return (
            <TouchableOpacity
              style={styles.categoryCardWrapper}
              onPress={() => handleCategoryPress(item)}
              activeOpacity={0.8}
            >
              {cardContent}
            </TouchableOpacity>
          );
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
  headerTitle: { fontSize: 17, fontWeight: "700", flex: 1, textAlign: "center" },
  // Grid
  grid: { padding: 12, paddingBottom: 40 },
  row: { gap: 12, marginBottom: 12 },
  categoryCardWrapper: { flex: 1 },
  categoryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryIcon: { fontSize: 32 },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  lockBadgeText: { fontSize: 10, fontWeight: "700" },
  freeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  freeBadgeText: { fontSize: 10, fontWeight: "700" },
  // Sentence list
  sentenceList: { padding: 16, paddingBottom: 40, gap: 12 },
  sentenceCard: {
    borderRadius: 14,
    padding: 14,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardFooter: { marginTop: 6 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: { fontSize: 12, fontWeight: "600" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyText: { fontSize: 14 },
});
