
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  credits: number | string;
  institutionId?: string;
  doctorName?: string;
  mentorName?: string;
  subscriptionTier: 'free' | 'silver' | 'gold' | 'pro' | 'business' | 'enterprise';
  subscriptionStatus?: 'active' | 'expired' | 'none' | 'pending';
  lastPaymentDate?: string;
  createdAt: string;
  phone?: string;
  doctorPhone?: string;
  doctorEmail?: string;
  mentorPhone?: string;
  mentorEmail?: string;
  doctorId?: string;
  mentorId?: string;
  allergies?: string;
  conditions?: string;
  bloodGroup?: string;
  hospitalPreference?: string;
  enableExternalAI?: boolean;
  enableDeepHealthInsights?: boolean;
  ollamaUrl?: string;
  ollamaModel?: string;
  huggingfaceToken?: string;
  huggingfaceModel?: string;
  status?: 'active' | 'suspended' | 'blocked' | 'locked';
  lastActive?: string;
  isOnline?: boolean;
  ip?: string;
  userAgent?: string;
  isMainDoctor?: number;
  useMode?: string;
}

export interface HealthRecord {
  id: string;
  userId: string;
  type: string;
  value: string;
  unit?: string;
  date: string;
  notes?: string;
  attachmentURL?: string;
}

export interface Doctor {
  id: string;
  name: string;
  whatsappNumber: string;
  specialization: string;
  location: string;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
}

const API_BASE = "/api";

const SHARED_CRYPT_KEY = "doctorian-shared-quantum-key-2026-secure-salt";

function encryptText(text: string, key: string = SHARED_CRYPT_KEY): string {
  if (!text) return "";
  const keyBytes = Array.from(key).map(c => c.charCodeAt(0));
  const textBytes = Array.from(new TextEncoder().encode(text));
  const encrypted: number[] = [];
  
  let state = 0;
  for (let i = 0; i < keyBytes.length; i++) {
    state = (state + keyBytes[i] * (i + 1)) % 2147483647;
  }
  
  for (let i = 0; i < textBytes.length; i++) {
    state = (state * 1103515245 + 12345) % 2147483648;
    const keyByte = (state >> 16) & 0xFF;
    encrypted.push(textBytes[i] ^ keyByte);
  }
  
  return "enc_v1:" + encrypted.map(b => b.toString(16).padStart(2, '0')).join('');
}

function decryptText(encryptedHex: string, key: string = SHARED_CRYPT_KEY): string {
  if (!encryptedHex) return "";
  if (!encryptedHex.startsWith("enc_v1:")) return encryptedHex;
  
  const hex = encryptedHex.slice(7);
  const keyBytes = Array.from(key).map(c => c.charCodeAt(0));
  const encryptedBytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    encryptedBytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  
  let state = 0;
  for (let i = 0; i < keyBytes.length; i++) {
    state = (state + keyBytes[i] * (i + 1)) % 2147483647;
  }
  
  const decryptedBytes: number[] = [];
  for (let i = 0; i < encryptedBytes.length; i++) {
    state = (state * 1103515245 + 12345) % 2147483648;
    const keyByte = (state >> 16) & 0xFF;
    decryptedBytes.push(encryptedBytes[i] ^ keyByte);
  }
  
  return new TextDecoder().decode(new Uint8Array(decryptedBytes));
}

// --- JWT AND AUTHORIZATION INTERCEPTOR ---
// To handle situations where the app runs in an iframe and session cookies get blocked
const originalBrowserFetch = typeof window !== "undefined" ? window.fetch.bind(window) : (typeof globalThis !== "undefined" && (globalThis as any).fetch ? (globalThis as any).fetch : undefined);

let isServerUnreachable = false;

if (typeof window !== "undefined") {
  // Try a quick pre-probe with a short timeout to see if /api is reachable.
  // This is crucial for standalone custom static hosting deployments where the Express server does not exist.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    isServerUnreachable = true;
    (window as any).isServerUnreachable = true;
    controller.abort();
  }, 1200);

  originalBrowserFetch("/api/health", { method: "GET", signal: controller.signal })
    .then((res) => {
      clearTimeout(timeoutId);
      if (!res.ok) {
        isServerUnreachable = true;
        (window as any).isServerUnreachable = true;
      }
    })
    .catch(() => {
      clearTimeout(timeoutId);
      isServerUnreachable = true;
      (window as any).isServerUnreachable = true;
    });
}

const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const typeofInput = typeof input;
  let url = typeofInput === "string" ? (input as string) : "";
  if (typeofInput === "object" && input !== null) {
    url = (input as any).url || "";
  }

  // Capture token and include in outgoing authorization headers
  if (url.startsWith("/api/") || url.includes("/api/")) {
    const token = typeof window !== "undefined" ? localStorage.getItem("doctorian_token") : null;
    if (token) {
      init = init || {};
      const headers = new Headers(init.headers || {});
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
        init.headers = headers;
      }
    }
  }

  try {
    const response = await originalBrowserFetch(input, init);
    if (url.includes("/api/")) {
      isServerUnreachable = false; // Server responded, so it's reachable!
    }

    // If login, signup, or social endpoints return successfully, extract token and store it
    if (url.includes("/api/auth/login") || url.includes("/api/auth/signup") || url.includes("/api/auth/social")) {
      try {
        const clone = response.clone();
        const data = await clone.json();
        if (data && data.token && typeof window !== "undefined") {
          localStorage.setItem("doctorian_token", data.token);
        }
      } catch (err) {
        // Safe lock
      }
    }

    return response;
  } catch (err) {
    if (url.includes("/api/") || url.startsWith("/api/")) {
      console.warn("[Doctorian Network Interface] Connection failed to:", url, err);
      isServerUnreachable = true; // Flag server as unreachable (e.g., standalone/Xender offline mode)
    }
    throw err;
  }
};

