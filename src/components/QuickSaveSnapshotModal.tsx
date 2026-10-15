/**
 * Clinical Session Quick-Save Snapshots & Side-by-Side Parameter Comparator
 * Captures granular timestamped snapshots of cellular, pacing, dosing, and vitals telemetry
 * for instant comparative review and parameter restoration.
 */

import React, { useState } from 'react';
import {
  Camera,
  X,
  Clock,
  Trash2,
  Edit2,
  Check,
  ArrowRightLeft,
  Activity,
  Heart,
  Zap,
  Syringe,
  Download,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Copy,
  Plus,
} from 'lucide-react';
import {
  CellularSensorMetrics,
  ClinicalSnapshot,
  EpigeneticDosingState,
  NanogridPacingState,
  SystemOperatingMode,
  PatientProfile,
  PatientVitals,
} from '../types/bdcmr';

interface QuickSaveSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: ClinicalSnapshot[];
  onTakeSnapshot: (customLabel?: string) => void;
  onDeleteSnapshot: (id: string) => void;
  onUpdateSnapshotLabel: (id: string, label: string) => void;
  onApplySnapshotParameters?: (snapshot: ClinicalSnapshot) => void;
  // Current Live Telemetry State
  livePatient: PatientProfile;
  liveCellular: CellularSensorMetrics;
  livePacing: NanogridPacingState;
  liveDosing: EpigeneticDosingState;
  liveVitals: PatientVitals;
  liveOperatingMode: SystemOperatingMode;
}

