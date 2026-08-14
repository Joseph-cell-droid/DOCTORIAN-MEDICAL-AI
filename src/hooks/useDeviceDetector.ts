import { useState, useEffect } from 'react';
import { detectDeviceCapabilities, DeviceCapabilities } from '../utils/deviceDetector';

export function useDeviceDetector(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() => detectDeviceCapabilities());

  useEffect(() => {
    const handleResize = () => {
      setCapabilities(detectDeviceCapabilities());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return capabilities;
}
