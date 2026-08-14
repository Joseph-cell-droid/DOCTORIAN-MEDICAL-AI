export interface DeviceCapabilities {
  os: 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'unknown';
  deviceType: 'desktop' | 'tablet' | 'mobile';
  isTouchDevice: boolean;
  hasBluetooth: boolean;
  hasWebRTC: boolean;
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
  hasGeolocation: boolean;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  recommendedAppType: 'Doctorian Doctor Desktop Workstation' | 'Doctorian Mobile Patient App' | 'Doctorian Web Workstation';
  primaryDownloadAction: 'download_exe' | 'install_pwa_android' | 'install_pwa';
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      os: 'unknown',
      deviceType: 'desktop',
      isTouchDevice: false,
      hasBluetooth: false,
      hasWebRTC: false,
      hasSpeechRecognition: false,
      hasSpeechSynthesis: false,
      hasGeolocation: false,
      screenWidth: 1280,
      screenHeight: 800,
      devicePixelRatio: 1,
      hardwareConcurrency: 4,
      maxTouchPoints: 0,
      recommendedAppType: 'Doctorian Doctor Desktop Workstation',
      primaryDownloadAction: 'download_exe',
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isWindows = /windows/i.test(ua);
  const isMac = /macintosh|mac os x/i.test(ua);
  const isLinux = /linux/i.test(ua) && !isAndroid;

  let os: 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'unknown' = 'unknown';
  if (isAndroid) os = 'android';
  else if (isIOS) os = 'ios';
  else if (isWindows) os = 'windows';
  else if (isMac) os = 'mac';
  else if (isLinux) os = 'linux';

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const isTouchDevice = 'ontouchstart' in window || maxTouchPoints > 0;

  let deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  if (isAndroid || isIOS) {
    deviceType = screenWidth >= 768 ? 'tablet' : 'mobile';
  } else if (screenWidth < 768) {
    deviceType = 'mobile';
  }

  const hasBluetooth = 'bluetooth' in navigator;
  const hasWebRTC = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
  const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  const hasSpeechSynthesis = 'speechSynthesis' in window;
  const hasGeolocation = 'geolocation' in navigator;

  let recommendedAppType: 'Doctorian Doctor Desktop Workstation' | 'Doctorian Mobile Patient App' | 'Doctorian Web Workstation' = 'Doctorian Doctor Desktop Workstation';
  let primaryDownloadAction: 'download_exe' | 'install_pwa_android' | 'install_pwa' = 'download_exe';

  if (isAndroid) {
    recommendedAppType = 'Doctorian Mobile Patient App';
    primaryDownloadAction = 'install_pwa_android';
  } else if (isIOS) {
    recommendedAppType = 'Doctorian Mobile Patient App';
    primaryDownloadAction = 'install_pwa';
  } else if (isWindows) {
    recommendedAppType = 'Doctorian Doctor Desktop Workstation';
    primaryDownloadAction = 'download_exe';
  } else {
    recommendedAppType = 'Doctorian Web Workstation';
    primaryDownloadAction = 'install_pwa';
  }

  return {
    os,
    deviceType,
    isTouchDevice,
    hasBluetooth,
    hasWebRTC,
    hasSpeechRecognition,
    hasSpeechSynthesis,
    hasGeolocation,
    screenWidth,
    screenHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    maxTouchPoints,
    recommendedAppType,
    primaryDownloadAction,
  };
}
