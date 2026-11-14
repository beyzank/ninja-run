import { GameStorage } from '../storage/GameStorage';

class SoundManagerService {
  private audioCtx: any = null;
  private isDrawingTonePlaying = false;
  private drawOsc: any = null;
  private drawGain: any = null;

  private getAudioContext(): any {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Satisfying juicy "Bloop!" water/ink drop sound
  playInkCollect(): void {
    if (!GameStorage.isSoundEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      osc.type = 'sine';

      // Pitch sweep up quickly like a bubble/bloop (400Hz -> 850Hz)
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.12);

      // Amplitude envelope
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Audio fallback
    }
  }

  // Sparkling crystal ping for coins
  playCoinCollect(): void {
    if (!GameStorage.isSoundEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(1800, now + 0.06);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.29);
    } catch {
      // Ignore
    }
  }

  // Hyperspace sonic boom / whoosh for booster rings
  playBooster(): void {
    if (!GameStorage.isSoundEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.35);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.46);
    } catch {
      // Ignore
    }
  }

  // Cyberpunk death / laser crash explosion
  playCrash(): void {
    if (!GameStorage.isSoundEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Low frequency rumble
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.46);
    } catch {
      // Ignore
    }
  }

  // Soft chalk / neon hum while actively drawing
  startDrawingSound(): void {
    if (!GameStorage.isSoundEnabled() || this.isDrawingTonePlaying) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      this.drawOsc = ctx.createOscillator();
      this.drawGain = ctx.createGain();

      this.drawOsc.type = 'triangle';
      this.drawOsc.frequency.setValueAtTime(520, ctx.currentTime);

      this.drawGain.gain.setValueAtTime(0.01, ctx.currentTime);
      this.drawGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.04);

      this.drawOsc.connect(this.drawGain);
      this.drawGain.connect(ctx.destination);

      this.drawOsc.start();
      this.isDrawingTonePlaying = true;
    } catch {
      // Ignore
    }
  }

  stopDrawingSound(): void {
    if (!this.isDrawingTonePlaying) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.drawGain || !this.drawOsc) {
      this.isDrawingTonePlaying = false;
      return;
    }

    try {
      this.drawGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      setTimeout(() => {
        try {
          this.drawOsc?.stop();
          this.drawOsc?.disconnect();
          this.drawGain?.disconnect();
        } catch {
          // Ignore
        }
        this.isDrawingTonePlaying = false;
        this.drawOsc = null;
        this.drawGain = null;
      }, 55);
    } catch {
      this.isDrawingTonePlaying = false;
    }
  }

  // Warning buzz when drawing inside anti-draw zone or ink exhausted
  playDeny(): void {
    if (!GameStorage.isSoundEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'square';
      osc.frequency.setValueAtTime(140, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Ignore
    }
  }
}

export const SoundManager = new SoundManagerService();
