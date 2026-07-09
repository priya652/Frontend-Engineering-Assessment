import Skeleton from '../ui/Skeleton.jsx';
import ProductCard from './ProductCard.jsx';
import { PAGE_SIZE } from '../../hooks/useProductList.js';
import styles from './ProductGrid.module.css';

/** Mirrors the real card's geometry so nothing shifts when data lands. */
function ProductCardSkeleton() {
  return (
    <li className={styles.skeletonCard}>
      <Skeleton height="100%" radius="0" className={styles.skeletonMedia} />
      <div className={styles.skeletonBody}>
        <Skeleton height="0.65rem" width="35%" />
        <Skeleton height="0.85rem" width="90%" />
        <Skeleton height="0.85rem" width="60%" />
        <Skeleton height="1rem" width="45%" />
      </div>
    </li>
  );
}

export function ProductGrid({ products, loading, count = PAGE_SIZE }) {
  if (loading) {
    return (
      <ul className={styles.grid} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: count }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </ul>
    );
  }

  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ul>
  );
}

export default ProductGrid;
