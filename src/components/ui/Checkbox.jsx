import styles from './Checkbox.module.css';

/**
 * A styled checkbox that keeps the native <input> as the real control, so
 * keyboard, screen-reader and form semantics all work for free.
 */
export function Checkbox({ label, count, checked, onChange, name, value }) {
  return (
    <label className={styles.row}>
      <input
        type="checkbox"
        className={styles.input}
        name={name}
        value={value}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.box} aria-hidden="true">
        <svg viewBox="0 0 16 16" className={styles.tick}>
          <path d="M13 4.5L6.5 11 3 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={styles.label}>{label}</span>
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </label>
  );
}

export default Checkbox;
