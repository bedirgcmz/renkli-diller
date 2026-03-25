import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { usePremium } from "@/hooks/usePremium";
import { MainStackParamList } from "@/types";
import PDFExportModal from "@/components/PDFExportModal";

type Nav = NativeStackNavigationProp<MainStackParamList>;

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  badge?: string;
}

export default function MoreScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuthStore();
  const { isPremium } = usePremium();
  const [pdfModalVisible, setPdfModalVisible] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      t("profile.sign_out"),
      t("profile.confirm_signout"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.yes"), style: "destructive", onPress: () => signOut() },
      ],
    );
  };

  const sections: { title?: string; items: MenuItem[] }[] = [
    {
      title: t("sentences.preset_sentences"),
      items: [
        {
          icon: "grid-outline",
          label: t("sentences.preset_sentences"),
          onPress: () => navigation.navigate("CategoryBrowser"),
        },
        {
          icon: "checkmark-done-outline",
          label: t("profile.learned_sentences"),
          onPress: () => navigation.navigate("LearnedSentences"),
        },
        {
          icon: "heart-outline",
          label: t("profile.favorite_sentences"),
          onPress: () => navigation.navigate("FavoriteSentences"),
        },
        {
          icon: "trophy-outline",
          label: t("achievements.menu_item"),
          onPress: () => navigation.navigate("Achievements"),
        },
        {
          icon: "document-text-outline",
          label: t("profile.export_pdf"),
          onPress: () => {
            if (!isPremium) {
              Alert.alert(t("common.premium_badge"), t("add_sentence.upgrade_to_add_more"));
              return;
            }
            setPdfModalVisible(true);
          },
          badge: isPremium ? undefined : t("common.premium_badge"),
        },
      ],
    },
    {
      items: [
        {
          icon: "settings-outline",
          label: t("profile.settings"),
          onPress: () => navigation.navigate("Settings"),
        },
        {
          icon: "mail-outline",
          label: t("profile.change_email"),
          onPress: () => navigation.navigate("ChangeEmail"),
        },
        {
          icon: "lock-closed-outline",
          label: t("profile.change_password"),
          onPress: () => navigation.navigate("ChangePassword"),
        },
        ...(!isPremium
          ? [
              {
                icon: "star-outline" as keyof typeof Ionicons.glyphMap,
                label: t("premium.title"),
                onPress: () => navigation.navigate("Paywall"),
                color: colors.premiumAccent,
                badge: "✨",
              },
            ]
          : []),
      ],
    },
    {
      items: [
        {
          icon: "log-out-outline",
          label: t("profile.sign_out"),
          onPress: handleSignOut,
          color: colors.error,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>{t("tabs.more")}</Text>

        {sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionWrapper}>
            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              {section.items.map((item, idx) => (
                <View key={idx}>
                  {idx > 0 && (
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                  )}
                  <TouchableOpacity
                    style={styles.row}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.rowLeft}>
                      <Ionicons
                        name={item.icon}
                        size={22}
                        color={item.color ?? colors.text}
                      />
                      <Text style={[styles.rowLabel, { color: item.color ?? colors.text }]}>
                        {item.label}
                      </Text>
                      {item.badge && (
                        <View style={[styles.badge, { backgroundColor: colors.premiumAccent + "22" }]}>
                          <Text style={[styles.badgeText, { color: colors.premiumAccent }]}>
                            {item.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      <PDFExportModal visible={pdfModalVisible} onClose={() => setPdfModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  sectionWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  divider: {
    height: 1,
    marginLeft: 50,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
