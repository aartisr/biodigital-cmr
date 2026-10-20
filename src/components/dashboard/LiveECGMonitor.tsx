/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Live Clinical ECG Monitor
 * High-performance HTML5 Canvas rendering of calibrated Lead II ECG strip
 * with real-time ST-elevation tracking, clinical grid, and arrhythmia alerts.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Activity, RefreshCw } from 'lucide-react';

interface LiveECGMonitorProps {
  currentMv: number;
  stElevationMv: number;
  heartRateBpm: number;
  isPaced: boolean;
  arrhythmiaRisk: number;
}

export const LiveECGMonitor: React.FC<LiveECGMonitorProps> = ({
  currentMv,
  stElevationMv,
  heartRateBpm,
  isPaced,
  arrhythmiaRisk,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLead, setSelectedLead] = useState<'Lead II' | 'Lead V1' | 'Lead V5'>('Lead II');

  // Buffer of points for circular sweep
  const sweepIndexRef = useRef(0);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Initialize buffer if needed
    if (historyRef.current.length !== width) {
      historyRef.current = new Array(width).fill(0);
    }

    if (!isPaused) {
      const idx = sweepIndexRef.current;
      // Multiplier depending on lead
      const leadMultiplier = selectedLead === 'Lead II' ? 1.0 : selectedLead === 'Lead V1' ? 0.75 : 1.2;
      historyRef.current[idx] = currentMv * leadMultiplier;
      sweepIndexRef.current = (idx + 1) % width;
    }

    // Render ECG strip
    ctx.clearRect(0, 0, width, height);

    // 1. Draw clinical paper grid (Standard ECG grid: 1mm small, 5mm large)
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#F1F5F9'; // very light slate
    const smallGrid = 10;
    const largeGrid = 50;

    // Small grid lines
    ctx.beginPath();
    for (let x = 0; x <= width; x += smallGrid) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += smallGrid) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Large grid lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    for (let x = 0; x <= width; x += largeGrid) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += largeGrid) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Isoelectric baseline (0 mV is center height)
    const baselineY = height / 2;
    ctx.strokeStyle = '#CBD5E1';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(width, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw 1 mV Calibration pulse at left edge
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, baselineY);
    ctx.lineTo(15, baselineY);
    ctx.lineTo(15, baselineY - 40); // 1 mV = 40px
    ctx.lineTo(30, baselineY - 40);
    ctx.lineTo(30, baselineY);
    ctx.lineTo(35, baselineY);
    ctx.stroke();

    // 3. Draw continuous waveform with erase head
    const sweepIdx = sweepIndexRef.current;
    const eraseWidth = 20;

    ctx.strokeStyle = '#0284C7'; // Medical cobalt/laser cyan
    ctx.lineWidth = 2.0;
    ctx.beginPath();

    let started = false;
    for (let x = 0; x < width; x++) {
      // Skip the erase head gap
      if (Math.abs(x - sweepIdx) < eraseWidth) {
        started = false;
        continue;
      }

      const val = historyRef.current[x] || 0;
      // 1 mV = 40 pixels upwards
      const y = baselineY - val * 40;

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // 4. Draw sweep head marker
    ctx.fillStyle = '#0284C7';
    const currentVal = historyRef.current[sweepIdx] || 0;
    const headY = baselineY - currentVal * 40;
    ctx.beginPath();
    ctx.arc(sweepIdx, headY, 3, 0, Math.PI * 2);
    ctx.fill();

  }, [currentMv, isPaused, selectedLead]);

  const isSTEMI = stElevationMv > 0.15;
  const isResolving = stElevationMv <= 0.15 && stElevationMv > 0.05;
  const isNormal = stElevationMv <= 0.05;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
      {/* Title & Diagnostic Strip */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-sky-600 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Continuous Surface Telemetry · {selectedLead}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>25 mm/s</span>
              <span>·</span>
              <span>10 mm/mV</span>
              <span>·</span>
              <span>Standard 12-Lead Calibration</span>
            </div>
          </div>
        </div>

        {/* Lead Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(['Lead II', 'Lead V1', 'Lead V5'] as const).map((lead) => (
            <button
              key={lead}
              onClick={() => setSelectedLead(lead)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedLead === lead
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lead}
            </button>
          ))}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume live sweep' : 'Freeze trace'}
            className="p-1 text-slate-600 hover:text-slate-900 rounded"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={640}
          height={180}
          className="w-full h-44 block"
        />

        {/* Overlay Telemetry Badges */}
        <div className="absolute top-2 left-3 flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-700 bg-white/90 px-2 py-0.5 rounded border border-slate-200 shadow-xs">
            HR: <strong className="text-slate-900 tabular-nums">{heartRateBpm}</strong> BPM
          </span>
          {isPaced && (
            <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shadow-xs">
              BIO-PACED
            </span>
          )}
        </div>

        {/* ST Elevation Callout */}
        <div className="absolute top-2 right-3 flex items-center gap-2 text-xs font-mono">
          <span
            className={`px-2 py-0.5 rounded border shadow-xs ${
              isSTEMI
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : isResolving
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            ΔST: <strong className="tabular-nums">{stElevationMv > 0 ? `+${stElevationMv.toFixed(2)}` : stElevationMv.toFixed(2)}</strong> mV
            {isSTEMI && ' (Acute STEMI)'}
            {isResolving && ' (Resolving)'}
            {isNormal && ' (Isoelectric)'}
          </span>
        </div>

        <div className="absolute bottom-2 right-3 text-[11px] font-mono text-slate-400 bg-white/80 px-1.5 py-0.5 rounded">
          Reentry Risk: {arrhythmiaRisk}%
        </div>
      </div>

      {/* Clinical Interpretation Footer */}
      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">Diagnostic Status:</span>
          <span>
            {isSTEMI
              ? 'Severe transmural ischemic ST-elevation. Soft bio-mesh closed-loop pacing recommended.'
              : isResolving
              ? 'ST-segment returning to baseline; cellular repolarization dispersion narrowing.'
              : 'Isoelectric ST segment; homogenous ventricular conduction restored.'}
          </span>
        </div>
        <button
          onClick={() => {
            historyRef.current = new Array(historyRef.current.length).fill(0);
            sweepIndexRef.current = 0;
          }}
          className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[11px]"
        >
          <RefreshCw className="w-3 h-3" />
          Clear
        </button>
      </div>
    </div>
  );
};
