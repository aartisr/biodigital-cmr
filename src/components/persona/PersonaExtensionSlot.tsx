import { lazy, Suspense, type ReactElement } from 'react';
import { FeatureLoading } from '../ui/FeatureLoading';
import { ClinicalImagingCase } from '../../types/clinicalImaging';
import { ActiveAlert } from '../../types/alerts';
import { CellularSensorMetrics, NanogridPacingState, PatientProfile } from '../../types/bdcmr';
import { SyncEngineStatus } from '../../services/offlineSyncEngine';
import { PersonaExperience, PersonaExtensionId } from '../../types/persona';
import { WorkspaceId } from '../../types/workspace';

const AttendingDecisionPanel = lazy(() => import('./AttendingDecisionPanel').then(({ AttendingDecisionPanel }) => ({ default: AttendingDecisionPanel })));
const ElectrophysiologyFocusPanel = lazy(() => import('./ElectrophysiologyFocusPanel').then(({ ElectrophysiologyFocusPanel }) => ({ default: ElectrophysiologyFocusPanel })));
const SystemHealthPanel = lazy(() => import('./SystemHealthPanel').then(({ SystemHealthPanel }) => ({ default: SystemHealthPanel })));
const AuditEvidencePanel = lazy(() => import('./AuditEvidencePanel').then(({ AuditEvidencePanel }) => ({ default: AuditEvidencePanel })));
const BedsideMonitoringPanel = lazy(() => import('./BedsideMonitoringPanel').then(({ BedsideMonitoringPanel }) => ({ default: BedsideMonitoringPanel })));
const ImagingProvenancePanel = lazy(() => import('./ImagingProvenancePanel').then(({ ImagingProvenancePanel }) => ({ default: ImagingProvenancePanel })));
const ResearchAnalysisPanel = lazy(() => import('./ResearchAnalysisPanel').then(({ ResearchAnalysisPanel }) => ({ default: ResearchAnalysisPanel })));

export interface PersonaExtensionContext {
  alerts: ActiveAlert[];
  telemetryTimestamp: number;
  snapshotCount: number;
  cellular: CellularSensorMetrics;
  pacing: NanogridPacingState;
  patient: PatientProfile;
  imagingCase: ClinicalImagingCase;
  syncStatus: SyncEngineStatus;
  openMonitoring: () => void;
  openTherapy: () => void;
  openReview: () => void;
  openAlerts: () => void;
  openAudit: () => void;
  openSnapshots: () => void;
  openReport: () => void;
  openDatasets: () => void;
  openComparison: () => void;
  openProjection: () => void;
  openReadiness: () => void;
  openIntegration: () => void;
  openSyncConsole: () => void;
}

type ExtensionRenderer = (context: PersonaExtensionContext, experience: PersonaExperience) => ReactElement;

const extensions: Record<PersonaExtensionId, ExtensionRenderer> = {
  ATTENDING_DECISION: (context) => <AttendingDecisionPanel alerts={context.alerts} telemetryTimestamp={context.telemetryTimestamp} snapshotCount={context.snapshotCount} onOpenMonitoring={context.openMonitoring} onOpenReview={context.openReview} />,
  ELECTROPHYSIOLOGY_FOCUS: (context) => <ElectrophysiologyFocusPanel cellular={context.cellular} pacing={context.pacing} onOpenTherapy={context.openTherapy} />,
  SYSTEM_HEALTH: (context, experience) => <SystemHealthPanel syncStatus={context.syncStatus} onOpenSyncConsole={context.openSyncConsole} onOpenIntegration={context.openIntegration} onOpenAudit={context.openAudit} mode={experience.role === 'INTEGRATION_ADMIN' ? 'INTEGRATION' : 'ENGINEERING'} />,
  AUDIT_EVIDENCE: (context) => <AuditEvidencePanel snapshotCount={context.snapshotCount} onOpenAudit={context.openAudit} onOpenSnapshots={context.openSnapshots} onOpenReport={context.openReport} />,
  BEDSIDE_MONITORING: (context) => <BedsideMonitoringPanel patient={context.patient} alerts={context.alerts} telemetryTimestamp={context.telemetryTimestamp} onOpenAlerts={context.openAlerts} onOpenReview={context.openReview} />,
  IMAGING_PROVENANCE: (context) => <ImagingProvenancePanel imagingCase={context.imagingCase} onOpenReadiness={context.openReadiness} onOpenReview={context.openReview} />,
  RESEARCH_ANALYSIS: (context) => <ResearchAnalysisPanel snapshotCount={context.snapshotCount} onOpenDatasets={context.openDatasets} onOpenComparison={context.openComparison} onOpenProjection={context.openProjection} onOpenSnapshots={context.openSnapshots} />,
};

/** Renders extensions declared by persona policy; App never branches on a persona role. */
export const PersonaExtensionSlot = ({ experience, workspace, context }: { experience: PersonaExperience; workspace: WorkspaceId; context: PersonaExtensionContext }) => {
  const placements = experience.extensions?.filter((extension) => extension.workspace === workspace) ?? [];
  if (!placements.length) return null;
  return <Suspense fallback={<FeatureLoading />}>{placements.map((placement) => <div key={placement.id}>{extensions[placement.id](context, experience)}</div>)}</Suspense>;
};
