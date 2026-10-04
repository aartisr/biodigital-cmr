/**
 * Bio-Digital Closed-Loop Myocardial Regeneration (BD-CMR)
 * Main Application Root with TanStack Query Real-Time Synchronization,
 * High-Frequency Telemetry Oscilloscopes, and HIPAA-Compliant Architecture.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBdcmrTelemetry } from './hooks/useBdcmrTelemetry';
import { useClinicalAlerts } from './hooks/useClinicalAlerts';
import { Header } from './components/Header';
import { Camera } from 'lucide-react';
import { WorkspaceNavigation } from './components/WorkspaceNavigation';
import { PersonaAccessState } from './components/persona/PersonaAccessState';
import { getPersonaExperience } from './config/personaExperiences';
import { usePersonaSession } from './hooks/usePersonaSession';
import { createResearchImagingCase } from './services/clinicalImagingCaseService';
import { isWorkspaceId, WorkspaceId } from './types/workspace';
import { ClinicalRole, ClinicalSnapshot, NetworkLatencyProfile, PatientProfile } from './types/bdcmr';
import { DashboardOverlays } from './features/dashboard/DashboardOverlays';
import { DashboardWorkspace } from './features/dashboard/DashboardWorkspace';
import { useDashboardOverlays } from './features/dashboard/dashboardOverlayState';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  },
});


const WORKSPACE_PREFERENCE_KEY = 'bdcmr_workspace_preference';

const getInitialWorkspace = (): WorkspaceId => {
  try {
    const storedWorkspace = localStorage.getItem(WORKSPACE_PREFERENCE_KEY);
    return isWorkspaceId(storedWorkspace) ? storedWorkspace : 'OVERVIEW';
  } catch {
    return 'OVERVIEW';
  }
};

function BdcmrDashboard() {
  const {
    telemetryState,
    syncStatus,
    patientList,
    switchPatient,
    updateOperatingMode,
    adjustDosing,
    adjustPacing,
    setNetworkProfile,
    loadExternalDatasetPatient,
    flushOfflineBuffer,
    clearOfflineBuffer,
  } = useBdcmrTelemetry();

  const [currentRole, setCurrentRole] = useState<ClinicalRole>('ATTENDING_CARDIOLOGIST');
  const [isDeIdentified, setIsDeIdentified] = useState<boolean>(true);
  const overlays = useDashboardOverlays();
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>(getInitialWorkspace);
  const [snapshots, setSnapshots] = useState<ClinicalSnapshot[]>([]);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);

  const { currentPatient, operatingMode, dosing, pacing, vitals, cellular } = telemetryState;
  const isEmergencyRest = operatingMode === 'EMERGENCY_REST_MODE';
  const configuredPersonaExperience = getPersonaExperience(currentRole);
  const {
    state: personaSessionState,
    session: personaSession,
    failure: personaSessionFailure,
    retry: retryPersonaSession,
  } = usePersonaSession(currentRole);
  const personaExperience = personaSession
    ? {
        ...configuredPersonaExperience,
        capabilities: personaSession.capabilities,
        availableWorkspaces: personaSession.availableWorkspaces,
        defaultWorkspace: personaSession.defaultWorkspace,
      }
    : configuredPersonaExperience;
  const personaSessionIsActive = personaSessionState === 'ACTIVE' && Boolean(personaSession);
  const imagingCase = useMemo(() => createResearchImagingCase(currentPatient.id), [currentPatient.id]);
  const alertInteractionMode = personaExperience.capabilities.includes('RUN_SANDBOX_SIMULATION')
    ? 'SANDBOX' as const
    : personaExperience.capabilities.includes('REVIEW_ALERTS')
      ? 'ACKNOWLEDGE' as const
      : 'REVIEW' as const;

  useEffect(() => {
    if (!personaExperience.availableWorkspaces.includes(activeWorkspace)) {
      setActiveWorkspace(personaExperience.defaultWorkspace);
    }
  }, [activeWorkspace, personaExperience]);

  useEffect(() => {
    if (personaSessionIsActive) return;
    overlays.closeAll();
  }, [personaSessionIsActive, overlays.closeAll]);

  useEffect(() => {
    try {
      localStorage.setItem(WORKSPACE_PREFERENCE_KEY, activeWorkspace);
    } catch {
      // Storage may be unavailable in privacy-restricted browser contexts.
    }
  }, [activeWorkspace]);

  // Function to capture quick snapshot
  const handleTakeSnapshot = (customLabel?: string) => {
    const now = new Date();
    const displayTime = now.toLocaleTimeString([], { hour12: false });
    const newSnapshot: ClinicalSnapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: now.toISOString(),
      displayTime,
      label: customLabel || `Snapshot #${snapshots.length + 1}`,
      patientId: currentPatient.id,
      patientMrn: currentPatient.mrnTokenized,
      cellular: { ...cellular },
      pacing: { ...pacing },
      dosing: { ...dosing },
      vitals: { ...vitals },
      operatingMode,
    };
    setSnapshots((prev) => [...prev, newSnapshot]);
    setSnapshotToast(`Quick-Save: "${newSnapshot.label}" captured at ${displayTime}`);
    setTimeout(() => setSnapshotToast(null), 3500);
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSnapshotLabel = (id: string, label: string) => {
    setSnapshots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label } : s))
    );
  };

  const handleApplySnapshotParameters = (s: ClinicalSnapshot) => {
    adjustDosing({
      dosing: { infusionRateNlMin: s.dosing.infusionRateNlMin },
      role: currentRole,
      reason: `Restored parameters from snapshot: ${s.label}`,
    });
    adjustPacing({
      pacing: {
        subthresholdCurrentMA: s.pacing.subthresholdCurrentMA,
        pulseFrequencyBpm: s.pacing.pulseFrequencyBpm,
      },
      role: currentRole,
      reason: `Restored parameters from snapshot: ${s.label}`,
    });
  };

  // Seed with an initial baseline snapshot once currentPatient is available
  React.useEffect(() => {
    if (snapshots.length === 0 && currentPatient) {
      const now = new Date();
      const displayTime = now.toLocaleTimeString([], { hour12: false });
      setSnapshots([
        {
          id: `snap_init_${Date.now()}`,
          timestamp: now.toISOString(),
          displayTime,
          label: 'Session Baseline',
          patientId: currentPatient.id,
          patientMrn: currentPatient.mrnTokenized,
          cellular: { ...cellular },
          pacing: { ...pacing },
          dosing: { ...dosing },
          vitals: { ...vitals },
          operatingMode,
        },
      ]);
    }
  }, [currentPatient?.id]);

  // Real-time clinical alerts engine
  const {
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
    hasCriticalAlert,
  } = useClinicalAlerts(cellular, pacing, dosing, vitals);

  const handleEmergencyStop = () => {
    if (isEmergencyRest) {
      updateOperatingMode({
        mode: 'AUTOMATED_CLOSED_LOOP',
        role: currentRole,
        reason: 'Restored automated closed-loop delivery from emergency rest',
      });
    } else {
      updateOperatingMode({
        mode: 'EMERGENCY_REST_MODE',
        role: currentRole,
        reason: 'Clinician activated emergency myocardial rest mode',
      });
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <a href="#workspace-panel" className="sr-only z-[80] rounded-md bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to active workspace</a>
      {/* Clinical Header */}
      <Header
        currentPatient={currentPatient}
        patientList={patientList}
        onSelectPatient={switchPatient}
        syncStatus={syncStatus}
        currentRole={currentRole}
        capabilities={personaSessionIsActive ? personaExperience.capabilities : []}
        onChangeRole={setCurrentRole}
        networkProfile={syncStatus.networkProfile}
        onChangeNetworkProfile={(p: NetworkLatencyProfile) => setNetworkProfile(p)}
        isDeIdentified={isDeIdentified}
        onToggleDeIdentification={() => setIsDeIdentified(!isDeIdentified)}
        onOpenFhirModal={() => overlays.open('fhir')}
        onOpenAuditModal={() => overlays.open('audit')}
        onOpenOfflineModal={() => overlays.open('offline')}
        onEmergencyStop={handleEmergencyStop}
        isEmergencyRest={isEmergencyRest}
        activeAlertsCount={activeAlerts.length}
        hasCriticalAlert={hasCriticalAlert}
        onOpenAlertsDrawer={() => overlays.open('alerts')}
        onOpenHeartVisualizer={() => overlays.open('heart')}
        onOpenPdfModal={() => overlays.open('pdf')}
        onOpenDatasetsModal={() => overlays.open('datasets')}
        onOpenComparisonModal={() => overlays.open('comparison')}
        onOpenPredictionModal={() => overlays.open('prediction')}
        onQuickSaveSnapshot={() => handleTakeSnapshot()}
        snapshotsCount={snapshots.length}
        onOpenSnapshotsModal={() => overlays.open('snapshots')}
        onOpenImagingReadiness={() => overlays.open('imagingReadiness')}
      />

      {personaSessionIsActive && <WorkspaceNavigation activeWorkspace={activeWorkspace} onChange={setActiveWorkspace} workspaces={personaExperience.availableWorkspaces} />}

      {/* Floating Snapshot Captured Toast Notification */}
      {snapshotToast && (
        <div className="fixed right-4 top-16 z-50 flex items-center gap-2 rounded-lg border border-sky-500/50 bg-sky-950/90 px-4 py-2 text-xs font-semibold text-sky-200 shadow-2xl backdrop-blur-md sm:right-6" role="status" aria-live="polite">
          <Camera className="h-4 w-4 text-sky-400" />
          <span>{snapshotToast}</span>
        </div>
      )}

      {/* Main Operational Cockpit */}
      <main id="workspace-panel" role="tabpanel" aria-labelledby={`workspace-tab-${activeWorkspace}`} tabIndex={-1} className="mx-auto flex-1 w-full max-w-[1600px] scroll-mt-4 space-y-4 px-4 py-4 sm:px-6">
        {personaSessionIsActive ? <DashboardWorkspace activeWorkspace={activeWorkspace} currentRole={currentRole} experience={personaExperience} patient={currentPatient} operatingMode={operatingMode} dosing={dosing} pacing={pacing} vitals={vitals} cellular={cellular} syncStatus={syncStatus} imagingCase={imagingCase} alerts={activeAlerts} snapshots={snapshots} alertControls={{ isSilenced, silenceCountdown, soundEnabled, volume, onToggleMute: toggleMute, onChangeVolume: changeVolume, onSilence: silenceAlarm, onCancelSilence: cancelSilence, onAcknowledge: acknowledgeAlert, onTriggerSimulation: triggerSimulatedBreach }} onChangeWorkspace={setActiveWorkspace} onOpenOverlay={overlays.open} onUpdateOperatingMode={updateOperatingMode} onAdjustDosing={adjustDosing} onAdjustPacing={adjustPacing} /> : <PersonaAccessState state={personaSessionState} failure={personaSessionFailure} onRetry={retryPersonaSession} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2">
            <span>Bio-Digital Closed-Loop Myocardial Regeneration (BD-CMR)</span>
            <span aria-hidden="true">·</span>
            <span>Version 4.2.0-Clinical</span>
            <span aria-hidden="true">·</span>
            <span className="text-teal-400 font-mono">TanStack Real-Time Engine Active</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>IEC 60601-1-8 Alarms Active</span>
            <span aria-hidden="true">·</span>
            <span>FHIR R4 / HL7 Certified</span>
            <span aria-hidden="true">·</span>
            <span>HIPAA Security Rule (45 CFR § 164.312)</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Zero Telemetry Drop Guarantee</span>
          </div>
        </div>
      </footer>

      <DashboardOverlays
        overlay={overlays.overlay}
        close={overlays.close}
        rules={rules}
        alertHistory={alertHistory}
        volume={volume}
        soundEnabled={soundEnabled}
        onUpdateThreshold={updateThreshold}
        onChangeVolume={changeVolume}
        onToggleMute={toggleMute}
        onTriggerSimulation={triggerSimulatedBreach}
        alertInteractionMode={alertInteractionMode === 'SANDBOX' ? 'SANDBOX' : 'REVIEW'}
        patient={currentPatient}
        cellular={cellular}
        vitals={vitals}
        dosing={dosing}
        pacing={pacing}
        currentRole={currentRole}
        syncStatus={syncStatus}
        onChangeNetworkProfile={setNetworkProfile}
        onFlushBuffer={flushOfflineBuffer}
        onClearBuffer={clearOfflineBuffer}
        onLoadPatient={loadExternalDatasetPatient}
        snapshots={snapshots}
        onTakeSnapshot={handleTakeSnapshot}
        onDeleteSnapshot={handleDeleteSnapshot}
        onUpdateSnapshotLabel={handleUpdateSnapshotLabel}
        onApplySnapshot={handleApplySnapshotParameters}
        operatingMode={operatingMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BdcmrDashboard />
    </QueryClientProvider>
  );
}
