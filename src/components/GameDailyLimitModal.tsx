import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { MainStackParamList } from "@/types";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function GameDailyLimitModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const handleUpgrade = () => {
    onClose();
    navigation.navigate("Paywall");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => {}}>
          <View style={[styles.iconWrap, { backgroundColor: colors.premiumAccent + "22" }]}>
            <Ionicons name="trophy" size={32} color={colors.premiumAccent} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {t("games.common.daily_limit_title")}
          </Text>

          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {t("games.common.daily_limit_body")}
          </Text>

          <TouchableOpacity
            style={[styles.upgradeBtn, { backgroundColor: colors.premiumAccent }]}
            onPress={handleUpgrade}
            activeOpacity={0.85}
          >
            <Ionicons name="star" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.upgradeBtnText}>{t("games.common.go_premium")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={[styles.laterBtnText, { color: colors.textSecondary }]}>
              {t("games.common.daily_limit_later")}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 4,
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    marginTop: 4,
  },
  upgradeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  laterBtn: {
    paddingVertical: 8,
  },
  laterBtnText: {
    fontSize: 14,
  },
});
