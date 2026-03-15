import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";

// Icons
import { Ionicons } from "@expo/vector-icons";

// Screens
import LearnScreen from "@/screens/tabs/LearnScreen";
import QuizScreen from "@/screens/tabs/QuizScreen";
import SentencesScreen from "@/screens/tabs/SentencesScreen";
import ProfileScreen from "@/screens/tabs/ProfileScreen";

export type TabParamList = {
  Learn: undefined;
  Quiz: undefined;
  Sentences: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Learn":
              iconName = focused ? "book" : "book-outline";
              break;
            case "Quiz":
              iconName = focused ? "school" : "school-outline";
              break;
            case "Sentences":
              iconName = focused ? "list" : "list-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "help-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarLabel: t("tabs.learn"),
        }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          tabBarLabel: t("tabs.quiz"),
        }}
      />
      <Tab.Screen
        name="Sentences"
        component={SentencesScreen}
        options={{
          tabBarLabel: t("tabs.sentences"),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t("tabs.profile"),
        }}
      />
    </Tab.Navigator>
  );
}
