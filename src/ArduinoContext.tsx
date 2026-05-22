import React, { createContext, useContext, ReactNode } from 'react';
import { useArduino } from './hooks/useArduino';

type ArduinoContextType = ReturnType<typeof useArduino>;

const ArduinoContext = createContext<ArduinoContextType | null>(null);

export const ArduinoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const arduino = useArduino();
  return (
    <ArduinoContext.Provider value={arduino}>
      {children}
    </ArduinoContext.Provider>
  );
};

export const useArduinoContext = () => {
  const context = useContext(ArduinoContext);
  if (!context) {
    throw new Error('useArduinoContext must be used within an ArduinoProvider');
  }
  return context;
};
