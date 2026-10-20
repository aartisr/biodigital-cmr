/**
 * TanStack Query Hook for Real-Time BD-CMR Telemetry & Control
 * Efficient synchronization, optimistic updates, and offline caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  ClinicalRole,
  EpigeneticDosingState,
  NanogridPacingState,
  NetworkLatencyProfile,
  PatientProfile,
  SystemOperatingMode,
} from '../types/bdcmr';
import {
  telemetryStreamService,
  TelemetryState,
  PATIENT_COHORTS,
} from '../services/telemetryStreamService';
import { offlineSyncEngine, SyncEngineStatus } from '../services/offlineSyncEngine';
import { createAuditRecord } from '../services/hipaaSecurityEngine';

export const QUERY_KEYS = {
  TELEMETRY: ['bdcmr', 'telemetry'],
  SYNC_STATUS: ['bdcmr', 'syncStatus'],
  PATIENT_LIST: ['bdcmr', 'patientList'],
};

export function useBdcmrTelemetry() {
  const queryClient = useQueryClient();
  const [telemetryState, setTelemetryState] = useState<TelemetryState>(() =>
    telemetryStreamService.getState()
  );
  const [syncStatus, setSyncStatus] = useState<SyncEngineStatus>(() =>
    offlineSyncEngine.getStatus()
  );

  // Subscribe to biophysical telemetry generator
  useEffect(() => {
    const unsubTelemetry = telemetryStreamService.subscribe((newState) => {
      setTelemetryState(newState);

      // Ingest latest packet into offline/online sync queue
      if (newState.latestPackets.length > 0) {
        const latestPkt = newState.latestPackets[newState.latestPackets.length - 1];
        offlineSyncEngine.queueOrSyncPacket(latestPkt);
      }
    });

    const unsubSync = offlineSyncEngine.subscribe((newStatus) => {
      setSyncStatus(newStatus);
    });

    return () => {
      unsubTelemetry();
      unsubSync();
    };
  }, []);

  // TanStack Query for Patient Cohorts
  const { data: patientList } = useQuery({
    queryKey: QUERY_KEYS.PATIENT_LIST,
    queryFn: async () => PATIENT_COHORTS,
    staleTime: Infinity,
  });

  // Mutation: Switch Patient
  const switchPatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      const target = PATIENT_COHORTS.find((p) => p.id === patientId);
      if (!target) throw new Error('Patient record not found');
      telemetryStreamService.setPatient(target);
      await createAuditRecord(
        'DOC-CAR-4192',
        'ATTENDING_CARDIOLOGIST',
        'PATIENT_SWITCH',
        `Switched active monitoring target to ${target.mrnTokenized} (${target.infarctLocation})`
      );
      return target;
    },
    onSuccess: (newPatient) => {
      queryClient.setQueryData(QUERY_KEYS.TELEMETRY, (old: any) => ({
        ...old,
        currentPatient: newPatient,
      }));
    },
  });

  // Mutation: Update Operating Mode
  const updateOperatingModeMutation = useMutation({
    mutationFn: async ({
      mode,
      role,
      reason,
    }: {
      mode: SystemOperatingMode;
      role: ClinicalRole;
      reason: string;
    }) => {
      telemetryStreamService.setOperatingMode(mode);
      await createAuditRecord(
        'DOC-CAR-4192',
        role,
        `MODE_CHANGE_${mode}`,
        `System mode altered to ${mode}. Clinical justification: ${reason}`
      );
      return mode;
    },
  });

  // Mutation: Adjust Epigenetic Dosing (LNP rate, formulation)
  const adjustDosingMutation = useMutation({
    mutationFn: async ({
      dosing,
      role,
      reason,
    }: {
      dosing: Partial<EpigeneticDosingState>;
      role: ClinicalRole;
      reason: string;
    }) => {
      telemetryStreamService.updateDosing({
        ...dosing,
        lastDoseAdjustmentTimestamp: new Date().toISOString(),
        adjustmentReason: reason,
      });
      await createAuditRecord(
        'DOC-CAR-4192',
        role,
        'MANUAL_DOSING_ADJUSTMENT',
        `LNP delivery modified: ${JSON.stringify(dosing)}. Justification: ${reason}`
      );
      return dosing;
    },
  });

  // Mutation: Adjust Nanogrid Pacing
  const adjustPacingMutation = useMutation({
    mutationFn: async ({
      pacing,
      role,
      reason,
    }: {
      pacing: Partial<NanogridPacingState>;
      role: ClinicalRole;
      reason: string;
    }) => {
      telemetryStreamService.updatePacing(pacing);
      await createAuditRecord(
        'DOC-EP-8841',
        role,
        'NANOGRID_PACING_ADJUSTMENT',
        `Bio-nanogrid parameters modified: ${JSON.stringify(pacing)}. Clinical rationale: ${reason}`
      );
      return pacing;
    },
  });

  // Mutation: Switch Network Latency Simulation (Offline test)
  const setNetworkProfileMutation = useMutation({
    mutationFn: async (profile: NetworkLatencyProfile) => {
      offlineSyncEngine.setNetworkProfile(profile);
      return profile;
    },
  });

  return {
    telemetryState,
    syncStatus,
    patientList: patientList || PATIENT_COHORTS,
    switchPatient: switchPatientMutation.mutate,
    updateOperatingMode: updateOperatingModeMutation.mutate,
    adjustDosing: adjustDosingMutation.mutate,
    adjustPacing: adjustPacingMutation.mutate,
    setNetworkProfile: setNetworkProfileMutation.mutate,
    loadExternalDatasetPatient: (override: Partial<PatientProfile>) => telemetryStreamService.loadExternalDatasetPatient(override),
    flushOfflineBuffer: () => offlineSyncEngine.flushBufferedPackets(),
    clearOfflineBuffer: () => offlineSyncEngine.clearBuffer(),
  };
}
