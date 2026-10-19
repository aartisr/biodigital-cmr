import type { MiScenarioCase } from '../../types/mi/classification';
import type { MiScenarioPackDefinition } from '../../types/mi/scenarioPack';
import type { MiScenarioPhenotypeFixture } from '../../types/mi/scenarioPhenotype';
import { validateInfarctPhenotype } from './validateInfarctPhenotype';

export type MiScenarioPhenotypeIssueCode =
  | 'DUPLICATE_FIXTURE_ID'
  | 'MISSING_FIXTURE'
  | 'UNREFERENCED_FIXTURE'
  | 'INVALID_PHENOTYPE'
  | 'SCHEMA_MISMATCH'
  | 'INVALID_PROVENANCE'
  | 'INVALID_REVIEW_METADATA';

export interface MiScenarioPhenotypeIssue {
  code: MiScenarioPhenotypeIssueCode;
  path: string;
  message: string;
}

export interface MiScenarioPhenotypeValidationResult {
  valid: boolean;
  issues: readonly MiScenarioPhenotypeIssue[];
}

export const validateMiScenarioPhenotypes = (
  packs: readonly MiScenarioPackDefinition[],
  scenarios: readonly MiScenarioCase[],
  fixtures: readonly MiScenarioPhenotypeFixture[],
): MiScenarioPhenotypeValidationResult => {
  const issues: MiScenarioPhenotypeIssue[] = [];
  const fixtureById = new Map<string, MiScenarioPhenotypeFixture>();
  const referencedFixtureIds = new Set<string>();

  fixtures.forEach((fixture, index) => {
    const path = `fixtures.${index}`;
    if (fixtureById.has(fixture.id)) issues.push({ code: 'DUPLICATE_FIXTURE_ID', path, message: `Duplicate phenotype fixture ${fixture.id}.` });
    fixtureById.set(fixture.id, fixture);

    const phenotypeResult = validateInfarctPhenotype(fixture.phenotype);
    if (!phenotypeResult.valid) {
      issues.push({ code: 'INVALID_PHENOTYPE', path: `${path}.phenotype`, message: `${fixture.id} has ${phenotypeResult.issues.length} phenotype validation issue(s).` });
    }
    if (!fixture.phenotype.provenance.some((source) => source.sourceType === 'AUTHORED_SIMULATION')) {
      issues.push({ code: 'INVALID_PROVENANCE', path: `${path}.phenotype.provenance`, message: `${fixture.id} must identify authored simulation provenance.` });
    }
    if (!fixture.review.contentOwner.trim() || fixture.review.limitations.length === 0 || (fixture.review.reviewState === 'REVIEWED' && !fixture.review.reviewedAt)) {
      issues.push({ code: 'INVALID_REVIEW_METADATA', path: `${path}.review`, message: `${fixture.id} has incomplete review metadata.` });
    }
  });

  scenarios.forEach((scenario, index) => {
    if (!scenario.phenotypeId) return;
    referencedFixtureIds.add(scenario.phenotypeId);
    const fixture = fixtureById.get(scenario.phenotypeId);
    if (!fixture) {
      issues.push({ code: 'MISSING_FIXTURE', path: `scenarios.${index}.phenotypeId`, message: `${scenario.id} references missing phenotype ${scenario.phenotypeId}.` });
      return;
    }
    const pack = packs.find((candidate) => candidate.id === scenario.scenarioPackId);
    if (pack && pack.phenotypeVersion !== fixture.phenotype.schemaVersion) {
      issues.push({ code: 'SCHEMA_MISMATCH', path: `scenarios.${index}.phenotypeId`, message: `${scenario.id} phenotype schema does not match pack ${pack.id}.` });
    }
  });

  fixtures.forEach((fixture, index) => {
    if (!referencedFixtureIds.has(fixture.id)) {
      issues.push({ code: 'UNREFERENCED_FIXTURE', path: `fixtures.${index}`, message: `${fixture.id} is not referenced by a scenario.` });
    }
  });

  return { valid: issues.length === 0, issues };
};