/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Plug-and-Play Integration & Export Hub
 * Modular, componentized blueprints and export utilities for seamless
 * embedding into existing React / TypeScript web applications.
 */

import React, { useState } from 'react';
import {
  Code,
  Download,
  Copy,
  Check,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BDCMREngineState } from '../../types/bdcmr';

interface PlugAndPlayGuideProps {
  engineState: BDCMREngineState;
}

export const PlugAndPlayGuide: React.FC<PlugAndPlayGuideProps> = ({ engineState }) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(engineState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bdcmr_simulation_state_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = 'TimestampMs,MembranePotentialMv,ConductionVelocityCmS,STElevationMv,CalciumUm,EjectionFractionPercent\n';
    const sampleRow = `${Date.now()},${engineState.telemetry.membranePotentialMv},${engineState.telemetry.conductionVelocityCmS},${engineState.stElevationMv},${engineState.telemetry.calciumTransientPeakUm},${engineState.ejectionFractionPercent}\n`;
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + sampleRow);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `bdcmr_telemetry_stream_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const reactHookSnippet = `import React from 'react';
import { useBDCMREngine, LiveECGMonitor, QSREResponseVisualizer } from './services/qsre';

export function MyCardiologyApp() {
  const { state, updateStimulator, updateQuantumParams } = useBDCMREngine();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Real-Time Surface ECG */}
      <LiveECGMonitor
        currentMv={state.telemetry.membranePotentialMv / 40}
        stElevationMv={state.stElevationMv}
        heartRateBpm={state.heartRateBpm}
        isPaced={state.stimulator.isEnabled}
        arrhythmiaRisk={state.arrhythmiaRiskScore}
      />

      {/* Quantum-Stochastic Regeneration Engine Visualizer */}
      <QSREResponseVisualizer
        quantumParams={state.quantumParams}
        quantumState={state.quantumTunneling}
        fokkerPlanckGrid={state.fokkerPlanckGrid}
        stochasticState={state.stochasticState}
        topologyMetrics={state.topologyMetrics}
        onUpdateQuantumParams={updateQuantumParams}
        isBioMeshActive={state.stimulator.isEnabled}
      />
    </div>
  );
}`;

  const modularServiceSnippet = `// Standalone Computational Kernel in any Node.js / Browser WebWorker
import { calculateQuantumTunneling } from './services/qsre/quantumTunnelingEngine';
import { solveFokkerPlanck2DGrid } from './services/qsre/stochasticFokkerPlanck';
import { computeMetricTensorAt } from './services/qsre/tensorDeformationField';

// 1. Evaluate Nanoscale Tunneling Flux
const quantumFlux = calculateQuantumTunneling({
  barrierDistanceNm: 1.8,
  barrierPotentialEv: 2.8,
  carrierEnergyEv: 1.2,
  couplingMatrixElement: 0.12,
  densityOfStates: 1.45,
  effectiveMassRatio: 0.85,
});

// 2. Compute Non-Euclidean Metric Tensor across Scar
const { metric, christoffel } = computeMetricTensorAt(0.2, -0.1, true);

console.log("Transmission Rate:", quantumFlux.probability);
console.log("Ricci Scalar Curvature:", metric.ricciScalar);`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-700 font-semibold mb-1">
            <Package className="w-4 h-4 text-sky-600" />
            <span>MODULAR PLUG-AND-PLAY ARCHITECTURE</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Developer Integration & State Export
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Generic, componentized React & TypeScript modules ready for drop-in embedding into clinical consoles, laboratory webhooks, or telemedicine dashboards.
          </p>
        </div>

        {/* Data Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export State (JSON)
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export Telemetry (CSV)
          </button>
        </div>
      </div>

      {/* Integration Code Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* React Hook Snippet */}
        <div className="flex flex-col gap-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200">
            <span className="text-xs font-semibold font-mono text-slate-800">
              1. React Component Drop-In
            </span>
            <button
              onClick={() => handleCopy(reactHookSnippet, 'react')}
              className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-mono"
            >
              {copiedTab === 'react' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-800 overflow-x-auto leading-relaxed bg-white">
            {reactHookSnippet}
          </pre>
        </div>

        {/* Standalone Node.js / Worker Snippet */}
        <div className="flex flex-col gap-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200">
            <span className="text-xs font-semibold font-mono text-slate-800">
              2. Pure TypeScript Kernel
            </span>
            <button
              onClick={() => handleCopy(modularServiceSnippet, 'pure')}
              className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-mono"
            >
              {copiedTab === 'pure' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-800 overflow-x-auto leading-relaxed bg-white">
            {modularServiceSnippet}
          </pre>
        </div>
      </div>

      {/* Directory Structure Blueprint */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700">
        <strong className="text-slate-900 block mb-2 font-sans text-sm">
          Clean Modular Architecture Blueprint (Zero-Sprawl Isolation)
        </strong>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sky-700 font-semibold mb-1">src/services/qsre/</div>
            <ul className="space-y-1 text-slate-600">
              <li>├── quantumTunnelingEngine.ts · Bardeen-Condon Hamiltonian solver</li>
              <li>├── stochasticFokkerPlanck.ts · Multivariate SDE & Langevin solver</li>
              <li>├── tensorDeformationField.ts · Riemannian Christoffel & Ricci curvature</li>
              <li>├── combinatorialTopology.ts · Steiner-tree syncytial graph routing</li>
              <li>└── qsreKernel.ts · Unified real-time closed-loop orchestrator</li>
            </ul>
          </div>
          <div>
            <div className="text-sky-700 font-semibold mb-1">src/components/</div>
            <ul className="space-y-1 text-slate-600">
              <li>├── dashboard/ · Clinical Lead II ECG, tissue cross-section, & stimulator</li>
              <li>├── qsre/ · Interactive 4-pillar multi-physics visualizer</li>
              <li>├── math-defense/ · Formal mathematical dissertation & proofs</li>
              <li>└── common/ · KaTeX scientific typesetting & vector badges</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
