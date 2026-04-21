import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { useNetworkStore } from "@/store/useNetworkStore";

import SignInScreen from "@/screens/auth/SignInScreen";
import SignUpScreen from "@/screens/auth/SignUpScreen";

export default function AuthScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, "Auth">>();
  const { colors } = useTheme();
  const isOnline = useNetworkStore((s) => s.isOnline);
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  const activeStyle = (active: boolean) => ({
    backgroundColor: active ? colors.accent : "transparent",
    borderColor: colors.accent,
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {isOnline === false ? (
        <View
          style={[
            styles.offlineBanner,
            {
              backgroundColor: colors.warning + "14",
              borderColor: colors.warning + "32",
            },
          ]}
        >
          <Text style={[styles.offlineBannerText, { color: colors.text }]}>
            {t("onboarding.offline_auth_banner")}
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.tab, activeStyle(mode === "signIn")]}
          onPress={() => setMode("signIn")}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, { color: mode === "signIn" ? "#fff" : colors.text }]}>
            {t("onboarding.sign_in")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeStyle(mode === "signUp")]}
          onPress={() => setMode("signUp")}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, { color: mode === "signUp" ? "#fff" : colors.text }]}>
            {t("onboarding.sign_up")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {mode === "signIn" ? (
          <SignInScreen
            onSwitchToSignUp={() => setMode("signUp")}
            onForgotPassword={() => navigation.navigate("ResetPassword")}
          />
        ) : (
          <SignUpScreen onSwitchToSignIn={() => setMode("signIn")} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  offlineBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  offlineBannerText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
});
