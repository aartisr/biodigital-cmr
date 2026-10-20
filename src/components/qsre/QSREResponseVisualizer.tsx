/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Quantum-Stochastic Regeneration Engine (QSRE) Visualizer
 * Comprehensive interactive multi-model explorer for the 4 mathematical pillars:
 * 1. Quantum Tunneling & Hamiltonian Evolution (H psi = E psi)
 * 2. Multivariate Fokker-Planck & Stochastic Ion Channels
 * 3. Non-Euclidean Tensor Deformation & Differential Geometry
 * 4. Combinatorial Graph & Syncytial Percolation Topology
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Atom,
  TrendingUp,
  Maximize2,
  Share2,
  Sparkles,
  Info,
  Activity,
} from 'lucide-react';
import {
  QuantumTunnelingParams,
  QuantumTunnelingState,
  FokkerPlanckGrid,
  StochasticSystemState,
  SyncytialTopologyMetrics,
  PatientProfile,
  NanogridPacingState,
  EpigeneticDosingState,
  CellularSensorMetrics,
  PatientVitals,
} from '../../types/bdcmr';
import {
  generateWavefunctionProfile,
  calculateQuantumTunneling,
} from '../../services/qsre/quantumTunnelingEngine';
import { simulateLangevinTrajectory } from '../../services/qsre/stochasticFokkerPlanck';
import {
  generateTissueTensorField,
  traceGeodesicWavefront,
} from '../../services/qsre/tensorDeformationField';
import { buildMyocardialSyncytiumGraph } from '../../services/qsre/combinatorialTopology';
import { MathFormula } from '../common/MathFormula';
import { QuantumMetabolicCorrelationChart } from './QuantumMetabolicCorrelationChart';
import { HighResolutionECGWaveformCanvas } from './HighResolutionECGWaveformCanvas';
import { PredictiveCellularRecoveryModel } from './PredictiveCellularRecoveryModel';

interface QSREResponseVisualizerProps {
  quantumParams: QuantumTunnelingParams;
  quantumState: QuantumTunnelingState;
  fokkerPlanckGrid: FokkerPlanckGrid;
  stochasticState: StochasticSystemState;
  topologyMetrics: SyncytialTopologyMetrics;
  onUpdateQuantumParams: (params: Partial<QuantumTunnelingParams>) => void;
  isBioMeshActive: boolean;
  cellularTimestamp?: number;
  subthresholdCurrentMa?: number;
  infarctConversionPercent?: number;
  patient?: PatientProfile;
  cellular?: CellularSensorMetrics;
  pacing?: NanogridPacingState;
  dosing?: EpigeneticDosingState;
  vitals?: PatientVitals;
}

