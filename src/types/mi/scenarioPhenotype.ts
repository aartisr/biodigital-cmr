import type { MiAnatomicalTerritory } from './coverage';
import type { InfarctPhenotype } from './infarctPhenotype';
import type { MiScenarioReviewMetadata } from './scenarioPack';

export interface MiScenarioPhenotypeFixture {
  id: string;
  version: string;
  territories: readonly MiAnatomicalTerritory[];
  phenotype: InfarctPhenotype;
  review: MiScenarioReviewMetadata;
}