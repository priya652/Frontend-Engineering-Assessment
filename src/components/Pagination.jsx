import Icon from './ui/Icon.jsx';
import styles from './Pagination.module.css';

/**
 * Builds a compact page window: 1 … 4 5 [6] 7 8 … 20
 * Always shows the first and last page so users can jump to either end.
 */
function buildPages(current, total, siblings = 1) {
  const window = siblings * 2 + 5; // first + last + current + siblings + 2 gaps
  if (total <= window) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);
  const showLeftGap = left > 2;
  const showRightGap = right < total - 1;

  const pages = [1];
  if (showLeftGap) pages.push('gap-left');
  for (let page = Math.max(left, 2); page <= Math.min(right, total - 1); page += 1) pages.push(page);
  if (showRightGap) pages.push('gap-right');
  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);
  const go = (next) => onChange(Math.min(Math.max(next, 1), totalPages));

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.step}
        onClick={() => go(page - 1)}
        disabled={page === 1}
      >
        <Icon name="arrowLeft" size="0.875rem" />
        <span>Previous</span>
      </button>

      <ul className={styles.pages}>
        {pages.map((item) =>
          typeof item === 'string' ? (
            <li key={item} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={`${styles.page} ${item === page ? styles.active : ''}`}
                onClick={() => go(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className={styles.step}
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
      >
        <span>Next</span>
        <Icon name="arrowRight" size="0.875rem" />
      </button>
    </nav>
  );
}

export default Pagination;
