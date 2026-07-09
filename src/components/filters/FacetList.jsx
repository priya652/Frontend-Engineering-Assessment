import { useState } from 'react';
import styles from './FilterList.module.css';

/**
 * A facet list that collapses to `initialCount` rows behind a "Show more" toggle.
 *
 * This exists so the filter sidebar has exactly one scroll container (itself).
 * Capping each facet with its own `overflow-y: auto` seemed tidier, but it puts
 * a scrollbar inside a scrollbar: the outer one then has almost no travel, and
 * neither is discoverable. Collapsing instead keeps the panel short enough that
 * the sidebar usually needs no scrollbar at all.
 *
 * Pass `initialCount = items.length` to disable collapsing (e.g. while the user
 * is searching the facet, where hiding matches would be actively unhelpful).
 */
export function FacetList({ items, renderItem, initialCount = 6, itemLabel = 'more' }) {
  const [expanded, setExpanded] = useState(false);

  const collapsible = items.length > initialCount;
  const visible = collapsible && !expanded ? items.slice(0, initialCount) : items;

  return (
    <div className={styles.list}>
      {visible.map(renderItem)}

      {collapsible && (
        <button
          type="button"
          className={styles.showMore}
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : `Show ${items.length - initialCount} ${itemLabel}`}
        </button>
      )}
    </div>
  );
}

export default FacetList;
