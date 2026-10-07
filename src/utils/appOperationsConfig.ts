export interface AppOperationsConfig {
  operatingMode: 'standard' | 'emergency' | 'ambulatory';
  toggles: {
    arduinoTelemetry: boolean;
    aiVoiceConsultation: boolean;
    hourlyHealthTips: boolean;
    biometricSafeAlerts: boolean;
    vitalAudioSonifier: boolean;
    offlineVaultSync: boolean;
    strict2FA: boolean;
    hapticFeedback: boolean;
  };
  telemetryRate: '100Hz' | '1Hz' | '0.1Hz';
  sessionTimeout: '15m' | '1h' | '8h' | '30d';
  lastUpdated: string;
}

export const DEFAULT_OPERATIONS_CONFIG: AppOperationsConfig = {
  operatingMode: 'standard',
  toggles: {
    arduinoTelemetry: true,
    aiVoiceConsultation: true,
    hourlyHealthTips: true,
    biometricSafeAlerts: true,
    vitalAudioSonifier: false,
    offlineVaultSync: true,
    strict2FA: false,
    hapticFeedback: true,
  },
  telemetryRate: '1Hz',
  sessionTimeout: '8h',
  lastUpdated: new Date().toISOString()
};

export const OPERATIONS_CONFIG_KEY = 'doctorian_app_operations_config';
export const OPERATIONS_CONFIG_EVENT = 'doctorian_operations_config_updated';

export function getOperationsConfig(): AppOperationsConfig {
  try {
    const raw = localStorage.getItem(OPERATIONS_CONFIG_KEY);
    if (!raw) return DEFAULT_OPERATIONS_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_OPERATIONS_CONFIG,
      ...parsed,
      toggles: {
        ...DEFAULT_OPERATIONS_CONFIG.toggles,
        ...(parsed.toggles || {})
      }
    };
  } catch (e) {
    console.error("Failed to load operations config:", e);
    return DEFAULT_OPERATIONS_CONFIG;
  }
}

export function saveOperationsConfig(config: Partial<AppOperationsConfig>): AppOperationsConfig {
  try {
    const current = getOperationsConfig();
    const updated: AppOperationsConfig = {
      ...current,
      ...config,
      toggles: {
        ...current.toggles,
        ...(config.toggles || {})
      },
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(OPERATIONS_CONFIG_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(OPERATIONS_CONFIG_EVENT, { detail: updated }));
    window.dispatchEvent(new Event('storage'));
    return updated;
  } catch (e) {
    console.error("Failed to save operations config:", e);
    return getOperationsConfig();
  }
}

export function resetOperationsConfig(): AppOperationsConfig {
  try {
    localStorage.setItem(OPERATIONS_CONFIG_KEY, JSON.stringify(DEFAULT_OPERATIONS_CONFIG));
    window.dispatchEvent(new CustomEvent(OPERATIONS_CONFIG_EVENT, { detail: DEFAULT_OPERATIONS_CONFIG }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}
  return DEFAULT_OPERATIONS_CONFIG;
}
