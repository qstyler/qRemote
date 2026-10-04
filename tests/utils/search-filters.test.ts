import { filterSearchResults } from '@/utils/search-filters';
import { SearchResult } from '@/types/api';

function makeResult(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    fileName: 'Some.Title.2024.1080p',
    fileSize: 1000,
    fileUrl: 'magnet:?xt=urn:btih:abc',
    nbLeechers: 1,
    nbSeeders: 10,
    siteUrl: 'https://example-tracker.com',
    descrLink: '',
    ...overrides,
  };
}

describe('filterSearchResults', () => {
  describe('hideZeroSeeders', () => {
    it('hides results with exactly 0 seeders', () => {
      const dead = makeResult({ fileUrl: 'dead', nbSeeders: 0 });
      const alive = makeResult({ fileUrl: 'alive', nbSeeders: 5 });
      expect(filterSearchResults([dead, alive], { hideZeroSeeders: true })).toEqual([alive]);
    });

    it('keeps results with positive seeders', () => {
      const results = [
        makeResult({ fileUrl: 'a', nbSeeders: 1 }),
        makeResult({ fileUrl: 'b', nbSeeders: 9999 }),
      ];
      expect(filterSearchResults(results, { hideZeroSeeders: true })).toEqual(results);
    });

    it('keeps -1 (qBittorrent "unknown seeders" sentinel)', () => {
      const unknown = makeResult({ nbSeeders: -1 });
      expect(filterSearchResults([unknown], { hideZeroSeeders: true })).toEqual([unknown]);
    });

    it('keeps results whose seeders are undefined or null', () => {
      const missing = makeResult({ fileUrl: 'u' });
      delete (missing as Partial<SearchResult>).nbSeeders;
      const nulled = makeResult({ fileUrl: 'n', nbSeeders: null as unknown as number });
      expect(filterSearchResults([missing, nulled], { hideZeroSeeders: true })).toEqual([
        missing,
        nulled,
      ]);
    });

    it('returns an empty array when every result has 0 seeders', () => {
      const results = [
        makeResult({ fileUrl: 'a', nbSeeders: 0 }),
        makeResult({ fileUrl: 'b', nbSeeders: 0 }),
      ];
      expect(filterSearchResults(results, { hideZeroSeeders: true })).toEqual([]);
    });

    it('preserves the original order of surviving results', () => {
      const a = makeResult({ fileUrl: 'a', nbSeeders: 3 });
      const b = makeResult({ fileUrl: 'b', nbSeeders: 0 });
      const c = makeResult({ fileUrl: 'c', nbSeeders: 7 });
      expect(filterSearchResults([a, b, c], { hideZeroSeeders: true })).toEqual([a, c]);
    });

    it('does not mutate the input array', () => {
      const results = [makeResult({ fileUrl: 'a', nbSeeders: 0 }), makeResult({ fileUrl: 'b' })];
      const snapshot = [...results];
      filterSearchResults(results, { hideZeroSeeders: true });
      expect(results).toEqual(snapshot);
      expect(results).toHaveLength(2);
    });
  });

  describe('flag off', () => {
    const results = [
      makeResult({ fileUrl: 'a', nbSeeders: 0 }),
      makeResult({ fileUrl: 'b', nbSeeders: -1 }),
      makeResult({ fileUrl: 'c', nbSeeders: 4 }),
    ];

    it('returns everything when hideZeroSeeders is false', () => {
      expect(filterSearchResults(results, { hideZeroSeeders: false })).toEqual(results);
    });

    it('returns everything when hideZeroSeeders is omitted', () => {
      expect(filterSearchResults(results, {})).toEqual(results);
    });

    it('returns everything when no options are passed', () => {
      expect(filterSearchResults(results)).toEqual(results);
    });
  });
});
