import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeStackParamList } from "@/types";
import HomeScreen from "@/screens/HomeScreen";
import LearnScreen from "@/screens/tabs/LearnScreen";
import QuizScreen from "@/screens/tabs/QuizScreen";
import ReadingScreen from "@/screens/tabs/ReadingScreen";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Learn" component={LearnScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="Reading" component={ReadingScreen} />
    </Stack.Navigator>
  );
}
