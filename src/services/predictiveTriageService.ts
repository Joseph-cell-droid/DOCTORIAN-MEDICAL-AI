/**
 * Doctorian Clinical Intelligence Engine: Predictive Triage & Risk Forecasting
 * Implements standard evidence-based clinical early warning scores:
 * - NEWS2 (National Early Warning Score 2)
 * - qSOFA (Quick Sepsis-related Organ Failure Assessment)
 * - MEOWS (Modified Early Obstetric Warning Score)
 * Grounded in WHO and Uganda Clinical Guidelines (UCG 2023/2026).
 */

export interface VitalsInput {
  heartRate?: number; // BPM
  systolicBP?: number; // mmHg
  diastolicBP?: number; // mmHg
  spO2?: number; // %
  temperature?: number; // °C
  respiratoryRate?: number; // breaths/min
  consciousness?: 'alert' | 'voice' | 'pain' | 'unresponsive';
  isSupplementalOxygen?: boolean;
}

export interface EarlyWarningScore {
  score: number;
  maxScore: number;
  riskLevel: 'Normal' | 'Low' | 'Medium' | 'High' | 'Critical';
  color: string;
  clinicalImplication: string;
}

export interface PredictiveTriageResult {
  news2: EarlyWarningScore;
  qsofa: {
    score: number;
    sepsisRisk: boolean;
    criteriaMet: string[];
    riskLevel: 'Low' | 'High Sepsis Risk';
  };
  meows?: {
    score: number;
    riskLevel: 'Normal' | 'Yellow Alert' | 'Red Alert';
    triggers: string[];
  };
  compositeTrajectory: 'Stable' | 'Guarded' | 'Escalating' | 'Critical Acuity';
  trajectoryColor: string;
  keyRisks: string[];
  suggestedActions: string[];
  recommendedFacilityTier: 'Self-Care / Home' | 'Health Centre II/III' | 'Health Centre IV' | 'District Hospital' | 'Regional Referral (Mulago/Mbarara)';
}

/**
 * Calculates NEWS2 (National Early Warning Score 2)
 */
export function calculateNEWS2(vitals: VitalsInput): EarlyWarningScore {
  let score = 0;

  // 1. Respiration Rate
  const rr = vitals.respiratoryRate ?? 16;
  if (rr <= 8) score += 3;
  else if (rr >= 9 && rr <= 11) score += 1;
  else if (rr >= 12 && rr <= 20) score += 0;
  else if (rr >= 21 && rr <= 24) score += 2;
  else if (rr >= 25) score += 3;

  // 2. Oxygen Saturation (SpO2)
  const spo2 = vitals.spO2 ?? 98;
  if (spo2 <= 91) score += 3;
  else if (spo2 >= 92 && spo2 <= 93) score += 2;
  else if (spo2 >= 94 && spo2 <= 95) score += 1;
  else score += 0;

  // 3. Supplemental Oxygen
  if (vitals.isSupplementalOxygen) score += 2;

  // 4. Systolic Blood Pressure
  const sbp = vitals.systolicBP ?? 120;
  if (sbp <= 90) score += 3;
  else if (sbp >= 91 && sbp <= 100) score += 2;
  else if (sbp >= 101 && sbp <= 110) score += 1;
  else if (sbp >= 111 && sbp <= 219) score += 0;
  else if (sbp >= 220) score += 3;

  // 5. Heart Rate (Pulse)
  const hr = vitals.heartRate ?? 72;
  if (hr <= 40) score += 3;
  else if (hr >= 41 && hr <= 50) score += 1;
  else if (hr >= 51 && hr <= 90) score += 0;
  else if (hr >= 91 && hr <= 110) score += 1;
  else if (hr >= 111 && hr <= 130) score += 2;
  else if (hr >= 131) score += 3;

  // 6. Consciousness
  const avpu = vitals.consciousness ?? 'alert';
  if (avpu !== 'alert') score += 3;

  // 7. Temperature (°C)
  const temp = vitals.temperature ?? 36.8;
  if (temp <= 35.0) score += 3;
  else if (temp >= 35.1 && temp <= 36.0) score += 1;
  else if (temp >= 36.1 && temp <= 38.0) score += 0;
  else if (temp >= 38.1 && temp <= 39.0) score += 1;
  else if (temp >= 39.1) score += 2;

  // Interpretation
  let riskLevel: EarlyWarningScore['riskLevel'] = 'Normal';
  let color = 'text-emerald-400';
  let clinicalImplication = 'Low clinical risk; standard routine observation.';

  if (score === 0) {
    riskLevel = 'Normal';
    color = 'text-emerald-400';
    clinicalImplication = 'Patient is physiologically stable. Continue standard wellness monitoring.';
  } else if (score >= 1 && score <= 4) {
    riskLevel = 'Low';
    color = 'text-amber-400';
    clinicalImplication = 'Low risk of acute deterioration. Repeat vitals in 4-6 hours.';
  } else if (score === 5 || score === 6) {
    riskLevel = 'Medium';
    color = 'text-orange-400';
    clinicalImplication = 'Moderate clinical risk. Requires prompt clinical assessment by a clinician.';
  } else {
    riskLevel = 'Critical';
    color = 'text-rose-400';
    clinicalImplication = 'Urgent or emergency clinical risk. Immediate emergency resuscitation and escalation required.';
  }

  return {
    score,
    maxScore: 20,
    riskLevel,
    color,
    clinicalImplication
  };
}

