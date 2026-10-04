import { MiClinicalGroup, MiLegacyType, MiPresentation } from '../../types/mi/classification';

export const miTaxonomyVersion = 'UDMI-2026-simulation-v1';

export const miGroupMetadata: Record<MiClinicalGroup, { label: string; description: string; tone: string }> = {
  PRIMARY: { label: 'Primary MI', description: 'Simulated acute coronary pathology pattern.', tone: 'text-rose-200 border-rose-400/35 bg-rose-500/10' },
  SECONDARY: { label: 'Secondary MI', description: 'Simulated oxygen supply–demand imbalance pattern.', tone: 'text-amber-200 border-amber-400/35 bg-amber-500/10' },
  PROCEDURE_RELATED: { label: 'Procedure-related MI', description: 'Simulated PCI or CABG temporal context.', tone: 'text-violet-200 border-violet-400/35 bg-violet-500/10' },
  UNRESOLVED: { label: 'Unresolved pattern', description: 'Evidence is incomplete or conflicting in this simulation.', tone: 'text-sky-200 border-sky-400/35 bg-sky-500/10' },
  NON_ISCHAEMIC_INJURY: { label: 'Myocardial injury, not MI', description: 'Simulated injury without evidence of acute ischaemia.', tone: 'text-slate-200 border-slate-400/35 bg-slate-500/10' },
};

export const legacyTypeLabels: Record<MiLegacyType, string> = {
  TYPE_1: 'Legacy Type 1', TYPE_2: 'Legacy Type 2', TYPE_3: 'Legacy Type 3',
  TYPE_4A: 'Legacy Type 4a', TYPE_4B: 'Legacy Type 4b', TYPE_4C: 'Legacy Type 4c', TYPE_5: 'Legacy Type 5',
};

export const presentationLabels: Record<MiPresentation, string> = {
  STEMI: 'ST-elevation presentation', NSTEMI: 'Non-ST-elevation presentation',
  SILENT_OR_UNRECOGNIZED: 'Silent / unrecognized presentation', UNKNOWN: 'Presentation not established',
};
