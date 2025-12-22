import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from "react-i18next";
import { StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        // IMPORTANT: Yahan false karo taaki parent drawer header dikhe
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          // shadowColor: 'transparent',
        },
        tabBarBackground: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("calendar"),
          // Yahan bhi false rakho
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Feather
              name="calendar"
              size={20}
              color={focused ? colors.primary : colors.textSecondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="challenge"
        options={{
          title: t("Challenge"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Feather
              name="edit"
              size={20}
              color={focused ? colors.primary : colors.textSecondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="memo"
        options={{
          title: t("Memo"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Feather
              name="file-text"
              size={20}
              color={focused ? colors.primary : colors.textSecondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: t("Diary"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Feather
              name="book"
              size={20}
              color={focused ? colors.primary : colors.textSecondary}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 24,
    opacity: 0.5,
  },
  activeIcon: {
    opacity: 1,
  },
});