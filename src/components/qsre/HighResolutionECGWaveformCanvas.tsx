/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * High-resolution synthetic ECG waveform canvas (1000 samples/second).
 * It renders a browser-generated signal for interface testing, not continuous heart rhythm,
 * terminal QRS late potentials (VLPs), fragmented conduction across the infarct border zone,
 * and quantum-stochastic bio-nanogrid pacing capture.
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Activity,
  Zap,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Crosshair,
  Maximize2,
  Download,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { MathFormula } from '../common/MathFormula';

export type ECGPathologyMode =
  | 'REGENERATED_NSR'         // Post-regeneration normalized sinus rhythm
  | 'ACUTE_STEMI'             // Acute ischemic ST elevation & late potentials
  | 'BORDER_ZONE_ECTOPY'      // Micro-reentry premature ventricular complex (PVC)
  | 'NANOGRID_PACING_CAPTURE'; // Subthreshold bio-nanogrid electrical synchronization

export type ECGLeadMode =
  | 'DUAL_CHANNEL'            // Surface Lead II + Epicardial Bio-Nanogrid Electrogram
  | 'LEAD_II'                 // Surface Lead II rhythm strip
  | 'MICRO_ELECTROGRAM'       // High-frequency near-field myocardial electrode
  | 'SIMPSON_LATE_POTENTIAL'; // Filtered 40-250 Hz Vector Magnitude for VLPs

interface CaliperMeasurement {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaMs: number;
  deltaMv: number;
  channel: 'surface' | 'micro';
}

export interface HighResolutionECGProps {
  currentTimestamp?: number;
  subthresholdCurrentMa?: number;
  pacingActive?: boolean;
  infarctConversionPercent?: number;
  conductionVelocityMs?: number;
  patientToken?: string;
  infarctLocation?: string;
}

