import { useId } from 'react';
import Icon from './Icon.jsx';
import styles from './TextField.module.css';

const cx = (...parts) => parts.filter(Boolean).join(' ');

/**
 * Labelled text/number input with an optional leading icon.
 * `useId` guarantees the label/input association stays unique even when the
 * same field is rendered twice (e.g. desktop sidebar + mobile drawer).
 */
export function TextField({ label, hideLabel = false, icon, id, className, invalid = false, ...rest }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cx(styles.field, className)}>
      {label && (
        <label htmlFor={inputId} className={hideLabel ? 'sr-only' : styles.label}>
          {label}
        </label>
      )}
      <div className={cx(styles.control, invalid && styles.invalid)}>
        {icon && <Icon name={icon} className={styles.icon} />}
        <input id={inputId} className={styles.input} aria-invalid={invalid || undefined} {...rest} />
      </div>
    </div>
  );
}

export default TextField;
