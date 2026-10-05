export interface FilterChipOption<T extends string> { value: T; label: string; }

/** Compact, accessible multi-option filter primitive for data-library style interfaces. */
export const FilterChipGroup = <T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly FilterChipOption<T>[]; onChange: (value: T) => void }) => <fieldset>
  <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</legend>
  <div className="mt-2 flex flex-wrap gap-1.5">{options.map((option) => <button key={option.value} type="button" onClick={() => onChange(option.value)} aria-pressed={value === option.value} className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${value === option.value ? 'border-teal-300/60 bg-teal-400 text-slate-950' : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-500 hover:text-white'}`}>{option.label}</button>)}</div>
</fieldset>;
