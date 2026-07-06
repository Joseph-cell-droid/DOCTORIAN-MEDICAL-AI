import { useEffect } from 'react';

export const mapBrowserLanguageToAppLanguage = (browserLang: string): string => {
  const code = browserLang.toLowerCase();
  
  // Specific country-level or region-level matches first
  if (code.startsWith('en-gb') || code.startsWith('en-uk') || code.startsWith('en-nz') || code.startsWith('en-au')) {
    return 'English (UK)';
  }
  if (code.startsWith('en')) {
    return 'English (US)';
  }
  if (code.startsWith('es')) {
    return 'Spanish';
  }
  if (code.startsWith('fr')) {
    return 'French';
  }
  if (code.startsWith('de')) {
    return 'German';
  }
  if (code.startsWith('zh')) {
    return 'Chinese';
  }
  if (code.startsWith('hi')) {
    return 'Hindi';
  }
  if (code.startsWith('ar')) {
    return 'Arabic';
  }
  if (code.startsWith('pt')) {
    return 'Portuguese';
  }
  if (code.startsWith('sw')) {
    return 'Swahili';
  }
  if (code.startsWith('lg') || code.startsWith('lug')) {
    return 'Luganda';
  }
  if (code.startsWith('ru')) {
    return 'Russian';
  }
  if (code.startsWith('ja')) {
    return 'Japanese';
  }
  if (code.startsWith('ko')) {
    return 'Korean';
  }
  if (code.startsWith('it')) {
    return 'Italian';
  }
  if (code.startsWith('tr')) {
    return 'Turkish';
  }
  
  // Local/regional Ugandan mappings
  if (code.startsWith('nyn') || code.startsWith('run')) {
    return 'Runyankole-Rukiga';
  }
  if (code.startsWith('ach')) {
    return 'Acholi-Luo';
  }
  if (code.startsWith('lag') || code.startsWith('langi')) {
    return 'Langi';
  }
  if (code.startsWith('teo') || code.startsWith('iteso')) {
    return 'Iteso';
  }
  if (code.startsWith('xog') || code.startsWith('lusoga')) {
    return 'Lusoga';
  }
  if (code.startsWith('lgg') || code.startsWith('lugbara')) {
    return 'Lugbara';
  }
  if (code.startsWith('nyr') || code.startsWith('runyoro')) {
    return 'Runyoro-Rutooro';
  }
  if (code.startsWith('kon') || code.startsWith('rukonjo')) {
    return 'Rukonjo';
  }
  if (code.startsWith('luy') || code.startsWith('samia')) {
    return 'Samia';
  }
  if (code.startsWith('kdj') || code.startsWith('karamojong')) {
    return 'Karamojong';
  }

  return 'English (US)'; // Default fallback
};

interface UseAutoLanguageSetupProps {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  downloadedLanguages: string[];
  handleDownloadLanguage: (langName: string) => void;
  setToast: (toast: { message: string; type: 'success' | 'info' | 'error' } | null) => void;
}

export function useAutoLanguageSetup({
  currentLanguage,
  setCurrentLanguage,
  downloadedLanguages,
  handleDownloadLanguage,
  setToast,
}: UseAutoLanguageSetupProps) {
  useEffect(() => {
    // Check if the user has already manually configured or had their language initialized
    const savedLang = localStorage.getItem("app_lang");
    if (savedLang) {
      return; // Do nothing if language is already initialized/saved
    }

    if (typeof window === 'undefined' || !navigator) return;

    // Retrieve browser languages
    const browserLanguages = navigator.languages && navigator.languages.length > 0 
      ? navigator.languages 
      : [navigator.language || (navigator as any).userLanguage || 'en-US'];

    // Map the primary browser language to supported clinical languages
    const detectedLangCode = browserLanguages[0];
    const mappedLang = mapBrowserLanguageToAppLanguage(detectedLangCode);

    // If mapped language matches default or is English (US) / English (UK), we just set it directly
    if (mappedLang === 'English (US)' || mappedLang === 'English (UK)') {
      setCurrentLanguage(mappedLang);
      localStorage.setItem("app_lang", mappedLang);
      
      // Notify user about the automatic language match
      setToast({
        message: `🌐 Browser language detected (${detectedLangCode}). Interface set to ${mappedLang}.`,
        type: 'success'
      });
    } else {
      // For any non-English language, we set the active language and download the offline MarianMT package
      setCurrentLanguage(mappedLang);
      localStorage.setItem("app_lang", mappedLang);

      const isDownloaded = downloadedLanguages.includes(mappedLang);
      if (!isDownloaded) {
        // Trigger the MarianMT translation pack download on first load for onboarding smoothness!
        handleDownloadLanguage(mappedLang);
        setToast({
          message: `🌐 Auto-detected language: ${mappedLang}. Downloading offline MarianMT translation package for a smooth offline experience...`,
          type: 'info'
        });
      } else {
        setToast({
          message: `🌐 Auto-detected language: ${mappedLang}. Offline translation model package is already compiled.`,
          type: 'success'
        });
      }
    }
  }, []);
}
