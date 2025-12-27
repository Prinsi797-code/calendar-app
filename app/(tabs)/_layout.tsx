import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  BannerAdSize,
  GAMBannerAd
} from 'react-native-google-mobile-ads';
import { useTheme } from '../../contexts/ThemeContext';
import AdsManager from '../../services/adsManager';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t, i18n, ready } = useTranslation();
  const BANNER_HEIGHT = 60;
  
  const [bannerConfig, setBannerConfig] = useState<{
    show: boolean;
    id: string;
    position: string;
  } | null>(null);
  
  const [isAdsReady, setIsAdsReady] = useState(false);

  useEffect(() => {
    console.log('🔍 i18n ready:', ready);
    console.log('🔍 Current language:', i18n.language);
    console.log('🔍 Translation test:', {
      calendar: t('calendar'),
      Challenge: t('Challenge'),
      Memo: t('Memo'),
      Diary: t('Diary'),
    });
  }, [ready, i18n.language]);

  useEffect(() => {
    const onLanguageChanged = (lng: string) => {
      console.log('🌍 Language changed to:', lng);
    };

    i18n.on('languageChanged', onLanguageChanged);

    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, [i18n]);

  // Initialize ads
  useEffect(() => {
    const initAds = async () => {
      console.log('🚀 Initializing ads in tab layout...');
      await AdsManager.initializeAds();
      
      const config = AdsManager.getConfig();
      console.log('📋 Config loaded:', config);
      console.log('✅ Ads enabled:', AdsManager.isAdsEnabled());
      
      setIsAdsReady(true);
      
      const bannerCfg = AdsManager.getBannerConfig('home');
      setBannerConfig(bannerCfg);
    };
    
    initAds();
  }, []);

  const handleTabPress = async (routeName: string) => {
    if (!isAdsReady) {
      console.log('⏭️ Ads not ready yet');
      return;
    }
    
    console.log('🔍 Tab pressed:', routeName);
    console.log('🔍 Ads enabled:', AdsManager.isAdsEnabled());
    const result = await AdsManager.showSpaceAd(routeName);
    console.log('🔍 Ad show result:', result);
  };

  // Show loading if translations not ready
  if (!ready) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            paddingBottom: BANNER_HEIGHT,
            height: 60 + BANNER_HEIGHT,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
        screenListeners={{
          tabPress: (e) => {
            const routeName = e.target?.split('-')[0] || '';
            handleTabPress(routeName);
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("calendar"),
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
  stickyAdContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
});