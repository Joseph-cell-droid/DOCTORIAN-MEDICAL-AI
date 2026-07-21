/**
 * Uganda Ministry of Health Clinical Guidelines (UCG) Dosage Validation Layer
 * Enforces safe prescribing boundaries for common medical molecules in Uganda.
 */

export interface DosageValidationResult {
  isValid: boolean;
  warning: string | null;
  drug: string;
  exceededLimit: string;
  clinicalGuidelineRef: string;
}

/**
 * Parses a dosage string into milligrams (mg).
 * Supports formats like "500mg", "1g", "1.5 g", "400 mg", "4g", "4000mg".
 */
export function parseDosageToMg(dosageStr: string): number | null {
  if (!dosageStr) return null;
  const cleaned = dosageStr.toLowerCase().trim();

  // Handle grams (e.g., "1g", "1.5 g", "2 grams")
  const gMatch = cleaned.match(/([0-9.]+)\s*(g|gm|gram|grams)\b/i);
  if (gMatch) {
    const val = parseFloat(gMatch[1]);
    return isNaN(val) ? null : val * 1000;
  }

  // Handle milligrams (e.g., "500mg", "250 mg")
  const mgMatch = cleaned.match(/([0-9.]+)\s*(mg|milligram|milligrams)\b/i);
  if (mgMatch) {
    const val = parseFloat(mgMatch[1]);
    return isNaN(val) ? null : val;
  }

  // Handle micrograms (e.g., "100mcg", "500 mcg")
  const mcgMatch = cleaned.match(/([0-9.]+)\s*(mcg|ug|microgram|micrograms)\b/i);
  if (mcgMatch) {
    const val = parseFloat(mcgMatch[1]);
    return isNaN(val) ? null : val / 1000;
  }

  // Handle cases where only a number is provided, assume mg by default
  const numOnlyMatch = cleaned.match(/^([0-9.]+)$/);
  if (numOnlyMatch) {
    const val = parseFloat(numOnlyMatch[1]);
    return isNaN(val) ? null : val;
  }

  // Fallback try to find any leading number
  const genericMatch = cleaned.match(/^([0-9.]+)/);
  if (genericMatch) {
    const val = parseFloat(genericMatch[1]);
    return isNaN(val) ? null : val;
  }

  return null;
}

/**
 * Parses a frequency string into a numeric multiplier per day.
 * E.g., "Twice daily" -> 2, "3 times daily" -> 3.
 */
export function parseFrequencyMultiplier(freqStr: string): number {
  if (!freqStr) return 1;
  const cleaned = freqStr.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  if (cleaned.includes('four times') || cleaned.includes('qid') || cleaned.includes('4 times') || cleaned.includes('every 6 hours') || cleaned.includes('4x')) {
    return 4;
  }
  if (cleaned.includes('three times') || cleaned.includes('tid') || cleaned.includes('3 times') || cleaned.includes('every 8 hours') || cleaned.includes('3x')) {
    return 3;
  }
  if (cleaned.includes('twice') || cleaned.includes('bid') || cleaned.includes('2 times') || cleaned.includes('every 12 hours') || cleaned.includes('2x')) {
    return 2;
  }
  if (cleaned.includes('once') || cleaned.includes('daily') || cleaned.includes('qd') || cleaned.includes('nightly') || cleaned.includes('morning') || cleaned.includes('1x')) {
    return 1;
  }

  // Default fallback if we can't parse
  return 1;
}

/**
 * Validates a medication dosage against Uganda Ministry of Health Clinical Guidelines.
 * Returns a validation result indicating whether it exceeds standard limits.
 */
