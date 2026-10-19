/**
 * Clinical Telemetry Alarm & Safety Threshold Types
 * Compliant with IEC 60601-1-8 (Medical Electrical Equipment Alarm Systems)
 */

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'ADVISORY';

export interface AlertRule {
  id: string;
  metricKey: string;
  displayName: string;
  unit: string;
  defaultThreshold: number;
  currentThreshold: number;
  operator: 'GREATER_THAN' | 'LESS_THAN';
  severity: AlertSeverity;
  clinicalRationale: string;
}

export interface ActiveAlert {
  id: string;
  ruleId: string;
  metricName: string;
  currentValue: number;
  thresholdValue: number;
  unit: string;
  severity: AlertSeverity;
  timestamp: number;
  message: string;
  isAcknowledged: boolean;
  silencedUntil?: number;
}

export interface AudioAlarmConfig {
  soundEnabled: boolean;
  volume: number;           // 0 to 1
  isMuted: boolean;
  silencedUntil: number | null; // Timestamp
  lastChimeTimestamp: number;
}
