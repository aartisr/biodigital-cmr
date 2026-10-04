/**
 * High-Frequency Dual-Channel Micro-ECG & Bio-Nanogrid Oscilloscope
 * Renders 60Hz real-time action potential conduction across the scar border zone.
 * Compares native fragmented ischemic conduction vs shielded PEDOT:PSS nanogrid bridge.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Radio, Zap, Shield, Play, Pause, RefreshCw, ZoomIn, Info } from 'lucide-react';
import { CellularSensorMetrics, NanogridPacingState } from '../types/bdcmr';

interface MicroECGCanvasProps {
  cellular: CellularSensorMetrics;
  pacing: NanogridPacingState;
}

export const MicroECGCanvas: React.FC<MicroECGCanvasProps> = ({ cellular, pacing }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gain, setGain] = useState<number>(1.0);
  const [speed, setSpeed] = useState<'25' | '50'>('25');
  const [showExplanation, setShowExplanation] = useState(false);

  // Oscilloscope ring buffer
  const bufferLength = 800;
  const nativeBuffer = useRef<number[]>(new Array(bufferLength).fill(0));
  const shieldedBuffer = useRef<number[]>(new Array(bufferLength).fill(0));
  const sweepIndex = useRef<number>(0);

  // Ingest real-time values into ring buffers
  useEffect(() => {
    if (isPaused) return;
    const idx = sweepIndex.current;
    nativeBuffer.current[idx] = cellular.microECGNativeMv;
    shieldedBuffer.current[idx] = cellular.microECGShieldedMv;
    sweepIndex.current = (idx + 1) % bufferLength;
  }, [cellular.microECGNativeMv, cellular.microECGShieldedMv, isPaused]);

  // Canvas render loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Dark clinical CRT background
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);

      // Draw ECG millimeter grid
      ctx.lineWidth = 0.5;
      const gridStep = 18;
      
      // Minor grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.beginPath();
      for (let x = 0; x < width; x += gridStep) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Major grid lines (every 5 steps)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      ctx.beginPath();
      for (let x = 0; x < width; x += gridStep * 5) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridStep * 5) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Split canvas into two leads:
      // Lead 1: Native Unshielded Infarct Zone (top half)
      // Lead 2: Bio-Nanogrid Bridged Action Potential (bottom half)
      const lead1MidY = height * 0.28;
      const lead2MidY = height * 0.72;

      // Channel baseline dividers
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, height * 0.5);
      ctx.lineTo(width, height * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      const pointsCount = nativeBuffer.current.length;
      const stepX = width / pointsCount;
      const currentIdx = sweepIndex.current;

      // Render Lead 1: Native Infarct (Crimson/Amber)
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#f43f5e'; // rose-500
      ctx.shadowColor = 'rgba(244, 63, 94, 0.4)';
      ctx.shadowBlur = 6;
      ctx.beginPath();

      for (let i = 0; i < pointsCount; i++) {
        // Skip small gap ahead of sweep head
        if (Math.abs(i - currentIdx) < 4) continue;
        const x = i * stepX;
        const val = nativeBuffer.current[i] * gain;
        const y = lead1MidY - val * 45;
        if (i === 0 || Math.abs(i - currentIdx) === 4) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Render Lead 2: Shielded Nanogrid (Bright Cyan/Teal)
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#14b8a6'; // teal-500
      ctx.shadowColor = 'rgba(20, 184, 166, 0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      for (let i = 0; i < pointsCount; i++) {
        if (Math.abs(i - currentIdx) < 4) continue;
        const x = i * stepX;
        const val = shieldedBuffer.current[i] * gain;
        const y = lead2MidY - val * 45;
        if (i === 0 || Math.abs(i - currentIdx) === 4) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Sweeping beam head vertical cursor
      const cursorX = currentIdx * stepX;
      const grad = ctx.createLinearGradient(cursorX - 25, 0, cursorX, 0);
      grad.addColorStop(0, 'rgba(45, 212, 191, 0)');
      grad.addColorStop(1, 'rgba(45, 212, 191, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(cursorX - 25, 0, 25, height);

      ctx.strokeStyle = 'rgba(45, 212, 191, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, height);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gain, speed]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
      {/* Oscilloscope Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Micro-ECG Oscilloscope & Conduction Bridge Telemetry
            </h3>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-slate-400 hover:text-slate-200 transition"
              title="Electrophysiology background"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Sampling: 1,000 Hz</span>
            <span aria-hidden="true">·</span>
            <span>Sweep: {speed} mm/s</span>
            <span aria-hidden="true">·</span>
            <span>Gain: {gain}x (10mm/mV)</span>
          </div>
        </div>

        {/* Lead Legend & Quick Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Lead I: Native Scar (Fragmented QRS / Re-entry risk)</span>
          </div>
          <div className="flex items-center gap-1.5 text-teal-400">
            <span className="h-2 w-2 rounded-full bg-teal-400" />
            <span>Lead II: Nanogrid Bridged (Synchronized Action Potential)</span>
          </div>
        </div>

        {/* Oscilloscope Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition flex items-center gap-1 ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            <span>{isPaused ? 'Resume' : 'Freeze'}</span>
          </button>

          <button
            onClick={() => setGain((prev) => (prev === 1.0 ? 1.5 : prev === 1.5 ? 0.75 : 1.0))}
            className="px-2.5 py-1 text-xs font-medium rounded text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            <ZoomIn className="h-3 w-3" />
            <span>{gain}x</span>
          </button>

          <button
            onClick={() => setSpeed((prev) => (prev === '25' ? '50' : '25'))}
            className="px-2.5 py-1 text-xs font-mono rounded text-slate-400 hover:text-white transition"
          >
            {speed} mm/s
          </button>
        </div>
      </div>

      {showExplanation && (
        <div className="my-3 rounded-lg border border-teal-500/20 bg-teal-950/20 p-3 text-xs text-slate-300 leading-relaxed">
          <div className="font-semibold text-teal-300 mb-1">
            Section 2.2 Mechanism: Bio-Integrated Conductive Nanogrid Anti-Arrhythmia Shield
          </div>
          Dense collagenous scars exhibit high electrical resistivity and conduction delays (velocity &lt; 0.20 m/s), triggering fatal ventricular re-entry loops. The micro-injectable PEDOT:PSS / graphene mesh intertwines with myofibroblasts, acting as an artificial fast-conduction pathway (velocity &gt; 0.70 m/s) that restores physiological QRS synchrony and suppresses arrhythmogenic ectopic pacemakers during epigenetic cell reprogramming.
        </div>
      )}

      {/* High-Performance Canvas */}
      <div className="relative mt-3 rounded-lg overflow-hidden border border-slate-800/80">
        <canvas
          ref={canvasRef}
          width={800}
          height={240}
          className="w-full h-56 block bg-slate-950 cursor-crosshair"
        />

        {/* Oscilloscope On-Screen Overlay Telemetry */}
        <div className="absolute top-2.5 left-3 text-[11px] font-mono pointer-events-none space-y-1">
          <div className="text-rose-400/90 bg-slate-950/70 px-1.5 py-0.5 rounded border border-rose-500/20 inline-block">
            NATIVE DELAY: 148 ms · Conduction Block Present
          </div>
        </div>

        <div className="absolute bottom-2.5 left-3 text-[11px] font-mono pointer-events-none space-y-1">
          <div className="text-teal-300/90 bg-slate-950/70 px-1.5 py-0.5 rounded border border-teal-500/20 inline-block">
            NANOGRID BRIDGED: 38 ms · Velocity: {pacing.conductionVelocityMs.toFixed(2)} m/s · Re-entry Shield: {pacing.reentrySuppressionRate.toFixed(1)}%
          </div>
        </div>

        <div className="absolute bottom-2.5 right-3 text-[11px] font-mono text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
          16/16 Electrodes Pacing Synchronized
        </div>
      </div>

      {/* Sub-threshold Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/70 text-xs">
        <div>
          <div className="text-slate-400">Nanogrid Conduction Velocity</div>
          <div className="text-base font-semibold text-teal-300 font-mono">
            {pacing.conductionVelocityMs.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">m/s</span>
          </div>
          <div className="text-[11px] text-emerald-400">Normal Range: 0.65 - 0.85</div>
        </div>

        <div>
          <div className="text-slate-400">Sub-threshold Current</div>
          <div className="text-base font-semibold text-slate-100 font-mono">
            {pacing.subthresholdCurrentMA.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">mA</span>
          </div>
          <div className="text-[11px] text-slate-400">Pulse Width: {pacing.pulseWidthMs} ms</div>
        </div>

        <div>
          <div className="text-slate-400">Re-Entry Suppression Rate</div>
          <div className="text-base font-semibold text-emerald-400 font-mono">
            {pacing.reentrySuppressionRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-teal-400">Arrhythmia Shield: Locked</div>
        </div>

        <div>
          <div className="text-slate-400">Mesh Impedance</div>
          <div className="text-base font-semibold text-slate-100 font-mono">
            {pacing.impedanceOhms}{' '}
            <span className="text-xs font-normal text-slate-400">Ω</span>
          </div>
          <div className="text-[11px] text-slate-400">PEDOT:PSS Hydrogel</div>
        </div>
      </div>
    </div>
  );
};
