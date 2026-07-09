import { apiGet } from './client.js';

/**
 * `limit=0` asks DummyJSON for the entire matching set in one response.
 *
 * We deliberately pull the full working set (never more than ~200 rows) rather
 * than paging on the server, because two mandatory features cannot be done
 * server-side on this API:
 *   - the Brand facet must list every brand present in the current selection;
 *   - price-range filtering has no query parameter at all.
 * Paging the server would mean both facets only ever saw the current 12 rows.
 * See README → "Architectural decisions" for the full trade-off.
 */
const FULL_SET = 0;

/** Trim the payload to the fields the listing UI actually renders. */
const LIST_FIELDS = 'id,title,price,rating,thumbnail,brand,category,stock,discountPercentage';

const listParams = { limit: FULL_SET, select: LIST_FIELDS };

/** GET /products — the whole catalogue. */
export function getAllProducts(signal) {
  return apiGet('/products', { params: listParams, signal }).then((res) => res.products ?? []);
}

/** GET /products/category/{slug} */
export function getProductsByCategory(slug, signal) {
  return apiGet(`/products/category/${encodeURIComponent(slug)}`, { params: listParams, signal }).then(
    (res) => res.products ?? [],
  );
}

/** GET /products/search?q= */
export function searchProducts(query, signal) {
  return apiGet('/products/search', { params: { ...listParams, q: query }, signal }).then(
    (res) => res.products ?? [],
  );
}

/**
 * GET /products/categories
 * The API returns `{ slug, name, url }` objects; we only need slug + name.
 */
export function getCategories(signal) {
  return apiGet('/products/categories', { signal }).then((res) =>
    (Array.isArray(res) ? res : []).map((entry) =>
      typeof entry === 'string' ? { slug: entry, name: entry } : { slug: entry.slug, name: entry.name },
    ),
  );
}

/** GET /products/{id} — full record, including images and reviews. */
export function getProductById(id, signal) {
  return apiGet(`/products/${encodeURIComponent(id)}`, { signal });
}
