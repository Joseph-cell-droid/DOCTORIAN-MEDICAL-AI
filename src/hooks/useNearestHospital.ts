import { useState, useEffect, useCallback } from 'react';
import { 
  NearestHospitalResult, 
  getSavedHospitalResult, 
  saveHospitalResult, 
  requestLiveGpsHospital, 
  findNearestUgandanHospital,
  UGANDA_HOSPITALS,
  UGANDA_REGIONAL_CENTERS,
  UgandaHospital 
} from '../services/ugandaHospitalGpsService';

export function useNearestHospital() {
  const [hospitalResult, setHospitalResult] = useState<NearestHospitalResult>(() => getSavedHospitalResult());
  const [isScanningGps, setIsScanningGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Sync with cross-component custom events
  useEffect(() => {
    const handleHospitalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<NearestHospitalResult>;
      if (customEvent.detail) {
        setHospitalResult(customEvent.detail);
      }
    };

    window.addEventListener('doctorian_hospital_updated', handleHospitalUpdate);
    return () => {
      window.removeEventListener('doctorian_hospital_updated', handleHospitalUpdate);
    };
  }, []);

  // Live GPS scan
  const scanGps = useCallback(async () => {
    setIsScanningGps(true);
    setGpsError(null);
    try {
      const res = await requestLiveGpsHospital();
      setHospitalResult(res);
      if (!res.isGpsLive) {
        setGpsError('GPS permission not granted. Operating on regional preset mode.');
      }
      return res;
    } catch (err: any) {
      setGpsError(err?.message || 'Failed to resolve GPS coordinates');
      return hospitalResult;
    } finally {
      setIsScanningGps(false);
    }
  }, [hospitalResult]);

  // Manual district override (e.g. user selects Gulu, Mbarara, Jinja, Mbale, etc.)
  const selectDistrict = useCallback((districtKey: string) => {
    const center = UGANDA_REGIONAL_CENTERS[districtKey];
    if (center) {
      const res = findNearestUgandanHospital(center.lat, center.lon, false);
      saveHospitalResult(res);
      setHospitalResult(res);
      setGpsError(null);
      return res;
    }
    return hospitalResult;
  }, [hospitalResult]);

  // Select a specific hospital directly
  const selectHospitalById = useCallback((hospitalId: string) => {
    const target = UGANDA_HOSPITALS.find(h => h.id === hospitalId);
    if (target) {
      const res: NearestHospitalResult = {
        hospital: target,
        distanceKm: 0.5,
        estimatedArrivalMins: 3,
        isGpsLive: false,
        coordinates: {
          latitude: target.latitude,
          longitude: target.longitude
        }
      };
      saveHospitalResult(res);
      setHospitalResult(res);
      return res;
    }
    return hospitalResult;
  }, [hospitalResult]);

  return {
    hospitalResult,
    hospital: hospitalResult.hospital,
    distanceKm: hospitalResult.distanceKm,
    estimatedArrivalMins: hospitalResult.estimatedArrivalMins,
    isGpsLive: hospitalResult.isGpsLive,
    isScanningGps,
    gpsError,
    scanGps,
    selectDistrict,
    selectHospitalById,
    allHospitals: UGANDA_HOSPITALS,
    allDistricts: Object.keys(UGANDA_REGIONAL_CENTERS)
  };
}
