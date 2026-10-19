/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Persona Policy Card
 * Provides domain-specific clinical/engineering insights, active policy constraints,
 * and safety thresholds tailored to the chosen professional persona.
 */

import React from 'react';
import { Stethoscope, Cpu, Atom, ShieldAlert } from 'lucide-react';
import { PersonaType } from '../../types/bdcmr';

interface PersonaPolicyCardProps {
  activePersona: PersonaType;
}

export const PersonaPolicyCard: React.FC<PersonaPolicyCardProps> = ({ activePersona }) => {
  const getPersonaDetails = () => {
    switch (activePersona) {
      case 'cardiologist':
        return {
          icon: <Stethoscope className="w-5 h-5 text-rose-600 shrink-0" />,
          title: 'Clinical Cardiologist Perspective',
          directive: 'Monitoring Left Ventricular Remodeling & Ischemic ST-Segment Normalization',
          kpis: ['ST Elevation ΔST < 0.05 mV', 'Ejection Fraction > 50%', 'Arrhythmia Reentry Risk < 15%'],
          guideline: 'Priority: Prompt resolution of ST elevation and restoration of homogenous ventricular conduction. Avoid pacing in the refractory vulnerable window to prevent R-on-T induction of ventricular fibrillation.',
          badgeColor: 'border-rose-200 bg-rose-50 text-rose-800',
        };
      case 'bioelectronics_engineer':
        return {
          icon: <Cpu className="w-5 h-5 text-sky-600 shrink-0" />,
          title: 'Nanotechnology & Bioelectronics Perspective',
          directive: 'Conductive Hydrogel Patch Integrity & Electrochemical Charge Injection',
          kpis: ['Contact Impedance Z < 50 Ω·cm', 'Shannon Limit k ≤ 1.8', 'Hydrogel Conductivity σ > 120 S/m'],
          guideline: 'Priority: Maintain high reversible capacitive charge injection capacity through the PEDOT:PSS / CNT matrix while preventing faradaic electrode dissolution and hydrolysis.',
          badgeColor: 'border-sky-200 bg-sky-50 text-sky-800',
        };
      case 'quantum_biophysicist':
        return {
          icon: <Atom className="w-5 h-5 text-teal-600 shrink-0" />,
          title: 'Quantum Biophysicist Perspective',
          directive: 'Sub-Cellular Hamiltonian Coupling & Tunneling Flux to Mitochondrial Matrix',
          kpis: ['Tunneling Flux J > 10 pA', 'Barrier Width d ≤ 2.2 nm', 'Phase Coherence τ > 25 fs'],
          guideline: 'Priority: Maximize Bardeen-Condon electron transfer probability to mitochondrial respiratory complex IV across nanometer fibrotic barriers to halt ischemic cardiomyocyte apoptosis.',
          badgeColor: 'border-teal-200 bg-teal-50 text-teal-800',
        };
      case 'regulatory_auditor':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-emerald-600 shrink-0" />,
          title: 'Regulatory & Ethics Auditor Perspective',
          directive: 'ISO 14708-3 Active Implantable Medical Device Safety & Non-Thermal Pacing',
          kpis: ['Joule Dissipation ≤ 0.5 mJ/cm²', 'Charge Balance ΔQ < 0.1 μC', 'Fail-Safe Lockout Active'],
          guideline: 'Priority: Ensure all pacing stimuli comply with strict energy dissipation thresholds (ΔT < 0.05°C) with guaranteed hardware lockout during vulnerable cardiac phases.',
          badgeColor: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        };
    }
  };

  const p = getPersonaDetails();

  return (
    <div className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${p.badgeColor}`}>
      <div className="flex items-start gap-3">
        {p.icon}
        <div>
          <div className="font-semibold text-slate-900 tracking-tight text-sm">
            {p.title}
          </div>
          <div className="text-slate-600 mt-0.5 font-medium">
            {p.directive}
          </div>
          <div className="text-slate-500 mt-1">
            {p.guideline}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
          Enforced Policy Targets:
        </span>
        {p.kpis.map((kpi, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 bg-white/90 border border-slate-200 rounded font-mono text-[11px] text-slate-800 shadow-xs"
          >
            {kpi}
          </span>
        ))}
      </div>
    </div>
  );
};
