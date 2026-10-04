/**
 * Clinical Haptic Feedback Service
 * Triggers calibrated tactile vibration patterns on supported mobile/wearable clinical devices
 * (tablets, smartphones, wearable companion bands) when critical safety limits are breached.
 * Conforms to clinical human-factors engineering (tactile alert without alarm fatigue).
 */

import { AlertSeverity } from '../types/alerts';

export type HapticIntensity = 'SUBTLE' | 'MEDIUM' | 'EMPHATIC';

export interface HapticStatus {
  isSupported: boolean;
  isEnabled: boolean;
  intensity: HapticIntensity;
  lastTriggerTimestamp: number;
}

class HapticFeedbackService {
  private isEnabled: boolean = true;
  private intensity: HapticIntensity = 'SUBTLE';
  private lastTriggerTimestamp: number = 0;
  private cooldownMs: number = 4500; // 4.5s throttle between repeating automatic alarms to prevent sensory fatigue
  private listeners: Set<(pattern: number[], severity?: AlertSeverity) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedEnabled = localStorage.getItem('bdcmr_haptics_enabled');
        if (storedEnabled !== null) {
          this.isEnabled = storedEnabled === 'true';
        }
        const storedIntensity = localStorage.getItem('bdcmr_haptics_intensity') as HapticIntensity;
        if (storedIntensity && ['SUBTLE', 'MEDIUM', 'EMPHATIC'].includes(storedIntensity)) {
          this.intensity = storedIntensity;
        }
      } catch {
        // Fallback gracefully if storage is restricted
      }
    }
  }

  /**
   * Checks whether the Web Vibration API is natively supported in this environment
   */
  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  public getStatus(): HapticStatus {
    return {
      isSupported: this.isSupported(),
      isEnabled: this.isEnabled,
      intensity: this.intensity,
      lastTriggerTimestamp: this.lastTriggerTimestamp,
    };
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('bdcmr_haptics_enabled', String(enabled));
    } catch {}
  }

  public setIntensity(intensity: HapticIntensity): void {
    this.intensity = intensity;
    try {
      localStorage.setItem('bdcmr_haptics_intensity', intensity);
    } catch {}
  }

  /**
   * Scale pattern durations based on selected intensity level
   */
  private scalePattern(pattern: number[]): number[] {
    const scale = this.intensity === 'SUBTLE' ? 0.65 : this.intensity === 'EMPHATIC' ? 1.35 : 1.0;
    return pattern.map((duration) => Math.max(15, Math.round(duration * scale)));
  }

  /**
   * Triggers haptic vibration for clinical alert threshold crossings
   * @param severity 'CRITICAL' | 'WARNING'
   * @param force Bypass cooldown timer (e.g. for manual testing or initial breach)
   */
  public triggerAlertHaptic(severity: AlertSeverity, force: boolean = false): boolean {
    if (!this.isEnabled) return false;

    const now = Date.now();
    if (!force && now - this.lastTriggerTimestamp < this.cooldownMs) {
      return false; // Throttled to avoid vibration fatigue
    }

    // Calibrated clinical tactile patterns (Vibration ms, Pause ms, Vibration ms...)
    // Critical: Urgent syncopated burst (alerting attending clinician without alarming patient)
    // Warning: Gentle double tap
    const basePattern =
      severity === 'CRITICAL'
        ? [140, 70, 200, 90, 260]
        : [80, 60, 90];

    const scaledPattern = this.scalePattern(basePattern);

    this.lastTriggerTimestamp = now;

    // Notify visual/audio listeners
    this.notifyListeners(scaledPattern, severity);

    if (this.isSupported()) {
      try {
        navigator.vibrate(scaledPattern);
        return true;
      } catch (err) {
        console.warn('Web Vibration API call failed:', err);
        return false;
      }
    }

    return false;
  }

  /**
   * Quick micro-haptic for user interface interactions (e.g. snapshot capture, slider step)
   */
  public triggerMicroFeedback(): boolean {
    if (!this.isEnabled) return false;
    const pattern = this.scalePattern([35]);
    this.notifyListeners(pattern);
    if (this.isSupported()) {
      try {
        navigator.vibrate(pattern);
        return true;
      } catch {}
    }
    return false;
  }

  /**
   * Test current tactile vibration pattern
   */
  public testHaptic(severity: AlertSeverity = 'CRITICAL'): boolean {
    return this.triggerAlertHaptic(severity, true);
  }

  /**
   * Cancel any currently active vibrations
   */
  public cancelVibration(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  }

  /**
   * Subscribe to haptic triggers (useful for simulated visual pulsing on desktop)
   */
  public subscribe(callback: (pattern: number[], severity?: AlertSeverity) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(pattern: number[], severity?: AlertSeverity) {
    this.listeners.forEach((cb) => {
      try {
        cb(pattern, severity);
      } catch {}
    });
  }
}

export const hapticFeedbackService = new HapticFeedbackService();