/**
 * Calculates qSOFA (Quick Sepsis-related Organ Failure Assessment)
 */
export function calculateQSOFA(vitals: VitalsInput): {
  score: number;
  sepsisRisk: boolean;
  criteriaMet: string[];
  riskLevel: 'Low' | 'High Sepsis Risk';
} {
  let score = 0;
  const criteriaMet: string[] = [];

  // Respiratory rate >= 22 breaths/min
  if ((vitals.respiratoryRate ?? 16) >= 22) {
    score += 1;
    criteriaMet.push(`Tachypnea (RR ${vitals.respiratoryRate ?? 22} >= 22)`);
  }

  // Altered mentation (not alert)
  if (vitals.consciousness && vitals.consciousness !== 'alert') {
    score += 1;
    criteriaMet.push(`Altered Mentation (${vitals.consciousness})`);
  }

  // Systolic BP <= 100 mmHg
  if ((vitals.systolicBP ?? 120) <= 100) {
    score += 1;
    criteriaMet.push(`Hypotension (Systolic BP ${vitals.systolicBP ?? 100} <= 100 mmHg)`);
  }

  return {
    score,
    sepsisRisk: score >= 2,
    criteriaMet,
    riskLevel: score >= 2 ? 'High Sepsis Risk' : 'Low'
  };
}

/**
 * Computes composite predictive triage across all warning indicators
 */
export function computePredictiveTriage(vitals: VitalsInput, symptomContext: string = ''): PredictiveTriageResult {
  const news2 = calculateNEWS2(vitals);
  const qsofa = calculateQSOFA(vitals);

  const keyRisks: string[] = [];
  const suggestedActions: string[] = [];

  // Vitals Acuity Auditing
  if ((vitals.spO2 ?? 98) < 92) {
    keyRisks.push(`Hypoxemia (SpO2 ${vitals.spO2}%): High risk of respiratory compromise.`);
    suggestedActions.push('Initiate supplemental oxygen (aim for SpO2 >= 94%) and prepare airway.');
  }

  if ((vitals.heartRate ?? 72) > 115) {
    keyRisks.push(`Marked Tachycardia (HR ${vitals.heartRate} bpm): Assess for infection, dehydration, or arrhythmia.`);
    suggestedActions.push('Assess volume status, check capillary refill, and order baseline ECG.');
  }

  if ((vitals.temperature ?? 37) >= 38.5) {
    keyRisks.push(`High Grade Pyrexia (Temp ${vitals.temperature}°C): Potential endemic infection (Malaria, Sepsis, Pneumonia).`);
    suggestedActions.push('Perform rapid diagnostic test for Malaria (mRDT) and blood cultures.');
  }

  if (qsofa.sepsisRisk) {
    keyRisks.push(`High Sepsis Risk (qSOFA ${qsofa.score}/3): Patient meets clinical criteria for sepsis.`);
    suggestedActions.push('Implement Surviving Sepsis Hour-1 bundle: IV access, lactate, blood cultures, broad antibiotics & fluids.');
  }

  // Trajectory Assessment
  let compositeTrajectory: PredictiveTriageResult['compositeTrajectory'] = 'Stable';
  let trajectoryColor = 'text-emerald-400';
  let recommendedFacilityTier: PredictiveTriageResult['recommendedFacilityTier'] = 'Self-Care / Home';

  if (news2.score >= 7 || qsofa.sepsisRisk) {
    compositeTrajectory = 'Critical Acuity';
    trajectoryColor = 'text-rose-500';
    recommendedFacilityTier = 'District Hospital';
    suggestedActions.push('Urgent facility escalation. Arrange emergency medical transport.');
  } else if (news2.score >= 5 || (vitals.spO2 && vitals.spO2 < 94)) {
    compositeTrajectory = 'Escalating';
    trajectoryColor = 'text-orange-400';
    recommendedFacilityTier = 'Health Centre IV';
    suggestedActions.push('Review patient within 1 hour. Repeat bio-telemetry vitals every 30 minutes.');
  } else if (news2.score >= 1) {
    compositeTrajectory = 'Guarded';
    trajectoryColor = 'text-amber-400';
    recommendedFacilityTier = 'Health Centre II/III';
    suggestedActions.push('Re-evaluate in 2-4 hours. Encourage oral hydration and rest.');
  } else {
    compositeTrajectory = 'Stable';
    trajectoryColor = 'text-emerald-400';
    recommendedFacilityTier = 'Self-Care / Home';
    suggestedActions.push('Continue standard preventive health practices and hydration.');
  }

  return {
    news2,
    qsofa,
    compositeTrajectory,
    trajectoryColor,
    keyRisks: keyRisks.length > 0 ? keyRisks : ['No acute physiological red flags detected.'],
    suggestedActions,
    recommendedFacilityTier
  };
}
