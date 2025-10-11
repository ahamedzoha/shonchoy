import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import globalTranslations from "../locales/en/global.json";

const resources = {
  en: {
    global: globalTranslations,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  ns: ["global"],
  defaultNS: "global",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
