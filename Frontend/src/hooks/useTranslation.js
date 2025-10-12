import { useSelector } from 'react-redux';
import { HINDI_TRANSLATIONS } from '../constants/hindiTranslations';

export const useTranslation = () => {
  const { currentLanguage } = useSelector((state) => state.language);

  const t = (key, fallback = '') => {
    if (currentLanguage === 'hi') {
      const keys = key.split('.');
      let value = HINDI_TRANSLATIONS;
      
      for (const k of keys) {
        if (value && value[k] !== undefined) {
          value = value[k];
        } else {
          return fallback || key;
        }
      }
      return value;
    }
    
    return fallback || key;
  };

  return { t, currentLanguage };
};