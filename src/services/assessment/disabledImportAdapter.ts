import { AssessmentDataAdapter, AssessmentImportRequest, AssessmentImportResult } from '../../types/assessment/adapter';

const blockedReason = 'External clinical-data ingestion is disabled in this browser simulation. It requires an approved backend, identity, audit, privacy, governance, and clinical-validation program.';

/** Explicit safe default for every future import boundary. It performs no transport or parsing. */
export const createDisabledImportAdapter = <TInput, TCase>(id: string, version = '0.0.0-disabled'): AssessmentDataAdapter<TInput, TCase> => ({
  id, version,
  async import(_request: AssessmentImportRequest<TInput>): Promise<AssessmentImportResult<TCase>> {
    return { status: 'BLOCKED', reason: blockedReason };
  },
});
