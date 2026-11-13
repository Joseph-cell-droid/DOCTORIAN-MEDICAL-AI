import { searchGuidelines, formatGuidelineContext, ClinicalGuidelineEntry } from '../src/data/ugandaGuidelinesCorpus';

export interface RagResult {
  entries: ClinicalGuidelineEntry[];
  formattedContext: string;
  outdatedWarnings: string[];
}

export function retrieveClinicalEvidence(query: string, limit = 3): RagResult {
  const entries = searchGuidelines(query, limit);
  const formattedContext = formatGuidelineContext(entries);
  const outdatedWarnings: string[] = [];

  for (const entry of entries) {
    if (entry.year < 2022) {
      outdatedWarnings.push(`${entry.condition} (${entry.year}) may need verification against the latest Uganda Clinical Guidelines.`);
    }
  }

  return {
    entries,
    formattedContext,
    outdatedWarnings
  };
}
