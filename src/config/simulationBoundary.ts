export type SimulationBoundaryKind =
  | 'ASSESSMENT'
  | 'REGENERATION'
  | 'SCHEMATIC_ANATOMY'
  | 'PLATFORM'
  | 'TELEMETRY'
  | 'MATHEMATICAL_MODEL';

export interface SimulationBoundaryContent {
  label: string;
  title: string;
  description: string;
}

export const simulationBoundaryContent: Record<SimulationBoundaryKind, SimulationBoundaryContent> = {
  PLATFORM: {
    label: 'Research prototype',
    title: 'Synthetic data and non-clinical controls',
    description: 'All patient profiles, telemetry, alerts, device controls, and saved artifacts in this application are simulated. This software does not connect to clinical systems and must not be used to diagnose, treat, triage, or make decisions about a person.',
  },
  TELEMETRY: {
    label: 'Simulated telemetry',
    title: 'Browser-generated physiological display',
    description: 'Values update over time for demonstration only. They are not sensor measurements, ECG acquisition, laboratory results, or a patient monitor feed.',
  },
  MATHEMATICAL_MODEL: {
    label: 'Illustrative mathematical model',
    title: 'Explanatory equations, not clinical evidence',
    description: 'The equations and visualizations are simplified research formalisms with configurable parameters. They are not calibrated, validated, or authorized to estimate patient biology, therapeutic effect, safety, or clinical outcome.',
  },
  ASSESSMENT: {
    label: 'Simulation-only',
    title: 'Authored classification scenario',
    description: 'Synthetic evidence for research and learning. This view does not diagnose, triage, or recommend treatment.',
  },
  REGENERATION: {
    label: 'Illustrative model',
    title: 'Regeneration simulation',
    description: 'A synthetic sensitivity model, not a validated patient forecast or treatment recommendation.',
  },
  SCHEMATIC_ANATOMY: {
    label: 'Schematic anatomy',
    title: 'Research visualization',
    description: 'A simulated rendering that is not patient-specific anatomy without validated source imaging and review.',
  },
};
