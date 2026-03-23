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
import { useProgressStore } from "@/store/useProgressStore";
import { usePremium } from "@/hooks/usePremium";
import { LearnedCard } from "@/components/LearnedCard";
import { MainStackParamList } from "@/types";

export default function LearnedSentencesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { sentences, presetSentences, loadSentences, loadPresetSentences } = useSentenceStore();
  const { progressMap, forgot, loadProgress } = useProgressStore();
  const { isPremium } = usePremium();

  useEffect(() => {
    loadSentences();
    loadProgress();
    loadPresetSentences(undefined, isPremium);
  }, [isPremium]);

  const seenIds = new Set<string>();
  const learnedList = [...sentences, ...presetSentences]
    .filter((s) => {
      if (seenIds.has(s.id)) return false;
      seenIds.add(s.id);
      return true;
    })
    .filter((s) => progressMap[s.id] === "learned");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("profile.learned_sentences")}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Count badge */}
      {learnedList.length > 0 && (
        <View style={[styles.countRow, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="checkmark-circle" size={16} color="#49C98A" />
          <Text style={[styles.countText, { color: colors.textSecondary }]}>
            {learnedList.length} {t("learn.sentences_learned")}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {learnedList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎓</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("learn.no_learned_sentences")}
            </Text>
          </View>
        ) : (
          learnedList.map((sentence) => (
            <LearnedCard
              key={sentence.id}
              sentence={sentence}
              onForgot={async () => { await forgot(sentence.id); loadProgress(); }}
              colors={colors}
              t={t}
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
