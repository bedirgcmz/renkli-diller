import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";

// Placeholder — full implementation in Task 4
export default function ReadingScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.text }]}>{t("tabs.read")}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Coming soon…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  title: { fontSize: 20, fontWeight: "700" },
  sub: { fontSize: 14 },
});
