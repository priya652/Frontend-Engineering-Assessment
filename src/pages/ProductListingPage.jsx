import { useEffect, useState } from 'react';
import { getCategories } from '../api/products.js';
import ActiveFilterChips from '../components/filters/ActiveFilterChips.jsx';
import FilterPanel from '../components/filters/FilterPanel.jsx';
import Pagination from '../components/Pagination.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import StateMessage from '../components/ui/StateMessage.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { SORT_OPTIONS, useFilters } from '../hooks/useFilters.js';
import { useProductList } from '../hooks/useProductList.js';
import styles from './ProductListingPage.module.css';

export function ProductListingPage() {
  const { filters, setFilters, resetFilters, hasActiveFilters } = useFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const categoriesState = useAsync(getCategories, []);
  const {
    pageItems,
    brandFacets,
    totalResults,
    page,
    totalPages,
    priceRangeInvalid,
    loading,
    error,
    retry,
  } = useProductList(filters);

  // Paging should land the user at the top of the grid, not mid-scroll.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // While the drawer is open, freeze the page behind it and let Escape close it.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setDrawerOpen(false);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [drawerOpen]);

  const panel = (
    <FilterPanel
      filters={filters}
      setFilters={setFilters}
      resetFilters={resetFilters}
      hasActiveFilters={hasActiveFilters}
      categories={categoriesState.data ?? []}
      categoriesLoading={categoriesState.loading}
      categoriesError={categoriesState.error}
      brandFacets={brandFacets}
      brandsLoading={loading}
      priceRangeInvalid={priceRangeInvalid}
    />
  );

  const renderResults = () => {
    if (error) {
      return (
        <StateMessage
          tone="error"
          title="We couldn't load the products"
          description={error.message}
          action={{ label: 'Try again', onClick: retry }}
        />
      );
    }

    if (loading) return <ProductGrid loading />;

    if (pageItems.length === 0) {
      return (
        <StateMessage
          tone="empty"
          title="No products match these filters"
          description={
            priceRangeInvalid
              ? 'Your minimum price is higher than your maximum. Adjust the range to see results.'
              : 'Try widening the price range, removing a brand, or choosing a different category.'
          }
          action={hasActiveFilters ? { label: 'Clear all filters', onClick: resetFilters } : undefined}
        />
      );
    }

    return (
      <>
        <ProductGrid products={pageItems} />
        <Pagination page={page} totalPages={totalPages} onChange={(next) => setFilters({ page: next })} />
      </>
    );
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>{panel}</aside>

      {/* Mobile: the same panel, presented as an overlay drawer. */}
      {drawerOpen && (
        <div className={styles.drawerRoot}>
          <div className={styles.scrim} onClick={() => setDrawerOpen(false)} />
          <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Filters">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              resetFilters={resetFilters}
              hasActiveFilters={hasActiveFilters}
              categories={categoriesState.data ?? []}
              categoriesLoading={categoriesState.loading}
              categoriesError={categoriesState.error}
              brandFacets={brandFacets}
              brandsLoading={loading}
              priceRangeInvalid={priceRangeInvalid}
              onClose={() => setDrawerOpen(false)}
            />
            <div className={styles.drawerFooter}>
              <Button fullWidth onClick={() => setDrawerOpen(false)}>
                Show {totalResults} {totalResults === 1 ? 'result' : 'results'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <Button variant="secondary" size="sm" className={styles.filterToggle} onClick={() => setDrawerOpen(true)}>
            <Icon name="filter" size="0.875rem" />
            Filters
            {hasActiveFilters && <span className={styles.dot} aria-label="Filters applied" />}
          </Button>

          <p className={styles.count} aria-live="polite">
            {loading ? (
              'Loading products…'
            ) : (
              <>
                <strong>{totalResults}</strong> {totalResults === 1 ? 'product' : 'products'}
                {totalPages > 1 && (
                  <span className={styles.pageOf}>
                    {' '}
                    · page {page} of {totalPages}
                  </span>
                )}
              </>
            )}
          </p>

          <label className={styles.sort}>
            <span className={styles.sortLabel}>Sort by</span>
            <select
              className={styles.select}
              value={filters.sort}
              onChange={(event) => setFilters({ sort: event.target.value })}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ActiveFilterChips filters={filters} setFilters={setFilters} resetFilters={resetFilters} />

        {renderResults()}
      </main>
    </div>
  );
}

export default ProductListingPage;
