import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSentenceStore } from "@/store/useSentenceStore";
import { usePremium } from "@/hooks/usePremium";
import { LearnedCard } from "@/components/LearnedCard";
import { MainStackParamList } from "@/types";

export default function FavoriteSentencesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const {
    sentences,
    presetSentences,
    favoriteIds,
    loadSentences,
    loadPresetSentences,
    loadFavorites,
    toggleFavorite,
  } = useSentenceStore();
  const { isPremium } = usePremium();

  useEffect(() => {
    loadSentences();
    loadFavorites();
    loadPresetSentences(undefined, isPremium);
  }, [isPremium]);

  const seenIds = new Set<string>();
  const favoriteList = [...sentences, ...presetSentences]
    .filter((s) => {
      if (seenIds.has(s.id)) return false;
      seenIds.add(s.id);
      return true;
    })
    .filter((s) => favoriteIds.includes(s.id));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("profile.favorite_sentences")}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Count badge */}
      {favoriteList.length > 0 && (
        <View style={[styles.countRow, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="heart" size={16} color="#E85D5D" />
          <Text style={[styles.countText, { color: colors.textSecondary }]}>
            {favoriteList.length} {t("favorites.count")}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {favoriteList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🤍</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("favorites.empty")}
            </Text>
          </View>
        ) : (
          favoriteList.map((sentence) => (
            <LearnedCard
              key={sentence.id}
              sentence={sentence}
              onForgot={() => toggleFavorite(sentence.id, sentence.is_preset)}
              colors={colors}
              t={(k) => {
                if (k === "learn.mark_unlearned") return t("sentences.remove_favorite");
                return t(k);
              }}
            />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
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
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 20, fontWeight: "700" },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  countText: { fontSize: 13, fontWeight: "500" },
  scroll: { padding: 16 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, textAlign: "center", paddingHorizontal: 32 },
});
