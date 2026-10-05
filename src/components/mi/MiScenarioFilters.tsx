import { Search, SlidersHorizontal, X } from 'lucide-react';
import { FilterChipGroup } from '../ui/FilterChipGroup';
import { miGroupMetadata, presentationLabels } from '../../config/mi/taxonomy';
import type { MiClinicalGroup, MiPresentation } from '../../types/mi/classification';
import type { MiScenarioFilters as Filters } from '../../services/mi/filterMiScenarios';

const groupOptions = [{ value: 'ALL', label: 'All' }, ...Object.entries(miGroupMetadata).map(([value, item]) => ({ value: value as MiClinicalGroup, label: item.label }))] as const;
const presentationOptions = [{ value: 'ALL', label: 'All' }, ...Object.entries(presentationLabels).map(([value, label]) => ({ value: value as MiPresentation, label }))] as const;
const evidenceOptions = [{ value: 'ALL', label: 'All' }, ...(['SYMPTOMS', 'TROPONIN', 'ECG', 'IMAGING', 'ANGIOGRAPHY', 'PROCEDURE', 'CONTEXT'] as const).map((value) => ({ value, label: value[0] + value.slice(1).toLowerCase() }))] as const;

export const MiScenarioFilters = ({ filters, resultCount, onChange, onReset }: { filters: Filters; resultCount: number; onChange: (next: Filters) => void; onReset: () => void }) => <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:p-4">
  <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-teal-300" /><div><h2 className="text-sm font-bold text-white">Find a scenario</h2><p className="text-xs text-slate-400">{resultCount} matching synthetic case{resultCount === 1 ? '' : 's'}</p></div></div><button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-100"><X className="h-3.5 w-3.5" />Clear filters</button></div>
  <label className="relative mt-3 block"><span className="sr-only">Search scenarios</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={filters.query} onChange={(event) => onChange({ ...filters, query: event.target.value })} placeholder="Search title, descriptor, or learning objective" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20" /></label>
  <div className="mt-4 space-y-3"><FilterChipGroup label="Pattern" value={filters.group} options={groupOptions} onChange={(group) => onChange({ ...filters, group })} /><FilterChipGroup label="Presentation" value={filters.presentation} options={presentationOptions} onChange={(presentation) => onChange({ ...filters, presentation })} /><FilterChipGroup label="Evidence available" value={filters.evidenceDomain} options={evidenceOptions} onChange={(evidenceDomain) => onChange({ ...filters, evidenceDomain })} /></div>
</section>;
