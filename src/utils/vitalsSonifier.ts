class VitalsSonifierEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  private heartRate: number = 72;
  private spo2: number = 98;
  private overallStatus: string = 'normal';

  private isEnabled: boolean = false;
  private isPlaying: boolean = false;
  private timeoutId: any = null;
  private currentVolume: number = 0.3;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('doctorian:vitals_sonification_enabled');
      this.isEnabled = savedEnabled === 'true'; // Default is disabled so we don't annoy users on first load
      
      const savedVolume = localStorage.getItem('doctorian:vitals_sonification_volume');
      if (savedVolume !== null) {
        this.currentVolume = parseFloat(savedVolume);
      }
    }
  }

  private initContext() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;

    this.ctx = new AudioCtxClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  public updatePresence(vitals: { heartRate: number; spo2: number; }, overallStatus: string) {
    this.heartRate = vitals.heartRate || 72;
    this.spo2 = vitals.spo2 || 98;
    this.overallStatus = overallStatus || 'normal';

    // If enabled but not playing, attempt starting
    if (this.isEnabled && !this.isPlaying) {
      this.start();
    }
  }

  public start() {
    if (typeof window === 'undefined') return;
    if (this.isPlaying) return;

    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      this.isPlaying = true;
      this.scheduleNextBeep();
      console.log("[SONIFIER] Pulse Audio diagnostics background module started.");
    } catch (e) {
      console.warn("[SONIFIER] Could not start audio context:", e);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private scheduleNextBeep() {
    if (!this.isPlaying || !this.isEnabled) return;

    this.playPulseBeep();

    // calculate interval based on heartRate (BPM)
    const bpm = Math.max(30, Math.min(220, this.heartRate));
    const intervalMs = (60 / bpm) * 1000;

    this.timeoutId = setTimeout(() => {
      this.scheduleNextBeep();
    }, intervalMs);
  }

  private playPulseBeep() {
    if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;

    try {
      const now = this.ctx.currentTime;
      // Frequency mapped dynamically to Oxygen saturation
      // Higher SpO2 = higher oximeter pitch. Range is beautiful!
      const minO2 = 70;
      const maxO2 = 100;
      const clampedO2 = Math.max(minO2, Math.min(maxO2, this.spo2));
      const percentage = (clampedO2 - minO2) / (maxO2 - minO2);
      
      // Pitch ranges from 350Hz (low SpO2) to 700Hz (perfect SpO2)
      const pulseFreq = 350 + percentage * 350;

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pulseFreq, now);

      // Amplitude envelope (fast attack, exponentially fading decay for sharp clean oximeter click)
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.currentVolume, now + 0.008);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gainNode).connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.1);

      // Warning siren triggers if critical / warning status
      if (this.overallStatus === 'warning' || this.overallStatus === 'critical') {
        const warningPitch = this.overallStatus === 'critical' ? 880 : 580;
        const alertDelay = 0.15; // plays 150ms after the main beat
        
        const oscAlert = this.ctx.createOscillator();
        const gainAlert = this.ctx.createGain();

        oscAlert.type = 'triangle';
        oscAlert.frequency.setValueAtTime(warningPitch, now + alertDelay);

        gainAlert.gain.setValueAtTime(0, now);
        gainAlert.gain.setValueAtTime(0, now + alertDelay);
        gainAlert.gain.linearRampToValueAtTime(this.currentVolume * 0.7, now + alertDelay + 0.005);
        gainAlert.gain.exponentialRampToValueAtTime(0.001, now + alertDelay + 0.08);

        oscAlert.connect(gainAlert).connect(this.masterGain);
        oscAlert.start(now + alertDelay);
        oscAlert.stop(now + alertDelay + 0.1);
      }
    } catch (err) {
      console.warn("[SONIFIER] Beep aborted:", err);
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('doctorian:vitals_sonification_enabled', String(enabled));
    
    if (enabled) {
      this.start();
    } else {
      this.stop();
    }

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('doctorian:vitals_sound_setting_update', { detail: { enabled } }));
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    localStorage.setItem('doctorian:vitals_sonification_volume', String(volume));

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(volume, now + 0.1);
    }

    window.dispatchEvent(new CustomEvent('doctorian:vitals_sound_setting_update', { detail: { volume } }));
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public isSonifierPlaying(): boolean {
    return this.isPlaying;
  }
}

export const VitalsSonifier = new VitalsSonifierEngine();
