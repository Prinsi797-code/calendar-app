import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeMode() {
  const router = useRouter();
  const { theme, setTheme, colors } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    Alert.alert('Success', `${newTheme === 'light' ? 'Light' : 'Dark'} theme applied!`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Theme Mode</Text>
        <View style={styles.placeholder} />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>

        {/* LIGHT THEME */}
        <TouchableOpacity
          style={[styles.themeOption, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={() => handleThemeChange('light')}
        >
          <View style={styles.themeInfo}>
            <Feather
              name="sun"
              size={20}
              color={theme === 'light' ? colors.primary : colors.textPrimary}
            />
            <Text style={[styles.themeText, { color: colors.textPrimary }]}>Light Theme</Text>
          </View>

          <View style={[
            styles.circle,
            { borderColor: colors.textTertiary },
            theme === 'light' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}>
            {theme === 'light' && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        {/* DARK THEME */}
        <TouchableOpacity
          style={[styles.themeOption, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={() => handleThemeChange('dark')}
        >
          <View style={styles.themeInfo}>
            <Feather
              name="moon"
              size={20}
              color={theme === 'dark' ? colors.primary : colors.textPrimary}
            />
            <Text style={[styles.themeText, { color: colors.textPrimary }]}>Dark Theme</Text>
          </View>

          <View style={[
            styles.circle,
            { borderColor: colors.textTertiary },
            theme === 'dark' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}>
            {theme === 'dark' && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8 },
  backIcon: { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  placeholder: { width: 40 },

  content: { flex: 1, padding: 16 },

  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },

  themeInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  themeText: { fontSize: 18, fontWeight: '600' },

  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkmark: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
