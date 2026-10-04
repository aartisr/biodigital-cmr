import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Image, LockKeyhole } from 'lucide-react';
import { PatientProfile } from '../types/bdcmr';
import { diagnosticGateLabels } from '../types/clinicalImaging';
import { createResearchImagingCase } from '../services/clinicalImagingCaseService';
import { ModalShell } from './ui/ModalShell';

export const ClinicalImagingReadinessModal: React.FC<{ isOpen: boolean; onClose: () => void; patient: PatientProfile }> = ({ isOpen, onClose, patient }) => {
  const imagingCase = useMemo(() => createResearchImagingCase(patient.id), [patient.id]);
  return <ModalShell isOpen={isOpen} onClose={onClose} title="Patient-Specific Imaging Readiness" description={`Case ${imagingCase.caseId} · research-only gate`}>
      <div className="space-y-5 p-5">
        <div className="flex gap-2 text-amber-300"><Image className="h-5 w-5" /><span className="text-xs font-semibold uppercase tracking-wide">Imaging safety gate</span></div>
        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"/><p><strong>Diagnostic output is disabled.</strong> This case has no linked DICOM study, validated segmentation, or clinician acceptance. Dashboard anatomy must not be used for diagnosis, treatment, or measurement.</p></div>
        <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"><div className="text-[11px] uppercase tracking-wide text-slate-500">Patient token</div><div className="mt-1 font-mono text-sm text-slate-200">{patient.mrnTokenized}</div></div><div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"><div className="text-[11px] uppercase tracking-wide text-slate-500">Case status</div><div className="mt-1 text-sm font-semibold text-amber-300">No source images</div></div></div>
        <div><h3 className="mb-2 text-sm font-semibold text-white">Required release gates</h3><ul className="space-y-2">{diagnosticGateLabels.map((gate) => <li key={gate} className="flex gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-400"><LockKeyhole className="h-4 w-4 shrink-0 text-slate-500"/>{gate}</li>)}</ul></div>
        <div className="flex gap-2 text-xs text-slate-400"><CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400"/>Implementation next: connect an authenticated PACS/DICOMweb gateway, retain immutable study and segmentation references, then add a clinician contour-review workspace.</div>
      </div>
    </ModalShell>;
};
