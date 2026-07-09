import { useMemo, useState } from 'react';
import Checkbox from '../ui/Checkbox.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import TextField from '../ui/TextField.jsx';
import FacetList from './FacetList.jsx';
import FilterSection from './FilterSection.jsx';
import styles from './FilterList.module.css';

const SEARCHABLE_THRESHOLD = 8;

/**
 * Brands are multi-select and are derived from the products we fetched, as the
 * brief requires — there is no /brands endpoint. Counts next to each brand come
 * from the current category/search/price selection, so the facet always tells
 * the truth about what ticking it will return.
 */
export function BrandFilter({ facets, selected, onChange, loading }) {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? facets.filter(({ brand }) => brand.toLowerCase().includes(needle)) : facets;
  }, [facets, query]);

  const toggle = (brand) => (checked) => {
    onChange(checked ? [...selected, brand] : selected.filter((item) => item !== brand));
  };

  if (loading) {
    return (
      <FilterSection title="Brands">
        <div className={styles.list}>
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} height="1.25rem" width={`${55 + ((i * 17) % 40)}%`} />
          ))}
        </div>
      </FilterSection>
    );
  }

  return (
    <FilterSection
      title="Brands"
      action={
        selected.length > 0 && (
          <button type="button" className={styles.clearLink} onClick={() => onChange([])}>
            Clear
          </button>
        )
      }
    >
      {facets.length > SEARCHABLE_THRESHOLD && (
        <TextField
          label="Search brands"
          hideLabel
          icon="search"
          type="search"
          placeholder="Find a brand"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={styles.brandSearch}
        />
      )}

      {visible.length === 0 ? (
        <p className={styles.empty}>
          {facets.length === 0 ? 'No brands in this selection.' : 'No brand matches that search.'}
        </p>
      ) : (
        <FacetList
          items={visible}
          // While searching, every match should be visible — collapsing the
          // results the user just searched for would be perverse.
          initialCount={query.trim() ? visible.length : 6}
          itemLabel="more brands"
          renderItem={({ brand, count }) => (
            <Checkbox
              key={brand}
              name="brand"
              value={brand}
              label={brand}
              count={count}
              checked={selected.includes(brand)}
              onChange={toggle(brand)}
            />
          )}
        />
      )}
    </FilterSection>
  );
}

export default BrandFilter;
