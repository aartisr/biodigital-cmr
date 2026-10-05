import { lazy, Suspense } from 'react';
import { AlertBanner } from '../../components/AlertBanner';
import { ClinicalProtocolReference } from '../../components/ClinicalProtocolReference';
import { ImagingWorkspace } from '../../components/ImagingWorkspace';
import { MonitoringWorkspace } from '../../components/MonitoringWorkspace';
import { OverviewWorkspace } from '../../components/OverviewWorkspace';
import { ReviewWorkspace } from '../../components/ReviewWorkspace';
import { TherapyWorkspace } from '../../components/TherapyWorkspace';
import { PersonaExtensionContext, PersonaExtensionSlot } from '../../components/persona/PersonaExtensionSlot';
import { PersonaWorkspaceShell } from '../../components/persona/PersonaWorkspaceShell';
import { FeatureErrorBoundary } from '../../components/ui/FeatureErrorBoundary';
import { FeatureLoading } from '../../components/ui/FeatureLoading';
import { ActiveAlert } from '../../types/alerts';
import { CellularSensorMetrics, ClinicalRole, ClinicalSnapshot, EpigeneticDosingState, NanogridPacingState, PatientProfile, PatientVitals, SystemOperatingMode } from '../../types/bdcmr';
import { ClinicalImagingCase } from '../../types/clinicalImaging';
import { PersonaExperience } from '../../types/persona';
import { WorkspaceId, workspaceMetadata } from '../../types/workspace';
import { SyncEngineStatus } from '../../services/offlineSyncEngine';
import { DashboardOverlayId } from './dashboardOverlayState';
import { AssessmentWorkspaceHost } from '../assessment/AssessmentWorkspaceHost';

const VitalsMonitor = lazy(() => import('../../components/VitalsMonitor').then(({ VitalsMonitor }) => ({ default: VitalsMonitor })));
const CellularMetricsGrid = lazy(() => import('../../components/CellularMetricsGrid').then(({ CellularMetricsGrid }) => ({ default: CellularMetricsGrid })));
const MicroECGCanvas = lazy(() => import('../../components/MicroECGCanvas').then(({ MicroECGCanvas }) => ({ default: MicroECGCanvas })));
const DigitalTwinRemodeling = lazy(() => import('../../components/DigitalTwinRemodeling').then(({ DigitalTwinRemodeling }) => ({ default: DigitalTwinRemodeling })));
const ClosedLoopController = lazy(() => import('../../components/ClosedLoopController').then(({ ClosedLoopController }) => ({ default: ClosedLoopController })));
const PatientTrendAnalysis = lazy(() => import('../../components/PatientTrendAnalysis').then(({ PatientTrendAnalysis }) => ({ default: PatientTrendAnalysis })));

export interface DashboardWorkspaceProps {
  activeWorkspace: WorkspaceId; currentRole: ClinicalRole; experience: PersonaExperience;
  patient: PatientProfile; operatingMode: SystemOperatingMode; dosing: EpigeneticDosingState; pacing: NanogridPacingState; vitals: PatientVitals; cellular: CellularSensorMetrics; syncStatus: SyncEngineStatus; imagingCase: ClinicalImagingCase;
  alerts: ActiveAlert[]; snapshots: ClinicalSnapshot[];
  alertControls: { isSilenced: boolean; silenceCountdown: number; soundEnabled: boolean; volume: number; onToggleMute: () => void; onChangeVolume: (value: number) => void; onSilence: () => void; onCancelSilence: () => void; onAcknowledge: (id: string) => void; onTriggerSimulation: (type: 'WALL_STRESS' | 'ARRHYTHMIA_SHIELD' | 'CLEAR') => void; };
  onChangeWorkspace: (workspace: WorkspaceId) => void; onOpenOverlay: (overlay: DashboardOverlayId) => void;
  onUpdateOperatingMode: (request: { mode: SystemOperatingMode; role: ClinicalRole; reason: string }) => void;
  onAdjustDosing: (request: { dosing: Partial<EpigeneticDosingState>; role: ClinicalRole; reason: string }) => void;
  onAdjustPacing: (request: { pacing: Partial<NanogridPacingState>; role: ClinicalRole; reason: string }) => void;
}

