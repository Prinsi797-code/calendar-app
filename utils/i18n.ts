import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// import * as Localization from "react-native-localize";
import * as Localization from "expo-localization";

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

export const i18nInitPromise = (async () => {
    const savedLang = await AsyncStorage.getItem("appLanguage");
    const locales = Localization.getLocales();
    const defaultLang = savedLang || (locales[0]?.languageCode ?? "en");

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
            interpolation: { escapeValue: false },
        });
    return i18n;
})();

export default i18n;