export const QSREResponseVisualizer: React.FC<QSREResponseVisualizerProps> = ({
  quantumParams,
  quantumState,
  fokkerPlanckGrid,
  stochasticState,
  topologyMetrics,
  onUpdateQuantumParams,
  isBioMeshActive,
  cellularTimestamp,
  subthresholdCurrentMa,
  infarctConversionPercent,
  patient,
  cellular,
  pacing,
  dosing,
  vitals,
}) => {
  const [activeTab, setActiveTab] = useState<'quantum' | 'fokker' | 'tensor' | 'topology' | 'correlation' | 'ecg1000hz' | 'predictive'>('quantum');

  // Canvas refs for the 4 models
  const quantumCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fokkerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tensorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const topologyCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // -------------------------------------------------------------
  // Model 1: Render Quantum Tunneling Wavefunction Canvas
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'quantum') return;
    const canvas = quantumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const profile = generateWavefunctionProfile(
      quantumParams.barrierDistanceNm,
      quantumParams.barrierPotentialEv,
      quantumParams.carrierEnergyEv,
      120
    );

    // Coordinate mapping
    const minX = -2.0;
    const maxX = quantumParams.barrierDistanceNm + 2.0;
    const toCanvasX = (x: number) => ((x - minX) / (maxX - minX)) * (width - 60) + 30;
    const baselineY = height * 0.72;

    // Draw Potential Barrier V(x)
    ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
    const barrierStartX = toCanvasX(0);
    const barrierEndX = toCanvasX(quantumParams.barrierDistanceNm);
    const barrierHeightPx = (quantumParams.barrierPotentialEv / 4.0) * (height * 0.55);
    ctx.fillRect(barrierStartX, baselineY - barrierHeightPx, barrierEndX - barrierStartX, barrierHeightPx);

    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barrierStartX, baselineY - barrierHeightPx, barrierEndX - barrierStartX, barrierHeightPx);

    // Energy level line E
    const energyY = baselineY - (quantumParams.carrierEnergyEv / 4.0) * (height * 0.55);
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 1.0;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, energyY);
    ctx.lineTo(width - 30, energyY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#2563EB';
    ctx.font = '10px monospace';
    ctx.fillText(`E = ${quantumParams.carrierEnergyEv.toFixed(2)} eV`, 35, energyY - 4);
    ctx.fillText(`V₀ = ${quantumParams.barrierPotentialEv.toFixed(2)} eV`, barrierStartX + 6, baselineY - barrierHeightPx + 14);

    // Region labels
    ctx.fillStyle = '#64748B';
    ctx.fillText('Conductive Polymer', 35, height - 12);
    ctx.fillText(`Fibrotic Barrier (${quantumParams.barrierDistanceNm.toFixed(1)} nm)`, barrierStartX + 6, height - 12);
    ctx.fillText('Mitochondrial Matrix', barrierEndX + 10, height - 12);

    // Draw Probability Density |psi(x)|^2
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    profile.forEach((pt, idx) => {
      const cx = toCanvasX(pt.xNm);
      const cy = baselineY - pt.psiMagnitudeSquared * (height * 0.35);
      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // Fill underneath wavefunction
    ctx.lineTo(toCanvasX(profile[profile.length - 1].xNm), baselineY);
    ctx.lineTo(toCanvasX(profile[0].xNm), baselineY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(2, 132, 199, 0.12)';
    ctx.fill();

  }, [activeTab, quantumParams]);

  // -------------------------------------------------------------
  // Model 2: Render Fokker-Planck 2D Density & Langevin Trajectory
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'fokker') return;
    const canvas = fokkerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const { voltageAxis, calciumAxis, densityMatrix } = fokkerPlanckGrid;
    const vSteps = voltageAxis.length;
    const caSteps = calciumAxis.length;
    const cellW = (width - 60) / vSteps;
    const cellH = (height - 60) / caSteps;

    // Draw Density Matrix heatmap
    for (let j = 0; j < caSteps; j++) {
      for (let i = 0; i < vSteps; i++) {
        const p = densityMatrix[j][i] * 40; // Scaled for color intensity
        const cx = 40 + i * cellW;
        const cy = height - 40 - (j + 1) * cellH;

        // Color ramp from pale slate to deep blue
        const r = Math.round(240 - Math.min(200, p * 220));
        const g = Math.round(245 - Math.min(180, p * 190));
        const b = Math.round(250 - Math.min(60, p * 80));
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(cx, cy, cellW, cellH);
      }
    }

    // Basin markers
    // Healthy basin: V = -85 mV, Ca = 0.12
    const healthyX = 40 + (( -85 - voltageAxis[0] ) / (voltageAxis[vSteps - 1] - voltageAxis[0])) * (width - 60);
    const healthyY = height - 40 - (( 0.12 - calciumAxis[0] ) / (calciumAxis[caSteps - 1] - calciumAxis[0])) * (height - 60);
    ctx.strokeStyle = '#059669'; // Green marker
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(healthyX, healthyY, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#059669';
    ctx.font = '10px monospace';
    ctx.fillText('Regenerated Syncytium Basin', healthyX + 12, healthyY + 4);

    // Ischemic basin: V = -45 mV, Ca = 1.6
    const ischemicX = 40 + (( -45 - voltageAxis[0] ) / (voltageAxis[vSteps - 1] - voltageAxis[0])) * (width - 60);
    const ischemicY = height - 40 - (( 1.6 - calciumAxis[0] ) / (calciumAxis[caSteps - 1] - calciumAxis[0])) * (height - 60);
    ctx.strokeStyle = '#DC2626'; // Red marker
    ctx.beginPath();
    ctx.arc(ischemicX, ischemicY, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#DC2626';
    ctx.fillText('Ischemic Trap Basin', ischemicX - 120, ischemicY - 10);

    // Draw Stochastic Langevin Trajectory
    const trajectory = simulateLangevinTrajectory(stochasticState, isBioMeshActive ? 2.0 : 0, 45, 1.0);
    ctx.strokeStyle = '#F59E0B'; // Amber trajectory path
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    trajectory.forEach((pt, idx) => {
      const tx = 40 + (( pt.voltageMv - voltageAxis[0] ) / (voltageAxis[vSteps - 1] - voltageAxis[0])) * (width - 60);
      const ty = height - 40 - (( pt.calciumMicroMolar - calciumAxis[0] ) / (calciumAxis[caSteps - 1] - calciumAxis[0])) * (height - 60);
      if (idx === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    });
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#64748B';
    ctx.font = '10px monospace';
    ctx.fillText('Voltage V_m (-90 to -20 mV) →', width / 2 - 60, height - 12);
    ctx.save();
    ctx.translate(14, height / 2 + 30);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Intracellular [Ca²⁺] (0.05 to 2.4 μM) →', 0, 0);
    ctx.restore();

  }, [activeTab, fokkerPlanckGrid, stochasticState, isBioMeshActive]);

  // -------------------------------------------------------------
  // Model 3: Render Riemannian Metric Tensor Field & Geodesics
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'tensor') return;
    const canvas = tensorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.42;

    // Draw tissue tensor grid
    const points = generateTissueTensorField(9, isBioMeshActive);

    // Draw background zones
    ctx.beginPath();
    ctx.arc(centerX, centerY, scale, 0, Math.PI * 2);
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.stroke();

    // Infarct scar region
    ctx.beginPath();
    ctx.arc(centerX, centerY, scale * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#F1F5F9';
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.stroke();

    // Draw tensor ellipses
    points.forEach((pt) => {
      const px = centerX + pt.x * scale;
      const py = centerY + pt.y * scale;

      const a = Math.max(0.5, 14 / Math.sqrt(Math.max(0.01, pt.metric.g11)));
      const b = Math.max(0.5, 14 / Math.sqrt(Math.max(0.01, pt.metric.g22)));

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(pt.geodesicDeviationAngleRad);
      ctx.beginPath();
      ctx.ellipse(0, 0, a, b, 0, 0, Math.PI * 2);
      ctx.strokeStyle = pt.zone === 'infarct_core' ? '#64748B' : pt.zone === 'border_zone' ? '#D97706' : '#2563EB';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Principle axis
      ctx.beginPath();
      ctx.moveTo(-a, 0);
      ctx.lineTo(a, 0);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.stroke();
      ctx.restore();
    });

    // Draw Geodesic Wavefront Trajectories
    const angles = [0.2, 0.5, 0.8, -0.3];
    angles.forEach((ang) => {
      const geo = traceGeodesicWavefront(-0.9, -0.6, ang, 35, isBioMeshActive);
      ctx.strokeStyle = '#0D9488'; // Teal geodesic line
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      geo.forEach((pt, idx) => {
        const gx = centerX + pt.x * scale;
        const gy = centerY + pt.y * scale;
        if (idx === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      });
      ctx.stroke();
    });

    // Label
    ctx.fillStyle = '#0F172A';
    ctx.font = '11px monospace';
    ctx.fillText(
      isBioMeshActive
        ? 'Conductive Patch Active: Metric Tensor Homogenized (R_avg ~ 0.32)'
        : 'Unassisted Scar: High Metric Curvature & Conduction Block (R_avg ~ 1.85)',
      20,
      25
    );

  }, [activeTab, isBioMeshActive]);

  // -------------------------------------------------------------
  // Model 4: Render Combinatorial Syncytium Graph Topology
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'topology') return;
    const canvas = topologyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const { nodes, edges } = buildMyocardialSyncytiumGraph(isBioMeshActive, 0.8);
    const toCanvasX = (nx: number) => 40 + nx * (width - 80);
    const toCanvasY = (ny: number) => 30 + ny * (height - 60);

    const nodeCoordMap = new Map<string, { x: number; y: number }>();
    nodes.forEach((n) => nodeCoordMap.set(n.id, { x: toCanvasX(n.x), y: toCanvasY(n.y) }));

    // Draw Edges
    edges.forEach((e) => {
      const s = nodeCoordMap.get(e.source)!;
      const t = nodeCoordMap.get(e.target)!;

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);

      if (e.isActiveMeshBridge) {
        ctx.strokeStyle = '#0284C7'; // Sky blue conductive hydrogel bridge
        ctx.lineWidth = 2.2;
      } else if (e.conductionProbability < 0.2) {
        ctx.strokeStyle = '#E2E8F0'; // Blocked scar edge
        ctx.lineWidth = 0.8;
      } else if (e.conductionProbability < 0.6) {
        ctx.strokeStyle = '#FCD34D'; // Border zone edge
        ctx.lineWidth = 1.2;
      } else {
        ctx.strokeStyle = '#CBD5E1'; // Viable gap junction
        ctx.lineWidth = 1.0;
      }
      ctx.stroke();
    });

    // Draw Nodes
    nodes.forEach((n) => {
      const pos = nodeCoordMap.get(n.id)!;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4.5, 0, Math.PI * 2);

      if (n.type === 'fibroblast_scar') {
        ctx.fillStyle = '#94A3B8';
      } else if (n.type === 'ischemic_border') {
        ctx.fillStyle = '#F59E0B';
      } else {
        ctx.fillStyle = '#2563EB';
      }
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.0;
      ctx.stroke();
    });

  }, [activeTab, isBioMeshActive]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Quantum-Stochastic Regeneration Engine (QSRE) Explorer
            </h3>
            <p className="text-xs text-slate-500">
              Interactive numerical solvers across quantum mechanics, stochastic calculus, differential geometry, and graph theory
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('quantum')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeTab === 'quantum' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Quantum Tunneling
          </button>
          <button
            onClick={() => setActiveTab('fokker')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeTab === 'fokker' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Stochastic Fokker-Planck
          </button>
          <button
            onClick={() => setActiveTab('tensor')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeTab === 'tensor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Tensor Calculus
          </button>
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeTab === 'topology' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Syncytial Graph
          </button>
          <button
            onClick={() => setActiveTab('correlation')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'correlation' ? 'bg-teal-50 text-teal-900 font-semibold shadow-xs border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>5. Quantum-Metabolic Convergence</span>
            <span className="text-[9px] bg-teal-600 text-white px-1.5 py-0.2 rounded font-mono font-bold tracking-tight">RECHARTS</span>
          </button>
          <button
            onClick={() => setActiveTab('ecg1000hz')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ecg1000hz' ? 'bg-emerald-50 text-emerald-900 font-semibold shadow-xs border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>6. 1000Hz Myocardial ECG</span>
            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono font-bold tracking-tight">CANVAS</span>
          </button>
          <button
            onClick={() => setActiveTab('predictive')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'predictive' ? 'bg-sky-50 text-sky-900 font-semibold shadow-xs border border-sky-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>7. Predictive Recovery Timelines</span>
            <span className="text-[9px] bg-sky-600 text-white px-1.5 py-0.2 rounded font-mono font-bold tracking-tight">RECHARTS</span>
          </button>
        </div>
      </div>

      {/* Model 1: Quantum Tunneling */}
      {activeTab === 'quantum' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-sky-50 border border-sky-100 rounded-lg text-xs text-sky-900">
            <div className="font-semibold mb-1">
              Modified Bardeen-Condon Electron Transfer Formulation:
            </div>
            <MathFormula
              tex="P_{if} = \frac{2\pi}{\hbar} |\langle \psi_f | \hat{H}' | \psi_i \rangle|^2 \rho(E) \exp\left(-\frac{2d}{\hbar}\sqrt{2m^*(V_0 - E)}\right)"
              displayMode={true}
              tone="inherit"
            />
            <p className="mt-1 text-sky-800">
              Models quantum coherence and sub-nanometer electron transfer from conductive polymer hydrogels to mitochondrial respiratory complexes across fibrotic collagen barriers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Canvas */}
            <div className="lg:col-span-2 border border-slate-200 rounded-lg overflow-hidden bg-white">
              <canvas ref={quantumCanvasRef} width={580} height={260} className="w-full h-auto block" />
            </div>

            {/* Controls & Metrics */}
            <div className="flex flex-col gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-semibold text-slate-800">
                Quantum Parameter Tuning
              </span>

              {/* Barrier distance d */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono">
                  <span>Barrier Width (d):</span>
                  <strong>{quantumParams.barrierDistanceNm.toFixed(2)} nm</strong>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="4.0"
                  step="0.1"
                  value={quantumParams.barrierDistanceNm}
                  onChange={(e) => onUpdateQuantumParams({ barrierDistanceNm: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </div>

              {/* Barrier potential V0 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono">
                  <span>Potential Height (V₀):</span>
                  <strong>{quantumParams.barrierPotentialEv.toFixed(2)} eV</strong>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="4.0"
                  step="0.1"
                  value={quantumParams.barrierPotentialEv}
                  onChange={(e) => onUpdateQuantumParams({ barrierPotentialEv: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </div>

              {/* Output KPIs */}
              <div className="pt-2 border-t border-slate-200 flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Transmission Prob (P_if):</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {(quantumState.probability * 100).toFixed(4)} %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tunneling Flux:</span>
                  <span className="font-bold text-sky-700 tabular-nums">
                    {quantumState.electronFluxPicoAmps.toFixed(1)} pA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Decay Length (1/κ):</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {quantumState.wavefunctionDecayLengthNm.toFixed(3)} nm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Proton Hopping Rate:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {quantumState.protonHoppingRateThz.toFixed(2)} THz
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model 2: Fokker-Planck */}
      {activeTab === 'fokker' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-900">
            <div className="font-semibold mb-1">
              Multivariate Fokker-Planck Probability Density Evolution:
            </div>
            <MathFormula
              tex="\frac{\partial p}{\partial t} = -\sum_{i=1}^n \frac{\partial}{\partial x_i}\left[D_i(x,t)p\right] + \frac{1}{2}\sum_{i=1}^n \sum_{j=1}^n \frac{\partial^2}{\partial x_i \partial x_j}\left[Q_{ij}(x,t)p\right]"
              displayMode={true}
              tone="inherit"
            />
            <p className="mt-1 text-amber-800">
              Captures thermal noise and stochastic ion channel gating in the border zone. The amber line traces a live Langevin trajectory jumping across the activation barrier from ischemic arrest to syncytial recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border border-slate-200 rounded-lg overflow-hidden bg-white">
              <canvas ref={fokkerCanvasRef} width={580} height={260} className="w-full h-auto block" />
            </div>

            <div className="flex flex-col gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
              <span className="font-semibold text-slate-900">Phase-Space Basin Weights</span>
              <div className="flex justify-between">
                <span className="text-slate-600">Regenerated Basin:</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {(fokkerPlanckGrid.metastableBasins.regeneratedBasinWeight * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Ischemic Trap Basin:</span>
                <span className="font-bold text-rose-700 tabular-nums">
                  {(fokkerPlanckGrid.metastableBasins.ischemicBasinWeight * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Kramers Escape Rate:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {fokkerPlanckGrid.metastableBasins.escapeRateHz.toFixed(1)} Hz
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-600">Intracellular pH:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {stochasticState.intracellularPh.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sodium [Na⁺]ᵢ:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {stochasticState.sodiumMilliMolar.toFixed(1)} mM
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model 3: Tensor Calculus */}
      {activeTab === 'tensor' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900">
            <div className="font-semibold mb-1">
              Riemannian Metric Tensor & Geodesic Conduction Fields:
            </div>
            <MathFormula
              tex="\sigma^{ij} = \sigma_0 \sqrt{\det g} \, g^{ij}, \quad \frac{d^2 x^k}{ds^2} + \Gamma^k_{ij} \frac{dx^i}{ds} \frac{dx^j}{ds} = 0"
              displayMode={true}
              tone="inherit"
            />
            <p className="mt-1 text-blue-800">
              This geometric field is an illustrative representation of anisotropy and deformation. It does not establish tissue geometry, a material effect, restoration of conduction, or elimination of conduction block.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border border-slate-200 rounded-lg overflow-hidden bg-white">
              <canvas ref={tensorCanvasRef} width={580} height={260} className="w-full h-auto block" />
            </div>

            <div className="flex flex-col gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
              <span className="font-semibold text-slate-900">Curvature & Metric Diagnostics</span>
              <div className="flex justify-between">
                <span className="text-slate-600">Ricci Curvature (R):</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {isBioMeshActive ? '0.32 (Smooth)' : '1.85 (Distorted)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Metric Anisotropy (g₂₂/g₁₁):</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {isBioMeshActive ? '1.18' : '2.35'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Christoffel Singularity:</span>
                <span className={`font-bold tabular-nums ${isBioMeshActive ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isBioMeshActive ? 'Eliminated' : 'Active Reentry Risk'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model 4: Combinatorial Syncytial Topology */}
      {activeTab === 'topology' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-900">
            <div className="font-semibold mb-1">
              Combinatorial Graph Optimization of Multi-Cellular Syncytia:
            </div>
            <MathFormula
              tex="\max_{S \subseteq E} F(S) = \sum_{u,v \in V} w_{uv} \prod_{e \in \text{path}(u,v)} P_{\text{conduction}}(e)"
              displayMode={true}
              tone="inherit"
            />
            <p className="mt-1 text-emerald-800">
              Optimizes soft conductive nanofiber placement across the tissue graph to maximize electrical wave transmission fidelity across surviving cardiomyocyte islands.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border border-slate-200 rounded-lg overflow-hidden bg-white">
              <canvas ref={topologyCanvasRef} width={580} height={260} className="w-full h-auto block" />
            </div>

            <div className="flex flex-col gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
              <span className="font-semibold text-slate-900">Topological Graph Metrics</span>
              <div className="flex justify-between">
                <span className="text-slate-600">Conduction Fidelity F(S):</span>
                <span className="font-bold text-sky-700 tabular-nums">
                  {topologyMetrics.conductionFidelity.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Percolation Threshold:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {topologyMetrics.syncytialPercolationThreshold.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Electrical Percolation:</span>
                <span className={`font-bold tabular-nums ${topologyMetrics.isPercolationAchieved ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {topologyMetrics.isPercolationAchieved ? 'ACHIEVED' : 'SUB-CRITICAL'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Active Bio-Mesh Bridges:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {topologyMetrics.activeMeshBridges}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Reentry Cycle Risk:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {(topologyMetrics.maxReentryCycleRisk * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model 5: Recharts Multi-Line Quantum-Stochastic & Metabolic Correlation */}
      {activeTab === 'correlation' && (
        <div className="flex flex-col gap-3">
          <QuantumMetabolicCorrelationChart
            currentTimestamp={cellularTimestamp ?? Date.now()}
            subthresholdCurrentMa={subthresholdCurrentMa ?? 1.2}
            pacingActive={isBioMeshActive}
            infarctConversionPercent={infarctConversionPercent ?? 42}
          />
        </div>
      )}

      {/* Model 6: High-Resolution Real-Time 1000Hz ECG Waveform Canvas */}
      {activeTab === 'ecg1000hz' && (
        <div className="flex flex-col gap-3">
          <HighResolutionECGWaveformCanvas
            currentTimestamp={cellularTimestamp ?? Date.now()}
            subthresholdCurrentMa={subthresholdCurrentMa ?? 1.2}
            pacingActive={isBioMeshActive}
            infarctConversionPercent={infarctConversionPercent ?? 42}
          />
        </div>
      )}

      {/* Model 7: Recharts Predictive Cellular Recovery Timelines */}
      {activeTab === 'predictive' && (
        <div className="flex flex-col gap-3">
          <PredictiveCellularRecoveryModel
            patient={patient ?? {
              id: 'PAT-7721-BC',
              mrnTokenized: 'PAT-7721-BC',
              patientFullNameMasked: 'R. C****** (58M)',
              unmaskedName: 'Robert Chen',
              age: 58,
              gender: 'M',
              admissionDiagnosis: 'Acute Antero-Apical STEMI with cardiogenic shock',
              postInfarcDay: 4,
              infarctLocation: 'Antero-Apical',
              baselineLVEF: 26,
              currentLVEF: 42,
              baselineScarAreaCm2: 24.6,
              currentScarAreaCm2: 11.2,
              iCMConversionRate: infarctConversionPercent ?? 64.8,
              tissueStiffnessKPa: 18.4,
              arrhythmiaShieldStatus: 'OPTIMAL_SHIELD',
            }}
            cellular={cellular ?? {
              timestamp: cellularTimestamp ?? Date.now(),
              singleCellImpedanceMagnitude: 1420,
              singleCellImpedancePhaseDeg: -32,
              youngsModulusKPa: 18.4,
              wallStressKPa: 42.1,
              wallStrainPercent: 12.8,
              iCMConversionEstimate: infarctConversionPercent ?? 64.8,
              actionPotentialDuration90Ms: 290,
              calciumTransientAmplitude: 1.4,
              microECGNativeMv: 0.85,
              microECGShieldedMv: 1.25,
            }}
            pacing={pacing ?? {
              activePacingEnabled: isBioMeshActive,
              meshMaterial: 'PEDOT:PSS / Graphene-Elastomer',
              subthresholdCurrentMA: subthresholdCurrentMa ?? 0.85,
              pulseFrequencyBpm: 72,
              pulseWidthMs: 1.2,
              conductionVelocityMs: 0.74,
              impedanceOhms: 420,
              reentrySuppressionRate: 99.8,
              activeElectrodeChannels: 16,
              syncWithSinoatrialNode: true,
            }}
            dosing={dosing ?? {
              formulation: 'GHMT',
              infusionRateNlMin: 240,
              targetInfusionRateNlMin: 240,
              totalDeliveredUl: 14.8,
              deliveryVector: 'Fibroblast-Targeted LNP (mRNA)',
              lastDoseAdjustmentTimestamp: new Date().toISOString(),
              adjustmentReason: 'Therapeutic window maintenance',
              safetyCapNlMin: 450,
              pidOutputEffort: 68,
            }}
            vitals={vitals}
          />
        </div>
      )}
    </div>
  );
};