/** Workspace compositor. It owns view assembly only; state, policy, and overlays stay outside. */
export const DashboardWorkspace = ({ activeWorkspace, currentRole, experience, patient, operatingMode, dosing, pacing, vitals, cellular, syncStatus, imagingCase, alerts, snapshots, alertControls, onChangeWorkspace, onOpenOverlay, onUpdateOperatingMode, onAdjustDosing, onAdjustPacing }: DashboardWorkspaceProps) => {
  const extensionContext: PersonaExtensionContext = {
    alerts, telemetryTimestamp: cellular.timestamp, snapshotCount: snapshots.length, cellular, pacing, patient, imagingCase, syncStatus,
    openMonitoring: () => onChangeWorkspace('MONITORING'), openTherapy: () => onChangeWorkspace('THERAPY'), openReview: () => onChangeWorkspace('REVIEW'),
    openAlerts: () => onOpenOverlay('alerts'), openAudit: () => onOpenOverlay('audit'), openSnapshots: () => onOpenOverlay('snapshots'), openReport: () => onOpenOverlay('pdf'), openDatasets: () => onOpenOverlay('datasets'), openComparison: () => onOpenOverlay('comparison'), openProjection: () => onOpenOverlay('prediction'), openReadiness: () => onOpenOverlay('imagingReadiness'), openIntegration: () => onOpenOverlay('fhir'), openSyncConsole: () => onOpenOverlay('offline'),
  };
  const alertMode = experience.capabilities.includes('RUN_SANDBOX_SIMULATION') ? 'SANDBOX' as const : experience.capabilities.includes('REVIEW_ALERTS') ? 'ACKNOWLEDGE' as const : 'REVIEW' as const;
  return <PersonaWorkspaceShell experience={experience}>
    <div className="flex flex-wrap items-end justify-between gap-2"><div><h1 className="text-lg font-semibold text-white">{workspaceMetadata[activeWorkspace].label}</h1><p className="text-xs text-slate-400">{workspaceMetadata[activeWorkspace].description}</p></div><span className="text-xs font-mono text-slate-500">Live data · {new Date(cellular.timestamp).toLocaleTimeString()}</span></div>
    {activeWorkspace === 'OVERVIEW' ? <Suspense fallback={<FeatureLoading />}><PersonaExtensionSlot experience={experience} workspace="OVERVIEW" context={extensionContext} /><OverviewWorkspace patient={patient} vitals={vitals} cellular={cellular} alerts={alerts} onOpenMonitoring={() => onChangeWorkspace('MONITORING')} onReviewAlerts={() => onOpenOverlay('alerts')} /></Suspense> : activeWorkspace === 'MONITORING' && <AlertBanner activeAlerts={alerts} isSilenced={alertControls.isSilenced} silenceCountdown={alertControls.silenceCountdown} soundEnabled={alertControls.soundEnabled} volume={alertControls.volume} onToggleMute={alertControls.onToggleMute} onChangeVolume={alertControls.onChangeVolume} onSilence={alertControls.onSilence} onCancelSilence={alertControls.onCancelSilence} onAcknowledge={alertControls.onAcknowledge} onOpenAlertsDrawer={() => onOpenOverlay('alerts')} onTriggerSimulation={alertControls.onTriggerSimulation} interactionMode={alertMode} />}
    {activeWorkspace === 'MONITORING' && <FeatureErrorBoundary featureName="Monitoring workspace"><Suspense fallback={<FeatureLoading />}><MonitoringWorkspace timestamp={cellular.timestamp} alerts={alerts} onReviewAlerts={() => onOpenOverlay('alerts')}><PersonaExtensionSlot experience={experience} workspace="MONITORING" context={extensionContext} /><VitalsMonitor vitals={vitals} patient={patient} /><CellularMetricsGrid cellular={cellular} patient={patient} /><div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12"><div className="xl:col-span-12"><MicroECGCanvas cellular={cellular} pacing={pacing} /></div></div></MonitoringWorkspace></Suspense></FeatureErrorBoundary>}
    {activeWorkspace === 'MI_SPECTRUM' && <FeatureErrorBoundary featureName="MI spectrum workspace"><AssessmentWorkspaceHost workspace={activeWorkspace} capabilities={experience.capabilities} /></FeatureErrorBoundary>}
    {activeWorkspace === 'IMAGING' && <FeatureErrorBoundary featureName="Imaging workspace"><Suspense fallback={<FeatureLoading />}><ImagingWorkspace onOpenReadiness={() => onOpenOverlay('imagingReadiness')} onOpenFullscreen={() => onOpenOverlay('heart')}><PersonaExtensionSlot experience={experience} workspace="IMAGING" context={extensionContext} /><DigitalTwinRemodeling patient={patient} cellular={cellular} dosing={dosing} pacing={pacing} vitals={vitals} onOpenHeartVisualizer={() => onOpenOverlay('heart')} /></ImagingWorkspace></Suspense></FeatureErrorBoundary>}
    {activeWorkspace === 'REVIEW' && <FeatureErrorBoundary featureName="Review workspace"><Suspense fallback={<FeatureLoading />}><ReviewWorkspace snapshotsCount={snapshots.length} onOpenSnapshots={() => onOpenOverlay('snapshots')} onOpenAudit={() => onOpenOverlay('audit')} onOpenReport={() => onOpenOverlay('pdf')} onOpenPrediction={() => onOpenOverlay('prediction')}><PersonaExtensionSlot experience={experience} workspace="REVIEW" context={extensionContext} /><PatientTrendAnalysis patient={patient} onOpenPrediction={() => onOpenOverlay('prediction')} /><ClinicalProtocolReference /></ReviewWorkspace></Suspense></FeatureErrorBoundary>}
    {activeWorkspace === 'THERAPY' && <FeatureErrorBoundary featureName="Therapy workspace"><Suspense fallback={<FeatureLoading />}><TherapyWorkspace operatingMode={operatingMode} dosing={dosing} onOpenMonitoring={() => onChangeWorkspace('MONITORING')}><ClosedLoopController operatingMode={operatingMode} onUpdateOperatingMode={onUpdateOperatingMode} dosing={dosing} onAdjustDosing={onAdjustDosing} pacing={pacing} onAdjustPacing={onAdjustPacing} currentRole={currentRole} interactionMode={experience.capabilities.includes('PROPOSE_PACING_CHANGE') ? 'sandbox' : 'read'} /><ClinicalProtocolReference /></TherapyWorkspace></Suspense></FeatureErrorBoundary>}
  </PersonaWorkspaceShell>;
};
