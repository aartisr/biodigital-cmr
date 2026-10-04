import { lazy, Suspense } from 'react';
import { FeatureLoading } from '../../components/ui/FeatureLoading';
import { ActiveAlert, AlertRule } from '../../types/alerts';
import { CellularSensorMetrics, ClinicalRole, ClinicalSnapshot, EpigeneticDosingState, NanogridPacingState, NetworkLatencyProfile, PatientProfile, PatientVitals, SystemOperatingMode } from '../../types/bdcmr';
import { SyncEngineStatus } from '../../services/offlineSyncEngine';
import { DashboardOverlayId, DashboardOverlayState } from './dashboardOverlayState';

const AlertsDrawer = lazy(() => import('../../components/AlertsDrawer').then(({ AlertsDrawer }) => ({ default: AlertsDrawer })));
const HospitalIntegrationModal = lazy(() => import('../../components/HospitalIntegrationModal').then(({ HospitalIntegrationModal }) => ({ default: HospitalIntegrationModal })));
const AuditLogModal = lazy(() => import('../../components/AuditLogModal').then(({ AuditLogModal }) => ({ default: AuditLogModal })));
const OfflineReplayModal = lazy(() => import('../../components/OfflineReplayModal').then(({ OfflineReplayModal }) => ({ default: OfflineReplayModal })));
const FullScreenHeartVisualizer = lazy(() => import('../../components/FullScreenHeartVisualizer').then(({ FullScreenHeartVisualizer }) => ({ default: FullScreenHeartVisualizer })));
const SignedPdfExportModal = lazy(() => import('../../components/SignedPdfExportModal').then(({ SignedPdfExportModal }) => ({ default: SignedPdfExportModal })));
const OpenSourceDatasetBenchmarkingModal = lazy(() => import('../../components/OpenSourceDatasetBenchmarkingModal').then(({ OpenSourceDatasetBenchmarkingModal }) => ({ default: OpenSourceDatasetBenchmarkingModal })));
const SideBySidePatientComparisonModal = lazy(() => import('../../components/SideBySidePatientComparisonModal').then(({ SideBySidePatientComparisonModal }) => ({ default: SideBySidePatientComparisonModal })));
const RegenerativePredictionModal = lazy(() => import('../../components/RegenerativePredictionModal').then(({ RegenerativePredictionModal }) => ({ default: RegenerativePredictionModal })));
const QuickSaveSnapshotModal = lazy(() => import('../../components/QuickSaveSnapshotModal').then(({ QuickSaveSnapshotModal }) => ({ default: QuickSaveSnapshotModal })));
const ClinicalImagingReadinessModal = lazy(() => import('../../components/ClinicalImagingReadinessModal').then(({ ClinicalImagingReadinessModal }) => ({ default: ClinicalImagingReadinessModal })));

export interface DashboardOverlaysProps {
  overlay: DashboardOverlayState;
  close: (overlay: DashboardOverlayId) => void;
  rules: AlertRule[];
  alertHistory: ActiveAlert[];
  volume: number;
  soundEnabled: boolean;
  onUpdateThreshold: (ruleId: string, threshold: number) => void;
  onChangeVolume: (volume: number) => void;
  onToggleMute: () => void;
  onTriggerSimulation: (type: 'WALL_STRESS' | 'ARRHYTHMIA_SHIELD' | 'CLEAR') => void;
  alertInteractionMode: 'REVIEW' | 'SANDBOX';
  patient: PatientProfile;
  cellular: CellularSensorMetrics;
  vitals: PatientVitals;
  dosing: EpigeneticDosingState;
  pacing: NanogridPacingState;
  currentRole: ClinicalRole;
  syncStatus: SyncEngineStatus;
  onChangeNetworkProfile: (profile: NetworkLatencyProfile) => void;
  onFlushBuffer: () => void;
  onClearBuffer: () => void;
  onLoadPatient: (override: Partial<PatientProfile>) => void;
  snapshots: ClinicalSnapshot[];
  onTakeSnapshot: (label?: string) => void;
  onDeleteSnapshot: (id: string) => void;
  onUpdateSnapshotLabel: (id: string, label: string) => void;
  onApplySnapshot: (snapshot: ClinicalSnapshot) => void;
  operatingMode: SystemOperatingMode;
}

/** Owns lazy feature overlays so the dashboard shell stays independent of optional tools. */
export const DashboardOverlays = ({ overlay, close, rules, alertHistory, volume, soundEnabled, onUpdateThreshold, onChangeVolume, onToggleMute, onTriggerSimulation, alertInteractionMode, patient, cellular, vitals, dosing, pacing, currentRole, syncStatus, onChangeNetworkProfile, onFlushBuffer, onClearBuffer, onLoadPatient, snapshots, onTakeSnapshot, onDeleteSnapshot, onUpdateSnapshotLabel, onApplySnapshot, operatingMode }: DashboardOverlaysProps) => (
  <Suspense fallback={<FeatureLoading />}>
    {overlay.alerts && <AlertsDrawer isOpen onClose={() => close('alerts')} rules={rules} onUpdateThreshold={onUpdateThreshold} alertHistory={alertHistory} volume={volume} onChangeVolume={onChangeVolume} soundEnabled={soundEnabled} onToggleMute={onToggleMute} onTriggerSimulation={onTriggerSimulation} interactionMode={alertInteractionMode} />}
    {overlay.fhir && <HospitalIntegrationModal isOpen onClose={() => close('fhir')} patient={patient} cellular={cellular} vitals={vitals} dosing={dosing} pacing={pacing} />}
    {overlay.imagingReadiness && <ClinicalImagingReadinessModal isOpen onClose={() => close('imagingReadiness')} patient={patient} />}
    {overlay.audit && <AuditLogModal isOpen onClose={() => close('audit')} />}
    {overlay.offline && <OfflineReplayModal isOpen onClose={() => close('offline')} syncStatus={syncStatus} onChangeProfile={onChangeNetworkProfile} onFlushBuffer={onFlushBuffer} onClearBuffer={onClearBuffer} />}
    {overlay.heart && <FullScreenHeartVisualizer isOpen onClose={() => close('heart')} patient={patient} vitals={vitals} cellular={cellular} pacing={pacing} />}
    {overlay.pdf && <SignedPdfExportModal isOpen onClose={() => close('pdf')} patient={patient} cellular={cellular} vitals={vitals} dosing={dosing} pacing={pacing} currentRole={currentRole} />}
    {overlay.datasets && <OpenSourceDatasetBenchmarkingModal isOpen onClose={() => close('datasets')} onLoadPatientIntoDashboard={onLoadPatient} />}
    {overlay.comparison && <SideBySidePatientComparisonModal isOpen onClose={() => close('comparison')} activePatient={patient} activeVitals={vitals} activeCellular={cellular} activePacing={pacing} activeDosing={dosing} />}
    {overlay.prediction && <RegenerativePredictionModal isOpen onClose={() => close('prediction')} patient={patient} cellular={cellular} vitals={vitals} dosing={dosing} pacing={pacing} />}
    {overlay.snapshots && <QuickSaveSnapshotModal isOpen onClose={() => close('snapshots')} snapshots={snapshots} onTakeSnapshot={onTakeSnapshot} onDeleteSnapshot={onDeleteSnapshot} onUpdateSnapshotLabel={onUpdateSnapshotLabel} onApplySnapshotParameters={onApplySnapshot} livePatient={patient} liveCellular={cellular} livePacing={pacing} liveDosing={dosing} liveVitals={vitals} liveOperatingMode={operatingMode} />}
  </Suspense>
);
