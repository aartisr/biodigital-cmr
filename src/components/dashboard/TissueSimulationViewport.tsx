/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Tissue Simulation Viewport
 * 2D anatomical cross-section of the left ventricular myocardium
 * displaying healthy myocardium, infarct border zone, dense fibrotic scar,
 * and overlaid soft bioelectronic hydrogel mesh with multi-physics layers.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Eye, Layers } from 'lucide-react';
import { TissueTensorPoint } from '../../types/bdcmr';
import { generateTissueTensorField } from '../../services/qsre/tensorDeformationField';

interface TissueSimulationViewportProps {
  simulationTimeMs: number;
  rescueProgressPercent: number;
  isBioMeshActive: boolean;
  quantumFluxPicoAmps: number;
}

export const TissueSimulationViewport: React.FC<TissueSimulationViewportProps> = ({
  simulationTimeMs,
  rescueProgressPercent,
  isBioMeshActive,
  quantumFluxPicoAmps,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Layer visibility toggles
  const [showWavefront, setShowWavefront] = useState(true);
  const [showTensorEllipses, setShowTensorEllipses] = useState(true);
  const [showQuantumFlux, setShowQuantumFlux] = useState(true);
  const [showCalciumSparks, setShowCalciumSparks] = useState(false);

  // Selected tissue inspection point
  const [selectedPoint, setSelectedPoint] = useState<TissueTensorPoint | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.44;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw myocardial ventricular wall background (Myocardium arc)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#F8FAFC'; // Remote tissue baseline
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#CBD5E1';
    ctx.stroke();

    // 2. Draw Remote Healthy Myocardium (outer band)
    const healthyGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.4, centerX, centerY, radius);
    healthyGradient.addColorStop(0, '#E2E8F0');
    healthyGradient.addColorStop(1, '#DC262608'); // subtle vascular tint
    ctx.fillStyle = healthyGradient;
    ctx.fill();

    // 3. Draw Ischemic Border Zone (annulus around scar)
    const borderRadius = radius * 0.65;
    const borderGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.25, centerX, centerY, borderRadius);
    borderGradient.addColorStop(0, '#FEF3C7'); // Ischemic pale yellow-amber
    borderGradient.addColorStop(1, '#FFFFFF00');
    ctx.beginPath();
    ctx.arc(centerX, centerY, borderRadius, 0, Math.PI * 2);
    ctx.fillStyle = borderGradient;
    ctx.fill();

    // 4. Draw Dense Fibrotic Scar Core
    const scarRadius = radius * 0.32;
    ctx.beginPath();
    ctx.arc(centerX, centerY, scarRadius, 0, Math.PI * 2);
    // As regeneration proceeds, scar transitions from gray necrotic collagen to viable pinkish hue
    const scarFill = rescueProgressPercent > 60 ? '#FEE2E2' : '#94A3B8';
    ctx.fillStyle = scarFill;
    ctx.fill();
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.0;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Draw Soft Bioelectronic Hydrogel Patch Overlay
    if (isBioMeshActive) {
      const patchRadius = radius * 0.48;
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, patchRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(14, 165, 233, 0.08)'; // Light sky blue hydrogel matrix
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#0284C7';
      ctx.stroke();

      // Conductive Nanofiber Grid (PEDOT:PSS / CNT pattern)
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
      ctx.lineWidth = 1.0;
      const numLines = 8;
      for (let i = -numLines; i <= numLines; i++) {
        const offset = (i / numLines) * patchRadius;
        const halfChord = Math.sqrt(Math.max(0, patchRadius * patchRadius - offset * offset));
        // Horizontal mesh lines
        ctx.beginPath();
        ctx.moveTo(centerX - halfChord, centerY + offset);
        ctx.lineTo(centerX + halfChord, centerY + offset);
        ctx.stroke();
        // Vertical mesh lines
        ctx.beginPath();
        ctx.moveTo(centerX + offset, centerY - halfChord);
        ctx.lineTo(centerX + offset, centerY + halfChord);
        ctx.stroke();
      }

      // Micro-electrode nodes
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const ex = centerX + Math.cos(angle) * (patchRadius * 0.75);
        const ey = centerY + Math.sin(angle) * (patchRadius * 0.75);
        ctx.beginPath();
        ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#0284C7';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 6. Layer: Electrical Wavefront Propagation
    if (showWavefront) {
      // Wave emanates from top-left sinus rhythm and sweeps across tissue
      const wavePhase = (simulationTimeMs % 800) / 800; // 0 to 1
      const waveDist = Math.max(0, wavePhase * (radius * 2.2));
      
      ctx.save();
      const originX = centerX - radius * 0.8;
      const originY = centerY - radius * 0.8;

      if (waveDist > 2) {
        ctx.beginPath();
        // Wavefront is an arc propagating across the cross-section
        ctx.arc(originX, originY, waveDist, 0, Math.PI / 2);
        ctx.strokeStyle = '#0D9488'; // Teal wavefront
        ctx.lineWidth = 3.0;
        ctx.stroke();
      }

      // Glow effect behind wavefront
      if (waveDist > 12) {
        ctx.beginPath();
        ctx.arc(originX, originY, waveDist - 8, 0, Math.PI / 2);
        ctx.strokeStyle = 'rgba(13, 148, 136, 0.25)';
        ctx.lineWidth = 12.0;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 7. Layer: Metric Tensor Ellipses
    if (showTensorEllipses) {
      const tensorPoints = generateTissueTensorField(7, isBioMeshActive);
      ctx.save();
      tensorPoints.forEach((pt) => {
        const px = centerX + pt.x * (radius * 0.85);
        const py = centerY + pt.y * (radius * 0.85);

        // Ellipse axes derived from metric eigenvalues
        const a = Math.max(0.5, 12 / Math.sqrt(Math.max(0.01, pt.metric.g11)));
        const b = Math.max(0.5, 12 / Math.sqrt(Math.max(0.01, pt.metric.g22)));
        const angle = pt.geodesicDeviationAngleRad;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, a, b, 0, 0, Math.PI * 2);
        ctx.strokeStyle = pt.zone === 'infarct_core' ? '#64748B' : pt.zone === 'border_zone' ? '#D97706' : '#2563EB';
        ctx.lineWidth = 1.0;
        ctx.stroke();
        ctx.restore();
      });
      ctx.restore();
    }

    // 8. Layer: Quantum Electron Tunneling Hotspots
    if (showQuantumFlux && isBioMeshActive && quantumFluxPicoAmps > 0) {
      ctx.save();
      const numHotspots = 12;
      for (let h = 0; h < numHotspots; h++) {
        const seed = (simulationTimeMs * 0.002 + h * 1.618) % (Math.PI * 2);
        const r = (scarRadius * 0.4) + ((h % 4) / 4) * (scarRadius * 0.8);
        const hx = centerX + Math.cos(seed) * r;
        const hy = centerY + Math.sin(seed) * r;

        const pulse = 0.5 + 0.5 * Math.sin(simulationTimeMs * 0.01 + h);
        const pulseRadius = Math.max(0.5, 2 + pulse * 4);
        ctx.beginPath();
        ctx.arc(hx, hy, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${0.4 * pulse})`;
        ctx.fill();
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 9. Layer: Calcium Sparks
    if (showCalciumSparks) {
      ctx.save();
      const numSparks = 16;
      for (let s = 0; s < numSparks; s++) {
        const angle = (s / numSparks) * Math.PI * 2 + simulationTimeMs * 0.001;
        const r = radius * 0.45 + (Math.sin(s * 7) * 20);
        const sx = centerX + Math.cos(angle) * r;
        const sy = centerY + Math.sin(angle) * r;

        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B'; // Amber spark
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
  }, [
    simulationTimeMs,
    rescueProgressPercent,
    isBioMeshActive,
    quantumFluxPicoAmps,
    showWavefront,
    showTensorEllipses,
    showQuantumFlux,
    showCalciumSparks,
  ]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(canvas.width, canvas.height) * 0.44;

    const clickX = ((e.clientX - rect.left) * (canvas.width / rect.width) - cx) / (r * 0.85);
    const clickY = ((e.clientY - rect.top) * (canvas.height / rect.height) - cy) / (r * 0.85);

    const tensorPoints = generateTissueTensorField(7, isBioMeshActive);
    // Find closest tensor point
    let closest = tensorPoints[0];
    let minDist = 999;
    tensorPoints.forEach((p) => {
      const d = Math.hypot(p.x - clickX, p.y - clickY);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    });

    setSelectedPoint(closest);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
      {/* Header & Layer Toggles */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-slate-700 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Anatomical Myocardial Cross-Section & Multi-Physics Overlays
            </h3>
            <p className="text-xs text-slate-500">
              Interactive left ventricular wall: Remote tissue, border zone, necrotic scar, and soft bioelectronic patch
            </p>
          </div>
        </div>

        {/* Toggle Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowWavefront(!showWavefront)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              showWavefront
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-500 hover:text-slate-800 bg-slate-100'
            }`}
          >
            <Eye className="w-3 h-3 inline mr-1" />
            Wavefront
          </button>
          <button
            onClick={() => setShowTensorEllipses(!showTensorEllipses)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              showTensorEllipses
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'text-slate-500 hover:text-slate-800 bg-slate-100'
            }`}
          >
            <Eye className="w-3 h-3 inline mr-1" />
            Tensor Ellipses
          </button>
          <button
            onClick={() => setShowQuantumFlux(!showQuantumFlux)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              showQuantumFlux
                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                : 'text-slate-500 hover:text-slate-800 bg-slate-100'
            }`}
          >
            <Eye className="w-3 h-3 inline mr-1" />
            Quantum Flux
          </button>
          <button
            onClick={() => setShowCalciumSparks(!showCalciumSparks)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              showCalciumSparks
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'text-slate-500 hover:text-slate-800 bg-slate-100'
            }`}
          >
            <Eye className="w-3 h-3 inline mr-1" />
            Ca²⁺ Sparks
          </button>
        </div>
      </div>

      {/* Main Canvas & Micro-HUD */}
      <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={520}
          height={380}
          onClick={handleCanvasClick}
          className="cursor-crosshair max-w-full h-auto block"
        />

        {/* Legend Overlay */}
        <div className="absolute bottom-2 left-2 bg-white/95 border border-slate-200 rounded p-2 text-[11px] font-mono text-slate-600 flex flex-col gap-1 shadow-xs pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
            <span>Necrotic Scar Core</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" />
            <span>Ischemic Border Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
            <span>Remote Viable Myocardium</span>
          </div>
          {isBioMeshActive && (
            <div className="flex items-center gap-1.5 text-sky-700">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              <span>Bioelectronic Hydrogel Patch</span>
            </div>
          )}
        </div>

        {/* Interactive Point Inspector HUD */}
        {selectedPoint && (
          <div className="absolute top-2 right-2 bg-white/95 border border-slate-200 rounded p-2 text-xs font-mono text-slate-800 shadow-md flex flex-col gap-1 min-w-[210px]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <strong className="text-slate-900">PROBED TISSUE ELEMENT</strong>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-slate-400 hover:text-slate-700 font-bold ml-2"
              >
                ×
              </button>
            </div>
            <div>
              Zone:{' '}
              <span className="font-semibold capitalize text-sky-700">
                {selectedPoint.zone.replace('_', ' ')}
              </span>
            </div>
            <div>
              Metric Det: <span className="tabular-nums">{selectedPoint.metric.determinant.toFixed(2)}</span>
            </div>
            <div>
              Anisotropy: <span className="tabular-nums">{selectedPoint.anisotropicConductivityRatio.toFixed(2)}</span>
            </div>
            <div>
              Ricci Curv R: <span className="tabular-nums">{selectedPoint.metric.ricciScalar.toFixed(2)}</span>
            </div>
            <div>
              Wall Stress: <span className="tabular-nums">{selectedPoint.mechanicalStrainKPa.toFixed(0)}</span> kPa
            </div>
          </div>
        )}
      </div>

      {/* Anatomical Summary Bar */}
      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
        <div>
          Click any region in the ventricular cross-section to probe local Riemannian metric tensors and wall stress.
        </div>
        <div className="text-slate-700 font-medium whitespace-nowrap">
          Viability Progress: <strong className="text-slate-900 font-mono tabular-nums">{rescueProgressPercent}%</strong>
        </div>
      </div>
    </div>
  );
};
