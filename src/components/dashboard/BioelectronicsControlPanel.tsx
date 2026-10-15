/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bioelectronics Control Panel
 * Configures soft conductive hydrogel patch parameters, closed-loop pacing,
 * biphasic pulse waveforms, and IEEE/ISO 14708-3 charge injection limits.
 */

import React from 'react';
import { Cpu, ShieldCheck, Power, Sliders } from 'lucide-react';
import { BioelectronicsStimulatorConfig } from '../../types/bdcmr';

interface BioelectronicsControlPanelProps {
  config: BioelectronicsStimulatorConfig;
  onUpdateConfig: (updated: Partial<BioelectronicsStimulatorConfig>) => void;
  onResetDefaults: () => void;
}

export const BioelectronicsControlPanel: React.FC<BioelectronicsControlPanelProps> = ({
  config,
  onUpdateConfig,
  onResetDefaults,
}) => {
  // Shannon equation charge injection limit: Q = I * pulseWidth
  const chargePerPhaseMicroC = config.currentAmplitudeMa * config.pulseWidthMs;
  const isWithinShannonLimit = chargePerPhaseMicroC <= config.chargeInjectionLimitMicroCoulomb;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
      {/* Title & Master Power */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-600 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Soft Bioelectronic Hydrogel Stimulator
            </h3>
            <p className="text-xs text-slate-500">
              PEDOT:PSS / CNT nanocomposite interface with adaptive closed-loop feedback
            </p>
          </div>
        </div>

        {/* Master Power Toggle */}
        <button
          onClick={() => onUpdateConfig({ isEnabled: !config.isEnabled })}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            config.isEnabled
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          {config.isEnabled ? 'Stimulator Active' : 'Stimulator Inactive'}
        </button>
      </div>

      {/* Auto-tune & Mode Matrix */}
      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-600" />
          <div>
            <span className="font-medium text-slate-900">Closed-Loop Auto-Tune</span>
            <div className="text-[11px] text-slate-500">
              Dynamically modulates current vector to extinguish ST-elevation
            </div>
          </div>
        </div>
        <button
          disabled={!config.isEnabled}
          onClick={() => onUpdateConfig({ closedLoopAutoTune: !config.closedLoopAutoTune })}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            config.closedLoopAutoTune
              ? 'bg-sky-600 text-white'
              : 'bg-slate-200 text-slate-600'
          } ${!config.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {config.closedLoopAutoTune ? 'Engaged' : 'Manual Pacing'}
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Amplitude */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Current Amplitude</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {config.currentAmplitudeMa.toFixed(2)} mA
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="4.0"
            step="0.05"
            disabled={!config.isEnabled || config.closedLoopAutoTune}
            value={config.currentAmplitudeMa}
            onChange={(e) => onUpdateConfig({ currentAmplitudeMa: parseFloat(e.target.value) })}
            className="w-full accent-sky-600 disabled:opacity-40"
          />
          <span className="text-[10px] text-slate-400 font-mono">Range: 0.1 - 4.0 mA</span>
        </div>

        {/* Pulse Width */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Pulse Width</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {config.pulseWidthMs.toFixed(2)} ms
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.05"
            disabled={!config.isEnabled || config.closedLoopAutoTune}
            value={config.pulseWidthMs}
            onChange={(e) => onUpdateConfig({ pulseWidthMs: parseFloat(e.target.value) })}
            className="w-full accent-sky-600 disabled:opacity-40"
          />
          <span className="text-[10px] text-slate-400 font-mono">Range: 0.2 - 2.0 ms</span>
        </div>

        {/* Frequency */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Frequency</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {config.frequencyHz.toFixed(1)} Hz ({(config.frequencyHz * 60).toFixed(0)} bpm)
            </span>
          </div>
          <input
            type="range"
            min="0.8"
            max="3.0"
            step="0.1"
            disabled={!config.isEnabled || config.closedLoopAutoTune}
            value={config.frequencyHz}
            onChange={(e) => onUpdateConfig({ frequencyHz: parseFloat(e.target.value) })}
            className="w-full accent-sky-600 disabled:opacity-40"
          />
          <span className="text-[10px] text-slate-400 font-mono">Range: 0.8 - 3.0 Hz</span>
        </div>
      </div>

      {/* Waveform Selector & Nanotech Stats */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">Waveform:</span>
          {(['quantum_stochastic_adaptive', 'biphasic_symmetric', 'monophasic_cathodic'] as const).map(
            (wf) => (
              <button
                key={wf}
                disabled={!config.isEnabled}
                onClick={() => onUpdateConfig({ waveform: wf })}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  config.waveform === wf
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                } ${!config.isEnabled ? 'opacity-40' : ''}`}
              >
                {wf.replace('_', ' ')}
              </button>
            )
          )}
        </div>

        {/* Shannon Charge Injection Limit Safety Badge */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <ShieldCheck className={`w-4 h-4 ${isWithinShannonLimit ? 'text-emerald-600' : 'text-rose-600'}`} />
          <span className="text-slate-600">
            Charge/Phase:{' '}
            <strong className="text-slate-900 tabular-nums">{chargePerPhaseMicroC.toFixed(2)}</strong> μC
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600">
            Z: <strong className="text-slate-900">{config.contactImpedanceOhmCm}</strong> Ω·cm
          </span>
        </div>
      </div>
    </div>
  );
};
