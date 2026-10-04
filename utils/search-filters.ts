/**
 * Client-side filters for Search tab results. qBittorrent's search API has no
 * server-side filtering beyond plugin/category, so these run on whatever the
 * job has returned so far. Pure — no React, no storage.
 */
import { SearchResult } from '@/types/api';

export interface SearchFilterOptions {
  /**
   * Hide results that report exactly 0 seeders. Only an explicit 0 is hidden:
   * qBittorrent uses -1 for "unknown", and a plugin may omit the field
   * entirely (null/undefined at runtime despite the type), so none of those
   * are treated as dead.
   */
  hideZeroSeeders?: boolean;
}

/**
 * Applies the enabled filters in `opts` and returns the surviving results.
 * Never mutates `results`; returns the same array when nothing is filtered
 * out, so callers can rely on cheap identity checks.
 */
export function filterSearchResults(
  results: SearchResult[],
  opts: SearchFilterOptions = {},
): SearchResult[] {
  if (!opts.hideZeroSeeders) return results;
  return results.filter((r) => r.nbSeeders !== 0);
}
