/**
 * Procedural Web Audio API Sound Synthesizer for Asphalt F1
 * 100% zero external audio file dependencies.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private driftNoiseNode: AudioNode | null = null;
  private driftGain: GainNode | null = null;
  private nitroNoiseNode: AudioNode | null = null;
  private nitroGain: GainNode | null = null;
  private isEngineRunning: boolean = false;
  private bgmGain: GainNode | null = null;
  private bgmInterval: number | null = null;
  private bgmEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx) {
      if (muted) {
        this.ctx.suspend();
      } else {
        this.ctx.resume();
      }
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public toggleBGM(): boolean {
    this.bgmEnabled = !this.bgmEnabled;
    if (!this.bgmEnabled && this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
    return this.bgmEnabled;
  }

  public startEngine() {
    this.initCtx();
    if (!this.ctx || this.isEngineRunning || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // Dual oscillator for rich throaty racing engine harmonics
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'triangle';

      this.engineOsc1.frequency.setValueAtTime(45, now);
      this.engineOsc2.frequency.setValueAtTime(90, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      this.engineOsc1.connect(filter);
      this.engineOsc2.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineGain.gain.setValueAtTime(0.12, now);

      this.engineOsc1.start();
      this.engineOsc2.start();

      // Continuous drift tire screech setup
      this.setupDriftSynth();
      // Continuous nitro hiss setup
      this.setupNitroSynth();

      this.isEngineRunning = true;
      this.startBGMArp();
    } catch {
      // Audio initialization fallback
    }
  }

  public updateEngine(speedKmh: number, maxSpeed: number, isDrifting: boolean, nitroActive: boolean) {
    if (!this.ctx || !this.isEngineRunning || this.isMuted) return;

    const now = this.ctx.currentTime;
    const ratio = Math.max(0, Math.min(speedKmh / maxSpeed, 1.25));

    // Dynamic pitch: idle 45Hz up to 340Hz at top speed
    const baseFreq = 50 + ratio * 280;
    if (this.engineOsc1 && this.engineOsc2) {
      this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
      this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.05);
    }

    // Drift screech volume
    if (this.driftGain) {
      const targetGain = isDrifting && speedKmh > 20 ? 0.22 : 0;
      this.driftGain.gain.setTargetAtTime(targetGain, now, 0.08);
    }

    // Nitro sound volume
    if (this.nitroGain) {
      const targetGain = nitroActive ? 0.28 : 0;
      this.nitroGain.gain.setTargetAtTime(targetGain, now, 0.06);
    }
  }

  private setupDriftSynth() {
    if (!this.ctx) return;
    // White noise generator for tire smoke/screech
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1200, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(3.5, this.ctx.currentTime);

    this.driftGain = this.ctx.createGain();
    this.driftGain.gain.setValueAtTime(0, this.ctx.currentTime);

    whiteNoise.connect(bandpass);
    bandpass.connect(this.driftGain);
    this.driftGain.connect(this.ctx.destination);

    whiteNoise.start();
    this.driftNoiseNode = whiteNoise;
  }

  private setupNitroSynth() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.8;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(1800, this.ctx.currentTime);

    this.nitroGain = this.ctx.createGain();
    this.nitroGain.gain.setValueAtTime(0, this.ctx.currentTime);

    noise.connect(highpass);
    highpass.connect(this.nitroGain);
    this.nitroGain.connect(this.ctx.destination);

    noise.start();
    this.nitroNoiseNode = noise;
  }

  public playNitroBlast(tier: 'single' | 'perfect' | 'shockwave') {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (tier === 'shockwave') {
      // Powerful explosive shockwave sweep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    } else if (tier === 'perfect') {
      // High-energy sci-fi chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playCrash() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playCountdown(isGo: boolean) {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isGo ? 880 : 440, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isGo ? 0.6 : 0.25));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + (isGo ? 0.65 : 0.3));
  }

  public playCheckpoint() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.setValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playRampJump() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playVictory() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  // Upbeat Synthwave racing background arpeggio
  private startBGMArp() {
    if (!this.ctx || this.bgmInterval) return;

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.bgmEnabled ? 0.05 : 0, this.ctx.currentTime);
    this.bgmGain.connect(this.ctx.destination);

    const bassScale = [130.81, 146.83, 164.81, 196.00, 220.00]; // C3, D3, E3, G3, A3
    let step = 0;

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx || !this.bgmEnabled || this.isMuted || !this.isEngineRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        const freq = bassScale[step % bassScale.length] * (step % 2 === 0 ? 1 : 2);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, now);

        noteGain.gain.setValueAtTime(0.04, now);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

        osc.connect(filter);
        filter.connect(noteGain);
        if (this.bgmGain) {
          noteGain.connect(this.bgmGain);
        }

        osc.start(now);
        osc.stop(now + 0.12);
        step++;
      } catch {
        // Safe synth tick
      }
    }, 130);
  }

  public stopEngine() {
    if (this.engineOsc1) {
      try {
        this.engineOsc1.stop();
        this.engineOsc1.disconnect();
      } catch {}
      this.engineOsc1 = null;
    }
    if (this.engineOsc2) {
      try {
        this.engineOsc2.stop();
        this.engineOsc2.disconnect();
      } catch {}
      this.engineOsc2 = null;
    }
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isEngineRunning = false;
  }
}

export const soundManager = new SoundManager();
