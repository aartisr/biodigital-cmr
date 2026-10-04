/**
 * Digital Twin 4D Cardiac Remodeling & Border Zone Target Map
 * Visualizes left ventricular scar core, myofibroblast transition border zone,
 * 16-channel bio-nanogrid mesh electrodes, and LNP micro-infusion delivery cannulas.
 */

import React, { useState } from 'react';
import { Eye, Layers, Zap, Syringe, Compass, AlertCircle, Sparkles, Heart, Flame, Activity, Sliders, MapPin, Box } from 'lucide-react';
import { CellularSensorMetrics, EpigeneticDosingState, NanogridPacingState, PatientProfile, PatientVitals } from '../types/bdcmr';
import { Real3DHeartCanvas } from './Real3DHeartCanvas';

interface DigitalTwinProps {
  patient: PatientProfile;
  cellular: CellularSensorMetrics;
  dosing: EpigeneticDosingState;
  pacing: NanogridPacingState;
  vitals?: PatientVitals;
  onOpenHeartVisualizer?: () => void;
}

interface RegionDetail {
  name: string;
  type: 'SCAR_CORE' | 'BORDER_ZONE' | 'HEALTHY_MYOCARDIUM' | 'NANOGRID_NODE' | 'TOPOGRAPHICAL_CONTOUR';
  stiffnessKPa: number;
  icmConversion: number;
  conductionVelocity: number;
  connexin43Expression: string;
  actionPotentialDelay: number;
  remodelingStatus: string;
  regenerativeIntensityUmDay?: number;
  lnpUptakePmolMg?: number;
}

