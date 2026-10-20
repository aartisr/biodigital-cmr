import { CheckCircle2, CircleSlash2, HelpCircle, MinusCircle } from 'lucide-react';
import { EvidenceState } from '../../types/assessment/evidence';

const style: Record<EvidenceState, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  PRESENT: { label: 'Present', className: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-200', Icon: CheckCircle2 },
  ABSENT: { label: 'Absent', className: 'border-slate-500/50 bg-slate-800 text-slate-300', Icon: MinusCircle },
  INDETERMINATE: { label: 'Indeterminate', className: 'border-amber-400/35 bg-amber-500/10 text-amber-200', Icon: HelpCircle },
  NOT_OBSERVED: { label: 'Not observed', className: 'border-sky-400/35 bg-sky-500/10 text-sky-200', Icon: CircleSlash2 },
};

export const EvidenceStateBadge = ({ state }: { state: EvidenceState }) => {
  const { label, className, Icon } = style[state];
  return <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${className}`}><Icon className="h-3.5 w-3.5" />{label}</span>;
};
