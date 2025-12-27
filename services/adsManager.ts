import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
    AdEventType,
    AppOpenAd,
    InterstitialAd,
    TestIds,
} from 'react-native-google-mobile-ads';
import { fetchAppConfig } from '../utils/firebaseConfig';

interface AdConfig {
  android_app_open_id: string;
  ios_app_open_id: string;
  android_interstitial_id: string;
  ios_interstitial_id: string;
  android_banner_id: string;
  ios_banner_id: string;
  picker_ads: boolean;
  back_button_ads?: { show: boolean; frequency: number };
  splash_screen?: {
    show_ads: boolean;
    ad_type: string;
    frequency: number;
  };
  space_ads?: {
    show: boolean;
    frequency: number;
  };
  language_screen?: {
    show_banner: boolean;
    banner_position: string;
  };
  home_screen?: {
    show_banner: boolean;
    banner_position: string;
  };
  setting_screen?: {
    show_banner: boolean;
    banner_position: string;
  };
  giveaway_rules_screen?: {
    show_banner: boolean;
    banner_position: string;
  };
  interstitial_config?: {
    splash_to_language?: { show: boolean; frequency: number };
    language_to_home?: { show: boolean; frequency: number };
    setting_back_click?: { show: boolean; frequency: number };
  };
}

class AdsManager {
  private static instance: AdsManager;
  private config: AdConfig | null = null;
  private appOpenAd: AppOpenAd | null = null;
  private interstitialAd: InterstitialAd | null = null;
  private isShowingAd = false;
  private isConfigLoaded = false;
  private isInterstitialLoaded = false; // NEW: Track if ad is loaded

  // Ad frequency tracking keys
  private readonly APP_OPEN_SHOWN_KEY = 'app_open_ad_shown';
  private readonly INTERSTITIAL_COUNT_KEY = 'interstitial_ad_count';
  private readonly BACK_AD_LAST_SHOWN_KEY = 'back_ad_last_shown';
  private readonly SPACE_AD_LAST_SHOWN_KEY = 'space_ad_last_shown';
  private readonly SPACE_AD_SHOWN_KEY = 'space_ad_shown';
  private readonly SCREEN_VISIT_PREFIX = 'screen_visit_';

  private sessionAdsShown: Set<string> = new Set();
  
  private recentAdShown: { screenName: string; timestamp: number } | null = null;
  private readonly AD_COOLDOWN_MS = 30000;

  private constructor() {}

  static getInstance(): AdsManager {
    if (!AdsManager.instance) {
      AdsManager.instance = new AdsManager();
    }
    return AdsManager.instance;
  }

  // ==================== LOAD CONFIG FROM FIREBASE ====================
  async loadConfigFromFirebase(): Promise<boolean> {
    try {
      console.log('📥 Loading ad config from Firebase...');
      const firebaseConfig = await fetchAppConfig();
      
      if (firebaseConfig) {
        this.config = firebaseConfig as AdConfig;
        this.isConfigLoaded = true;
        console.log('✅ Firebase ad config loaded:', this.config);
        return true;
      } else {
        console.log('⚠️ No Firebase config found');
        this.isConfigLoaded = false;
        return false;
      }
    } catch (error) {
      console.log('❌ Failed to load Firebase config:', error);
      this.isConfigLoaded = false;
      return false;
    }
  }

  setConfig(config: AdConfig) {
    this.config = config;
    this.isConfigLoaded = true;
    console.log('🎯 Ads Config Set:', config);
  }

  private getAdUnitId(type: 'app_open' | 'interstitial' | 'banner'): string {
    if (!this.config) {
      console.log('⚠️ No config found, using test IDs');
      return TestIds.BANNER;
    }

    let adId: string | undefined;

    if (type === 'app_open') {
      adId = Platform.OS === 'ios' 
        ? this.config.ios_app_open_id 
        : this.config.android_app_open_id;
    } else if (type === 'interstitial') {
      adId = Platform.OS === 'ios'
        ? this.config.ios_interstitial_id
        : this.config.android_interstitial_id;
    } else if (type === 'banner') {
      adId = Platform.OS === 'ios'
        ? this.config.ios_banner_id
        : this.config.android_banner_id;
    }

    console.log(`📱 Getting ${type} ad ID for ${Platform.OS}:`, adId);
    return adId || TestIds.BANNER;
  }

