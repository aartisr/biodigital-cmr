import { Clipboard, Download, Printer } from 'lucide-react';
import { useState } from 'react';
import { downloadSimulationText } from '../../services/assessment/simulationExport';

export const SimulationExportActions = ({ filename, contents }: { filename: string; contents: string }) => {
  const [message, setMessage] = useState('');
  const announce = (next: string) => { setMessage(next); window.setTimeout(() => setMessage(''), 3000); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(contents); announce('Simulation summary copied.'); }
    catch { announce('Copy is unavailable in this browser. Use download instead.'); }
  };
  return <div className="mt-4 flex flex-wrap items-center gap-2"><button type="button" onClick={() => { downloadSimulationText(filename, contents); announce('Simulation summary downloaded.'); }} className="inline-flex items-center gap-2 rounded-lg bg-sky-300 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-sky-200"><Download className="h-4 w-4" />Download text</button><button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/60 hover:text-sky-100"><Clipboard className="h-4 w-4" />Copy summary</button><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-200 hover:border-sky-300/60 hover:text-sky-100"><Printer className="h-4 w-4" />Print workspace</button><p className="basis-full text-xs text-sky-100/80" aria-live="polite">{message || 'Exports include synthetic scenario content and version metadata only.'}</p></div>;
};
