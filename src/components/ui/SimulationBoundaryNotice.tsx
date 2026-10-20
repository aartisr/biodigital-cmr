import { ShieldCheck } from 'lucide-react';
import { memo } from 'react';
import { cn } from '../../lib/cn';
import { simulationBoundaryContent, SimulationBoundaryKind } from '../../config/simulationBoundary';

interface SimulationBoundaryNoticeProps {
  kind: SimulationBoundaryKind;
  compact?: boolean;
}

export const SimulationBoundaryNotice = memo(({ kind, compact = false }: SimulationBoundaryNoticeProps) => {
  const content = simulationBoundaryContent[kind];

  return <aside aria-label={content.title} className={cn('border border-sky-400/25 bg-sky-500/[0.07] text-sky-100', compact ? 'rounded-lg px-3 py-2' : 'rounded-xl p-3')}>
    <div className="flex items-start gap-2">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-sky-200">{content.label} · {content.title}</p>
        {!compact && <p className="mt-1 text-xs leading-relaxed text-sky-100/85">{content.description}</p>}
      </div>
    </div>
  </aside>;
});
SimulationBoundaryNotice.displayName = 'SimulationBoundaryNotice';
