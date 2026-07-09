import styles from './Button.module.css';

const cx = (...parts) => parts.filter(Boolean).join(' ');

/**
 * The single button in the app.
 * @param {'primary'|'secondary'|'ghost'} variant
 * @param {'sm'|'md'} size
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  className,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
