import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { HomeStackParamList } from "@/types";

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type Route = RouteProp<HomeStackParamList, "MemoryMatch">;

export default function MemoryMatchScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Memory Match</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Filter: {route.params.filter}
        </Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Difficulty: {route.params.difficultyFilter}
        </Text>
        <Text style={[styles.body, { color: colors.text }]}>
          Memory Match gameplay bu branch'in bir sonraki commit'inde eklenecek.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: "700" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  label: { fontSize: 14, marginBottom: 8 },
  body: { fontSize: 16, textAlign: "center", lineHeight: 24 },
});
