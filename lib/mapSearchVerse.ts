import type { BibleVerse } from './bible';

const SEARCH_BACKGROUNDS = ['blue', 'purple', 'green', 'orange'] as const;

export type SearchCardVerse = {
  id: string;
  text: string;
  reference: string;
  theme: string;
  translation: string;
  background: (typeof SEARCH_BACKGROUNDS)[number];
};

/** Map API hits to feed cards — gradients only (no remote images) to avoid search flicker. */
export function mapSearchResultsToCards(results: BibleVerse[]): SearchCardVerse[] {
  return results
    .filter((v) => v.text?.trim() && v.reference?.trim())
    .map((v, index) => ({
      id: v.id || `${v.reference}-${index}`,
      text: v.text.trim(),
      reference: v.reference.trim(),
      theme: 'Search',
      translation: v.translation || 'NIV',
      background: SEARCH_BACKGROUNDS[index % SEARCH_BACKGROUNDS.length],
    }));
}
