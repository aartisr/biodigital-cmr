/**
 * Hook for Managing Real-Time Clinical Safety Alerts & Threshold Evaluation
 * Evaluates high-frequency cellular biophysical telemetry against configurable safety limits.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ActiveAlert, AlertRule, AlertSeverity } from '../types/alerts';
import {
  CellularSensorMetrics,
  EpigeneticDosingState,
  NanogridPacingState,
  PatientVitals,
} from '../types/bdcmr';
import { audioAlarmService } from '../services/audioAlarmService';
import { hapticFeedbackService, HapticIntensity } from '../services/hapticFeedbackService';

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'RULE_WALL_STRESS',
    metricKey: 'wallStressKPa',
    displayName: 'Systolic Wall Stress',
    unit: 'kPa',
    defaultThreshold: 18.0,
    currentThreshold: 18.0,
    operator: 'GREATER_THAN',
    severity: 'CRITICAL',
    clinicalRationale: 'Wall stress > 18.0 kPa indicates high risk of border zone rupture or acute aneurysm formation.',
  },
  {
    id: 'RULE_CONDUCTION_VELOCITY',
    metricKey: 'conductionVelocityMs',
    displayName: 'Nanogrid Conduction Velocity',
    unit: 'm/s',
    defaultThreshold: 0.45,
    currentThreshold: 0.45,
    operator: 'LESS_THAN',
    severity: 'CRITICAL',
    clinicalRationale: 'Velocity < 0.45 m/s permits electrical re-entry circuit formation and fatal VT/VF arrhythmias.',
  },
  {
    id: 'RULE_REENTRY_SHIELD',
    metricKey: 'reentrySuppressionRate',
    displayName: 'Anti-Arrhythmia Shield Suppression',
    unit: '%',
    defaultThreshold: 98.0,
    currentThreshold: 98.0,
    operator: 'LESS_THAN',
    severity: 'CRITICAL',
    clinicalRationale: 'Suppression < 98% represents breakdown in nanogrid electro-coupling across ischemic border zone.',
  },
  {
    id: 'RULE_TISSUE_STIFFNESS',
    metricKey: 'youngsModulusKPa',
    displayName: 'Tissue Stiffness (Young\'s Modulus)',
    unit: 'kPa',
    defaultThreshold: 28.0,
    currentThreshold: 28.0,
    operator: 'GREATER_THAN',
    severity: 'WARNING',
    clinicalRationale: 'Stiffness > 28.0 kPa reflects dense fibrotic uncoupling requiring accelerated LNP epigenetic dosing.',
  },
  {
    id: 'RULE_APD90',
    metricKey: 'actionPotentialDuration90Ms',
    displayName: 'Action Potential APD90',
    unit: 'ms',
    defaultThreshold: 340,
    currentThreshold: 340,
    operator: 'GREATER_THAN',
    severity: 'WARNING',
    clinicalRationale: 'APD90 prolongation indicates repolarization dispersion and propensity for torsades de pointes.',
  },
  {
    id: 'RULE_INFUSION_RATE',
    metricKey: 'infusionRateNlMin',
    displayName: 'LNP Infusion Micro-Dosing Rate',
    unit: 'nl/min',
    defaultThreshold: 260,
    currentThreshold: 260,
    operator: 'GREATER_THAN',
    severity: 'WARNING',
    clinicalRationale: 'Delivery > 260 nl/min approaches metabolic clearance threshold for synthetic mRNA cocktails.',
  },
];

export function useClinicalAlerts(
  cellular: CellularSensorMetrics,
  pacing: NanogridPacingState,
  dosing: EpigeneticDosingState,
  vitals: PatientVitals
) {
  const [rules, setRules] = useState<AlertRule[]>(DEFAULT_ALERT_RULES);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [alertHistory, setAlertHistory] = useState<ActiveAlert[]>([]);
  const [isSilenced, setIsSilenced] = useState(false);
  const [silenceCountdown, setSilenceCountdown] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.65);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => hapticFeedbackService.getStatus().isEnabled);
  const [hapticIntensity, setHapticIntensity] = useState<HapticIntensity>(() => hapticFeedbackService.getStatus().intensity);

  // Simulated breach flag for clinical demonstration
  const [simulatedBreach, setSimulatedBreach] = useState<{
    metric: string;
    value: number;
    severity: AlertSeverity;
    message: string;
  } | null>(null);

  // Keep silence countdown in sync
  useEffect(() => {
    const timer = setInterval(() => {
      const silenced = audioAlarmService.isSilenced();
      setIsSilenced(silenced);
      setSilenceCountdown(audioAlarmService.getSilenceRemainingSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update sound settings
  const toggleMute = useCallback(() => {
    const newMuted = !audioAlarmService.isSoundMuted();
    audioAlarmService.setMuted(newMuted);
    setSoundEnabled(!newMuted);
  }, []);

  const changeVolume = useCallback((val: number) => {
    audioAlarmService.setVolume(val);
    setVolume(val);
  }, []);

  const silenceAlarm = useCallback((seconds: number = 120) => {
    audioAlarmService.silence(seconds);
    hapticFeedbackService.cancelVibration();
    setIsSilenced(true);
    setSilenceCountdown(seconds);
  }, []);

  const cancelSilence = useCallback(() => {
    audioAlarmService.cancelSilence();
    setIsSilenced(false);
    setSilenceCountdown(0);
  }, []);

  const toggleHaptics = useCallback(() => {
    const next = !hapticFeedbackService.getStatus().isEnabled;
    hapticFeedbackService.setEnabled(next);
    setHapticsEnabled(next);
    if (next) {
      hapticFeedbackService.triggerMicroFeedback();
    }
  }, []);

  const changeHapticIntensity = useCallback((intensity: HapticIntensity) => {
    hapticFeedbackService.setIntensity(intensity);
    setHapticIntensity(intensity);
    hapticFeedbackService.testHaptic('CRITICAL');
  }, []);

  const testHaptic = useCallback((severity: AlertSeverity = 'CRITICAL') => {
    hapticFeedbackService.testHaptic(severity);
  }, []);

  // Evaluate telemetry against active rules
  useEffect(() => {
    const currentValues: Record<string, number> = {
      wallStressKPa: simulatedBreach?.metric === 'wallStressKPa' ? simulatedBreach.value : cellular.wallStressKPa,
      conductionVelocityMs: simulatedBreach?.metric === 'conductionVelocityMs' ? simulatedBreach.value : pacing.conductionVelocityMs,
      reentrySuppressionRate: simulatedBreach?.metric === 'reentrySuppressionRate' ? simulatedBreach.value : pacing.reentrySuppressionRate,
      youngsModulusKPa: cellular.youngsModulusKPa,
      actionPotentialDuration90Ms: cellular.actionPotentialDuration90Ms,
      infusionRateNlMin: dosing.infusionRateNlMin,
      heartRateBpm: vitals.heartRateBpm,
    };

    const newActiveAlerts: ActiveAlert[] = [];

    rules.forEach((rule) => {
      const val = currentValues[rule.metricKey];
      if (val === undefined) return;

      const isViolated =
        rule.operator === 'GREATER_THAN'
          ? val > rule.currentThreshold
          : val < rule.currentThreshold;

      if (isViolated) {
        newActiveAlerts.push({
          id: `ALERT-${rule.id}-${Math.floor(Date.now() / 10000)}`,
          ruleId: rule.id,
          metricName: rule.displayName,
          currentValue: Number(val.toFixed(2)),
          thresholdValue: rule.currentThreshold,
          unit: rule.unit,
          severity: rule.severity,
          timestamp: Date.now(),
          message: `${rule.displayName} is ${val.toFixed(2)} ${rule.unit} (${rule.operator === 'GREATER_THAN' ? 'exceeds' : 'below'} safety limit of ${rule.currentThreshold} ${rule.unit})`,
          isAcknowledged: false,
        });
      }
    });

    // Only update activeAlerts state if alerts have actually changed
    setActiveAlerts((prev) => {
      if (
        prev.length === newActiveAlerts.length &&
        prev.every(
          (a, i) =>
            a.ruleId === newActiveAlerts[i].ruleId &&
            a.severity === newActiveAlerts[i].severity &&
            a.isAcknowledged === newActiveAlerts[i].isAcknowledged
        )
      ) {
        return prev;
      }
      return newActiveAlerts;
    });

    if (newActiveAlerts.length > 0) {
      const hasCritical = newActiveAlerts.some((a) => a.severity === 'CRITICAL');
      const highestSeverity: AlertSeverity = hasCritical ? 'CRITICAL' : 'WARNING';

      // Play auditory chime
      audioAlarmService.triggerAlarmChime(highestSeverity);

      // Trigger tactile haptic feedback on supported mobile/wearable devices
      hapticFeedbackService.triggerAlertHaptic(highestSeverity);

      // Record to history if new
      setAlertHistory((prev) => {
        const existingIds = new Set(prev.map((p) => p.ruleId + Math.floor(p.timestamp / 30000)));
        const toAdd = newActiveAlerts.filter(
          (a) => !existingIds.has(a.ruleId + Math.floor(a.timestamp / 30000))
        );
        if (toAdd.length === 0) return prev;
        return [...toAdd, ...prev].slice(0, 50);
      });
    }
  }, [
    cellular.wallStressKPa,
    cellular.youngsModulusKPa,
    cellular.actionPotentialDuration90Ms,
    pacing.conductionVelocityMs,
    pacing.reentrySuppressionRate,
    dosing.infusionRateNlMin,
    vitals.heartRateBpm,
    rules,
    simulatedBreach,
  ]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setActiveAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isAcknowledged: true } : a))
    );
  }, []);

  const updateThreshold = useCallback((ruleId: string, newThreshold: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, currentThreshold: newThreshold } : r))
    );
  }, []);

  const triggerSimulatedBreach = useCallback((metricType: 'WALL_STRESS' | 'ARRHYTHMIA_SHIELD' | 'CLEAR') => {
    if (metricType === 'CLEAR') {
      setSimulatedBreach(null);
      return;
    }

    if (metricType === 'WALL_STRESS') {
      setSimulatedBreach({
        metric: 'wallStressKPa',
        value: 23.4,
        severity: 'CRITICAL',
        message: 'Acute border zone wall stress surge detected (23.4 kPa > 18.0 kPa safety limit)',
      });
    } else if (metricType === 'ARRHYTHMIA_SHIELD') {
      setSimulatedBreach({
        metric: 'conductionVelocityMs',
        value: 0.32,
        severity: 'CRITICAL',
        message: 'Nanogrid conduction block detected (0.32 m/s < 0.45 m/s threshold)',
      });
    }

    // Force auditory chime test
    audioAlarmService.enableAudio();
    audioAlarmService.triggerAlarmChime('CRITICAL', true);

    // Force tactile haptic pulse test
    hapticFeedbackService.testHaptic('CRITICAL');
  }, []);

  return {
    rules,
    activeAlerts,
    alertHistory,
    isSilenced,
    silenceCountdown,
    soundEnabled,
    volume,
    toggleMute,
    changeVolume,
    silenceAlarm,
    cancelSilence,
    acknowledgeAlert,
    updateThreshold,
    triggerSimulatedBreach,
    hasCriticalAlert: activeAlerts.some((a) => a.severity === 'CRITICAL'),
    hasWarningAlert: activeAlerts.some((a) => a.severity === 'WARNING'),
    hapticsEnabled,
    hapticIntensity,
    toggleHaptics,
    changeHapticIntensity,
    testHaptic,
    isHapticSupported: hapticFeedbackService.isSupported(),
  };
}