export const DigitalTwinRemodeling: React.FC<DigitalTwinProps> = ({
  patient,
  cellular,
  dosing,
  pacing,
  vitals,
  onOpenHeartVisualizer,
}) => {
  const [dimensionMode, setDimensionMode] = useState<'2D' | '3D'>('3D');
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'NANOGRID' | 'LNP_DIFFUSION' | 'STRESS_TENSOR'>('ALL');
  const [showTopographicalHeatmap, setShowTopographicalHeatmap] = useState<boolean>(true);
  const [heatmapMetric, setHeatmapMetric] = useState<'REPAIR_INTENSITY' | 'LNP_FLUX' | 'WALL_COMPLIANCE'>('REPAIR_INTENSITY');
  const [hoveredIsoband, setHoveredIsoband] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(7);
  const [selectedRegion, setSelectedRegion] = useState<RegionDetail>({
    name: 'Apical Border Zone 7 (Transition Matrix)',
    type: 'BORDER_ZONE',
    stiffnessKPa: cellular.youngsModulusKPa,
    icmConversion: patient.iCMConversionRate,
    conductionVelocity: pacing.conductionVelocityMs,
    connexin43Expression: 'Elevated (De Novo Intercalated Discs)',
    actionPotentialDelay: 42,
    remodelingStatus: 'Active iCM reprogramming with synchronous pacing entrainment',
    regenerativeIntensityUmDay: 1.62,
    lnpUptakePmolMg: 195,
  });

  // 16 Nanogrid Electrode Node positions across the apical scar and border zone
  const electrodeNodes = [
    { id: 1, x: 190, y: 140, zone: 'Healthy Border', status: 'ACTIVE_PACE', signal: 0.88 },
    { id: 2, x: 230, y: 130, zone: 'Healthy Border', status: 'ACTIVE_PACE', signal: 0.91 },
    { id: 3, x: 270, y: 140, zone: 'Transition Zone', status: 'BRIDGING', signal: 0.74 },
    { id: 4, x: 310, y: 155, zone: 'Transition Zone', status: 'BRIDGING', signal: 0.76 },
    { id: 5, x: 170, y: 185, zone: 'Transition Zone', status: 'BRIDGING', signal: 0.72 },
    { id: 6, x: 215, y: 180, zone: 'Dense Scar Edge', status: 'BRIDGING', signal: 0.69 },
    { id: 7, x: 260, y: 185, zone: 'Dense Scar Core', status: 'REPROGRAMMING', signal: 0.64 },
    { id: 8, x: 305, y: 195, zone: 'Transition Zone', status: 'BRIDGING', signal: 0.71 },
    { id: 9, x: 155, y: 235, zone: 'Healthy Margin', status: 'ACTIVE_PACE', signal: 0.94 },
    { id: 10, x: 200, y: 230, zone: 'Scar Core', status: 'REPROGRAMMING', signal: 0.61 },
    { id: 11, x: 245, y: 235, zone: 'Scar Core Center', status: 'REPROGRAMMING', signal: 0.58 },
    { id: 12, x: 290, y: 240, zone: 'Transition Margin', status: 'BRIDGING', signal: 0.73 },
    { id: 13, x: 180, y: 275, zone: 'Transition Margin', status: 'BRIDGING', signal: 0.77 },
    { id: 14, x: 225, y: 280, zone: 'Scar Apex Core', status: 'REPROGRAMMING', signal: 0.65 },
    { id: 15, x: 265, y: 285, zone: 'Apical Border', status: 'BRIDGING', signal: 0.79 },
    { id: 16, x: 220, y: 320, zone: 'Extreme Apex', status: 'ACTIVE_PACE', signal: 0.84 },
  ];

  const handleSelectElectrode = (node: typeof electrodeNodes[0]) => {
    setSelectedNode(node.id);
    const isCore = node.zone.includes('Scar Core');
    setSelectedRegion({
      name: `Nanogrid Electrode Node #${node.id} (${node.zone})`,
      type: 'NANOGRID_NODE',
      stiffnessKPa: isCore ? cellular.youngsModulusKPa + 4.2 : cellular.youngsModulusKPa - 2.8,
      icmConversion: isCore ? patient.iCMConversionRate - 8.5 : patient.iCMConversionRate + 6.2,
      conductionVelocity: pacing.conductionVelocityMs * node.signal,
      connexin43Expression: isCore ? 'Emerging (+38% baseline)' : 'High (+84% baseline)',
      actionPotentialDelay: Math.round(36 / node.signal),
      remodelingStatus: isCore
        ? 'High LNP uptake with active fibroblast-to-iCM lineage conversion'
        : 'Synchronous electromechanical entrainment with native myocardium',
      regenerativeIntensityUmDay: isCore ? 1.78 : 1.15,
      lnpUptakePmolMg: isCore ? 218 : 142,
    });
  };

  const handleSelectContourTier = (
    tierName: string,
    intensity: number,
    lnpUptake: number,
    stiffness: number,
    icm: number,
    status: string
  ) => {
    setSelectedNode(null);
    setSelectedRegion({
      name: `Topographical Contour: ${tierName}`,
      type: 'TOPOGRAPHICAL_CONTOUR',
      stiffnessKPa: stiffness,
      icmConversion: icm,
      conductionVelocity: pacing.conductionVelocityMs * (intensity > 1.4 ? 0.75 : 0.88),
      connexin43Expression: intensity > 1.4 ? 'Peak De Novo Intercalated Disc Density' : 'Moderate Infiltration',
      actionPotentialDelay: Math.round(52 - intensity * 10),
      remodelingStatus: status,
      regenerativeIntensityUmDay: intensity,
      lnpUptakePmolMg: lnpUptake,
    });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
      {/* Header with Layer Switchers */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Digital Twin 4D Cardiac Remodeling & Nanogrid Topography
            </h3>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Phase A/B Target Mapping · {patient.infarctLocation} · 4D Flow MRI & Speckle-Tracking Registration
          </div>
        </div>

        {/* Controls: Full-screen Heart, 2D/3D Toggle & Layer Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 2D / 3D Segmented Switch */}
          <div className="flex items-center rounded-lg border border-teal-500/40 bg-slate-950 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setDimensionMode('2D')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                dimensionMode === '2D'
                  ? 'bg-teal-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>2D Planar Map</span>
            </button>
            <button
              onClick={() => setDimensionMode('3D')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                dimensionMode === '3D'
                  ? 'bg-teal-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>Real 3D Heart</span>
            </button>
          </div>

          {onOpenHeartVisualizer && (
            <button
              onClick={onOpenHeartVisualizer}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 transition"
              title="Open full-screen beating human heart"
            >
              <Heart className="h-3.5 w-3.5 fill-rose-500 animate-pulse" />
              <span>Full-Screen Beating Heart</span>
            </button>
          )}

          {/* 2D Topographical Heatmap Toggle (shown only in 2D mode) */}
          {dimensionMode === '2D' && (
            <>
              <button
                onClick={() => setShowTopographicalHeatmap(!showTopographicalHeatmap)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                  showTopographicalHeatmap
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle 2D Topographical Heatmap Contour Overlay"
              >
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>2D Topo Heatmap</span>
                {showTopographicalHeatmap && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              {/* Topo Metric Dropdown */}
              {showTopographicalHeatmap && (
                <select
                  value={heatmapMetric}
                  onChange={(e) => setHeatmapMetric(e.target.value as any)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] font-mono text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="REPAIR_INTENSITY">Repair Intensity (μm/day)</option>
                  <option value="LNP_FLUX">LNP Uptake Flux (pmol/mg)</option>
                  <option value="WALL_COMPLIANCE">Compliance Softening (%/hr)</option>
                </select>
              )}
            </>
          )}

          {/* Layer Filters (shown in 2D mode) */}
          {dimensionMode === '2D' && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveLayer('ALL')}
                className={`px-2.5 py-1 font-medium rounded transition ${
                  activeLayer === 'ALL'
                    ? 'bg-slate-800 text-teal-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Layers
              </button>
              <button
                onClick={() => setActiveLayer('NANOGRID')}
                className={`px-2.5 py-1 font-medium rounded transition ${
                  activeLayer === 'NANOGRID'
                    ? 'bg-slate-800 text-teal-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nanogrid Mesh (16-ch)
              </button>
              <button
                onClick={() => setActiveLayer('LNP_DIFFUSION')}
                className={`px-2.5 py-1 font-medium rounded transition ${
                  activeLayer === 'LNP_DIFFUSION'
                    ? 'bg-slate-800 text-teal-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                LNP Diffusion
              </button>
              <button
                onClick={() => setActiveLayer('STRESS_TENSOR')}
                className={`px-2.5 py-1 font-medium rounded transition ${
                  activeLayer === 'STRESS_TENSOR'
                    ? 'bg-slate-800 text-teal-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Stress Tensors
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3">
        {/* Left 7 cols: 3D WebGL Real Patient Heart or 2D Anatomical Cross-Section */}
        <div className="lg:col-span-7 relative flex items-center justify-center bg-slate-950 rounded-lg border border-slate-800/80 p-0 min-h-[380px] overflow-hidden">
          {dimensionMode === '3D' ? (
            <div className="w-full h-full min-h-[380px]">
              <Real3DHeartCanvas
                patient={patient}
                vitals={
                  vitals || {
                    heartRateBpm: 72,
                    systolicBp: 118,
                    diastolicBp: 76,
                    meanArterialPressure: 90,
                    spO2Percent: 98,
                    cardiacOutputLMin: 4.8,
                    cardiacIndexLMinM2: 2.6,
                    serumPotassiumMmolL: 4.2,
                    cardiacTroponinNgMl: 0.08,
                    temperatureCelsius: 37.0,
                  }
                }
                cellular={cellular}
                dosing={dosing}
                pacing={pacing}
                height={380}
                selectedNodeId={selectedNode}
                onSelectNode={(nodeId) => {
                  const node = electrodeNodes.find((n) => n.id === nodeId);
                  if (node) handleSelectElectrode(node);
                }}
              />
            </div>
          ) : (
            <div className="w-full p-3 flex items-center justify-center">
              <svg
                viewBox="0 0 460 380"
                className="w-full h-auto max-h-[380px] drop-shadow-2xl select-none"
              >
            <defs>
              {/* Healthy Myocardium Gradient */}
              <radialGradient id="healthyMyoGrad" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#0f766e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#042f2e" stopOpacity="0.8" />
              </radialGradient>

              {/* Transition Border Zone Gradient */}
              <radialGradient id="borderZoneGrad" cx="52%" cy="58%" r="45%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#78350f" stopOpacity="0.6" />
              </radialGradient>

              {/* Dense Scar Core Gradient */}
              <radialGradient id="scarCoreGrad" cx="52%" cy="62%" r="35%">
                <stop offset="0%" stopColor="#e11d48" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#4c0519" stopOpacity="0.75" />
              </radialGradient>

              {/* LNP Infusion Micro-Diffusion Gradient */}
              <radialGradient id="lnpDiffusionGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#0284c7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
              </radialGradient>

              {/* 2D Topographical Elevation Gradients */}
              <radialGradient id="topoPeakGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
                <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0.6" />
              </radialGradient>

              <radialGradient id="topoHighGrad" cx="52%" cy="52%" r="55%">
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.45" />
              </radialGradient>

              <radialGradient id="topoMedGrad" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.25" />
              </radialGradient>

              <radialGradient id="topoLowGrad" cx="50%" cy="40%" r="70%">
                <stop offset="0%" stopColor="#0369a1" stopOpacity="0.35" />
                <stop offset="80%" stopColor="#1e1b4b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
              </radialGradient>
            </defs>

            {/* Left Ventricle Outer Cavity Wall Silhouette */}
            <path
              d="M 120 40 C 220 20, 260 20, 360 40 C 410 120, 390 260, 240 370 C 90 260, 70 120, 120 40 Z"
              fill="url(#healthyMyoGrad)"
              stroke="#0d9488"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              className="opacity-70"
            />

            {/* Left Ventricle Blood Pool / Lumen */}
            <path
              d="M 155 70 C 220 55, 260 55, 325 70 C 355 130, 335 220, 240 280 C 145 220, 125 130, 155 70 Z"
              fill="#020617"
              stroke="#1e293b"
              strokeWidth="1.2"
            />

            {/* Transition Border Zone (Active Epigenetic Reprogramming Area) */}
            <path
              d="M 160 120 C 240 100, 280 110, 330 140 C 340 200, 310 270, 235 345 C 160 270, 130 190, 160 120 Z"
              fill="url(#borderZoneGrad)"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="cursor-pointer hover:opacity-90 transition"
              onClick={() => {
                setSelectedRegion({
                  name: 'Target Border Zone (Myofibroblast Matrix)',
                  type: 'BORDER_ZONE',
                  stiffnessKPa: cellular.youngsModulusKPa,
                  icmConversion: patient.iCMConversionRate,
                  conductionVelocity: pacing.conductionVelocityMs,
                  connexin43Expression: 'Elevated (+68% de novo gap junctions)',
                  actionPotentialDelay: 44,
                  remodelingStatus: 'Fibroblasts converting to synchronously contracting iCMs',
                });
              }}
            />

            {/* Dense Collagenous Scar Core (Apical Infarct Base) */}
            <path
              d="M 195 165 C 235 155, 265 160, 290 180 C 295 220, 275 260, 235 305 C 195 260, 175 220, 195 165 Z"
              fill="url(#scarCoreGrad)"
              stroke="#f43f5e"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-95 transition"
              onClick={() => {
                setSelectedRegion({
                  name: 'Dense Collagenous Scar Core (Initial Necrosis Zone)',
                  type: 'SCAR_CORE',
                  stiffnessKPa: cellular.youngsModulusKPa + 5.8,
                  icmConversion: Math.max(10, patient.iCMConversionRate - 12),
                  conductionVelocity: 0.28,
                  connexin43Expression: 'Developing (+24% baseline)',
                  actionPotentialDelay: 110,
                  remodelingStatus: 'Progressive softening via synthetic mRNA LNP uptake',
                });
              }}
            />

            {/* 2D Topographical Heatmap Isoband Contours Overlay */}
            {showTopographicalHeatmap && (
              <g id="topographical-heatmap-group" className="transition-opacity duration-300">
                {/* Contour Band 1 (Basal Myocardium: <0.6 μm/d) */}
                <path
                  d="M 130 65 C 220 40, 260 40, 350 65 C 390 135, 370 250, 240 360 C 110 250, 90 135, 130 65 Z"
                  fill="url(#topoLowGrad)"
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                  className="cursor-pointer hover:opacity-90 transition"
                  onMouseEnter={() => setHoveredIsoband('Basal Wall (<0.6 μm/d)')}
                  onMouseLeave={() => setHoveredIsoband(null)}
                  onClick={() =>
                    handleSelectContourTier(
                      'Basal-Mid Ventricular Contour (<0.6 μm/d)',
                      0.45,
                      65,
                      cellular.youngsModulusKPa - 3.5,
                      patient.iCMConversionRate + 14.5,
                      'Quiescent healthy host border zone with baseline physiological electromechanical coupling'
                    )
                  }
                />

                {/* Contour Band 2 (Transition Infiltration: 0.6 - 1.0 μm/d) */}
                <path
                  d="M 148 105 C 220 85, 280 90, 335 125 C 350 185, 325 255, 238 340 C 150 255, 125 180, 148 105 Z"
                  fill="url(#topoMedGrad)"
                  stroke="#2dd4bf"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  className="cursor-pointer hover:opacity-95 transition"
                  onMouseEnter={() => setHoveredIsoband('Outer Transition (0.6 - 1.0 μm/d)')}
                  onMouseLeave={() => setHoveredIsoband(null)}
                  onClick={() =>
                    handleSelectContourTier(
                      'Outer Transition Iso-contour (0.8 μm/d)',
                      0.84,
                      120,
                      cellular.youngsModulusKPa - 1.2,
                      patient.iCMConversionRate + 8.2,
                      'Early myofibroblast infiltration with nascent Connexin-43 intercalated disc assembly'
                    )
                  }
                />

                {/* Contour Band 3 (Active Reprogramming Wavefront: 1.0 - 1.4 μm/d) */}
                <path
                  d="M 165 140 C 230 120, 275 125, 315 155 C 325 205, 300 270, 236 322 C 170 268, 145 200, 165 140 Z"
                  fill="url(#topoHighGrad)"
                  stroke="#fbbf24"
                  strokeWidth="1.4"
                  strokeDasharray="4 2"
                  className="cursor-pointer hover:opacity-95 transition"
                  onMouseEnter={() => setHoveredIsoband('Wavefront (1.0 - 1.4 μm/d)')}
                  onMouseLeave={() => setHoveredIsoband(null)}
                  onClick={() =>
                    handleSelectContourTier(
                      'Border Zone Wavefront (1.2 μm/d)',
                      1.28,
                      185,
                      cellular.youngsModulusKPa + 1.8,
                      patient.iCMConversionRate,
                      'High transdifferentiation velocity; active alpha-cardiac actin (ACTC1) sarcomere formation'
                    )
                  }
                />

                {/* Contour Band 4 (Dense Core Softening: 1.4 - 1.8 μm/d) */}
                <path
                  d="M 190 170 C 230 155, 265 160, 290 185 C 295 225, 275 265, 235 300 C 195 260, 175 220, 190 170 Z"
                  fill="url(#topoPeakGrad)"
                  stroke="#f43f5e"
                  strokeWidth="1.8"
                  className="cursor-pointer hover:opacity-95 transition"
                  onMouseEnter={() => setHoveredIsoband('Epicenter Core (1.4 - 1.8 μm/d)')}
                  onMouseLeave={() => setHoveredIsoband(null)}
                  onClick={() =>
                    handleSelectContourTier(
                      'Epicenter Transdifferentiation Hotspot (1.6 μm/d)',
                      1.65,
                      240,
                      cellular.youngsModulusKPa + 4.6,
                      Math.max(15, patient.iCMConversionRate - 6.5),
                      'Maximum LNP micro-infusion flux and MMP-9 collagen turnover; targeted bio-nanogrid sub-threshold pacing bridging'
                    )
                  }
                />

                {/* Peak Core Epicenter Hotspot with animated pulse */}
                <circle
                  cx="235"
                  cy="225"
                  r="28"
                  fill="url(#topoPeakGrad)"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  className="animate-pulse opacity-90 cursor-pointer"
                  onClick={() =>
                    handleSelectContourTier(
                      'Apical Micro-Dosing Injection Core (1.8 μm/d)',
                      1.82,
                      280,
                      cellular.youngsModulusKPa + 5.2,
                      Math.max(12, patient.iCMConversionRate - 8.0),
                      'Focal trans-epicardial mRNA release site with peak synthetic transcription factor uptake'
                    )
                  }
                />

                {/* Topographical Elevation Isolines & Numeric Height Labels */}
                <g className="pointer-events-none select-none font-mono">
                  <text x="355" y="85" fill="#94a3b8" fontSize="8" fontWeight="bold">
                    0.4
                  </text>
                  <text x="340" y="125" fill="#38bdf8" fontSize="8" fontWeight="bold">
                    0.8
                  </text>
                  <text x="320" y="160" fill="#fbbf24" fontSize="8" fontWeight="bold">
                    1.2
                  </text>
                  <text x="295" y="195" fill="#f43f5e" fontSize="8" fontWeight="bold">
                    1.6
                  </text>
                  <text x="235" y="228" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                    1.8 PEAK
                  </text>
                </g>
              </g>
            )}

            {/* Layer: LNP Micro-Infusion Delivery Gradient */}
            {(activeLayer === 'ALL' || activeLayer === 'LNP_DIFFUSION') && (
              <>
                {/* Micro-cannula 1 */}
                <circle cx="215" cy="195" r="42" fill="url(#lnpDiffusionGrad)" />
                <line x1="165" y1="130" x2="215" y2="195" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="215" cy="195" r="3" fill="#38bdf8" />

                {/* Micro-cannula 2 */}
                <circle cx="255" cy="245" r="48" fill="url(#lnpDiffusionGrad)" />
                <line x1="315" y1="180" x2="255" y2="245" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="255" cy="245" r="3" fill="#38bdf8" />
              </>
            )}

            {/* Layer: Stress Tensor Vectors */}
            {(activeLayer === 'ALL' || activeLayer === 'STRESS_TENSOR') && (
              <g stroke="#e2e8f0" strokeWidth="1.2" opacity="0.6">
                {/* Circumferential strain vectors */}
                <path d="M 140 180 Q 240 210 340 180" fill="none" stroke="#38bdf8" strokeDasharray="3 3" />
                <path d="M 160 230 Q 240 250 320 230" fill="none" stroke="#38bdf8" strokeDasharray="3 3" />
                <text x="240" y="215" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  σ_systolic = {cellular.wallStressKPa} kPa · ε_circ = {cellular.wallStrainPercent}%
                </text>
              </g>
            )}

            {/* Layer: Conductive PEDOT:PSS Nanogrid Mesh & Conduction Lines */}
            {(activeLayer === 'ALL' || activeLayer === 'NANOGRID') && (
              <>
                {/* Inter-electrode Conductive Mesh Graphene Filaments */}
                <g stroke="#14b8a6" strokeWidth="1.4" opacity="0.75">
                  <line x1="190" y1="140" x2="230" y2="130" />
                  <line x1="230" y1="130" x2="270" y2="140" />
                  <line x1="270" y1="140" x2="310" y2="155" />
                  <line x1="190" y1="140" x2="215" y2="180" />
                  <line x1="230" y1="130" x2="260" y2="185" />
                  <line x1="270" y1="140" x2="305" y2="195" />
                  <line x1="170" y1="185" x2="215" y2="180" />
                  <line x1="215" y1="180" x2="260" y2="185" />
                  <line x1="260" y1="185" x2="305" y2="195" />
                  <line x1="170" y1="185" x2="155" y2="235" />
                  <line x1="215" y1="180" x2="200" y2="230" />
                  <line x1="260" y1="185" x2="245" y2="235" />
                  <line x1="305" y1="195" x2="290" y2="240" />
                  <line x1="155" y1="235" x2="200" y2="230" />
                  <line x1="200" y1="230" x2="245" y2="235" />
                  <line x1="245" y1="235" x2="290" y2="240" />
                  <line x1="200" y1="230" x2="180" y2="275" />
                  <line x1="245" y1="235" x2="225" y2="280" />
                  <line x1="290" y1="240" x2="265" y2="285" />
                  <line x1="180" y1="275" x2="225" y2="280" />
                  <line x1="225" y1="280" x2="265" y2="285" />
                  <line x1="225" y1="280" x2="220" y2="320" />
                </g>

                {/* 16 Micro-Electrodes */}
                {electrodeNodes.map((node) => {
                  const isSelected = selectedNode === node.id;
                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer transition-transform hover:scale-125"
                      onClick={() => handleSelectElectrode(node)}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? 6.5 : 4.5}
                        fill={isSelected ? '#38bdf8' : '#2dd4bf'}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                      {isSelected && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="11"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          className="animate-ping"
                        />
                      )}
                      <text
                        x={node.x}
                        y={node.y - 8}
                        fontSize="8"
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontFamily="monospace"
                        className="font-bold pointer-events-none"
                      >
                        {node.id}
                      </text>
                    </g>
                  );
                })}
              </>
            )}
          </svg>

          {/* Map Legend Overlay & Topographical Color Temperature Scale */}
          {showTopographicalHeatmap ? (
            <div className="absolute bottom-2.5 left-3 bg-slate-950/90 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1.5 shadow-xl backdrop-blur-sm max-w-[220px]">
              <div className="flex items-center justify-between font-sans font-semibold text-slate-200">
                <span className="flex items-center gap-1 text-amber-300">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>Topo Activity Map</span>
                </span>
                <span className="text-[10px] text-teal-300">
                  {hoveredIsoband || 'Δ = 0.4 μm/d'}
                </span>
              </div>

              {/* Continuous Elevation Temperature Gradient Bar */}
              <div className="space-y-0.5">
                <div className="h-2 w-full rounded bg-gradient-to-r from-blue-700 via-teal-500 via-yellow-400 to-rose-500 border border-slate-700" />
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>0.2 μm/d (Low)</span>
                  <span>1.0</span>
                  <span className="text-rose-400 font-bold">1.8 (Peak)</span>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 leading-tight">
                Click any contour ring to inspect local remodeling flux &amp; sarcomeric assembly.
              </div>
            </div>
          ) : (
            <div className="absolute bottom-2.5 left-3 bg-slate-950/85 p-2 rounded-md border border-slate-800 text-[11px] font-mono space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-slate-300">Dense Scar Core (Apical)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-slate-300">Border Zone (Target Myofibroblasts)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                <span className="text-slate-300">Nanogrid Mesh (16-Ch Bridged)</span>
              </div>
            </div>
          )}
            </div>
          )}
        </div>

        {/* Right 5 cols: Localized Histological & Electrophysiological Inspector */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 text-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                <span>Localized Target Inspector</span>
              </div>
              <span className="text-[11px] font-mono text-teal-300">
                {selectedNode ? `Node #${selectedNode}` : selectedRegion.type === 'TOPOGRAPHICAL_CONTOUR' ? 'Contour Iso-Band' : 'Regional'}
              </span>
            </div>

            <div className="mt-2.5 text-sm font-semibold text-slate-200">
              {selectedRegion.name}
            </div>
            <div className="text-xs text-slate-400 mt-1 leading-relaxed">
              {selectedRegion.remodelingStatus}
            </div>

            {/* Histological / Biophysical Metrics */}
            <div className="mt-3.5 space-y-2.5">
              {selectedRegion.regenerativeIntensityUmDay !== undefined && (
                <div className="flex items-center justify-between p-2 rounded bg-amber-500/10 border border-amber-500/30">
                  <span className="text-amber-300 flex items-center gap-1 font-medium">
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    <span>Regional Repair Intensity:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {selectedRegion.regenerativeIntensityUmDay.toFixed(2)} μm/day
                  </span>
                </div>
              )}

              {selectedRegion.lnpUptakePmolMg !== undefined && (
                <div className="flex items-center justify-between p-2 rounded bg-teal-500/10 border border-teal-500/30">
                  <span className="text-teal-300 flex items-center gap-1 font-medium">
                    <Syringe className="h-3.5 w-3.5 text-teal-400" />
                    <span>LNP Epigenetic Uptake:</span>
                  </span>
                  <span className="font-mono font-bold text-teal-300">
                    {selectedRegion.lnpUptakePmolMg} pmol/mg
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Local Young&apos;s Modulus (Stiffness):</span>
                <span className="font-mono font-semibold text-amber-300">
                  {selectedRegion.stiffnessKPa.toFixed(1)} kPa
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">iCM Lineage Conversion:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {selectedRegion.icmConversion.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Conduction Velocity:</span>
                <span className="font-mono font-semibold text-teal-300">
                  {selectedRegion.conductionVelocity.toFixed(2)} m/s
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Action Potential Delay:</span>
                <span className="font-mono font-semibold text-slate-200">
                  {selectedRegion.actionPotentialDelay} ms
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Connexin-43 Intercellular Discs:</span>
                <span className="font-mono text-teal-400 text-[11px]">
                  {selectedRegion.connexin43Expression}
                </span>
              </div>
            </div>
          </div>

          {/* LNP Cocktail Targeting Footnote */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="text-slate-300 font-medium">LNP Delivery Vector:</span>{' '}
            Fibroblast-targeted surface ligands directing {dosing.formulation} synthetic mRNA at{' '}
            <span className="font-mono text-teal-300">{dosing.infusionRateNlMin.toFixed(0)} nl/min</span>.
          </div>
        </div>
      </div>
    </div>
  );
};
