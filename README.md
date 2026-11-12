# Doctorian Medical AI

> **IMPORTANT MEDICAL DISCLAIMER**: Doctorian Medical AI is a clinical decision-support and educational tool designed to assist healthcare professionals, students, and patients. It is **not a replacement for professional clinical judgment, physical examination, or licensed medical diagnosis**. In medical emergencies, seek immediate care at the nearest accredited health facility or call emergency services.

---

## Overview

Doctorian Medical AI is a high-performance clinical intelligence and patient management platform tailored for healthcare delivery in Uganda and East Africa. It combines clinical triage, vitals telemetry, prescription tracking, and AI-assisted diagnostic guidance grounded in **World Health Organization (WHO)** standards and the **Uganda Clinical Guidelines (UCG)**.

- **Developer & Designer**: Akora Joseph (EBRO Company Ltd / Dr. Obote College)
- **Supported AI Engines**:
  - **Hugging Face Inference Router** (Default: `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16:deepinfra`)
  - **Google Gemini Neural Core** (`gemini-3.8-flash`)
  - **Local Offline / On-Device AI** (Ollama `gemma3:1b`, LM Studio, offline clinical matrix)

---

## Security Best Practices

1. **No Hardcoded Keys**: Never commit real API keys, bearer tokens, or database credentials to version control.
2. **Environment Variables**: Use `.env` (copied from `.env.example`) to configure API secrets locally.
3. **Client-Side Safety**: Tokens stored in browser `localStorage` (such as custom Hugging Face user tokens) are kept strictly on the client and never logged to external servers.
4. **Data Encryption**: Patient records and sensitive telemetry use environment-driven encryption keys (`ENCRYPTION_KEY` / `VITE_ENCRYPTION_KEY`).

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **bun**: For dependency management
- **Modern Browser**: Chrome, Edge, Firefox, or Safari (PWA-compatible)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Joseph-cell-droid/DOCTORIAN-MEDICAL-AI.git
   cd DOCTORIAN-MEDICAL-AI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your API keys to `.env`:
   ```env
   # Hugging Face Router (Recommended)
   HF_TOKEN=your_huggingface_token_here
   HUGGINGFACE_MODEL=nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16:deepinfra

   # Google Gemini API (Alternative)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Data Encryption Key
   ENCRYPTION_KEY=your_secure_random_key_here
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## AI Clinical Safety Framework

All clinical AI interactions follow a rigorous safety protocol aligned with international clinical guidelines:

1. **Structured Clinical Guidance**:
   - **Summary of Presented Symptoms**: Direct distillation of reported signs and onset.
   - **Most Likely Diagnosis**: With probabilistic confidence estimation.
   - **Differential Diagnoses**: 2–4 alternate clinical possibilities to avoid premature diagnostic closure.
   - **Recommended Next Steps / Investigations**: Evidence-based laboratory and bedside tests.
   - **Supportive Care & Self-Management**: Safe hydration, nutrition, and non-pharmacological care.
   - **Medication Suggestions**: Only when clearly indicated by guidelines, with an explicit reminder that a licensed clinician must prescribe.
   - **Emergency Red Flags**: Critical warning signs requiring immediate emergency hospital transfer.
   - **Clinical Disclaimer**: Prominently presented alongside every output.

2. **Hugging Face Inference Router**:
   Supports direct access via `https://router.huggingface.co/v1/chat/completions` with automatic fallback to Gemini and offline guidance.

---

## License & Attribution

Designed and developed by **Akora Joseph** (EBRO Company Ltd).
Built for clinical resilience and community healthcare empowerment across Uganda and East Africa.
