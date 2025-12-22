import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, colors } = useTheme();

  const handleNotifications = () => {
    router.push('/notificationmore');
  };

  const handleAfterCall = () => {
    Alert.alert(
      t("after_call_feature_msg"),
      t("feature_coming_soon")
    );
  };

  const handleThemeMode = () => {
    router.push('/theme-mode');
  };

  // t("success"),
  //     newTheme === "light"
  //       ? t("light_theme_appleid")
  //       : t("dark_theme_appleid")
  //   );

  const handleRate = () => {
    Alert.alert(t("rate_us"), (t("would_you_app")), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("rate"),
        onPress: () => {
          Alert.alert(
            t("thank_you"),
            t("redirecting_store")
          );
        },
      }
    ]);
  };

  const handleShare = () => {
    Alert.alert(t("share_app"), t("share_friends"));
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://sites.google.com/view/calendar-app-ios/home");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View> */}

      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t("settings")}</Text>
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
          <Text style={[styles.settingText, { color: colors.textPrimary }]}>{t("notification")}</Text>
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
          <Text style={[styles.settingText, { color: colors.textPrimary }]}>{t("after_call_feature")}</Text>
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
          <Text style={[styles.settingText, { color: colors.textPrimary }]}>{t("theme_mode")}</Text>
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
          <Text style={[styles.settingText, { color: colors.textPrimary }]}>{t("rate")}</Text>
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
          <Text style={[styles.settingText, { color: colors.textPrimary }]}>{t("Share")}</Text>
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
            {t("privacy_policy")}
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
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },

  backButton: {
    padding: 4,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
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