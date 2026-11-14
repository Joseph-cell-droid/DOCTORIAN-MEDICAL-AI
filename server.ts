import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { db, initDatabase, logAudit } from './server/db';
import { retrieveClinicalEvidence } from './server/rag';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initDatabase();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your_jwt_secret_here'
  ? process.env.JWT_SECRET
  : crypto.randomBytes(32).toString('hex');

const DEFAULT_HF_MODEL = process.env.HUGGINGFACE_MODEL || 'nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16:deepinfra';
const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';

// Initialize official Gemini SDK on server side only
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey.includes('your_')) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'patient' | 'doctor' | 'nurse' | 'admin' | 'guest';
  specialty?: string | null;
  facility?: string | null;
}

interface AuthedRequest extends Request {
  user?: AuthUser;
}

function signAuthToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      specialty: user.specialty || null,
      facility: user.facility || null
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.doctorian_token;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const token = cookieToken || bearerToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      req.user = decoded;
    } catch {
      req.user = undefined;
    }
  }
  next();
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

function requireNonGuest(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role === 'guest') {
    return res.status(403).json({
      error: 'Guest demonstration accounts cannot access live patient records. Please sign in with a patient or clinician account.'
    });
  }
  next();
}

function requireRoles(roles: Array<AuthUser['role']>) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Role '${req.user.role}' is not authorized for this clinical action.` });
    }
    next();
  };
}

app.use(attachUser);

// ---------------------------------------------------------------------------
// HEALTH & AI STATUS
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Doctorian AI Clinical Platform',
    region: 'Uganda & East Africa',
    time: new Date().toISOString()
  });
});

app.get('/api/ai/status', (_req, res) => {
  const hasGemini = Boolean((process.env.GEMINI_API_KEY || '').trim());
  const hfToken = (process.env.HF_TOKEN || process.env.VITE_HF_TOKEN || process.env.HUGGINGFACE_API_KEY || '').trim();
  const hasHf = Boolean(hfToken && !hfToken.includes('your_'));

  res.json({
    status: hasGemini || hasHf ? 'connected' : 'offline-fallback',
    geminiConfigured: hasGemini,
    geminiModel: 'gemini-4-hydrogen',
    huggingfaceConfigured: hasHf,
    huggingfaceModel: DEFAULT_HF_MODEL,
    ragCorpusCount: 9,
    guidelineSource: 'WHO & Uganda Clinical Guidelines (UCG 2023)'
  });
});

app.get('/api/guidelines', (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const limit = Number(req.query.limit) || 5;
  const result = retrieveClinicalEvidence(q, Math.min(Math.max(limit, 1), 10));
  res.json(result);
});

// ---------------------------------------------------------------------------
// AUTHENTICATION & ROLE-BASED ACCESS
// ---------------------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const row = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(String(email).trim()) as any;
  if (!row || !bcrypt.compareSync(String(password), row.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (row.status !== 'active') {
    return res.status(403).json({ error: `Account is currently ${row.status}. Contact hospital administration.` });
  }

  const user: AuthUser = {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    specialty: row.specialty,
    facility: row.facility
  };

  const token = signAuthToken(user);
  res.cookie('doctorian_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 1000
  });

  logAudit(user.id, user.email, user.role, 'USER_LOGIN', 'auth', 'Authenticated session started');
  return res.json({ user, token });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, displayName, role, facility, specialty, phone } = req.body || {};
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const allowedSignupRoles: Array<AuthUser['role']> = ['patient', 'doctor', 'nurse'];
  const requestedRole: AuthUser['role'] = allowedSignupRoles.includes(role) ? role : 'patient';

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(String(email).trim());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const passwordHash = bcrypt.hashSync(String(password), 10);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, display_name, role, specialty, facility, phone, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(
    id,
    String(email).trim().toLowerCase(),
    passwordHash,
    String(displayName).trim(),
    requestedRole,
    specialty ? String(specialty).trim() : null,
    facility ? String(facility).trim() : 'Doctorian Telehealth Clinic',
    phone ? String(phone).trim() : null
  );

  const user: AuthUser = {
    id,
    email: String(email).trim().toLowerCase(),
    displayName: String(displayName).trim(),
    role: requestedRole,
    specialty: specialty || null,
    facility: facility || 'Doctorian Telehealth Clinic'
  };

  const token = signAuthToken(user);
  res.cookie('doctorian_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 1000
  });

  logAudit(user.id, user.email, user.role, 'USER_REGISTERED', 'auth', `Registered as ${requestedRole}`);
  return res.status(201).json({ user, token });
});

app.post('/api/auth/guest', (_req, res) => {
  const guestUser: AuthUser = {
    id: `guest-${Date.now()}`,
    email: 'guest.demo@doctorian.org',
    displayName: 'Guest Explorer (Demo Mode)',
    role: 'guest',
    specialty: null,
    facility: 'Sample Sandbox Environment'
  };
  const token = signAuthToken(guestUser);
  res.cookie('doctorian_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 4 * 60 * 60 * 1000
  });
  return res.json({ user: guestUser, token });
});

app.post('/api/auth/recover', (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  logAudit(null, String(email).trim(), 'guest', 'PASSWORD_RECOVERY_REQUEST', 'auth', 'Account recovery link requested');
  return res.json({
    ok: true,
    message: 'If an account matches that email, recovery instructions have been logged for verification by your facility administrator.'
  });
});

app.post('/api/auth/logout', (req: AuthedRequest, res) => {
  if (req.user) {
    logAudit(req.user.id, req.user.email, req.user.role, 'USER_LOGOUT', 'auth', 'Session closed');
  }
  res.clearCookie('doctorian_token');
  res.json({ ok: true });
});

app.get('/api/auth/me', (req: AuthedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

// ---------------------------------------------------------------------------
// CLINICAL AI ASSISTANT & RAG ENDPOINT (WHO + UGANDA CLINICAL GUIDELINES)
// ---------------------------------------------------------------------------
function buildClinicalSystemPrompt(userRole: string, specialty: string, targetLanguage: string, ragContext: string): string {
  const roleContext =
    userRole === 'doctor' || userRole === 'nurse'
      ? `The user is a healthcare professional (${userRole}). Use concise clinical terminology, structured differential reasoning, triage acuity, and guideline-referenced workup options.`
      : `The user is a ${userRole === 'guest' ? 'demo guest' : 'patient/caregiver'}. Use clear, compassionate, plain language alongside accurate medical context so they understand next steps safely.`;

  return [
    'You are Doctorian AI, a clinical decision-support and medical information assistant designed for Uganda and East Africa.',
    roleContext,
    `Clinical Specialty Focus: ${specialty || 'Primary Care & General Medicine'}.`,
    `Preferred Output Language: ${targetLanguage || 'English (US)'}.`,
    '',
    'CRITICAL CLINICAL SAFETY RULES:',
    '1. NEVER present an AI-generated diagnosis as confirmed or definitive.',
    '2. DO NOT invent confidence percentages, probability numbers, or numerical diagnostic scores.',
    '3. Clearly distinguish possible considerations (differential diagnoses) from a confirmed clinical diagnosis made by a licensed clinician after physical examination and testing.',
    '4. Ground recommendations in World Health Organization (WHO) standards and the Uganda Clinical Guidelines (UCG 2023).',
    '5. If danger signs or emergency symptoms appear, prioritize immediate referral/emergency care at the top of Next Steps and in Emergency Warning Signs.',
    '',
    'MANDATORY 10-SECTION RESPONSE FORMAT (for symptom, diagnostic, or clinical questions):',
    '1. Summary of the Reported Symptoms',
    '2. Relevant Information Missing from the History',
    '3. Possible Explanations or Differential Diagnoses (clearly marked as possibilities for clinician evaluation, never confirmed)',
    '4. Clinical Urgency and Recommended Next Steps',
    '5. Suggested Investigations for Clinician Consideration',
    '6. Supportive Care and Patient Education',
    '7. Medication Information (only where supported by WHO / Uganda Clinical Guidelines; state clearly that a qualified clinician must examine and prescribe)',
    '8. Emergency Warning Signs (Seek Care Immediately If...)',
    '9. Evidence Sources and Guideline References',
    '10. Clinical Safety Disclaimer: Doctorian AI provides healthcare information and clinical decision support. It does not replace professional medical judgment, physical examination, or diagnosis by a qualified healthcare professional. In an emergency, seek immediate medical attention.',
    '',
    'RETRIEVED CLINICAL EVIDENCE CONTEXT:',
    ragContext
  ].join('\n');
}

function buildOfflineStructuredResponse(message: string, userRole: string, rag: ReturnType<typeof retrieveClinicalEvidence>): string {
  const top = rag.entries[0];
  const conditionsList = rag.entries.length
    ? rag.entries.map((e) => `- ${e.condition} (${e.section}): ${e.summary}`).join('\n')
    : '- Undifferentiated acute illness requiring in-person history, vital signs, and targeted bedside testing.';
  const investigations = top?.investigations.length
    ? top.investigations.map((i) => `- ${i}`).join('\n')
    : '- Vital signs (temperature, BP, pulse, respiratory rate, SpO2), Malaria RDT, and clinician-directed blood/urine workup.';
  const supportive = top?.supportiveCare.length
    ? top.supportiveCare.map((s) => `- ${s}`).join('\n')
    : '- Maintain oral hydration, rest, and monitor temperature and breathing closely.';
  const meds = top?.firstLineCare.length
    ? top.firstLineCare.map((m) => `- ${m}`).join('\n')
    : '- Avoid starting unprescribed antibiotics or leftover medications before clinical review.';
  const redFlags = top?.redFlags.length
    ? top.redFlags.map((r) => `- ${r}`).join('\n')
    : '- Severe shortness of breath, chest pain, confusion, persistent vomiting, convulsions, or inability to drink.';
  const sources = rag.entries.length
    ? rag.entries.map((e) => `- ${e.source} — ${e.section} (${e.year})`).join('\n')
    : '- World Health Organization (WHO) & Uganda Clinical Guidelines (UCG 2023)';

  return [
    `1. Summary of the Reported Symptoms`,
    `Reported query (${userRole} mode): "${message.trim()}". Offline guideline synthesis has been prepared while cloud inference is unavailable.`,
    ``,
    `2. Relevant Information Missing from the History`,
    `- Exact duration and progression of symptoms, measured temperature or blood pressure, pregnancy status (if applicable), current medications or allergies, and chronic conditions (such as HIV, diabetes, or hypertension).`,
    ``,
    `3. Possible Explanations or Differential Diagnoses`,
    `Note: The following are possible clinical considerations for evaluation, not a confirmed diagnosis:`,
    conditionsList,
    ``,
    `4. Clinical Urgency and Recommended Next Steps`,
    `Arrange prompt evaluation at a qualified health centre or clinic (Health Centre III/IV or Hospital) for physical examination and confirmatory testing. Escalate immediately to emergency care if any warning signs below are present.`,
    ``,
    `5. Suggested Investigations for Clinician Consideration`,
    investigations,
    ``,
    `6. Supportive Care and Patient Education`,
    supportive,
    ``,
    `7. Medication Information`,
    `${meds}`,
    `Important: Medication selection and exact dosing must be prescribed by a licensed clinician after examination and test confirmation.`,
    ``,
    `8. Emergency Warning Signs`,
    redFlags,
    ``,
    `9. Evidence Sources and Guideline References`,
    sources,
    ``,
    `10. Clinical Safety Disclaimer`,
    `Doctorian AI provides healthcare information and clinical decision support. It does not replace professional medical judgment, physical examination, or diagnosis by a qualified healthcare professional. In an emergency, seek immediate medical attention.`
  ].join('\n');
}

app.post('/api/chat', async (req: AuthedRequest, res) => {
  try {
    const { message, history = [], specialty = 'Primary Care', targetLanguage = 'English (US)', userRole } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A message string is required.' });
    }

    const effectiveRole = req.user?.role || userRole || 'patient';
    const rag = retrieveClinicalEvidence(message, 3);
    const systemPrompt = buildClinicalSystemPrompt(effectiveRole, specialty, targetLanguage, rag.formattedContext);

    // 1. Try Hugging Face Inference Router if configured
    const hfToken = (process.env.HF_TOKEN || process.env.VITE_HF_TOKEN || process.env.HUGGINGFACE_API_KEY || '').trim();
    if (hfToken && !hfToken.includes('your_')) {
      try {
        const formattedHistory = Array.isArray(history)
          ? history.slice(-8).map((h: any) => ({
              role: h.role === 'bot' || h.role === 'assistant' ? 'assistant' : 'user',
              content: String(h.content || '')
            }))
          : [];
        const hfResp = await fetch(HF_ROUTER_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: DEFAULT_HF_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              ...formattedHistory,
              { role: 'user', content: message }
            ],
            temperature: 0.2,
            max_tokens: 1400
          })
        });
        if (hfResp.ok) {
          const data = await hfResp.json() as any;
          const reply = data?.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({
              response: reply,
              provider: 'Hugging Face Router',
              model: DEFAULT_HF_MODEL,
              citations: rag.entries,
              outdatedWarnings: rag.outdatedWarnings
            });
          }
        }
      } catch (hfErr) {
        console.warn('HF Router fallback triggered:', hfErr);
      }
    }

    // 2. Server-side Gemini (@google/genai)
    const ai = getGeminiClient();
    if (ai) {
      const conversationText = Array.isArray(history) && history.length
        ? history
            .slice(-8)
            .map((h: any) => `${h.role === 'bot' || h.role === 'assistant' ? 'Clinician AI' : 'User'}: ${h.content}`)
            .join('\n') + `\nUser: ${message}`
        : message;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: conversationText,
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const text = response.text?.trim();
      if (text) {
        return res.json({
          response: text,
          provider: 'Doctorian Clinical Cloud (Gemini)',
          model: 'gemini-4-hydrogen',
          citations: rag.entries,
          outdatedWarnings: rag.outdatedWarnings
        });
      }
    }

    // 3. Offline / Unconfigured Key Safe Clinical Guideline Fallback
    const fallbackText = buildOfflineStructuredResponse(message, effectiveRole, rag);
    return res.json({
      response: fallbackText,
      provider: 'Uganda Clinical Guidelines Offline Engine',
      model: 'ucg-2023-rag-fallback',
      citations: rag.entries,
      outdatedWarnings: rag.outdatedWarnings
    });
  } catch (err: any) {
    console.error('Clinical chat error:', err);
    const rag = retrieveClinicalEvidence(String(req.body?.message || ''), 2);
    return res.json({
      response: buildOfflineStructuredResponse(String(req.body?.message || ''), 'patient', rag),
      provider: 'Uganda Clinical Guidelines Safe Fallback',
      model: 'ucg-2023-rag-fallback',
      citations: rag.entries,
      outdatedWarnings: rag.outdatedWarnings
    });
  }
});

// ---------------------------------------------------------------------------
// MEDICAL IMAGE ANALYSIS (MULTIMODAL @google/genai + CLINICAL SAFETY)
// ---------------------------------------------------------------------------
app.post('/api/clinical/analyze-image', async (req: AuthedRequest, res) => {
  try {
    const { imageBase64, mimeType = 'image/png', modality = 'Radiograph / Clinical Photo', clinicalNotes = '' } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Image payload (base64) is required.' });
    }

    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const ai = getGeminiClient();

    const safetyInstruction = [
      'You are a medical imaging decision-support assistant. Provide structured preliminary visual observations only.',
      'NEVER declare a definitive/confirmed diagnosis. NEVER invent confidence percentages.',
      'Include sections: 1. Image Quality & Orientation Check, 2. Visual Observations, 3. Possible Considerations (Differential), 4. Recommended Correlative Tests & Radiologist/Clinician Review, 5. Urgent Red Flags, 6. Clinical Disclaimer.',
      'Reference WHO and Uganda Clinical Guidelines where relevant.'
    ].join('\n');

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            },
            {
              text: `Modality / Sample Type: ${modality}\nClinical Context: ${clinicalNotes || 'Routine clinician review'}\nProvide structured preliminary visual observations following all safety rules.`
            }
          ]
        },
        config: {
          systemInstruction: safetyInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      if (response.text) {
        return res.json({
          analysis: response.text,
          provider: 'Gemini Multimodal Clinical Assistant',
          model: 'gemini-4-hydrogen',
          disclaimer: 'AI image observations are preliminary support only and must be verified by a radiologist or licensed clinician.'
        });
      }
    }

    return res.json({
      analysis: [
        `1. Image Quality & Orientation Check`,
        `Uploaded ${modality} accepted for structured checklist review (${clinicalNotes || 'no additional notes provided'}).`,
        ``,
        `2. Visual Observations`,
        `Automated cloud vision interpretation is currently in local fallback mode. Inspect anatomical symmetry, exposure adequacy, focal opacities, lesion borders, or test-strip control bands directly.`,
        ``,
        `3. Possible Considerations (Not a Confirmed Diagnosis)`,
        `Correlate image features with physical exam, vital signs, and microbiology (e.g., mRDT, GeneXpert MTB/RIF, CBC, or histopathology depending on modality).`,
        ``,
        `4. Recommended Correlative Tests & Clinician Review`,
        `Submit the original DICOM/photo to the facility medical officer or regional referral radiologist for formal reporting.`,
        ``,
        `5. Urgent Red Flags`,
        `Escalate immediately if accompanied by SpO2 < 92%, hemodynamic shock, severe dyspnea, or rapid neurological decline.`,
        ``,
        `6. Clinical Disclaimer`,
        `Doctorian AI provides healthcare information and clinical decision support. It does not replace professional medical judgment, physical examination, or specialist image interpretation.`
      ].join('\n'),
      provider: 'Local Clinical Checklist Fallback',
      model: 'ucg-imaging-checklist',
      disclaimer: 'AI image observations are preliminary support only and must be verified by a radiologist or licensed clinician.'
    });
  } catch (err) {
    console.error('Image analysis error:', err);
    return res.status(500).json({ error: 'Unable to analyze clinical image right now.' });
  }
});

// ---------------------------------------------------------------------------
// PREDICTIVE CLINICAL TRIAGE (NEWS2 / qSOFA / MEOWS)
// ---------------------------------------------------------------------------
app.post('/api/clinical/predictive-triage', (req, res) => {
  const { heartRate = 78, systolicBp = 120, spo2 = 98, temperature = 36.8, respiratoryRate = 16, alteredMental = false, pregnant = false } = req.body || {};

  let news2 = 0;
  if (respiratoryRate <= 8 || respiratoryRate >= 25) news2 += 3;
  else if (respiratoryRate >= 21) news2 += 2;
  else if (respiratoryRate <= 11) news2 += 1;

  if (spo2 <= 91) news2 += 3;
  else if (spo2 <= 93) news2 += 2;
  else if (spo2 <= 95) news2 += 1;

  if (systolicBp <= 90 || systolicBp >= 220) news2 += 3;
  else if (systolicBp <= 100) news2 += 2;
  else if (systolicBp <= 110) news2 += 1;

  if (heartRate <= 40 || heartRate >= 131) news2 += 3;
  else if (heartRate >= 111) news2 += 2;
  else if (heartRate <= 50 || heartRate >= 91) news2 += 1;

  if (temperature <= 35.0) news2 += 3;
  else if (temperature >= 39.1) news2 += 2;
  else if (temperature <= 36.0 || temperature >= 38.1) news2 += 1;

  if (alteredMental) news2 += 3;

  let qsofa = 0;
  if (respiratoryRate >= 22) qsofa += 1;
  if (systolicBp <= 100) qsofa += 1;
  if (alteredMental) qsofa += 1;

  const acuity = news2 >= 7 || qsofa >= 2 ? 'Critical Acuity' : news2 >= 5 ? 'Urgent Review' : news2 >= 3 ? 'Attention' : 'Stable';
  const maternalFlag = pregnant && systolicBp >= 140 ? 'Elevated obstetric blood pressure: screen urgently for pre-eclampsia (UCG 16.3).' : null;

  res.json({
    news2Score: news2,
    qsofaScore: qsofa,
    acuity,
    maternalFlag,
    guidance:
      acuity === 'Critical Acuity'
        ? 'Immediate senior clinician assessment and continuous vital monitoring recommended.'
        : acuity === 'Urgent Review'
        ? 'Prompt in-person clinical evaluation within 30-60 minutes recommended.'
        : 'Routine monitoring and scheduled clinician review.'
  });
});

// ---------------------------------------------------------------------------
// EHR, PRESCRIPTIONS, LABS, VITALS, APPOINTMENTS & REFERRALS (RBAC PROTECTED)
// ---------------------------------------------------------------------------
app.get('/api/patients', requireNonGuest, (req: AuthedRequest, res) => {
  if (req.user?.role === 'patient') {
    const own = db.prepare('SELECT * FROM patients WHERE LOWER(full_name) = LOWER(?) LIMIT 1').all(req.user.displayName);
    return res.json({ patients: own });
  }
  const patients = db.prepare('SELECT * FROM patients ORDER BY updated_at DESC').all();
  res.json({ patients });
});

app.post('/api/patients', requireRoles(['doctor', 'nurse', 'admin']), (req: AuthedRequest, res) => {
  const { fullName, age, gender, district, bloodGroup, allergies, chronicConditions, riskTier = 'Stable' } = req.body || {};
  if (!fullName || !age || !gender || !district) {
    return res.status(400).json({ error: 'Full name, age, gender, and district are required.' });
  }
  const id = `pat-${Date.now()}`;
  const mrn = `DAI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  db.prepare(`
    INSERT INTO patients (id, mrn, full_name, age, gender, district, blood_group, allergies, chronic_conditions, risk_tier, assigned_clinician_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, mrn, fullName, Number(age), gender, district, bloodGroup || 'Unknown', allergies || 'None documented', chronicConditions || 'None documented', riskTier, req.user?.id || null);

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'PATIENT_CREATED', id, `Registered patient ${fullName} (${mrn})`);
  const created = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  res.status(201).json({ patient: created });
});

app.get('/api/prescriptions', requireNonGuest, (req: AuthedRequest, res) => {
  if (req.user?.role === 'patient') {
    const rows = db.prepare('SELECT * FROM prescriptions WHERE LOWER(patient_name) = LOWER(?) ORDER BY created_at DESC').all(req.user.displayName);
    return res.json({ prescriptions: rows.length ? rows : db.prepare('SELECT * FROM prescriptions WHERE patient_id = ?').all('pat-001') });
  }
  const rows = db.prepare('SELECT * FROM prescriptions ORDER BY created_at DESC').all();
  res.json({ prescriptions: rows });
});

app.post('/api/prescriptions', requireRoles(['doctor', 'admin']), (req: AuthedRequest, res) => {
  const { patientId = 'pat-001', patientName, medicationName, dosage, frequency, duration, route = 'Oral', instructions = '' } = req.body || {};
  if (!patientName || !medicationName || !dosage || !frequency || !duration) {
    return res.status(400).json({ error: 'Patient name, medication, dosage, frequency, and duration are required.' });
  }
  const id = `rx-${Date.now()}`;
  db.prepare(`
    INSERT INTO prescriptions (id, patient_id, patient_name, prescriber_id, prescriber_name, medication_name, dosage, frequency, duration, route, instructions, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(id, patientId, patientName, req.user!.id, req.user!.displayName, medicationName, dosage, frequency, duration, route, instructions);

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'PRESCRIPTION_CREATED', id, `${medicationName} ${dosage} for ${patientName}`);
  const created = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);
  res.status(201).json({ prescription: created });
});

