import { useMemo } from 'react';
import { AssessmentExportFrame } from '../assessment/AssessmentExportFrame';
import { SimulationExportActions } from '../assessment/SimulationExportActions';
import { buildSimulationExportText } from '../../services/assessment/simulationExport';
import { MiAssessment, MiScenarioCase } from '../../types/mi/classification';

export const MiScenarioExport = ({ scenario, assessment }: { scenario: MiScenarioCase; assessment: MiAssessment }) => {
  const contents = useMemo(() => buildSimulationExportText({
    title: scenario.title, moduleId: 'mi-spectrum', moduleVersion: '1.0.0', taxonomyVersion: scenario.taxonomyVersion, scenarioPackId: scenario.scenarioPackId,
    sections: [
      { heading: 'Learning objective', lines: [scenario.learningObjective] },
      { heading: 'Authored simulation assessment', lines: [`Pattern: ${assessment.label}`, `Confidence: ${assessment.confidence}`, `Presentation: ${assessment.presentation}`, assessment.legacyType ? `Legacy mapping: ${assessment.legacyType}` : 'Legacy mapping: not applicable', `Explanation: ${assessment.explanation}`] },
      { heading: 'Evidence limitations', lines: assessment.evidenceGaps.length ? assessment.evidenceGaps : ['No additional authored evidence gaps.'] },
      { heading: 'Synthetic evidence', lines: scenario.evidence.map((item) => `${item.domain} — ${item.state}: ${item.summary}`) },
    ],
  }), [assessment, scenario]);
  return <AssessmentExportFrame title="Scenario review export"><p className="mt-3 max-w-3xl text-sm text-slate-300">Download or copy a reproducible text summary with the scenario’s authored evidence, limitations, and version metadata. No patient or live telemetry fields are included.</p><SimulationExportActions filename={`${scenario.id}-simulation-summary.txt`} contents={contents} /></AssessmentExportFrame>;
};
