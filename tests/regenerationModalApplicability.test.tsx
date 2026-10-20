import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RegenerativePredictionModal } from '../src/components/RegenerativePredictionModal';
import { miScenarioPhenotypes } from '../src/config/mi/scenarioPhenotypes';
import type { CellularSensorMetrics, EpigeneticDosingState, NanogridPacingState, PatientProfile, PatientVitals } from '../src/types/bdcmr';

test('unsupported patients see reasons while projection controls remain hidden', () => {
  const html = renderToStaticMarkup(
    <RegenerativePredictionModal
      isOpen
      onClose={() => undefined}
      patient={{
        id: 'modal-applicability-test',
        mrnTokenized: 'MRN-TEST',
        patientFullNameMasked: 'Test Patient',
        postInfarcDay: 2,
        infarctLocation: 'Unknown',
        currentLVEF: 42,
        currentScarAreaCm2: 18,
      } as PatientProfile}
      cellular={{ youngsModulusKPa: 19, iCMConversionEstimate: 28 } as CellularSensorMetrics}
      vitals={{} as PatientVitals}
      dosing={{ infusionRateNlMin: 240 } as EpigeneticDosingState}
      pacing={{ subthresholdCurrentMA: 0.85 } as NanogridPacingState}
    />,
  );

  assert.match(html, /Projection unavailable for this case/);
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /aria-labelledby="regeneration-simulator-title"/);
  assert.match(html, /id="regeneration-simulator-title"/);
  assert.match(html, /aria-label="Close Regeneration Sensitivity Simulator \(48-Hour\)"/);
  assert.match(html, /Structured infarct phenotype/);
  assert.match(html, /bdcmr-fixed-48h-sensitivity/);
  assert.match(html, /INSUFFICIENT_INPUTS/);
  assert.doesNotMatch(html, /Simulation Horizon/);
  assert.doesNotMatch(html, /What-If Therapeutic Sensitivity Simulator/);
  assert.doesNotMatch(html, /Projected 48h Softening/);
});

const supportedFixture = miScenarioPhenotypes.find((candidate) => candidate.id === 'lateral-subacute-v1');
assert.ok(supportedFixture);
const supportedPatient = {
  id: 'modal-supported-test',
  mrnTokenized: 'MRN-SUPPORTED',
  patientFullNameMasked: 'Supported Patient',
  postInfarcDay: 18,
  infarctLocation: 'Structured phenotype',
  currentLVEF: 42,
  currentScarAreaCm2: 18,
  infarctPhenotype: supportedFixture.phenotype,
} as PatientProfile;
const supportedCellular = { youngsModulusKPa: 19, iCMConversionEstimate: 28 } as CellularSensorMetrics;
const supportedVitals = {} as PatientVitals;
const supportedDosing = { infusionRateNlMin: 240 } as EpigeneticDosingState;
const supportedPacing = { subthresholdCurrentMA: 0.85 } as NanogridPacingState;

test('projection viewers can inspect eligible output without what-if controls', () => {
  const html = renderToStaticMarkup(<RegenerativePredictionModal
    isOpen
    onClose={() => undefined}
    patient={supportedPatient}
    cellular={supportedCellular}
    vitals={supportedVitals}
    dosing={supportedDosing}
    pacing={supportedPacing}
  />);

  assert.match(html, /Simulation Horizon/);
  assert.match(html, /Projected 48h Softening/);
  assert.doesNotMatch(html, /What-If Therapeutic Sensitivity Simulator/);
  assert.doesNotMatch(html, /type="range"/);
});

test('what-if capability enables model-input sensitivity controls', () => {
  const html = renderToStaticMarkup(<RegenerativePredictionModal
    isOpen
    onClose={() => undefined}
    patient={supportedPatient}
    cellular={supportedCellular}
    vitals={supportedVitals}
    dosing={supportedDosing}
    pacing={supportedPacing}
    allowWhatIf
  />);

  assert.match(html, /What-If Therapeutic Sensitivity Simulator/);
  assert.match(html, /type="range"/);
});