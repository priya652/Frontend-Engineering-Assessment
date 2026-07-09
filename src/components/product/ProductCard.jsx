import { Link, useLocation } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import Rating from '../ui/Rating.jsx';
import { formatPrice } from '../../utils/format.js';
import styles from './ProductCard.module.css';

/**
 * The whole card is a single <Link>, so it is one tab stop and one click target
 * — no nested interactive elements to confuse assistive tech.
 *
 * We hand the current URL (filters and all) forward in router state, which lets
 * the detail page's Back button return to the exact filtered view even on a
 * cold load of /product/:id.
 */
export function ProductCard({ product }) {
  const location = useLocation();
  const { id, title, price, rating, thumbnail, brand, discountPercentage, stock } = product;

  const hasDiscount = discountPercentage >= 1;
  const outOfStock = stock === 0;

  return (
    <li className={styles.item}>
      <Link
        to={`/product/${id}`}
        state={{ from: `${location.pathname}${location.search}` }}
        className={styles.card}
      >
        <div className={styles.media}>
          <img
            src={thumbnail}
            alt={title}
            className={styles.image}
            loading="lazy"
            width="240"
            height="240"
          />
          {hasDiscount && (
            <span className={styles.discount}>
              <Badge tone="danger">-{Math.round(discountPercentage)}%</Badge>
            </span>
          )}
          {outOfStock && <span className={styles.veil}>Out of stock</span>}
        </div>

        <div className={styles.body}>
          {brand && <p className={styles.brand}>{brand}</p>}
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.meta}>
            <span className={styles.price}>{formatPrice(price)}</span>
            <Rating value={rating} size="sm" />
          </div>
        </div>
      </Link>
    </li>
  );
}

export default ProductCard;
