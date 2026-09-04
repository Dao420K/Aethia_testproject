// Web Audio API Procedural Space & Planetary Ambient Sound Synthesizer
// Generates ambient cosmic drones, planetary resonance frequencies, and interactive UI telemetry sounds

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = true;
  private volume: number = 0.4;
  private currentPlanet: string = 'system_overview';

  // Synth Nodes
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private isRunning: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
    }

    if (!this.isMuted && !this.isRunning) {
      this.startAmbientDrones();
    }

    return !this.isMuted;
  }

  public toggle(): boolean {
    return this.toggleMute();
  }

  public isEnabled(): boolean {
    return !this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (!this.isMuted && this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  public setPlanet(planet: string) {
    this.currentPlanet = planet;
    if (!this.isRunning || !this.ctx || this.isMuted) return;

    // Shift resonant frequencies according to celestial harmonic profiles
    let freq1 = 110;
    let freq2 = 165;
    let filterFreq = 400;
    let noiseLevel = 0.02;

    switch (planet) {
      case 'gaia':
        // Gaia: 432 Hz organic earth resonance & harmonious fifth
        freq1 = 108; // 432 / 4
        freq2 = 216;
        filterFreq = 650;
        noiseLevel = 0.015;
        break;
      case 'aethelia':
        // Aethelia: 528 Hz ocean solfeggio harmonic & crystal water tone
        freq1 = 132;
        freq2 = 198;
        filterFreq = 800;
        noiseLevel = 0.03;
        break;
      case 'aethelgard':
        // Aethelgard: 55 Hz deep volcanic rumble & magma core sub-harmonic
        freq1 = 55;
        freq2 = 82.5;
        filterFreq = 220;
        noiseLevel = 0.05;
        break;
      case 'luna_nova':
        // Luna Nova: 147.85 Hz cosmic vacuum & lunar regolith stillness
        freq1 = 73.9;
        freq2 = 147.8;
        filterFreq = 320;
        noiseLevel = 0.01;
        break;
      case 'sun':
        // Sun: 126.22 Hz solar flare resonance & high plasma sizzle
        freq1 = 126.22;
        freq2 = 252.44;
        filterFreq = 1200;
        noiseLevel = 0.06;
        break;
      default:
        // System overview: Deep cosmic void 65 Hz
        freq1 = 65.4;
        freq2 = 98.1;
        filterFreq = 450;
        noiseLevel = 0.02;
        break;
    }

    const now = this.ctx.currentTime;
    if (this.droneOsc1) {
      this.droneOsc1.frequency.exponentialRampToValueAtTime(Math.max(20, freq1), now + 1.2);
    }
    if (this.droneOsc2) {
      this.droneOsc2.frequency.exponentialRampToValueAtTime(Math.max(30, freq2), now + 1.5);
    }
    if (this.filterNode) {
      this.filterNode.frequency.exponentialRampToValueAtTime(filterFreq, now + 1.0);
    }
    if (this.noiseGain) {
      this.noiseGain.gain.linearRampToValueAtTime(noiseLevel, now + 1.0);
    }
  }

  private startAmbientDrones() {
    if (!this.ctx || !this.masterGain) return;
    this.isRunning = true;

    // Filter
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(3.5, this.ctx.currentTime);
    this.filterNode.connect(this.masterGain);

    // Drone Gain
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.droneGain.connect(this.filterNode);

    // Osc 1 (Fundamental)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.setValueAtTime(108, this.ctx.currentTime);
    this.droneOsc1.connect(this.droneGain);
    this.droneOsc1.start();

    // Osc 2 (Fifth Harmonic + subtle detune)
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(162.3, this.ctx.currentTime);
    this.droneOsc2.connect(this.droneGain);
    this.droneOsc2.start();

    // LFO for slow atmospheric breathing
    this.lfoOsc = this.ctx.createOscillator();
    this.lfoOsc.frequency.setValueAtTime(0.08, this.ctx.currentTime); // ~12s cycle
    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(80, this.ctx.currentTime);
    this.lfoOsc.connect(this.lfoGain);
    this.lfoGain.connect(this.filterNode.frequency);
    this.lfoOsc.start();

    // Pink/Cosmic Noise generator
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      this.noiseNode.connect(this.noiseGain);
      this.noiseGain.connect(this.filterNode);
      this.noiseNode.start();
    } catch {
      // Audio buffer fallback
    }

    this.setPlanet(this.currentPlanet);
  }

  // Play telemetry click sound
  public playBeep(freq: number = 880, duration: number = 0.08) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore click audio errors
    }
  }

  // Play planetary warp / transition chime
  public playTransitChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 0.25);
      }, idx * 60);
    });
  }
}

export const cosmicAudio = new CosmicAudioEngine();