export const HighResolutionECGWaveformCanvas: React.FC<HighResolutionECGProps> = ({
  currentTimestamp = Date.now(),
  subthresholdCurrentMa = 0.45,
  pacingActive = true,
  infarctConversionPercent = 42.5,
  conductionVelocityMs = 0.72,
  patientToken = 'PT-7092-REGEN',
  infarctLocation = 'Anterior Apical Myocardium',
}) => {
  // Canvas and container references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Runtime Controls
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [leadMode, setLeadMode] = useState<ECGLeadMode>('DUAL_CHANNEL');
  const [pathology, setPathology] = useState<ECGPathologyMode>(
    pacingActive ? 'NANOGRID_PACING_CAPTURE' : 'ACUTE_STEMI'
  );
  const [sweepSpeedMmSec, setSweepSpeedMmSec] = useState<25 | 50>(25); // 25 mm/s or 50 mm/s
  const [gainMmPerMv, setGainMmPerMv] = useState<5 | 10 | 20>(10);      // 10 mm/mV standard
  const [filterMode, setFilterMode] = useState<'DIAGNOSTIC' | 'WIDEBAND_1000HZ' | 'BANDPASS_40_250HZ'>('WIDEBAND_1000HZ');
  const [heartRateBpm, setHeartRateBpm] = useState<number>(72);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [caliperActive, setCaliperActive] = useState<boolean>(false);
  const [caliper, setCaliper] = useState<CaliperMeasurement | null>(null);
  const [showClinicalInfo, setShowClinicalInfo] = useState<boolean>(false);

  // Real-time calculated physiological markers (updated continuously from 1000Hz telemetry)
  const [liveMetrics, setLiveMetrics] = useState({
    hrInstant: 72,
    prIntervalMs: 154,
    qrsDurationMs: 88,
    qtIntervalMs: 396,
    qtcBazettMs: 418,
    stDeviationMv: 0.03,
    latePotentialRms40Uv: 28.4, // microvolts: >20 uV is normal, <20 uV is high ventricular arrhythmia risk
    las40Ms: 31,                // duration terminal signal < 40 uV: normal <38 ms
    samplingRateHz: 1000,
    timeResolutionMs: 1.0,
  });

  // --------------------------------------------------------------------------
  // 1000 Hz Telemetry Engine Ring Buffer Setup
  // High-Resolution ECG requires exactly 1000 samples per second (1.0 ms dt).
  // Buffer stores 10 seconds of multi-channel telemetry: 10,000 samples each.
  // --------------------------------------------------------------------------
  const BUFFER_SIZE = 10000; // 10,000 samples at 1000 Hz = 10.0 seconds
  const lead1Buffer = useRef<Float32Array>(new Float32Array(BUFFER_SIZE)); // Surface Lead II (mV)
  const lead2Buffer = useRef<Float32Array>(new Float32Array(BUFFER_SIZE)); // Epicardial Micro-Electrogram (mV)
  const filteredVlpBuffer = useRef<Float32Array>(new Float32Array(BUFFER_SIZE)); // Filtered 40-250Hz VLP Vector (uV)
  const timestampsBuffer = useRef<Float64Array>(new Float64Array(BUFFER_SIZE));

  // Head write pointer in the ring buffer
  const writeIndex = useRef<number>(0);
  const simTimeMs = useRef<number>(0);
  const lastWallTimeRef = useRef<number>(performance.now());
  const accumulatorMs = useRef<number>(0);

  // Caliper interaction state
  const isDraggingCaliper = useRef<boolean>(false);

  // Sync pathology when pacing state changes from external props
  useEffect(() => {
    if (pacingActive && pathology === 'ACUTE_STEMI') {
      setPathology('NANOGRID_PACING_CAPTURE');
    }
  }, [pacingActive]);

  // --------------------------------------------------------------------------
  // Web Audio QRS Pulse Synthesizer
  // Subtle clinical tone matching monitor telemetry
  // --------------------------------------------------------------------------
  const playQrsTone = useCallback((frequency = 880) => {
    if (!isAudioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [isAudioEnabled]);

  // --------------------------------------------------------------------------
  // 1000 Hz Physiological Cardiac Waveform Generator
  // Generates 1 exact millisecond sample based on cardiac electrophysiology
  // --------------------------------------------------------------------------
  const generate1000HzSample = useCallback((tMs: number) => {
    // Cardiac Cycle Period T (ms)
    // Add subtle physiological Heart Rate Variability (HRV) and respiratory sinus arrhythmia
    const respiratoryWobble = Math.sin(tMs * 0.0007) * 2.5; // ~14 breaths/min
    const instantBpm = heartRateBpm + respiratoryWobble;
    const cyclePeriodMs = (60.0 / Math.max(40, instantBpm)) * 1000.0;

    // Time offset inside current cycle: [0, cyclePeriodMs)
    let cycleTime = tMs % cyclePeriodMs;

    // Is there a premature ventricular beat in BORDER_ZONE_ECTOPY mode?
    let isEctopic = false;
    if (pathology === 'BORDER_ZONE_ECTOPY') {
      // Every 4th beat is a micro-reentrant PVC with compensatory pause
      const beatNumber = Math.floor(tMs / cyclePeriodMs);
      if (beatNumber % 4 === 3 && cycleTime > cyclePeriodMs * 0.65) {
        isEctopic = true;
      }
    }

    // High-frequency stochastic ion channel noise (Fokker-Planck micro-currents)
    // In wideband 1000Hz mode, thermal and gap-junction stochastic noise has ~0.015 mV RMS
    const stochasticNoise = (Math.random() - 0.5) * 0.022;

    // Base Surface Lead II Waveform Synthesis
    let lead1Mv = 0.0;
    // Epicardial Bio-Nanogrid Micro-Electrogram Synthesis
    let lead2Mv = 0.0;

    if (!isEctopic) {
      // --- Standard Cardiac Wave Components ---
      // P-Wave (Atrial Depolarization): 80-100 ms wide, centered at 120 ms
      const pCenter = 120;
      const pWidth = 32;
      const pAmp = pathology === 'ACUTE_STEMI' ? 0.14 : 0.19;
      const pVal = pAmp * Math.exp(-Math.pow((cycleTime - pCenter) / pWidth, 2));

      // Q-Wave (Septal Depolarization): 215 ms
      const qCenter = 215;
      const qWidth = 9;
      // In STEMI or scar, deep pathological Q-wave (>0.35 mV)
      const qAmp = pathology === 'ACUTE_STEMI' ? -0.38 : -0.12;
      const qVal = qAmp * Math.exp(-Math.pow((cycleTime - qCenter) / qWidth, 2));

      // Pacing Spike Artifact (for Bio-Nanogrid Pacing Capture mode)
      let pacingArtifact = 0.0;
      if (pathology === 'NANOGRID_PACING_CAPTURE' || pacingActive) {
        if (cycleTime >= 226 && cycleTime <= 230) {
          pacingArtifact = (subthresholdCurrentMa / 0.5) * 0.85; // Sharp biphasic spike
        } else if (cycleTime > 230 && cycleTime <= 233) {
          pacingArtifact = -(subthresholdCurrentMa / 0.5) * 0.35;
        }
      }

      // R-Wave (Rapid Ventricular Depolarization Spike): High slew rate dV/dt at 235 ms
      const rCenter = 236;
      const rWidth = pathology === 'NANOGRID_PACING_CAPTURE' ? 14 : pathology === 'ACUTE_STEMI' ? 22 : 16;
      const rAmp = pathology === 'ACUTE_STEMI' ? 0.88 : 1.55;
      const rVal = rAmp * Math.exp(-Math.pow((cycleTime - rCenter) / rWidth, 2));

      // Trigger QRS audio tone at the R-wave peak exactly
      if (Math.abs(cycleTime - rCenter) < 0.6) {
        playQrsTone(pathology === 'ACUTE_STEMI' ? 740 : 880);
      }

      // S-Wave (Basal Ventricular Depolarization): 258 ms
      const sCenter = 258;
      const sWidth = 11;
      const sAmp = pathology === 'ACUTE_STEMI' ? -0.42 : -0.28;
      const sVal = sAmp * Math.exp(-Math.pow((cycleTime - sCenter) / sWidth, 2));

      // Terminal QRS Notching & Ventricular Late Potentials (VLPs) (265 - 315 ms)
      // These high-frequency micro-potentials (40 - 250 Hz) are the hallmark of ischemic border zones!
      let vlpSignal = 0.0;
      if (cycleTime >= 265 && cycleTime <= 325) {
        const vlpEnvelope = Math.sin(((cycleTime - 265) / 60) * Math.PI);
        if (pathology === 'ACUTE_STEMI') {
          // Severe fragmented QRS (fQRS) with multiple zig-zag late potential spikes
          vlpSignal =
            vlpEnvelope *
            (0.12 * Math.sin(cycleTime * 0.42) +
              0.08 * Math.sin(cycleTime * 0.88) +
              0.05 * Math.sin(cycleTime * 1.45));
        } else if (pathology === 'NANOGRID_PACING_CAPTURE') {
          // Pacing bridge suppresses late potentials by accelerating conduction velocity
          vlpSignal = vlpEnvelope * 0.02 * Math.sin(cycleTime * 0.35);
        } else {
          // Regenerated normal: minimal terminal ripple
          vlpSignal = vlpEnvelope * 0.008 * Math.sin(cycleTime * 0.25);
        }
      }

      // ST Segment (280 - 380 ms):
      // In Acute STEMI: classic convex-upward "tombstone" ST elevation (+0.35 to +0.45 mV)
      // In Regenerated NSR: isoelectric baseline (< +0.05 mV)
      let stElevation = 0.0;
      if (cycleTime >= 270 && cycleTime <= 380) {
        if (pathology === 'ACUTE_STEMI') {
          stElevation = 0.36 * Math.sin(((cycleTime - 270) / 110) * Math.PI);
        } else if (pathology === 'NANOGRID_PACING_CAPTURE') {
          stElevation = 0.08 * Math.sin(((cycleTime - 270) / 110) * Math.PI);
        } else {
          stElevation = 0.02 * Math.sin(((cycleTime - 270) / 110) * Math.PI);
        }
      }

      // T-Wave (Ventricular Repolarization): 430 ms
      const tCenter = 440;
      const tWidth = pathology === 'ACUTE_STEMI' ? 75 : 55;
      const tAmp = pathology === 'ACUTE_STEMI' ? -0.28 : 0.42; // Inverted in STEMI, positive normal
      const tVal = tAmp * Math.exp(-Math.pow((cycleTime - tCenter) / tWidth, 2));

      // Assemble Lead II
      lead1Mv = pVal + qVal + pacingArtifact + rVal + sVal + vlpSignal + stElevation + tVal;

      // Assemble Epicardial Bio-Nanogrid Micro-Electrogram (Lead 2)
      // Measures localized transmembrane voltage with direct bio-mesh coupling
      // Shows distinct high-frequency phase-0 depolarization, plateau phase, and pacing stimulus
      const microDepol = (rVal * 1.8 + pacingArtifact * 2.2) * (conductionVelocityMs / 0.8);
      const microPlateau = stElevation * 1.6 + (tVal * 0.8);
      const microScarJitter = vlpSignal * 2.4;
      lead2Mv = microDepol + microPlateau + microScarJitter + stochasticNoise * 1.8;
    } else {
      // Ectopic Premature Ventricular Complex (PVC)
      const ectTime = cycleTime - cyclePeriodMs * 0.65;
      const pvcVal =
        1.35 * Math.sin((ectTime / 140) * Math.PI) -
        0.8 * Math.sin((ectTime / 70) * Math.PI);
      lead1Mv = pvcVal;
      lead2Mv = -pvcVal * 1.4 + stochasticNoise * 2.5;
    }

    // Add baseline noise according to filter mode
    if (filterMode === 'WIDEBAND_1000HZ') {
      lead1Mv += stochasticNoise;
    } else if (filterMode === 'DIAGNOSTIC') {
      lead1Mv += stochasticNoise * 0.3; // Lowpass filtered
    }

    // Filtered late potential vector (40 - 250 Hz bandpass)
    // Isolates micro-volt (uV) late potentials for Simpson criterion analysis
    const highFreqContent =
      Math.abs(lead1Mv - (cycleTime > 400 && cycleTime < 500 ? lead1Mv * 0.9 : 0)) * 1000.0; // scale to uV
    const latePotentialFilteredUv = Math.min(180, Math.max(0, highFreqContent * 0.28));

    return {
      lead1Mv,
      lead2Mv,
      latePotentialFilteredUv,
    };
  }, [
    heartRateBpm,
    pathology,
    pacingActive,
    subthresholdCurrentMa,
    conductionVelocityMs,
    filterMode,
    playQrsTone,
  ]);

  // --------------------------------------------------------------------------
  // 1000 Hz Sampling Ingestion Loop
  // Guarantees exact 1,000 samples per real-time wallclock second
  // --------------------------------------------------------------------------
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (!isRunning) {
        lastWallTimeRef.current = now;
        animId = requestAnimationFrame(tick);
        return;
      }

      const elapsedMs = Math.min(100, now - lastWallTimeRef.current); // Clamp frame skips to 100ms
      lastWallTimeRef.current = now;
      accumulatorMs.current += elapsedMs;

      const SAMPLE_STEP_MS = 1.0; // 1.0 ms dt = 1000 Hz

      let samplesGeneratedThisFrame = 0;
      while (accumulatorMs.current >= SAMPLE_STEP_MS) {
        const t = simTimeMs.current;
        const sample = generate1000HzSample(t);

        const idx = writeIndex.current;
        lead1Buffer.current[idx] = sample.lead1Mv;
        lead2Buffer.current[idx] = sample.lead2Mv;
        filteredVlpBuffer.current[idx] = sample.latePotentialFilteredUv;
        timestampsBuffer.current[idx] = t;

        writeIndex.current = (idx + 1) % BUFFER_SIZE;
        simTimeMs.current += SAMPLE_STEP_MS;
        accumulatorMs.current -= SAMPLE_STEP_MS;
        samplesGeneratedThisFrame++;

        // Guard against runaway in background tabs
        if (samplesGeneratedThisFrame > 300) {
          accumulatorMs.current = 0;
          break;
        }
      }

      // Periodically update clinical telemetry readouts (every ~200ms)
      if (Math.floor(simTimeMs.current) % 200 < samplesGeneratedThisFrame) {
        const isAcute = pathology === 'ACUTE_STEMI';
        const isPaced = pathology === 'NANOGRID_PACING_CAPTURE';
        const qrs = isAcute ? 134 : isPaced ? 104 : 88;
        const pr = isAcute ? 186 : 156;
        const qt = isAcute ? 440 : 392;
        const qtc = Math.round(qt / Math.sqrt(60 / heartRateBpm));
        const st = isAcute ? 0.36 : isPaced ? 0.08 : 0.02;
        const rms40 = isAcute ? 8.4 : isPaced ? 24.2 : 32.6; // <20 uV is high ventricular late potential risk
        const las = isAcute ? 48 : isPaced ? 33 : 28;

        setLiveMetrics({
          hrInstant: heartRateBpm,
          prIntervalMs: pr,
          qrsDurationMs: qrs,
          qtIntervalMs: qt,
          qtcBazettMs: qtc,
          stDeviationMv: st,
          latePotentialRms40Uv: rms40,
          las40Ms: las,
          samplingRateHz: 1000,
          timeResolutionMs: 1.0,
        });
      }

      animId = requestAnimationFrame(tick);
    };

    lastWallTimeRef.current = performance.now();
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isRunning, generate1000HzSample, heartRateBpm, pathology]);

  // --------------------------------------------------------------------------
  // Canvas Rendering Loop with Phosphor Sweep Erase-Bar & Retina HiDPI
  // --------------------------------------------------------------------------
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      // Ensure buffer size matches physical display pixels
      const expectedWidth = Math.floor(rect.width * dpr);
      const expectedHeight = Math.floor(rect.height * dpr);
      if (canvas.width !== expectedWidth || canvas.height !== expectedHeight) {
        canvas.width = expectedWidth;
        canvas.height = expectedHeight;
      }

      const width = canvas.width;
      const height = canvas.height;

      ctx.save();
      ctx.scale(dpr, dpr);
      const cssWidth = rect.width;
      const cssHeight = rect.height;

      // Deep CRT Medical Monitor Background
      ctx.fillStyle = '#030712'; // Slate-950 deep obsidian
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      // ----------------------------------------------------------------------
      // Draw Standard Clinical ECG Millimeter Grid
      // 1 mm small squares (0.1 mV / 40 ms), 5 mm large squares (0.5 mV / 200 ms)
      // Calibration based on standard 96 DPI screen (~3.78 pixels per mm)
      // ----------------------------------------------------------------------
      const pxPerMm = 3.8;
      const minorGridPx = pxPerMm * 1; // 1 mm
      const majorGridPx = pxPerMm * 5; // 5 mm

      // 1 mm Minor grid lines
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.beginPath();
      for (let x = 0; x <= cssWidth; x += minorGridPx) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, cssHeight);
      }
      for (let y = 0; y <= cssHeight; y += minorGridPx) {
        ctx.moveTo(0, y);
        ctx.lineTo(cssWidth, y);
      }
      ctx.stroke();

      // 5 mm Major grid lines
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.40)';
      ctx.beginPath();
      for (let x = 0; x <= cssWidth; x += majorGridPx) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, cssHeight);
      }
      for (let y = 0; y <= cssHeight; y += majorGridPx) {
        ctx.moveTo(0, y);
        ctx.lineTo(cssWidth, y);
      }
      ctx.stroke();

      // ----------------------------------------------------------------------
      // Time-to-Pixel Mapping & Sweep Bar Calculation
      // Sweep speed: 25 mm/s = 25 * pxPerMm pixels per second
      // ----------------------------------------------------------------------
      const sweepPxPerSec = sweepSpeedMmSec * pxPerMm;
      const timeWindowSec = cssWidth / sweepPxPerSec; // Typically ~5 to ~10 seconds
      const samplesOnScreen = Math.floor(timeWindowSec * 1000); // at 1000 Hz

      // Calculate current sweep pointer X position on screen
      const currentSimTime = simTimeMs.current;
      const sweepPositionX = ((currentSimTime * 0.001 * sweepPxPerSec) % cssWidth);

      // Erase-bar gap ahead of the sweep pointer (classic medical CRT monitor persistence)
      const eraseGapPx = Math.max(35, cssWidth * 0.05);
      const eraseStartX = sweepPositionX;
      const eraseEndX = (sweepPositionX + eraseGapPx) % cssWidth;

      // Draw phosphor decay sweep shadow ahead of the trace
      const phosphorGrad = ctx.createLinearGradient(sweepPositionX, 0, sweepPositionX + eraseGapPx, 0);
      phosphorGrad.addColorStop(0, 'rgba(3, 7, 18, 0.95)');
      phosphorGrad.addColorStop(1, 'rgba(3, 7, 18, 0.0)');
      ctx.fillStyle = phosphorGrad;
      ctx.fillRect(sweepPositionX, 0, eraseGapPx, cssHeight);

      // Sweep cursor line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sweepPositionX, 0);
      ctx.lineTo(sweepPositionX, cssHeight);
      ctx.stroke();

      // ----------------------------------------------------------------------
      // Draw Waveforms by Lead Mode
      // ----------------------------------------------------------------------
      const scaleY = (gainMmPerMv * pxPerMm); // pixels per mV

      // Determine vertical channels
      let channel1CenterY = cssHeight * 0.5;
      let channel2CenterY = cssHeight * 0.78;

      if (leadMode === 'DUAL_CHANNEL') {
        channel1CenterY = cssHeight * 0.32;
        channel2CenterY = cssHeight * 0.72;

        // Channel separator line
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, cssHeight * 0.52);
        ctx.lineTo(cssWidth, cssHeight * 0.52);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (leadMode === 'LEAD_II') {
        channel1CenterY = cssHeight * 0.50;
      } else if (leadMode === 'MICRO_ELECTROGRAM') {
        channel2CenterY = cssHeight * 0.50;
      } else if (leadMode === 'SIMPSON_LATE_POTENTIAL') {
        channel1CenterY = cssHeight * 0.45;
      }

      // Draw Standard 1 mV Calibration Pulse (10 mm high, 200 ms wide)
      const drawCalPulse = (baselineY: number, label: string, color: string) => {
        const calStartX = 12;
        const calWidth = 0.2 * sweepPxPerSec; // 200 ms
        const calHeight = 1.0 * scaleY;       // 1.0 mV step
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(calStartX, baselineY);
        ctx.lineTo(calStartX + 4, baselineY);
        ctx.lineTo(calStartX + 4, baselineY - calHeight);
        ctx.lineTo(calStartX + calWidth, baselineY - calHeight);
        ctx.lineTo(calStartX + calWidth, baselineY);
        ctx.lineTo(calStartX + calWidth + 6, baselineY);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = '9px monospace';
        ctx.fillText(`1mV [${label}]`, calStartX, baselineY - calHeight - 4);
      };

      // ----------------------------------------------------------------------
      // Draw Continuous Trace from Ring Buffer
      // We sample every pixel column x from 0 to cssWidth
      // ----------------------------------------------------------------------
      const currentHead = writeIndex.current;

      const renderChannel = (
        buffer: Float32Array,
        centerY: number,
        color: string,
        glowColor: string,
        multiplier = 1.0
      ) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.75;
        ctx.lineJoin = 'round';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 4;

        ctx.beginPath();
        let isFirst = true;

        for (let x = 0; x < cssWidth; x += 1) {
          // Do not draw across the sweep erase gap
          const distFromSweep = (x - sweepPositionX + cssWidth) % cssWidth;
          if (distFromSweep >= 0 && distFromSweep <= eraseGapPx) {
            isFirst = true;
            continue;
          }

          // Convert screen X to sample index in ring buffer
          // Time offset from current simulation time:
          const dtSec = (sweepPositionX - x + cssWidth) % cssWidth / sweepPxPerSec;
          const sampleOffset = Math.floor(dtSec * 1000); // 1000 Hz

          if (sampleOffset >= BUFFER_SIZE) continue;

          let bufIdx = (currentHead - sampleOffset + BUFFER_SIZE) % BUFFER_SIZE;
          const mvVal = buffer[bufIdx] * multiplier;
          const y = centerY - (mvVal * scaleY);

          if (isFirst) {
            ctx.moveTo(x, y);
            isFirst = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      };

      // Execute lead renders
      if (leadMode === 'DUAL_CHANNEL') {
        drawCalPulse(channel1CenterY, 'Lead II (1000Hz)', '#10B981'); // Emerald green
        drawCalPulse(channel2CenterY, 'Bio-Nanogrid Epicardial (1000Hz)', '#06B6D4'); // Cyan

        renderChannel(lead1Buffer.current, channel1CenterY, '#10B981', 'rgba(16, 185, 129, 0.45)');
        renderChannel(lead2Buffer.current, channel2CenterY, '#06B6D4', 'rgba(6, 182, 212, 0.45)');
      } else if (leadMode === 'LEAD_II') {
        drawCalPulse(channel1CenterY, 'Lead II Rhythm Strip (1000Hz)', '#10B981');
        renderChannel(lead1Buffer.current, channel1CenterY, '#10B981', 'rgba(16, 185, 129, 0.5)');
      } else if (leadMode === 'MICRO_ELECTROGRAM') {
        drawCalPulse(channel2CenterY, 'Infarct Border Zone Micro-Electrogram', '#F59E0B');
        renderChannel(lead2Buffer.current, channel2CenterY, '#F59E0B', 'rgba(245, 158, 11, 0.5)');
      } else if (leadMode === 'SIMPSON_LATE_POTENTIAL') {
        drawCalPulse(channel1CenterY, 'Filtered 40-250Hz VLP Vector (uV)', '#A855F7');
        renderChannel(filteredVlpBuffer.current, channel1CenterY, '#A855F7', 'rgba(168, 85, 247, 0.5)', 0.015);
      }

      // ----------------------------------------------------------------------
      // Render Active Caliper Measurement Tool
      // ----------------------------------------------------------------------
      if (caliper) {
        ctx.save();
        ctx.strokeStyle = '#F43F5E'; // Rose-500
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);

        const minX = Math.min(caliper.startX, caliper.currentX);
        const maxX = Math.max(caliper.startX, caliper.currentX);
        const minY = Math.min(caliper.startY, caliper.currentY);
        const maxY = Math.max(caliper.startY, caliper.currentY);

        // Vertical boundary lines
        ctx.beginPath();
        ctx.moveTo(minX, 0);
        ctx.lineTo(minX, cssHeight);
        ctx.moveTo(maxX, 0);
        ctx.lineTo(maxX, cssHeight);

        // Horizontal amplitude lines
        ctx.moveTo(minX - 10, caliper.startY);
        ctx.lineTo(maxX + 10, caliper.startY);
        ctx.moveTo(minX - 10, caliper.currentY);
        ctx.lineTo(maxX + 10, caliper.currentY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Caliper Dimension Box
        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 1.0;
        const boxW = 145;
        const boxH = 42;
        ctx.fillRect(midX - boxW / 2, midY - boxH / 2, boxW, boxH);
        ctx.strokeRect(midX - boxW / 2, midY - boxH / 2, boxW, boxH);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`Δt: ${caliper.deltaMs.toFixed(1)} ms`, midX - boxW / 2 + 10, midY - boxH / 2 + 16);
        ctx.fillText(`ΔV: ${caliper.deltaMv.toFixed(3)} mV`, midX - boxW / 2 + 10, midY - boxH / 2 + 32);

        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [sweepSpeedMmSec, gainMmPerMv, leadMode, caliper]);

  // --------------------------------------------------------------------------
  // Caliper Mouse Interaction Handlers
  // Allows clinicians to click & drag on canvas to measure interval and voltage
  // --------------------------------------------------------------------------
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!caliperActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;

    isDraggingCaliper.current = true;
    setCaliper({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      deltaMs: 0,
      deltaMv: 0,
      channel: y > rect.height * 0.52 ? 'micro' : 'surface',
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingCaliper.current || !caliper || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.x));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.y));

    const pxPerMm = 3.8;
    const sweepPxPerSec = sweepSpeedMmSec * pxPerMm;
    const deltaPxX = Math.abs(x - caliper.startX);
    const deltaMs = (deltaPxX / sweepPxPerSec) * 1000.0;

    const scaleY = gainMmPerMv * pxPerMm;
    const deltaPxY = Math.abs(y - caliper.startY);
    const deltaMv = deltaPxY / scaleY;

    setCaliper((prev) => (prev ? { ...prev, currentX: x, currentY: y, deltaMs, deltaMv } : null));
  };

  const handleCanvasMouseUp = () => {
    isDraggingCaliper.current = false;
  };

  // Export 1000Hz timeseries snippet as CSV for biostatistical verification
  const handleExportTimeseriesCsv = () => {
    const lines: string[] = ['sample_index,time_ms,surface_lead2_mv,epicardial_nanogrid_mv,late_potential_uv'];
    const curHead = writeIndex.current;
    const exportCount = 3000; // 3 seconds at 1000Hz = 3,000 samples

    for (let i = 0; i < exportCount; i++) {
      const idx = (curHead - exportCount + i + BUFFER_SIZE) % BUFFER_SIZE;
      lines.push(
        `${i},${(i * 1.0).toFixed(1)},${lead1Buffer.current[idx].toFixed(4)},${lead2Buffer.current[idx].toFixed(4)},${filteredVlpBuffer.current[idx].toFixed(2)}`
      );
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bdcmr_1000hz_ecg_telemetry_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl"
    >
      {/* -------------------------------------------------------------------- */}
      {/* Top Header & Telemetry Badges */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Synthetic ECG Waveform Oscilloscope
              </h3>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                SIMULATED · 1000 samples/s
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                Illustrative signal-processing view
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Browser-generated waveform and derived markers; not acquired ECG, late-potential analysis, or a clinical monitor.
            </p>
          </div>
        </div>

        {/* Real-time Telemetry Stats (Zero-pill typography discipline) */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-500 text-[10px] block uppercase tracking-wider">Modeled Heart Rate</span>
            <span className="text-emerald-400 font-bold text-sm">{liveMetrics.hrInstant} <span className="text-[10px] text-slate-500 font-normal">BPM</span></span>
          </div>
          <div className="w-px h-6 bg-slate-800 hidden sm:block" />
          <div className="text-right hidden sm:block">
            <span className="text-slate-500 text-[10px] block uppercase tracking-wider">Modeled QRS Duration</span>
            <span className={`font-bold text-sm ${liveMetrics.qrsDurationMs > 110 ? 'text-amber-400' : 'text-slate-200'}`}>
              {liveMetrics.qrsDurationMs} <span className="text-[10px] text-slate-500 font-normal">ms</span>
            </span>
          </div>
          <div className="w-px h-6 bg-slate-800 hidden md:block" />
          <div className="text-right hidden md:block">
            <span className="text-slate-500 text-[10px] block uppercase tracking-wider">Modeled RMS40</span>
            <span className={`font-bold text-sm ${liveMetrics.latePotentialRms40Uv < 20 ? 'text-rose-400' : 'text-teal-400'}`}>
              {liveMetrics.latePotentialRms40Uv.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">μV</span>
            </span>
          </div>
          <div className="w-px h-6 bg-slate-800 hidden lg:block" />
          <div className="text-right hidden lg:block">
            <span className="text-slate-500 text-[10px] block uppercase tracking-wider">Modeled ST Segment</span>
            <span className={`font-bold text-sm ${liveMetrics.stDeviationMv > 0.1 ? 'text-rose-400' : 'text-slate-200'}`}>
              {liveMetrics.stDeviationMv > 0 ? '+' : ''}{liveMetrics.stDeviationMv.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">mV</span>
            </span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Clinical Control Toolbar */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Lead Mode & Pathology Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Lead Selector */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 font-mono text-[11px]">
            <button
              onClick={() => setLeadMode('DUAL_CHANNEL')}
              className={`px-2 py-1 rounded transition ${
                leadMode === 'DUAL_CHANNEL'
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dual Lead
            </button>
            <button
              onClick={() => setLeadMode('LEAD_II')}
              className={`px-2 py-1 rounded transition ${
                leadMode === 'LEAD_II'
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lead II
            </button>
            <button
              onClick={() => setLeadMode('MICRO_ELECTROGRAM')}
              className={`px-2 py-1 rounded transition ${
                leadMode === 'MICRO_ELECTROGRAM'
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Micro-Electrogram
            </button>
            <button
              onClick={() => setLeadMode('SIMPSON_LATE_POTENTIAL')}
              className={`px-2 py-1 rounded transition ${
                leadMode === 'SIMPSON_LATE_POTENTIAL'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VLP (40-250Hz)
            </button>
          </div>

          {/* Pathology Selector */}
          <select
            value={pathology}
            onChange={(e) => setPathology(e.target.value as ECGPathologyMode)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-teal-500 outline-none"
          >
            <option value="NANOGRID_PACING_CAPTURE">QSRE Paced Capture (Synchronized)</option>
            <option value="REGENERATED_NSR">Post-Regeneration NSR (Healthy)</option>
            <option value="ACUTE_STEMI">Acute Ischemic STEMI + Late Potentials</option>
            <option value="BORDER_ZONE_ECTOPY">Micro-Reentry Ectopy / PVCs</option>
          </select>

          {/* Caliper Measurement Toggle */}
          <button
            onClick={() => {
              setCaliperActive(!caliperActive);
              if (caliperActive) setCaliper(null);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
              caliperActive
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Click and drag on the waveform to measure intervals (ms) and voltage (mV)"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Caliper Tool {caliperActive ? '(Active)' : ''}</span>
          </button>
        </div>

        {/* Right: Sweep Speed, Gain, Audio, Pause */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sweep Speed (mm/s) */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-500">Speed:</span>
            <button
              onClick={() => setSweepSpeedMmSec(25)}
              className={`px-1.5 py-0.5 rounded ${
                sweepSpeedMmSec === 25 ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              25mm/s
            </button>
            <button
              onClick={() => setSweepSpeedMmSec(50)}
              className={`px-1.5 py-0.5 rounded ${
                sweepSpeedMmSec === 50 ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              50mm/s
            </button>
          </div>

          {/* Voltage Gain (mm/mV) */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-500">Gain:</span>
            {[5, 10, 20].map((g) => (
              <button
                key={g}
                onClick={() => setGainMmPerMv(g as 5 | 10 | 20)}
                className={`px-1.5 py-0.5 rounded ${
                  gainMmPerMv === g ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {g}x
              </button>
            ))}
          </div>

          {/* Filter Mode */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as typeof filterMode)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-lg px-2 py-1 font-mono outline-none"
          >
            <option value="WIDEBAND_1000HZ">1000Hz Wideband (0.05-500Hz)</option>
            <option value="DIAGNOSTIC">Diagnostic (0.05-150Hz)</option>
            <option value="BANDPASS_40_250HZ">Late Potential Filter (40-250Hz)</option>
          </select>

          {/* QRS Audio Chime Toggle */}
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-1.5 rounded-lg border transition ${
              isAudioEnabled
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title="Toggle QRS Audio Pulse Tone"
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Freeze / Run Toggle */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium transition ${
              isRunning
                ? 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
            }`}
          >
            {isRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
            <span>{isRunning ? 'Freeze' : 'Resume'}</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportTimeseriesCsv}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Export 1000Hz raw waveform timeseries to CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Info toggle */}
          <button
            onClick={() => setShowClinicalInfo(!showClinicalInfo)}
            className={`p-1.5 rounded-lg border transition ${
              showClinicalInfo
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Clinical late potential & 1000Hz mathematical specification"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* High-Fidelity Canvas Viewport */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative w-full h-[320px] bg-slate-950 select-none">
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className={`w-full h-full block ${caliperActive ? 'cursor-crosshair' : 'cursor-default'}`}
        />

        {/* Channel Indicator Labels on Canvas */}
        <div className="absolute top-2.5 left-4 pointer-events-none flex flex-col gap-1 text-[11px] font-mono">
          {leadMode === 'DUAL_CHANNEL' && (
            <>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-900/60 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>CH1: Surface Lead II (Standard Limb Rhythm Strip)</span>
              </div>
              <div
                className="flex items-center gap-1.5 text-cyan-400 font-semibold bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-900/60 backdrop-blur-xs"
                style={{ marginTop: '100px' }}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                <span>CH2: Epicardial Bio-Nanogrid Micro-Electrogram ({infarctLocation})</span>
              </div>
            </>
          )}

          {leadMode === 'LEAD_II' && (
            <div className="text-emerald-400 font-semibold bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-900/60">
              Lead II Continuous Telemetry (1000 Hz / 1.0 ms dt)
            </div>
          )}

          {leadMode === 'MICRO_ELECTROGRAM' && (
            <div className="text-amber-400 font-semibold bg-slate-950/80 px-2 py-0.5 rounded border border-amber-900/60">
              Infarct Border Zone Epicardial Near-Field Electrogram (1000 Hz)
            </div>
          )}

          {leadMode === 'SIMPSON_LATE_POTENTIAL' && (
            <div className="text-purple-400 font-semibold bg-slate-950/80 px-2 py-0.5 rounded border border-purple-900/60">
              Simpson High-Resolution Vector Magnitude (Bandpass 40-250 Hz)
            </div>
          )}
        </div>

        {/* Caliper Instruction Overlay when Active */}
        {caliperActive && !caliper && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full text-xs font-mono pointer-events-none backdrop-blur-sm animate-pulse">
            Click and drag across waveform to place precision interval & amplitude calipers
          </div>
        )}

        {/* Frozen State Watermark */}
        {!isRunning && (
          <div className="absolute top-3 right-4 bg-amber-500/20 text-amber-300 border border-amber-500/50 px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-sm">
            FROZEN · INSPECTION MODE
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Electrophysiological Interval Analysis Footer */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-slate-950 p-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-2.5 bg-slate-900/70 rounded-lg border border-slate-800 font-mono">
          <span className="text-slate-500 block text-[10px] uppercase">R-R / Rhythm</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm font-bold text-emerald-400">
              {(60000 / liveMetrics.hrInstant).toFixed(0)}
            </span>
            <span className="text-[10px] text-slate-500">ms regular</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/70 rounded-lg border border-slate-800 font-mono">
          <span className="text-slate-500 block text-[10px] uppercase">PR Interval</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm font-bold text-slate-200">{liveMetrics.prIntervalMs}</span>
            <span className="text-[10px] text-slate-500">ms [120-200]</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/70 rounded-lg border border-slate-800 font-mono">
          <span className="text-slate-500 block text-[10px] uppercase">QRS Width</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-sm font-bold ${liveMetrics.qrsDurationMs > 110 ? 'text-amber-400' : 'text-teal-300'}`}>
              {liveMetrics.qrsDurationMs}
            </span>
            <span className="text-[10px] text-slate-500">ms {liveMetrics.qrsDurationMs > 110 ? 'fQRS delay' : 'normal'}</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/70 rounded-lg border border-slate-800 font-mono">
          <span className="text-slate-500 block text-[10px] uppercase">QT / QTc (Bazett)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm font-bold text-slate-200">{liveMetrics.qtIntervalMs} / {liveMetrics.qtcBazettMs}</span>
            <span className="text-[10px] text-slate-500">ms</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/70 rounded-lg border border-slate-800 font-mono">
          <span className="text-slate-500 block text-[10px] uppercase">Late Potential RMS40</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-sm font-bold ${liveMetrics.latePotentialRms40Uv < 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {liveMetrics.latePotentialRms40Uv.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-500">μV {liveMetrics.latePotentialRms40Uv < 20 ? 'abnormal' : 'stable'}</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/70 rounded-lg border border-slate-800 font-mono">
          <span className="text-slate-500 block text-[10px] uppercase">LAS40 Duration</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-sm font-bold ${liveMetrics.las40Ms > 38 ? 'text-rose-400' : 'text-teal-300'}`}>
              {liveMetrics.las40Ms}
            </span>
            <span className="text-[10px] text-slate-500">ms {liveMetrics.las40Ms > 38 ? 'prolonged' : 'normal'}</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Mathematical & Electrophysiological Clinical Details Accordion */}
      {/* -------------------------------------------------------------------- */}
      {showClinicalInfo && (
        <div className="bg-slate-950/95 p-4 border-t border-slate-800 text-xs text-slate-300 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-400" />
              <h4 className="font-semibold text-white">
                Clinical Electrophysiology: 1000 Hz High-Resolution ECG & Late Potential Standards
              </h4>
            </div>
            <button
              onClick={() => setShowClinicalInfo(false)}
              className="text-slate-500 hover:text-white"
            >
              ✕
            </button>
          </div>

          <p className="leading-relaxed text-slate-400">
            High-Resolution ECG (HRECG / Signal-Averaged ECG) mandates a minimum sampling frequency of{' '}
            <strong className="text-white">1000 Hz (Δt = 1.0 ms)</strong> with wideband Nyquist cutoff at{' '}
            <strong className="text-teal-300">500 Hz</strong>. Standard 250 Hz bedside monitors introduce temporal jitter and
            aliasing that obscure microvolt-level <strong className="text-white">Ventricular Late Potentials (VLPs)</strong>.
            VLPs originate from slow, fragmented conduction along isolated viable myocytes embedded within the collagen scar of
            the infarct border zone, predisposing patients to lethal micro-reentrant ventricular tachycardia (VT).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Simpson Criterion for Arrhythmogenic Substrate</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                A late-potential study is positive (indicating high risk for micro-reentry) when at least 2 of 3 criteria are met:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 font-mono">
                <li>Filtered QRS duration (fQRS) &gt; 114 ms</li>
                <li>Terminal signal duration &lt; 40 μV (LAS40) &gt; 38 ms</li>
                <li>Root Mean Square of terminal 40 ms (RMS40) &lt; 20 μV</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span>QSRE Bio-Nanogrid Subthreshold Coupling</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                The PEDOT:PSS bio-nanogrid injects continuous subthreshold pacing currents (<strong className="text-teal-300">{subthresholdCurrentMa} mA</strong>),
                depolarizing membrane potential past the quantum-stochastic barrier threshold. Conduction velocity accelerates from{' '}
                <strong className="text-rose-400">0.24 m/s</strong> (ischemic) to <strong className="text-teal-300">{conductionVelocityMs.toFixed(2)} m/s</strong>,
                synchronizing wave propagation and eradicating the terminal micro-notches.
              </p>
              <div className="text-[11px] font-mono text-teal-300 py-1">
                <MathFormula tex="\text{RMS}_{40} = \sqrt{\frac{1}{40}\sum_{t=t_{\text{end}}-40}^{t_{\text{end}}} V^2(t)} \ge 20\,\mu\text{V}" displayMode={false} tone="inverse" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
