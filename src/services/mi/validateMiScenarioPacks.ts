import type { MiScenarioCase } from '../../types/mi/classification';
import type { MiScenarioPackDefinition } from '../../types/mi/scenarioPack';

export type MiScenarioPackIssueCode =
  | 'DUPLICATE_PACK_ID'
  | 'DUPLICATE_SCENARIO_OWNERSHIP'
  | 'MISSING_SCENARIO'
  | 'UNOWNED_SCENARIO'
  | 'METADATA_MISMATCH'
  | 'INVALID_REVIEW_METADATA';

export interface MiScenarioPackIssue {
  code: MiScenarioPackIssueCode;
  path: string;
  message: string;
}

export interface MiScenarioPackValidationResult {
  valid: boolean;
  issues: readonly MiScenarioPackIssue[];
}

export const validateMiScenarioPacks = (
  definitions: readonly MiScenarioPackDefinition[],
  scenarios: readonly MiScenarioCase[],
): MiScenarioPackValidationResult => {
  const issues: MiScenarioPackIssue[] = [];
  const scenarioById = new Map(scenarios.map((scenario) => [scenario.id, scenario]));
  const packIds = new Set<string>();
  const ownerByScenarioId = new Map<string, string>();

  definitions.forEach((pack, packIndex) => {
    const path = `packs.${packIndex}`;
    if (packIds.has(pack.id)) issues.push({ code: 'DUPLICATE_PACK_ID', path, message: `Duplicate pack ID ${pack.id}.` });
    packIds.add(pack.id);

    if (!pack.review.contentOwner.trim() || pack.review.limitations.length === 0 || (pack.review.reviewState === 'REVIEWED' && !pack.review.reviewedAt)) {
      issues.push({ code: 'INVALID_REVIEW_METADATA', path: `${path}.review`, message: `Pack ${pack.id} has incomplete review metadata.` });
    }

    pack.scenarioIds.forEach((scenarioId) => {
      const existingOwner = ownerByScenarioId.get(scenarioId);
      if (existingOwner) {
        issues.push({ code: 'DUPLICATE_SCENARIO_OWNERSHIP', path: `${path}.scenarioIds`, message: `${scenarioId} is owned by both ${existingOwner} and ${pack.id}.` });
      } else {
        ownerByScenarioId.set(scenarioId, pack.id);
      }

      const scenario = scenarioById.get(scenarioId);
      if (!scenario) {
        issues.push({ code: 'MISSING_SCENARIO', path: `${path}.scenarioIds`, message: `Pack ${pack.id} references missing scenario ${scenarioId}.` });
      } else if (scenario.scenarioPackId !== pack.id || scenario.taxonomyVersion !== pack.taxonomyVersion) {
        issues.push({ code: 'METADATA_MISMATCH', path: `${path}.scenarioIds`, message: `${scenarioId} does not match its owning pack metadata.` });
      }
    });
  });

  scenarios.forEach((scenario) => {
    if (!ownerByScenarioId.has(scenario.id)) {
      issues.push({ code: 'UNOWNED_SCENARIO', path: 'packs', message: `${scenario.id} has no scenario-pack owner.` });
    }
  });

  return { valid: issues.length === 0, issues };
};