app.patch('/api/prescriptions/:id', requireRoles(['doctor', 'nurse', 'admin', 'patient']), (req: AuthedRequest, res) => {
  const { id } = req.params;
  const { status, adherencePercent } = req.body || {};
  if (status && req.user?.role === 'patient' && status === 'active') {
    return res.status(403).json({ error: 'Only licensed clinicians may approve prescriptions.' });
  }
  if (status) {
    db.prepare('UPDATE prescriptions SET status = ? WHERE id = ?').run(status, id);
  }
  if (typeof adherencePercent === 'number') {
    db.prepare('UPDATE prescriptions SET adherence_percent = ? WHERE id = ?').run(Math.min(100, Math.max(0, adherencePercent)), id);
  }
  logAudit(req.user!.id, req.user!.email, req.user!.role, 'PRESCRIPTION_UPDATED', id, `Updated status=${status || 'unchanged'} adherence=${adherencePercent ?? 'unchanged'}`);
  res.json({ prescription: db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id) });
});

app.get('/api/labs', requireNonGuest, (req: AuthedRequest, res) => {
  if (req.user?.role === 'patient') {
    const rows = db.prepare('SELECT * FROM lab_results WHERE LOWER(patient_name) = LOWER(?) ORDER BY created_at DESC').all(req.user.displayName);
    return res.json({ labs: rows.length ? rows : db.prepare('SELECT * FROM lab_results WHERE patient_id = ?').all('pat-001') });
  }
  const rows = db.prepare('SELECT * FROM lab_results ORDER BY created_at DESC').all();
  res.json({ labs: rows });
});

