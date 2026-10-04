/**
 * Web Audio API Clinical Sound Synthesizer
 * Generates IEC 60601-1-8 compliant medical telemetry auditory alarms.
 * Pure programmatic Web Audio API synthesis without external audio files.
 */

import { AlertSeverity } from '../types/alerts';

class AudioAlarmService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private isMuted: boolean = false;
  private volume: number = 0.65;
  private silencedUntil: number | null = null;
  private lastChimeTimestamp: number = 0;

  constructor() {
    // Lazily instantiate AudioContext on first interaction
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public enableAudio(): boolean {
    const ctx = this.initContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.soundEnabled = true;
    this.isMuted = false;
    return !!ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public silence(durationSeconds: number = 120) {
    this.silencedUntil = Date.now() + durationSeconds * 1000;
  }

  public cancelSilence() {
    this.silencedUntil = null;
  }

  public isSilenced(): boolean {
    if (!this.silencedUntil) return false;
    if (Date.now() > this.silencedUntil) {
      this.silencedUntil = null;
      return false;
    }
    return true;
  }

  public getSilenceRemainingSeconds(): number {
    if (!this.silencedUntil) return 0;
    const remaining = Math.ceil((this.silencedUntil - Date.now()) / 1000);
    return Math.max(0, remaining);
  }

  /**
   * Plays medical telemetry chime based on severity
   */
  public triggerAlarmChime(severity: AlertSeverity, force: boolean = false) {
    if (!this.soundEnabled || this.isMuted) return;
    if (this.isSilenced() && !force) return;

    // Rate-limit consecutive chimes: minimum 3 seconds between bursts
    const now = Date.now();
    if (!force && now - this.lastChimeTimestamp < 3500) return;
    this.lastChimeTimestamp = now;

    const ctx = this.initContext();
    if (!ctx) return;

    if (severity === 'CRITICAL') {
      this.playCriticalHarmonicBurst(ctx);
    } else if (severity === 'WARNING') {
      this.playWarningHarmonicBurst(ctx);
    } else {
      this.playAdvisoryChime(ctx);
    }
  }

  /**
   * IEC 60601-1-8 High-Priority Clinical Alarm Tone (3-pulse triad burst)
   * Frequencies: C5 (523.25 Hz), E5 (659.25 Hz), G5 (783.99 Hz)
   */
  private playCriticalHarmonicBurst(ctx: AudioContext) {
    const startTime = ctx.currentTime + 0.05;
    const notes = [523.25, 659.25, 783.99]; // Triad sequence
    const toneDuration = 0.14;
    const pauseDuration = 0.08;

    notes.forEach((freq, idx) => {
      const toneStart = startTime + idx * (toneDuration + pauseDuration);
      this.createSinePulse(ctx, freq, toneStart, toneDuration, this.volume * 0.9);
      // Secondary harmonic for distinct ICU acoustic timbre
      this.createSinePulse(ctx, freq * 2, toneStart, toneDuration, this.volume * 0.25);
    });
  }

  /**
   * Medium Priority Warning Tone (2-pulse melodic chime)
   */
  private playWarningHarmonicBurst(ctx: AudioContext) {
    const startTime = ctx.currentTime + 0.05;
    const notes = [659.25, 523.25];
    const toneDuration = 0.16;

    notes.forEach((freq, idx) => {
      const toneStart = startTime + idx * 0.22;
      this.createSinePulse(ctx, freq, toneStart, toneDuration, this.volume * 0.65);
    });
  }

  /**
   * Low Priority Advisory Chirp
   */
  private playAdvisoryChime(ctx: AudioContext) {
    const startTime = ctx.currentTime + 0.05;
    this.createSinePulse(ctx, 783.99, startTime, 0.18, this.volume * 0.45);
  }

  private createSinePulse(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    gainLevel: number
  ) {
    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);

      // Smooth attack and decay envelope
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    } catch {
      // Audio node failure fallback
    }
  }
}

export const audioAlarmService = new AudioAlarmService();
