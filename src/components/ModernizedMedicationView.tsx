import React from 'react';
import { MedicationTracker, MedicationTrackerProps } from './MedicationTracker';

export interface ModernizedMedicationViewProps {
  user: any;
  onNavigate: (view: any) => void;
  onScanPrescription?: () => void;
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ModernizedMedicationView: React.FC<ModernizedMedicationViewProps> = ({
  user,
  onNavigate,
  addToast
}) => {
  return <MedicationTracker user={user} onNavigate={onNavigate} addToast={addToast} />;
};

export default ModernizedMedicationView;
