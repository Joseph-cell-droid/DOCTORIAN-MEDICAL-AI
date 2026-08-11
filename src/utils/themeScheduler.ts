/**
 * Doctorian Medical AI - Solar & Circadian Theme Scheduler Utility
 * Automatically toggles Light/Dark Mode and Eye-Care Tint based on:
 * 1. Open-Meteo Solar API (Live Sunrise/Sunset for user geolocation)
 * 2. Mathematical Solar Position approximation fallback
 * 3. Custom user schedule & Circadian late-night eye care thresholds
 */

export interface ThemeSchedulerConfig {
  enabled: boolean;
  mode: 'solar' | 'custom' | 'circadian';
  customSunrise: string; // HH:mm
  customSunset: string;  // HH:mm
  autoEyeCare: boolean;
  eyeCareStart: string;  // HH:mm
  eyeCareEnd: string;    // HH:mm
  latitude?: number;
  longitude?: number;
  cachedSunrise?: string; // ISO string
  cachedSunset?: string;  // ISO string
  lastFetchedDate?: string; // YYYY-MM-DD
}

export interface SolarEvaluationResult {
  isDarkMode: boolean;
  isEyeCareMode: boolean;
  phaseName: 'Daylight' | 'Twilight/Sunset' | 'Night' | 'Late Night Circadian';
  sunriseTimeStr: string;
  sunsetTimeStr: string;
  eyeCareStartStr: string;
  eyeCareEndStr: string;
  nextChangeMessage: string;
}

const STORAGE_KEY = 'doctorian_theme_scheduler_config_v1';

export const DEFAULT_THEME_SCHEDULER_CONFIG: ThemeSchedulerConfig = {
  enabled: true,
  mode: 'solar',
  customSunrise: '06:30',
  customSunset: '19:30',
  autoEyeCare: true,
  eyeCareStart: '21:00',
  eyeCareEnd: '06:30',
  latitude: 37.7749,
  longitude: -122.4194
};

export const getThemeSchedulerConfig = (): ThemeSchedulerConfig => {
  if (typeof localStorage === 'undefined') return DEFAULT_THEME_SCHEDULER_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_THEME_SCHEDULER_CONFIG, ...JSON.parse(raw) } : DEFAULT_THEME_SCHEDULER_CONFIG;
  } catch (e) {
    return DEFAULT_THEME_SCHEDULER_CONFIG;
  }
};

export const saveThemeSchedulerConfig = (updates: Partial<ThemeSchedulerConfig>): ThemeSchedulerConfig => {
  const current = getThemeSchedulerConfig();
  const next = { ...current, ...updates };
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Storage write error', e);
    }
  }
  return next;
};

/**
 * Fetch solar sunrise & sunset times for a latitude/longitude via Open-Meteo
 */
export const fetchSolarTimes = async (lat: number, lon: number): Promise<{ sunrise: Date; sunset: Date } | null> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data && data.daily && data.daily.sunrise && data.daily.sunset) {
      const sunriseStr = data.daily.sunrise[0];
      const sunsetStr = data.daily.sunset[0];
      const sunrise = new Date(sunriseStr);
      const sunset = new Date(sunsetStr);

      const todayStr = new Date().toISOString().split('T')[0];
      saveThemeSchedulerConfig({
        latitude: lat,
        longitude: lon,
        cachedSunrise: sunrise.toISOString(),
        cachedSunset: sunset.toISOString(),
        lastFetchedDate: todayStr
      });

      return { sunrise, sunset };
    }
  } catch (err) {
    console.warn('[Theme Scheduler] Failed to fetch solar API, using fallback:', err);
  }
  return null;
};

/**
 * Parses "HH:mm" time string into a Date object for today
 */
const parseTimeToDateToday = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(n => parseInt(n, 10));
  const d = new Date();
  d.setHours(hours || 0, minutes || 0, 0, 0);
  return d;
};

/**
 * Formats a Date object into local time "06:30 AM"
 */
export const formatTimeDisplay = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Evaluates current time against solar/custom schedule rules
 */
export const evaluateThemeSchedule = (
  now: Date = new Date(),
  config: ThemeSchedulerConfig = getThemeSchedulerConfig()
): SolarEvaluationResult => {
  const todayStr = now.toISOString().split('T')[0];

  // Determine Sunrise & Sunset
  let sunriseDate: Date;
  let sunsetDate: Date;

  if (config.mode === 'solar') {
    if (config.cachedSunrise && config.cachedSunset && config.lastFetchedDate === todayStr) {
      sunriseDate = new Date(config.cachedSunrise);
      sunsetDate = new Date(config.cachedSunset);
    } else {
      // Offline / default solar approximation
      sunriseDate = parseTimeToDateToday(config.customSunrise || '06:30');
      sunsetDate = parseTimeToDateToday(config.customSunset || '19:30');
    }
  } else {
    sunriseDate = parseTimeToDateToday(config.customSunrise || '06:30');
    sunsetDate = parseTimeToDateToday(config.customSunset || '19:30');
  }

  // Parse Eye Care Schedule
  const eyeCareStartDate = parseTimeToDateToday(config.eyeCareStart || '21:00');
  const eyeCareEndDate = parseTimeToDateToday(config.eyeCareEnd || '06:30');

  const nowMs = now.getTime();
  const sunriseMs = sunriseDate.getTime();
  const sunsetMs = sunsetDate.getTime();

  // Check if current time is Dark (before sunrise or after sunset)
  const isDarkMode = nowMs < sunriseMs || nowMs >= sunsetMs;

  // Check if Eye Care is active (between eyeCareStart and eyeCareEnd, spanning midnight if start > end)
  let isEyeCareMode = false;
  if (config.autoEyeCare) {
    const startMs = eyeCareStartDate.getTime();
    const endMs = eyeCareEndDate.getTime();

    if (startMs > endMs) {
      // Spans midnight e.g. 21:00 to 06:30
      isEyeCareMode = nowMs >= startMs || nowMs < endMs;
    } else {
      isEyeCareMode = nowMs >= startMs && nowMs < endMs;
    }
  }

  // Determine Phase Name & Next Change
  let phaseName: SolarEvaluationResult['phaseName'] = 'Daylight';
  let nextChangeMessage = '';

  if (isEyeCareMode) {
    phaseName = 'Late Night Circadian';
    nextChangeMessage = `Eye Care mode active until ${formatTimeDisplay(eyeCareEndDate)}`;
  } else if (isDarkMode) {
    phaseName = 'Night';
    nextChangeMessage = `Dark mode active. Daylight scheduled for ${formatTimeDisplay(sunriseDate)}`;
  } else {
    phaseName = 'Daylight';
    nextChangeMessage = `Light mode active. Sunset scheduled for ${formatTimeDisplay(sunsetDate)}`;
  }

  return {
    isDarkMode,
    isEyeCareMode,
    phaseName,
    sunriseTimeStr: formatTimeDisplay(sunriseDate),
    sunsetTimeStr: formatTimeDisplay(sunsetDate),
    eyeCareStartStr: formatTimeDisplay(eyeCareStartDate),
    eyeCareEndStr: formatTimeDisplay(eyeCareEndDate),
    nextChangeMessage
  };
};
