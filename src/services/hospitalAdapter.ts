/**
 * Plug-and-Play Hospital Database Architecture Adapter
 * Supports HL7 FHIR R4, Epic Cosmos, Cerner Millennium, and DICOM-SR
 */

import { CellularSensorMetrics, EpigeneticDosingState, NanogridPacingState, PatientProfile, PatientVitals } from '../types/bdcmr';

export interface FhirObservationBundle {
  resourceType: 'Bundle';
  type: 'transaction';
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
  const subjectRef = `Patient/${patient.mrnTokenized}`;

  return {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [
      {
        resource: {
          resourceType: 'Observation',
          id: `obs-cmr-stiffness-${Date.now()}`,
          status: 'final',
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
          id: `obs-cmr-icm-${Date.now()}`,
          status: 'final',
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
          id: `obs-cmr-velocity-${Date.now()}`,
          status: 'final',
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
          id: `obs-cmr-hr-${Date.now()}`,
          status: 'final',
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
      {
        resource: {
          resourceType: 'MedicationAdministration',
          id: `med-admin-lnp-${Date.now()}`,
          status: 'in-progress',
          code: {
            coding: [
              {
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                code: 'BD-CMR-GHMT-LNP',
                display: `Epigenetic Formulation ${dosing.formulation} (Gata4/Mef2c/Tbx5/Hand2 mRNA LNP)`,
              },
            ],
          },
          subject: { reference: subjectRef },
          effectiveDateTime: timestamp,
          valueString: `Active Infusion Rate: ${dosing.infusionRateNlMin.toFixed(0)} nl/min. Total Delivered: ${dosing.totalDeliveredUl.toFixed(2)} µL`,
        },
      },
    ],
  };
}
