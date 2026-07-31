/**
 * FHIR R4 & HL7 Standard Data Exporter
 * Converts patient clinical records, prescriptions, vitals, and diagnostic findings
 * into standard FHIR R4 JSON bundles for inter-hospital EHR transfer.
 */

export interface FHIRPatientBundleInput {
  patient: {
    id?: string;
    name: string;
    age?: string | number;
    gender?: string;
    phone?: string;
    address?: string;
    bloodType?: string;
    allergies?: string;
  };
  vitals?: {
    heartRate?: number;
    spo2?: number;
    sysBP?: number;
    diaBP?: number;
    temperature?: number;
    respiratoryRate?: number;
  };
  diagnosis?: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
  }>;
  doctorName?: string;
}

export function generateFHIRBundle(input: FHIRPatientBundleInput) {
  const patientId = input.patient.id || 'pat-' + Date.now();
  const timestamp = new Date().toISOString();

  const patientResource = {
    resourceType: 'Patient',
    id: patientId,
    active: true,
    name: [{
      use: 'official',
      text: input.patient.name,
    }],
    gender: input.patient.gender ? input.patient.gender.toLowerCase() : 'unknown',
    telecom: input.patient.phone ? [{
      system: 'phone',
      value: input.patient.phone,
      use: 'mobile'
    }] : [],
    address: input.patient.address ? [{
      text: input.patient.address
    }] : []
  };

  const entries: any[] = [
    {
      fullUrl: `urn:uuid:Patient/${patientId}`,
      resource: patientResource
    }
  ];

  // Condition resource if diagnosis exists
  if (input.diagnosis) {
    entries.push({
      fullUrl: `urn:uuid:Condition/cond-${Date.now()}`,
      resource: {
        resourceType: 'Condition',
        id: `cond-${Date.now()}`,
        clinicalStatus: {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }]
        },
        verificationStatus: {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }]
        },
        category: [{
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis' }]
        }],
        code: {
          text: input.diagnosis
        },
        subject: { reference: `Patient/${patientId}` },
        recordedDate: timestamp
      }
    });
  }

  // Observation resource for vitals
  if (input.vitals) {
    const observations = [];
    if (input.vitals.heartRate) {
      observations.push({
        code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
        valueQuantity: { value: input.vitals.heartRate, unit: 'beats/min', system: 'http://unitsofmeasure.org', code: '/min' }
      });
    }
    if (input.vitals.spo2) {
      observations.push({
        code: { coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation in Arterial blood by Pulse oximetry' }] },
        valueQuantity: { value: input.vitals.spo2, unit: '%', system: 'http://unitsofmeasure.org', code: '%' }
      });
    }
    if (input.vitals.sysBP && input.vitals.diaBP) {
      observations.push({
        code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }] },
        component: [
          {
            code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] },
            valueQuantity: { value: input.vitals.sysBP, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
          },
          {
            code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] },
            valueQuantity: { value: input.vitals.diaBP, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
          }
        ]
      });
    }

    observations.forEach((obs, idx) => {
      entries.push({
        fullUrl: `urn:uuid:Observation/obs-${Date.now()}-${idx}`,
        resource: {
          resourceType: 'Observation',
          id: `obs-${Date.now()}-${idx}`,
          status: 'final',
          category: [{
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }]
          }],
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: timestamp,
          ...obs
        }
      });
    });
  }

  // MedicationRequest resources
  if (input.medications && input.medications.length > 0) {
    input.medications.forEach((med, idx) => {
      entries.push({
        fullUrl: `urn:uuid:MedicationRequest/med-${Date.now()}-${idx}`,
        resource: {
          resourceType: 'MedicationRequest',
          id: `med-${Date.now()}-${idx}`,
          status: 'active',
          intent: 'order',
          medicationCodeableConcept: {
            text: med.name
          },
          subject: { reference: `Patient/${patientId}` },
          dosageInstruction: [{
            text: `${med.dosage} - ${med.frequency} ${med.instructions || ''}`.trim()
          }],
          requester: input.doctorName ? { display: input.doctorName } : undefined
        }
      });
    });
  }

  return {
    resourceType: 'Bundle',
    type: 'document',
    timestamp: timestamp,
    identifier: {
      system: 'urn:ietf:rfc:3986',
      value: `urn:uuid:doctorian-fhir-${Date.now()}`
    },
    entry: entries
  };
}

/**
 * Trigger browser download of FHIR R4 JSON bundle file
 */
export function downloadFHIRJson(input: FHIRPatientBundleInput) {
  const bundle = generateFHIRBundle(input);
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `FHIR_EHR_Transfer_${(input.patient.name || 'Patient').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
