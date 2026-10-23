# Implementation Plan: Doctorian Clinical Intelligence & Performance Elevation

Elevating Doctorian Medical AI into a clinical-grade medical intelligence powerhouse by integrating predictive health risk forecasting, continuous bio-sensor vitals fusion with anomaly detection, and automated EHR SOAP note generation with one-click referral slips.

---

## User Review Required

> [!IMPORTANT]
> The planned upgrades build directly on the existing SQLite database, Gemini Flash inference pipeline, and Arduino bio-telemetry framework without requiring new paid third-party subscriptions or breaking existing consultation history.

- **Vitals Telemetry Fusion**: Bridges both physical Arduino hardware serial connections and simulated high-fidelity ICU/telemetry streams for testing.
- **Predictive Risk Scoring**: Implements standard clinical risk formulas (e.g., qSOFA for sepsis, NEWS2 for clinical deterioration, Framingham/ASCVD for cardiovascular risk, and MEOWS for maternal triage) grounded in WHO and Uganda Clinical Guidelines.
- **One-Click Referral Slips**: Generates standard Ministry of Health (MOH) referral vouchers exportable as clean, printable clinical records.

---

## Proposed Changes

### 1. Predictive Clinical Triage & Proactive Health Risk Forecasting

#### [NEW / UPDATE] `server.ts` & `src/services/predictiveTriageService.ts`
- **Predictive Clinical Risk Engine**:
  - Implements multi-dimensional algorithmic scoring:
    - **NEWS2 (National Early Warning Score)**: Heart rate, systolic BP, SpO2, respiratory rate, body temperature, and level of consciousness.
    - **qSOFA (Quick Sepsis-related Organ Failure Assessment)**: Rapid sepsis indicator alerting clinicians when risk exceeds thresholds.
    - **MEOWS (Modified Early Obstetric Warning Score)**: Targeted maternal complication screening.
  - Generates predictive trajectories: "Stable", "Guarded", "Escalating", or "Critical Acuity".
- **Backend API Routes**:
  - `/api/clinical/predictive-triage`: Analyzes patient history + active vitals + consultation text to produce real-time risk scores with radar charts.
  - `/api/clinical/risk-forecast`: 24-48 hour risk trajectory forecasting based on symptom patterns.

---

### 2. Real-Time Bio-Sensor Stream with Anomaly Alerts & Vitals Fusion

#### [UPDATE] `src/components/ModernBioSensors.tsx` & `src/components/ModernizedChatView.tsx`
- **Continuous Vitals Fusion Engine**:
  - Unifies SpO2, pulse rate (BPM), galvanic skin response (GSR), temperature, and systolic/diastolic telemetry into a live 60-second rolling buffer.
  - Computes moving variance, tachy/bradycardia thresholds, hypoxia alerts, and fever spikes in real time.
- **Dynamic Anomaly Alert Ribbon**:
  - Compact, glowing telemetry alert banner embedded above the chat input dock whenever abnormal vitals or sudden spikes are detected.
  - Clinician action trigger: "Auto-Inject Telemetry into Consultation" allowing 1-tap transmission of anomalous vitals directly to Doctorian AI for instant differential diagnosis.

---

### 3. Intelligent EHR SOAP Note Generator with One-Click Referral Slips

#### [NEW] `src/components/IntelligentSOAPReferralModal.tsx`
- **Automated EHR SOAP Formulator**:
  - **S (Subjective)**: Chief complaint, history of presenting illness, patient-reported symptoms.
  - **O (Objective)**: Fused bio-telemetry, lab values, physical observation parameters.
  - **A (Assessment)**: AI differential diagnosis, clinical acuity tier, WHO/UCG guideline correlation.
  - **P (Plan)**: Pharmacotherapy regimen, dosage schedule, emergency warnings, and lifestyle instructions.
- **One-Click MOH Facility Referral Voucher**:
  - Generates official Ministry of Health referral slips with receiving facility tier (Health Centre III/IV, District Hospital, Regional Referral such as Mulago or Mbarara).
  - Includes clinical reason for referral, active medications, vital signs summary, and urgent transport status.
  - Features quick copy, JSON EHR export, and print/PDF formatting.

#### [UPDATE] `src/components/ModernizedChatView.tsx`
- **Smart Actions Dock Integration**:
  - Connect the "SOAP Note" button in the Smart Actions dock to automatically extract the ongoing consultation conversation, synthesize the clinical note, and present the referral generator modal.
  - Add quick-export trigger to the session header.

---

## Verification Plan

### Automated Build & Syntax Verification
- Run `compile_applet` to ensure TypeScript compilation, JSX types, and Vite bundling pass without error.
- Run `lint_applet` to verify code quality, import integrity, and standard compliance.

### Manual Verification
1. **Predictive Triage Verification**:
   - Send simulated symptoms (e.g. "Fever 39.5°C, rapid breathing, chills") and verify the predictive risk engine computes elevated NEWS2 / qSOFA scores with clear clinical rationale.
2. **Bio-Sensor Fusion & Anomaly Alerting**:
   - Trigger simulated elevated vitals (e.g. Heart Rate > 115 BPM or SpO2 < 92%) and verify the real-time anomaly ribbon pulses with a 1-click option to inject telemetry into the chat.
3. **EHR SOAP Note & Referral Slip Generation**:
   - Run a consultation, click "SOAP Note & Referral" in the Smart Actions dock, verify the clinical note organizes into S-O-A-P sections correctly, and generate a printable MOH referral voucher.
