import { useMemo } from 'react';
import { getAllProducts, getProductsByCategory, searchProducts } from '../api/products.js';
import { parsePrice } from '../utils/format.js';
import { useAsync } from './useAsync.js';

export const PAGE_SIZE = 12;

/** Picks the narrowest endpoint the API can serve for the current filters. */
function selectSource({ q, category }) {
  if (q.trim()) return { key: `search:${q.trim()}`, fetch: (signal) => searchProducts(q.trim(), signal) };
  if (category) return { key: `category:${category}`, fetch: (signal) => getProductsByCategory(category, signal) };
  return { key: 'all', fetch: getAllProducts };
}

const comparators = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'rating-desc': (a, b) => b.rating - a.rating,
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  featured: () => 0,
};

/**
 * Owns the whole listing pipeline:
 *
 *   fetch working set -> filter by price -> derive brand facet
 *                                        -> filter by brand -> sort -> paginate
 *
 * The server handles search and category (the only two filters it supports);
 * price and brand are applied in memory because DummyJSON exposes no query
 * parameters for them.
 *
 * The brand facet is derived *after* price but *before* brand. That ordering is
 * deliberate and is what standard multi-select faceting does: the options you
 * can pick reflect every other active filter, but not the facet's own
 * selection — otherwise ticking "Apple" would make every other brand vanish.
 */
export function useProductList(filters) {
  const source = useMemo(() => selectSource(filters), [filters.q, filters.category]);

  const { data, loading, error, retry } = useAsync((signal) => source.fetch(signal), [source.key]);

  const products = data ?? [];
  const selectedBrandsKey = filters.brands.join(',');

  const min = parsePrice(filters.minPrice);
  const max = parsePrice(filters.maxPrice);
  const priceRangeInvalid = min !== null && max !== null && min > max;

  const priceFiltered = useMemo(() => {
    if (priceRangeInvalid) return [];
    return products.filter(
      (product) => (min === null || product.price >= min) && (max === null || product.price <= max),
    );
  }, [products, min, max, priceRangeInvalid]);

  /** [{ brand, count }] — counts reflect the current category/search/price. */
  const brandFacets = useMemo(() => {
    const counts = new Map();
    for (const product of priceFiltered) {
      if (product.brand) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    }
    // A brand the user has ticked must stay listed even when its count drops to
    // zero, or they would have no way to untick it.
    for (const brand of filters.brands) {
      if (!counts.has(brand)) counts.set(brand, 0);
    }
    return [...counts.entries()]
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [priceFiltered, selectedBrandsKey]);

  const filtered = useMemo(() => {
    if (!filters.brands.length) return priceFiltered;
    const selected = new Set(filters.brands);
    return priceFiltered.filter((product) => selected.has(product.brand));
  }, [priceFiltered, selectedBrandsKey]);

  const sorted = useMemo(() => {
    if (filters.sort === 'featured') return filtered; // preserve API order
    return [...filtered].sort(comparators[filters.sort]);
  }, [filtered, filters.sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  // Clamp rather than reset: a stale `?page=9` in a pasted URL should show the
  // last real page instead of an empty grid.
  const page = Math.min(filters.page, totalPages);
  const pageItems = useMemo(() => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [sorted, page]);

  return {
    pageItems,
    brandFacets,
    totalResults: sorted.length,
    page,
    totalPages,
    priceRangeInvalid,
    loading,
    error,
    retry,
  };
}
