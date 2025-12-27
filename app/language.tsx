// app/language.tsx
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  BannerAdSize,
  GAMBannerAd
} from 'react-native-google-mobile-ads';
import { useTheme } from '../contexts/ThemeContext';
import AdsManager from '../services/adsManager';
import OnboardingService from '../services/OnboardingService';

const LANGUAGES = [{ code: "en", name: "English", flag: require("../assets/language/uk.png") }, { code: "pt", name: "Portuguese", flag: require("../assets/language/portugal.png") }, { code: "es", name: "Spanish", flag: require("../assets/language/spanish.png") }, { code: "fr", name: "French", flag: require("../assets/language/french.png") }, { code: "hi", name: "Hindi", flag: require("../assets/language/india.png") }, { code: "de", name: "German", flag: require("../assets/language/german.png") }, { code: "id", name: "Indonesian", flag: require("../assets/language/indonesia.png") }, { code: "zh", name: "Chinese", flag: require("../assets/language/china.png") }, { code: "ru", name: "Russian", flag: require("../assets/language/russia.png") }, { code: "ko", name: "Korean", flag: require("../assets/language/korean.png") }, { code: "it", name: "Italian", flag: require("../assets/language/italian.png") }];

export default function Language() {
  const router = useRouter();
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isFirstTime, setIsFirstTime] = useState(false);

  const [bannerConfig, setBannerConfig] = useState<{
    show: boolean;
    id: string;
    position: string;
  } | null>(null);

  useEffect(() => {
    const config = AdsManager.getBannerConfig('home');
    setBannerConfig(config);
  }, []);

  // Check if this is first time opening the app
  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const completed = await OnboardingService.isOnboardingCompleted();
        console.log('📱 Language screen - Onboarding completed:', completed);
        setIsFirstTime(!completed);

        // Set default language to English on first launch
        if (!completed) {
          setSelectedLanguage('en');
          await i18n.changeLanguage('en');
          console.log('🌍 First time launch - Default language set to English');
        } else {
          // Load saved language
          const savedLang = await OnboardingService.getLanguage();
          console.log('📱 Saved language:', savedLang);
          if (savedLang) {
            setSelectedLanguage(savedLang);
            await i18n.changeLanguage(savedLang);
          } else {
            setSelectedLanguage(i18n.language || 'en');
          }
        }
      } catch (error) {
        console.error('❌ Error checking first time:', error);
        setIsFirstTime(false);
      }
    };

    checkFirstTime();
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
  };

  const handleDone = async () => {
    try {
      console.log('✅ Done pressed - Selected language:', selectedLanguage);

      // Save selected language
      await i18n.changeLanguage(selectedLanguage);
      await OnboardingService.saveLanguage(selectedLanguage);
      console.log('✅ Language saved');

      if (isFirstTime) {
        // Mark onboarding as completed
        await OnboardingService.completeOnboarding();
        console.log('✅ Onboarding completed');

        // Show ad before navigating
        await AdsManager.showInterstitialAd('language_to_home');

        // Navigate to home (index.tsx) for first time users
        console.log('🏠 Navigating to home...');
        router.replace('/(tabs)');
      } else {
        // For returning users, just go back
        await AdsManager.showBackButtonAd('language');
        router.back();
      }
    } catch (error) {
      console.error('❌ Error in handleDone:', error);
      // Navigate anyway to prevent user from being stuck
      if (isFirstTime) {
        await OnboardingService.completeOnboarding();
        router.replace('/(tabs)');
      } else {
        router.back();
      }
    }
  };

  const handleBackPress = async () => {
    // Only allow back if not first time
    if (!isFirstTime) {
      await AdsManager.showBackButtonAd('language');
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        {/* Only show back button if not first time */}
        {!isFirstTime && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        <Text style={[styles.headerTitle, { color: colors.textPrimary, marginLeft: isFirstTime ? 16 : 0 }]}>
          Select Language
        </Text>

        <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
          <Text style={[styles.doneText, { color: colors.primary }]}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageItem,
              { backgroundColor: colors.cardBackground }
            ]}
            onPress={() => handleLanguageSelect(language.code)}
          >
            <View style={styles.languageLeft}>
              <Image source={language.flag} style={styles.flag} />
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, { color: colors.textPrimary }]}>
                  {language.name}
                </Text>
                <Text style={[styles.languageNative, { color: colors.textSecondary }]}>
                  {language.nativeName}
                </Text>
              </View>
            </View>

            {selectedLanguage === language.code ? (
              <Feather name="check-circle" size={24} color="#FF433A" />
            ) : (
              <Feather name="circle" size={24} color="#ccc" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {bannerConfig?.show && (
        <View style={styles.stickyAdContainer}>
          <GAMBannerAd
            unitId={bannerConfig.id}
            sizes={[BannerAdSize.FULL_BANNER]}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>
      )}
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
    paddingVertical: 12,
    // borderBottomWidth: 1,
    paddingTop: 60,
    // borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  doneButton: {
    padding: 8,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    width: 40,
    height: 30,
    borderRadius: 4,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  languageNative: {
    fontSize: 14,
  },
  stickyAdContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
});