import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

/** Shared dark-surface primitive for workspace cards and feature panels. */
export const Surface = forwardRef<HTMLElement, ComponentPropsWithoutRef<'section'>>(
  ({ className, ...props }, ref) => (
    <section ref={ref} className={cn('rounded-xl border border-slate-800 bg-slate-900/70', className)} {...props} />
  ),
);
Surface.displayName = 'Surface';

export const SectionHeading = ({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="flex min-w-0 gap-3">
      {Icon && <Icon className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" aria-hidden="true" />}
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{eyebrow}</p>}
        <h2 className="mt-1 text-base font-semibold text-white">{title}</h2>
        {description && <div className="mt-1 text-xs text-slate-400">{description}</div>}
      </div>
    </div>
    {action}
  </div>
);

export const MetricTile = ({
  label,
  value,
  unit,
  icon: Icon,
  tone = 'text-teal-300',
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: LucideIcon;
  tone?: string;
}) => (
  <Surface className="p-3">
    <div className="flex items-center justify-between text-xs text-slate-400">
      <span>{label}</span>
      {Icon && <Icon className={cn('h-4 w-4', tone)} aria-hidden="true" />}
    </div>
    <div className={cn('mt-2 font-mono text-2xl font-bold', tone)}>
      {value}{unit && <span className="ml-1 text-xs font-medium text-slate-500">{unit}</span>}
    </div>
  </Surface>
);