export function validateMoHClinicalDosage(
  medName: string,
  dosageStr: string,
  frequencyStr: string = 'Daily'
): DosageValidationResult {
  const result: DosageValidationResult = {
    isValid: true,
    warning: null,
    drug: medName,
    exceededLimit: '',
    clinicalGuidelineRef: 'Uganda Clinical Guidelines (UCG) 2023, Ministry of Health'
  };

  if (!medName || !dosageStr) return result;

  const drugLower = medName.toLowerCase().trim();
  const singleMg = parseDosageToMg(dosageStr);
  const freqMult = parseFrequencyMultiplier(frequencyStr);

  if (singleMg === null) return result;
  const dailyMg = singleMg * freqMult;

  // 1. PARACETAMOL (Panadol / Acetaminophen)
  if (
    drugLower.includes('paracetamol') ||
    drugLower.includes('acetaminophen') ||
    drugLower.includes('panadol')
  ) {
    const maxSingle = 1000; // 1000mg
    const maxDaily = 4000;  // 4000mg
    if (singleMg > maxSingle) {
      result.isValid = false;
      result.exceededLimit = `Single dose of ${dosageStr} exceeds the 1000mg single dose limit`;
      result.warning = `Safety Warning: Paracetamol single dose of ${dosageStr} exceeds Uganda MOH Clinical Guidelines (Max: 1000mg). Risk of acute hepatotoxicity and irreversible liver necrosis!`;
    } else if (dailyMg > maxDaily) {
      result.isValid = false;
      result.exceededLimit = `Daily dosage of ${dailyMg}mg exceeds the 4000mg daily limit`;
      result.warning = `Safety Warning: Cumulative Paracetamol daily dosage (${dailyMg}mg) exceeds Uganda MOH Clinical Guidelines (Max: 4000mg/day). Severe risk of fatal liver toxicity!`;
    }
  }

  // 2. AMOXICILLIN
  else if (drugLower.includes('amoxicillin') || drugLower.includes('amoxil')) {
    const maxSingle = 1000; // 1000mg
    const maxDaily = 3000;  // 3000mg
    if (singleMg > maxSingle) {
      result.isValid = false;
      result.exceededLimit = `Single dose of ${dosageStr} exceeds the 1000mg single dose limit`;
      result.warning = `Safety Warning: Amoxicillin single dose of ${dosageStr} exceeds Uganda Clinical Guidelines (Max: 1000mg). Risk of acute gastrointestinal distress and rapid superinfection.`;
    } else if (dailyMg > maxDaily) {
      result.isValid = false;
      result.exceededLimit = `Daily dosage of ${dailyMg}mg exceeds the 3000mg daily limit`;
      result.warning = `Safety Warning: Amoxicillin daily dosage of ${dailyMg}mg exceeds Uganda Clinical Guidelines (Max: 3000mg/day). High risk of opportunistic infections and clinical resistance.`;
    }
  }

  // 3. IBUPROFEN (Brufen)
  else if (drugLower.includes('ibuprofen') || drugLower.includes('brufen')) {
    const maxSingle = 800;  // 800mg
    const maxDaily = 2400;  // 2400mg
    if (singleMg > maxSingle) {
      result.isValid = false;
      result.exceededLimit = `Single dose of ${dosageStr} exceeds the 800mg single dose limit`;
      result.warning = `Safety Warning: Ibuprofen single dose of ${dosageStr} exceeds Uganda Clinical Guidelines (Max: 800mg). High risk of gastrointestinal ulceration and hemorrhage!`;
    } else if (dailyMg > maxDaily) {
      result.isValid = false;
      result.exceededLimit = `Daily dosage of ${dailyMg}mg exceeds the 2400mg daily limit`;
      result.warning = `Safety Warning: Ibuprofen cumulative daily dosage (${dailyMg}mg) exceeds Uganda Clinical Guidelines (Max: 2400mg/day). Elevated danger of nephrotoxicity and acute renal failure.`;
    }
  }

  // 4. CIPROFLOXACIN
  else if (drugLower.includes('ciprofloxacin') || drugLower.includes('cipro')) {
    const maxSingle = 750;  // 750mg
    const maxDaily = 1500;  // 1500mg
    if (singleMg > maxSingle) {
      result.isValid = false;
      result.exceededLimit = `Single dose of ${dosageStr} exceeds the 750mg single dose limit`;
      result.warning = `Safety Warning: Ciprofloxacin single dose of ${dosageStr} exceeds Uganda Clinical Guidelines (Max: 750mg). Risk of tendon rupture and severe neuropsychiatric reactions.`;
    } else if (dailyMg > maxDaily) {
      result.isValid = false;
      result.exceededLimit = `Daily dosage of ${dailyMg}mg exceeds the 1500mg daily limit`;
      result.warning = `Safety Warning: Ciprofloxacin cumulative daily dosage (${dailyMg}mg) exceeds Uganda Clinical Guidelines (Max: 1500mg/day). Risk of dangerous QT interval prolongation.`;
    }
  }

  // 5. METFORMIN
  else if (drugLower.includes('metformin') || drugLower.includes('glucophage')) {
    const maxSingle = 1000; // 1000mg
    const maxDaily = 2500;  // 2500mg
    if (singleMg > maxSingle) {
      result.isValid = false;
      result.exceededLimit = `Single dose of ${dosageStr} exceeds the 1000mg single dose limit`;
      result.warning = `Safety Warning: Metformin single dose of ${dosageStr} exceeds Uganda Clinical Guidelines (Max: 1000mg). High risk of life-threatening lactic acidosis and severe hypoglycemia.`;
    } else if (dailyMg > maxDaily) {
      result.isValid = false;
      result.exceededLimit = `Daily dosage of ${dailyMg}mg exceeds the 2500mg daily limit`;
      result.warning = `Safety Warning: Metformin cumulative daily dosage (${dailyMg}mg) exceeds Uganda Clinical Guidelines (Max: 2500mg/day). Critical threshold for metabolic lactic acidosis.`;
    }
  }

  // 6. AMLODIPINE
  else if (drugLower.includes('amlodipine')) {
    const maxDaily = 10; // 10mg
    if (dailyMg > maxDaily) {
      result.isValid = false;
      result.exceededLimit = `Daily dosage of ${dailyMg}mg exceeds the 10mg daily limit`;
      result.warning = `Safety Warning: Amlodipine daily dosage (${dailyMg}mg) exceeds Uganda Clinical Guidelines (Max: 10mg/day). High danger of severe peripheral edema, profound hypotension, and reflex tachycardia.`;
    }
  }

  // 7. ATORVASTATIN
  else if (drugLower.includes('atorvastatin') || drugLower.includes('lipitor')) {
    const maxDaily = 80; // 80mg
    if (dailyMg > maxDaily) {
      result.isValid = false;
      result.exceededLimit = `Daily dosage of ${dailyMg}mg exceeds the 80mg daily limit`;
      result.warning = `Safety Warning: Atorvastatin daily dosage of ${dailyMg}mg exceeds Uganda Clinical Guidelines (Max: 80mg/day). Serious risk of clinical rhabdomyolysis and progressive hepatic toxicity.`;
    }
  }

  // 8. MAGNESIUM SULPHATE (MgSO4)
  else if (
    drugLower.includes('magnesium sulphate') ||
    drugLower.includes('mgso4') ||
    drugLower.includes('magnesium sulfate')
  ) {
    const maxSingleIV = 4000; // 4000mg or 4g IV loading dose
    if (singleMg > maxSingleIV) {
      result.isValid = false;
      result.exceededLimit = `Single IV bolus of ${dosageStr} exceeds the 4000mg (4g) pre-eclampsia limit`;
      result.warning = `Safety Warning: Magnesium Sulphate single IV dose of ${dosageStr} exceeds pre-eclampsia loading guidelines (Max: 4000mg / 4g IV). Risk of severe respiratory depression, flaccid paralysis, and cardiac arrest!`;
    }
  }

  // 9. DIAZEPAM (Valium)
  else if (drugLower.includes('diazepam') || drugLower.includes('valium')) {
    const maxSingle = 10; // 10mg
    if (singleMg > maxSingle) {
      result.isValid = false;
      result.exceededLimit = `Single dose of ${dosageStr} exceeds the 10mg single dose limit`;
      result.warning = `Safety Warning: Diazepam single dose of ${dosageStr} exceeds Uganda MOH safe clinical threshold (Max: 10mg). Severe risk of coma and acute respiratory failure.`;
    }
  }

  // 10. ARTESUNATE
  else if (drugLower.includes('artesunate')) {
    const maxSingle = 240; // 2.4mg/kg (approx 120-180mg for average adult, absolute max safe limit 240mg)
    if (singleMg > maxSingle) {
      result.isValid = false;
      result.exceededLimit = `Single dose of ${dosageStr} exceeds standard 240mg threshold`;
      result.warning = `Safety Warning: IV/IM Artesunate dose of ${dosageStr} exceeds the standard UCG guidance threshold. Adult dosing requires strict 2.4mg/kg weight calibration.`;
    }
  }

  // 11. COARTEM (Artemether/Lumefantrine)
  else if (
    drugLower.includes('coartem') ||
    drugLower.includes('artemether') ||
    drugLower.includes('lumefantrine')
  ) {
    // Standard adult tablets contain 20mg Artemether / 120mg Lumefantrine
    // Standard adult dose is 4 tablets twice daily (80mg Artemether / 480mg Lumefantrine)
    const maxSingleLumefantrine = 480;
    if (singleMg > maxSingleLumefantrine && drugLower.includes('lumefantrine')) {
      result.isValid = false;
      result.exceededLimit = `Single Lumefantrine dose exceeds 480mg`;
      result.warning = `Safety Warning: Lumefantrine single dose of ${dosageStr} exceeds standard Uganda MOH Malaria guidelines (Max: 480mg / 4 tablets per dose).`;
    }
  }

  return result;
}

