import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackParamList } from "@/types";
import TabNavigator from "./TabNavigator";
import AddSentenceScreen from "@/screens/AddSentenceScreen";
import EditSentenceScreen from "@/screens/EditSentenceScreen";
import AutoModeScreen from "@/screens/AutoModeScreen";

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
        name="AutoMode"
        component={AutoModeScreen}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