export const QuickSaveSnapshotModal: React.FC<QuickSaveSnapshotModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  onTakeSnapshot,
  onDeleteSnapshot,
  onUpdateSnapshotLabel,
  onApplySnapshotParameters,
  livePatient,
  liveCellular,
  livePacing,
  liveDosing,
  liveVitals,
  liveOperatingMode,
}) => {
  const [selectedSnapshotIdA, setSelectedSnapshotIdA] = useState<string | null>(
    snapshots.length > 0 ? snapshots[snapshots.length - 1].id : null
  );
  const [selectedSnapshotIdB, setSelectedSnapshotIdB] = useState<string | 'LIVE'>('LIVE');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState<string>('');
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Keep selectedSnapshotIdA synced if snapshots list changes
  React.useEffect(() => {
    if (!selectedSnapshotIdA && snapshots.length > 0) {
      setSelectedSnapshotIdA(snapshots[snapshots.length - 1].id);
    }
  }, [snapshots, selectedSnapshotIdA]);

  if (!isOpen) return null;

  const snapshotA = snapshots.find((s) => s.id === selectedSnapshotIdA) || snapshots[0];
  const isComparingLive = selectedSnapshotIdB === 'LIVE';
  const snapshotB = isComparingLive
    ? null
    : snapshots.find((s) => s.id === selectedSnapshotIdB);

  // Target comparison metrics for Side B
  const sideBMetrics = isComparingLive
    ? {
        label: 'Current Live Telemetry (Real-Time)',
        displayTime: 'LIVE NOW',
        cellular: liveCellular,
        pacing: livePacing,
        dosing: liveDosing,
        vitals: liveVitals,
      }
    : snapshotB
    ? {
        label: snapshotB.label,
        displayTime: snapshotB.displayTime,
        cellular: snapshotB.cellular,
        pacing: snapshotB.pacing,
        dosing: snapshotB.dosing,
        vitals: snapshotB.vitals,
      }
    : null;

  const handleStartRename = (s: ClinicalSnapshot) => {
    setEditingId(s.id);
    setTempLabel(s.label);
  };

  const handleSaveRename = (id: string) => {
    if (tempLabel.trim()) {
      onUpdateSnapshotLabel(id, tempLabel.trim());
    }
    setEditingId(null);
  };

  const handleApply = (snapshot: ClinicalSnapshot) => {
    if (onApplySnapshotParameters) {
      onApplySnapshotParameters(snapshot);
      setAppliedNotification(`Parameters restored to live controller from ${snapshot.label}`);
      setTimeout(() => setAppliedNotification(null), 4000);
    }
  };

  const handleExportJson = () => {
    if (!snapshotA) return;
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      patientMrn: livePatient.mrnTokenized,
      snapshotA: snapshotA,
      snapshotB: sideBMetrics,
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Helper for numeric deltas
  const renderDelta = (valA: number, valB: number, unit = '', invertColor = false) => {
    const diff = Number((valB - valA).toFixed(2));
    if (diff === 0) return <span className="text-slate-500 font-mono text-[11px]">—</span>;
    const isPositive = diff > 0;
    const isGood = invertColor ? !isPositive : isPositive;
    const colorClass = isGood ? 'text-emerald-400' : 'text-rose-400';
    return (
      <span className={`font-mono text-[11px] font-bold ${colorClass}`}>
        {isPositive ? `+${diff}` : `${diff}`} {unit}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Clinical Session Quick-Save &amp; Telemetry Comparator</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  {snapshots.length} SAVED SNAPSHOTS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Timestamped parameter state freeze for granular side-by-side progression tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTakeSnapshot()}
              className="flex items-center gap-1.5 rounded-lg border border-teal-500/50 bg-teal-500/20 px-3 py-1.5 text-xs font-semibold text-teal-300 hover:bg-teal-500/30 transition shadow-sm"
              title="Capture granular snapshot of current state"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Capture Snapshot Now</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Snapshot Timeline History (4 cols) */}
          <div className="w-80 border-r border-slate-800 bg-slate-950/80 p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
                <span>Session Timeline</span>
                <span className="text-[11px] font-mono text-slate-500">{livePatient.mrnTokenized}</span>
              </div>

              {snapshots.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                  <Camera className="h-8 w-8 mx-auto text-slate-600 opacity-50" />
                  <p>No snapshots captured yet this session.</p>
                  <button
                    onClick={() => onTakeSnapshot('Initial Baseline')}
                    className="mt-2 text-teal-400 hover:underline font-semibold"
                  >
                    Take First Snapshot
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {snapshots.map((s, index) => {
                    const isSelected = s.id === selectedSnapshotIdA;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSnapshotIdA(s.id)}
                        className={`group relative rounded-lg border p-3 text-xs transition cursor-pointer ${
                          isSelected
                            ? 'border-teal-500/50 bg-teal-950/30 shadow-md ring-1 ring-teal-500/30'
                            : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          {editingId === s.id ? (
                            <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={tempLabel}
                                onChange={(e) => setTempLabel(e.target.value)}
                                className="w-full rounded bg-slate-950 px-2 py-0.5 text-xs text-white border border-teal-500/50 focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveRename(s.id)}
                                className="p-1 text-teal-400 hover:text-white"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                              <span className="text-[10px] font-mono text-teal-400">#{index + 1}</span>
                              <span className="truncate">{s.label}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartRename(s);
                              }}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Rename snapshot"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSnapshot(s.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400"
                              title="Delete snapshot"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Snapshot Time & Mini KPIs */}
                        <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span>{s.displayTime}</span>
                          </span>
                          <span className="text-amber-300 font-bold">{s.cellular.youngsModulusKPa.toFixed(1)} kPa</span>
                          <span className="text-teal-300 font-bold">{s.dosing.infusionRateNlMin} nl/min</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick-Save Hint */}
            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              Snapshots remain cached in session memory for immediate side-by-side comparative inspection.
            </div>
          </div>

          {/* Right Panel: Side-by-Side Comparison Workspace */}
          <div className="flex-1 flex flex-col justify-between overflow-y-auto p-6 space-y-5">
            {appliedNotification && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>{appliedNotification}</span>
              </div>
            )}

            {/* Comparison Setup Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
              {/* Snapshot A Selector */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-300 font-mono">Reference [A]:</span>
                <select
                  value={selectedSnapshotIdA || ''}
                  onChange={(e) => setSelectedSnapshotIdA(e.target.value)}
                  className="rounded-lg border border-teal-500/30 bg-slate-900 px-3 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                >
                  {snapshots.map((s, idx) => (
                    <option key={s.id} value={s.id}>
                      #{idx + 1} {s.label} ({s.displayTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500">
                <ArrowRightLeft className="h-4 w-4 text-teal-400" />
                <span className="font-semibold text-slate-400">Comparing Against</span>
              </div>

              {/* Snapshot B / Live State Selector */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 font-mono">Comparator [B]:</span>
                <select
                  value={selectedSnapshotIdB}
                  onChange={(e) => setSelectedSnapshotIdB(e.target.value)}
                  className="rounded-lg border border-amber-500/30 bg-slate-900 px-3 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="LIVE">Live Telemetry State (Now)</option>
                  {snapshots
                    .filter((s) => s.id !== selectedSnapshotIdA)
                    .map((s, idx) => (
                      <option key={s.id} value={s.id}>
                        Snapshot {s.label} ({s.displayTime})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Granular Parameter Side-by-Side Comparison Tables */}
            {snapshotA && sideBMetrics ? (
              <div className="space-y-4">
                {/* 1. Cellular Remodeling & Tissue Mechanics */}
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 font-semibold text-slate-200">
                      <Heart className="h-4 w-4 text-rose-400" />
                      <span>Cellular Remodeling &amp; Tissue Mechanics</span>
                    </div>
                    <div className="flex items-center gap-8 font-mono text-[11px] text-slate-400">
                      <span className="w-24 text-right text-teal-300 font-bold">{snapshotA.label}</span>
                      <span className="w-24 text-right text-amber-300 font-bold">{sideBMetrics.label}</span>
                      <span className="w-20 text-right">Delta [B - A]</span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-800/60 font-mono text-xs">
                    {/* Young's Modulus */}
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Tissue Young&apos;s Modulus (Stiffness):</span>
                      <div className="flex items-center gap-8 text-[11px]">
                        <span className="w-24 text-right text-slate-200 font-bold">{snapshotA.cellular.youngsModulusKPa.toFixed(1)} kPa</span>
                        <span className="w-24 text-right text-slate-200 font-bold">{sideBMetrics.cellular.youngsModulusKPa.toFixed(1)} kPa</span>
                        <span className="w-20 text-right">
                          {renderDelta(snapshotA.cellular.youngsModulusKPa, sideBMetrics.cellular.youngsModulusKPa, 'kPa', true)}
                        </span>
                      </div>
                    </div>

                    {/* iCM Conversion */}
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 font-sans">iCM Lineage Conversion Rate:</span>
                      <div className="flex items-center gap-8 text-[11px]">
                        <span className="w-24 text-right text-slate-200 font-bold">{snapshotA.cellular.iCMConversionEstimate.toFixed(1)}%</span>
                        <span className="w-24 text-right text-slate-200 font-bold">{sideBMetrics.cellular.iCMConversionEstimate.toFixed(1)}%</span>
                        <span className="w-20 text-right">
                          {renderDelta(snapshotA.cellular.iCMConversionEstimate, sideBMetrics.cellular.iCMConversionEstimate, '%')}
                        </span>
                      </div>
                    </div>

                    {/* Wall Stress Tensor */}
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Systolic Wall Stress Tensor:</span>
                      <div className="flex items-center gap-8 text-[11px]">
                        <span className="w-24 text-right text-slate-200 font-bold">{snapshotA.cellular.wallStressKPa} kPa</span>
                        <span className="w-24 text-right text-slate-200 font-bold">{sideBMetrics.cellular.wallStressKPa} kPa</span>
                        <span className="w-20 text-right">
                          {renderDelta(snapshotA.cellular.wallStressKPa, sideBMetrics.cellular.wallStressKPa, 'kPa', true)}
                        </span>
                      </div>
                    </div>

                    {/* Impedance Spectroscopy */}
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Single-Cell Impedance (1 kHz):</span>
                      <div className="flex items-center gap-8 text-[11px]">
                        <span className="w-24 text-right text-slate-200 font-bold">{snapshotA.cellular.singleCellImpedanceMagnitude} Ω</span>
                        <span className="w-24 text-right text-slate-200 font-bold">{sideBMetrics.cellular.singleCellImpedanceMagnitude} Ω</span>
                        <span className="w-20 text-right">
                          {renderDelta(snapshotA.cellular.singleCellImpedanceMagnitude, sideBMetrics.cellular.singleCellImpedanceMagnitude, 'Ω')}
                        </span>
                      </div>
                    </div>

                    {/* Calcium Transient Amplitude */}
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Calcium Transient (ΔF/F₀):</span>
                      <div className="flex items-center gap-8 text-[11px]">
                        <span className="w-24 text-right text-slate-200 font-bold">{snapshotA.cellular.calciumTransientAmplitude.toFixed(2)}</span>
                        <span className="w-24 text-right text-slate-200 font-bold">{sideBMetrics.cellular.calciumTransientAmplitude.toFixed(2)}</span>
                        <span className="w-20 text-right">
                          {renderDelta(snapshotA.cellular.calciumTransientAmplitude, sideBMetrics.cellular.calciumTransientAmplitude)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Nanogrid Bio-Pacing Electronics */}
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 font-semibold text-slate-200">
                      <Zap className="h-4 w-4 text-teal-400" />
                      <span>Nanogrid Bio-Pacing Electronics</span>
                    </div>
                    <div className="flex items-center gap-8 font-mono text-[11px] text-slate-400">
                      <span className="w-24 text-right text-teal-300 font-bold">{snapshotA.label}</span>
                      <span className="w-24 text-right text-amber-300 font-bold">{sideBMetrics.label}</span>
                      <span className="w-20 text-right">Delta [B - A]</span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-800/60 font-mono text-xs">
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Sub-threshold Pacing Current:</span>
                      <div className="flex items-center gap-8 text-[11px]">
                        <span className="w-24 text-right text-slate-200 font-bold">{snapshotA.pacing.subthresholdCurrentMA.toFixed(2)} mA</span>
                        <span className="w-24 text-right text-slate-200 font-bold">{sideBMetrics.pacing.subthresholdCurrentMA.toFixed(2)} mA</span>
                        <span className="w-20 text-right">
                          {renderDelta(snapshotA.pacing.subthresholdCurrentMA, sideBMetrics.pacing.subthresholdCurrentMA, 'mA')}
                        </span>
                      </div>
                    </div>

                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Entrainment Pacing Rate:</span>
                      <div className="flex items-center gap-8 text-[11px]">
                        <span className="w-24 text-right text-slate-200 font-bold">{snapshotA.pacing.pulseFrequencyBpm} bpm</span>
                        <span className="w-24 text-right text-slate-200 font-bold">{sideBMetrics.pacing.pulseFrequencyBpm} bpm</span>
                        <span className="w-20 text-right">
                          {renderDelta(snapshotA.pacing.pulseFrequencyBpm, sideBMetrics.pacing.pulseFrequencyBpm, 'bpm')}
                        </span>
                      </div>
                    </div>

                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Conduction Velocity:</span>
                      <div className="flex items-center gap-8 text-[11px]">
                        <span className="w-24 text-right text-slate-200 font-bold">{snapshotA.pacing.conductionVelocityMs.toFixed(2)} m/s</span>
                        <span className="w-24 text-right text-slate-200 font-bold">{sideBMetrics.pacing.conductionVelocityMs.toFixed(2)} m/s</span>
                        <span className="w-20 text-right">
                          {renderDelta(snapshotA.pacing.conductionVelocityMs, sideBMetrics.pacing.conductionVelocityMs, 'm/s')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Epigenetic Micro-Infusion Delivery */}
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 font-semibold text-slate-200">
                      <Syringe className="h-4 w-4 text-sky-400" />
                      <span>Epigenetic Micro-Infusion Delivery</span>
                    </div>
                    <div className="flex items-center gap-8 font-mono text-[11px] text-slate-400">
                      <span className="w-24 text-right text-teal-300 font-bold">{snapshotA.label}</span>
                      <span className="w-24 text-right text-amber-300 font-bold">{sideBMetrics.label}</span>
                      <span className="w-20 text-right">Delta [B - A]</span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-800/60 font-mono text-xs">
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 font-sans">LNP Infusion Flow Rate:</span>
                      <div className="flex items-center gap-8 text-[11px]">
                        <span className="w-24 text-right text-slate-200 font-bold">{snapshotA.dosing.infusionRateNlMin.toFixed(0)} nl/min</span>
                        <span className="w-24 text-right text-slate-200 font-bold">{sideBMetrics.dosing.infusionRateNlMin.toFixed(0)} nl/min</span>
                        <span className="w-20 text-right">
                          {renderDelta(snapshotA.dosing.infusionRateNlMin, sideBMetrics.dosing.infusionRateNlMin, 'nl/min')}
                        </span>
                      </div>
                    </div>

                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Cumulative Delivered Volume:</span>
                      <div className="flex items-center gap-8 text-[11px]">
                        <span className="w-24 text-right text-slate-200 font-bold">{snapshotA.dosing.totalDeliveredUl.toFixed(1)} μL</span>
                        <span className="w-24 text-right text-slate-200 font-bold">{sideBMetrics.dosing.totalDeliveredUl.toFixed(1)} μL</span>
                        <span className="w-20 text-right">
                          {renderDelta(snapshotA.dosing.totalDeliveredUl, sideBMetrics.dosing.totalDeliveredUl, 'μL')}
                        </span>
                      </div>
                    </div>

                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Active mRNA Formulation:</span>
                      <div className="flex items-center gap-8 text-[11px]">
                        <span className="w-24 text-right text-teal-300 font-semibold truncate">{snapshotA.dosing.formulation}</span>
                        <span className="w-24 text-right text-amber-300 font-semibold truncate">{sideBMetrics.dosing.formulation}</span>
                        <span className="w-20 text-right text-slate-500">—</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                {snapshotA && onApplySnapshotParameters && (
                  <button
                    onClick={() => handleApply(snapshotA)}
                    className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition shadow-sm"
                    title="Revert live pacing & dosing to Snapshot A"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restore Dosing &amp; Pacing from {snapshotA.label}</span>
                  </button>
                )}

                <button
                  onClick={handleExportJson}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 hover:border-slate-700 hover:text-white transition"
                >
                  <Copy className="h-3.5 w-3.5 text-teal-400" />
                  <span>{copiedNotification ? 'Copied JSON!' : 'Copy Diff JSON'}</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="rounded bg-teal-500 px-4 py-1.5 font-medium text-slate-950 hover:bg-teal-400 transition"
              >
                Close Comparator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