/**
 * Validates whether a medication is appropriate for the patient's diagnosed conditions/diseases.
 * Automatically flags drug mismatches or dangerous errors for the Doctor's portal.
 */
export function validateDrugForDisease(
  medName: string,
  conditionsStr: string = '',
  diagnosisStr: string = ''
): { isValid: boolean; warning: string | null } {
  if (!medName) return { isValid: true, warning: null };

  const drugLower = medName.toLowerCase().trim();
  const condLower = (conditionsStr + ' ' + diagnosisStr).toLowerCase();

  // 1. Metformin / Diabetes drugs
  if (drugLower.includes('metformin') || drugLower.includes('glucophage') || drugLower.includes('glibenclamide') || drugLower.includes('insulin')) {
    const hasDiabetes = condLower.includes('diabet') || condLower.includes('dka') || condLower.includes('sugar') || condLower.includes('hyperglycemia');
    if (!hasDiabetes) {
      return {
        isValid: false,
        warning: `🚨 DRUG-DISEASE MISMATCH: ${medName} is an antidiabetic agent, but the patient's record (${conditionsStr || 'No listed conditions'}) does not indicate Diabetes Mellitus. Risk of severe hypoglycemic shock!`
      };
    }
  }

  // 2. Antihypertensives
  if (drugLower.includes('amlodipine') || drugLower.includes('nifedipine') || drugLower.includes('lisinopril') || drugLower.includes('losartan') || drugLower.includes('atenolol') || drugLower.includes('hydrochlorothiazide')) {
    const hasHypertension = condLower.includes('tension') || condLower.includes('pressure') || condLower.includes('bp') || condLower.includes('hypertens') || condLower.includes('cardio');
    if (!hasHypertension) {
      return {
        isValid: false,
        warning: `🚨 DRUG-DISEASE MISMATCH: ${medName} is an antihypertensive, but the patient has no record of Hypertension or high blood pressure (Current: "${conditionsStr || 'Healthy'}"). Risk of profound hypotensive collapse!`
      };
    }
  }

  // 3. Statins
  if (drugLower.includes('atorvastatin') || drugLower.includes('simvastatin') || drugLower.includes('lipitor') || drugLower.includes('cholesterol')) {
    const hasCholesterol = condLower.includes('cholesterol') || condLower.includes('lipid') || condLower.includes('statin') || condLower.includes('hypercholesterolemia') || condLower.includes('cardio') || condLower.includes('hypertens');
    if (!hasCholesterol) {
      return {
        isValid: false,
        warning: `🚨 DRUG-DISEASE MISMATCH: ${medName} is a lipid-lowering statin, but the patient has no lipid disorder or relevant cardiovascular condition on record.`
      };
    }
  }

  // 4. Diazepam / Sedatives
  if (drugLower.includes('diazepam') || drugLower.includes('valium') || drugLower.includes('xanax') || drugLower.includes('alprazolam')) {
    const hasAnxietyOrSeizure = condLower.includes('anxiety') || condLower.includes('seizure') || condLower.includes('epilepsy') || condLower.includes('convulsion') || condLower.includes('insomnia') || condLower.includes('spasm');
    if (!hasAnxietyOrSeizure) {
      return {
        isValid: false,
        warning: `🚨 DRUG-DISEASE MISMATCH: ${medName} is a high-potency benzodiazepine sedative, but the patient's record indicates no seizure, muscle spasm, or severe anxiety history. Highly addictive and respiratory depressant!`
      };
    }
  }

  // 5. Antimalarials
  if (drugLower.includes('artesunate') || drugLower.includes('coartem') || drugLower.includes('artemether') || drugLower.includes('lumefantrine') || drugLower.includes('quinine')) {
    const hasMalaria = condLower.includes('malaria') || condLower.includes('fever') || condLower.includes('acute febrile') || condLower.includes('synthesized');
    if (!hasMalaria) {
      return {
        isValid: false,
        warning: `🚨 DRUG-DISEASE MISMATCH: ${medName} is an antimalarial treatment, but the patient has no clinical malaria or acute febrile illness registered on active diagnosis.`
      };
    }
  }

  return { isValid: true, warning: null };
}

