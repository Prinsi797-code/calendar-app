import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
//   return (
//     <Text style={[styles.icon, focused && styles.activeIcon]}>{emoji}</Text>
//   );
// }


// Custom Image Tab Icon Component
function TabIconImage({ source, focused }: { source: any; focused: boolean }) {
  return (
    <Image
      source={source}
      style={{
        width: 24,
        height: 24,
        opacity: focused ? 1 : 0.5,
      }}
      resizeMode="contain"
    />
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarStyle: {
          borderTopColor: colors.border,
          borderTopWidth: 1,
          backgroundColor: colors.background,
          // position: "absolute",               
          // elevation: 0,                       
          shadowOpacity: 1,
        },
        tabBarBackground: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calendar',
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
          title: 'Challenge',
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
          title: 'Memo',
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
          title: 'Diary',
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




// style={[{ backgroundColor: colors.background }]}