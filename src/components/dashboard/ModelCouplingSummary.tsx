import { type FC } from 'react';
import type { NanogridPacingState, PatientProfile } from '../../types/bdcmr';
import { MetricTile, SectionHeading, Surface } from '../ui/Surface';

interface ModelCouplingSummaryProps {
  patient: PatientProfile;
  pacing: NanogridPacingState;
  onReviewAssumptions: () => void;
}

/** Reusable companion panel for a visualization driven by illustrative model inputs. */
export const ModelCouplingSummary: FC<ModelCouplingSummaryProps> = ({ patient, pacing, onReviewAssumptions }) => {
  const metrics = [
    { label: 'Conduction velocity', value: pacing.conductionVelocityMs.toFixed(2), unit: 'm/s', tone: 'text-teal-300' },
    { label: 'Modeled re-entry index', value: pacing.reentrySuppressionRate, unit: '%', tone: 'text-emerald-300' },
    { label: 'Impedance', value: pacing.impedanceOhms, unit: 'Ω', tone: 'text-slate-200' },
    { label: 'Scenario conversion', value: patient.iCMConversionRate, unit: '%', tone: 'text-sky-300' },
  ];

  return (
    <Surface className="flex flex-col justify-between p-5 text-xs text-slate-300">
      <div>
        <SectionHeading title="Illustrative electrophysiological coupling" />
        <p className="mb-4 mt-2 leading-relaxed text-slate-400">
          This synthetic scenario maps configured inputs (token: <strong className="text-white">{patient.mrnTokenized}</strong>, scenario label: <strong className="text-white">{patient.infarctLocation}</strong>) into a 2D visualization and simplified mathematical fields. The displayed pacing value (<strong className="text-teal-400">{pacing.subthresholdCurrentMA} mA</strong>) does not deliver energy, represent a treatment, or establish an effect on re-entry.
        </p>
        <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
          {metrics.map((metric) => <MetricTile key={metric.label} {...metric} />)}
        </div>
      </div>
      <button onClick={onReviewAssumptions} className="mt-4 rounded-lg border border-teal-500/40 bg-teal-500/20 px-4 py-2 text-center text-xs font-semibold text-teal-200 transition hover:bg-teal-500/30">
        Review model scope &amp; assumptions →
      </button>
    </Surface>
  );
};
