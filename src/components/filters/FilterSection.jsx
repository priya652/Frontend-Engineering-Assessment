import styles from './FilterSection.module.css';

/** Shared chrome (title + spacing) for every block inside the filter sidebar. */
export function FilterSection({ title, action, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export default FilterSection;
