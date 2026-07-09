import Icon from '../ui/Icon.jsx';
import { formatPrice, titleCase } from '../../utils/format.js';
import styles from './ActiveFilterChips.module.css';

/**
 * A dismissible summary of everything currently narrowing the results.
 * Without it, a filter set three scroll-lengths up the sidebar is invisible —
 * users end up believing the catalogue is empty.
 */
function buildChips(filters) {
  const chips = [];

  if (filters.q) chips.push({ key: 'q', label: `Search: “${filters.q}”`, patch: { q: '' } });
  if (filters.category)
    chips.push({ key: 'category', label: titleCase(filters.category), patch: { category: '' } });

  const min = filters.minPrice;
  const max = filters.maxPrice;
  if (min || max) {
    const label =
      min && max
        ? `${formatPrice(min)} – ${formatPrice(max)}`
        : min
          ? `Over ${formatPrice(min)}`
          : `Under ${formatPrice(max)}`;
    chips.push({ key: 'price', label, patch: { minPrice: '', maxPrice: '' } });
  }

  for (const brand of filters.brands) {
    chips.push({
      key: `brand:${brand}`,
      label: brand,
      patch: { brands: filters.brands.filter((item) => item !== brand) },
    });
  }

  return chips;
}

export function ActiveFilterChips({ filters, setFilters, resetFilters }) {
  const chips = buildChips(filters);
  if (chips.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>Active:</span>
      <ul className={styles.list}>
        {chips.map((chip) => (
          <li key={chip.key}>
            <button type="button" className={styles.chip} onClick={() => setFilters(chip.patch)}>
              <span>{chip.label}</span>
              <Icon name="close" size="0.75rem" />
              <span className="sr-only">Remove filter</span>
            </button>
          </li>
        ))}
      </ul>
      {chips.length > 1 && (
        <button type="button" className={styles.clearAll} onClick={resetFilters}>
          Clear all
        </button>
      )}
    </div>
  );
}

export default ActiveFilterChips;
