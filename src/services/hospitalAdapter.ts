/**
 * Synthetic FHIR-shaped research preview.
 *
 * It performs no network work and must not be used as an EHR payload. The
 * preview exists only to make the proposed interoperability boundary inspectable.
 */

import { CellularSensorMetrics, EpigeneticDosingState, NanogridPacingState, PatientProfile, PatientVitals } from '../types/bdcmr';

export interface FhirObservationBundle {
  resourceType: 'Bundle';
  type: 'collection';
  entry: Array<{
    resource: {
      resourceType: string;
      id: string;
      status: string;
      code: {
        coding: Array<{ system: string; code: string; display: string }>;
      };
      subject: { reference: string };
      effectiveDateTime: string;
      valueQuantity?: { value: number; unit: string; system: string; code: string };
      valueString?: string;
    };
  }>;
}

export function generateFhirR4Bundle(
  patient: PatientProfile,
  cellular: CellularSensorMetrics,
  vitals: PatientVitals,
  dosing: EpigeneticDosingState,
  pacing: NanogridPacingState
): FhirObservationBundle {
  const timestamp = new Date().toISOString();
  const subjectRef = 'Patient/synthetic-research-subject';

  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      {
        resource: {
          resourceType: 'Observation',
          id: `synthetic-cmr-stiffness-${Date.now()}`,
          status: 'preliminary',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '93041-2',
                display: 'Myocardial Tissue Youngs Modulus (Stiffness)',
              },
            ],
          },
          subject: { reference: subjectRef },
          effectiveDateTime: timestamp,
          valueQuantity: {
            value: cellular.youngsModulusKPa,
            unit: 'kPa',
            system: 'http://unitsofmeasure.org',
            code: 'kPa',
          },
        },
      },
      {
        resource: {
          resourceType: 'Observation',
          id: `synthetic-cmr-icm-${Date.now()}`,
          status: 'preliminary',
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '782910004',
                display: 'Induced Cardiomyocyte Transdifferentiation Fraction',
              },
            ],
          },
          subject: { reference: subjectRef },
          effectiveDateTime: timestamp,
          valueQuantity: {
            value: cellular.iCMConversionEstimate,
            unit: '%',
            system: 'http://unitsofmeasure.org',
            code: '%',
          },
        },
      },
      {
        resource: {
          resourceType: 'Observation',
          id: `synthetic-cmr-velocity-${Date.now()}`,
          status: 'preliminary',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8867-4',
                display: 'Nanogrid Myocardial Conduction Velocity',
              },
            ],
          },
          subject: { reference: subjectRef },
          effectiveDateTime: timestamp,
          valueQuantity: {
            value: pacing.conductionVelocityMs,
            unit: 'm/s',
            system: 'http://unitsofmeasure.org',
            code: 'm/s',
          },
        },
      },
      {
        resource: {
          resourceType: 'Observation',
          id: `synthetic-cmr-hr-${Date.now()}`,
          status: 'preliminary',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8867-4',
                display: 'Heart rate',
              },
            ],
          },
          subject: { reference: subjectRef },
          effectiveDateTime: timestamp,
          valueQuantity: {
            value: vitals.heartRateBpm,
            unit: 'beats/min',
            system: 'http://unitsofmeasure.org',
            code: '/min',
          },
        },
      },
    ],
  };
}