  isAdsEnabled(): boolean {
    const enabled = this.config?.picker_ads === true;
    console.log('🔍 Ads enabled check:', enabled, 'Config:', this.config);
    return enabled;
  }

  isConfigReady(): boolean {
    return this.isConfigLoaded;
  }

  // ==================== APP OPEN AD ====================
  async loadAppOpenAd() {
    if (!this.isAdsEnabled()) {
      console.log('⏭️ App open ads disabled');
      return;
    }

    const adUnitId = this.getAdUnitId('app_open');

    try {
      this.appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('✅ App Open Ad Loaded');
      });

      this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('App Open Ad Closed');
        this.isShowingAd = false;
        this.loadAppOpenAd();
      });

      this.appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('❌ App Open Ad Error:', error);
        this.isShowingAd = false;
      });

      this.appOpenAd.load();
    } catch (error) {
      console.log('App Open Ad Load Failed:', error);
    }
  }

  async showAppOpenAd(): Promise<boolean> {
    if (!this.isAdsEnabled() || this.isShowingAd) return false;

    const splashConfig = this.config?.splash_screen;
    if (!splashConfig?.show_ads) return false;

    const lastShown = await AsyncStorage.getItem(this.APP_OPEN_SHOWN_KEY);
    const frequency = splashConfig.frequency || 1;

    if (frequency === 1 && lastShown) {
      console.log('App Open Ad already shown (lifetime)');
      return false;
    }

    if (frequency === 2 && lastShown) {
      const lastDate = new Date(lastShown).toDateString();
      const today = new Date().toDateString();
      if (lastDate === today) {
        console.log('App Open Ad already shown today');
        return false;
      }
    }

    if (this.appOpenAd) {
      try {
        this.isShowingAd = true;
        await this.appOpenAd.show();
        await AsyncStorage.setItem(this.APP_OPEN_SHOWN_KEY, new Date().toISOString());
        console.log('✅ App Open Ad Shown');
        return true;
      } catch (error) {
        console.log('❌ App Open Ad Show Failed:', error);
        this.isShowingAd = false;
        return false;
      }
    }
    return false;
  }

  // ==================== INTERSTITIAL AD ====================
  async loadInterstitialAd() {
    if (!this.isAdsEnabled()) {
      console.log('⏭️ Interstitial ads disabled');
      return;
    }

    const adUnitId = this.getAdUnitId('interstitial');
    console.log('🔄 Loading interstitial ad with ID:', adUnitId);

    try {
      this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        this.isInterstitialLoaded = true;
        console.log('✅ Interstitial Ad Loaded and Ready');
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Interstitial Ad Closed');
        this.isShowingAd = false;
        this.isInterstitialLoaded = false;
        // Reload ad for next time
        setTimeout(() => this.loadInterstitialAd(), 1000);
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('❌ Interstitial Ad Error:', error);
        this.isShowingAd = false;
        this.isInterstitialLoaded = false;
        // Retry loading after error
        setTimeout(() => this.loadInterstitialAd(), 5000);
      });

      this.interstitialAd.load();
    } catch (error) {
      console.log('Interstitial Ad Load Failed:', error);
      this.isInterstitialLoaded = false;
    }
  }

  async showInterstitialAd(route?: string): Promise<boolean> {
    console.log('🎬 Attempting to show interstitial ad for route:', route);
    console.log('   - Ads enabled:', this.isAdsEnabled());
    console.log('   - Is showing ad:', this.isShowingAd);
    console.log('   - Is loaded:', this.isInterstitialLoaded);

    if (!this.isAdsEnabled() || this.isShowingAd) {
      console.log('⏭️ Cannot show: ads disabled or already showing');
      return false;
    }

    if (!this.isInterstitialLoaded || !this.interstitialAd) {
      console.log('⏭️ Ad not loaded yet');
      return false;
    }

    const interstitialConfig = this.config?.interstitial_config;

    if (route && interstitialConfig) {
      const routeConfig = interstitialConfig[route as keyof typeof interstitialConfig];
      if (routeConfig && !routeConfig.show) {
        console.log('⏭️ Route config disabled for:', route);
        return false;
      }
    }

    try {
      this.isShowingAd = true;
      await this.interstitialAd.show();

      const count = await AsyncStorage.getItem(this.INTERSTITIAL_COUNT_KEY);
      const newCount = (parseInt(count || '0') + 1).toString();
      await AsyncStorage.setItem(this.INTERSTITIAL_COUNT_KEY, newCount);

      console.log('✅ Interstitial Ad Shown');
      return true;
    } catch (error) {
      console.log('❌ Interstitial Ad Show Failed:', error);
      this.isShowingAd = false;
      return false;
    }
  }

  // ==================== SPACE AD (TAB NAVIGATION) ====================
  async showSpaceAd(screenName: string): Promise<boolean> {
    console.log('🎬 Attempting to show space ad for:', screenName);
    console.log('   - Ads enabled:', this.isAdsEnabled());
    console.log('   - Is showing ad:', this.isShowingAd);
    console.log('   - Is loaded:', this.isInterstitialLoaded);

    if (!this.isAdsEnabled()) {
      console.log('⏭️ Ads disabled in config');
      return false;
    }

    if (this.isShowingAd) {
      console.log('⏭️ Already showing an ad');
      return false;
    }

    const spaceAdsConfig = this.config?.space_ads;
    if (!spaceAdsConfig?.show) {
      console.log('⏭️ Space ads disabled in config');
      return false;
    }

    console.log('🎯 Space ads config:', spaceAdsConfig);
    const frequency = spaceAdsConfig.frequency || 0;

    if (frequency === 0) {
      console.log('⏭️ Space ads frequency set to 0, skipping');
      return false;
    }

    if (frequency === 1) {
      const hasShown = await AsyncStorage.getItem(this.SPACE_AD_SHOWN_KEY);
      if (hasShown) {
        console.log('⏭️ Space ad already shown once (lifetime)');
        return false;
      }
    }

    if (frequency === 2) {
      const lastShown = await AsyncStorage.getItem(this.SPACE_AD_LAST_SHOWN_KEY);
      if (lastShown) {
        const lastDate = new Date(lastShown).toDateString();
        const today = new Date().toDateString();
        if (lastDate === today) {
          console.log('⏭️ Space ad already shown today');
          return false;
        }
      }
    }

    if (!this.isInterstitialLoaded || !this.interstitialAd) {
      console.log('⚠️ No interstitial ad loaded yet');
      return false;
    }

    try {
      this.isShowingAd = true;
      await this.interstitialAd.show();

      if (frequency === 1) {
        await AsyncStorage.setItem(this.SPACE_AD_SHOWN_KEY, 'true');
      }

      if (frequency === 2) {
        await AsyncStorage.setItem(this.SPACE_AD_LAST_SHOWN_KEY, new Date().toISOString());
      }

      console.log(`✅ Space ad shown for ${screenName}`);
      return true;
    } catch (error) {
      console.log('❌ Space ad show failed:', error);
      this.isShowingAd = false;
      return false;
    }
  }

  // ==================== BACK BUTTON AD ====================
  async trackScreenVisit(screenName: string) {
    const key = `${this.SCREEN_VISIT_PREFIX}${screenName}`;
    await AsyncStorage.setItem(key, new Date().toISOString());
    console.log(`📍 Tracked visit to: ${screenName}`);
  }

  private async isFirstVisit(screenName: string): Promise<boolean> {
    const key = `${this.SCREEN_VISIT_PREFIX}${screenName}`;
    const lastVisit = await AsyncStorage.getItem(key);
    return !lastVisit;
  }

  private isAdInCooldown(): boolean {
    if (!this.recentAdShown) return false;
    
    const now = Date.now();
    const timeSinceLastAd = now - this.recentAdShown.timestamp;
    
    if (timeSinceLastAd < this.AD_COOLDOWN_MS) {
      console.log(`⏭️ Ad cooldown active (${Math.round((this.AD_COOLDOWN_MS - timeSinceLastAd) / 1000)}s remaining)`);
      return true;
    }
    
    this.recentAdShown = null;
    return false;
  }

  async showBackButtonAd(screenName: string): Promise<boolean> {
    console.log('🎬 Attempting to show back button ad for:', screenName);
    
    if (!this.isAdsEnabled() || this.isShowingAd) {
      console.log('⏭️ Ads disabled or already showing');
      return false;
    }

    if (this.isAdInCooldown()) {
      console.log('⏭️ Skipping ad due to recent ad shown in navigation flow');
      return false;
    }

    const backAdsConfig = this.config?.back_button_ads;
    if (!backAdsConfig?.show) {
      console.log('⏭️ Back button ads disabled in config');
      return false;
    }

    console.log('🎯 Back button ads config:', backAdsConfig);
    const frequency = backAdsConfig.frequency || 1;

    if (frequency === 0) {
      console.log('⏭️ Back button ads frequency set to 0, skipping');
      return false;
    }

    if (frequency === 1) {
      const isFirst = await this.isFirstVisit(screenName);
      if (!isFirst) {
        console.log(`⏭️ Not first visit to ${screenName}, skipping ad`);
        return false;
      }
    }

    if (frequency === 3) {
      const lastShown = await AsyncStorage.getItem(this.BACK_AD_LAST_SHOWN_KEY);
      if (lastShown) {
        const lastDate = new Date(lastShown).toDateString();
        const today = new Date().toDateString();
        if (lastDate === today) {
          console.log('⏭️ Back button ad already shown today');
          return false;
        }
      }
    }

    if (frequency === 4) {
      if (this.sessionAdsShown.has(screenName)) {
        console.log(`⏭️ Ad already shown for ${screenName} in this session`);
        return false;
      }
    }

    if (!this.isInterstitialLoaded || !this.interstitialAd) {
      console.log('⚠️ No interstitial ad loaded');
      return false;
    }

    try {
      this.isShowingAd = true;
      
      return new Promise<boolean>((resolve) => {
        const closedListener = this.interstitialAd?.addAdEventListener(
          AdEventType.CLOSED,
          async () => {
            console.log('Back button ad closed');
            this.isShowingAd = false;
            
            this.recentAdShown = {
              screenName,
              timestamp: Date.now()
            };
            
            if (frequency === 1) {
              await this.trackScreenVisit(screenName);
            }
            
            if (frequency === 3) {
              await AsyncStorage.setItem(this.BACK_AD_LAST_SHOWN_KEY, new Date().toISOString());
            }

            if (frequency === 4) {
              this.sessionAdsShown.add(screenName);
            }

            if (closedListener) {
              closedListener();
            }

            this.loadInterstitialAd();
            
            console.log(`✅ Back button ad shown for ${screenName}`);
            resolve(true);
          }
        );

        this.interstitialAd?.show().catch((error) => {
          console.log('❌ Back button ad show failed:', error);
          this.isShowingAd = false;
          if (closedListener) {
            closedListener();
          }
          resolve(false);
        });
      });
    } catch (error) {
      console.log('❌ Back button ad show failed:', error);
      this.isShowingAd = false;
      return false;
    }
  }

  // ==================== BANNER AD CONFIG ====================
  getBannerConfig(screen: string): { show: boolean; id: string; position: string } | null {
    if (!this.isAdsEnabled()) return null;

    const screenConfig = this.config?.[`${screen}_screen` as keyof AdConfig];

    if (screenConfig && typeof screenConfig === 'object' && 'show_banner' in screenConfig) {
      const config = screenConfig as { show_banner?: boolean; banner_position?: string };
      if (config.show_banner) {
        return {
          show: true,
          id: this.getAdUnitId('banner'),
          position: config.banner_position || 'bottom',
        };
      }
    }
    return null;
  }

  // ==================== SESSION MANAGEMENT ====================
  clearSessionData() {
    this.sessionAdsShown.clear();
    this.recentAdShown = null;
    console.log('🔄 Session data cleared');
  }

  // NEW: Reset isShowingAd flag (safety net)
  resetAdState() {
    this.isShowingAd = false;
    console.log('🔄 Ad state reset');
  }

  // ==================== INITIALIZATION ====================
  async initializeAds() {
    console.log('🚀 Initializing Ads...');
    
    const configLoaded = await this.loadConfigFromFirebase();
    
    if (!configLoaded) {
      console.log('⚠️ Failed to load Firebase config');
      return;
    }

    console.log('📋 Config after loading:', this.config);
    
    if (!this.isAdsEnabled()) {
      console.log('⚠️ Ads are disabled in config');
      console.log('   picker_ads value:', this.config?.picker_ads);
      return;
    }

    console.log('✅ Starting ad loading...');
    this.loadAppOpenAd();
    this.loadInterstitialAd();
  }
  
  // NEW: Get current config for debugging
  getConfig() {
    return this.config;
  }
}

export default AdsManager.getInstance();