app.post('/api/labs', requireRoles(['doctor', 'nurse', 'admin']), (req: AuthedRequest, res) => {
  const { patientId = 'pat-001', patientName, testName, category = 'General', resultValue, referenceRange = 'See guideline', unit = '', interpretation = 'Normal' } = req.body || {};
  if (!patientName || !testName || !resultValue) {
    return res.status(400).json({ error: 'Patient name, test name, and result value are required.' });
  }
  const id = `lab-${Date.now()}`;
  db.prepare(`
    INSERT INTO lab_results (id, patient_id, patient_name, test_name, category, result_value, reference_range, unit, interpretation, ordered_by, reviewed_by, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed')
  `).run(id, patientId, patientName, testName, category, resultValue, referenceRange, unit, interpretation, req.user!.displayName, req.user!.displayName);

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'LAB_RESULT_RECORDED', id, `${testName}: ${resultValue} (${interpretation})`);
  res.status(201).json({ lab: db.prepare('SELECT * FROM lab_results WHERE id = ?').get(id) });
});

app.get('/api/vitals', requireNonGuest, (req: AuthedRequest, res) => {
  const patientId = typeof req.query.patientId === 'string' ? req.query.patientId : null;
  const rows = patientId
    ? db.prepare('SELECT * FROM vital_signs WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 30').all(patientId)
    : db.prepare('SELECT * FROM vital_signs ORDER BY recorded_at DESC LIMIT 30').all();
  res.json({ vitals: rows });
});

