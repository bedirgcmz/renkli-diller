import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LearnScreen from '@/screens/tabs/LearnScreen';
import QuizScreen from '@/screens/tabs/QuizScreen';
import SentencesScreen from '@/screens/tabs/SentencesScreen';
import ProfileScreen from '@/screens/tabs/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Quiz" component={QuizScreen} />
      <Tab.Screen name="Sentences" component={SentencesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
