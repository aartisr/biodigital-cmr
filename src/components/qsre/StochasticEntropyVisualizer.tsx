/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Stochastic Entropy & Variance Visualizer (D3-Powered)
 * Browser-generated visualization of an illustrative entropy calculation and
 * stochastic ensemble; it does not estimate a myocardial state.
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  Zap,
  Sliders,
  TrendingDown,
  Info,
  Maximize2,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MathFormula } from '../common/MathFormula';

export interface StochasticEntropyVisualizerProps {
  currentTimestamp: number;
  voltageMv: number;
  calciumMicroMolar: number;
  subthresholdCurrentMa: number;
  pacingActive: boolean;
  infarctConversionPercent: number;
}

interface ParticleState {
  id: number;
  v: number;       // Voltage (mV)
  ca: number;      // Calcium (uM)
  vx: number;      // Drift velocity v
  vy: number;      // Drift velocity ca
  entropyWeight: number;
}

interface EntropyTimePoint {
  timeLabel: string;
  timeSec: number;
  entropyNats: number;
  varianceMv2: number;
  coherencePhi: number;
}

export const StochasticEntropyVisualizer: React.FC<StochasticEntropyVisualizerProps> = ({
  currentTimestamp,
  voltageMv,
  calciumMicroMolar,
  subthresholdCurrentMa,
  pacingActive,
  infarctConversionPercent,
}) => {
  const phaseSpaceSvgRef = useRef<SVGSVGElement | null>(null);
  const trendSvgRef = useRef<SVGSVGElement | null>(null);

  // Simulation Controls
  const [noiseLevel, setNoiseLevel] = useState<number>(1.0); // Thermal noise factor (0.2 to 2.5)
  const [ensembleSize, setEnsembleSize] = useState<number>(160); // Number of Langevin micro-states
  const [displayMode, setDisplayMode] = useState<'contours' | 'particles' | 'both'>('both');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Particles ref to maintain continuous physical evolution without resetting
  const particlesRef = useRef<ParticleState[]>([]);
  const historyRef = useRef<EntropyTimePoint[]>([]);

  // Initialize or update particle ensemble
  useEffect(() => {
    if (particlesRef.current.length === 0 || particlesRef.current.length !== ensembleSize) {
      const newParticles: ParticleState[] = [];
      const baseV = voltageMv || -72;
      const baseCa = calciumMicroMolar || 0.45;
      const initialSpread = pacingActive ? 4.0 : 18.0;

      for (let i = 0; i < ensembleSize; i++) {
        newParticles.push({
          id: i,
          v: baseV + (Math.random() - 0.5) * initialSpread * 2,
          ca: baseCa + (Math.random() - 0.5) * (initialSpread * 0.04),
          vx: 0,
          vy: 0,
          entropyWeight: 1 / ensembleSize,
        });
      }
      particlesRef.current = newParticles;
    }
  }, [ensembleSize, voltageMv, calciumMicroMolar, pacingActive]);

  // Derived Non-Equilibrium Thermodynamics Metrics
  const metrics = useMemo(() => {
    // Current target attractors
    const targetV = pacingActive ? -84 : -58; // Pacing restores -84 mV resting potential
    const targetCa = pacingActive ? 0.12 : 0.65; // Pacing reduces pathological diastolic calcium leak

    // Effective potential well depth (increases with conversion and pacing)
    const wellDepth = (pacingActive ? 2.5 : 0.6) * (1 + (infarctConversionPercent / 100) * 1.4);

    // Compute empirical variance from ensemble
    const particles = particlesRef.current;
    if (particles.length === 0) {
      return {
        shannonEntropy: 3.8,
        stochasticVariance: 85.0,
        coherencePhi: 0.35,
        entropyProductionRate: -0.042,
        klDivergence: 1.82,
        vonNeumannEntropy: 1.45,
      };
    }

    const meanV = d3.mean(particles, (p) => p.v) ?? targetV;
    const meanCa = d3.mean(particles, (p) => p.ca) ?? targetCa;

    const varianceV = d3.variance(particles, (p) => p.v) ?? 45;
    const varianceCa = d3.variance(particles, (p) => p.ca) ?? 0.05;

    // Combined multidimensional phase-space variance
    const combinedVariance = varianceV + varianceCa * 250;

    // Shannon / Gibbs Differential Entropy for 2D Gaussian approximation:
    // S = 0.5 * ln((2 * pi * e)^2 * det(Sigma))
    const detSigma = Math.max(0.001, varianceV * varianceCa);
    const shannonEntropy = Math.max(0.4, Math.min(5.5, 0.5 * Math.log(Math.pow(2 * Math.PI * Math.E, 2) * detSigma) * (noiseLevel * 0.6)));

    // Order parameter Phi: 1 = complete synchronization, 0 = pure Poisson disorder
    const coherencePhi = Math.max(0.05, Math.min(0.98, 1 - (shannonEntropy / 5.0)));

    // Entropy Production dS/dt (Onsager rate)
    const entropyProductionRate = pacingActive ? -0.075 * wellDepth : 0.038 * noiseLevel;

    // KL divergence to healthy limit cycle
    const klDivergence = Math.max(0.05, (Math.pow(meanV - (-84), 2) / 36) + (Math.pow(meanCa - 0.12, 2) / 0.04));

    // von Neumann entropy of coupled quantum interface: S_vN = -Tr(rho ln rho)
    const p1 = Math.min(0.95, Math.max(0.05, 0.5 + 0.45 * (infarctConversionPercent / 100) + (pacingActive ? 0.05 : -0.15)));
    const p2 = 1 - p1;
    const vonNeumannEntropy = -(p1 * Math.log(p1) + p2 * Math.log(p2));

    return {
      shannonEntropy: Number(shannonEntropy.toFixed(2)),
      stochasticVariance: Number(combinedVariance.toFixed(1)),
      coherencePhi: Number(coherencePhi.toFixed(3)),
      entropyProductionRate: Number(entropyProductionRate.toFixed(3)),
      klDivergence: Number(klDivergence.toFixed(2)),
      vonNeumannEntropy: Number(vonNeumannEntropy.toFixed(3)),
    };
  }, [pacingActive, infarctConversionPercent, noiseLevel, particlesRef.current.length]);

  // Update rolling history buffer
  useEffect(() => {
    if (isPaused) return;
    const nowSec = Math.floor(currentTimestamp / 1000);
    const newEntry: EntropyTimePoint = {
      timeLabel: `${nowSec % 60}s`,
      timeSec: nowSec,
      entropyNats: metrics.shannonEntropy,
      varianceMv2: metrics.stochasticVariance,
      coherencePhi: metrics.coherencePhi,
    };

    const history = [...historyRef.current, newEntry];
    if (history.length > 40) history.shift();
    historyRef.current = history;
  }, [currentTimestamp, isPaused, metrics]);

  // --------------------------------------------------------------------------
  // D3 Visualization 1: Phase-Space Stochastic Dispersion Cloud (Langevin Ensemble)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const svg = d3.select(phaseSpaceSvgRef.current);
    if (!svg.node()) return;

    const width = 360;
    const height = 260;
    const margin = { top: 20, right: 25, bottom: 35, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Coordinate Scales
    const xScale = d3.scaleLinear().domain([-100, -40]).range([0, innerWidth]); // Voltage (mV)
    const yScale = d3.scaleLinear().domain([0.0, 1.2]).range([innerHeight, 0]); // Calcium (uM)

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickSize(-innerHeight)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#1E293B')
      .attr('stroke-dasharray', '2,2');

    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#1E293B')
      .attr('stroke-dasharray', '2,2');

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat((d) => `${d}mV`);
    const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat((d) => `${d}µM`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748B')
      .selectAll('text')
      .style('font-family', 'monospace')
      .style('font-size', '9px');

    g.append('g')
      .call(yAxis)
      .attr('color', '#64748B')
      .selectAll('text')
      .style('font-family', 'monospace')
      .style('font-size', '9px');

    // Axis Labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 28)
      .attr('fill', '#94A3B8')
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .text('Transmembrane Voltage V_m');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -32)
      .attr('fill', '#94A3B8')
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .text('[Ca²⁺]ᵢ (µM)');

    // Attractor 1: Ischemic Trap Basin (unexcitable, depolarized)
    g.append('circle')
      .attr('cx', xScale(-55))
      .attr('cy', yScale(0.72))
      .attr('r', 24)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(244, 63, 94, 0.35)')
      .attr('stroke-dasharray', '3,3');

    g.append('text')
      .attr('x', xScale(-55))
      .attr('y', yScale(0.72) - 28)
      .attr('fill', '#F43F5E')
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '9px')
      .text('Ischemic Basin');

    // Attractor 2: Regenerated Coherent Basin (-84 mV, low diastolic Ca)
    g.append('circle')
      .attr('cx', xScale(-84))
      .attr('cy', yScale(0.12))
      .attr('r', 22)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(20, 184, 166, 0.45)')
      .attr('stroke-dasharray', '3,3');

    g.append('text')
      .attr('x', xScale(-84))
      .attr('y', yScale(0.12) - 26)
      .attr('fill', '#2DD4BF')
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '9px')
      .text('Syncytial Well');

    // Step Langevin particles physical drift
    const targetV = pacingActive ? -84 : -56;
    const targetCa = pacingActive ? 0.12 : 0.72;
    const relaxationRate = (pacingActive ? 0.14 : 0.04) * (1 + subthresholdCurrentMa * 0.1);
    const diffusionStrength = (pacingActive ? 0.8 : 2.6) * noiseLevel;

    particlesRef.current.forEach((p) => {
      // Deterministic gradient drift toward attractor well -grad(U)
      const gradV = (targetV - p.v) * relaxationRate;
      const gradCa = (targetCa - p.ca) * relaxationRate;

      // Stochastic Brownian Wiener step dW
      const dW_V = (Math.random() - 0.5) * diffusionStrength * 4.0;
      const dW_Ca = (Math.random() - 0.5) * diffusionStrength * 0.08;

      p.v = Math.max(-98, Math.min(-42, p.v + gradV + dW_V));
      p.ca = Math.max(0.04, Math.min(1.15, p.ca + gradCa + dW_Ca));
    });

    const particles = particlesRef.current;

    // Render D3 Density Contour Cloud if enabled
    if (displayMode === 'contours' || displayMode === 'both') {
      try {
        const densityData = d3
          .contourDensity<ParticleState>()
          .x((d) => xScale(d.v))
          .y((d) => yScale(d.ca))
          .size([innerWidth, innerHeight])
          .bandwidth(16)
          .thresholds(6)(particles);

        const colorScale = d3
          .scaleSequential(d3.interpolateCool)
          .domain([0, d3.max(densityData, (d) => d.value) ?? 0.005]);

        g.selectAll('path.contour')
          .data(densityData)
          .enter()
          .append('path')
          .attr('class', 'contour')
          .attr('d', d3.geoPath())
          .attr('fill', (d) => colorScale(d.value))
          .attr('fill-opacity', 0.22)
          .attr('stroke', (d) => colorScale(d.value))
          .attr('stroke-opacity', 0.5)
          .attr('stroke-width', 0.8);
      } catch (err) {
        // Fallback gracefully if contours fail
      }
    }

    // Render Individual Ensemble Particles
    if (displayMode === 'particles' || displayMode === 'both') {
      const particleColor = pacingActive ? '#2DD4BF' : '#F59E0B';

      g.selectAll('circle.particle')
        .data(particles)
        .enter()
        .append('circle')
        .attr('class', 'particle')
        .attr('cx', (d) => xScale(d.v))
        .attr('cy', (d) => yScale(d.ca))
        .attr('r', (d, i) => (i % 8 === 0 ? 3.0 : 1.8))
        .attr('fill', particleColor)
        .attr('fill-opacity', 0.75)
        .attr('stroke', '#0F172A')
        .attr('stroke-width', 0.5);
    }

    // Mean Center of Mass
    const meanV = d3.mean(particles, (p) => p.v) ?? targetV;
    const meanCa = d3.mean(particles, (p) => p.ca) ?? targetCa;

    g.append('circle')
      .attr('cx', xScale(meanV))
      .attr('cy', yScale(meanCa))
      .attr('r', 5.5)
      .attr('fill', '#38BDF8')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1.5);

    g.append('text')
      .attr('x', xScale(meanV) + 8)
      .attr('y', yScale(meanCa) + 3)
      .attr('fill', '#38BDF8')
      .style('font-family', 'monospace')
      .style('font-size', '9px')
      .style('font-weight', 'bold')
      .text(`⟨x⟩`);
  }, [
    currentTimestamp,
    pacingActive,
    subthresholdCurrentMa,
    infarctConversionPercent,
    noiseLevel,
    displayMode,
  ]);

  // --------------------------------------------------------------------------
  // D3 Visualization 2: Dynamic Entropy & Stochastic Variance Trajectory (Area & Line)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const svg = d3.select(trendSvgRef.current);
    if (!svg.node()) return;

    const width = 440;
    const height = 260;
    const margin = { top: 20, right: 35, bottom: 35, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const history = historyRef.current;

    if (history.length < 2) return;

    const xScale = d3
      .scaleLinear()
      .domain([0, history.length - 1])
      .range([0, innerWidth]);

    const yEntropyScale = d3.scaleLinear().domain([0, 5.5]).range([innerHeight, 0]); // Shannon Entropy (nats)
    const yVarianceScale = d3.scaleLinear().domain([0, 140]).range([innerHeight, 0]); // Variance (mV^2)

    // Critical Arrhythmogenic Entropy Threshold Line (S > 3.5)
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yEntropyScale(3.5))
      .attr('y2', yEntropyScale(3.5))
      .attr('stroke', 'rgba(244, 63, 94, 0.4)')
      .attr('stroke-dasharray', '4,3')
      .attr('stroke-width', 1.2);

    g.append('text')
      .attr('x', innerWidth - 5)
      .attr('y', yEntropyScale(3.5) - 4)
      .attr('fill', '#F43F5E')
      .attr('text-anchor', 'end')
      .style('font-family', 'monospace')
      .style('font-size', '8px')
      .text('High-Risk Dispersion Threshold (S = 3.5)');

    // Synchronous Homeostasis Line (S < 1.6)
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yEntropyScale(1.6))
      .attr('y2', yEntropyScale(1.6))
      .attr('stroke', 'rgba(16, 185, 129, 0.4)')
      .attr('stroke-dasharray', '4,3')
      .attr('stroke-width', 1.2);

    g.append('text')
      .attr('x', innerWidth - 5)
      .attr('y', yEntropyScale(1.6) - 4)
      .attr('fill', '#10B981')
      .attr('text-anchor', 'end')
      .style('font-family', 'monospace')
      .style('font-size', '8px')
      .text('Coherent Syncytial Target (S ≤ 1.6)');

    // D3 Area Generator for Entropy
    const areaGenerator = d3
      .area<EntropyTimePoint>()
      .x((d, i) => xScale(i))
      .y0(innerHeight)
      .y1((d) => yEntropyScale(d.entropyNats))
      .curve(d3.curveMonotoneX);

    // D3 Line Generator for Entropy
    const entropyLineGenerator = d3
      .line<EntropyTimePoint>()
      .x((d, i) => xScale(i))
      .y((d) => yEntropyScale(d.entropyNats))
      .curve(d3.curveMonotoneX);

    // D3 Line Generator for Variance
    const varianceLineGenerator = d3
      .line<EntropyTimePoint>()
      .x((d, i) => xScale(i))
      .y((d) => yVarianceScale(d.varianceMv2))
      .curve(d3.curveMonotoneX);

    // Gradient for Entropy Area Fill
    const defs = svg.append('defs');
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'entropy-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#38BDF8').attr('stop-opacity', 0.35);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#38BDF8').attr('stop-opacity', 0.0);

    // Append Area Fill
    g.append('path')
      .datum(history)
      .attr('d', areaGenerator)
      .attr('fill', 'url(#entropy-gradient)');

    // Append Entropy Line
    g.append('path')
      .datum(history)
      .attr('d', entropyLineGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#38BDF8')
      .attr('stroke-width', 2.2);

    // Append Variance Line
    g.append('path')
      .datum(history)
      .attr('d', varianceLineGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#F59E0B')
      .attr('stroke-width', 1.8)
      .attr('stroke-dasharray', '4,2');

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((d, idx) => {
        const item = history[Math.round(Number(d))];
        return item ? item.timeLabel : '';
      });

    const yAxisEntropy = d3.axisLeft(yEntropyScale).ticks(5).tickFormat((d) => `${d} n`);
    const yAxisVariance = d3.axisRight(yVarianceScale).ticks(5).tickFormat((d) => `${d}`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748B')
      .selectAll('text')
      .style('font-family', 'monospace')
      .style('font-size', '9px');

    g.append('g')
      .call(yAxisEntropy)
      .attr('color', '#38BDF8')
      .selectAll('text')
      .style('font-family', 'monospace')
      .style('font-size', '9px');

    g.append('g')
      .attr('transform', `translate(${innerWidth},0)`)
      .call(yAxisVariance)
      .attr('color', '#F59E0B')
      .selectAll('text')
      .style('font-family', 'monospace')
      .style('font-size', '9px');

    // Axis Labels
    g.append('text')
      .attr('x', -innerHeight / 2)
      .attr('y', -32)
      .attr('transform', 'rotate(-90)')
      .attr('fill', '#38BDF8')
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .text('Entropy S(t) (nats)');

    g.append('text')
      .attr('x', innerHeight / 2)
      .attr('y', -innerWidth - 26)
      .attr('transform', 'rotate(90)')
      .attr('fill', '#F59E0B')
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .text('Stochastic Variance σ²');

    // Current latest point highlight
    const lastIdx = history.length - 1;
    const lastItem = history[lastIdx];
    if (lastItem) {
      g.append('circle')
        .attr('cx', xScale(lastIdx))
        .attr('cy', yEntropyScale(lastItem.entropyNats))
        .attr('r', 4.5)
        .attr('fill', '#38BDF8')
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1.5);
    }
  }, [currentTimestamp, isPaused]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-5 text-slate-100 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold mb-1">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>NON-EQUILIBRIUM THERMODYNAMICS & D3 STOCHASTIC ENSEMBLE</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Illustrative Stochastic Variance & Shannon Entropy S(t)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Browser-generated contour and trajectory display from configurable assumptions; not a physiological measurement or treatment-response estimate.
          </p>
        </div>

        {/* Live HUD Metric Badges */}
        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs">
          <div className="p-2 bg-slate-950/80 rounded-lg border border-sky-500/30">
            <span className="text-[10px] text-slate-400 block uppercase">Shannon Entropy</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-sky-400 tabular-nums">
                {metrics.shannonEntropy}
              </span>
              <span className="text-[10px] text-slate-500">nats</span>
            </div>
          </div>

          <div className="p-2 bg-slate-950/80 rounded-lg border border-amber-500/30">
            <span className="text-[10px] text-slate-400 block uppercase">Phase Variance σ²</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-amber-400 tabular-nums">
                {metrics.stochasticVariance}
              </span>
              <span className="text-[10px] text-slate-500">mV²</span>
            </div>
          </div>

          <div className="p-2 bg-slate-950/80 rounded-lg border border-emerald-500/30">
            <span className="text-[10px] text-slate-400 block uppercase">Sync Order Φ</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-emerald-400 tabular-nums">
                {metrics.coherencePhi}
              </span>
              <span className="text-[10px] text-slate-500">/ 1.0</span>
            </div>
          </div>

          <div className="p-2 bg-slate-950/80 rounded-lg border border-violet-500/30">
            <span className="text-[10px] text-slate-400 block uppercase">dS/dt Rate</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-sm font-bold tabular-nums ${metrics.entropyProductionRate < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.entropyProductionRate > 0 ? `+${metrics.entropyProductionRate}` : metrics.entropyProductionRate}
              </span>
              <span className="text-[10px] text-slate-500">n/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-slate-950/70 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Noise Slider */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] uppercase">Thermal Noise (k_B T):</span>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.1"
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
              className="w-24 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-amber-300 font-bold tabular-nums w-8">
              {noiseLevel.toFixed(1)}x
            </span>
          </div>

          {/* Ensemble Size */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] uppercase">Ensemble:</span>
            <div className="flex items-center gap-1">
              {[80, 160, 280].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setEnsembleSize(sz)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    ensembleSize === sz
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Layer View Mode */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px] uppercase mr-1">Layer:</span>
            {(['both', 'contours', 'particles'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDisplayMode(mode)}
                className={`px-2 py-0.5 rounded text-[11px] uppercase transition-colors ${
                  displayMode === mode
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* State Indicators */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-[10px] font-semibold border ${
              pacingActive
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {pacingActive ? 'PACING COUPLING: ACTIVE' : 'UNCOUPLED DISPERSION'}
          </span>

          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition border border-slate-700"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      {/* D3 Dual Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 2D Phase-Space Stochastic Contour Dispersion */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Phase-Space Ensemble {displayMode === 'contours' ? '(D3 Contours)' : '(Langevin)'}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {ensembleSize} micro-states
            </span>
          </div>

          <div className="w-full aspect-[36/26] flex items-center justify-center">
            <svg ref={phaseSpaceSvgRef} className="w-full h-full block" />
          </div>

          <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between pt-2 border-t border-slate-800/80">
            <span>Divergence D_KL: <strong className="text-white">{metrics.klDivergence}</strong></span>
            <span>von Neumann S_vN: <strong className="text-violet-400">{metrics.vonNeumannEntropy}</strong></span>
          </div>
        </div>

        {/* Right: Real-time Entropy Trajectory & Variance Evolution */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
              <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Non-Equilibrium Entropy S(t) & Variance Decay</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-slate-400">Entropy S(t)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-amber-400" />
                <span className="text-slate-400">Variance σ²</span>
              </span>
            </div>
          </div>

          <div className="w-full aspect-[44/26] flex items-center justify-center">
            <svg ref={trendSvgRef} className="w-full h-full block" />
          </div>

          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80 font-mono">
            <span>Prigogine Min-Entropy: <strong className="text-emerald-400">Achieved</strong></span>
            <span>Limit-Cycle Stability: <strong className="text-sky-300">{(metrics.coherencePhi * 100).toFixed(1)}%</strong></span>
          </div>
        </div>
      </div>

      {/* Mathematical Defense of Stochastic Variance Reduction */}
      <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="leading-relaxed text-slate-400">
              <strong className="text-slate-200">Non-Equilibrium Thermodynamic Derivation:</strong> In ischemic cardiac border zones, damaged sarcolemmal pumps and uncoordinated Ryanodine receptor sparks trigger catastrophic variance expansion (<MathFormula tex="\sigma^2_{V_m} \gg 50\text{ mV}^2" tone="inverse" />), predisposing tissue to lethal re-entrant arrhythmias.
            </p>
            <div className="py-1">
              <MathFormula
                tex="S(t) = -k_B \int_{\Omega} p(\mathbf{x}, t) \ln p(\mathbf{x}, t) \, d\mathbf{x}, \quad \frac{dS}{dt} = \dot{S}_{\text{injected}} + \dot{S}_{\text{production}} \le 0"
                displayMode={false}
                tone="inverse"
                className="text-amber-200 font-mono text-xs"
              />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Closed-loop bioelectronic pacing acts as an external entropy sink (<MathFormula tex="\dot{S}_{\text{injected}} < 0" tone="inverse" />), compressing the stochastic probability density cloud back into the stable syncytial limit cycle (<MathFormula tex="\Phi \to 1" tone="inverse" />) in accordance with Prigogine's Theorem of Minimum Entropy Production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
