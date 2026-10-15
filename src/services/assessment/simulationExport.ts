export interface SimulationExportDocument {
  title: string;
  moduleId: string;
  moduleVersion: string;
  taxonomyVersion: string;
  scenarioPackId: string;
  sections: readonly { heading: string; lines: readonly string[] }[];
}

/** Creates an intentionally non-clinical, reproducible text artifact. */
export const buildSimulationExportText = (document: SimulationExportDocument): string => [
  'SIMULATION-ONLY RESEARCH / LEARNING ARTIFACT',
  'Not a diagnosis, treatment recommendation, or patient record.',
  '',
  document.title,
  `Module: ${document.moduleId} v${document.moduleVersion}`,
  `Taxonomy: ${document.taxonomyVersion}`,
  `Scenario pack: ${document.scenarioPackId}`,
  '',
  ...document.sections.flatMap((section) => [section.heading, ...section.lines.map((line) => `- ${line}`), '']),
].join('\n').trimEnd() + '\n';

export const downloadSimulationText = (filename: string, contents: string) => {
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