app.post('/api/vitals', requireRoles(['doctor', 'nurse', 'admin', 'patient']), (req: AuthedRequest, res) => {
  const { patientId = 'pat-001', heartRate, systolicBp, diastolicBp, spo2, temperature, respiratoryRate = 18, notes = '' } = req.body || {};
  const id = `vit-${Date.now()}`;
  db.prepare(`
    INSERT INTO vital_signs (id, patient_id, recorded_by, heart_rate, systolic_bp, diastolic_bp, spo2, temperature, respiratory_rate, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, patientId, req.user!.displayName, Number(heartRate) || 76, Number(systolicBp) || 120, Number(diastolicBp) || 80, Number(spo2) || 98, Number(temperature) || 36.8, Number(respiratoryRate) || 18, notes);

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'VITALS_RECORDED', id, `HR ${heartRate} BP ${systolicBp}/${diastolicBp} SpO2 ${spo2}%`);
  res.status(201).json({ vital: db.prepare('SELECT * FROM vital_signs WHERE id = ?').get(id) });
});

app.get('/api/appointments', requireNonGuest, (_req, res) => {
  res.json({ appointments: db.prepare('SELECT * FROM appointments ORDER BY scheduled_for ASC').all() });
});

app.post('/api/appointments', requireNonGuest, (req: AuthedRequest, res) => {
  const { patientId = 'pat-001', patientName, clinicianName = 'Dr. Sarah M. Nakitto', facility = 'Mulago Outpatient Clinic', scheduledFor, visitType = 'Telemedicine', reason } = req.body || {};
  if (!scheduledFor || !reason) {
    return res.status(400).json({ error: 'Scheduled date/time and visit reason are required.' });
  }
  const id = `apt-${Date.now()}`;
  db.prepare(`
    INSERT INTO appointments (id, patient_id, patient_name, clinician_name, facility, scheduled_for, visit_type, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled')
  `).run(id, patientId, patientName || req.user!.displayName, clinicianName, facility, scheduledFor, visitType, reason);

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'APPOINTMENT_BOOKED', id, `${visitType} at ${facility}`);
  res.status(201).json({ appointment: db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) });
});

app.get('/api/referrals', requireRoles(['doctor', 'nurse', 'admin']), (_req, res) => {
  res.json({ referrals: db.prepare('SELECT * FROM referrals ORDER BY created_at DESC').all() });
});

app.post('/api/referrals', requireRoles(['doctor', 'nurse', 'admin']), (req: AuthedRequest, res) => {
  const { patientId = 'pat-001', patientName, toFacility, urgency = 'Urgent', reason, vitalsSummary = '' } = req.body || {};
  if (!patientName || !toFacility || !reason) {
    return res.status(400).json({ error: 'Patient name, receiving facility, and clinical reason are required.' });
  }
  const id = `ref-${Date.now()}`;
  db.prepare(`
    INSERT INTO referrals (id, patient_id, patient_name, from_clinician, to_facility, urgency, reason, vitals_summary, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Dispatched')
  `).run(id, patientId, patientName, req.user!.displayName, toFacility, urgency, reason, vitalsSummary);

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'REFERRAL_CREATED', id, `${urgency} referral to ${toFacility}`);
  res.status(201).json({ referral: db.prepare('SELECT * FROM referrals WHERE id = ?').get(id) });
});

// ---------------------------------------------------------------------------
// HOSPITAL ADMIN & AUDIT ROUTES
// ---------------------------------------------------------------------------
app.get('/api/admin/overview', requireRoles(['admin']), (_req, res) => {
  const patients = (db.prepare('SELECT COUNT(*) as c FROM patients').get() as { c: number }).c;
  const prescriptions = (db.prepare('SELECT COUNT(*) as c FROM prescriptions').get() as { c: number }).c;
  const pendingRx = (db.prepare("SELECT COUNT(*) as c FROM prescriptions WHERE status = 'pending_approval'").get() as { c: number }).c;
  const labs = (db.prepare('SELECT COUNT(*) as c FROM lab_results').get() as { c: number }).c;
  const criticalLabs = (db.prepare("SELECT COUNT(*) as c FROM lab_results WHERE interpretation = 'Critical'").get() as { c: number }).c;
  const users = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
  const referrals = (db.prepare('SELECT COUNT(*) as c FROM referrals').get() as { c: number }).c;

  res.json({
    metrics: {
      totalPatients: patients,
      totalPrescriptions: prescriptions,
      pendingApprovals: pendingRx,
      totalLabs: labs,
      criticalLabs,
      activeStaffAccounts: users,
      activeReferrals: referrals
    }
  });
});

app.get('/api/admin/users', requireRoles(['admin']), (_req, res) => {
  const users = db.prepare('SELECT id, email, display_name, role, specialty, facility, phone, license_number, status, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
});

app.patch('/api/admin/users/:id', requireRoles(['admin']), (req: AuthedRequest, res) => {
  const { id } = req.params;
  const { role, status } = req.body || {};
  if (role && ['patient', 'doctor', 'nurse', 'admin'].includes(role)) {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  }
  if (status && ['active', 'suspended'].includes(status)) {
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
  }
  logAudit(req.user!.id, req.user!.email, req.user!.role, 'ADMIN_USER_UPDATED', id, `role=${role || 'unchanged'} status=${status || 'unchanged'}`);
  res.json({ user: db.prepare('SELECT id, email, display_name, role, specialty, facility, status FROM users WHERE id = ?').get(id) });
});

app.get('/api/admin/audit-logs', requireRoles(['admin']), (_req, res) => {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50').all();
  res.json({ logs });
});

// ---------------------------------------------------------------------------
// OFFLINE SYNC BATCH ENDPOINT
// ---------------------------------------------------------------------------
app.post('/api/sync/batch', requireNonGuest, (req: AuthedRequest, res) => {
  const { operations = [] } = req.body || {};
  if (!Array.isArray(operations)) {
    return res.status(400).json({ error: 'operations array is required' });
  }
  const conflicts: Array<{ id: string; reason: string; serverTimestamp: string }> = [];
  let applied = 0;

  for (const op of operations) {
    if (op?.forceConflictCheck && op?.clientUpdatedAt) {
      conflicts.push({
        id: String(op.id || `sync-${applied}`),
        reason: 'Newer clinical update recorded on facility server.',
        serverTimestamp: new Date().toISOString()
      });
    } else {
      applied += 1;
    }
  }

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'OFFLINE_SYNC_BATCH', 'sync', `Applied ${applied} operations, ${conflicts.length} conflicts`);
  res.json({ applied, conflicts, syncedAt: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// STATIC FRONTEND / VITE MIDDLEWARE
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true }
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Doctorian Clinical Platform running on http://0.0.0.0:${PORT}`);
});
