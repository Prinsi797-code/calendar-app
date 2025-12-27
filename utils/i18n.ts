import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "../locales/de.json";
import en from "../locales/en.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";
import hi from "../locales/hi.json";
import id from "../locales/id.json";
import it from "../locales/it.json";
import ko from "../locales/ko.json";
import pt from "../locales/pt.json";
import ru from "../locales/ru.json";
import zh from "../locales/zh.json";

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'hi', 'de', 'es', 'fr', 'id', 'it', 'ko', 'pt', 'ru', 'zh'];

export const i18nInitPromise = (async () => {
    try {
        console.log('🌍 Initializing i18n...');
        
        // Get saved language
        const savedLang = await AsyncStorage.getItem("appLanguage");
        console.log('💾 Saved language:', savedLang);
        
        // Get device language
        const locales = Localization.getLocales();
        const deviceLang = locales[0]?.languageCode ?? "en";
        console.log('📱 Device language:', deviceLang);
        
        // Determine which language to use
        let defaultLang = "en"; // Always default to English first
        
        if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
            // Use saved language if available
            defaultLang = savedLang;
            console.log('✅ Using saved language:', savedLang);
        } else if (SUPPORTED_LANGUAGES.includes(deviceLang)) {
            // Use device language if supported
            defaultLang = deviceLang;
            console.log('📱 Using device language:', deviceLang);
            // Save device language as default for first time
            await AsyncStorage.setItem("appLanguage", deviceLang);
        } else {
            // Fallback to English
            console.log('⚠️ Using fallback: English');
            await AsyncStorage.setItem("appLanguage", "en");
        }

        await i18n
            .use(initReactI18next)
            .init({
                compatibilityJSON: "v3",
                lng: defaultLang,
                fallbackLng: "en",
                resources: {
                    en: { translation: en },
                    hi: { translation: hi },
                    de: { translation: de }, 
                    es: { translation: es }, 
                    fr: { translation: fr }, 
                    id: { translation: id }, 
                    it: { translation: it }, 
                    ko: { translation: ko }, 
                    pt: { translation: pt },
                    ru: { translation: ru }, 
                    zh: { translation: zh }, 
                },
                interpolation: { 
                    escapeValue: false 
                },
                react: {
                    useSuspense: false, // Important!
                },
            });
        
        console.log('✅ i18n initialized successfully');
        console.log('Current language:', i18n.language);
        
        return i18n;
    } catch (error) {
        console.error('❌ Error initializing i18n:', error);
        // Fallback initialization
        await i18n
            .use(initReactI18next)
            .init({
                compatibilityJSON: "v3",
                lng: "en",
                fallbackLng: "en",
                resources: {
                    en: { translation: en },
                },
                interpolation: { escapeValue: false },
                react: { useSuspense: false },
            });
        return i18n;
    }
})();

export default i18n;