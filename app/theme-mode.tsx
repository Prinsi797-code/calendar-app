import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BannerAdSize,
  GAMBannerAd
} from 'react-native-google-mobile-ads';
import { useTheme } from '../contexts/ThemeContext';
import AdsManager from '../services/adsManager';

export default function ThemeMode() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { from } = useLocalSearchParams();
  const { theme, setTheme, colors } = useTheme();
  const { t } = useTranslation();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    Alert.alert(
      t("success"),
      newTheme === "light"
        ? t("light_theme_appleid")
        : t("dark_theme_appleid")
    );
  };
  const [bannerConfig, setBannerConfig] = useState<{
    show: boolean;
    id: string;
    position: string;
  } | null>(null);

  useEffect(() => {
    const config = AdsManager.getBannerConfig('home');
    setBannerConfig(config);
  }, []);

  const handleBackPress = async () => {
    await AdsManager.showBackButtonAd('theme-mode');
    if (searchParams?.from === "/theme-mode") {
      router.replace("/settings");
    } else {
      router.replace("/settings");
    }
  };

  // const handleBackPress = async () => {
  //   try {
  //     if (from === "notificationmore") {
  //       router.replace("/settings");
  //     } else {
  //       router.replace("/settings");
  //     }
  //   } catch (error) {
  //     console.error("Error showing back ad:", error);
  //     if (from === "notificationmore") {
  //       router.replace("/settings");
  //     } else {
  //       router.replace("/settings");
  //     }
  //   }
  // };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          {/* <Text style={[styles.backIcon, { color: colors.textPrimary }]}>←</Text> */}
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t("theme_mode_title")}</Text>
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
            <Text style={[styles.themeText, { color: colors.textPrimary }]}>{t("light_theme")}</Text>
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
            <Text style={[styles.themeText, { color: colors.textPrimary }]}>{t("dark_theme")}</Text>
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
      {bannerConfig?.show && (
        <View style={styles.stickyAdContainer}>
          <GAMBannerAd
            unitId={bannerConfig.id}
            sizes={[BannerAdSize.BANNER]}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stickyAdContainer: {
    // position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
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
    fontSize: 26,
    fontWeight: "600"
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: { width: 40 },

  content: { flex: 1, padding: 16 },

  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },

  themeInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  themeText: { fontSize: 16, fontWeight: '500' },

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
