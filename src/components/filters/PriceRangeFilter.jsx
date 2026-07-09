import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import TextField from '../ui/TextField.jsx';
import FilterSection from './FilterSection.jsx';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import styles from './PriceRangeFilter.module.css';

/**
 * Price inputs are the one place where "update immediately" needs nuance:
 * committing on every keystroke means typing "150" filters at "1" then "15".
 *
 * So the inputs are locally controlled and auto-commit 500 ms after typing
 * stops. Enter, blur-on-Apply, or the Apply button commit at once, which also
 * gives keyboard and screen-reader users an explicit, discoverable action.
 */
export function PriceRangeFilter({ min, max, onChange, invalid }) {
  const [draft, setDraft] = useState({ min, max });
  const debouncedDraft = useDebouncedValue(draft, 500);

  // Re-sync when the URL changes externally (back button, "Clear all").
  useEffect(() => setDraft({ min, max }), [min, max]);

  useEffect(() => {
    if (debouncedDraft.min !== min || debouncedDraft.max !== max) {
      onChange({ minPrice: debouncedDraft.min, maxPrice: debouncedDraft.max });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft]);

  const commit = (event) => {
    event.preventDefault();
    onChange({ minPrice: draft.min, maxPrice: draft.max });
  };

  const update = (key) => (event) => {
    const { value } = event.target;
    // Reject negatives and stray characters at the source.
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <FilterSection title="Price Range">
      <form onSubmit={commit}>
        <div className={styles.inputs}>
          <TextField
            label="Minimum price"
            hideLabel
            type="text"
            inputMode="decimal"
            placeholder="Min"
            value={draft.min}
            onChange={update('min')}
            invalid={invalid}
          />
          <span className={styles.separator} aria-hidden="true">
            –
          </span>
          <TextField
            label="Maximum price"
            hideLabel
            type="text"
            inputMode="decimal"
            placeholder="Max"
            value={draft.max}
            onChange={update('max')}
            invalid={invalid}
          />
        </div>

        {invalid && (
          <p className={styles.error} role="alert">
            Minimum price cannot be greater than the maximum.
          </p>
        )}

        <Button type="submit" size="sm" fullWidth className={styles.apply}>
          Apply
        </Button>
      </form>
    </FilterSection>
  );
}

export default PriceRangeFilter;