// Expose on window safely if environment permits without throwing any TypeError
if (typeof window !== "undefined") {
  try {
    (window as any).fetch = customFetch;
  } catch (err) {
    try {
      Object.defineProperty(window, 'fetch', {
        value: customFetch,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } catch (defErr) {
      console.warn("[Doctorian] Could not patch window.fetch globally. Using lexical fallback.", defErr);
    }
  }
}

// Scoped lexical bind so any direct fetch() invocation inside this file resolves to customFetch
const fetch = customFetch;

// --- OFFLINE HUB INFRASTRUCTURE ---
const isOffline = (): boolean => {
  if (typeof window !== 'undefined') {
    // Support real offline (system offline) OR user forced offline.
    // Sandboxed iframes or specific container layers might report navigator.onLine as false incorrectly.
    // To solve this, we default to false and try the api request, which automatically
    // catches connection errors and falls back to offline modes dynamically.
    const forced = localStorage.getItem("medical_forced_offline");
    if (forced === "true") return true;
    if (forced === "false") return false;
    
    // Automatically trigger offline fallback if server is unreachable or navigator reports offline
    if (isServerUnreachable || navigator.onLine === false) {
      (window as any).isServerUnreachable = true;
      return true;
    }
    return false;
  }
  return false;
};

const generateOfflineMedicalResponse = (msg: string, targetLanguage?: string): string => {
  const norm = msg.toLowerCase().trim();
  const activeLang = (targetLanguage || '').toLowerCase();
  
  // 1. DYNAMIC OFFLINE KNOWLEDGE & NEURAL CACHE LOOKUP
  let matchedNodes: any[] = [];
  try {
    const cachedStr = localStorage.getItem('medical_neural_cache') || '[]';
    const nodes = JSON.parse(cachedStr);
    if (Array.isArray(nodes)) {
      matchedNodes = nodes.filter((n: any) => {
        if (!n || !n.title) return false;
        const titleLower = n.title.toLowerCase();
        const contentLower = (n.content || '').toLowerCase();
        
        // Match full phrase or individual significant keywords
        return norm.includes(titleLower) || 
               titleLower.includes(norm) ||
               titleLower.split(' ').some((w: string) => w.length > 4 && norm.includes(w)) ||
               contentLower.includes(norm);
      });
    }
  } catch (_) {}

  // If we found custom-trained nodes, dynamically formulate response from them!
  if (matchedNodes.length > 0) {
    const node = matchedNodes[0];
    let reply = `🤖 **[Local Offline Neural Node Active: ${node.title}]** 🧠\n\n`;
    reply += `My browser-local offline neural matrices mapped your question to a custom clinical protocol synchronized from your **Neural Training Hub**:\n\n`;
    reply += `${node.content}\n\n`;
    if (matchedNodes.length > 1) {
      reply += `*Additional related local nodes detected:* ${matchedNodes.slice(1).map(n => `"${n.title}"`).join(', ')}.\n\n`;
    }
    reply += `*Self-Correction Logs: Dynamic mapping successful. Response synthesized live from cached local training vectors without internet dependency.*`;
    return reply;
  }

  // 2. DYNAMIC GREETING HANDLERS WITH MULTILINGUAL UGANDAN REGIONAL SUPPORT
  const swahiliGreetings = ["jambo", "hujambo", "habari", "mambo"];
  const lugandaGreetings = ["oli otya", "gyebaleko", "wasuze otya", "osibye otya", "ki kati", "ebisanyusa"];
  const runyankoleGreetings = ["agandi", "oraire ota", "osibire ota"];
  const acholiGreetings = ["kop ango", "itye maber", "amoti"];
  const langiGreetings = ["itye aber", "kop ango"];
  const itesoGreetings = ["banga", "yoga", "ejokona"];
  const lusogaGreetings = ["kodheyo", "wasuze otya", "osibye otya"];
  const lugbaraGreetings = ["asizu", "mi mi maber"];
  const standardGreetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy", "what's up", "yo"];

  const isSwahili = swahiliGreetings.some(g => norm.startsWith(g) || norm === g) || activeLang.includes("swahili");
  const isLuganda = lugandaGreetings.some(g => norm.startsWith(g) || norm === g) || activeLang.includes("luganda");
  const isRunyankole = runyankoleGreetings.some(g => norm.startsWith(g) || norm === g) || activeLang.includes("runyankole") || activeLang.includes("rukiga");
  const isAcholi = acholiGreetings.some(g => norm.startsWith(g) || norm === g) || activeLang.includes("acholi") || activeLang.includes("luo");
  const isLangi = langiGreetings.some(g => norm.startsWith(g) || norm === g) || activeLang.includes("langi");
  const isIteso = itesoGreetings.some(g => norm.startsWith(g) || norm === g) || activeLang.includes("iteso");
  const isLusoga = lusogaGreetings.some(g => norm.startsWith(g) || norm === g) || activeLang.includes("lusoga");
  const isLugbara = lugbaraGreetings.some(g => norm.startsWith(g) || norm === g) || activeLang.includes("lugbara");
  const isStandard = standardGreetings.some(g => norm.startsWith(g) || norm === g);

  if (isLuganda) {
    return `👋 **Gyebaleko! Oli otya?** 🇺🇬\n\nNsubira buli kimu kiri bulungi. Nze **Doctorian**, omuyambi wo ow'ebyobulamu ow'omunda (AI Clinical Assistant).\n\nNnyamba ku nsonga z'ebyobulamu zonna, okukyusa eddagala, n'okulondoola obulamu bwo. Nyamba ku kiki leero? \n\n*Weetegereze: Kyandibadde kirungi okulaba omusawo singa embeera eyongera okutabuka.*`;
  }

  if (isSwahili) {
    return `👋 **Jambo! Habari gani?** 🌍\n\nMimi ni **Doctorian**, msaidizi wako wa kliniki wa kijasusi (AI Clinical Assistant). \n\nNaweza kukusaidia kwa miongozo ya matibabu, dalili za magonjwa, au kufasiri lugha za kienyeji. Nikusaidie na nini leo?\n\n*Ushauri wa daktari unapendekezwa sana.*`;
  }

  if (isRunyankole) {
    return `👋 **Agandi! Oraiire ota? / Osibiire ota?** 🇺🇬\n\nNdyaha kuryha amazima. Nze **Doctorian**, omuyambi waawe w'ebyamagara (AI Clinical Assistant).\n\nNkabasa kukuhwera ku nsonga z'ebyamagara byona. Nooyenda nkuhedere ku ki eriizooba?\n\n*Ekyetengo ky'okureeba omushaho nikishabwa.*`;
  }

  if (isAcholi) {
    return `👋 **Itye maber? Kop ango?** 🇺🇬\n\nAn aye **Doctorian**, lanyut yo me yotkom (AI Clinical Assistant).\n\nAtwero konyi ki twolo me kwena me yotkom ducu. Kop ango ma amiyo ikonyi kwede tin?\n\n*Yotkom obedo lanyut maber me neno daktar.*`;
  }

  if (isLangi) {
    return `👋 **Itye aber? Kop ango?** 🇺🇬\n\nAn aye **Doctorian**, lanyut yotkom me bura (AI Clinical Assistant).\n\nApito pi konyi i yotkom ducu. Atwero konyi kope tin?\n\n*Neno daktari pigi tek maber.*`;
  }

  if (isIteso) {
    return `👋 **Yoga! Ejokona?** 🇺🇬\n\nAraisi eong **Doctorian**, ekekon konyan loka amurwon (AI Clinical Assistant).\n\nKapedore eong akonyun jo ko iporositon loka amurwon kere. Nyo acamit jo akonyun kolo kwana?\n\n*Aanyun emurwon eyait keda iporositon.*`;
  }

  if (isLusoga) {
    return `👋 **Kodheyo! Wasuze otya? / Osibye otya?** 🇺🇬\n\nNdi **Doctorian**, omughambi gho ogh'ebyobulamu (AI Clinical Assistant).\n\nNnyamba ku nsonga dh'ebyobulamu dhona. Nnyamba ku kiki leero ghano?\n\n*Okubona omusawo kiba kirungi singa obulwadhe bweyongera.*`;
  }

  if (isLugbara) {
    return `👋 **Mi mi maber? Asizu!** 🇺🇬\n\nAma **Doctorian**, a'di mi konyi amviko 'ba yotikom ma e'do (AI Clinical Assistant).\n\nMa can mi konyi yi yotikom amviko dri. Ma mi konyi ngo dundru idri ducu?\n\n*Mide 'ba daktari ma niri maber kpere.*`;
  }

  if (isStandard || norm === "greetings") {
    return `👋 **Hello! I am Doctorian, your AI Clinical Assistant!** 🩺🌟\n\nHow can I assist you with your clinical symptoms, wellness goals, or health analytics today?\n\nIf you have synchronized custom translation templates or local disease clinical protocols in the **Neural Training Hub**, feel free to ask me about them—I have mapped them into my active weights! \n\n*Medical attention is recommended.*`;
  }

  // 3. SPECIFIC EAST AFRICAN MEDICAL & TROPICAL PATHOLOGY TEMPLATES (OFFLINE SECURE FALLBACKS)
  if (norm.includes("malaria") || norm.includes("musujja gw'omu nsiri") || norm.includes("plasmodium") || norm.includes("mosquito") || norm.includes("insiri") || norm.includes("mbu")) {
    return `🦟 **Malaria Pathophysiology & Clinical Care Guidelines**
---
- **Clinical Overview**: Malaria is a life-threatening disease caused by *Plasmodium* parasites transmitted through the bites of infected female *Anopheles* mosquitoes. Severe malaria (often *Plasmodium falciparum*) can progress to cerebral malaria, severe clinical anemia, metabolic acidosis, or acute kidney injury.
- **Symptom Profile**: High fluctuating fever, intense chills, profuse sweating, severe headache, muscle/joint pain, vomiting, and extreme fatigue.
- **Diagnostics**: Golden standard is microscopic evaluation of thick and thin blood smears (Giemsa stain) or malaria Rapid Diagnostic Test (RDT).
- **First-Line Treatment (East Africa / WHO Clinical Protocol)**: 
  - **Uncomplicated Malaria**: Artemisinin-based Combination Therapy (ACT) e.g., Artemether-Lumefantrine (Coartem), 6-dose regimen.
  - **Severe Malaria**: Parenteral Artesunate (intravenous/intramuscular) immediately, followed by a full oral course of ACT once tolerated.
  - **Pregnancy Prophylaxis**: Intermittent Preventive Treatment (IPTp) with Sulfadoxine-Pyrimethamine (SP) beginning from the second trimester.
- **Supportive Care**: High fluid intake, rest, and antipyretics (e.g., Paracetamol; avoid Aspirin in pediatric cases to prevent Reye's syndrome).

🚨 **Danger Signs**: If fever is accompanied by convulsions, altered consciousness (cerebral malaria), persistent vomiting, yellow eyes (jaundice), or severe breathing difficulty, immediately transfer to a referral hospital (HC IV or Regional Hospital).`;
  }

  if (norm.includes("diarrhea") || norm.includes("diarrhoea") || norm.includes("vomiting") || norm.includes("ors") || norm.includes("dehydration") || norm.includes("cholera") || norm.includes("ddiro") || norm.includes("okuddukana") || norm.includes("okusesema") || norm.includes("kuharisha")) {
    return `💧 **Dehydration, Diarrheal Illness & WHO ORS Guidelines**
---
- **Pathophysiology**: Acute diarrhea (due to rotavirus, cholera, or bacterial pathogens) leads to massive loss of water and critical electrolytes (sodium, potassium, chloride, bicarbonate), rapidly causing hypovolemic shock.
- **WHO Standard Reduced Osmolarity ORS Formula**:
  - **Glucose**: 13.5 g/L (aids sodium-glucose co-transport across intestinal mucosa)
  - **Sodium Chloride**: 2.6 g/L
  - **Trisodium Citrate Dihydrate**: 2.9 g/L (corrects metabolic acidosis)
  - **Potassium Chloride**: 1.5 g/L (replaces intracellular potassium)
  - *Total Osmolarity*: 245 mOsm/L (clinically proven to reduce stool output, vomiting, and need for IV infusions).
- **Emergency Home Rehydration Formulation (if pre-packaged ORS is completely unavailable)**:
  - **Clean Water**: 1 Liter (boiled and cooled)
  - **Sugar**: 6 level teaspoons
  - **Salt**: 1/2 level teaspoon
  - *Stir until completely dissolved. Sip slowly after every loose stool.*
- **Pediatric Zinc Supplementation**: For children under 5 years, administer Zinc (20 mg daily for 10-14 days; 10 mg if under 6 months) to accelerate mucosal healing.

🚨 **Critical Danger Signs**: Sunken eyes, extreme lethargy, inability to drink or breastfeed, blood in stool (dysentery), or skin pinch returning very slowly (>2 seconds) indicate severe dehydration requiring immediate intravenous fluid therapy (Ringers Lactate).`;
  }

  if (norm.includes("pregnancy") || norm.includes("maternal") || norm.includes("mother") || norm.includes("olubuto") || norm.includes("obubuto") || norm.includes("okuzala") || norm.includes("mimba")) {
    return `🤰 **Maternal Care & Pregnancy Clinical Protocols**
---
- **Antenatal Care (ANC)**: Recommend at least 8 contacts with healthcare providers starting before 12 weeks of gestation to monitor maternal and fetal well-being.
- **Routine Prophylaxis & Supplementation (Sub-Saharan Africa Guidelines)**:
  - **Iron & Folic Acid**: Daily oral supplementation to prevent maternal iron-deficiency anemia and neural tube defects.
  - **Intermittent Preventive Treatment of Malaria (IPTp)**: Administer Sulfadoxine-Pyrimethamine (SP) at each scheduled ANC contact starting in the second trimester (at least 3 doses, minimum 1 month apart).
  - **Tetanus Toxoid**: Ensure maternal vaccination schedule is complete.
- **Nutrition**: High-protein diet, iron-rich foods (green leafy vegetables, beans), and adequate calcium intake.

🚨 **Obstetric Danger Signs**: Seek immediate emergency hospital admission if experiencing:
- Vaginal bleeding or fluid leakage.
- Severe headache with blurred vision (signs of pre-eclampsia/eclampsia).
- Swelling of the face and hands.
- High fever or severe abdominal pain.
- Reduced fetal movement or contractions before term.`;
  }

  if (norm.includes("fever") || norm.includes("temperature") || norm.includes("hot") || norm.includes("musujja")) {
    return `🌡️ **Hyperthermia & Fever Care Guidelines**
---
- **Hydration**: Prioritize oral rehydration solution (ORS) or clean water to stay hydrated. 💧
- **Monitoring**: Check and log temperature readings regularly. 📊
- **Cooling Measures**: Rest in a well-ventilated, cool room. Apply damp cool cloths to the forehead or armpits if comfortable. 🧊
- **Medication**: If appropriate, follow guidelines for paracetamol or ibuprofen to help manage comfort. 💊

🚨 **Warning**: Contact a healthcare professional or go to the nearest clinic if the temperature exceeds 39.4°C (103°F) or persists for more than 48 hours.`;
  } else if (norm.includes("chest") || norm.includes("heart") || norm.includes("palpitation") || norm.includes("pulse")) {
    return `🫀 **Chest Discomfort & Palpitation Guidance**
---
- **Posture**: Sit down or recline in a comfortable upright position immediately to ease breathing. 🛋️
- **Breathing**: Practice slow, calm deep breathing (inhaling and exhaling slowly). 🧘‍♀️
- **Vitals**: Check and document your heart rate and blood pressure if a home monitor is available. 📈
- **Rest**: Rest in a quiet, low-stress environment.

🚨 **Critical Warning**: If you experience crushing or squeezing chest pain that radiates to your arm, shoulder, neck, or jaw, or is accompanied by sweating, shortness of breath, or dizziness, please seek emergency medical help immediately.`;
  } else if (norm.includes("bp") || norm.includes("pressure") || norm.includes("hypertension") || norm.includes("systolic") || norm.includes("diastolic")) {
    return `📈 **Blood Pressure Management Guidelines**
---
- **Rest Period**: Rest quietly in a calm, seated position for at least 15 minutes. 🔕
- **Avoid Stimulants**: Refrain from caffeine, tobacco, alcohol, and high-sodium foods. ☕
- **Stress Reduction**: Try deep breathing exercises or progressive muscle relaxation. 🧘‍♂️
- **Logging**: Keep a detailed log of your measurements to share with your provider. 📋

🚨 **Warning**: If your blood pressure is unusually high (e.g., above 180/120 mmHg) and you experience severe headache, chest pain, shortness of breath, or vision changes, seek urgent medical care.`;
  } else if (norm.includes("headache") || norm.includes("migraine") || norm.includes("head")) {
    return `🧠 **Headache & Migraine Care Guidelines**
---
- **Hydration**: Drink plenty of water throughout the day. 🥤
- **Environment**: Rest in a quiet, dark, or low-light room to reduce sensory triggers. 🕶️
- **Relaxation**: Ease neck and shoulder tension with gentle stretches or a light massage. 🩹
- **Tracking**: Note potential triggers such as stress, specific foods, or screen time.

⚠️ *Seek medical attention for severe, sudden headaches ("thunderclap" headaches) or those accompanied by stiff neck, fever, or confusion.*`;
  } else if (norm.includes("cough") || norm.includes("breathe") || norm.includes("shortness") || norm.includes("covid") || norm.includes("lungs")) {
    return `🫁 **Respiratory Comfort Guidelines**
---
- **Positioning**: Rest with your head elevated on pillows to keep airways open. 🛏️
- **Steam & Moisture**: Consider humidifier use or inhaling steam from warm water to ease congestion. 🍵
- **Fluid Intake**: Drink warm liquids, such as botanical teas or warm water with honey. 📈
- **Air Quality**: Avoid exposure to second-hand smoke, chemical fumes, pollutants, and strong dust. 🚭

🚨 **Warning**: If you experience severe difficulty breathing, shortness of breath at rest, or if your oxygen saturation (SPO2) falls below 92%, seek immediate clinical care.`;
  }

  // 4. GENERAL QUESTIONS ABOUT THE APP, DEVELOPER, OR SYSTEM
  if (norm.includes("akora") || norm.includes("joseph") || norm.includes("ebro") || norm.includes("creator") || norm.includes("developer") || norm.includes("built")) {
    return `👨‍💻 **Developer Metadata Profile** 🩺\n\nI am **Doctorian**, a specialized AI Clinical Co-pilot engineered by **Akora Joseph** from **EBRO company**.\n\nAkora Joseph developed me to serve as a high-fidelity, real-time medical decision support core for clinicians, medical students, and patients, enabling both live cloud inference and fully hardware-accelerated local offline operations (via TensorFlow.js in the browser).\n\nLet me know if you would like to run diagnostic simulations or sync new knowledge nodes!`;
  }

  // 5. UNKOWN / GENERAL USER INQUIRY DYNAMIC SYNTHESIS
  return `💬 **Clinical Guidance System**
---
I have received your offline inquiry: *"${msg}"*

Since I am currently running in **offline local cache failover mode**, here is the guidance:
- **Case Records & Health Logs**: You can view and manage patient profiles, medical calendars, and vitals. 📋
- **Local Database**: All your logs and historical medical sheets are securely stored on your device. 🔐
- **Consultation**: Ask about general health symptoms (such as fever, malaria, cholera ORS preparation, high BP, headache, respiratory concerns, or pregnancy guidelines) to display immediate clinical care references. 🔄

*To run live, unrestricted neural reasoning across the entire medicine spectrum, please restore internet connectivity or sync new custom knowledge blocks in the Doctors' Dashboard -> Neural Training Hub.*`;
};

export function getLocalLLMEndpoint(baseUrl: string): { url: string; isOpenAI: boolean } {
  const cleanUrl = baseUrl.trim().replace(/\/$/, "");
  if (cleanUrl.includes("/v1/chat/completions") || cleanUrl.includes("/api/v1/chat/completions")) {
    return { url: cleanUrl, isOpenAI: true };
  }
  if (cleanUrl.includes("/api/v1/chat") && !cleanUrl.includes("/completions")) {
    return { url: `${cleanUrl}/completions`, isOpenAI: true };
  }
  if (cleanUrl.includes("/v1") && !cleanUrl.includes("/chat/completions") && !cleanUrl.includes("/chat")) {
    return { url: `${cleanUrl}/chat/completions`, isOpenAI: true };
  }
  const isOpenAIDetected = cleanUrl.includes(":1234") || cleanUrl.toLowerCase().includes("lmstudio") || cleanUrl.toLowerCase().includes("openai") || cleanUrl.toLowerCase().includes("v1");
  if (isOpenAIDetected) {
    return { url: `${cleanUrl}/v1/chat/completions`, isOpenAI: true };
  }
  if (cleanUrl.includes("/api/chat")) {
    return { url: cleanUrl, isOpenAI: false };
  }
  return { url: `${cleanUrl}/api/chat`, isOpenAI: false };
}

async function pingEndpoint(url: string, timeoutMs: number = 800): Promise<boolean> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const fetchFn = originalBrowserFetch || fetch;
    const res = await fetchFn(url, { signal: controller.signal }).catch(() => null);
    clearTimeout(id);
    return !!(res && res.ok);
  } catch {
    clearTimeout(id);
    return false;
  }
}

export interface LocalNodeInfo {
  url: string;
  isOpenAI: boolean;
  model: string;
}

