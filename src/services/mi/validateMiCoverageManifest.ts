import type { MiScenarioCase } from '../../types/mi/classification';
import type { MiCoverageClaim, MiCoverageManifest } from '../../types/mi/coverage';
import type { MiScenarioPhenotypeFixture } from '../../types/mi/scenarioPhenotype';

export type MiCoverageIssueCode =
  | 'DUPLICATE_CLAIM'
  | 'MISSING_SCENARIO'
  | 'INVALID_STATUS'
  | 'FACT_MISMATCH'
  | 'UNKNOWN_PACK'
  | 'UNCLAIMED_SCENARIO'
  | 'MISSING_PHENOTYPE'
  | 'REVIEW_REQUIRED';

export interface MiCoverageIssue {
  code: MiCoverageIssueCode;
  path: string;
  message: string;
}

export interface MiCoverageValidationResult {
  valid: boolean;
  issues: readonly MiCoverageIssue[];
}

const scenarioMatchesStructuredClaim = (
  scenario: MiScenarioCase,
  claim: MiCoverageClaim,
  phenotype?: MiScenarioPhenotypeFixture,
): boolean => {
  switch (claim.dimension) {
    case 'assessmentGroup': return scenario.expectedAssessment.category === claim.value;
    case 'definitionType': return scenario.expectedAssessment.legacyType === claim.value;
    case 'presentation': return scenario.expectedAssessment.presentation === claim.value;
    case 'eventSequence': return scenario.eventSequence === claim.value;
    case 'territory': return phenotype?.territories.includes(claim.value) ?? false;
    case 'ventricularInvolvement': return phenotype?.phenotype.ventricularInvolvement === claim.value;
    case 'phase': return phenotype?.phenotype.phase === claim.value;
    case 'depth': return phenotype?.phenotype.segments.some((segment) => segment.depth === claim.value) ?? false;
    case 'microvascularObstruction': return phenotype?.phenotype.microvascularObstruction === claim.value;
    case 'intramyocardialHemorrhage': return phenotype?.phenotype.intramyocardialHemorrhage === claim.value;
  }
};

const anatomyDimensions = new Set<MiCoverageClaim['dimension']>(['territory', 'ventricularInvolvement', 'depth', 'phase', 'microvascularObstruction', 'intramyocardialHemorrhage']);

export const validateMiCoverageManifest = (
  manifest: MiCoverageManifest,
  scenarios: readonly MiScenarioCase[],
  phenotypes: readonly MiScenarioPhenotypeFixture[],
): MiCoverageValidationResult => {
  const issues: MiCoverageIssue[] = [];
  const scenarioById = new Map(scenarios.map((scenario) => [scenario.id, scenario]));
  const phenotypeById = new Map(phenotypes.map((phenotype) => [phenotype.id, phenotype]));
  const claimKeys = new Set<string>();
  const claimedScenarioIds = new Set<string>();

  manifest.claims.forEach((claim, index) => {
    const path = `claims.${index}`;
    const claimKey = `${claim.dimension}:${claim.value}`;
    if (claimKeys.has(claimKey)) issues.push({ code: 'DUPLICATE_CLAIM', path, message: `Duplicate coverage claim ${claimKey}.` });
    claimKeys.add(claimKey);

    if (claim.status === 'UNSUPPORTED' && claim.scenarioIds.length > 0) {
      issues.push({ code: 'INVALID_STATUS', path, message: 'Unsupported claims cannot reference scenarios.' });
    }
    if (claim.status !== 'UNSUPPORTED' && claim.scenarioIds.length === 0) {
      issues.push({ code: 'INVALID_STATUS', path, message: `${claim.status} claims must reference at least one scenario.` });
    }

    claim.scenarioIds.forEach((scenarioId) => {
      const scenario = scenarioById.get(scenarioId);
      if (!scenario) {
        issues.push({ code: 'MISSING_SCENARIO', path: `${path}.scenarioIds`, message: `Unknown scenario ${scenarioId}.` });
        return;
      }
      claimedScenarioIds.add(scenarioId);
      if (!manifest.scenarioPackIds.includes(scenario.scenarioPackId)) {
        issues.push({ code: 'UNKNOWN_PACK', path: `${path}.scenarioIds`, message: `Scenario ${scenarioId} belongs to undeclared pack ${scenario.scenarioPackId}.` });
      }
      const phenotype = scenario.phenotypeId ? phenotypeById.get(scenario.phenotypeId) : undefined;
      if (anatomyDimensions.has(claim.dimension) && !phenotype) {
        issues.push({ code: 'MISSING_PHENOTYPE', path: `${path}.scenarioIds`, message: `Scenario ${scenarioId} has no resolved structured phenotype for ${claimKey}.` });
      } else if (!scenarioMatchesStructuredClaim(scenario, claim, phenotype)) {
        issues.push({ code: 'FACT_MISMATCH', path: `${path}.scenarioIds`, message: `Scenario ${scenarioId} does not match ${claimKey}.` });
      }
      if (anatomyDimensions.has(claim.dimension) && claim.status === 'REPRESENTED' && (scenario.review.reviewState !== 'REVIEWED' || phenotype?.review.reviewState !== 'REVIEWED')) {
        issues.push({ code: 'REVIEW_REQUIRED', path, message: `${claimKey} cannot be represented until scenario and phenotype reviews are complete.` });
      }
    });
  });

  scenarios.forEach((scenario) => {
    if (!claimedScenarioIds.has(scenario.id)) {
      issues.push({ code: 'UNCLAIMED_SCENARIO', path: 'claims', message: `Scenario ${scenario.id} is not referenced by the manifest.` });
    }
  });

  return { valid: issues.length === 0, issues };
};