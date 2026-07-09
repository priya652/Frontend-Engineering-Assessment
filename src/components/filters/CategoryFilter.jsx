import Checkbox from '../ui/Checkbox.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import FilterSection from './FilterSection.jsx';
import { titleCase } from '../../utils/format.js';
import styles from './FilterList.module.css';

/**
 * Categories are single-select: DummyJSON's category endpoint takes exactly one
 * slug, and fanning out one request per checked category would be a poor trade
 * for a filter users almost always use one at a time. Ticking the active
 * category again clears it.
 */
export function CategoryFilter({ categories, selected, onChange, loading, error, disabled }) {
  if (loading) {
    return (
      <FilterSection title="Categories">
        <div className={styles.list}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} height="1.25rem" width={`${60 + ((i * 13) % 35)}%`} />
          ))}
        </div>
      </FilterSection>
    );
  }

  if (error) {
    return (
      <FilterSection title="Categories">
        <p className={styles.error}>Categories could not be loaded.</p>
      </FilterSection>
    );
  }

  return (
    <FilterSection title="Categories">
      <div className={`${styles.list} ${styles.scroll}`}>
        {categories.map(({ slug, name }) => (
          <Checkbox
            key={slug}
            name="category"
            value={slug}
            label={titleCase(name || slug)}
            checked={selected === slug}
            onChange={(checked) => !disabled && onChange(checked ? slug : '')}
          />
        ))}
      </div>
    </FilterSection>
  );
}

export default CategoryFilter;
