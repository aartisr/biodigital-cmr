/**
 * Cryptographically Signed Clinical PDF Export Dialog
 * Provides real-time preview of the verified telemetry dossier, digital signature verification,
 * and automated PDF binary document generation.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  Download,
  Printer,
  X,
  CheckCircle,
  Lock,
  Key,
  Calendar,
  UserCheck,
  Copy,
  Check,
} from 'lucide-react';
import {
  CellularSensorMetrics,
  ClinicalRole,
  EpigeneticDosingState,
  NanogridPacingState,
  PatientProfile,
  PatientVitals,
} from '../types/bdcmr';
import {
  generateAndDownloadSignedPdf,
  generateCryptographicMetadata,
  ReportSignatureMetadata,
} from '../services/clinicalPdfReportService';

interface SignedPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  cellular: CellularSensorMetrics;
  vitals: PatientVitals;
  dosing: EpigeneticDosingState;
  pacing: NanogridPacingState;
  currentRole: ClinicalRole;
}

export const SignedPdfExportModal: React.FC<SignedPdfExportModalProps> = ({
  isOpen,
  onClose,
  patient,
  cellular,
  vitals,
  dosing,
  pacing,
  currentRole,
}) => {
  const [signatureMeta, setSignatureMeta] = useState<ReportSignatureMetadata | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Compute cryptographic hash digest upon opening
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    generateCryptographicMetadata(patient, cellular, vitals, dosing, pacing, currentRole).then(
      (meta) => {
        if (isMounted) {
          setSignatureMeta(meta);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [isOpen, patient, cellular, vitals, dosing, pacing, currentRole]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!signatureMeta) return;
    setIsSigning(true);

    setTimeout(() => {
      generateAndDownloadSignedPdf(patient, cellular, vitals, dosing, pacing, signatureMeta);
      setIsSigning(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 400);
  };

  const handleCopyHash = () => {
    if (!signatureMeta) return;
    navigator.clipboard.writeText(signatureMeta.telemetrySha256Digest);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Export Cryptographically Signed Clinical PDF Report
              </h3>
              <p className="text-xs text-slate-400">
                Official medical telemetry record with SHA-256 integrity seal for EHR/EMR archive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Report Preview Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Certificate Stamp Box */}
          <div className="rounded-lg border border-teal-500/40 bg-teal-950/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Cryptographic Digital Signature Attestation</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      NIST FIPS 180-4
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Doc ID: {signatureMeta?.reportId || 'Generating...'}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-400">
                <div>Signer: {signatureMeta?.clinicianName}</div>
                <div className="text-teal-300 font-semibold">{signatureMeta?.clinicianRole}</div>
              </div>
            </div>

            {/* SHA-256 Digest Line */}
            <div className="mt-3 pt-3 border-t border-teal-500/20 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
              <div className="truncate max-w-lg">
                <span className="text-slate-400">SHA-256 Telemetry Digest: </span>
                <span className="text-teal-300 font-bold">
                  {signatureMeta?.telemetrySha256Digest || 'Computing...'}
                </span>
              </div>
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition"
              >
                {copiedHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
          </div>

          {/* Document Content Preview */}
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-5 space-y-4">
            {/* Dossier Header */}
            <div className="border-b border-slate-800 pb-3">
              <div className="text-sm font-bold text-teal-400 font-mono">
                INSTITUTE FOR BIO-DIGITAL MYOCARDIAL REGENERATION
              </div>
              <div className="text-xs text-slate-300 font-medium">
                Clinical Telemetry &amp; Epigenetic Lineage Reprogramming Record
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Patient: <span className="text-white font-mono">{patient.mrnTokenized} ({patient.patientFullNameMasked})</span> · {patient.infarctLocation} · Day {patient.postInfarcDay}
              </div>
            </div>

            {/* 3 Summary Columns Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Column 1: Cellular Activity */}
              <div className="rounded bg-slate-900/80 p-3 border border-slate-800 space-y-1.5 font-mono">
                <div className="text-[11px] font-sans font-semibold text-slate-300">
                  Cellular Telemetry
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Tissue Stiffness:</span>
                  <span className="text-amber-300 font-bold">{cellular.youngsModulusKPa.toFixed(1)} kPa</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">iCM Lineage Conversion:</span>
                  <span className="text-emerald-400 font-bold">{cellular.iCMConversionEstimate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Cellular Impedance:</span>
                  <span className="text-teal-300">{cellular.singleCellImpedanceMagnitude} Ω</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Systolic Wall Stress:</span>
                  <span className="text-slate-200">{cellular.wallStressKPa.toFixed(1)} kPa</span>
                </div>
              </div>

              {/* Column 2: Therapeutic Delivery */}
              <div className="rounded bg-slate-900/80 p-3 border border-slate-800 space-y-1.5 font-mono">
                <div className="text-[11px] font-sans font-semibold text-slate-300">
                  Delivery &amp; Pacing
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">LNP Formulation:</span>
                  <span className="text-teal-300">{dosing.formulation}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Infusion Rate:</span>
                  <span className="text-white font-bold">{dosing.infusionRateNlMin.toFixed(0)} nl/min</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Sub-threshold Current:</span>
                  <span className="text-teal-300">{pacing.subthresholdCurrentMA.toFixed(2)} mA</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Nanogrid Conduction:</span>
                  <span className="text-emerald-400 font-bold">{pacing.conductionVelocityMs.toFixed(2)} m/s</span>
                </div>
              </div>

              {/* Column 3: Hemodynamics & Remodeling */}
              <div className="rounded bg-slate-900/80 p-3 border border-slate-800 space-y-1.5 font-mono">
                <div className="text-[11px] font-sans font-semibold text-slate-300">
                  Hemodynamics &amp; Remodeling
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Heart Rate:</span>
                  <span className="text-emerald-400 font-bold">{vitals.heartRateBpm} BPM</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Arterial BP (MAP):</span>
                  <span className="text-white">{vitals.systolicBp}/{vitals.diastolicBp} ({vitals.meanArterialPressure})</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Current LVEF:</span>
                  <span className="text-teal-300 font-bold">{patient.currentLVEF}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Scar Area Reduction:</span>
                  <span className="text-emerald-400 font-bold">
                    -{((patient.baselineScarAreaCm2 - patient.currentScarAreaCm2) / patient.baselineScarAreaCm2 * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Regulatory Safeguards Footnote */}
            <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
              <strong>Regulatory Certification:</strong> Certified under 45 CFR § 164.312 (HIPAA Security Rule). Includes immutable tamper-evident SHA-256 block hash for legal medical record archiving, cross-referenced with hospital FHIR R4 repository.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-4 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <Lock className="h-4 w-4 text-teal-400" />
            <span>Format: Standard Medical PDF/A-1b Archival Format</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg px-3.5 py-2 text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>

            <button
              onClick={handleDownload}
              disabled={isSigning}
              className="flex items-center gap-2 rounded-lg bg-teal-500 px-5 py-2 font-bold text-slate-950 hover:bg-teal-400 transition shadow-lg shadow-teal-500/20"
            >
              <Download className="h-4 w-4" />
              <span>
                {isSigning
                  ? 'Signing & Generating PDF...'
                  : downloadSuccess
                  ? 'PDF Downloaded Successfully!'
                  : 'Sign & Download Official PDF'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
