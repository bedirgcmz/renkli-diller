import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackParamList } from "@/types";
import TabNavigator from "./TabNavigator";
import AddSentenceScreen from "@/screens/AddSentenceScreen";
import EditSentenceScreen from "@/screens/EditSentenceScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import PaywallScreen from "@/screens/PaywallScreen";
import CategoryBrowserScreen from "@/screens/CategoryBrowserScreen";
import AutoModeScreen from "@/screens/AutoModeScreen";
import ChangeEmailScreen from "@/screens/ChangeEmailScreen";
import ChangePasswordScreen from "@/screens/ChangePasswordScreen";
import LearnedSentencesScreen from "@/screens/LearnedSentencesScreen";
import FavoriteSentencesScreen from "@/screens/FavoriteSentencesScreen";

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="AddSentence"
        component={AddSentenceScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="EditSentence"
        component={EditSentenceScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="CategoryBrowser"
        component={CategoryBrowserScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="AutoMode"
        component={AutoModeScreen}
        options={{ presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="ChangeEmail"
        component={ChangeEmailScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="LearnedSentences"
        component={LearnedSentencesScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="FavoriteSentences"
        component={FavoriteSentencesScreen}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
