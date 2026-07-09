import Button from './Button.jsx';
import Icon from './Icon.jsx';
import styles from './StateMessage.module.css';

/**
 * One component for every "there is nothing to show" case: network errors,
 * empty filter results, 404s. Keeping them in one place means the error state
 * and the empty state can never drift apart visually.
 *
 * @param {'error'|'empty'} tone
 */
export function StateMessage({ tone = 'empty', title, description, action, children }) {
  return (
    <div className={`${styles.wrap} ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className={styles.iconCircle}>
        <Icon name={tone === 'error' ? 'alert' : 'box'} size="1.5rem" />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <Button variant={tone === 'error' ? 'primary' : 'secondary'} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}

export default StateMessage;
