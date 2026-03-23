import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Icons
import { Ionicons } from "@expo/vector-icons";

// Screens
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import SentencesScreen from "@/screens/tabs/SentencesScreen";
import ProfileScreen from "@/screens/tabs/ProfileScreen";
import MoreScreen from "@/screens/MoreScreen";

import { TabParamList } from "@/types";

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
          height: 56 + insets.bottom,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          elevation: 6,
        },
        tabBarActiveTintColor: "#4DA3FF",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Sentences":
              iconName = focused ? "list" : "list-outline";
              break;
            case "Me":
              iconName = focused ? "person" : "person-outline";
              break;
            case "More":
              iconName = focused ? "ellipsis-horizontal-circle" : "ellipsis-horizontal-circle-outline";
              break;
            default:
              iconName = "help-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ tabBarLabel: t("tabs.home") }}
      />
      <Tab.Screen
        name="Sentences"
        component={SentencesScreen}
        options={{ tabBarLabel: t("tabs.sentences") }}
      />
      <Tab.Screen
        name="Me"
        component={ProfileScreen}
        options={{ tabBarLabel: t("tabs.me") }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarLabel: t("tabs.more") }}
      />
    </Tab.Navigator>
  );
}
