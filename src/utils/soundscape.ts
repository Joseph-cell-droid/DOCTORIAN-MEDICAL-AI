/**
 * Custom High-Fidelity Web Audio Soundscape Generator
 * Produces real-time, phase-aligned Binaural Beats mapped to cognitive focus tiers
 * paired with a low-pass filtered brownian rumble simulation for active ambient masking.
 */

export type SoundscapeType = 'alpha_focus' | 'theta_meditation' | 'beta_high_cognition';

export interface SoundscapePreset {
  name: string;
  desc: string;
  leftFreq: number;
  rightFreq: number; // Left and Right delta creates the binaural beat frequency
  binauralBeatFreq: number;
  color: string;
}

export const SOUNDSCAPE_PRESETS: Record<SoundscapeType, SoundscapePreset> = {
  alpha_focus: {
    name: "Alpha Synaptic Focus",
    desc: "10 Hz pulsation to promote flow-state deep learning, cognitive stamina, and mental clarity.",
    leftFreq: 140,
    rightFreq: 150,
    binauralBeatFreq: 10,
    color: "from-blue-600 to-cyan-500",
  },
  theta_meditation: {
    name: "Theta Deep Repair",
    desc: "5 Hz deep waves to reduce high-frequency tension, mitigate stress-cycling, and soothe cranial fatigue.",
    leftFreq: 95,
    rightFreq: 100,
    binauralBeatFreq: 5,
    color: "from-purple-600 to-indigo-500",
  },
  beta_high_cognition: {
    name: "Beta High-Cognition",
    desc: "20 Hz beta pulses for intense analytics, logical reasoning, and active memory processing.",
    leftFreq: 220,
    rightFreq: 240,
    binauralBeatFreq: 20,
    color: "from-amber-600 to-rose-500",
  }
};

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private leftGain: GainNode | null = null;
  private rightGain: GainNode | null = null;

  private activePreset: SoundscapeType = 'alpha_focus';
  private currentVolume: number = 0.45; // default comfortable background level
  private isEnabled: boolean = false;
  private isPlaying: boolean = false;

  constructor() {
    // Only attempt initializing if window is defined
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('doctorian:soundscape_volume');
      if (savedVolume !== null) {
        this.currentVolume = parseFloat(savedVolume);
      }
      const savedPreset = localStorage.getItem('doctorian:soundscape_preset');
      if (savedPreset !== null && (savedPreset === 'alpha_focus' || savedPreset === 'theta_meditation' || savedPreset === 'beta_high_cognition')) {
        this.activePreset = savedPreset;
      }
      const savedStatus = localStorage.getItem('doctorian:soundscape_enabled');
      this.isEnabled = savedStatus === 'true';
    }
  }

  private initContext() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    
    this.ctx = new AudioCtxClass();
    
    // Master volume control with beautiful smooth ramp capabilities
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  /**
   * Generates local 2-sec loop loop of Brownian Noise to represent warm ocean/rain mask
   */
  private createBrownianNoiseBuffer(context: AudioContext): AudioBuffer {
    const sampleRate = context.sampleRate;
    const bufferSize = sampleRate * 2; // 2 seconds high quality loop
    const buffer = context.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brownian accumulator filter
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      // Normalize buffer output slightly
      data[i] *= 3.5;
    }
    return buffer;
  }

  /**
   * Starts playing the active preset with smooth fade-in
   */
  public start(forceResume: boolean = false) {
    if (typeof window === 'undefined') return;
    if (this.isPlaying && !forceResume) return;

    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      // Handle locked browser situations
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.isPlaying = true;
      const now = this.ctx.currentTime;

      // 1. Setup Brownian Noise
      const noiseBuffer = this.createBrownianNoiseBuffer(this.ctx);
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Filter noise heavily to create deep relaxing dark rumble
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(220, now); // Sweet spot for brownian rumble

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now); // Background masking level

      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      // 2. Setup Binaural Beat Oscillators with Stereo Separation
      const preset = SOUNDSCAPE_PRESETS[this.activePreset];

      this.leftOsc = this.ctx.createOscillator();
      this.leftOsc.type = 'sine';
      this.leftOsc.frequency.setValueAtTime(preset.leftFreq, now);

      this.rightOsc = this.ctx.createOscillator();
      this.rightOsc.type = 'sine';
      this.rightOsc.frequency.setValueAtTime(preset.rightFreq, now);

      this.leftGain = this.ctx.createGain();
      this.rightGain = this.ctx.createGain();

      // Soft harmonic settings (Binaural beats should be extremely gentle to prevent fatigue)
      this.leftGain.gain.setValueAtTime(0.12, now);
      this.rightGain.gain.setValueAtTime(0.12, now);

      // Send left to Left Ear, right to Right Ear
      const pannerLeft = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      const pannerRight = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      if (pannerLeft && pannerRight) {
        pannerLeft.pan.setValueAtTime(-1.0, now);
        pannerRight.pan.setValueAtTime(1.0, now);

        this.leftOsc.connect(this.leftGain).connect(pannerLeft).connect(this.masterGain);
        this.rightOsc.connect(this.rightGain).connect(pannerRight).connect(this.masterGain);
      } else {
        // Fallback channel merger if StereoPanner is not fully compliant
        const merger = this.ctx.createChannelMerger(2);
        this.leftOsc.connect(this.leftGain).connect(merger, 0, 0);
        this.rightOsc.connect(this.rightGain).connect(merger, 0, 1);
        merger.connect(this.masterGain);
      }

      // Start sound sources
      this.noiseNode.start(0);
      this.leftOsc.start(0);
      this.rightOsc.start(0);

      // Smooth warm ramp fade-in
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0, now);
      this.masterGain.gain.linearRampToValueAtTime(this.currentVolume, now + 2.5); // 2.5s crossfade
    } catch (e) {
      console.warn("[SOUNDSCAPE] Failed to initialize AudioContext pipeline:", e);
    }
  }

  /**
   * Stops playing the active preset with smooth fade-out to prevent clicks
   */
  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    this.isPlaying = false;
    const now = this.ctx.currentTime;
    
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 1.2); // 1.2s smooth fade-out

      // Cache refs to close properly after ramp completes
      const oscL = this.leftOsc;
      const oscR = this.rightOsc;
      const noise = this.noiseNode;

      setTimeout(() => {
        if (!this.isPlaying) {
          try {
            oscL?.stop();
            oscR?.stop();
            noise?.stop();
          } catch (e) {}
        }
      }, 1300);
    } catch (e) {
      console.warn("[SOUNDSCAPE] Fadeout aborted:", e);
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('doctorian:soundscape_enabled', String(enabled));
    
    // Broadcast setting change globally
    window.dispatchEvent(new CustomEvent('doctorian:soundscape_setting_update', { detail: { enabled } }));
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setPreset(preset: SoundscapeType) {
    this.activePreset = preset;
    localStorage.setItem('doctorian:soundscape_preset', preset);

    window.dispatchEvent(new CustomEvent('doctorian:soundscape_setting_update', { detail: { preset } }));

    if (this.isPlaying && this.ctx && this.leftOsc && this.rightOsc) {
      const now = this.ctx.currentTime;
      const wave = SOUNDSCAPE_PRESETS[preset];
      // Smooth frequency morphing
      this.leftOsc.frequency.exponentialRampToValueAtTime(wave.leftFreq, now + 1.5);
      this.rightOsc.frequency.exponentialRampToValueAtTime(wave.rightFreq, now + 1.5);
    }
  }

  public getPreset(): SoundscapeType {
    return this.activePreset;
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    localStorage.setItem('doctorian:soundscape_volume', String(volume));
    
    window.dispatchEvent(new CustomEvent('doctorian:soundscape_setting_update', { detail: { volume } }));

    if (this.isPlaying && this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(volume, now + 0.3);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public isEnginePlaying(): boolean {
    return this.isPlaying;
  }
}

export const Soundscape = new SoundscapeEngine();
