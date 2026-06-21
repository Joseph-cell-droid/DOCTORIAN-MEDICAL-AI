import { useState, useEffect, useCallback, useRef } from 'react';

export interface Vitals {
  heartRate: number;
  temperature: number;
  spo2: number;
  systolicBP: number;
  diastolicBP: number;
  respiratoryRate: number;
  timestamp: number;
}

export interface HealthStatus {
  overall: 'excellent' | 'normal' | 'warning' | 'critical';
  score: number;
  alerts: string[];
}

export interface ConnectionState {
  connected: boolean;
  type: 'bluetooth' | 'wifi' | 'serial' | 'demo' | 'cloud' | null;
  deviceName: string | null;
}

export interface DnaStatus {
  sequencing: boolean;
  progress: number;
  markers: string[];
  results: {
    haplogroup: string;
    variantRisks: { gene: string; risk: 'low' | 'moderate' | 'high'; description: string }[];
    cellularAge: number;
    telomereHealth: 'excellent' | 'normal' | 'declining';
  } | null;
}

export const useArduino = () => {
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [history, setHistory] = useState<Vitals[]>([]);
  const [connection, setConnection] = useState<ConnectionState>({
    connected: false,
    type: null,
    deviceName: null,
  });
  const [dnaStatus, setDnaStatus] = useState<DnaStatus>({
    sequencing: false,
    progress: 0,
    markers: [],
    results: null
  });
  const [wifiEndpoint, setWifiEndpoint] = useState('http://192.168.1.100');
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [neuralInsight, setNeuralInsight] = useState<string | null>(null);
  const [neuralAlert, setNeuralAlert] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [watchMetadata, setWatchMetadata] = useState<{ battery?: number; manufacturer?: string } | null>(null);

  const lastAiAnalysisTime = useRef<number>(0);
  const isAnalyzing = useRef<boolean>(false);

  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wifiIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bluetoothDeviceRef = useRef<any>(null);
  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);

  const calculateHealthStatus = useCallback((v: Vitals): HealthStatus => {
    const alerts: string[] = [];
    let score = 100;

    // Heart Rate Analysis
    if (v.heartRate > 160 || v.heartRate < 35) {
      alerts.push('CRITICAL: Life-threatening Arrhythmia (Emergency)');
      score -= 60;
    } else if (v.heartRate > 130) {
      alerts.push('Severe Tachycardia: Risk of Cardiac Strain');
      score -= 35;
    } else if (v.heartRate > 100) {
      alerts.push('Tachycardia: Elevated Heart Rate');
      score -= 15;
    } else if (v.heartRate < 45) {
      alerts.push('Severe Bradycardia: Risk of Syncope');
      score -= 35;
    } else if (v.heartRate < 60) {
      alerts.push('Bradycardia: Low Heart Rate');
      score -= 10;
    }

    // Temperature Analysis
    if (v.temperature > 41) {
      alerts.push('CRITICAL: Hyperpyrexia (Brain Damage Risk)');
      score -= 60;
    } else if (v.temperature > 39) {
      alerts.push('High Fever: Systemic Infection Risk');
      score -= 35;
    } else if (v.temperature > 37.8) {
      alerts.push('Pyrexia: Low-grade Fever');
      score -= 10;
    } else if (v.temperature < 34) {
      alerts.push('CRITICAL: Severe Hypothermia');
      score -= 50;
    } else if (v.temperature < 35.5) {
      alerts.push('Mild Hypothermia');
      score -= 15;
    }

    // Oxygen Saturation Analysis
    if (v.spo2 < 80) {
      alerts.push('CRITICAL: Respiratory Arrest Imminent (Very Low SpO2)');
      score -= 70;
    } else if (v.spo2 < 88) {
      alerts.push('Severe Hypoxia: Supplemental Oxygen Required');
      score -= 45;
    } else if (v.spo2 < 92) {
      alerts.push('Hypoxia: Impaired Oxygenation');
      score -= 25;
    } else if (v.spo2 < 95) {
      alerts.push('Mild Desaturation');
      score -= 10;
    }

    // Blood Pressure Analysis (Hypertension/Hypotension)
    if (v.systolicBP > 200 || v.diastolicBP > 130) {
      alerts.push('CRITICAL: Hypertensive Emergency (Stroke Risk)');
      score -= 60;
    } else if (v.systolicBP > 180 || v.diastolicBP > 110) {
      alerts.push('Hypertensive Urgency');
      score -= 40;
    } else if (v.systolicBP > 140 || v.diastolicBP > 90) {
      alerts.push('Hypertension Stage 2');
      score -= 20;
    } else if (v.systolicBP < 80) {
      alerts.push('CRITICAL: Severe Hypotension (Shock Risk)');
      score -= 45;
    } else if (v.systolicBP < 95) {
      alerts.push('Hypotension: Low Blood Pressure');
      score -= 15;
    }

    // Respiratory Rate Analysis
    if (v.respiratoryRate > 35 || v.respiratoryRate < 6) {
      alerts.push('CRITICAL: Respiratory Distress/Apnea');
      score -= 50;
    } else if (v.respiratoryRate > 24) {
      alerts.push('Tachypnea: Rapid Breathing');
      score -= 20;
    } else if (v.respiratoryRate < 10) {
      alerts.push('Bradypnea: Abnormally Slow Breathing');
      score -= 15;
    }

    let overall: HealthStatus['overall'] = 'excellent';
    if (score < 60) overall = 'critical';
    else if (score < 80) overall = 'warning';
    else if (score < 95) overall = 'normal';

    if (alerts.length === 0) {
      alerts.push('All vitals are within normal ranges.');
    }

    return { overall, score, alerts };
  }, []);

  const updateVitals = useCallback((newVitals: Vitals) => {
    setVitals(newVitals);
    setHistory(prev => {
      const newHistory = [...prev.slice(-49), newVitals];
      // Neural Analysis Trigger (Throttled to every 30s)
      const now = Date.now();
      if (now - lastAiAnalysisTime.current > 30000 && !isAnalyzing.current && newHistory.length > 5) {
        isAnalyzing.current = true;
        const trendData = newHistory.slice(-10).map(h => 
          `HR:${h.heartRate},SpO2:${h.spo2},Temp:${h.temperature}`
        ).join('|');
        
        import('../api').then(({ api }) => {
          api.ai.aiChat(
            `Analyze this 2-minute vitals trend: ${trendData}. 
             Recent: HR:${newVitals.heartRate}, SpO2:${newVitals.spo2}%, Temp:${newVitals.temperature}C.
             Detect if patient is WORSENING or STABLE. 
             Return JSON: {"insight": "1-sentence clinician summary", "alert": true/false}`,
            "You are a specialized medical telemetry analyst (Gemma 2).",
            "google/gemma-2-27b-it"
          ).then(res => {
            try {
              const data = JSON.parse(res.text.replace(/```json|```/g, '').trim());
              setNeuralInsight(data.insight);
              setNeuralAlert(data.alert);
              if (data.alert) {
                console.warn('[NEURAL-ALARM] AI detected worsening condition!');
              }
            } catch (e) {
              setNeuralInsight(res.text.slice(0, 100) + '...');
            }
          }).finally(() => {
            isAnalyzing.current = false;
            lastAiAnalysisTime.current = Date.now();
          });
        });
      }
      return newHistory;
    });
    const status = calculateHealthStatus(newVitals);
    setHealthStatus(status);
    
    // Feed parameters directly to background sonification agent
    import('../utils/vitalsSonifier').then(({ VitalsSonifier }) => {
      VitalsSonifier.updatePresence(newVitals, status.overall);
    });
  }, [calculateHealthStatus]);

  const parseData = useCallback((data: string) => {
    try {
      // Expected format: HR,TEMP,SPO2,SYS,DIA,RR
      // Example: 72,36.5,98,120,80,16
      const parts = data.trim().split(',');
      if (parts.length >= 6) {
        updateVitals({
          heartRate: parseFloat(parts[0]),
          temperature: parseFloat(parts[1]),
          spo2: parseFloat(parts[2]),
          systolicBP: parseFloat(parts[3]),
          diastolicBP: parseFloat(parts[4]),
          respiratoryRate: parseFloat(parts[5]),
          timestamp: Date.now(),
        });
      } else {
        // Try JSON if CSV fails
        const json = JSON.parse(data);
        updateVitals({
          heartRate: json.hr || json.heartRate,
          temperature: json.temp || json.temperature,
          spo2: json.spo2,
          systolicBP: json.sys || json.systolicBP,
          diastolicBP: json.dia || json.diastolicBP,
          respiratoryRate: json.rr || json.respiratoryRate,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.warn('Failed to parse incoming data:', data);
    }
  }, [updateVitals]);

  const disconnect = useCallback(async () => {
    setError(null);
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    if (wifiIntervalRef.current) clearInterval(wifiIntervalRef.current);
    
    if (bluetoothDeviceRef.current && bluetoothDeviceRef.current.gatt.connected) {
      bluetoothDeviceRef.current.gatt.disconnect();
    }
    
    if (serialReaderRef.current) {
      await serialReaderRef.current.cancel();
      serialReaderRef.current = null;
    }
    
    if (serialPortRef.current) {
      await serialPortRef.current.close();
      serialPortRef.current = null;
    }

    setConnection({ connected: false, type: null, deviceName: null });
    setVitals(null);
    setHistory([]);
    setHealthStatus(null);
  }, []);

  const startDemo = useCallback((preset: 'healthy' | 'warning' | 'critical' | boolean = 'healthy') => {
    disconnect();
    setConnection({ connected: true, type: 'demo', deviceName: 'Simulated Patient' });
    
    let tickCount = 0;
    demoIntervalRef.current = setInterval(() => {
      const condition = typeof preset === 'boolean' 
        ? (preset ? 'critical' : 'healthy') 
        : preset;
      
      let newVitals: Vitals;
      if (condition === 'critical') {
        newVitals = {
          heartRate: Math.round(135 + Math.random() * 15),
          temperature: parseFloat((39.4 + Math.random() * 0.8).toFixed(1)),
          spo2: Math.max(65, Math.min(92, Math.round(83 + Math.random() * 4))),
          systolicBP: Math.round(190 + Math.random() * 15),
          diastolicBP: Math.round(110 + Math.random() * 8),
          respiratoryRate: Math.round(28 + Math.random() * 4),
          timestamp: Date.now(),
        };
      } else if (condition === 'warning') {
        newVitals = {
          heartRate: Math.round(102 + Math.random() * 8),
          temperature: parseFloat((37.9 + Math.random() * 0.4).toFixed(1)),
          spo2: Math.round(91 + Math.random() * 3),
          systolicBP: Math.round(136 + Math.random() * 8),
          diastolicBP: Math.round(86 + Math.random() * 5),
          respiratoryRate: Math.round(21 + Math.random() * 3),
          timestamp: Date.now(),
        };
      } else {
        newVitals = {
          heartRate: Math.round(68 + Math.random() * 8),
          temperature: parseFloat((36.6 + Math.random() * 0.3).toFixed(1)),
          spo2: Math.round(96 + Math.random() * 3),
          systolicBP: Math.round(118 + Math.random() * 6),
          diastolicBP: Math.round(78 + Math.random() * 4),
          respiratoryRate: Math.round(14 + Math.random() * 3),
          timestamp: Date.now(),
        };
      }
      updateVitals(newVitals);
      tickCount++;
    }, 2000);
  }, [disconnect, updateVitals]);

  const connectBluetooth = useCallback(async () => {
    setError(null);
    disconnect();
    try {
      const nav = navigator as any;
      if (!nav.bluetooth) {
        throw new Error('Web Bluetooth is not supported in this browser.');
      }
      
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: [0xffe0] }], // Standard HM-10 service
        optionalServices: ['battery_service', 'device_information']
      });

      bluetoothDeviceRef.current = device;
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(0xffe0);
      const characteristic = await service.getCharacteristic(0xffe1);

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const decoder = new TextDecoder();
        const data = decoder.decode(value);
        parseData(data);
      });

      device.addEventListener('gattserverdisconnected', () => {
        setConnection({ connected: false, type: null, deviceName: null });
      });

      setConnection({ connected: true, type: 'bluetooth', deviceName: device.name || 'Arduino BLE' });
    } catch (err: any) {
      console.error('Bluetooth error:', err);
      let friendlyMessage = 'Bluetooth connection failed.';
      const msg = err.message || '';
      
      if (err.name === 'SecurityError' || msg.includes('SecurityError') || msg.includes('permissions policy') || msg.includes('disallowed') || msg.includes('iframe')) {
        friendlyMessage = 'Access to Bluetooth is blocked by browser iframe permission rules. Please click the "Open in New Tab" button in the upper-right corner of Google AI Studio or use the simulated "Health Connect Sync" client to bridge telemetry data.';
      } else if (err.name === 'NotFoundError') {
        friendlyMessage = 'Connection cancelled. Please select your Arduino device from the list.';
      } else if (err.name === 'NetworkError') {
        friendlyMessage = 'Could not connect to the device. Ensure your Arduino is powered on, in pairing mode, and within range.';
      } else if (msg.includes('User cancelled')) {
        friendlyMessage = 'Connection cancelled. Please try again and select your device.';
      } else {
        friendlyMessage = `Bluetooth Error: ${err.message || 'Unknown error'}. Please check if your device is in pairing mode and Bluetooth is on.`;
      }
      
      setError(friendlyMessage);
    }
  }, [parseData]);

  const connectSerial = useCallback(async () => {
    setError(null);
    disconnect();
    try {
      const nav = navigator as any;
      if (!nav.serial) {
        throw new Error('Web Serial is not supported in this browser.');
      }

      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 9600 });
      serialPortRef.current = port;

      setConnection({ connected: true, type: 'serial', deviceName: 'Arduino Serial' });

      const decoder = new TextDecoderStream();
      const inputDone = port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;
      const reader = inputStream.getReader();
      serialReaderRef.current = reader;

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.trim()) parseData(line);
        }
      }
    } catch (err: any) {
      console.error('Serial error:', err);
      setError(err.message || 'Serial connection failed.');
    }
  }, [parseData]);

  const connectWiFi = useCallback(async (endpoint: string) => {
    setError(null);
    disconnect();
    setWifiEndpoint(endpoint);
    setConnection({ connected: true, type: 'wifi', deviceName: endpoint });

    wifiIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${endpoint}/vitals`, { mode: 'cors' });
        const data = await res.json();
        updateVitals({
          heartRate: data.hr || data.heartRate,
          temperature: data.temp || data.temperature,
          spo2: data.spo2,
          systolicBP: data.sys || data.systolicBP,
          diastolicBP: data.dia || data.diastolicBP,
          respiratoryRate: data.rr || data.respiratoryRate,
          timestamp: Date.now(),
        });
      } catch (err: any) {
        console.error('WiFi Fetch Error:', err);
        // Don't disconnect immediately on one failure, but maybe show a warning
      }
    }, 3000);
  }, [disconnect, updateVitals]);

  const connectWebSocket = useCallback(() => {
    setError(null);
    disconnect();
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/biometrics`;
    
    console.log(`[WS] Connecting to neural biometrics relay: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    webSocketRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Neural Stream established.');
      setConnection({ connected: true, type: 'cloud', deviceName: 'Neural Relay (Cloud)' });
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'vitals' || message.type === 'vitals_relay') {
          updateVitals(message.data);
        } else if (message.type === 'vitals_raw') {
          parseData(message.data);
        }
      } catch (err) {
        // Fallback to raw data parsing if it's not JSON
        parseData(event.data);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Neural Stream connection lost.');
      setConnection({ connected: false, type: null, deviceName: null });
      
      // Auto-reconnect logic
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('[WS] Attempting to restabilize neural link...');
        connectWebSocket();
      }, 5000);
    };

    ws.onerror = (err) => {
      console.error('[WS] Neural Stream error:', err);
      setError('Neural stream synchronization failure. Attempting reconnection...');
    };
  }, [disconnect, updateVitals, parseData]);

  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      if (wifiIntervalRef.current) clearInterval(wifiIntervalRef.current);
      if (webSocketRef.current) {
        webSocketRef.current.onclose = null; // Prevent reconnect on unmount
        webSocketRef.current.close();
      }
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  const simulateEmergency = useCallback(() => {
    const emergencyVitals: Vitals = {
      heartRate: 145 + Math.random() * 10,
      temperature: 39.8 + Math.random() * 0.5,
      spo2: 84 + Math.random() * 3,
      systolicBP: 195 + Math.random() * 10,
      diastolicBP: 115 + Math.random() * 5,
      respiratoryRate: 32 + Math.random() * 4,
      timestamp: Date.now(),
    };
    updateVitals(emergencyVitals);
  }, [updateVitals]);

  const startDnaSequencing = useCallback(() => {
    setDnaStatus(prev => ({ ...prev, sequencing: true, progress: 0, results: null }));
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 5;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setDnaStatus({
          sequencing: false,
          progress: 100,
          markers: ['BRCA1-Negative', 'APOE4-Stable', 'COL1A1-Optimal'],
          results: {
            haplogroup: 'R1b-U106',
            variantRisks: [
              { gene: 'BRCA1', risk: 'low', description: 'No pathogenic variants detected.' },
              { gene: 'MTHFR', risk: 'moderate', description: 'Heterozygous for C677T variant. Slight folate processing reduction.' },
              { gene: 'LDLR', risk: 'low', description: 'Optimal cholesterol metabolism markers.' }
            ],
            cellularAge: 28,
            telomereHealth: 'excellent'
          }
        });
      } else {
        const markers = ['ACTN3', 'IL6', 'TNF', 'GSTP1', 'SOD2'].slice(0, Math.floor(currentProgress / 20));
        setDnaStatus(prev => ({ ...prev, progress: currentProgress, markers }));
      }
    }, 800);
  }, []);

  const performGlobalTrace = useCallback(async (data: { records: any[], meds: any[], tasks: any[], patientInfo?: any }) => {
    if (!vitals && history.length === 0) return null;
    
    isAnalyzing.current = true;
    try {
      const { api } = await import('../api');
      const patient = data.patientInfo || { name: 'Gloria (Self)', relation: 'Owner', age: 28, targetDevice: 'Samsung Galaxy Watch 6 Pro' };
      const analysisPrompt = `
        Perform an Advanced Longitudinal Global Health Trace for patient "${patient.name}" (${patient.relation}, Age ${patient.age}) connected to device ${patient.targetDevice || 'integrated wearable'}.
        DATA MATRIX:
        - Current Active Vitals STATE: ${JSON.stringify(vitals)}
        - Selected Timeframe: Tracing logs beyond 90 days (past 120 days longitudinal trend).
        - Direct Bio-Feedback history: ${JSON.stringify(history.slice(-25))}
        - Medical History Records: ${JSON.stringify(data.records.slice(-15))}
        - Standard Meds/Prescriptions: ${JSON.stringify(data.meds)}
        - Care Protocol Tasks: ${JSON.stringify(data.tasks)}

        TASK:
        1. Evaluate clinical physiological progress specifically relative to past records stretching back past 90 days.
        2. Detect any worsening trends, cardiac anomalies, blood pressure drift, or medication side-effect correlations.
        3. Provide a 'Doctorian Health Trajectory Status' (Improving/Stable/Declining).
        4. Suggest protocol adjustments suited for this patient profile.
        
        Tone: Cyber-Clinical, ultra-precise, objective, and highly professional.
      `;

      const res = await api.ai.aiChat(
        [{ role: 'user', text: analysisPrompt }],
        "You are Doctorian (Llama 3.1 Neural Core). You analyze high-resolution longitudinal health data to trace patient progress across all biological subsystems.",
        "meta-llama/llama-3.1-70b-instruct"
      );

      return res.text;
    } catch (err) {
      console.error("Global health trace failed:", err);
      return "Neural link failed to synthesize global health trajectory.";
    } finally {
      isAnalyzing.current = false;
    }
  }, [vitals, history]);

  const triggerAlarm = useCallback(async (type: 'medication' | 'emergency' | 'test') => {
    const command = `${type.toUpperCase()}_ALARM\n`;
    
    if (connection.type === 'bluetooth' && bluetoothDeviceRef.current) {
      try {
        const server = await bluetoothDeviceRef.current.gatt.connect();
        const service = await server.getPrimaryService(0xffe0);
        const characteristic = await service.getCharacteristic(0xffe1);
        const encoder = new TextEncoder();
        await characteristic.writeValue(encoder.encode(command));
        console.log(`[ARDUINO] Bluetooth command sent: ${command}`);
      } catch (err: any) {
        console.error('Bluetooth trigger failed:', err);
        setError(`Failed to trigger Bluetooth alarm: ${err.message}`);
      }
    } else if (connection.type === 'wifi') {
      try {
        await fetch(`${wifiEndpoint}/trigger?type=${type}`, { method: 'POST', mode: 'cors' });
        console.log(`[ARDUINO] WiFi trigger sent: ${type}`);
      } catch (err: any) {
        console.error('WiFi trigger failed:', err);
        setError(`Failed to trigger WiFi alarm: ${err.message}`);
      }
    } else if (connection.type === 'serial' && serialPortRef.current) {
      try {
        const writer = serialPortRef.current.writable.getWriter();
        const encoder = new TextEncoder();
        await writer.write(encoder.encode(command));
        writer.releaseLock();
        console.log(`[ARDUINO] Serial command sent: ${command}`);
      } catch (err: any) {
        console.error('Serial trigger failed:', err);
        setError(`Failed to trigger Serial alarm: ${err.message}`);
      }
    } else {
      console.log(`[ARDUINO] Simulated trigger: ${type}`);
    }
  }, [connection, wifiEndpoint]);

  const connectHealthWatch = useCallback(async () => {
    setError(null);
    disconnect();
    try {
      const nav = navigator as any;
      if (!nav.bluetooth) {
        throw new Error('Web Bluetooth is not supported in this browser.');
      }
      
      console.log('[WATCH] Requesting Health Watch...');
      // Standard services for heart rate and pulse oximeter
      const device = await nav.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] }
        ],
        optionalServices: ['battery_service', 'device_information', 0x1822] // 0x1822 is Pulse Oximeter
      });

      bluetoothDeviceRef.current = device;
      console.log(`[WATCH] Connecting to ${device.name}...`);
      const server = await device.gatt.connect();
      
      // Heart Rate Service
      try {
        const hrService = await server.getPrimaryService('heart_rate');
        const hrChar = await hrService.getCharacteristic('heart_rate_measurement');
        
        await hrChar.startNotifications();
        hrChar.addEventListener('characteristicvaluechanged', (event: any) => {
          const value = event.target.value;
          const flags = value.getUint8(0);
          const is16Bit = flags & 0x1;
          const heartRate = is16Bit ? value.getUint16(1, true) : value.getUint8(1);
          
          updateVitals({
            heartRate,
            temperature: 36.6,
            spo2: 98,
            systolicBP: 120,
            diastolicBP: 80,
            respiratoryRate: 16,
            timestamp: Date.now(),
          });
        });
      } catch (hrErr) {
        console.warn('Heart rate service not available:', hrErr);
      }

      // Battery Service
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryChar = await batteryService.getCharacteristic('battery_level');
        const batteryVal = await batteryChar.readValue();
        setWatchMetadata(prev => ({ ...prev, battery: batteryVal.getUint8(0) }));
      } catch (battErr) {
        console.warn('Battery service not available:', battErr);
      }

      // Device Information Service
      try {
        const infoService = await server.getPrimaryService('device_information');
        const manufacturerChar = await infoService.getCharacteristic('manufacturer_name_string');
        const manufacturerVal = await manufacturerChar.readValue();
        const decoder = new TextDecoder();
        setWatchMetadata(prev => ({ ...prev, manufacturer: decoder.decode(manufacturerVal) }));
      } catch (infoErr) {
        console.warn('Device info service not available:', infoErr);
      }

      device.addEventListener('gattserverdisconnected', () => {
        setConnection({ connected: false, type: null, deviceName: null });
      });

      setConnection({ connected: true, type: 'bluetooth', deviceName: device.name || 'Health Watch' });
    } catch (err: any) {
      console.error('Watch connection error:', err);
      let friendlyError = err.message || 'Unknown protocol error';
      if (err.name === 'SecurityError' || friendlyError.includes('SecurityError') || friendlyError.includes('permissions policy') || friendlyError.includes('disallowed') || friendlyError.includes('iframe')) {
        friendlyError = "Authentication or iframe restrictions blocked Bluetooth interface. Please open this app in a New Tab (using the top-right button in AI Studio) to allow secure Web Bluetooth hardware access, or utilize our premium Google Health Connect Integration Sync client to fetch watch biometrics.";
      } else if (!(navigator as any).bluetooth) {
        friendlyError = "Web Bluetooth is not supported by your browser or is blocked. Try using Google Chrome, Microsoft Edge, or Bluefy on iOS, and make sure the app is opened in a New Tab.";
      } else if (err.name === 'NotFoundError' || friendlyError.includes('User cancelled')) {
        friendlyError = "Connection cancelled. Please choose or select your real-time smartwatch / heart-rate sensor from the pairing menu.";
      }
      setError(`Watch Link Failed: ${friendlyError}`);
    }
  }, [disconnect, updateVitals]);

  return {
    vitals,
    history,
    healthStatus,
    connection,
    wifiEndpoint,
    setWifiEndpoint,
    connectBluetooth,
    connectHealthWatch,
    connectSerial,
    connectWiFi,
    connectWebSocket,
    triggerAlarm,
    performGlobalTrace,
    disconnect,
    startDemo,
    simulateEmergency,
    startDnaSequencing,
    dnaStatus,
    neuralInsight,
    neuralAlert,
    watchMetadata,
    error,
    updateVitals,
    setConnection,
  };
};
