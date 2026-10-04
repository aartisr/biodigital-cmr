import { AssessmentComparisonTable } from '../assessment/AssessmentComparisonTable';
import { legacyTypeLabels, miGroupMetadata, presentationLabels } from '../../config/mi/taxonomy';
import { evaluateMiScenario } from '../../services/mi/evaluateMiScenario';
import { MiScenarioCase } from '../../types/mi/classification';

const observedEvidence = (scenario: MiScenarioCase) => scenario.evidence.filter((item) => item.state === 'PRESENT').length;
const troponinPeak = (scenario: MiScenarioCase) => scenario.troponinSeries.length ? `${Math.max(...scenario.troponinSeries.map((point) => point.value))} ng/L` : 'No serial value';

export const MiScenarioComparison = ({ primary, comparison }: { primary: MiScenarioCase; comparison: MiScenarioCase }) => {
  const left = evaluateMiScenario(primary);
  const right = evaluateMiScenario(comparison);
  return <AssessmentComparisonTable leftLabel={primary.title} rightLabel={comparison.title} rows={[
    { label: 'Simulation pattern', left: miGroupMetadata[left.category].label, right: miGroupMetadata[right.category].label },
    { label: 'Presentation', left: presentationLabels[left.presentation], right: presentationLabels[right.presentation] },
    { label: 'Legacy mapping', left: left.legacyType ? legacyTypeLabels[left.legacyType] : 'Not applicable', right: right.legacyType ? legacyTypeLabels[right.legacyType] : 'Not applicable' },
    { label: 'Evidence marked present', left: `${observedEvidence(primary)} of ${primary.evidence.length}`, right: `${observedEvidence(comparison)} of ${comparison.evidence.length}` },
    { label: 'Simulated troponin peak', left: troponinPeak(primary), right: troponinPeak(comparison) },
    { label: 'Evidence gaps', left: left.evidenceGaps.length ? left.evidenceGaps.join(' ') : 'None authored', right: right.evidenceGaps.length ? right.evidenceGaps.join(' ') : 'None authored' },
    { label: 'Learning objective', left: primary.learningObjective, right: comparison.learningObjective },
  ]} />;
};
