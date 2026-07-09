import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import TextField from '../ui/TextField.jsx';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import styles from './Navbar.module.css';

/**
 * The search box is a *filter*, so like every other filter it writes to the
 * URL rather than to component state. Typing from the detail page therefore
 * navigates back to the listing with the query already applied.
 */
export function Navbar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const urlQuery = searchParams.get('q') ?? '';
  const [term, setTerm] = useState(urlQuery);
  const debouncedTerm = useDebouncedValue(term, 400);

  // Re-sync when the URL changes from elsewhere (back button, "clear filters").
  useEffect(() => setTerm(urlQuery), [urlQuery]);

  useEffect(() => {
    if (debouncedTerm.trim() === urlQuery) return;

    const next = new URLSearchParams(searchParams);
    if (debouncedTerm.trim()) next.set('q', debouncedTerm.trim());
    else next.delete('q');
    next.delete('page'); // a new query always starts at page 1
    next.delete('category'); // /products/search cannot be scoped to a category

    navigate({ pathname: '/', search: next.toString() }, { replace: location.pathname === '/' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm]);

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <Icon name="cart" size="1.25rem" />
          <span className={styles.brandName}>Product Explorer</span>
        </Link>

        <form className={styles.searchForm} role="search" onSubmit={(event) => event.preventDefault()}>
          <TextField
            label="Search products"
            hideLabel
            icon="search"
            type="search"
            placeholder="Search products..."
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            className={styles.search}
          />
        </form>

        {/* Decorative only — cart and account are out of scope for this brief,
            included to match the reference design. */}
        <div className={styles.actions} aria-hidden="true">
          <span className={styles.actionIcon}>
            <Icon name="cart" size="1.25rem" />
          </span>
          <span className={styles.actionIcon}>
            <Icon name="user" size="1.25rem" />
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
