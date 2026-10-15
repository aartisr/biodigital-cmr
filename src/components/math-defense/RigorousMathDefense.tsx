/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Rigorous Mathematical Defense & Model Value-Add Explorer
 * Peer-review cadre theoretical foundation, formal proofs, sensitivity solvers,
 * and empirical value-add justification for BD-CMR and the QSRE kernel.
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Shield,
  HelpCircle,
  Sliders,
  Scale,
  ArrowRight,
} from 'lucide-react';
import { MathFormula } from '../common/MathFormula';
import { calculateQuantumTunneling } from '../../services/qsre/quantumTunnelingEngine';

export const RigorousMathDefense: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'theorems' | 'comparison' | 'sensitivity' | 'safety'>('theorems');

  // Interactive sensitivity playground state
  const [sensD, setSensD] = useState(1.8); // nm
  const [sensV0, setSensV0] = useState(2.8); // eV
  const [sensE, setSensE] = useState(1.2); // eV
  const [sensNoise, setSensNoise] = useState(1.2); // Noise factor

  const sensTunneling = calculateQuantumTunneling({
    barrierDistanceNm: sensD,
    barrierPotentialEv: sensV0,
    carrierEnergyEv: sensE,
    couplingMatrixElement: 0.12,
    densityOfStates: 1.45,
    effectiveMassRatio: 0.85,
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Title & scientific-scope header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-700 font-semibold mb-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span>PRECLINICAL MODEL SPECIFICATION & SCIENTIFIC REVIEW</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Rigorous Mathematical Foundation & Model Value-Add
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            A transparent, testable model of candidate mechanisms at the biomaterial–tissue interface. Equations define assumptions and measurable predictions; they do not establish clinical efficacy or safety.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setActiveSection('theorems')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeSection === 'theorems'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Formal Theorems & Proofs
          </button>
          <button
            onClick={() => setActiveSection('comparison')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeSection === 'comparison'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Model Value-Add Matrix
          </button>
          <button
            onClick={() => setActiveSection('sensitivity')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeSection === 'sensitivity'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sensitivity Sandbox
          </button>
          <button
            onClick={() => setActiveSection('safety')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeSection === 'safety'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Safety Invariants
          </button>
        </div>
      </div>

      {/* SECTION 1: FORMAL THEOREMS & RIGOROUS PROOFS */}
      {activeSection === 'theorems' && (
        <div className="flex flex-col gap-6">
          {/* Executive epistemic thesis */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed">
            <strong className="text-slate-900 block mb-1">
              Scope, identifiability, and burden of proof
            </strong>
            This workspace is a hypothesis-generating, multiscale model—not a clinical decision rule. Continuum electrophysiology remains useful; stochastic, transport, and graph models are introduced only when their parameters can be identified from measurements. Each proposed mechanism must be calibrated in relevant bench systems, challenged against negative controls, and then tested prospectively for predictive value and safety.
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-950 leading-relaxed">
            <strong className="block mb-1">Translation guardrail</strong>
            No equation below demonstrates mitochondrial electron injection, ATP rescue, anti-apoptotic activity, arrhythmia prevention, or human benefit. Those are separate experimental and regulatory claims requiring measured coupling, exposure, dose–response, off-target, thermal, electrochemical, and arrhythmia endpoints.
            <p className="mt-2 text-xs text-amber-900">
              Method anchors: <a className="underline underline-offset-2" href="https://doi.org/10.1039/C1CS15207F" target="_blank" rel="noreferrer">Zhao &amp; Liang, 2012</a> for weak-coupling electron-transfer rate theory; <a className="underline underline-offset-2" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2883780/" target="_blank" rel="noreferrer">Matyushov et al.</a> for fluctuation-sensitive biological electron transfer.
            </p>
          </div>

          {/* Theorem 1 */}
          <div className="border border-slate-200 rounded-xl p-5 flex flex-col gap-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-sky-700 uppercase tracking-wide">
                Model 1 · Nanoscale Electron-Transfer Sensitivity
              </span>
              <span className="text-xs text-slate-500 font-mono">Time-Dependent Perturbation Theory</span>
            </div>
            <h4 className="text-base font-semibold text-slate-900">
              Distance-Dependent Nonadiabatic Electron-Transfer Hypothesis
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <MathFormula
                tex={String.raw`k_{\mathrm{ET}} = \frac{2\pi}{\hbar}|H_{DA}(d)|^2\,\mathrm{FCWD}(\Delta G,\lambda,T), \qquad |H_{DA}(d)| \approx |H_0|e^{-\int_0^d\kappa(x)\,dx}`}
                displayMode={true}
              />
            </div>
            <div className="text-sm text-slate-700 space-y-2">
              <p>
                <strong>Model statement:</strong> In the weak-coupling limit, Fermi’s Golden Rule describes an electron-transfer <em>rate</em>, <MathFormula tex={String.raw`k_{\mathrm{ET}}`} />, through the electronic coupling <MathFormula tex={String.raw`H_{DA}`} /> and the Franck–Condon weighted density of states. The expression has rate units; it is not a transmission probability or a charge-current prediction by itself.
              </p>
              <p>
                For a one-dimensional, classically forbidden barrier, WKB supplies a distance-sensitivity ansatz for <MathFormula tex={String.raw`H_{DA}(d)`} />. Its use requires a specified barrier profile, effective mass, donor–acceptor geometry, and a regime where the semiclassical approximation is valid; collagen thickness alone is insufficient to identify these quantities.
              </p>
              <div className="text-center py-1">
                <MathFormula tex={String.raw`\kappa = \frac{\sqrt{2m^*(V_0 - E)}}{\hbar}`} />
              </div>
              <p>
                <strong>Falsifiable prediction:</strong> At fixed redox driving force and temperature, measured coupling should decline approximately exponentially with independently measured donor–acceptor separation. The model is rejected or revised if spectroscopy or electrochemistry does not recover this relationship. Any inference to ATP production or cell survival requires separate cellular assays and dose–response evidence.
              </p>
            </div>
          </div>

          {/* Theorem 2 */}
          <div className="border border-slate-200 rounded-xl p-5 flex flex-col gap-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-amber-700 uppercase tracking-wide">
                Model 2 · Stochastic Excitability State Estimation
              </span>
              <span className="text-xs text-slate-500 font-mono">Multivariate Fokker-Planck & Kramers Escape</span>
            </div>
            <h4 className="text-base font-semibold text-slate-900">
              Fokker–Planck Representation of Measured Cellular-State Variability
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <MathFormula
                tex={String.raw`\frac{\partial p}{\partial t} = -\sum_{i=1}^n \frac{\partial}{\partial x_i}\left[D_i(x,t)p\right] + \frac{1}{2}\sum_{i=1}^n \sum_{j=1}^n \frac{\partial^2}{\partial x_i \partial x_j}\left[Q_{ij}(x,t)p\right]`}
                displayMode={true}
              />
            </div>
            <div className="text-sm text-slate-700 space-y-2">
              <p>
                <strong>Model statement:</strong> Let the state vector <MathFormula tex={String.raw`x = [V_m,[Ca^{2+}]_i,[Na^+]_i,\mathrm{pH}]^T`} /> be estimated from a specified experimental system. The drift <MathFormula tex={String.raw`D_i`} /> and diffusion tensor <MathFormula tex={String.raw`Q_{ij}`} /> must be fitted to time-resolved data; they are not universal constants of infarct tissue.
              </p>
              <p>
                A potential landscape <MathFormula tex={String.raw`U(x)`} /> may be inferred only when the data support a reduced gradient representation. Competing non-gradient and history-dependent models must be compared by out-of-sample likelihood and calibration, rather than assumed away.
              </p>
              <p>
                By Kramers escape theory, the transition rate out of the ischemic trap is:
              </p>
              <div className="text-center py-1">
                <MathFormula tex={String.raw`r_K = \frac{\omega_0 \omega_b}{2\pi \gamma} \exp\left(-\frac{\Delta U(I_{\text{stim}})}{k_B T}\right)`} />
              </div>
              <p>
                Stimulation can be represented as a controlled perturbation to the drift, <MathFormula tex={String.raw`\Delta D_V = I_{\mathrm{stim}}/C_m`} />, but the assumed linear barrier response must be tested. Prospective validation must report both benefit-oriented endpoints and provoked-arrhythmia endpoints; the model cannot guarantee either outcome.
              </p>
            </div>
          </div>

          {/* Theorem 3 */}
          <div className="border border-slate-200 rounded-xl p-5 flex flex-col gap-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-blue-700 uppercase tracking-wide">
                Model 3 · Conductivity-Field Representation
              </span>
              <span className="text-xs text-slate-500 font-mono">Metric Tensor & Geodesic Curvature</span>
            </div>
            <h4 className="text-base font-semibold text-slate-900">
              Conductivity Heterogeneity and Wave-Break Risk: A Testable Surrogate
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <MathFormula
                tex={String.raw`\sigma^{ij} = \sigma_0 \sqrt{\det g} \, g^{ij}, \quad \nabla_j \sigma^{ij} = 0, \quad \oint_{\partial \Omega} \nabla \theta \cdot ds = 0`}
                displayMode={true}
              />
            </div>
            <div className="text-sm text-slate-700 space-y-2">
              <p>
                <strong>Model statement:</strong> A spatially varying conductivity tensor can represent anisotropy and heterogeneity in an excitable-tissue simulation. It is a modelling choice, not evidence that scar tissue itself is a Riemannian manifold or that a Ricci-scalar threshold is clinically meaningful.
              </p>
              <p>
                A phase singularity is characterized by non-zero phase winding, such as <MathFormula tex={String.raw`\oint \nabla\theta\cdot ds = \pm 2\pi`} />. Whether a conductivity intervention changes wave-break probability must be assessed in validated electrophysiology models and then in experimental preparations with blinded endpoint adjudication.
              </p>
              <p>
                <strong>Falsifiable prediction:</strong> A patch that changes the measured conductivity field may alter simulated activation and re-entry metrics. It does not imply <MathFormula tex={String.raw`\oint \nabla\theta\cdot ds = 0`} /> in vivo or eliminate arrhythmia risk; those require direct mapping and safety studies.
              </p>
            </div>
          </div>

          {/* Theorem 4 */}
          <div className="border border-slate-200 rounded-xl p-5 flex flex-col gap-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wide">
                Model 4 · Constrained Network-Connectivity Optimization
              </span>
              <span className="text-xs text-slate-500 font-mono">Topological Syncytium Optimization</span>
            </div>
            <h4 className="text-base font-semibold text-slate-900">
              Connectivity Optimization Under Explicit Energy Constraints
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <MathFormula
                tex={String.raw`\max_{S \subseteq E_{\text{mesh}}} F(S) = \sum_{u,v \in V} w_{uv} \prod_{e \in \text{path}(u,v)} P_{\text{conduction}}(e) \quad \text{s.t.} \quad \sum_{e \in S} I_e^2 R_e \le P_{\text{max}}`}
                displayMode={true}
              />
            </div>
            <div className="text-sm text-slate-700 space-y-2">
              <p>
                <strong>Mathematical scope:</strong> For an ideal, infinite square lattice with independent bonds, the bond-percolation threshold is <MathFormula tex={String.raw`p_c = 1/2`} />. Cardiac tissue is finite, anisotropic, correlated, and dynamic, so its effective threshold must be estimated rather than borrowed from the ideal lattice.
              </p>
              <p>
                The constrained optimization identifies candidate bridge layouts <MathFormula tex={String.raw`S^*`} /> under a declared power budget. Its output is a design hypothesis: it must be compared against sham layouts and evaluated for conduction, tissue response, stability, and failure modes before claims of restored connectivity are justified.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MODEL VALUE-ADD MATRIX */}
      {activeSection === 'comparison' && (
        <div className="flex flex-col gap-5">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
            <strong className="text-slate-900 block mb-1">
              Comparative Analysis: Conventional Macroscopic Telemetry vs. BD-CMR QSRE
            </strong>
            This is a hypothesis and evidence matrix, not a claim of established clinical superiority. Each proposed advantage requires a prespecified comparator, dataset, endpoint, uncertainty interval, and external validation cohort.
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Evaluation Dimension</th>
                  <th className="py-3 px-4 font-semibold text-slate-500">Conventional Macro Telemetry</th>
                  <th className="py-3 px-4 font-semibold text-sky-800 bg-sky-50/50">BD-CMR Quantum-Stochastic Framework</th>
                  <th className="py-3 px-4 font-semibold text-emerald-800">Clinical & Biophysical Value-Add</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Physical Scale of Modeling</td>
                  <td className="py-3 px-4 text-slate-600">Millimeter-scale organ continuum</td>
                  <td className="py-3 px-4 bg-sky-50/30 text-sky-900 font-medium">Sub-nanometer (0.1 - 3.5 nm) quantum-stochastic</td>
                  <td className="py-3 px-4 text-emerald-700">Generates a testable nanoscale transport hypothesis.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Ion Channel Gating Kinetics</td>
                  <td className="py-3 px-4 text-slate-600">Deterministic Hodgkin-Huxley rates</td>
                  <td className="py-3 px-4 bg-sky-50/30 text-sky-900 font-medium">Multivariate Fokker-Planck with Langevin noise Q_ij</td>
                  <td className="py-3 px-4 text-emerald-700">Can be evaluated against measured channel-state variability.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Infarct Mechanical Stress</td>
                  <td className="py-3 px-4 text-slate-600">Euclidean isotropic stress tensor</td>
                  <td className="py-3 px-4 bg-sky-50/30 text-sky-900 font-medium">Riemannian differential geometry (Ricci curvature R)</td>
                  <td className="py-3 px-4 text-emerald-700">Creates a falsifiable surrogate for wave-break risk.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Bioelectronic Patch Interaction</td>
                  <td className="py-3 px-4 text-slate-600">Passive fixed-current pacing electrode</td>
                  <td className="py-3 px-4 bg-sky-50/30 text-sky-900 font-medium">Adaptive closed-loop syncytial percolation optimizer</td>
                  <td className="py-3 px-4 text-emerald-700">Optimizes a declared model objective under a power constraint.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Arrhythmia Detection Sensitivity</td>
                  <td className="py-3 px-4 text-slate-600">Post-event threshold alarm (lag &gt; 3.5s)</td>
                  <td className="py-3 px-4 bg-sky-50/30 text-sky-900 font-medium">Predictive Kramers escape probability (anticipatory)</td>
                  <td className="py-3 px-4 text-emerald-700">Produces a prospective risk score to test against clinical and preclinical endpoints.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: SENSITIVITY SANDBOX */}
      {activeSection === 'sensitivity' && (
        <div className="flex flex-col gap-5">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
            <strong className="text-slate-900 block mb-1">
              Interactive Mathematical Sensitivity & Stability Sandbox
            </strong>
            Explore a parameterized model, not a calibrated patient prediction. Values are scenario inputs; outputs are conditional on the stated equations and should be compared with measured data before use in design or decision-making.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 border border-slate-200 rounded-xl bg-white">
            {/* Sliders Column */}
            <div className="flex flex-col gap-4">
              <span className="text-sm font-semibold text-slate-900">Tunable Physical Variables</span>

              {/* Barrier Width */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600">Fibrotic Barrier Width (d):</span>
                  <span className="font-bold text-slate-900">{sensD.toFixed(2)} nm</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.05"
                  value={sensD}
                  onChange={(e) => setSensD(parseFloat(e.target.value))}
                  className="w-full accent-sky-600"
                />
                <span className="text-[10px] text-slate-400 font-mono">
                  Exponential sensitivity: P_if ∝ exp(-2κd)
                </span>
              </div>

              {/* Potential Barrier */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600">Potential Barrier (V₀):</span>
                  <span className="font-bold text-slate-900">{sensV0.toFixed(2)} eV</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="4.5"
                  step="0.05"
                  value={sensV0}
                  onChange={(e) => setSensV0(parseFloat(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              {/* Carrier Energy */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600">Electron Energy in Polymer (E):</span>
                  <span className="font-bold text-slate-900">{sensE.toFixed(2)} eV</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max={Math.min(sensV0 - 0.1, 2.5)}
                  step="0.05"
                  value={sensE}
                  onChange={(e) => setSensE(parseFloat(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              {/* Thermal Noise */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600">Thermal Noise Scaling (Q):</span>
                  <span className="font-bold text-slate-900">{sensNoise.toFixed(2)}×</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={sensNoise}
                  onChange={(e) => setSensNoise(parseFloat(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>

            {/* Results Column */}
            <div className="flex flex-col justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
              <span className="text-sm font-semibold text-slate-900 font-sans">
                Conditional Model Output
              </span>

              <div className="space-y-3 mt-3">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-600">Tunneling Probability (P_if):</span>
                  <strong className="text-slate-900 tabular-nums">
                    {(sensTunneling.probability * 100).toFixed(4)} %
                  </strong>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-600">Calculated Electron Flux:</span>
                  <strong className="text-sky-700 tabular-nums">
                    {sensTunneling.electronFluxPicoAmps.toFixed(2)} pA
                  </strong>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-600">Evanescent Decay Length (1/κ):</span>
                  <strong className="text-slate-900 tabular-nums">
                    {sensTunneling.wavefunctionDecayLengthNm.toFixed(3)} nm
                  </strong>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-600">Phase Coherence Lifetime:</span>
                  <strong className="text-slate-900 tabular-nums">
                    {sensTunneling.coherenceTimeFs.toFixed(1)} fs
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Proton Hopping Rate:</span>
                  <strong className="text-slate-900 tabular-nums">
                    {sensTunneling.protonHoppingRateThz.toFixed(2)} THz
                  </strong>
                </div>
              </div>

              <div className="mt-4 p-2.5 bg-sky-50 rounded border border-sky-100 text-[11px] text-sky-800">
                <strong>Validation status:</strong> Illustrative calculation only. Before use, preregister parameter ranges; measure transport, thermal, electrochemical, and electrophysiology endpoints; and report uncertainty and negative controls.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SAFETY INVARIANTS */}
      {activeSection === 'safety' && (
        <div className="flex flex-col gap-5">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
            <strong className="text-slate-900 block mb-1">
              Regulatory Compliance & Epistemic Safety Invariants
            </strong>
            These are proposed software checks, not certified safety limits or proof of compliance. Applicable limits depend on electrode geometry, waveform, exposure, tissue, device classification, and the governing standard; independent verification and formal risk management are required.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Invariant 1: Shannon Limit */}
            <div className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-emerald-700">
                <Shield className="w-4 h-4" />
                <span>INVARIANT 1 · SHANNON LIMIT</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Charge Density Per Phase Boundary
              </h4>
              <div className="p-2 bg-slate-50 rounded text-center my-1">
                <MathFormula tex={String.raw`\log(Q/A) \le 1.8 - \log(Q)`} displayMode={false} />
              </div>
              <p className="text-xs text-slate-600">
                Candidate charge-density screening rule. It must be evaluated against the actual electrode material, waveform, impedance, and electrochemical measurements; it does not guarantee absence of tissue injury or gas formation.
              </p>
            </div>

            {/* Invariant 2: Thermal Limit */}
            <div className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-emerald-700">
                <Shield className="w-4 h-4" />
                <span>INVARIANT 2 · THERMAL BOUND</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Maximum Joule Heating Dissipation
              </h4>
              <div className="p-2 bg-slate-50 rounded text-center my-1">
                <MathFormula tex={String.raw`\int_{\Omega} \sigma |\mathbf{E}|^2 \, dV \le 0.5\text{ mJ/cm}^2`} displayMode={false} />
              </div>
              <p className="text-xs text-slate-600">
                Candidate thermal screening rule. Temperature rise must be validated with a coupled electrical–thermal model and measured under worst-case duty cycles; the displayed bound is a design target, not an established myocardial limit.
              </p>
            </div>

            {/* Invariant 3: Pro-arrhythmia Gate */}
            <div className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-emerald-700">
                <Shield className="w-4 h-4" />
                <span>INVARIANT 3 · VULNERABLE WINDOW</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                T-Wave Vulnerable Zone Lockout
              </h4>
              <div className="p-2 bg-slate-50 rounded text-center my-1">
                <MathFormula tex={String.raw`t_{\text{stim}} \notin [t_{\text{peak}} - 30\text{ms}, t_{\text{end}}]`} displayMode={false} />
              </div>
              <p className="text-xs text-slate-600">
                Candidate timing interlock. Its detection latency, sensing failure modes, and residual pro-arrhythmic risk require verification; no timing rule mathematically eliminates R-on-T risk in biological tissue.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
