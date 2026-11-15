import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  NearestHospitalResult,
  getSavedHospitalResult,
  saveHospitalResult,
  requestLiveGpsHospital,
  watchLiveGpsHospital,
  findNearestUgandanHospital,
  getNearbyHospitalsSorted,
  buildGoogleMapsDirectionsUrl,
  calculateBearingDegrees,
  calculateDistanceKm,
  buildDirectionGuidance,
  UGANDA_HOSPITALS,
  UGANDA_REGIONAL_CENTERS
} from '../services/ugandaHospitalGpsService';

export function useNearestHospital() {
  const [hospitalResult, setHospitalResult] = useState<NearestHospitalResult>(() => getSavedHospitalResult());
  const [isScanningGps, setIsScanningGps] = useState(false);
  const [isWatchingGps, setIsWatchingGps] = useState(false);
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

  // Optional continuous GPS watching
  useEffect(() => {
    if (!isWatchingGps) return;
    const stopWatch = watchLiveGpsHospital((nextRes) => {
      setHospitalResult(nextRes);
    });
    return () => stopWatch();
  }, [isWatchingGps]);

  // Live GPS scan
  const scanGps = useCallback(async () => {
    setIsScanningGps(true);
    setGpsError(null);
    try {
      const res = await requestLiveGpsHospital();
      setHospitalResult(res);
      if (!res.isGpsLive) {
        setGpsError('Phone GPS permission unavailable — select your city/district below.');
      } else {
        setIsWatchingGps(true);
      }
      return res;
    } catch (err: any) {
      setGpsError(err?.message || 'Failed to resolve GPS coordinates');
      return hospitalResult;
    } finally {
      setIsScanningGps(false);
    }
  }, [hospitalResult]);

  // Simulate or lock phone location to a Ugandan city/district (e.g., Lira, Gulu, Mbarara, Kampala)
  const selectDistrict = useCallback((districtKey: string) => {
    const center = UGANDA_REGIONAL_CENTERS[districtKey];
    if (center) {
      setIsWatchingGps(false);
      const res = findNearestUgandanHospital(center.lat, center.lon, false);
      saveHospitalResult(res);
      setHospitalResult(res);
      setGpsError(null);
      return res;
    }
    return hospitalResult;
  }, [hospitalResult]);

  // Select a specific hospital directly from current phone coordinates
  const selectHospitalById = useCallback((hospitalId: string) => {
    const target = UGANDA_HOSPITALS.find(h => h.id === hospitalId);
    if (target) {
      const fromLat = hospitalResult.coordinates?.latitude ?? target.latitude;
      const fromLon = hospitalResult.coordinates?.longitude ?? target.longitude;
      const distanceKm = calculateDistanceKm(fromLat, fromLon, target.latitude, target.longitude);
      const eta = Math.max(3, Math.round((distanceKm / 38) * 60 + 4));
      const bearing = calculateBearingDegrees(fromLat, fromLon, target.latitude, target.longitude);
      const { cardinal, directionText } = buildDirectionGuidance(target, distanceKm, bearing, eta);

      const res: NearestHospitalResult = {
        hospital: target,
        distanceKm,
        estimatedArrivalMins: eta,
        bearingDegrees: bearing,
        cardinal,
        directionText,
        googleMapsDirUrl: buildGoogleMapsDirectionsUrl(fromLat, fromLon, target.latitude, target.longitude),
        isGpsLive: hospitalResult.isGpsLive,
        coordinates: {
          latitude: fromLat,
          longitude: fromLon
        }
      };
      saveHospitalResult(res);
      setHospitalResult(res);
      return res;
    }
    return hospitalResult;
  }, [hospitalResult]);

  const nearbyHospitals = useMemo(() => {
    const lat = hospitalResult.coordinates?.latitude ?? 0.3476;
    const lon = hospitalResult.coordinates?.longitude ?? 32.5825;
    return getNearbyHospitalsSorted(lat, lon, 10);
  }, [hospitalResult.coordinates]);

  return {
    hospitalResult,
    hospital: hospitalResult.hospital,
    distanceKm: hospitalResult.distanceKm,
    estimatedArrivalMins: hospitalResult.estimatedArrivalMins,
    bearingDegrees: hospitalResult.bearingDegrees ?? 0,
    cardinal: hospitalResult.cardinal ?? 'N',
    directionText: hospitalResult.directionText ?? `Head toward ${hospitalResult.hospital.addressHint}`,
    googleMapsDirUrl: hospitalResult.googleMapsDirUrl,
    coordinates: hospitalResult.coordinates,
    isGpsLive: hospitalResult.isGpsLive,
    isWatchingGps,
    setIsWatchingGps,
    isScanningGps,
    gpsError,
    scanGps,
    selectDistrict,
    selectHospitalById,
    nearbyHospitals,
    allHospitals: UGANDA_HOSPITALS,
    allDistricts: Object.keys(UGANDA_REGIONAL_CENTERS)
  };
}
