import { Ban, CheckCircle2, CircleDotDashed } from 'lucide-react';
import type { MiCoverageDisplayGroup, MiCoverageDisplayItem } from '../../services/mi/deriveMiCoverageDisplay';
import type { MiCoverageStatus } from '../../types/mi/coverage';

const statusMetadata: Readonly<Record<MiCoverageStatus, { label: string; description: string; className: string }>> = {
  REPRESENTED: {
    label: 'Represented',
    description: 'Structured scenarios exist for this classification dimension.',
    className: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
  },
  PARTIAL: {
    label: 'Partial',
    description: 'Structured content exists but review or breadth is incomplete.',
    className: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
  },
  UNSUPPORTED: {
    label: 'Unsupported',
    description: 'No structured scenario currently supports this claim.',
    className: 'border-slate-600 bg-slate-950/60 text-slate-300',
  },
};

const statusIcons = {
  REPRESENTED: CheckCircle2,
  PARTIAL: CircleDotDashed,
  UNSUPPORTED: Ban,
} as const;

const countByStatus = (groups: readonly MiCoverageDisplayGroup[], status: MiCoverageStatus) =>
  groups.reduce((count, group) => count + group.items.filter((item) => item.status === status).length, 0);

const CoverageItem = ({ item }: { item: MiCoverageDisplayItem }) => {
  const metadata = statusMetadata[item.status];
  return <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${metadata.className}`} title={item.notes.join(' ') || metadata.description}>
    {item.label}
  </span>;
};

export const MiCoverageBoundary = ({ groups }: { groups: readonly MiCoverageDisplayGroup[] }) => <section aria-labelledby="mi-coverage-boundary-title" className="border-y border-slate-800 py-4">
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <p className="text-xs font-bold uppercase text-sky-300">Scenario library scope</p>
      <h2 id="mi-coverage-boundary-title" className="mt-1 text-base font-bold text-white">Coverage boundary</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-400">Coverage describes authored simulation fixtures, not real-world diagnostic completeness or clinical validation.</p>
    </div>
    <div className="flex flex-wrap gap-2">
      {(Object.keys(statusMetadata) as MiCoverageStatus[]).map((status) => {
        const Icon = statusIcons[status];
        const metadata = statusMetadata[status];
        return <span key={status} className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-bold ${metadata.className}`} title={metadata.description}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />{metadata.label}: {countByStatus(groups, status)}
        </span>;
      })}
    </div>
  </div>
  <details className="mt-4">
    <summary className="cursor-pointer text-sm font-semibold text-sky-200">Coverage by dimension</summary>
    <div className="mt-3 grid gap-x-6 gap-y-4 lg:grid-cols-2">
      {groups.map((group) => <div key={group.dimension}>
        <h3 className="text-xs font-bold uppercase text-slate-400">{group.label}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">{group.items.map((item) => <CoverageItem key={item.value} item={item} />)}</div>
      </div>)}
    </div>
  </details>
</section>;