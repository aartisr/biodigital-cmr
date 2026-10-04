/**
 * Hospital Database Architecture & FHIR R4 Interoperability Modal
 * Demonstrates modular adapters for HL7 FHIR R4, Epic Systems, Cerner Millennium,
 * DICOM Waveform, and OMOP CDM cardiac registries.
 */

import React, { useState } from 'react';
import {
  Database,
  X,
  Copy,
  Check,
  Download,
  Share2,
  Server,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import {
  CellularSensorMetrics,
  EpigeneticDosingState,
  NanogridPacingState,
  PatientProfile,
  PatientVitals,
} from '../types/bdcmr';
import { generateFhirR4Bundle } from '../services/hospitalAdapter';

interface HospitalIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  cellular: CellularSensorMetrics;
  vitals: PatientVitals;
  dosing: EpigeneticDosingState;
  pacing: NanogridPacingState;
}

export const HospitalIntegrationModal: React.FC<HospitalIntegrationModalProps> = ({
  isOpen,
  onClose,
  patient,
  cellular,
  vitals,
  dosing,
  pacing,
}) => {
  const [activeTab, setActiveTab] = useState<'FHIR' | 'EPIC' | 'CERNER' | 'DICOM' | 'OMOP'>('FHIR');
  const [copied, setCopied] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE');

  if (!isOpen) return null;

  const fhirBundle = generateFhirR4Bundle(patient, cellular, vitals, dosing, pacing);
  const fhirJsonString = JSON.stringify(fhirBundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(fhirJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fhirJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR-R4-BDCMR-${patient.mrnTokenized}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulatePush = () => {
    setTestPushStatus('SENDING');
    setTimeout(() => {
      setTestPushStatus('SUCCESS');
      setTimeout(() => setTestPushStatus('IDLE'), 3500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <Database className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Hospital Enterprise Architecture & Interoperability Hub
              </h3>
              <p className="text-xs text-slate-400">
                Plug-and-play adapters for HL7 FHIR R4, Epic Systems, Cerner Millennium & DICOM
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

        {/* Adapter Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 text-xs">
          {[
            { id: 'FHIR', label: 'HL7 FHIR R4 Bundle' },
            { id: 'EPIC', label: 'Epic Systems Cosmos / Interconnect' },
            { id: 'CERNER', label: 'Cerner Millennium / Ignite' },
            { id: 'DICOM', label: 'DICOM-ECG & DICOM-SR' },
            { id: 'OMOP', label: 'OMOP CDM Research Registry' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`border-b-2 py-3 px-4 font-medium transition ${
                activeTab === tab.id
                  ? 'border-teal-400 text-teal-300 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {activeTab === 'FHIR' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-slate-300">
                  Real-time transaction bundle streaming observations for stiffness, iCM transdifferentiation, conduction velocity, and LNP delivery.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleSimulatePush}
                    disabled={testPushStatus !== 'IDLE'}
                    className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-medium transition ${
                      testPushStatus === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-teal-500 text-slate-950 hover:bg-teal-400'
                    }`}
                  >
                    <Server className="h-3.5 w-3.5" />
                    <span>
                      {testPushStatus === 'SENDING'
                        ? 'Transmitting...'
                        : testPushStatus === 'SUCCESS'
                        ? 'HTTP 201 Created!'
                        : 'Simulate EHR Push'}
                    </span>
                  </button>
                </div>
              </div>

              <pre className="max-h-[380px] overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-teal-300/90">
                {fhirJsonString}
              </pre>
            </div>
          )}

          {activeTab === 'EPIC' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="font-semibold text-slate-100 flex items-center gap-2">
                  <Server className="h-4 w-4 text-teal-400" />
                  <span>Epic Interconnect & Bridges HL7 FHIR Gateway</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  The BD-CMR system uses OAuth2 Smart-on-FHIR client credentials with Mutual TLS (mTLS) to publish high-rate telemetry into Epic Cosmos repositories. Bio-telemetry is mapped directly to standard Flowsheet IDs:
                </p>
                <div className="grid grid-cols-2 gap-3 text-slate-300 font-mono text-[11px]">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">EPIC FLOWSHEET #390141</div>
                    <div className="font-semibold text-teal-300">CMR_MYO_STIFFNESS_KPA</div>
                    <div className="text-slate-400 mt-1">Current: {cellular.youngsModulusKPa.toFixed(1)} kPa</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">EPIC FLOWSHEET #390142</div>
                    <div className="font-semibold text-teal-300">CMR_ICM_FRACTION_PCT</div>
                    <div className="text-slate-400 mt-1">Current: {cellular.iCMConversionEstimate.toFixed(1)}%</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">EPIC FLOWSHEET #390145</div>
                    <div className="font-semibold text-teal-300">NANOGRID_VELOCITY_MS</div>
                    <div className="text-slate-400 mt-1">Current: {pacing.conductionVelocityMs.toFixed(2)} m/s</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">EPIC MAR REGISTRY</div>
                    <div className="font-semibold text-teal-300">LNP_GHMT_INFUSION_NLMIN</div>
                    <div className="text-slate-400 mt-1">Current: {dosing.infusionRateNlMin.toFixed(0)} nl/min</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CERNER' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="font-semibold text-slate-100 flex items-center gap-2">
                  <Server className="h-4 w-4 text-teal-400" />
                  <span>Oracle Health / Cerner Millennium Open Developer Experience</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Certified Ignite APIs stream patient cellular regeneration events into the Cerner Clinical Data Repository (CDR). Event notifications alert on-call electrophysiologists if the nanogrid detects transient border zone micro-reentry.
                </p>
                <div className="p-3 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300">
                  Endpoint: https://fhir-mycare.cerner.com/r4/ec2458f2-1cad-498f-bdcmr/Observation
                  <br />
                  Status: Connected · mTLS 1.3 Active · Zero dropped packets in session
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DICOM' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="font-semibold text-slate-100 flex items-center gap-2">
                  <Database className="h-4 w-4 text-teal-400" />
                  <span>DICOM Waveform (SOP Class 1.2.840.10008.5.1.4.1.1.9.1.1) & DICOM-SR</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  The Micro-ECG and nanogrid 16-channel waveforms are continuously archived into PACS as standard 12-lead + intracardiac electrogram objects. 4D flow MRI strain tensors correlate directly with DICOM-SR structured reports.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'OMOP' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="font-semibold text-slate-100 flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-teal-400" />
                  <span>OHDSI OMOP Common Data Model (CDM v6.0)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Provides anonymized multi-institutional clinical trial pooling for post-MI regenerative efficacy analysis, comparing time-to-remodeling across international hospital cohorts.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>256-Bit TLS In-Transit Encryption · HIPAA & BAA Validated</span>
          </div>
          <button
            onClick={onClose}
            className="rounded bg-slate-800 px-4 py-1.5 font-medium text-white hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