/**
 * Validates current log dose + previous doses taken today to check for potential cumulative daily overdose.
 */
export function validateOverdoseFromLogs(
  medName: string,
  dosageStr: string,
  patientId: string,
  offlineLogs: any[],
  offlineMedicines: any[]
): { isValid: boolean; warning: string | null; totalDailyMg: number; maxDailyMg: number } {
  const defaultResult = { isValid: true, warning: null, totalDailyMg: 0, maxDailyMg: 0 };
  if (!medName || !dosageStr) return defaultResult;

  const drugLower = medName.toLowerCase().trim();
  const currentMg = parseDosageToMg(dosageStr);
  if (currentMg === null) return defaultResult;

  // Define max daily limit (MOH guidelines)
  let maxDailyMg = 0;
  if (drugLower.includes('paracetamol') || drugLower.includes('acetaminophen') || drugLower.includes('panadol')) {
    maxDailyMg = 4000;
  } else if (drugLower.includes('amoxicillin') || drugLower.includes('amoxil')) {
    maxDailyMg = 3000;
  } else if (drugLower.includes('ibuprofen') || drugLower.includes('brufen')) {
    maxDailyMg = 2400;
  } else if (drugLower.includes('ciprofloxacin') || drugLower.includes('cipro')) {
    maxDailyMg = 1500;
  } else if (drugLower.includes('metformin') || drugLower.includes('glucophage')) {
    maxDailyMg = 2500;
  } else if (drugLower.includes('amlodipine')) {
    maxDailyMg = 10;
  } else if (drugLower.includes('atorvastatin') || drugLower.includes('lipitor')) {
    maxDailyMg = 80;
  } else if (drugLower.includes('diazepam') || drugLower.includes('valium')) {
    maxDailyMg = 30;
  }

  if (maxDailyMg === 0) return defaultResult;

  // Calculate cumulative dosage taken today
  const todayStr = new Date().toISOString().split('T')[0];
  const patientLogsToday = offlineLogs.filter(log => {
    if (log.patientId !== patientId) return false;
    if (log.status !== 'taken') return false;
    
    // Check if scheduled date is today or taken date is today
    const logDate = log.scheduledDate || (log.takenAt ? log.takenAt.split('T')[0] : '');
    return logDate === todayStr;
  });

  let sumMgToday = 0;
  patientLogsToday.forEach(log => {
    // Find the medicine name
    const med = offlineMedicines.find(m => m.id === log.medicineId);
    const mName = med ? med.name.toLowerCase() : '';
    
    // Check if it is the same drug (by substring)
    const isSameDrug = mName.includes(drugLower) || drugLower.includes(mName) || 
                       (mName.includes('paracetamol') && drugLower.includes('paracetamol')) ||
                       (mName.includes('panadol') && drugLower.includes('paracetamol')) ||
                       (mName.includes('panadol') && drugLower.includes('panadol')) ||
                       (mName.includes('amoxicillin') && drugLower.includes('amoxicillin')) ||
                       (mName.includes('ibuprofen') && drugLower.includes('ibuprofen'));

    if (isSameDrug) {
      const parsedMg = parseDosageToMg(log.dosage || med?.dosage || '0');
      if (parsedMg !== null) {
        sumMgToday += parsedMg;
      }
    }
  });

  const totalDailyMg = sumMgToday + currentMg;

  if (totalDailyMg > maxDailyMg) {
    return {
      isValid: false,
      warning: `🚨 CRITICAL OVERDOSE WARNING: This dose of ${dosageStr} (${currentMg}mg) brings today's cumulative intake to ${totalDailyMg}mg, which exceeds the Uganda Clinical Guidelines safe limit of ${maxDailyMg}mg/day for ${medName}! Risk of critical toxicity!`,
      totalDailyMg,
      maxDailyMg
    };
  }

  return {
    isValid: true,
    warning: null,
    totalDailyMg,
    maxDailyMg
  };
}

