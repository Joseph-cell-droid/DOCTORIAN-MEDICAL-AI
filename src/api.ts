
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  credits: number;
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
  ollamaUrl?: string;
  ollamaModel?: string;
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
  auth: {
    async signup(email: string, password: string, displayName?: string) {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      return data.user as User;
    },
    async login(email: string, password: string) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      return data.user as User;
    },
    async logout() {
      await fetch(`${API_BASE}/auth/logout`, { 
        method: "POST",
        credentials: "include",
      });
    },
    async me() {
      try {
        const res = await fetchWithRetry(`${API_BASE}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        return data.user as User | null;
      } catch (err) {
        return null;
      }
    },
    async getProfile() {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch user profile");
      return data.user as User;
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
      ollamaUrl?: string;
      ollamaModel?: string;
    }) {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      return data.user as User;
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
      }
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
    async listUsers() {
      const res = await fetch(`${API_BASE}/admin/users`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      return data.users as User[];
    },
    async deleteUser(id: string) {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
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
    }
  },
  doctors: {
    async listActive() {
      const res = await fetch(`${API_BASE}/doctors/active`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch active doctors");
      return data.doctors as Doctor[];
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
      const res = await fetchWithRetry(`${API_BASE}/notifications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch notifications");
      return data.notifications as any[];
    },
    async create(notification: { title: string; content: string; type?: string }) {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create notification");
      return data.notification as any;
    },
    async delete(id: string) {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete notification");
      return data.success as boolean;
    }
  },
  records: {
    async list() {
      const res = await fetch(`${API_BASE}/records`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch records");
      return data.records as HealthRecord[];
    },
    async create(record: Omit<HealthRecord, "id" | "userId">) {
      const res = await fetch(`${API_BASE}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create record");
      return data.record as HealthRecord;
    }
  },
  workouts: {
    async list() {
      const res = await fetch(`${API_BASE}/workouts`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch workouts");
      return data.workouts as any[];
    },
    async create(workout: { type: string; duration: number; calories?: number; intensity?: string; date: string; notes?: string }) {
      const res = await fetch(`${API_BASE}/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workout),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log workout");
      return data.workout;
    },
    async delete(id: string) {
      const res = await fetch(`${API_BASE}/workouts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete workout");
      return data.success as boolean;
    }
  },
  medications: {
    async list() {
      const res = await fetchWithRetry(`${API_BASE}/medications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch medications");
      return data.medications as any[];
    },
    async create(med: any) {
      const res = await fetch(`${API_BASE}/medications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(med),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add medication");
      return data.medication;
    },
    async delete(id: string) {
      const res = await fetch(`${API_BASE}/medications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete medication");
      return data.success;
    },
    async take(id: string, undo: boolean = false) {
      const res = await fetch(`${API_BASE}/medications/${id}/take`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ undo }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log intake");
      return data.success;
    },
    async update(id: string, updates: any) {
      const res = await fetch(`${API_BASE}/medications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update medication");
      return data.success;
    }
  },
  alerts: {
    async sendSms(message: string, toDoctor?: string, toMentor?: string, toPatient?: string) {
      const res = await fetchWithRetry(`${API_BASE}/alerts/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, toDoctor, toMentor, toPatient }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send alert");
      return data as { success: boolean; simulated?: boolean; message: string };
    },
    async makeCall(message: string, toDoctor?: string, toMentor?: string, toPatient?: string) {
      const res = await fetchWithRetry(`${API_BASE}/alerts/make-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, toDoctor, toMentor, toPatient }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate call");
      return data as { success: boolean; simulated?: boolean; message: string };
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

      // Handle local Ollama if configured
      const userStr = localStorage.getItem('medical_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.ollamaUrl && (user.enableExternalAI || user.enableExternalAI === undefined)) {
            console.log(`[Neural Link] Directing pulse to Local Ollama: ${user.ollamaUrl} (Model: ${user.ollamaModel || 'llama3.1'})`);
            const ollamaRes = await fetch(`${user.ollamaUrl}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: user.ollamaModel || 'llama3.1', 
                messages: [
                  { role: 'system', content: systemInstruction },
                  ...payloadMessages.map(m => ({
                    role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.text
                  }))
                ],
                stream: false,
                options: { temperature: temperature || 0.7 }
              })
            });

            if (ollamaRes.ok) {
              const ollamaData = await ollamaRes.json();
              //@ts-ignore
              if (ollamaData.message?.content) {
                //@ts-ignore
                return { text: ollamaData.message.content as string, creditsRemaining: 'Unlimited' };
              }
            }
            console.warn("[Neural Link] Local Ollama failed or returned invalid response. Falling back to clinical hub.");
          }
        } catch (e) {
          console.error("[Neural Link] Local configuration error:", e);
        }
      }

      const res = await fetchWithRetry(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: payloadMessages, 
          systemInstruction, 
          modelName: model, 
          temperature,
          useSearch
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get AI response");
      return data as { text: string; imageData?: string; creditsRemaining?: number | string };
    },
    async voiceChat(text: string, voiceName: string = 'Charon') {
      const res = await fetchWithRetry(`${API_BASE}/ai/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceName }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI Voice call failed");
      return data as { text: string };
    },
    async startVoiceCall() {
      const res = await fetchWithRetry(`${API_BASE}/ai/voice/start`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start voice consultation");
      return data as { success: boolean; remaining: number };
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
      // Handle local Ollama if configured
      const userStr = localStorage.getItem('medical_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.ollamaUrl && (user.enableExternalAI || user.enableExternalAI === undefined)) {
            console.log(`[Neural Link] Directing stream pulse to Local Ollama: ${user.ollamaUrl} (Model: ${user.ollamaModel || 'llama3.1'})`);
            const ollamaRes = await fetch(`${user.ollamaUrl}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: user.ollamaModel || 'llama3.1', 
                messages: [
                  { role: 'system', content: systemInstruction },
                  ...messages.map(m => ({
                    role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.text
                  }))
                ],
                stream: true,
                options: { temperature: temperature || 0.7 }
              }),
              signal
            });

            if (ollamaRes.ok && ollamaRes.body) {
              const reader = ollamaRes.body.getReader();
              const decoder = new TextDecoder();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                for (const line of lines) {
                  if (!line.trim()) continue;
                  try {
                    const data = JSON.parse(line);
                    if (data.message?.content) yield data.message.content;
                    if (data.done && onMetadata) onMetadata({ credits: 'Unlimited' });
                  } catch (e) {
                    // Ignore partial JSON
                  }
                }
              }
              return;
            }
            console.warn("[Neural Link] Local Ollama stream failed. Falling back to clinical hub.");
          }
        } catch (e) {
          console.error("[Neural Link] Local configuration error:", e);
        }
      }

      const res = await fetchWithRetry(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({ 
          messages, 
          systemInstruction, 
          modelName: model, 
          temperature,
          useSearch,
          thinkingLevel,
          images,
          targetLanguage
        }),
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
              const data = JSON.parse(dataStr);
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
    },
    async submitFeedback(feedback: { messageId: string; rating: 'up' | 'down'; suggestion?: string }) {
      const res = await fetch(`${API_BASE}/chat/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");
      return data as { success: boolean; id: string };
    },
    async listKnowledge() {
      const res = await fetch(`${API_BASE}/ai/knowledge`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch knowledge");
      return data as { id: string, title: string, content: string, category: string, createdAt: string }[];
    },
    async addKnowledge(title: string, content: string, category?: string) {
      const res = await fetch(`${API_BASE}/ai/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add knowledge");
      return data;
    },
    async generateImage(prompt: string, aspectRatio: string = "1:1") {
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
      const res = await fetch(`${API_BASE}/ai/knowledge/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete knowledge");
      return data;
    },
    async listSessions() {
      const res = await fetch(`${API_BASE}/chat/sessions`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch neural sessions");
      return data.sessions as { id: string, title: string, persona: string, createdAt: string }[];
    },
    async createSession(title?: string, persona?: string) {
      const res = await fetch(`${API_BASE}/chat/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, persona }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create neural session");
      return data as { id: string, success: boolean };
    },
    async getSessionMessages(sessionId: string) {
      const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch neural timeline");
      return data.messages as { id: string, role: string, text: string, timestamp: string }[];
    },
    async saveMessage(sessionId: string, role: string, text: string) {
      const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, text }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to persist neural packet");
      return data as { id: string, success: boolean };
    },
    async deleteSession(sessionId: string) {
      const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to purge neural session");
      return data as { success: boolean };
    },
    async deleteMessage(messageId: string) {
      const res = await fetch(`${API_BASE}/chat/messages/${messageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete message");
      return data as { success: boolean };
    },
    async translate(text: string, targetLang: string) {
      const res = await fetch(`${API_BASE}/ai/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");
      return data.text as string;
    },
    async speechToText(audio: string, mimeType: string, targetLang: string = 'English') {
      const res = await fetch(`${API_BASE}/ai/stt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio, mimeType, targetLang }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Speech-to-Text failed");
      return data.text as string;
    }
  },
  tasks: {
    async list() {
      const res = await fetch(`${API_BASE}/tasks`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch neural protocols");
      return data as any[];
    },
    async create(task: { title: string; description?: string; deadline: string; priority?: string }) {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to commit neural protocol");
      return data;
    },
    async update(id: string, updates: any) {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update neural protocol");
      return data;
    },
    async delete(id: string) {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to decouple protocol");
      return data as { success: boolean };
    }
  },
  developer: {
    async listKeys() {
      const res = await fetch(`${API_BASE}/developer/keys`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch developer keys");
      return data as { id: number, apiKey: string, label: string, lastUsed: string, createdAt: string }[];
    },
    async createKey(label?: string) {
      const res = await fetch(`${API_BASE}/developer/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create API key");
      return data as { apiKey: string };
    },
    async deleteKey(id: number) {
      const res = await fetch(`${API_BASE}/developer/keys/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete API key");
      return data as { success: boolean };
    }
  }
};

