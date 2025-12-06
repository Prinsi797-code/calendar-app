import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const router = useRouter();
  const { theme, colors } = useTheme();

  const handleNotifications = () => {
    // Navigate to notification settings screen
    router.push('/notificationmore');
  };

  const handleAfterCall = () => {
    Alert.alert('After Call Feature', 'After call feature coming soon!');
  };

  const handleThemeMode = () => {
    router.push('/theme-mode');
  };

  const handleRate = () => {
    Alert.alert('Rate Us', 'Would you like to rate our app?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Rate', onPress: () => {
          Alert.alert('Thank you!', 'Redirecting to store...');
        }
      }
    ]);
  };

  const handleShare = () => {
    Alert.alert('Share App', 'Share this app with your friends!');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://sites.google.com/view/calendar-app-ios/home");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]} onPress={handleNotifications}>
          <View style={[styles.iconBox, { backgroundColor: colors.cardBackground }]}>
            <Feather
              name="bell"
              size={20}
              color={theme === 'dark' ? colors.white : colors.textPrimary}
            />
          </View>
          <Text style={[styles.settingText, { color: colors.textPrimary }]}>Notification</Text>
          <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]} onPress={handleAfterCall}>
          <View style={[styles.iconBox, { backgroundColor: colors.cardBackground }]}>
            <Feather
              name="phone"
              size={20}
              color={theme === 'dark' ? colors.white : colors.textPrimary}
            />
          </View>
          <Text style={[styles.settingText, { color: colors.textPrimary }]}>After Call Feature</Text>
          <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]} onPress={handleThemeMode}>
          <View style={[styles.iconBox, { backgroundColor: colors.cardBackground }]}>
            <Feather
              name="moon"
              size={20}
              color={theme === 'dark' ? colors.white : colors.textPrimary}
            />
          </View>
          <Text style={[styles.settingText, { color: colors.textPrimary }]}>Theme Mode</Text>
          <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]} onPress={handleRate}>
          <View style={[styles.iconBox, { backgroundColor: colors.cardBackground }]}>
            <Feather
              name="star"
              size={20}
              color={theme === 'dark' ? colors.white : colors.textPrimary}
            />
          </View>
          <Text style={[styles.settingText, { color: colors.textPrimary }]}>Rate</Text>
          <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]} onPress={handleShare}>
          <View style={[styles.iconBox, { backgroundColor: colors.cardBackground }]}>
            <Feather
              name="share-2"
              size={20}
              color={theme === 'dark' ? colors.white : colors.textPrimary}
            />
          </View>
          <Text style={[styles.settingText, { color: colors.textPrimary }]}>Share</Text>
          <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: colors.background, borderBottomColor: colors.border }
          ]}
          onPress={handlePrivacyPolicy}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.cardBackground }]}>
            <Feather
              name="shield"
              size={20}
              color={theme === 'dark' ? colors.white : colors.textPrimary}
            />
          </View>

          <Text style={[styles.settingText, { color: colors.textPrimary }]}>
            Privacy Policy
          </Text>

          <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
});