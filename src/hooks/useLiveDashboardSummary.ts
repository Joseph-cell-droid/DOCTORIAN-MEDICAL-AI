import { useState, useEffect, useCallback, useRef } from 'react';

export interface HospitalBedRecord {
  id: string;
  hospital_id: string;
  ward_name: string;
  bed_number: string;
  status: 'occupied' | 'available' | 'cleaning';
  patient_name: string | null;
  diagnosis: string | null;
  updated_at: string;
}

export interface LiveDashboardSummary {
  serverTime: string;
  hospitalId: string;
  counts: {
    totalPatients: number;
    stablePatients: number;
    attentionPatients: number;
    activeDoctors: number;
    activeNurses: number;
    totalClinicians: number;
    totalAppointments: number;
    completedAppointments: number;
    pendingAppointments: number;
    totalPrescriptions: number;
    activePrescriptions: number;
    pendingPrescriptions: number;
    totalLabs: number;
    completedLabs: number;
    pendingLabs: number;
    normalLabs: number;
    abnormalLabs: number;
    emergencyCases: number;
    vitalsCountToday: number;
  };
  beds: {
    total: number;
    occupied: number;
    available: number;
    cleaning: number;
    occupancyPct: number;
    list: HospitalBedRecord[];
  };
  telemetry: {
    steps: number;
    stepsGoal: number;
    calories: number;
    waterMl: number;
    sleepMinutes: number;
    updatedAt: string | null;
    stepsGoalPct: number;
  };
  progress: {
    stepsGoalPct: number;
    rxDonePct: number;
    apptsDonePct: number;
    labsDonePct: number;
    overallScore: number;
  };
  checklist: Array<{
    key: string;
    label: string;
    done: boolean;
    statusText: string;
  }>;
  recentPatients: Array<{
    id: string;
    mrn: string;
    full_name: string;
    age: number;
    gender: string;
    district: string;
    risk_tier: string;
    updated_at: string;
  }>;
  recentAppointments: Array<{
    id: string;
    patient_id: string;
    patient_name: string;
    clinician_name: string;
    facility: string;
    scheduled_for: string;
    visit_type: string;
    reason: string;
    status: string;
  }>;
  recentLabs: Array<{
    id: string;
    patient_name: string;
    test_name: string;
    result_value: string;
    interpretation: string;
    status: string;
    created_at: string;
  }>;
  recentLogs: Array<{
    id: string;
    actor_role: string;
    action: string;
    details: string;
    created_at: string;
  }>;
}

const LIVE_SUMMARY_EVENT = 'doctorian_live_summary_updated';

export function useLiveDashboardSummary(hospitalId: string = 'mulago-national', userKey?: string) {
  const effectiveUserKey = userKey || 'default-user';
  const [summary, setSummary] = useState<LiveDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPedometerActive, setIsPedometerActive] = useState(false);
  const lastStepTimestampRef = useRef<number>(0);

  const fetchSummary = useCallback(async () => {
    try {
      const token = localStorage.getItem('doctorian_auth_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(
        `/api/dashboard/live-summary?hospitalId=${encodeURIComponent(hospitalId)}&userKey=${encodeURIComponent(effectiveUserKey)}`,
        { headers, credentials: 'include' }
      );
      if (res.ok) {
        const data = (await res.json()) as LiveDashboardSummary;
        setSummary(data);
        window.dispatchEvent(new CustomEvent(LIVE_SUMMARY_EVENT, { detail: data }));
      }
    } catch (err) {
      console.warn('[LiveSummary] Fetch skipped/offline:', err);
    } finally {
      setIsLoading(false);
    }
  }, [hospitalId, effectiveUserKey]);

  useEffect(() => {
    fetchSummary();
    const poll = setInterval(fetchSummary, 15000);
    const onCrossUpdate = (e: Event) => {
      const detail = (e as CustomEvent<LiveDashboardSummary>).detail;
      if (detail && detail.hospitalId === hospitalId) {
        setSummary(detail);
      }
    };
    window.addEventListener(LIVE_SUMMARY_EVENT, onCrossUpdate);
    return () => {
      clearInterval(poll);
      window.removeEventListener(LIVE_SUMMARY_EVENT, onCrossUpdate);
    };
  }, [fetchSummary, hospitalId]);

  const updateSteps = useCallback(
    async (opts: { deltaSteps?: number; absoluteSteps?: number; waterMl?: number; sleepMinutes?: number; stepsGoal?: number }) => {
      try {
        const token = localStorage.getItem('doctorian_auth_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/dashboard/steps', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            ...opts,
            hospitalId,
            userKey: effectiveUserKey
          })
        });
        if (res.ok) {
          const data = (await res.json()) as LiveDashboardSummary;
          setSummary(data);
          window.dispatchEvent(new CustomEvent(LIVE_SUMMARY_EVENT, { detail: data }));
          return data;
        }
      } catch (err) {
        console.warn('[LiveSummary] Failed to update steps:', err);
      }
      return null;
    },
    [hospitalId, effectiveUserKey]
  );

  const updateBedStatus = useCallback(
    async (bedId: string, status: 'occupied' | 'available' | 'cleaning', patientName?: string, diagnosis?: string) => {
      try {
        const token = localStorage.getItem('doctorian_auth_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/dashboard/beds/update', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ bedId, hospitalId, status, patientName, diagnosis })
        });
        if (res.ok) {
          const data = (await res.json()) as LiveDashboardSummary;
          setSummary(data);
          window.dispatchEvent(new CustomEvent(LIVE_SUMMARY_EVENT, { detail: data }));
          return data;
        }
      } catch (err) {
        console.warn('[LiveSummary] Failed to update bed status:', err);
      }
      return null;
    },
    [hospitalId]
  );

  const toggleAppointmentStatus = useCallback(
    async (appointmentId: string) => {
      try {
        const token = localStorage.getItem('doctorian_auth_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/dashboard/appointments/${encodeURIComponent(appointmentId)}/toggle`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ hospitalId })
        });
        if (res.ok) {
          const data = (await res.json()) as LiveDashboardSummary;
          setSummary(data);
          window.dispatchEvent(new CustomEvent(LIVE_SUMMARY_EVENT, { detail: data }));
          return data;
        }
      } catch (err) {
        console.warn('[LiveSummary] Failed to toggle appointment:', err);
      }
      return null;
    },
    [hospitalId]
  );

  // Real Phone Accelerometer Step Counter (DeviceMotion API)
  useEffect(() => {
    if (!isPedometerActive || typeof window === 'undefined') return;
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const magnitude = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      const now = Date.now();
      // Peak threshold typical for human stride above 1G gravity (~9.81 m/s^2)
      if (magnitude > 12.6 && now - lastStepTimestampRef.current > 360) {
        lastStepTimestampRef.current = now;
        updateSteps({ deltaSteps: 1 });
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isPedometerActive, updateSteps]);

  const togglePhonePedometer = useCallback(async () => {
    if (isPedometerActive) {
      setIsPedometerActive(false);
      return false;
    }
    try {
      const dm = window.DeviceMotionEvent as any;
      if (dm && typeof dm.requestPermission === 'function') {
        const permission = await dm.requestPermission();
        if (permission !== 'granted') {
          return false;
        }
      }
      setIsPedometerActive(true);
      return true;
    } catch {
      setIsPedometerActive(true);
      return true;
    }
  }, [isPedometerActive]);

  return {
    summary,
    isLoading,
    refresh: fetchSummary,
    updateSteps,
    updateBedStatus,
    toggleAppointmentStatus,
    isPedometerActive,
    togglePhonePedometer
  };
}
