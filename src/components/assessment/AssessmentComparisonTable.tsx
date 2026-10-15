export interface AssessmentComparisonRow {
  label: string;
  left: string;
  right: string;
}

/** A condition-agnostic, responsive comparison primitive for research assessment modules. */
export const AssessmentComparisonTable = ({ leftLabel, rightLabel, rows }: { leftLabel: string; rightLabel: string; rows: readonly AssessmentComparisonRow[] }) => <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
  <div className="border-b border-slate-800 px-4 py-4 sm:px-5"><h2 className="text-base font-bold text-white">Scenario comparison</h2><p className="mt-1 text-xs text-slate-400">Compare authored simulation evidence patterns; this is not patient-level clinical decision support.</p></div>
  <div className="overflow-x-auto"><table className="min-w-[620px] w-full text-left"><thead className="bg-slate-950/70 text-xs"><tr><th className="w-40 px-4 py-3 font-semibold uppercase tracking-wide text-slate-500">Dimension</th><th className="px-4 py-3 font-semibold text-teal-200">{leftLabel}</th><th className="px-4 py-3 font-semibold text-violet-200">{rightLabel}</th></tr></thead><tbody className="divide-y divide-slate-800">{rows.map((row) => <tr key={row.label}><th scope="row" className="bg-slate-950/30 px-4 py-3 align-top text-xs font-semibold text-slate-400">{row.label}</th><td className="px-4 py-3 align-top text-sm text-slate-200">{row.left}</td><td className="px-4 py-3 align-top text-sm text-slate-200">{row.right}</td></tr>)}</tbody></table></div>
</section>;
