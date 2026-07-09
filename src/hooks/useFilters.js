import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const DEFAULT_FILTERS = {
  q: '',
  category: '',
  brands: [],
  minPrice: '',
  maxPrice: '',
  sort: 'featured',
  page: 1,
};

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Customer Rating' },
  { value: 'title-asc', label: 'Name: A to Z' },
];

const isDefault = (key, value) => {
  if (key === 'brands') return value.length === 0;
  return value === DEFAULT_FILTERS[key];
};

function readFilters(searchParams) {
  const page = Number(searchParams.get('page'));
  const sort = searchParams.get('sort') ?? '';
  return {
    q: searchParams.get('q') ?? DEFAULT_FILTERS.q,
    category: searchParams.get('category') ?? DEFAULT_FILTERS.category,
    brands: (searchParams.get('brands') ?? '').split(',').filter(Boolean),
    minPrice: searchParams.get('minPrice') ?? DEFAULT_FILTERS.minPrice,
    maxPrice: searchParams.get('maxPrice') ?? DEFAULT_FILTERS.maxPrice,
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : DEFAULT_FILTERS.sort,
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_FILTERS.page,
  };
}

function writeFilters(filters) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (isDefault(key, value)) continue; // keep the URL clean and shareable
    next.set(key, key === 'brands' ? value.join(',') : String(value));
  }
  return next;
}

/**
 * Filter state lives in the URL query string — it is the single source of truth.
 *
 * That one decision buys three requirements for free:
 *   1. "Previously selected filters should remain applied when navigating back"
 *      — the browser restores the URL, so the state comes back with it.
 *   2. Filtered views are shareable and reloadable.
 *   3. There is no second copy of the state to keep in sync.
 */
export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  /**
   * Merge a patch into the current filters.
   * Any change other than paging resets to page 1, as the brief requires.
   * We `replace` history so a dozen checkbox clicks do not become a dozen
   * Back-button steps between the detail page and the listing.
   */
  const setFilters = useCallback(
    (patch) => {
      setSearchParams(
        (prev) => {
          const merged = { ...readFilters(prev), ...patch };
          if (!('page' in patch)) merged.page = 1;
          return writeFilters(merged);
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(
    () => setSearchParams(new URLSearchParams(), { replace: true }),
    [setSearchParams],
  );

  const hasActiveFilters = useMemo(
    () => Object.entries(filters).some(([key, value]) => key !== 'page' && !isDefault(key, value)),
    [filters],
  );

  return { filters, setFilters, resetFilters, hasActiveFilters };
}
