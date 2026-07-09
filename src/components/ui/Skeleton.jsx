import styles from './Skeleton.module.css';

/**
 * A shimmering placeholder block.
 * Skeletons (rather than a single page spinner) keep the grid's layout stable
 * while data loads, so nothing jumps when the products arrive.
 */
export function Skeleton({ width = '100%', height = '1rem', radius = 'var(--radius-sm)', className }) {
  return (
    <span
      className={`${styles.skeleton} ${className ?? ''}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

/** Inline spinner for buttons and small inline states. */
export function Spinner({ label = 'Loading' }) {
  return (
    <span className={styles.spinnerWrap} role="status" aria-live="polite">
      <span className={styles.spinner} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export default Skeleton;