/**
 * Validates a list of drugs in a single prescription or patient regimen for dangerous drug-drug interactions.
 */
export interface DrugInteractionResult {
  hasConflict: boolean;
  severity: 'critical' | 'moderate' | 'none';
  warning: string | null;
  clinicalExplanation: string | null;
}

export function validateDrugDrugInteractions(medicinesList: { name: string }[]): DrugInteractionResult {
  const result: DrugInteractionResult = {
    hasConflict: false,
    severity: 'none',
    warning: null,
    clinicalExplanation: null
  };

  if (!medicinesList || medicinesList.length < 2) return result;

  const names = medicinesList.map(m => m.name.toLowerCase().trim());

  // 1. Sildenafil / Erectile dysfunction drugs + Nitrates (Isosorbide dinitrate, GTN)
  const hasNitrate = names.some(n => n.includes('nitrate') || n.includes('gtn') || n.includes('glyceryl trinitrate') || n.includes('isosorbide'));
  const hasSildenafil = names.some(n => n.includes('sildenafil') || n.includes('viagra') || n.includes('tadalafil') || n.includes('cialis'));
  if (hasNitrate && hasSildenafil) {
    return {
      hasConflict: true,
      severity: 'critical',
      warning: `🚨 CRITICAL DRUG INTERACTION: Nitrate Vasodilator + Phosphodiesterase-5 (PDE5) Inhibitor combination detected!`,
      clinicalExplanation: `Combining Nitrates (e.g. Glyceryl Trinitrate) with PDE5 inhibitors (e.g. Sildenafil) causes synergistic, extreme nitric-oxide mediated vasodilation. This leads to life-threatening, acute cardiovascular collapse and severe myocardial infarction.`
    };
  }

  // 2. Warfarin / Anticoagulants + Aspirin / NSAIDs
  const hasWarfarin = names.some(n => n.includes('warfarin') || n.includes('coumadin') || n.includes('heparin') || n.includes('clopidogrel'));
  const hasAspirin = names.some(n => n.includes('aspirin') || n.includes('asa') || n.includes('ibuprofen') || n.includes('diclofenac') || n.includes('brufen'));
  if (hasWarfarin && hasAspirin) {
    return {
      hasConflict: true,
      severity: 'critical',
      warning: `🚨 CRITICAL DRUG INTERACTION: Anticoagulant + Antiplatelet/NSAID combination detected!`,
      clinicalExplanation: `Combining systemic anticoagulants (Warfarin/Heparin) with antiplatelet therapy (Aspirin) or NSAIDs (Ibuprofen/Diclofenac) exponentially increases the risk of major, life-threatening gastrointestinal hemorrhage and intracranial bleeding.`
    };
  }

  // 3. ACE Inhibitor + ARB (Double renin-angiotensin-aldosterone blockade)
  const hasACE = names.some(n => n.includes('lisinopril') || n.includes('enalapril') || n.includes('captopril'));
  const hasARB = names.some(n => n.includes('losartan') || n.includes('valsartan') || n.includes('candesartan'));
  if (hasACE && hasARB) {
    return {
      hasConflict: true,
      severity: 'critical',
      warning: `🚨 CRITICAL DRUG INTERACTION: ACE Inhibitor + ARB combination detected!`,
      clinicalExplanation: `Co-administration of an ACE inhibitor (e.g., Lisinopril) and an ARB (e.g., Losartan) causes dual blockade of the RAAS pathway. This significantly elevates the risk of acute kidney injury, profound hypotension, and life-threatening hyperkalemia.`
    };
  }

  // 4. Metformin + Contrast Media / Iodine
  const hasMetformin = names.some(n => n.includes('metformin') || n.includes('glucophage'));
  const hasContrast = names.some(n => n.includes('contrast') || n.includes('iodine') || n.includes('dye') || n.includes('iohexol'));
  if (hasMetformin && hasContrast) {
    return {
      hasConflict: true,
      severity: 'critical',
      warning: `🚨 CRITICAL DRUG INTERACTION: Metformin + Iodine Contrast Agent combination detected!`,
      clinicalExplanation: `Iodinated contrast dye can cause temporary renal impairment, which leads to Metformin accumulation and subsequent lactic acidosis, a metabolic emergency with a 50% clinical mortality rate.`
    };
  }

  // 5. Ciprofloxacin + Ibuprofen
  const hasCipro = names.some(n => n.includes('ciprofloxacin') || n.includes('cipro'));
  const hasIbuprofen = names.some(n => n.includes('ibuprofen') || n.includes('brufen'));
  if (hasCipro && hasIbuprofen) {
    return {
      hasConflict: true,
      severity: 'moderate',
      warning: `⚠️ MODERATE DRUG INTERACTION: Fluoroquinolone + NSAID combination detected!`,
      clinicalExplanation: `Combining Fluoroquinolones (Ciprofloxacin) with NSAIDs (Ibuprofen) can enhance GABA displacement in brain receptors, precipitating neurological excitability and increasing seizure risk.`
    };
  }

  // 6. Simvastatin/Atorvastatin + Amlodipine
  const hasStatin = names.some(n => n.includes('simvastatin') || n.includes('atorvastatin'));
  const hasAmlodipine = names.some(n => n.includes('amlodipine'));
  if (hasStatin && hasAmlodipine) {
    return {
      hasConflict: true,
      severity: 'moderate',
      warning: `⚠️ MODERATE DRUG INTERACTION: Calcium Channel Blocker + Statin combination detected!`,
      clinicalExplanation: `Amlodipine increases systemic exposure of Simvastatin/Atorvastatin by inhibiting CYP3A4 metabolism. This can increase blood levels of the statin, elevating the risk of myopathy, muscle pain, and critical rhabdomyolysis.`
    };
  }

  return result;
}

