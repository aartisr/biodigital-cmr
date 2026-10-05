import { MiClinicalGroup, MiEvidenceDomain, MiPresentation, MiScenarioCase } from '../../types/mi/classification';

export interface MiScenarioFilters {
  group: MiClinicalGroup | 'ALL';
  presentation: MiPresentation | 'ALL';
  evidenceDomain: MiEvidenceDomain | 'ALL';
  query: string;
}

export const defaultMiScenarioFilters: MiScenarioFilters = { group: 'ALL', presentation: 'ALL', evidenceDomain: 'ALL', query: '' };

/** Pure filter function, reusable by a future list, comparison, or export view. */
export const filterMiScenarios = (scenarios: readonly MiScenarioCase[], filters: MiScenarioFilters): MiScenarioCase[] => {
  const query = filters.query.trim().toLocaleLowerCase();
  return scenarios.filter((scenario) => {
    if (filters.group !== 'ALL' && scenario.expectedAssessment.category !== filters.group) return false;
    if (filters.presentation !== 'ALL' && scenario.expectedAssessment.presentation !== filters.presentation) return false;
    if (filters.evidenceDomain !== 'ALL' && !scenario.evidence.some((item) => item.domain === filters.evidenceDomain)) return false;
    if (!query) return true;
    return [scenario.title, scenario.learningObjective, ...scenario.descriptors].join(' ').toLocaleLowerCase().includes(query);
  });
};
