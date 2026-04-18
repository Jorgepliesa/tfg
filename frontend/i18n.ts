import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Importamos los idiomas
import es from './locales/es.json';
import en from './locales/en.json';

const resources = {
  es: { translation: es },
  en: { translation: en },
};

// Obtenemos el idioma principal del dispositivo
// expo-localization devuelve un array en locales, cogemos el primero (ej: 'es-ES') y sacamos solo 'es'
const getDeviceLang = (): string => {
  if (Localization.getLocales && Localization.getLocales().length > 0) {
    const langCode = Localization.getLocales()[0].languageCode;
    return langCode ?? 'es';
  }
  return 'es';
};

i18n
  .use(initReactI18next) // pasa i18n directamente a react-i18next
  .init({
    resources,
    lng: getDeviceLang(), // idioma detectado de inicio
    fallbackLng: 'es', // idioma por defecto si no lo encuentra
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false, // React ya previene XSS de base
    },
  });

export default i18n;
