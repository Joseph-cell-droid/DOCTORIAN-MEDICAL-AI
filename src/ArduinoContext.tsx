import React, { createContext, useContext, ReactNode } from 'react';
import { useArduino } from './hooks/useArduino';

export type ArduinoContextType = ReturnType<typeof useArduino>;

const DEFAULT_ARDUINO_FALLBACK: ArduinoContextType = {
  vitals: null,
  history: [],
  healthStatus: null,
  connection: { connected: false, type: null, deviceName: null },
  wifiEndpoint: 'http://192.168.1.100',
  setWifiEndpoint: () => {},
  connectBluetooth: async () => {},
  connectHealthWatch: async () => {},
  connectSerial: async () => {},
  connectWiFi: async () => {},
  connectWebSocket: () => {},
  disconnectWebSocket: () => {},
  triggerAlarm: async () => {},
  performGlobalTrace: async () => '',
  disconnect: async () => {},
  startDemo: () => {},
  simulateEmergency: () => {},
  startDnaSequencing: () => {},
  dnaStatus: { sequencing: false, progress: 0, markers: [], results: null },
  neuralInsight: null,
  neuralAlert: false,
  watchMetadata: null,
  error: null,
  updateVitals: () => {},
  setConnection: () => {},
  connectionLogs: [],
  addConnectionLog: () => {},
  injectRawTelemetry: () => {},
};

const ArduinoContext = createContext<ArduinoContextType>(DEFAULT_ARDUINO_FALLBACK);

export const ArduinoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const arduino = useArduino();
  return (
    <ArduinoContext.Provider value={arduino}>
      {children}
    </ArduinoContext.Provider>
  );
};

export const useArduinoContext = (): ArduinoContextType => {
  const context = useContext(ArduinoContext);
  return context || DEFAULT_ARDUINO_FALLBACK;
};

