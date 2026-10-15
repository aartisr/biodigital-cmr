import type { PatientProfile } from '../../types/bdcmr';
import type { PersonaCapability } from '../../types/persona';
import { resolvePatientInfarctSummary } from '../../services/mi/resolvePatientInfarctSummary';
import { InfarctSummaryPanel } from '../mi/InfarctSummaryPanel';

export const PatientInfarctSummaryPanel = ({ patient, capabilities }: { patient: PatientProfile; capabilities: readonly PersonaCapability[] }) => {
  const result = resolvePatientInfarctSummary(patient);

  if (result.state === 'UNAVAILABLE') return <section aria-labelledby="patient-infarct-summary-title" className="border-y border-rose-400/20 py-4">
    <h2 id="patient-infarct-summary-title" className="text-sm font-bold text-white">Infarct phenotype summary unavailable</h2>
    <p className="mt-2 text-xs text-rose-200">The structured phenotype did not pass validation. Legacy display text was not used as a substitute.</p>
  </section>;

  return <div>
    <p className="mb-2 text-xs font-semibold text-slate-400">{result.phenotypeSource === 'STRUCTURED' ? 'Structured phenotype' : 'Exact legacy migration'} · read-only summary</p>
    <InfarctSummaryPanel summary={result.summary} capabilities={capabilities} compact />
  </div>;
};