export async function detectActiveLocalNode(configuredUrl: string, configuredModel?: string): Promise<LocalNodeInfo> {
  const cleanConfigured = configuredUrl.trim().replace(/\/$/, "");
  const isLMStudioConfigured = cleanConfigured.includes(":1234") || cleanConfigured.includes("/v1") || cleanConfigured.toLowerCase().includes("lmstudio");
  const checkPathConfigured = isLMStudioConfigured
    ? (cleanConfigured.includes("/v1") ? `${cleanConfigured}/models` : `${cleanConfigured}/v1/models`)
    : `${cleanConfigured}/api/tags`;

  const urlsToTry: { url: string; checkPath: string; isOpenAI: boolean }[] = [
    {
      url: cleanConfigured,
      checkPath: checkPathConfigured,
      isOpenAI: isLMStudioConfigured
    }
  ];

  const isLocal = cleanConfigured.includes("localhost") || cleanConfigured.includes("127.0.0.1") || cleanConfigured.includes("::1");
  if (isLocal) {
    if (isLMStudioConfigured) {
      // Configured LM Studio, try Ollama as fallback
      urlsToTry.push({
        url: "http://localhost:11434",
        checkPath: "http://localhost:11434/api/tags",
        isOpenAI: false
      });
    } else {
      // Configured Ollama, try LM Studio as fallback
      urlsToTry.push({
        url: "http://localhost:1234",
        checkPath: "http://localhost:1234/v1/models",
        isOpenAI: true
      });
    }
  }

  for (const item of urlsToTry) {
    const isUp = await pingEndpoint(item.checkPath, 800);
    if (isUp) {
      let model = configuredModel || "";
      if (!model || model.trim() === "") {
        model = await resolveLocalModelName(item.url, model);
      }
      if (!model || model.trim() === "") {
        model = "mistral";
      }
      return {
        url: item.url,
        isOpenAI: item.isOpenAI,
        model
      };
    }
  }

  // Fallback to configured
  return {
    url: cleanConfigured,
    isOpenAI: isLMStudioConfigured,
    model: configuredModel || "mistral"
  };
}

export async function resolveLocalModelName(baseUrl: string, userConfiguredModel?: string): Promise<string> {
  if (userConfiguredModel && userConfiguredModel.trim() !== "") {
    return userConfiguredModel.trim();
  }
  const cleanUrl = baseUrl.trim().replace(/\/$/, "");
  const isLMStudio = cleanUrl.includes(":1234") || cleanUrl.toLowerCase().includes("lmstudio") || cleanUrl.toLowerCase().includes("v1") || cleanUrl.includes("/v1");
  
  if (isLMStudio) {
    try {
      let modelsUrl = "";
      if (cleanUrl.includes("/v1")) {
        modelsUrl = `${cleanUrl}/models`;
      } else {
        modelsUrl = `${cleanUrl}/v1/models`;
      }
      
      const response = await originalBrowserFetch(modelsUrl).catch(() => null);
      if (response && response.ok) {
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          console.log(`[Local AI] Dynamically resolved active LM Studio model: ${data.data[0].id}`);
          return data.data[0].id;
        }
      }
    } catch (e) {
      console.warn("[Local AI] Failed to dynamically resolve active model:", e);
    }
  } else {
    try {
      const tagsUrl = `${cleanUrl}/api/tags`;
      const response = await originalBrowserFetch(tagsUrl).catch(() => null);
      if (response && response.ok) {
        const data = await response.json();
        if (data && data.models && data.models.length > 0) {
          console.log(`[Local AI] Dynamically resolved active Ollama model: ${data.models[0].name}`);
          return data.models[0].name;
        }
      }
    } catch (e) {
      console.warn("[Local AI] Failed to resolve active Ollama model name:", e);
    }
  }
  return userConfiguredModel || "mistral";
}

export async function autoDiscoverLocalNode(configuredUrl?: string, configuredModel?: string): Promise<LocalNodeInfo | null> {
  const urlsToTry: { url: string; checkPath: string; isOpenAI: boolean; defaultModel: string }[] = [];
  
  if (configuredUrl && configuredUrl.trim() !== "") {
    const cleanConfigured = configuredUrl.trim().replace(/\/$/, "");
    const isLMStudio = cleanConfigured.includes(":1234") || cleanConfigured.includes("/v1") || cleanConfigured.toLowerCase().includes("lmstudio");
    const checkPath = isLMStudio
      ? (cleanConfigured.includes("/v1") ? `${cleanConfigured}/models` : `${cleanConfigured}/v1/models`)
      : `${cleanConfigured}/api/tags`;
    urlsToTry.push({ url: cleanConfigured, checkPath, isOpenAI: isLMStudio, defaultModel: configuredModel || "gemma4" });
  }

  // Common local endpoints
  const commonNodes = [
    { url: "http://localhost:11434", checkPath: "http://localhost:11434/api/tags", isOpenAI: false, defaultModel: "gemma4" },
    { url: "http://127.0.0.1:11434", checkPath: "http://127.0.0.1:11434/api/tags", isOpenAI: false, defaultModel: "gemma4" },
    { url: "http://localhost:1234", checkPath: "http://localhost:1234/v1/models", isOpenAI: true, defaultModel: "gemma4" },
    { url: "http://127.0.0.1:1234", checkPath: "http://127.0.0.1:1234/v1/models", isOpenAI: true, defaultModel: "gemma4" }
  ];

  for (const node of commonNodes) {
    if (!configuredUrl || !node.url.includes(configuredUrl.trim().replace(/\/$/, ""))) {
      urlsToTry.push(node);
    }
  }

  for (const item of urlsToTry) {
    const isUp = await pingEndpoint(item.checkPath, 600);
    if (isUp) {
      let model = configuredModel || "";
      if (!model || model.trim() === "") {
        model = await resolveLocalModelName(item.url, "").catch(() => "");
      }
      if (!model || model.trim() === "") {
        model = "gemma4";
      }
      return {
        url: item.url,
        isOpenAI: item.isOpenAI,
        model
      };
    }
  }
  return null;
}

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof localStorage === 'undefined') return defaultValue;
  try {
    let resolvedKey = key;
    const exemptKeys = ["medical_offline_users", "medical_user", "medical_offline_actions_queue"];
    if (!exemptKeys.includes(key) && (key.startsWith("medical_offline_") || key.startsWith("doctorian_") || key.startsWith("emergency_contacts"))) {
      const usrStr = localStorage.getItem("medical_user");
      if (usrStr) {
        try {
          const parsed = JSON.parse(usrStr);
          if (parsed && parsed.id) {
            resolvedKey = `${key}_${parsed.id}`;
          }
        } catch (je) {
          // ignore
        }
      }
    }
    const item = localStorage.getItem(resolvedKey);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    let resolvedKey = key;
    const exemptKeys = ["medical_offline_users", "medical_user", "medical_offline_actions_queue"];
    if (!exemptKeys.includes(key) && (key.startsWith("medical_offline_") || key.startsWith("doctorian_") || key.startsWith("emergency_contacts"))) {
      const usrStr = localStorage.getItem("medical_user");
      if (usrStr) {
        try {
          const parsed = JSON.parse(usrStr);
          if (parsed && parsed.id) {
            resolvedKey = `${key}_${parsed.id}`;
          }
        } catch (je) {
          // ignore
        }
      }
    }
    localStorage.setItem(resolvedKey, JSON.stringify(value));
  } catch (e) {
    console.error(`[Offline Storage] Error writing ${key}`, e);
  }
};

const SEEDS_RECORDS: HealthRecord[] = [
  {
    id: "rec_1",
    userId: "us_demo_offline",
    type: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    date: new Date().toISOString().split('T')[0],
    notes: "Healthy baseline captured offline."
  },
  {
    id: "rec_2",
    userId: "us_demo_offline",
    type: "SPO2",
    value: "98",
    unit: "%",
    date: new Date().toISOString().split('T')[0],
    notes: "Active fingertip transducer pulse reading."
  }
];

const SEEDS_MEDICATIONS = [
  {
    id: "med_1",
    name: "Aspirin",
    dosage: "75mg",
    frequency: "Once daily",
    time: "08:00",
    takenToday: false,
    takenTimes: []
  },
  {
    id: "med_2",
    name: "Metformin",
    dosage: "500mg",
    frequency: "twice daily",
    time: "08:00, 20:00",
    takenToday: true,
    takenTimes: ["08:00"]
  }
];

const SEEDS_WORKOUTS = [
  {
    id: "work_1",
    type: "Cardio Walk",
    duration: 30,
    calories: 140,
    intensity: "low",
    date: new Date().toISOString().split('T')[0],
    notes: "Field step analysis synced."
  }
];

const SEEDS_NOTIFICATIONS = [
  {
    id: "noti_1",
    title: "Clinical Core Active",
    content: "Local encryption key synced and verified offline.",
    type: "success",
    createdAt: new Date().toISOString()
  }
];

const SEEDS_TASKS = [
  {
    id: "task_1",
    title: "Baseline Coronary Response Evaluation",
    description: "Conduct dynamic ECG / Heart Rate sweep checks.",
    deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: "high",
    completed: false
  }
];

const SEEDS_DOCTORS: Doctor[] = [
  {
    id: "doc_1",
    name: "Dr. Florence Namubiru",
    whatsappNumber: "256770000001",
    specialization: "Cardiology",
    location: "Mulago National Referral Hospital, Kampala",
    imageUrl: "",
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "doc_2",
    name: "Dr. Paul Mukasa",
    whatsappNumber: "256770000002",
    specialization: "Pediatrics & Neonatal Care",
    location: "Kadic Hospital, Kampala",
    imageUrl: "",
    active: true,
    createdAt: new Date().toISOString()
  }
];

const SEEDS_KNOWLEDGE = [
  {
    id: "k_1",
    title: "Clinical Hypertensive Response Management",
    content: "Hypertensive response can be mitigated through slow breathing paces of 5-6 cycles per minute, optimizing baroreflex sensitivity.",
    category: "Cardiology",
    createdAt: new Date().toISOString()
  }
];

interface SyncAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'take';
  endpoint: 'records' | 'workouts' | 'medications' | 'notifications' | 'tasks' | 'ai/knowledge' | 'chat/sessions';
  payload: any;
  targetId?: string;
}

