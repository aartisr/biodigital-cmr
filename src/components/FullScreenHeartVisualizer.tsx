/**
 * Full-Screen Real-Time & Historical Patient Heart Visualizer
 * Anatomical, dynamically beating human heart tailored for both laymen and clinicians.
 * Displays real-time contraction, scar shrinkage, nanogrid electrical bridging,
 * and an interactive 60-day historical regeneration timeline.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX,
  Layers,
  Activity,
  Heart,
  Calendar,
  CheckCircle,
  Zap,
  Info,
  ArrowRight,
  ShieldCheck,
  Box,
} from 'lucide-react';
import { PatientProfile, PatientVitals, CellularSensorMetrics, NanogridPacingState } from '../types/bdcmr';
import { Real3DHeartCanvas } from './Real3DHeartCanvas';

interface FullScreenHeartVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  vitals: PatientVitals;
  cellular: CellularSensorMetrics;
  pacing: NanogridPacingState;
}

export const FullScreenHeartVisualizer: React.FC<FullScreenHeartVisualizerProps> = ({
  isOpen,
  onClose,
  patient,
  vitals,
  cellular,
  pacing,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const twoDContractileRef = useRef<SVGGElement | null>(null);
  const [dimensionMode, setDimensionMode] = useState<'3D' | '2D'>('3D');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'LAYMAN' | 'CLINICAL'>('LAYMAN');
  const [timelineDay, setTimelineDay] = useState<number>(patient.postInfarcDay);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>('SCAR');
  const [isSystole, setIsSystole] = useState<boolean>(false);

  // Drive the 2D ventricle directly so the beat remains fluid without
  // re-rendering the full visualizer at display refresh rate. Great vessels
  // and atria are deliberately outside this group: they do not contract with
  // the ventricles in vivo.
  useEffect(() => {
    if (!isOpen || dimensionMode !== '2D') return;
    let animId: number;
    let prevSystole = false;
    const bpm = vitals.heartRateBpm || 72;
    const beatPeriodMs = (60 / bpm) * 1000;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = now - startTime;
      const phase = (elapsed % beatPeriodMs) / beatPeriodMs; // 0 to 1
      const smoothStep = (value: number) => value * value * (3 - 2 * value);
      const contraction = phase < 0.16
        ? 0
        : phase < 0.34
          ? smoothStep((phase - 0.16) / 0.18)
          : phase < 0.60
            ? 1 - smoothStep((phase - 0.34) / 0.26)
            : 0;
      const radialScale = 1 - contraction * 0.019;
      const longScale = 1 - contraction * 0.006;
      twoDContractileRef.current?.setAttribute(
        'transform',
        `translate(310 365) scale(${radialScale} ${longScale}) translate(-310 -365)`,
      );

      const currSystole = contraction > 0.55;
      if (currSystole !== prevSystole) {
        prevSystole = currSystole;
        setIsSystole(currSystole);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, dimensionMode, vitals.heartRateBpm]);

  // Audio heartbeat synth ("lub-dub")
  useEffect(() => {
    if (!isOpen || !soundEnabled) return;
    // Play subtle soft low frequency pulse on phase crossing
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const interval = setInterval(() => {
      if (ctx.state === 'suspended') ctx.resume();
      // Lub (systole closure of AV valves)
      playHeartbeatThud(ctx, 65, 0.12, 0.15);
      // Dub (closure of semilunar valves 280ms later)
      setTimeout(() => {
        playHeartbeatThud(ctx, 80, 0.09, 0.12);
      }, 260);
    }, (60 / (vitals.heartRateBpm || 72)) * 1000);

    return () => {
      clearInterval(interval);
      ctx.close().catch(() => {});
    };
  }, [isOpen, soundEnabled, vitals.heartRateBpm]);

  const playHeartbeatThud = (ctx: AudioContext, freq: number, duration: number, vol: number) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + duration);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration + 0.02);
    } catch {}
  };

  // Historic timeline automated playback
  useEffect(() => {
    if (!isPlayingTimeline) return;
    const timer = setInterval(() => {
      setTimelineDay((prev) => {
        if (prev >= 45) {
          setIsPlayingTimeline(false);
          return 45;
        }
        return prev + 1;
      });
    }, 450);
    return () => clearInterval(timer);
  }, [isPlayingTimeline]);

  // Toggle true browser full-screen
  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  // Calculate dynamic properties based on the selected timeline day (0 to 45)
  // Day 0: Heavy dark purple necrotic scar, 0% iCM, low EF 26%, high stiffness 34 kPa
  // Day 14 (Current): 67% converted, pink muscle islands, 10.4 cm² scar, EF 43.5%
  // Day 45: 85% converted, near total regeneration, EF 52%, soft compliant muscle 13 kPa
  const simProgress = Math.min(1, Math.max(0, timelineDay / 45));
  const dynamicScarSizeCm2 = Number((patient.baselineScarAreaCm2 - (patient.baselineScarAreaCm2 - 3.8) * Math.pow(simProgress, 0.8)).toFixed(1));
  const dynamicIcmPercent = Number((5 + (85 - 5) * Math.pow(simProgress, 0.9)).toFixed(1));
  const dynamicEfPercent = Math.round(patient.baselineLVEF + (52 - patient.baselineLVEF) * simProgress);
  const dynamicStiffnessKPa = Number((34.0 - (34.0 - 13.5) * simProgress).toFixed(1));

  // Pulse illumination stays subtle; geometric contraction is animated by
  // the SVG group above rather than a binary whole-diagram scale.
  const pulseGlow = isSystole ? 1.0 : 0.4;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden"
    >
      {/* Top Floating Control Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-3 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30">
            <Heart className="h-5 w-5 fill-rose-500/30 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Live Patient Cardiac Twin Visualizer
              </h2>
              <span className="text-xs text-teal-400 font-mono">
                {patient.mrnTokenized} ({patient.unmaskedName})
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Beating at {vitals.heartRateBpm} BPM</span>
              <span>·</span>
              <span>Timeline: Day {timelineDay} of Regeneration</span>
            </div>
          </div>
        </div>

        {/* Center: 2D vs 3D Dimension Switch & Layman vs Clinical Mode Switch */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 2D / 3D Dimension Switch */}
          <div className="flex items-center rounded-lg border border-teal-500/40 bg-slate-900 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setDimensionMode('2D')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                dimensionMode === '2D'
                  ? 'bg-teal-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>2D Section</span>
            </button>
            <button
              onClick={() => setDimensionMode('3D')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                dimensionMode === '3D'
                  ? 'bg-teal-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="h-3 w-3" />
              <span>Real 3D Heart</span>
            </button>
          </div>

          {/* Layman vs Clinical Mode Switch */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('LAYMAN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'LAYMAN'
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Simple Story Mode</span>
            </button>
            <button
              onClick={() => setViewMode('CLINICAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'CLINICAL'
                  ? 'bg-slate-800 text-teal-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Cardiologist Telemetry</span>
            </button>
          </div>
        </div>

        {/* Right Controls: Audio, Fullscreen, Close */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              soundEnabled
                ? 'border-teal-500/40 bg-teal-500/15 text-teal-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title={soundEnabled ? 'Mute Heartbeat Sound' : 'Play Realistic Heartbeat Sound'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Audio On' : 'Audio Muted'}</span>
          </button>

          {/* Browser Fullscreen Toggle */}
          <button
            onClick={toggleBrowserFullscreen}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:text-white transition"
            title="Toggle True Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area: Interactive 3D Real Heart or 2D Story View with Callout Hotspots */}
      <div className="relative flex-1 flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-0 overflow-hidden">
        {dimensionMode === '3D' ? (
          <div className="w-full h-full relative">
            <Real3DHeartCanvas
              patient={patient}
              vitals={vitals}
              cellular={cellular}
              dosing={{
                formulation: 'GHMT_MIR1_133',
                infusionRateNlMin: 240,
                targetInfusionRateNlMin: 240,
                totalDeliveredUl: 18.4,
                deliveryVector: 'Fibroblast-Targeted LNP (mRNA)',
                lastDoseAdjustmentTimestamp: new Date().toISOString(),
                adjustmentReason: 'Automated closed-loop',
                safetyCapNlMin: 350,
                pidOutputEffort: 65,
              }}
              pacing={pacing}
              height="100%"
            />
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Background Subtle Blood Flow Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

            {/* Large Anatomical Beating Heart SVG */}
            <div className="relative">
          <svg
            viewBox="0 0 600 600"
            className="w-[85vw] max-w-[620px] h-auto drop-shadow-[0_20px_50px_rgba(225,29,72,0.25)]"
          >
            <defs>
              {/* Healthy Viable Myocardium Pink/Ruby Gradient */}
              <radialGradient id="viableMuscleGrad" cx="45%" cy="40%" r="65%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="60%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#4c0519" />
              </radialGradient>

              {/* Aorta & Major Arteries Glowing Crimson/Red */}
              <linearGradient id="aortaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="50%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#9f1239" />
              </linearGradient>

              {/* Pulmonary Artery Blue/Cyan */}
              <linearGradient id="pulmonaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>

              {/* Dynamic Scar Tissue Gradient (shrinks and softens as timeline advances) */}
              <radialGradient id="dynamicScarGrad" cx="50%" cy="50%" r="60%">
                <stop
                  offset="0%"
                  stopColor={timelineDay < 5 ? '#475569' : timelineDay < 20 ? '#a855f7' : '#f43f5e'}
                  stopOpacity={timelineDay < 5 ? 0.95 : timelineDay < 20 ? 0.85 : 0.65}
                />
                <stop
                  offset="70%"
                  stopColor={timelineDay < 5 ? '#1e293b' : timelineDay < 20 ? '#581c87' : '#9f1239'}
                  stopOpacity={timelineDay < 5 ? 0.98 : 0.8}
                />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
              </radialGradient>

              {/* Bio-Nanogrid Electrical Mesh Glow */}
              <filter id="meshGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Superior Vena Cava & Right Side Vessels */}
            <path
              d="M 230 80 C 230 40, 260 40, 270 90 L 270 190 C 250 180, 230 180, 230 80 Z"
              fill="url(#pulmonaryGrad)"
              stroke="#0284c7"
              strokeWidth="2"
            />

            {/* Aorta Arch (Great vessel pumping oxygen to brain and body) */}
            <path
              d="M 270 140 C 270 60, 360 40, 380 110 C 390 140, 370 200, 340 220 C 320 200, 290 170, 270 140 Z"
              fill="url(#aortaGrad)"
              stroke="#fb7185"
              strokeWidth="2"
            />
            {/* Brachiocephalic, Carotid, Subclavian Branches */}
            <path d="M 305 65 L 305 35 M 335 60 L 340 30 M 360 70 L 370 40" stroke="#fda4af" strokeWidth="6" strokeLinecap="round" />

            {/* Pulmonary Trunk branching to Left and Right Lungs */}
            <path
              d="M 260 160 C 280 150, 350 160, 370 180 C 350 210, 300 220, 260 210 Z"
              fill="url(#pulmonaryGrad)"
              stroke="#38bdf8"
              strokeWidth="2"
            />

            {/* Left & Right Atria Background Bases */}
            <path
              d="M 180 180 C 160 140, 220 120, 260 170 C 240 210, 200 210, 180 180 Z"
              fill="#be123c"
              opacity="0.8"
            />
            <path
              d="M 360 180 C 410 140, 440 180, 420 230 C 390 240, 360 220, 360 180 Z"
              fill="#be123c"
              opacity="0.8"
            />

            {/* Contractile ventricular myocardium. The atria and great vessels
                above remain fixed during systole for anatomical plausibility. */}
            <g ref={twoDContractileRef}>
            {/* Ventricles Main Muscular Heart Silhouette */}
            <path
              d="M 180 200 
                 C 140 260, 150 360, 220 450 
                 C 260 500, 310 535, 330 540 
                 C 350 535, 410 460, 440 370 
                 C 470 270, 440 210, 380 210 
                 C 320 210, 280 220, 260 220 
                 C 220 220, 200 200, 180 200 Z"
              fill="url(#viableMuscleGrad)"
              stroke="#e11d48"
              strokeWidth="3.5"
              className="cursor-pointer"
              onClick={() => setSelectedHotspot('LEFT_VENTRICLE')}
            />

            {/* Coronary Arteries (Left Anterior Descending LAD & Diagonal branches) */}
            <g stroke="#fecdd3" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.85">
              <path d="M 285 220 Q 295 290 280 360 T 325 515" />
              <path d="M 288 280 Q 330 320 370 340" strokeWidth="1.8" />
              <path d="M 282 340 Q 240 380 215 420" strokeWidth="1.8" />
              <path d="M 295 410 Q 340 440 360 465" strokeWidth="1.4" />
            </g>

            {/* THE SCAR (Infarct Apex Zone) */}
            {/* The scar shrinks, lightens from necrotic gray to vascularized pink as timeline advances */}
            <path
              d={
                timelineDay > 30
                  ? 'M 285 460 C 305 450, 340 455, 345 480 C 340 505, 330 520, 325 525 C 315 515, 290 495, 285 460 Z'
                  : timelineDay > 10
                  ? 'M 255 420 C 295 400, 360 410, 370 450 C 375 490, 350 525, 330 535 C 295 515, 255 470, 255 420 Z'
                  : 'M 235 380 C 290 350, 380 370, 395 430 C 405 485, 370 530, 330 540 C 280 520, 230 460, 235 380 Z'
              }
              fill="url(#dynamicScarGrad)"
              stroke={timelineDay > 30 ? '#10b981' : timelineDay > 10 ? '#a855f7' : '#64748b'}
              strokeWidth="2.5"
              strokeDasharray={timelineDay > 10 ? '4 2' : undefined}
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedHotspot('SCAR')}
            />

            {/* BIO-NANOGRID MESH (Ultra-soft conductive PEDOT:PSS / Graphene mesh) */}
            {/* Emits vibrant cyan pulses when isSystole is true */}
            <g
              filter="url(#meshGlow)"
              stroke="#2dd4bf"
              strokeWidth={isSystole ? 2.5 : 1.8}
              strokeOpacity={pulseGlow}
              fill="none"
              className="cursor-pointer transition-opacity duration-150"
              onClick={() => setSelectedHotspot('NANOGRID')}
            >
              {/* Interlaced mesh lines bridging the scar */}
              <line x1="255" y1="410" x2="310" y2="400" />
              <line x1="310" y1="400" x2="365" y2="420" />
              <line x1="250" y1="440" x2="305" y2="435" />
              <line x1="305" y1="435" x2="370" y2="445" />
              <line x1="260" y1="475" x2="315" y2="470" />
              <line x1="315" y1="470" x2="360" y2="480" />
              <line x1="280" y1="510" x2="325" y2="505" />
              <line x1="325" y1="505" x2="345" y2="515" />

              {/* Vertical connector filaments */}
              <line x1="255" y1="410" x2="250" y2="440" />
              <line x1="310" y1="400" x2="305" y2="435" />
              <line x1="365" y1="420" x2="370" y2="445" />
              <line x1="250" y1="440" x2="260" y2="475" />
              <line x1="305" y1="435" x2="315" y2="470" />
              <line x1="370" y1="445" x2="360" y2="480" />
              <line x1="260" y1="475" x2="280" y2="510" />
              <line x1="315" y1="470" x2="325" y2="505" />

              {/* Active Electrodes (flashing nodes) */}
              {[
                { cx: 255, cy: 410 },
                { cx: 310, cy: 400 },
                { cx: 365, cy: 420 },
                { cx: 250, cy: 440 },
                { cx: 305, cy: 435 },
                { cx: 370, cy: 445 },
                { cx: 260, cy: 475 },
                { cx: 315, cy: 470 },
                { cx: 360, cy: 480 },
                { cx: 325, cy: 505 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.cx} cy={pt.cy} r={isSystole ? 4.5 : 3} fill="#5eead4" stroke="#042f2e" strokeWidth="1" />
              ))}
            </g>

            {/* LNP Micro-Dosing Droplets Delivering mRNA to the scar */}
            <g fill="#38bdf8" opacity={0.85}>
              <circle cx="280" cy="430" r="2.5" className="animate-ping" />
              <circle cx="330" cy="450" r="2.5" className="animate-ping" />
              <circle cx="300" cy="485" r="2.5" className="animate-ping" />
            </g>

            {/* Interactive Hotspot Beacon Rings */}
            <g className="cursor-pointer">
              {/* Scar Hotspot */}
              <circle
                cx="310"
                cy="460"
                r="18"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="hover:stroke-white transition"
                onClick={() => setSelectedHotspot('SCAR')}
              />
              {/* Nanogrid Hotspot */}
              <circle
                cx="305"
                cy="435"
                r="14"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                className="hover:stroke-white transition"
                onClick={() => setSelectedHotspot('NANOGRID')}
              />
            </g>
            </g>
          </svg>
        </div>

        {/* Layman / Patient Explanatory Story Callout Box (Floating on the Left/Bottom) */}
        <div className="absolute bottom-3 left-3 right-3 max-h-[38dvh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-md z-10 sm:bottom-24 sm:left-6 sm:right-auto sm:max-h-none sm:max-w-md sm:p-4">
          {viewMode === 'LAYMAN' ? (
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span className="font-bold text-sm text-slate-100">
                  {selectedHotspot === 'SCAR'
                    ? 'The Healing Scar (Myocardial Infarct)'
                    : selectedHotspot === 'NANOGRID'
                    ? 'The Bio-Electric Nanogrid Bridge'
                    : 'The Heart Muscle & Pumping Power'}
                </span>
              </div>

              <div className="mt-2.5 text-xs text-slate-300 leading-relaxed space-y-2">
                {selectedHotspot === 'SCAR' && (
                  <>
                    <p>
                      <strong>What is this area?</strong> This is where the heart attack happened. The dead muscle turned into stiff scar tissue that normally never grows back.
                    </p>
                    <p className="text-emerald-300">
                      <strong>How it is being cured:</strong> Tiny lipid bubbles (LNPs) are delivering genetic instructions right into the scar. Day by day, your stiff scar cells are literally transforming back into living, beating heart muscle cells!
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-slate-400">Scar Size:</span>
                        <div className="text-amber-300 font-bold text-sm">
                          {dynamicScarSizeCm2} cm²{' '}
                          <span className="text-[10px] text-emerald-400">
                            (-{((patient.baselineScarAreaCm2 - dynamicScarSizeCm2) / patient.baselineScarAreaCm2 * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-slate-400">Healing Progress:</span>
                        <div className="text-emerald-400 font-bold text-sm">
                          {dynamicIcmPercent}% Healed
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedHotspot === 'NANOGRID' && (
                  <>
                    <p>
                      <strong>What are the glowing blue lines?</strong> That is the bio-nanogrid. Because scar tissue cannot carry electricity, the heart normally risks erratic, dangerous beating rhythms (arrhythmias).
                    </p>
                    <p className="text-teal-300">
                      <strong>How it protects you:</strong> This microscopic conductive mesh acts like an artificial bridge. Every heartbeat zips across the mesh in milliseconds, keeping your heart beating in perfect, safe unison!
                    </p>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-[11px] text-teal-300">
                      Arrhythmia Protection: 100% Active · Zero Dangerous Palpitations
                    </div>
                  </>
                )}

                {selectedHotspot === 'LEFT_VENTRICLE' && (
                  <>
                    <p>
                      <strong>What does this mean for your body?</strong> The left ventricle is the engine that pumps oxygen-rich blood to your brain, kidneys, and muscles.
                    </p>
                    <p className="text-slate-200">
                      As the scar softens and new muscle cells take over, your heart strength (Ejection Fraction) is climbing from a dangerous <strong>{patient.baselineLVEF}%</strong> up to a healthy <strong>{dynamicEfPercent}%</strong>.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Tip: Click on the glowing mesh or scar to explore!</span>
                <span className="text-teal-400 font-medium">Safe &amp; Protected</span>
              </div>
            </div>
          ) : (
            /* Cardiologist Technical Telemetry Box */
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-xs text-teal-300 font-mono uppercase">
                  Biophysical Telemetry Parameters
                </span>
                <span className="text-[11px] font-mono text-slate-400">Day {timelineDay}</span>
              </div>

              <div className="mt-2.5 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tissue Young&apos;s Modulus:</span>
                  <span className="text-amber-300 font-bold">{dynamicStiffnessKPa} kPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">iCM Transdifferentiation:</span>
                  <span className="text-emerald-400 font-bold">{dynamicIcmPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">LV Ejection Fraction:</span>
                  <span className="text-teal-300 font-bold">{dynamicEfPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nanogrid Conduction Velocity:</span>
                  <span className="text-teal-300 font-bold">{pacing.conductionVelocityMs.toFixed(2)} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Re-Entry Suppression:</span>
                  <span className="text-emerald-400 font-bold">{pacing.reentrySuppressionRate}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

            {/* Real-time Vitals Floating Badge on Top Right */}
            <div className="absolute top-4 right-6 rounded-xl border border-slate-800 bg-slate-950/85 p-3 font-mono text-xs shadow-2xl backdrop-blur-md hidden sm:block">
              <div className="text-[11px] text-slate-400 mb-1">Live Hemodynamics</div>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-slate-500 text-[10px]">HR:</span>
                  <div className="text-emerald-400 font-bold text-base">{vitals.heartRateBpm} BPM</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">BP:</span>
                  <div className="text-slate-200 font-bold text-base">{vitals.systolicBp}/{vitals.diastolicBp}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">LVEF:</span>
                  <div className="text-teal-300 font-bold text-base">{dynamicEfPercent}%</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Timeline Scrubber: Day 0 (Heart Attack) -> Day 14 (Today) -> Day 45 (Full Recovery) */}
      <div className="border-t border-slate-800 bg-slate-950/95 px-6 py-3 z-20">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-6xl mx-auto">
          {/* Play/Pause & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
              className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-teal-400 transition"
            >
              {isPlayingTimeline ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlayingTimeline ? 'Pause History' : 'Play Historic Journey'}</span>
            </button>
            <button
              onClick={() => {
                setIsPlayingTimeline(false);
                setTimelineDay(patient.postInfarcDay);
              }}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition"
              title="Reset to Today"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Today (Day {patient.postInfarcDay})</span>
            </button>
          </div>

          {/* Timeline Slider with Milestones */}
          <div className="flex-1 max-w-2xl px-4">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span className={timelineDay === 0 ? 'text-rose-400 font-bold' : ''}>Day 0: Heart Attack</span>
              <span className={timelineDay === 3 ? 'text-teal-400 font-bold' : ''}>Day 3: Mesh Placed</span>
              <span className={timelineDay === patient.postInfarcDay ? 'text-teal-300 font-bold underline' : ''}>
                Day {patient.postInfarcDay}: Today
              </span>
              <span className={timelineDay === 45 ? 'text-emerald-400 font-bold' : ''}>Day 45: Full Remodeling</span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={timelineDay}
              onChange={(e) => {
                setIsPlayingTimeline(false);
                setTimelineDay(Number(e.target.value));
              }}
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>

          {/* Quick Stats Pill */}
          <div className="font-mono text-xs flex items-center gap-3">
            <div className="text-slate-300">
              Scar Area: <span className="font-bold text-amber-300">{dynamicScarSizeCm2} cm²</span>
            </div>
            <div className="text-slate-300">
              Converted: <span className="font-bold text-emerald-400">{dynamicIcmPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