/**
 * Returns highly-optimized therapeutic hourly times depending on the dosage frequency.
 */
export function getOptimalReminderTimes(frequency: string): string[] {
  const norm = frequency.toLowerCase().trim();
  if (norm.includes('twice') || norm.includes('2 times') || norm.includes('12 hourly') || norm.includes('12-hourly') || norm.includes('bd') || norm.includes('b.i.d')) {
    return ['08:00', '20:00'];
  }
  if (norm.includes('3 times') || norm.includes('thrice') || norm.includes('8 hourly') || norm.includes('8-hourly') || norm.includes('tds') || norm.includes('t.i.d')) {
    return ['06:00', '14:00', '22:00'];
  }
  if (norm.includes('4 times') || norm.includes('6 hourly') || norm.includes('6-hourly') || norm.includes('qds') || norm.includes('q.i.d')) {
    return ['06:00', '12:00', '18:00', '24:00'];
  }
  if (norm.includes('night') || norm.includes('evening') || norm.includes('nocte')) {
    return ['21:00'];
  }
  if (norm.includes('every 6 hours') || norm.includes('every 6h')) {
    return ['06:00', '12:00', '18:00', '24:00'];
  }
  if (norm.includes('every 8 hours') || norm.includes('every 8h')) {
    return ['06:00', '14:00', '22:00'];
  }
  if (norm.includes('every 12 hours') || norm.includes('every 12h')) {
    return ['08:00', '20:00'];
  }
  // Default once daily is morning
  return ['08:00'];
}