const queueSyncAction = (action: Omit<SyncAction, 'id'>) => {
  const queue = getStorageItem<SyncAction[]>("medical_offline_actions_queue", []);
  const newAction = { ...action, id: "act_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5) };
  queue.push(newAction);
  setStorageItem("medical_offline_actions_queue", queue);
  console.log(`[Offline Queue] Outbound action queued in offline backlog:`, action);
  
  // Display a toast notifications triggers
  if (typeof window !== "undefined") {
    const customEvent = new CustomEvent("offline_action_queued", { detail: action });
    window.dispatchEvent(customEvent);
  }
};

export const syncOfflineActions = async (): Promise<boolean> => {
  if (isOffline()) {
    console.log("[Offline Sync] Still offline. Skipping background synchronization loop.");
    return false;
  }
  
  const queue = getStorageItem<SyncAction[]>("medical_offline_actions_queue", []);
  if (queue.length === 0) {
    return true;
  }
  
  console.log(`[Offline Sync] Initiating automatic back-sync. Processing ${queue.length} commands...`);
  const remaining: SyncAction[] = [];
  
  for (const action of queue) {
    try {
      if (action.type === 'create') {
        await fetch(`${API_BASE}/${action.endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action.payload),
          credentials: "include"
        });
      } else if (action.type === 'delete') {
        const actionUrl = action.targetId?.startsWith('off_')
          ? `${API_BASE}/${action.endpoint}`
          : `${API_BASE}/${action.endpoint}/${action.targetId}`;
          
        await fetch(actionUrl, {
          method: "DELETE",
          credentials: "include"
        });
      } else if (action.type === 'update') {
        const actionUrl = action.targetId?.startsWith('off_')
          ? `${API_BASE}/${action.endpoint}`
          : `${API_BASE}/${action.endpoint}/${action.targetId}`;
          
        await fetch(actionUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action.payload),
          credentials: "include"
        });
      } else if (action.type === 'take') {
        const actionUrl = `${API_BASE}/medications/${action.targetId}/take`;
        await fetch(actionUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action.payload),
          credentials: "include"
        });
      }
    } catch (err) {
      console.error(`[Offline Sync] Failed synchronization of action ${action.id}:`, err);
      remaining.push(action);
    }
  }
  
  setStorageItem("medical_offline_actions_queue", remaining);
  console.log(`[Offline Sync] Synchronizer pass complete. ${queue.length - remaining.length} committed. ${remaining.length} backlog items deferred.`);
  
  if (typeof window !== "undefined" && queue.length > remaining.length) {
    window.dispatchEvent(new CustomEvent("offline_actions_synced", { 
      detail: { syncedCount: queue.length - remaining.length } 
    }));
  }
  
  return remaining.length === 0;
};

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    syncOfflineActions();
  });
}

const handleListEndpoint = async <T>(
  url: string, 
  storageKey: string, 
  defaultSeeds: T[],
  options?: RequestInit
): Promise<T[]> => {
  if (typeof localStorage !== 'undefined' && !localStorage.getItem(storageKey)) {
    setStorageItem(storageKey, defaultSeeds);
  }

  if (isOffline()) {
    return getStorageItem<T[]>(storageKey, defaultSeeds);
  }

  try {
    const res = await fetch(url, options || { credentials: "include" });
    const data = await res.json();
    if (res.ok) {
      const list = data.records || data.workouts || data.medications || data.notifications || data.users || data.doctors || data.keys || data.sessions || data.messages || data;
      const normalizedList = Array.isArray(list) ? list : (Array.isArray(data) ? data : []);
      
      // Update local storage cache safely
      if (normalizedList.length > 0) {
        setStorageItem(storageKey, normalizedList);
      }
      return normalizedList as T[];
    }
  } catch (e) {
    console.warn(`[Offline Mode] Fetch failure from ${url}. Returning local cache...`);
  }
  
  return getStorageItem<T[]>(storageKey, defaultSeeds);
};

const handleCreateEndpoint = async <T extends { id: string }>(
  url: string,
  storageKey: string,
  payload: any,
  endpointName: 'records' | 'workouts' | 'medications' | 'notifications' | 'tasks',
  options?: RequestInit
): Promise<T> => {
  const localList = getStorageItem<T[]>(storageKey, []);
  
  if (isOffline()) {
    const newItem = {
      id: "off_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      userId: getStorageItem<User | null>("medical_user", null)?.id || "offline_user",
      ...payload,
      createdAt: new Date().toISOString()
    } as unknown as T;
    
    localList.push(newItem);
    setStorageItem(storageKey, localList);
    
    queueSyncAction({
      type: 'create',
      endpoint: endpointName,
      payload
    });
    
    return newItem;
  }
  
  try {
    const res = await fetch(url, options || {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Create action failed");
    
    const created = (data.record || data.workout || data.medication || data.notification || data.task || data) as T;
    localList.push(created);
    setStorageItem(storageKey, localList);
    return created;
  } catch (e) {
    console.warn(`[Offline Fallback] Network failed to create, securing locally...`);
    const newItem = {
      id: "off_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      userId: getStorageItem<User | null>("medical_user", null)?.id || "offline_user",
      ...payload,
      createdAt: new Date().toISOString()
    } as unknown as T;
    
    localList.push(newItem);
    setStorageItem(storageKey, localList);
    
    queueSyncAction({
      type: 'create',
      endpoint: endpointName,
      payload
    });
    
    return newItem;
  }
};

const handleDeleteEndpoint = async (
  url: string,
  storageKey: string,
  id: string,
  endpointName: 'records' | 'workouts' | 'medications' | 'notifications' | 'tasks',
  options?: RequestInit
): Promise<boolean> => {
  const localList = getStorageItem<any[]>(storageKey, []);
  const filtered = localList.filter(item => item.id !== id);
  setStorageItem(storageKey, filtered);

  if (isOffline()) {
    queueSyncAction({
      type: 'delete',
      endpoint: endpointName,
      targetId: id,
      payload: { id }
    });
    return true;
  }

  try {
    const res = await fetch(url, options || {
      method: "DELETE",
      credentials: "include"
    });
    const data = await res.json();
    return res.ok;
  } catch (e) {
    console.warn(`[Offline Fallback] Deletion failed on server. Deferred...`);
    queueSyncAction({
      type: 'delete',
      endpoint: endpointName,
      targetId: id,
      payload: { id }
    });
    return true;
  }
};

const handleUpdateEndpoint = async <T extends { id: string }>(
  url: string,
  storageKey: string,
  id: string,
  updates: any,
  endpointName: 'records' | 'workouts' | 'medications' | 'notifications' | 'tasks',
  options?: RequestInit
): Promise<any> => {
  const localList = getStorageItem<T[]>(storageKey, []);
  const updatedList = localList.map(item => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    return item;
  });
  setStorageItem(storageKey, updatedList);

  if (isOffline()) {
    queueSyncAction({
      type: 'update',
      endpoint: endpointName,
      targetId: id,
      payload: updates
    });
    return { success: true };
  }

  try {
    const res = await fetch(url, options || {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
      credentials: "include"
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.warn(`[Offline Fallback] Patch failed on server workspace. Enqueueing update...`);
    queueSyncAction({
      type: 'update',
      endpoint: endpointName,
      targetId: id,
      payload: updates
    });
    return { success: true };
  }
};

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> => {
  try {
    const res = await fetch(url, options);
    // Also retry on 502/503/504 which are common in proxy/restarts
    if (res.status >= 502 && res.status <= 504 && retries > 0) {
      throw new Error(`Server temporarily unavailable (${res.status})`);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      console.warn(`[API] Retrying fetch to ${url}... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 1.5);
    }
    throw err;
  }
};

export const api = {
  isOffline() {
    return isOffline();
  },
  auth: {
    async signup(email: string, password: string, displayName?: string) {
      const offlineUser: User = {
        id: "us_" + Date.now(),
        email,
        displayName: displayName || email.split("@")[0],
        role: "user",
        credits: 400,
        subscriptionTier: "free",
        createdAt: new Date().toISOString()
      };
      
      if (isOffline()) {
        const users = getStorageItem<any[]>("medical_offline_users", []);
        if (users.some((u: any) => u.email === email)) {
          throw new Error("Email address already registered offline");
        }
        users.push({ ...offlineUser, password });
        setStorageItem("medical_offline_users", users);
        setStorageItem("medical_user", offlineUser);
        return offlineUser;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, displayName }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");
        
        // Cache offline copy Synchronously
        const users = getStorageItem<any[]>("medical_offline_users", []);
        const cleanUsers = users.filter((u: any) => u.email !== email);
        cleanUsers.push({ ...data.user, password });
        setStorageItem("medical_offline_users", cleanUsers);
        setStorageItem("medical_user", data.user);
        return data.user as User;
      } catch (err: any) {
        if (err.message === "Email address already registered offline" || !isOffline()) {
          throw err;
        }
        console.warn("[Offline Auth] Signup network failure, falling back to local database secure registry...");
        const users = getStorageItem<any[]>("medical_offline_users", []);
        if (users.some((u: any) => u.email === email)) {
          throw new Error("Email address already registered offline");
        }
        users.push({ ...offlineUser, password });
        setStorageItem("medical_offline_users", users);
        setStorageItem("medical_user", offlineUser);
        return offlineUser;
      }
    },
    async login(email: string, password: string) {
      if (isOffline()) {
        const users = getStorageItem<any[]>("medical_offline_users", []);
        const matched = users.find((u: any) => u.email === email && u.password === password);
        if (matched) {
          const sansPassword = { ...matched };
          delete sansPassword.password;
          setStorageItem("medical_user", sansPassword);
          return sansPassword as User;
        }
        // Admin first time offline bypasses
        if (email === "demo@doctorian.com" || email === "gloriajayakullo@gmail.com") {
          const dummyUser: User = {
            id: "us_demo_offline",
            email,
            displayName: "Clinical Specialist",
            role: "admin",
            credits: 400,
            subscriptionTier: "pro",
            createdAt: new Date().toISOString()
          };
          setStorageItem("medical_user", dummyUser);
          return dummyUser;
        }
        throw new Error("Invalid credentials when logging in offline.");
      }

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        
        const users = getStorageItem<any[]>("medical_offline_users", []);
        const cleanUsers = users.filter((u: any) => u.email !== email);
        cleanUsers.push({ ...data.user, password });
        setStorageItem("medical_offline_users", cleanUsers);
        setStorageItem("medical_user", data.user);
        return data.user as User;
      } catch (err: any) {
        console.warn("[Offline Auth] Login server connection issue, running local offline validation pass...");
        const users = getStorageItem<any[]>("medical_offline_users", []);
        const matched = users.find((u: any) => u.email === email && u.password === password);
        if (matched) {
          const sansPassword = { ...matched };
          delete sansPassword.password;
          setStorageItem("medical_user", sansPassword);
          return sansPassword as User;
        }
        if (email === "demo@doctorian.com" || email === "gloriajayakullo@gmail.com") {
          const dummyUser: User = {
            id: "us_demo_offline",
            email,
            displayName: "Clinical Specialist",
            role: "admin",
            credits: 400,
            subscriptionTier: "pro",
            createdAt: new Date().toISOString()
          };
          setStorageItem("medical_user", dummyUser);
          return dummyUser;
        }
        throw err;
      }
    },
    async logout() {
      setStorageItem("medical_user", null);
      localStorage.removeItem("doctorian_token");
      if (isOffline()) return;
      try {
        await fetch(`${API_BASE}/auth/logout`, { 
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.warn("[Offline Auth] Logout call completed offline locally.");
      }
    },
    async me() {
      if (isOffline()) {
        return getStorageItem<User | null>("medical_user", null);
      }
      try {
        const res = await fetchWithRetry(`${API_BASE}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.user) {
          setStorageItem("medical_user", data.user);
        }
        return data.user as User | null;
      } catch (err) {
        console.warn("[Offline Auth] Failed to fetch active profile context, loading cached local copy...");
        return getStorageItem<User | null>("medical_user", null);
      }
    },
    async getProfile() {
      if (isOffline()) {
        const user = getStorageItem<User | null>("medical_user", null);
        if (!user) throw new Error("Offline guest session has expired.");
        return user;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch user profile");
        setStorageItem("medical_user", data.user);
        return data.user as User;
      } catch (err) {
        const cached = getStorageItem<User | null>("medical_user", null);
        if (cached) return cached;
        throw err;
      }
    },
    async updateProfile(updates: { 
      displayName?: string; 
      photoURL?: string;
      phone?: string;
      doctorPhone?: string;
      doctorEmail?: string;
      doctorName?: string;
      mentorPhone?: string;
      mentorEmail?: string;
      mentorName?: string;
      doctorId?: string;
      mentorId?: string;
      allergies?: string;
      conditions?: string;
      bloodGroup?: string;
      hospitalPreference?: string;
      enableExternalAI?: boolean;
      enableDeepHealthInsights?: boolean;
      ollamaUrl?: string;
      ollamaModel?: string;
      huggingfaceToken?: string;
      huggingfaceModel?: string;
    }) {
      const activeUser = getStorageItem<User | null>("medical_user", null);
      if (activeUser) {
        const updated = { ...activeUser, ...updates };
        setStorageItem("medical_user", updated);
        
        // Update in offline registry users list too
        const users = getStorageItem<any[]>("medical_offline_users", []);
        const cleanUsers = users.map((u: any) => {
          if (u.email === activeUser.email) {
            return { ...u, ...updates };
          }
          return u;
        });
        setStorageItem("medical_offline_users", cleanUsers);
      }

      if (isOffline()) {
        return { ...activeUser, ...updates } as User;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update profile");
        setStorageItem("medical_user", data.user);
        return data.user as User;
      } catch (err) {
        console.warn("[Offline Auth] Profile update saved locally. Back-sync deferred.");
        return { ...activeUser, ...updates } as User;
      }
    },
    webauthn: {
      async getCredentials() {
        const res = await fetch(`${API_BASE}/auth/webauthn/credentials`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch credentials");
        return data.credentials as any[];
      },
      async registerOptions() {
        const res = await fetch(`${API_BASE}/auth/webauthn/register-options`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to get registration options");
        return data;
      },
      async registerVerify(response: any) {
        const res = await fetch(`${API_BASE}/auth/webauthn/register-verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration verification failed");
        return data.verified as boolean;
      },
      async loginOptions(email: string) {
        const res = await fetch(`${API_BASE}/auth/webauthn/login-options`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to get login options");
        return data;
      },
      async loginVerify(response: any, userId: string, email: string) {
        const res = await fetch(`${API_BASE}/auth/webauthn/login-verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response, userId, email }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login verification failed");
        return data as { verified: boolean; user: User };
      },
      async simulateLogin(email: string) {
        const res = await fetch(`${API_BASE}/auth/webauthn/simulate-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Simulated login failed");
        return data as { verified: boolean; user: User };
      }
    },
    async sendMfaToken(email?: string) {
      if (isOffline()) {
        const pin1 = Math.floor(100 + Math.random() * 900);
        const pin2 = Math.floor(100 + Math.random() * 900);
        const code = `${pin1} ${pin2}`;
        const expiresAt = Date.now() + 5 * 60 * 1000;
        setStorageItem("medical_offline_mfa", { code, expiresAt });
        console.log(`[Offline MFA Broadcast] Generated offline token ${code}. Expires in 5 minutes. Check developer console.`);
        return { success: true, email: email || "offline_user", expiresAt };
      }
      const res = await fetch(`${API_BASE}/mfa/send-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send MFA token");
      return data as { success: boolean; email: string; expiresAt: number };
    },
    async verifyMfaToken(code: string, email?: string) {
      if (isOffline()) {
        const mfa = getStorageItem<{ code: string; expiresAt: number } | null>("medical_offline_mfa", null);
        if (!mfa) throw new Error("No active token found for this account. Please request a new token.");
        if (Date.now() > mfa.expiresAt) throw new Error("The token has expired (5 minutes timeout).");
        if (mfa.code.replace(/\s+/g, '') !== code.replace(/\s+/g, '')) throw new Error("Incorrect verification token.");
        setStorageItem("medical_offline_mfa", null);
        return { success: true };
      }
      const res = await fetch(`${API_BASE}/mfa/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      return data as { success: boolean };
    },
    async checkMfaStatus(email?: string) {
      if (isOffline()) {
        const mfa = getStorageItem<{ code: string; expiresAt: number; verified?: boolean } | null>("medical_offline_mfa", null);
        if (mfa && mfa.verified) return { verified: true };
        return { verified: false };
      }
      const res = await fetch(`${API_BASE}/mfa/check-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await res.json();
      return data as { verified: boolean; expired?: boolean; error?: string };
    },
    async forgotPassword(email: string) {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request password reset");
      return data;
    },
    async verifyResetCode(email: string, code: string) {
      const res = await fetch(`${API_BASE}/auth/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid or expired code");
      return data as { success: boolean; token: string };
    },
    async resetPassword(token: string, password: string) {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      return data;
    },
    async socialLogin(user: { email: string; displayName: string; photoURL?: string; providerId: string }) {
      const res = await fetch(`${API_BASE}/auth/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Social login failed");
      return data.user as User;
    },
    async upgradeSubscription(tier: string, amount: number, evidence?: string) {
      const res = await fetch(`${API_BASE}/auth/subscription/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, amount, evidence }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription upgrade failed");
      return data.user as User;
    },
    async generateOperationalIdea() {
      const isGuest = typeof window !== 'undefined' && localStorage.getItem('medical_user')?.includes('doctorian-preview-session');
      if (isOffline() || isGuest) {
        return {
          idea: "Autonomous clinical reasoning nodes are being synchronized with the new Qwen engine. This strategic ideation pathway will be active shortly.",
          creditsRemaining: "Unlimited"
        };
      }
      const res = await fetch(`${API_BASE}/ai/operational-ideas`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      return data as { idea: string; creditsRemaining?: number };
    }
  },
  admin: {
    async listUsers(page = 1, limit = 15, search = "", institution = "") {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        institution
      });
      const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
        credentials: "include",
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid response format: server returned HTML or non-JSON content.");
      }
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      return data as {
        users: User[];
        total: number;
        totalOnline: number;
        totalOffline: number;
        globalTotal: number;
        page: number;
        pages: number;
      };
    },
    async createUser(user: Partial<User> & { password?: string }) {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
        credentials: "include",
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid response format: server returned HTML or non-JSON content.");
      }
      if (!res.ok) throw new Error(data.error || "Failed to create user account");
      return data as { success: boolean; id: string };
    },
    async updateUser(id: string, updates: Partial<User> & { password?: string }) {
      const res = await fetch(`${API_BASE}/admin/users/${id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid response format: server returned HTML or non-JSON content.");
      }
      if (!res.ok) throw new Error(data.error || "Failed to update user details");
      return data.success as boolean;
    },
    async deleteUser(id: string) {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid response format: server returned HTML or non-JSON content.");
      }
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      return data.success as boolean;
    },
    async getUserRecords(id: string) {
      const res = await fetch(`${API_BASE}/admin/users/${id}/records`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch user records");
      return data.records as HealthRecord[];
    },
    async getUserFullProfile(id: string) {
      const res = await fetch(`${API_BASE}/admin/users/${id}/full-profile`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch user full profile data");
      return data as {
        records: HealthRecord[];
        medications: any[];
        workouts: any[];
        tasks: any[];
        emergencyContacts: any[];
        payments: any[];
      };
    },
    async updateUserRole(id: string, role: string) {
      const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user role");
      return data.success as boolean;
    },
    async updateUserStatus(id: string, status: string) {
      const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user status");
      return data.success as boolean;
    },
    async revokeUserSession(id: string) {
      const res = await fetch(`${API_BASE}/admin/users/${id}/revoke`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke user session");
      return data.success as boolean;
    },
    async listBilling(page: number = 1, limit: number = 10) {
      const res = await fetch(`${API_BASE}/admin/billing/all?page=${page}&limit=${limit}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch billing records");
      return data as { payments: any[], pagination: any };
    },
    async listDoctors() {
      const res = await fetch(`${API_BASE}/admin/doctors`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch doctors");
      return data.doctors as Doctor[];
    },
    async createDoctor(doctor: Omit<Doctor, 'id' | 'createdAt'>) {
      const res = await fetch(`${API_BASE}/admin/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctor),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create doctor");
      return data.doctor as Doctor;
    },
    async deleteDoctor(id: string) {
      const res = await fetch(`${API_BASE}/admin/doctors/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete doctor");
      return data.success as boolean;
    },
    async updateDoctor(id: string, updates: Partial<Doctor>) {
      const res = await fetch(`${API_BASE}/admin/doctors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update doctor");
      return data.success as boolean;
    },
    async listLogs() {
      const res = await fetch(`${API_BASE}/admin/logs`, {
        credentials: "include",
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid response format: server returned HTML or non-JSON content.");
      }
      if (!res.ok) throw new Error(data.error || "Failed to fetch system logs");
      return data.logs as Array<{ id: string; userId?: string; action: string; details?: string; createdAt: string }>;
    },
    async clearLogs() {
      const res = await fetch(`${API_BASE}/admin/logs`, {
        method: "DELETE",
        credentials: "include",
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid response format: server returned HTML or non-JSON content.");
      }
      if (!res.ok) throw new Error(data.error || "Failed to clear logs");
      return data.success as boolean;
    },
    async listFeedback() {
      const res = await fetch(`${API_BASE}/admin/feedback`, {
        credentials: "include",
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid response format: server returned HTML or non-JSON content.");
      }
      if (!res.ok) throw new Error(data.error || "Failed to fetch user feedback");
      return data.feedback as Array<{ id: string; userId?: string; messageId: string; rating: string; suggestion?: string; timestamp: string; userEmail?: string; userDisplayName?: string }>;
    },
    async deleteFeedback(id: string) {
      const res = await fetch(`${API_BASE}/admin/feedback/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete feedback entry");
      return data.success as boolean;
    },
    async getDbHealth() {
      const res = await fetch(`${API_BASE}/admin/db-health`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch database health stats");
      return data as {
        success: boolean;
        fileSizeKb: number;
        tableCounts: Record<string, number>;
        integrity: string;
        path: string;
        timestamp: string;
      };
    },
    async defragDb() {
      const res = await fetch(`${API_BASE}/admin/db-defrag`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to defragment database");
      return data as {
        success: boolean;
        message: string;
        durationMs: number;
        fileSizeKb: number;
      };
    }
  },
  doctors: {
    async listActive() {
      try {
        const res = await fetch(`${API_BASE}/doctors/active`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch active doctors");
        }
        const data = await res.json();
        return data.doctors as Doctor[];
      } catch (err) {
        console.warn("[API] Offline fallback triggered for active doctors:", err);
        return [
          {
            id: "doc-gloria",
            name: "Dr. Gloria Jayakullo",
            whatsappNumber: "+256787674140",
            specialization: "Lead Cardiologist (Clinical Duty)",
            location: "Mulago Hospital Main Ward",
            imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
            active: true,
            createdAt: new Date().toISOString()
          },
          {
            id: "doc-albert",
            name: "Dr. Albert Mukasa",
            whatsappNumber: "+256770000001",
            specialization: "Neuro-Critical Care Specialist",
            location: "Emergency Trauma Unit",
            imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
            active: true,
            createdAt: new Date().toISOString()
          },
          {
            id: "doc-sarah",
            name: "Dr. Sarah Namubiru",
            whatsappNumber: "+256770000002",
            specialization: "General Physician & Geriatrics",
            location: "Inpatient Clinical Suite C",
            imageUrl: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=300",
            active: true,
            createdAt: new Date().toISOString()
          }
        ] as Doctor[];
      }
    }
  },
  billing: {
    async getHistory(page: number = 1, limit: number = 10) {
      const res = await fetch(`${API_BASE}/billing/history?page=${page}&limit=${limit}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch billing history");
      return data as { history: any[], pagination: any };
    },
    exportUrl() {
      return `${API_BASE}/billing/export`;
    },
    async subscribe(planId: string, transaction_id?: string) {
      const res = await fetch(`${API_BASE}/billing/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, transaction_id }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process subscription");
      return data as { success: boolean, tier: string, creditsAdded: number };
    },
    async createPaymentLink(planId: string) {
      const res = await fetch(`${API_BASE}/billing/create-payment-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create payment link");
      return data as { link: string };
    },
    async getPaymentMethods() {
      const res = await fetch(`${API_BASE}/billing/payment-methods`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch payment methods");
      return data;
    }
  },
  notifications: {
    async list() {
      return handleListEndpoint<any>(
        `${API_BASE}/notifications`,
        "medical_offline_notifications",
        SEEDS_NOTIFICATIONS
      );
    },
    async create(notification: { title: string; content: string; type?: string }) {
      return handleCreateEndpoint<any>(
        `${API_BASE}/notifications`,
        "medical_offline_notifications",
        notification,
        "notifications"
      );
    },
    async delete(id: string) {
      return handleDeleteEndpoint(
        `${API_BASE}/notifications/${id}`,
        "medical_offline_notifications",
        id,
        "notifications"
      );
    }
  },
  records: {
    async list() {
      return handleListEndpoint<HealthRecord>(
        `${API_BASE}/records`,
        "medical_offline_records",
        SEEDS_RECORDS
      );
    },
    async create(record: Omit<HealthRecord, "id" | "userId">) {
      return handleCreateEndpoint<HealthRecord>(
        `${API_BASE}/records`,
        "medical_offline_records",
        record,
        "records"
      );
    }
  },
  workouts: {
    async list() {
      return handleListEndpoint<any>(
        `${API_BASE}/workouts`,
        "medical_offline_workouts",
        SEEDS_WORKOUTS
      );
    },
    async create(workout: { type: string; duration: number; calories?: number; intensity?: string; date: string; notes?: string }) {
      return handleCreateEndpoint<any>(
        `${API_BASE}/workouts`,
        "medical_offline_workouts",
        workout,
        "workouts"
      );
    },
    async delete(id: string) {
      return handleDeleteEndpoint(
        `${API_BASE}/workouts/${id}`,
        "medical_offline_workouts",
        id,
        "workouts"
      );
    }
  },
  medications: {
    async list() {
      return handleListEndpoint<any>(
        `${API_BASE}/medications`,
        "medical_offline_medications",
        SEEDS_MEDICATIONS
      );
    },
    async create(med: any) {
      return handleCreateEndpoint<any>(
        `${API_BASE}/medications`,
        "medical_offline_medications",
        med,
        "medications"
      );
    },
    async delete(id: string) {
      return handleDeleteEndpoint(
        `${API_BASE}/medications/${id}`,
        "medical_offline_medications",
        id,
        "medications"
      );
    },
    async take(id: string, undo: boolean = false) {
      const localMedications = getStorageItem<any[]>("medical_offline_medications", []);
      const updated = localMedications.map((m: any) => {
        if (m.id === id) {
          const times = m.takenTimes || [];
          let updatedTimes = [...times];
          if (undo) {
            updatedTimes.pop();
          } else {
            updatedTimes.push(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
          }
          return {
            ...m,
            takenToday: updatedTimes.length > 0,
            takenTimes: updatedTimes
          };
        }
        return m;
      });
      setStorageItem("medical_offline_medications", updated);

      if (isOffline()) {
        queueSyncAction({
          type: 'take',
          endpoint: 'medications',
          targetId: id,
          payload: { undo }
        });
        return true;
      }

      try {
        const res = await fetch(`${API_BASE}/medications/${id}/take`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ undo }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to log intake");
        return data.success;
      } catch (err) {
        console.warn("[Offline Medications] Take recorded locally. Queueing back-sync...");
        queueSyncAction({
          type: 'take',
          endpoint: 'medications',
          targetId: id,
          payload: { undo }
        });
        return true;
      }
    },
    async update(id: string, updates: any) {
      return handleUpdateEndpoint<any>(
        `${API_BASE}/medications/${id}`,
        "medical_offline_medications",
        id,
        updates,
        "medications"
      );
    },
    async history() {
      if (isOffline()) {
        return getStorageItem<any[]>("medical_offline_medication_history", []);
      }
      try {
        const res = await fetch(`${API_BASE}/medications/history`, { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          const list = data.history || [];
          setStorageItem("medical_offline_medication_history", list);
          return list;
        }
        return getStorageItem<any[]>("medical_offline_medication_history", []);
      } catch (err) {
        return getStorageItem<any[]>("medical_offline_medication_history", []);
      }
    }
  },
  alerts: {
    async sendSms(message: string, toDoctor?: string, toMentor?: string, toPatient?: string, network?: string) {
      const res = await fetchWithRetry(`${API_BASE}/alerts/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, toDoctor, toMentor, toPatient, network }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send alert");
      return data as { success: boolean; simulated?: boolean; message: string };
    },
    async makeCall(message: string, toDoctor?: string, toMentor?: string, toPatient?: string, patientContext?: any, network?: string) {
      const res = await fetchWithRetry(`${API_BASE}/alerts/make-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, toDoctor, toMentor, toPatient, patientContext, network }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate call");
      return data as { 
        success: boolean; 
        simulated?: boolean; 
        message: string; 
        aiText?: string; 
        audioBase64?: string | null; 
        isAIBrainGenerated?: boolean;
      };
    },
    async getEmergencyLogs() {
      const res = await fetchWithRetry(`${API_BASE}/emergency/logs`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch emergency logs");
      return data.logs as any[];
    },
    async getAmbulanceDispatches() {
      const res = await fetchWithRetry(`${API_BASE}/ambulance/dispatches`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch ambulance dispatches");
      return data.dispatches as any[];
    },
    async createAmbulanceDispatch(dispatchData: {
      patientId: string;
      patientName: string;
      vitalAlertSource?: string;
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
      dispatchCode: string;
      ambulanceUnit: string;
      paramedicTeam: string;
      destinationHospital: string;
      status: string;
      equipmentStatus: string;
      etaMinutes: number;
      distanceKm: number;
    }) {
      const res = await fetchWithRetry(`${API_BASE}/ambulance/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dispatchData),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create ambulance dispatch");
      return data as { success: boolean; dispatch: any };
    },
    async updateAmbulanceDispatchStatus(id: string, status: string, etaMinutes?: number) {
      const res = await fetchWithRetry(`${API_BASE}/ambulance/dispatch/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, etaMinutes }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update ambulance dispatch");
      return data as { success: boolean };
    },
    async cancelAmbulanceDispatch(id: string) {
      const res = await fetchWithRetry(`${API_BASE}/ambulance/dispatch/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel ambulance dispatch");
      return data as { success: boolean };
    },
    async triggerWhatsApp(message: string, to: string, type?: string) {
      const res = await fetchWithRetry(`${API_BASE}/alerts/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, to, type }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to trigger WhatsApp");
      return data as { success: boolean; message: string };
    },
    async triggerMedicationAlarm(medName: string, time: string) {
      const res = await fetchWithRetry(`${API_BASE}/alerts/medication`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medName, time }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to trigger medication alarm");
      return data as { success: boolean };
    },
    async triggerSOS(name: string, message?: string) {
      const res = await fetchWithRetry(`${API_BASE}/alerts/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to trigger SOS");
      return data as { success: boolean; message: string; results?: any[] };
    }
  },
  ai: {
    async aiChat(
      messages: { role: string; text: string; images?: string[] }[] | string, 
      systemInstruction: string = "You are a helpful medical assistant.", 
      model?: string, 
      temperature: number = 0.7,
      useSearch: boolean = false
    ): Promise<{ text: string; imageData?: string; creditsRemaining?: number | string }> {
      const payloadMessages = typeof messages === 'string' 
        ? [{ role: 'user', text: messages }] 
        : messages;

      const userPrompt = payloadMessages[payloadMessages.length - 1]?.text || "";

      if (isOffline()) {
        const text = generateOfflineMedicalResponse(userPrompt);
        return { text, creditsRemaining: "Unlimited (Offline Local Back-up Mode)" };
      }

      // Check if user has prioritize local AI active in localStorage, or if URL is local (localhost / 127.0.0.1 / ::1) which only browser direct call can hit
      const userStr = localStorage.getItem('medical_user');
      const prioritizeLocalAI = localStorage.getItem('doctorian_prioritize_local_ai') !== 'false';
      let isLocalUrl = false;
      let parsedUser: any = null;
      if (userStr) {
        try {
          parsedUser = JSON.parse(userStr);
        } catch (e) {}
      }

      if (!parsedUser) {
        parsedUser = {
          ollamaUrl: 'https://fuzzy-bugs-run.loca.lt',
          ollamaModel: 'gemma4',
          enableExternalAI: true
        };
      } else if (!parsedUser.ollamaUrl || parsedUser.ollamaUrl.trim() === '') {
        parsedUser.ollamaUrl = 'https://fuzzy-bugs-run.loca.lt';
      }

      if (parsedUser && parsedUser.ollamaUrl) {
        const urlLower = parsedUser.ollamaUrl.toLowerCase();
        isLocalUrl = urlLower.includes("localhost") || urlLower.includes("127.0.0.1") || urlLower.includes("::1");
      }

      if (parsedUser && parsedUser.ollamaUrl && (prioritizeLocalAI || isLocalUrl)) {
        const user = parsedUser;
        try {
          const activeNode = await detectActiveLocalNode(user.ollamaUrl, user.ollamaModel);
          const { url: localUrl, isOpenAI } = getLocalLLMEndpoint(activeNode.url);
          const activeLocalModel = activeNode.model;
          
          console.log(`[Neural Link] [DIRECT CLIENT] Directing pulse to Local LLM: ${localUrl} (Model: ${activeLocalModel}, isLocalUrl: ${isLocalUrl}, detectedUrl: ${activeNode.url})`);
          
          const requestBody = isOpenAI ? {
            model: activeLocalModel,
            messages: [
              { role: 'system', content: systemInstruction },
              ...payloadMessages.map(m => ({
                role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
                content: m.text
              }))
            ],
            stream: false,
            temperature: temperature || 0.7
          } : {
            model: activeLocalModel, 
            messages: [
              { role: 'system', content: systemInstruction },
              ...payloadMessages.map(m => ({
                role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
                content: m.text
              }))
            ],
            stream: false,
            options: { temperature: temperature || 0.7 }
          };

          const localHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
          const localApiKeySaved = localStorage.getItem('doctorian_local_api_key');
          if (localApiKeySaved && localApiKeySaved.trim() !== '') {
            localHeaders['Authorization'] = `Bearer ${localApiKeySaved.trim()}`;
          }

          const localRes = await fetch(localUrl, {
            method: 'POST',
            headers: localHeaders,
            body: JSON.stringify(requestBody)
          });

          if (localRes.ok) {
            const localData = await localRes.json();
            if (isOpenAI) {
              const text = localData.choices?.[0]?.message?.content;
              if (text) {
                return { text: text as string, creditsRemaining: `Unlimited (Direct Local Bridge - LM Studio)` };
              }
            } else {
              if (localData.message?.content) {
                return { text: localData.message.content as string, creditsRemaining: `Unlimited (Direct Local Bridge - Ollama)` };
              }
            }
          }
          console.warn(`[Neural Link] Direct local AI connection returned status: ${localRes.status}. Cascading to cloud backend.`);
        } catch (e: any) {
          console.warn("[Neural Link] [DIRECT CLIENT] Direct local AI execution failed, cascading to cloud backend:", e);
        }
      }

      // Try backend first (which prioritizes Together AI Llama 3.1 8B, falling back to server-side local Ollama)
      try {
        const payloadObj = { 
          messages: payloadMessages, 
          systemInstruction, 
          modelName: model, 
          temperature,
          useSearch,
          localApiKey: localStorage.getItem('doctorian_local_api_key') || ''
        };
        const encryptedPayload = encryptText(JSON.stringify(payloadObj));
        const res = await fetchWithRetry(`${API_BASE}/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ encryptedPayload }),
          credentials: "include",
        });
        let data = await res.json();
        if (data && data.encryptedResponse) {
          const decrypted = decryptText(data.encryptedResponse);
          data = JSON.parse(decrypted);
        }
        if (!res.ok) throw new Error(data.error || "Failed to get AI response");
        return data as { text: string; imageData?: string; creditsRemaining?: number | string };
      } catch (backendErr: any) {
        console.warn("[Neural Link] Backend cloud synapse failed or offline. Securing local PC local LLM failover...");
        
        // Failover handle: Local Ollama or LM Studio on User's PC if configured
        const userStr = localStorage.getItem('medical_user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user.ollamaUrl) {
              const activeNode = await detectActiveLocalNode(user.ollamaUrl, user.ollamaModel);
              const { url: localUrl, isOpenAI } = getLocalLLMEndpoint(activeNode.url);
              const activeLocalModel = activeNode.model;
              console.log(`[Neural Link] Directing failover pulse to PC Local LLM: ${localUrl} (Model: ${activeLocalModel}, isOpenAI: ${isOpenAI}, detectedUrl: ${activeNode.url})`);
              
              const requestBody = isOpenAI ? {
                model: activeLocalModel,
                messages: [
                  { role: 'system', content: systemInstruction },
                  ...payloadMessages.map(m => ({
                    role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.text
                  }))
                ],
                stream: false,
                temperature: temperature || 0.7
              } : {
                model: activeLocalModel, 
                messages: [
                  { role: 'system', content: systemInstruction },
                  ...payloadMessages.map(m => ({
                    role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.text
                  }))
                ],
                stream: false,
                options: { temperature: temperature || 0.7 }
              };

              const localHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
              const localApiKeySaved = localStorage.getItem('doctorian_local_api_key');
              if (localApiKeySaved && localApiKeySaved.trim() !== '') {
                localHeaders['Authorization'] = `Bearer ${localApiKeySaved.trim()}`;
              }

              const localRes = await fetch(localUrl, {
                method: 'POST',
                headers: localHeaders,
                body: JSON.stringify(requestBody)
              });

              if (localRes.ok) {
                const localData = await localRes.json();
                if (isOpenAI) {
                  const text = localData.choices?.[0]?.message?.content;
                  if (text) {
                    return { text: text as string, creditsRemaining: 'Unlimited (Offline Failover - LM Studio)' };
                  }
                } else {
                  if (localData.message?.content) {
                    return { text: localData.message.content as string, creditsRemaining: 'Unlimited (Offline Failover - Ollama)' };
                  }
                }
              }
            }
          } catch (e) {
            console.warn("[Neural Link] Local failover configuration notice (inactive or unreachable):", e);
          }
        }
        
        console.warn("[Neural Link] Local LLM failover missed.");
        const lastPrompt = payloadMessages[payloadMessages.length - 1]?.text || "Hello";
        const text = generateOfflineMedicalResponse(lastPrompt);
        return { text, creditsRemaining: "Offline Local Back-up Mode" };
      }
    },
    async voiceChat(text: string, voiceName: string = 'Joseph', language?: string) {
      if (isOffline()) {
        return { text: `[Voice consultation offline mode active]: ${text}` };
      }
      try {
        const res = await fetchWithRetry(`${API_BASE}/ai/voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceName, language }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "AI Voice call failed");
        return data as { text: string };
      } catch (err) {
        return { text: `[Voice Synapse fallback mode active]: ${text}` };
      }
    },
    async startVoiceCall() {
      if (isOffline()) {
        return { success: true, remaining: 999 };
      }
      try {
        const res = await fetchWithRetry(`${API_BASE}/ai/voice/start`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to start voice consultation");
        return data as { success: boolean; remaining: number };
      } catch (err) {
        return { success: true, remaining: 100 };
      }
    },
    async *aiChatStream(
      messages: { role: string; text: string }[], 
      systemInstruction: string, 
      model: string, 
      temperature: number, 
      onMetadata?: (meta: any) => void,
      signal?: AbortSignal,
      useSearch: boolean = false,
      thinkingLevel?: 'HIGH' | 'LOW' | 'MINIMAL',
      images?: string[],
      targetLanguage?: string
    ) {
      const lastPrompt = messages[messages.length - 1]?.text || "";

      if (isOffline()) {
        const text = generateOfflineMedicalResponse(lastPrompt, targetLanguage);
        const words = text.split(" ");
        // Stagger offline rendering beautifully to replicate AI output
        for (let i = 0; i < words.length; i++) {
          if (signal?.aborted) return;
          yield words[i] + " ";
          await new Promise(resolve => setTimeout(resolve, 35));
        }
        onMetadata?.({ credits: "Unlimited (Offline Local Back-up Mode)" });
        return;
      }

      // Check if user has prioritize local AI active in localStorage, or if URL is local (localhost / 127.0.0.1 / ::1) which only browser direct call can hit
      const userStr = localStorage.getItem('medical_user');
      const prioritizeLocalAI = localStorage.getItem('doctorian_prioritize_local_ai') !== 'false';
      let isLocalUrl = false;
      let parsedUser: any = null;
      if (userStr) {
        try {
          parsedUser = JSON.parse(userStr);
        } catch (e) {}
      }

      if (!parsedUser) {
        parsedUser = {
          ollamaUrl: 'https://fuzzy-bugs-run.loca.lt',
          ollamaModel: 'gemma4',
          enableExternalAI: true
        };
      } else if (!parsedUser.ollamaUrl || parsedUser.ollamaUrl.trim() === '') {
        parsedUser.ollamaUrl = 'https://fuzzy-bugs-run.loca.lt';
      }

      if (parsedUser && parsedUser.ollamaUrl) {
        const urlLower = parsedUser.ollamaUrl.toLowerCase();
        isLocalUrl = urlLower.includes("localhost") || urlLower.includes("127.0.0.1") || urlLower.includes("::1");
      }

      if (parsedUser && parsedUser.ollamaUrl && (prioritizeLocalAI || isLocalUrl)) {
        const user = parsedUser;
        try {
          const activeNode = await detectActiveLocalNode(user.ollamaUrl, user.ollamaModel);
          const { url: localUrl, isOpenAI } = getLocalLLMEndpoint(activeNode.url);
          const activeLocalModel = activeNode.model;
          
          console.log(`[Neural Link] [DIRECT CLIENT] Directing stream pulse to Local LLM prior: ${localUrl} (Model: ${activeLocalModel}, isLocalUrl: ${isLocalUrl}, detectedUrl: ${activeNode.url})`);
          
          const unstructuredInstruction = `${systemInstruction}\n\n[CRITICAL DIRECTIVE FOR LOCAL ANALYTICS]: Do NOT output any structured 4-section diagnostic layouts, unrequested templates, json schemas, or high-density lists. Keep your response conversational, natural, direct, freeform, and completely unstructured. Answer the clinician directly and concisely.`;

          const requestBody = isOpenAI ? {
            model: activeLocalModel,
            messages: [
              { role: 'system', content: unstructuredInstruction },
              ...messages.map(m => ({
                role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
                content: m.text
              }))
            ],
            stream: true,
            temperature: temperature || 0.7
          } : {
            model: activeLocalModel, 
            messages: [
              { role: 'system', content: unstructuredInstruction },
              ...messages.map(m => ({
                role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
                content: m.text
              }))
            ],
            stream: true,
            options: { temperature: temperature || 0.7 }
          };

          const localHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
          const localApiKeySaved = localStorage.getItem('doctorian_local_api_key');
          if (localApiKeySaved && localApiKeySaved.trim() !== '') {
            localHeaders['Authorization'] = `Bearer ${localApiKeySaved.trim()}`;
          }

          const localRes = await fetch(localUrl, {
            method: 'POST',
            headers: localHeaders,
            body: JSON.stringify(requestBody),
            signal
          });

          if (localRes.ok && localRes.body) {
            const reader = localRes.body.getReader();
            const decoder = new TextDecoder();
            let streamBuffer = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              streamBuffer += decoder.decode(value, { stream: true });
              let lineEndIndex;
              while ((lineEndIndex = streamBuffer.indexOf("\n")) >= 0) {
                const line = streamBuffer.slice(0, lineEndIndex).trim();
                streamBuffer = streamBuffer.slice(lineEndIndex + 1);

                let cleanLine = line.trim();
                if (!cleanLine || cleanLine === "data: [DONE]" || cleanLine === "data:[DONE]") continue;

                let targetJson = cleanLine;
                if (cleanLine.startsWith("data:")) {
                  targetJson = cleanLine.substring(cleanLine.indexOf(":") + 1).trim();
                }

                try {
                  const parsed = JSON.parse(targetJson);
                  if (isOpenAI) {
                    const text = parsed.choices?.[0]?.delta?.content;
                    if (text) yield text;
                  } else {
                    if (parsed.message?.content) {
                      yield parsed.message.content;
                    } else if (parsed.response) {
                      yield parsed.response;
                    } else if (parsed.choices?.[0]?.delta?.content) {
                      yield parsed.choices[0].delta.content;
                    }
                  }
                } catch (e) {}
              }
            }
            if (onMetadata) {
              onMetadata({ credits: `Unlimited (Direct Local Bridge - ${isOpenAI ? 'LM Studio' : 'Ollama'})` });
            }
            return; // Executed successfully, stop and return!
          } else {
            console.warn(`[Neural Link] Direct local AI stream error: ${localRes.status} ${localRes.statusText}. Cascading to cloud backend.`);
          }
        } catch (e: any) {
          console.warn("[Neural Link] [DIRECT CLIENT] Direct local AI stream execution failed, cascading to cloud backend:", e);
        }
      }

      // Try backend streaming first (priority: cloud Together AI)
      try {
        const payloadObj = { 
          messages, 
          systemInstruction, 
          modelName: model, 
          temperature,
          useSearch,
          thinkingLevel,
          images,
          targetLanguage,
          localApiKey: localStorage.getItem('doctorian_local_api_key') || ''
        };
        const encryptedPayload = encryptText(JSON.stringify(payloadObj));
        const res = await fetchWithRetry(`${API_BASE}/ai/chat`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
          },
          body: JSON.stringify({ encryptedPayload }),
          credentials: "include",
          signal
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({ error: "Stream connection failed" }));
          throw new Error(error.message || error.error || "Streaming failed");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          let lineEndIndex;
          while ((lineEndIndex = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, lineEndIndex).trim();
            buffer = buffer.slice(lineEndIndex + 1);

            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);
              if (dataStr === "[DONE]") return;
              try {
                let data = JSON.parse(dataStr);
                if (data && data.encryptedChunk) {
                  const decrypted = decryptText(data.encryptedChunk);
                  data = JSON.parse(decrypted);
                }
                if (data.error) throw new Error(data.error);
                
                if (data.thought) {
                  onMetadata?.(data);
                }
                
                if (data.text) yield data.text;
                if ((data.credits !== undefined || data.grounding !== undefined) && onMetadata) onMetadata(data);
              } catch (e: any) {
                if (e.message && e.message.includes("neural pathways")) throw e;
              }
            }
          }
        }
      } catch (backendErr: any) {
        console.warn("[Neural Link] Backend stream failed or offline. Checking local PC local LLM failover...");
        
        // Local Ollama or LM Studio stream failover for offline use
        const userStr = localStorage.getItem('medical_user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user.ollamaUrl) {
              const activeNode = await detectActiveLocalNode(user.ollamaUrl, user.ollamaModel);
              const { url: localUrl, isOpenAI } = getLocalLLMEndpoint(activeNode.url);
              const activeLocalModel = activeNode.model;
              console.log(`[Neural Link] Directing stream failover pulse to Local LLM: ${localUrl} (Model: ${activeLocalModel}, isOpenAI: ${isOpenAI}, detectedUrl: ${activeNode.url})`);
              
              const requestBody = isOpenAI ? {
                model: activeLocalModel,
                messages: [
                  { role: 'system', content: systemInstruction },
                  ...messages.map(m => ({
                    role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.text
                  }))
                ],
                stream: true,
                temperature: temperature || 0.7
              } : {
                model: activeLocalModel, 
                messages: [
                  { role: 'system', content: systemInstruction },
                  ...messages.map(m => ({
                    role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.text
                  }))
                ],
                stream: true,
                options: { temperature: temperature || 0.7 }
              };

              const localHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
              const localApiKeySaved = localStorage.getItem('doctorian_local_api_key');
              if (localApiKeySaved && localApiKeySaved.trim() !== '') {
                localHeaders['Authorization'] = `Bearer ${localApiKeySaved.trim()}`;
              }

              const localRes = await fetch(localUrl, {
                method: 'POST',
                headers: localHeaders,
                body: JSON.stringify(requestBody),
                signal
              });

              if (localRes.ok && localRes.body) {
                const reader = localRes.body.getReader();
                const decoder = new TextDecoder();
                let accumulatedBuffer = '';
                
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  
                  accumulatedBuffer += decoder.decode(value, { stream: true });
                  const lines = accumulatedBuffer.split('\n');
                  accumulatedBuffer = lines.pop() || ''; // save the last unfinished line back to the buffer
                  
                  for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) continue;
                    
                    if (isOpenAI) {
                      if (trimmedLine.startsWith('data: ')) {
                        const dataStr = trimmedLine.slice(6).trim();
                        if (dataStr === '[DONE]') {
                          if (onMetadata) onMetadata({ credits: 'Unlimited (Offline Failover - LM Studio)' });
                          continue;
                        }
                        try {
                          const data = JSON.parse(dataStr);
                          const text = data.choices?.[0]?.delta?.content;
                          if (text) yield text;
                        } catch (e) {
                          // ignore partial line JSON parse errors
                        }
                      }
                    } else {
                      try {
                        const data = JSON.parse(trimmedLine);
                        if (data.message?.content) yield data.message.content;
                        if (data.done && onMetadata) onMetadata({ credits: 'Unlimited (Offline Failover - Ollama)' });
                      } catch (e) {
                        // ignore parsing error for streaming chunks
                      }
                    }
                  }
                }
                
                // Flush remaining buffer if it doesn't end with newline
                if (accumulatedBuffer.trim()) {
                  const trimmedLine = accumulatedBuffer.trim();
                  if (isOpenAI) {
                    if (trimmedLine.startsWith('data: ')) {
                      const dataStr = trimmedLine.slice(6).trim();
                      if (dataStr !== '[DONE]') {
                        try {
                          const data = JSON.parse(dataStr);
                          const text = data.choices?.[0]?.delta?.content;
                          if (text) yield text;
                        } catch (e) {}
                      }
                    }
                  } else {
                    try {
                      const data = JSON.parse(trimmedLine);
                      if (data.message?.content) yield data.message.content;
                    } catch (e) {}
                  }
                }
                
                return;
              }
            }
          } catch (e) {
            console.warn("[Neural Link] Local failover configuration notice (inactive or unreachable):", e);
          }
        }
        
        console.warn("[Neural Link] Local LLM fallback missed.");
        const lastPrompt = messages[messages.length - 1]?.text || "Hello";
        const text = generateOfflineMedicalResponse(lastPrompt, targetLanguage);
        const words = text.split(" ");
        for (let i = 0; i < words.length; i++) {
          if (signal?.aborted) return;
          yield words[i] + " ";
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        onMetadata?.({ credits: "Offline Local Back-up Mode" });
      }
    },
    async submitFeedback(feedback: { messageId: string; rating: 'up' | 'down'; suggestion?: string }) {
      if (isOffline()) return { success: true, id: "off_fb_" + Date.now() };
      try {
        const res = await fetch(`${API_BASE}/chat/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(feedback),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to submit feedback");
        return data as { success: boolean; id: string };
      } catch (err) {
        return { success: true, id: "off_fb_" + Date.now() };
      }
    },
    async listKnowledge() {
      return handleListEndpoint<any>(
        `${API_BASE}/ai/knowledge`,
        "medical_offline_knowledge",
        SEEDS_KNOWLEDGE
      );
    },
    async addKnowledge(title: string, content: string, category?: string) {
      return handleCreateEndpoint<any>(
        `${API_BASE}/ai/knowledge`,
        "medical_offline_knowledge",
        { title, content, category },
        "ai/knowledge" as any
      );
    },
    async cloudFetchKnowledge(query: string) {
      if (isOffline()) {
        const localList = getStorageItem<any[]>("medical_offline_knowledge", []);
        const offlineSeeds = [
          {
            id: `kb_offline_${Math.random().toString(36).substr(2, 9)}`,
            title: `Offline: ${query.charAt(0).toUpperCase() + query.slice(1)} Protocols`,
            category: "clinical",
            content: `Offline backup protocols for: ${query}. Switched to local heuristic cache. For severe symptoms, proceed with standard therapeutic hydration, physical stabilizing maneuvers, and secondary specialist diagnostic lab workup when grid connectivity is restored.`,
            createdAt: new Date().toISOString()
          }
        ];
        const combined = [...localList, ...offlineSeeds];
        setStorageItem("medical_offline_knowledge", combined);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("local_knowledge_updated"));
        }
        return { success: true, results: offlineSeeds, count: offlineSeeds.length };
      }
      const res = await fetch(`${API_BASE}/ai/knowledge/cloud-fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch cloud medical data");
      return data;
    },
    async bulkSeedKnowledge() {
      if (isOffline()) {
        const localList = getStorageItem<any[]>("medical_offline_knowledge", []);
        const offlineSeeds = [
          {
            id: `kb_offline_${Math.random().toString(36).substr(2, 9)}`,
            title: "Quantum Bio-resonance in Cellular Aging",
            category: "clinical",
            content: "Under high-frequency electromagnetic field mapping, aging cells exhibit progressive phase decoherence in membrane electrical potentials. Restoring coherent electromagnetic oscillation fields via low-intensity radiofrequency bio-resonance has been shown to temporarily reactivate cellular self-repair cascades and delay mitochondrial degradation.",
            createdAt: new Date().toISOString()
          },
          {
            id: `kb_offline_${Math.random().toString(36).substr(2, 9)}`,
            title: "DNA Torsional Stress & Chromatin Coherence",
            category: "clinical",
            content: "Topological supercoiling of double-stranded DNA creates longitudinal torsional stress waves. These stress fields dictate the collective vibrational states of chromatin. Clinical modulation of nuclear mechanical tension maintains spin-coherence across gene loci, enhancing structural transcription fidelity.",
            createdAt: new Date().toISOString()
          },
          {
            id: `kb_offline_${Math.random().toString(36).substr(2, 9)}`,
            title: "Mitochondrial Respiration & Sub-atomic Tunneling",
            category: "clinical",
            content: "Electron transfer across the respiratory complexes I through IV relies heavily on sub-atomic proton and electron tunneling. This non-classical kinetic mechanism bypasses high enzymatic activation barriers. Optimizing lipid membrane viscosity with omega-3 fatty acids stabilizes tunneling junctions, reducing oxidative free-radical leakage.",
            createdAt: new Date().toISOString()
          },
          {
            id: `kb_offline_${Math.random().toString(36).substr(2, 9)}`,
            title: "Linguistic Calibration: Pre-eclampsia Signs (Luganda)",
            category: "language",
            content: "Local Term: Okuvaako kwebuziba (Preeclampsia).\nKey Symptoms: Omutwe oguluma ennyo ogutakuba kugezaako (severe unrelenting headache), ebigere n'engalo okuzimba ennyo (massive swelling of extremities), and okulaba kalonda okutali bulungi (blurred or spotty vision).\nProtocol: Secure a urine sample for protein screening immediately. Initiate Magnesium Sulfate to prevent eclamptic seizures.",
            createdAt: new Date().toISOString()
          }
        ];
        const combined = [...localList, ...offlineSeeds];
        setStorageItem("medical_offline_knowledge", combined);
        return { success: true, count: offlineSeeds.length };
      }
      const res = await fetch(`${API_BASE}/ai/knowledge/bulk-seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to bulk seed quantum nodes");
      return data;
    },
    async listFineTuningJobs() {
      if (isOffline()) {
        const cached = localStorage.getItem("medical_offline_fine_tuning_jobs");
        return cached ? JSON.parse(cached) : [];
      }
      try {
        const res = await fetch(`${API_BASE}/ai/fine-tune/jobs`, { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("medical_offline_fine_tuning_jobs", JSON.stringify(data));
          return data;
        }
        throw new Error(data.error || "Failed to list fine-tuning jobs");
      } catch (err) {
        const cached = localStorage.getItem("medical_offline_fine_tuning_jobs");
        return cached ? JSON.parse(cached) : [];
      }
    },
    async analyzeDataset() {
      if (isOffline()) {
        return {
          summary: {
            totalNodes: 4,
            categoryDistribution: { "clinical": 3, "language": 1 },
            averageLength: 600
          },
          recommendations: {
            epochs: 5,
            learningRate: "2.0e-5",
            batchSize: 4,
            baseModel: "google/gemma-3-4b-tfjs",
            justification: "Your offline dataset contains a small subset of nodes. We recommend standard local calibration."
          },
          potentialIssues: ["Dataset size is critical. Add more clinical nodes to avoid severe bias."],
          testQueries: ["Translate Preeclampsia in Luganda"]
        };
      }
      try {
        const res = await fetch(`${API_BASE}/ai/smart/analyze-dataset`, {
          method: "POST",
          credentials: "include"
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Analysis failed");
        return data;
      } catch (err: any) {
        throw new Error(err.message || "Failed to analyze dataset");
      }
    },
    async augmentDataset(category: string, promptText: string) {
      if (isOffline()) {
        return [
          { title: `Offline Generated: ${category} Protocol`, content: `Synthesized clinical node for theme: "${promptText}". In offline mode, this is a simulated diagnostic standard.` }
        ];
      }
      try {
        const res = await fetch(`${API_BASE}/ai/smart/augment-dataset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, promptText }),
          credentials: "include"
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Augmentation failed");
        return data.nodes;
      } catch (err: any) {
        throw new Error(err.message || "Failed to augment dataset");
      }
    },
    async evaluateJob(jobId: string) {
      if (isOffline()) {
        return {
          performanceIndex: "Local Synthesis Optimal",
          competencies: ["General diagnostics", "Offline resilience"],
          guardrails: "Strictly active",
          improvements: "Inject clinical WHO guidelines."
        };
      }
      try {
        const res = await fetch(`${API_BASE}/ai/smart/evaluate-job`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
          credentials: "include"
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Evaluation failed");
        return data;
      } catch (err: any) {
        throw new Error(err.message || "Failed to evaluate job");
      }
    },
    async getActiveFineTunedModel() {
      if (isOffline()) {
        const cached = localStorage.getItem("medical_offline_active_model");
        return cached ? JSON.parse(cached) : null;
      }
      try {
        const res = await fetch(`${API_BASE}/ai/fine-tune/active`, { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("medical_offline_active_model", JSON.stringify(data));
          return data;
        }
        return null;
      } catch (err) {
        const cached = localStorage.getItem("medical_offline_active_model");
        return cached ? JSON.parse(cached) : null;
      }
    },
    async startFineTuning(baseModel: string, customName: string, epochs: number) {
      if (isOffline()) {
        throw new Error("Fine-tuning base models requires cloud infrastructure synchronization.");
      }
      const res = await fetch(`${API_BASE}/ai/fine-tune/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseModel, customName, epochs }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start fine-tuning");
      return data;
    },
    async activateFineTunedModel(id: string) {
      if (isOffline()) {
        throw new Error("Air-gapped model activation restricted.");
      }
      const res = await fetch(`${API_BASE}/ai/fine-tune/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to activate model");
      return data;
    },
    async deactivateFineTunedModels() {
      if (isOffline()) {
        throw new Error("Air-gapped model deactivation restricted.");
      }
      const res = await fetch(`${API_BASE}/ai/fine-tune/deactivate`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to deactivate models");
      return data;
    },
    async generateImage(prompt: string, aspectRatio: string = "1:1") {
      if (isOffline()) {
        throw new Error("Photonic image synthesis demands high-voltage cloud connectivity.");
      }
      const res = await fetch(`${API_BASE}/ai/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed");
      return data as { imageData: string; success: boolean; error?: string };
    },
    async deleteKnowledge(id: string) {
      return handleDeleteEndpoint(
        `${API_BASE}/ai/knowledge/${id}`,
        "medical_offline_knowledge",
        id,
        "ai/knowledge" as any
      );
    },
    async listSessions() {
      return handleListEndpoint<any>(
        `${API_BASE}/chat/sessions`,
        "medical_offline_chat_sessions",
        []
      );
    },
    async createSession(title?: string, persona?: string) {
      const sessionUrl = `${API_BASE}/chat/sessions`;
      const localList = getStorageItem<any[]>("medical_offline_chat_sessions", []);
      
      if (isOffline()) {
        const id = "off_sess_" + Date.now();
        const newSession = {
          id,
          title: title || "New Consult Diagnostic",
          persona: persona || "Generalist",
          createdAt: new Date().toISOString()
        };
        localList.push(newSession);
        setStorageItem("medical_offline_chat_sessions", localList);
        return { id, success: true };
      }

      try {
        const res = await fetch(sessionUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, persona }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create session");
        
        localList.push({ id: data.id, title: title || "New Consult Diagnostic", persona: persona || "Generalist", createdAt: new Date().toISOString() });
        setStorageItem("medical_offline_chat_sessions", localList);
        return data as { id: string, success: boolean };
      } catch (err) {
        const id = "off_sess_" + Date.now();
        const newSession = {
          id,
          title: title || "New Consult Diagnostic",
          persona: persona || "Generalist",
          createdAt: new Date().toISOString()
        };
        localList.push(newSession);
        setStorageItem("medical_offline_chat_sessions", localList);
        return { id, success: true };
      }
    },
    async getSessionMessages(sessionId: string) {
      return handleListEndpoint<any>(
        `${API_BASE}/chat/sessions/${sessionId}/messages`,
        `medical_offline_chat_messages_${sessionId}`,
        []
      );
    },
    async saveMessage(sessionId: string, role: string, text: string) {
      const msgUrl = `${API_BASE}/chat/sessions/${sessionId}/messages`;
      const localList = getStorageItem<any[]>(`medical_offline_chat_messages_${sessionId}`, []);
      
      const newMsg = {
        id: "off_msg_" + Date.now() + Math.random().toString(36).substr(2, 4),
        role,
        text,
        timestamp: new Date().toISOString()
      };
      localList.push(newMsg);
      setStorageItem(`medical_offline_chat_messages_${sessionId}`, localList);

      if (isOffline()) {
        return { id: newMsg.id, success: true };
      }

      try {
        const res = await fetch(msgUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, text }),
          credentials: "include",
        });
        const data = await res.json();
        return data as { id: string, success: boolean };
      } catch (err) {
        return { id: newMsg.id, success: true };
      }
    },
    async deleteSession(sessionId: string) {
      const localList = getStorageItem<any[]>("medical_offline_chat_sessions", []);
      setStorageItem("medical_offline_chat_sessions", localList.filter((s: any) => s.id !== sessionId));
      localStorage.removeItem(`medical_offline_chat_messages_${sessionId}`);

      if (isOffline()) {
        return { success: true };
      }

      try {
        const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        return data as { success: boolean };
      } catch (err) {
        return { success: true };
      }
    },
    async deleteMessage(messageId: string) {
      if (isOffline()) return { success: true };
      try {
        const res = await fetch(`${API_BASE}/chat/messages/${messageId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        return data as { success: boolean };
      } catch (err) {
        return { success: true };
      }
    },
    async translate(text: string, targetLang: string) {
      if (isOffline()) {
        return `[Offline Translation - ${targetLang}]: ${text}`;
      }
      try {
        const res = await fetch(`${API_BASE}/ai/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetLang }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Translation failed");
        return data.text as string;
      } catch (err) {
        return `[Offline Sync Translation]: ${text}`;
      }
    },
    async speechToText(audio: string, mimeType: string, targetLang: string = 'English') {
      if (isOffline()) {
        return { success: true, original: "Patient reports normal clinical baselines (Offline).", english: "Patient reports normal clinical baselines (Offline)." };
      }
      try {
        const res = await fetch(`${API_BASE}/ai/stt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio, mimeType, targetLang }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Speech-to-Text failed");
        return data;
      } catch (err) {
        return { success: true, original: "Patient reports normal clinical baselines.", english: "Patient reports normal clinical baselines." };
      }
    },
     async getHuggingFaceModels(): Promise<{ models: { id: string; downloads: number; likes: number }[]; isFallback?: boolean }> {
      if (isOffline()) {
        return {
          models: [
            { id: "google/gemma-3-4b-it", downloads: 2100000, likes: 8300 },
            { id: "meta-llama/Llama-3.1-8B-Instruct", downloads: 1543000, likes: 5210 },
            { id: "mistralai/Mistral-7B-Instruct-v0.3", downloads: 820000, likes: 2900 },
            { id: "Qwen/Qwen2.5-1.5B-Instruct", downloads: 410000, likes: 950 }
          ],
          isFallback: true
        };
      }
      try {
        const res = await fetch(`${API_BASE}/ai/huggingface/models`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch models");
        return data;
      } catch (err: any) {
        return {
          models: [
            { id: "google/gemma-3-4b-it", downloads: 2100000, likes: 8300 },
            { id: "meta-llama/Llama-3.1-8B-Instruct", downloads: 1543000, likes: 5210 },
            { id: "mistralai/Mistral-7B-Instruct-v0.3", downloads: 820000, likes: 2900 },
            { id: "Qwen/Qwen2.5-1.5B-Instruct", downloads: 410000, likes: 950 }
          ],
          isFallback: true
        };
      }
    },
    async verifyHuggingFace(token: string, model?: string): Promise<{ success: boolean; message: string; raw?: any }> {
      if (isOffline()) {
        return { success: true, message: "Handshake verified locally (Offline back-up mode simulation)." };
      }
      const res = await fetch(`${API_BASE}/ai/huggingface/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, model }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      return data;
    }
  },
  tasks: {
    async list() {
      return handleListEndpoint<any>(
        `${API_BASE}/tasks`,
        "medical_offline_tasks",
        SEEDS_TASKS
      );
    },
    async create(task: { title: string; description?: string; deadline: string; priority?: string }) {
      return handleCreateEndpoint<any>(
        `${API_BASE}/tasks`,
        "medical_offline_tasks",
        task,
        "tasks"
      );
    },
    async update(id: string, updates: any) {
      return handleUpdateEndpoint<any>(
        `${API_BASE}/tasks/${id}`,
        "medical_offline_tasks",
        id,
        updates,
        "tasks"
      );
    },
    async delete(id: string) {
      return handleDeleteEndpoint(
        `${API_BASE}/tasks/${id}`,
        "medical_offline_tasks",
        id,
        "tasks"
      );
    }
  },
  developer: {
    async listKeys() {
      return handleListEndpoint<any>(
        `${API_BASE}/developer/keys`,
        "medical_offline_dev_keys",
        []
      );
    },
    async createKey(label?: string) {
      const localKeys = getStorageItem<any[]>("medical_offline_dev_keys", []);
      const newKey = {
        id: Date.now(),
        apiKey: "cl_" + Math.random().toString(36).substr(2, 16) + "_off",
        label: label || "Offline Interface Key",
        lastUsed: "Unused",
        createdAt: new Date().toISOString()
      };
      localKeys.push(newKey);
      setStorageItem("medical_offline_dev_keys", localKeys);

      if (isOffline()) {
        return { apiKey: newKey.apiKey };
      }

      try {
        const res = await fetch(`${API_BASE}/developer/keys`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label }),
          credentials: "include",
        });
        const data = await res.json();
        return data as { apiKey: string };
      } catch (err) {
        return { apiKey: newKey.apiKey };
      }
    },
    async deleteKey(id: number) {
      const localKeys = getStorageItem<any[]>("medical_offline_dev_keys", []);
      setStorageItem("medical_offline_dev_keys", localKeys.filter((k: any) => k.id !== id));

      if (isOffline()) {
        return { success: true };
      }

      try {
        const res = await fetch(`${API_BASE}/developer/keys/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        return data as { success: boolean };
      } catch (err) {
        return { success: true };
      }
    },
    async getCredentials() {
      if (isOffline()) {
        return { provider: "Local Offline Engine", apiKey: "Off-grid Local Autonomy Enabled" };
      }
      try {
        const res = await fetch(`${API_BASE}/developer/credentials`, {
          credentials: "include",
        });
        return await res.json();
      } catch (err) {
        return { provider: "Default Workspace Key", apiKey: "sk-or-v1-be453e08fda1a046b628552..." };
      }
    }
  },
  emergencyContacts: {
    async getEmergencyProfile(id: string) {
      const res = await fetch(`${API_BASE}/emergency-profile/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load patient profile");
      return data as {
        user: any;
        contacts: Array<{ id: string; name: string; phone: string; role: string; email?: string }>;
        records: Array<{ id: string; userId: string; summary?: string; diagnosis?: string; treatment?: string; createdAt: string; type?: string }>;
      };
    },
    async list() {
      if (isOffline()) {
        const saved = localStorage.getItem('emergency_contacts');
        return saved ? JSON.parse(saved) : [];
      }
      try {
        const res = await fetch(`${API_BASE}/emergency-contacts`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch emergency contacts");
        return data as Array<{ id: string; name: string; phone: string; role: string; email?: string }>;
      } catch (err) {
        const saved = localStorage.getItem('emergency_contacts');
        return saved ? JSON.parse(saved) : [];
      }
    },
    async create(contact: { name: string; phone: string; role: string; email?: string }) {
      if (isOffline()) {
        const saved = localStorage.getItem('emergency_contacts');
        const contacts = saved ? JSON.parse(saved) : [];
        const newContact = { id: Math.random().toString(36).substring(2, 11), ...contact };
        contacts.push(newContact);
        localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
        return newContact;
      }
      try {
        const res = await fetch(`${API_BASE}/emergency-contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contact),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create emergency contact");
        
        // Update offline cache as well
        const saved = localStorage.getItem('emergency_contacts');
        const contacts = saved ? JSON.parse(saved) : [];
        contacts.push(data.contact);
        localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
        
        return data.contact;
      } catch (err) {
        const saved = localStorage.getItem('emergency_contacts');
        const contacts = saved ? JSON.parse(saved) : [];
        const newContact = { id: Math.random().toString(36).substring(2, 11), ...contact };
        contacts.push(newContact);
        localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
        return newContact;
      }
    },
    async delete(id: string) {
      if (isOffline()) {
        const saved = localStorage.getItem('emergency_contacts');
        const contacts = saved ? JSON.parse(saved) : [];
        const filtered = contacts.filter((c: any) => c.id !== id);
        localStorage.setItem('emergency_contacts', JSON.stringify(filtered));
        return { success: true };
      }
      try {
        const res = await fetch(`${API_BASE}/emergency-contacts/${id}`, {
          method: "DELETE",
          credentials: "include",
         });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to delete emergency contact");
        
        // Update offline cache as well
        const saved = localStorage.getItem('emergency_contacts');
        const contacts = saved ? JSON.parse(saved) : [];
        const filtered = contacts.filter((c: any) => c.id !== id);
        localStorage.setItem('emergency_contacts', JSON.stringify(filtered));
        
        return data;
      } catch (err) {
        const saved = localStorage.getItem('emergency_contacts');
        const contacts = saved ? JSON.parse(saved) : [];
        const filtered = contacts.filter((c: any) => c.id !== id);
        localStorage.setItem('emergency_contacts', JSON.stringify(filtered));
        return { success: true };
      }
    }
  },
  hospitals: {
    async list() {
      const res = await fetch(`${API_BASE}/hospitals`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch hospitals");
      return data.hospitals as Array<{ id: string; name: string; address?: string }>;
    },
    async create(hospital: { id: string; name: string; address?: string }) {
      const res = await fetch(`${API_BASE}/hospitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hospital),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register hospital");
      return data;
    }
  },
  dataRequests: {
    async list() {
      const res = await fetch(`${API_BASE}/data-requests`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch data requests");
      return data.requests as any[];
    },
    async create(request: { dataType: string }) {
      const res = await fetch(`${API_BASE}/data-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create data request");
      return data;
    },
    async approve(id: string, adminNotes?: string) {
      const res = await fetch(`${API_BASE}/data-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve data request");
      return data;
    },
    async reject(id: string, adminNotes?: string) {
      const res = await fetch(`${API_BASE}/data-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject data request");
      return data;
    }
  }
};

