# Clinical Dataset Compiler for Fine-Tuning
# Reads medical.db SQLite tables and outputs a standardized QA format JSONL file.

import sqlite3
import json
import os

DB_PATH = "medical.db"
OUTPUT_FILE = "medical_data.jsonl"

def compile_dataset():
    print(f"[*] Accessing local Doctorian Clinical database ({DB_PATH})...")
    
    if not os.path.exists(DB_PATH):
        print(f"[!] Warning: Database at {DB_PATH} not found. Creating placeholder medical cases...")
        write_placeholder_dataset()
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    samples = []
    
    # --- 1. Extract from knowledge_base ---
    try:
        cursor.execute("SELECT title, content, category FROM knowledge_base")
        kb_rows = cursor.fetchall()
        print(f"[+] Loaded {len(kb_rows)} records from knowledge_base.")
        
        for title, content, category in kb_rows:
            samples.append({
                "instruction": f"What are the clinical protocols, diagnosis instructions, or critical notes regarding: {title}?",
                "input": f"Category: {category or 'clinical'}",
                "output": content
            })
    except Exception as e:
        print(f"[-] Could not read knowledge_base table: {e}")

    # --- 2. Extract from medications ---
    try:
        cursor.execute("SELECT name, dosage, frequency, category FROM medications")
        med_rows = cursor.fetchall()
        print(f"[+] Loaded {len(med_rows)} records from medications.")
        
        for name, dosage, frequency, category in med_rows:
            samples.append({
                "instruction": f"What is the dosing configuration and therapeutic protocol for {name}?",
                "input": f"Dosage: {dosage or 'As directed'}, Category: {category or 'prescription'}",
                "output": f"The medication '{name}' of category '{category}' is prescribed with dosage '{dosage}' to be administered at frequency '{frequency}'."
            })
    except Exception as e:
        print(f"[-] Could not read medications table: {e}")

    # --- 3. Extract from patient metrics / records ---
    try:
        cursor.execute("SELECT type, value, unit, notes FROM records WHERE notes IS NOT NULL AND notes != ''")
        rec_rows = cursor.fetchall()
        print(f"[+] Loaded {len(rec_rows)} records from patient histories.")
        
        for rec_type, value, unit, notes in rec_rows:
            samples.append({
                "instruction": f"Analyze the patient physiological record of type: {rec_type}.",
                "input": f"Registered measurement: {value} {unit or ''}",
                "output": f"The patient recorded a {rec_type} of {value} {unit or ''}. Clinical notes recorded: \"{notes}\"."
            })
    except Exception as e:
        print(f"[-] Could not read records table: {e}")

    # If database is connected but contains 0 samples, seed with standard WHO/clinical protocols
    if len(samples) == 0:
        print("[*] Database represents cold state. Generating medical intelligence matrix samples...")
        write_placeholder_dataset()
        return

    # Write compilations to Output
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for sample in samples:
            f.write(json.dumps(sample) + "\n")
            
    print(f"[+] Successfully compiled {len(samples)} clinical training QA pairs in {OUTPUT_FILE}!")


def write_placeholder_dataset():
    # Seeds high-fidelity protocols to guarantee training file existence
    data = [
        {
            "instruction": "Explain the emergency protocol for acute pediatric respiratory distress.",
            "input": "WHO Integrated Management of Childhood Illness (IMCI) standards.",
            "output": "1. Confirm airway patency. \n2. Administer high-flow supplemental oxygen via non-rebreather mask to maintain SpO2 > 94%.\n3. Administer nebulized salbutamol (2.5 - 5mg) fast if wheezing.\n4. Give oral or IV dexamethasone (0.6mg/kg) to suppress tracheal swelling.\n5. Arrange urgent referral to secondary pediatric ward."
        },
        {
            "instruction": "What are the core clinical diagnostic signs of acute Plasmodium falciparum malaria?",
            "input": "High transmission tropical environments.",
            "output": "1. Cyclical spike fevers (>39C) with severe chills and rigor.\n2. Splenomegaly and mild-to-moderate jaundice due to hemolysis.\n3. Severe headache, myalgia, arthralgia, and lethargy.\n4. Thrombocytopenia and profound normocytic anemia on lab examination.\n5. Confirmed diagnosis via thick/thin peripheral blood smears or rapid diagnostic tests (RDTs)."
        },
        {
            "instruction": "Provide the therapeutic guidelines for hypertension management in non-diabetic adult patients.",
            "input": "Sustained Blood Pressure > 140/90 mmHg.",
            "output": "1. Initiate therapeutic lifestyle changes (dash diet, low salt <1.5g/day, exercise).\n2. First-line pharmacotherapy: ACE Inhibitors (Lisinopril 10-20mg daily), ARBs (Losartan 50mg daily), Calcium Channel Blockers (Amlodipine 5mg daily), or Thiazide diuretics.\n3. Re-evaluate blood pressure in 4 weeks. Standardize goal targets to <130/80 mmHg."
        },
        {
            "instruction": "Briefly state the triage criteria for severe dehydration in cholera epidemics.",
            "input": "Stool consistency: water-rice diarrhea.",
            "output": "1. Key signs: Lethargy, sunken eyes, skin pinch retracts extremely slowly (>2 seconds), dry mouth.\n2. Management: Immediate IV administration of Ringer's Lactate (100ml/kg over 3 hours for adults, 6 hours for neonates).\n3. Reassess hourly. Pivot to oral rehydration salts (ORS) as soon as consciousness returns."
        }
    ]
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for item in data:
            f.write(json.dumps(item) + "\n")
            
    print(f"[+] Structured {len(data)} emergency medical knowledge nodes into {OUTPUT_FILE}.")

if __name__ == "__main__":
    compile_dataset()
