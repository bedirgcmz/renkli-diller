import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { HomeStackParamList } from "@/types";

type Nav = NativeStackNavigationProp<HomeStackParamList>;

// TODO: Faz 2 — Word Rain full implementation
export default function WordRainScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🌧</Text>
        <Text style={[styles.title, { color: colors.text }]}>Word Rain</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Yakında geliyor...{"\n"}Bu oyun Faz 2'de eklenecek.
        </Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={18} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.backBtnText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emoji:     { fontSize: 64, marginBottom: 16 },
  title:     { fontSize: 26, fontWeight: "800", marginBottom: 10 },
  subtitle:  { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 32 },
  backBtn:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 13, borderRadius: 14 },
  backBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
