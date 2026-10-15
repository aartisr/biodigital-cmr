import React from 'react';
import { ArrowRight, FileSearch, ScanLine, ShieldAlert } from 'lucide-react';
import { ClinicalImagingCase } from '../../types/clinicalImaging';

interface ImagingProvenancePanelProps {
  imagingCase: ClinicalImagingCase;
  onOpenReadiness: () => void;
  onOpenReview: () => void;
}

/** Source-first review panel for the cardiac imaging reviewer persona. */
export const ImagingProvenancePanel: React.FC<ImagingProvenancePanelProps> = ({ imagingCase, onOpenReadiness, onOpenReview }) => {
  const checks = [
    ['Source study', imagingCase.sourceImagesVerified ? 'Verified' : 'Not linked'],
    ['Acquisition quality', imagingCase.acquisitionQualityApproved ? 'Approved' : 'Not reviewed'],
    ['Versioned segmentation', imagingCase.segmentationUid ? 'Available' : 'Not available'],
  ] as const;

  return (
    <section className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-amber-200">Imaging provenance review</p><h2 className="mt-1 text-sm font-semibold text-white">Source evidence must precede anatomy interpretation</h2><p className="mt-1 max-w-2xl text-xs text-slate-300">The current case is {imagingCase.status.replaceAll('_', ' ').toLowerCase()}. The 3D preview remains procedural until the required source and review gates are complete.</p></div><button type="button" onClick={onOpenReadiness} className="flex min-h-11 items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 text-xs font-semibold text-amber-100 hover:bg-amber-500/20">Open readiness gate <ArrowRight className="h-4 w-4" /></button></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">{checks.map(([label, status]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-center gap-2 text-[11px] text-slate-400"><FileSearch className="h-3.5 w-3.5 text-amber-300" />{label}</div><p className="mt-1 text-xs font-semibold text-amber-100">{status}</p></div>)}</div>
      <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={onOpenReview} className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs font-semibold text-slate-200 hover:bg-slate-900"><ScanLine className="h-4 w-4 text-teal-300" />Open review artifacts <ArrowRight className="h-4 w-4" /></button></div>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-100"><ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />This demo does not ingest DICOM, store segmentation, or produce diagnostic measurements.</p>
    </section>
  );
};
