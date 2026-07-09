import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import BrandFilter from './BrandFilter.jsx';
import CategoryFilter from './CategoryFilter.jsx';
import PriceRangeFilter from './PriceRangeFilter.jsx';
import styles from './FilterPanel.module.css';

/**
 * Presentational shell that composes the three mandatory filters.
 * It owns no filter state — everything is lifted to the URL via `useFilters`,
 * so the exact same panel renders in the desktop sidebar and the mobile drawer.
 */
export function FilterPanel({
  filters,
  setFilters,
  resetFilters,
  hasActiveFilters,
  categories,
  categoriesLoading,
  categoriesError,
  brandFacets,
  brandsLoading,
  priceRangeInvalid,
  onClose,
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>
          <Icon name="filter" />
          Filters
        </h2>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear all
          </Button>
        )}

        {onClose && (
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close filters">
            <Icon name="close" size="1.125rem" />
          </button>
        )}
      </div>

      {filters.q && (
        <p className={styles.notice}>
          Showing results for <strong>“{filters.q}”</strong>. Category filtering is unavailable while
          searching.
        </p>
      )}

      <CategoryFilter
        categories={categories}
        selected={filters.category}
        onChange={(category) => setFilters({ category })}
        loading={categoriesLoading}
        error={categoriesError}
        disabled={Boolean(filters.q)}
      />

      <PriceRangeFilter
        min={filters.minPrice}
        max={filters.maxPrice}
        onChange={setFilters}
        invalid={priceRangeInvalid}
      />

      <BrandFilter
        facets={brandFacets}
        selected={filters.brands}
        onChange={(brands) => setFilters({ brands })}
        loading={brandsLoading}
      />
    </div>
  );
}

export default FilterPanel;
