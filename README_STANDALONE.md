# Doctorian Medical AI - Standalone Local Application Setup Guide

Welcome to **Doctorian Medical AI** — High-Tech Clinical Assistant & Hospital Management Suite.

This package contains the complete source code and configuration required to run the Doctorian application locally on your computer, server, or cloud virtual machine independently without relying on Google AI Studio links.

---

## 📋 System Requirements
- **Node.js**: Version 18.x or 20.x (LTS recommended)
- **npm**: Version 9.x or higher
- **RAM**: Minimum 2 GB RAM (4 GB recommended)
- **OS**: Windows 10/11, macOS, or Linux (Ubuntu/Debian)

---

## 🚀 Quick Start Guide

### Step 1: Extract the Zip File
Extract `doctorian-standalone-medical-app.zip` to your desired folder location on your machine.

### Step 2: Open Terminal / Command Prompt
Navigate to the extracted directory:
```bash
cd doctorian-standalone-medical-app
```

### Step 3: Install All Dependencies
Run the following command to download and install all required npm packages:
```bash
npm install
```

### Step 4: Start the Local Development & Server Instance
Run the application dev server:
```bash
npm run dev
```
Or build and start the standalone production server:
```bash
npm run build
npm start
```

### Step 5: Open in Your Web Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🛠️ Features Included in Standalone Package
- **Clinical Knowledge Engine**: Embedded WHO & CDC medical guidelines database.
- **Offline Machine Translation**: MarianMT / Helsinki-NLP translation dictionaries.
- **Offline First PWA Architecture**: Operates without external cloud dependency.
- **Biometric & Emergency SOS System**: Real-time alerts and patient vitals tracking.
- **Local SQLite & Firestore Multi-Db Sync**: Fast, zero-lag local database storage.

---

## 👩‍⚕️ Created & Developed By
**Akora Joseph** from **EBRO Company**.
Lead Medical AI Engineering Team.
