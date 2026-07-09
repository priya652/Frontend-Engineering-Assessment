import { useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../api/products.js';
import ImageGallery from '../components/product/ImageGallery.jsx';
import ReviewList from '../components/product/ReviewList.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import Rating from '../components/ui/Rating.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import StateMessage from '../components/ui/StateMessage.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { formatPrice, titleCase } from '../utils/format.js';
import styles from './ProductDetailPage.module.css';

function DetailSkeleton() {
  return (
    <div className={styles.grid} aria-busy="true">
      <Skeleton height="420px" radius="var(--radius-lg)" />
      <div className={styles.infoSkeleton}>
        <Skeleton height="2rem" width="70%" />
        <Skeleton height="1.5rem" width="30%" />
        <Skeleton height="1rem" width="45%" />
        <Skeleton height="6rem" />
        <Skeleton height="1rem" width="60%" />
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: product, loading, error, retry } = useAsync(
    (signal) => getProductById(id, signal),
    [id],
  );

  useEffect(() => window.scrollTo({ top: 0 }), [id]);

  /**
   * The listing URL we came from — filters, page and all — is handed to us in
   * router state by the product card. On a cold load of /product/:id (a shared
   * link) there is no state, so we fall back to the unfiltered listing.
   */
  const backTo = location.state?.from ?? '/';
  const goBack = useCallback(() => navigate(backTo), [navigate, backTo]);

  const backButton = (
    <Button variant="secondary" size="sm" onClick={goBack} className={styles.back}>
      <Icon name="arrowLeft" size="0.875rem" />
      Back
    </Button>
  );

  if (error) {
    return (
      <div className={styles.page}>
        {backButton}
        <StateMessage
          tone="error"
          title={error.status === 404 ? 'Product not found' : "We couldn't load this product"}
          description={error.message}
          action={error.status === 404 ? { label: 'Back to products', onClick: goBack } : { label: 'Try again', onClick: retry }}
        />
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div className={styles.page}>
        {backButton}
        <DetailSkeleton />
      </div>
    );
  }

  const inStock = product.stock > 0;

  return (
    <div className={styles.page}>
      {backButton}

      <article className={styles.card}>
        <div className={styles.grid}>
          <ImageGallery
            key={product.id}
            images={product.images}
            fallback={product.thumbnail}
            title={product.title}
          />

          <div className={styles.info}>
            <header>
              <h1 className={styles.title}>{product.title}</h1>
              <div className={styles.priceRow}>
                <span className={styles.price}>{formatPrice(product.price)}</span>
                <Rating value={product.rating} size="lg" />
              </div>
            </header>

            <dl className={styles.specs}>
              <div className={styles.spec}>
                <dt>Brand</dt>
                <dd>{product.brand ?? 'Unbranded'}</dd>
              </div>
              <div className={styles.spec}>
                <dt>Category</dt>
                <dd>
                  {/* Doubles as navigation: jump straight to that filtered listing. */}
                  <Link to={`/?category=${encodeURIComponent(product.category)}`} className={styles.categoryLink}>
                    {titleCase(product.category)}
                  </Link>
                </dd>
              </div>
              <div className={styles.spec}>
                <dt>Availability</dt>
                <dd>
                  <Badge tone={inStock ? 'success' : 'danger'}>
                    {inStock ? `In stock · ${product.stock} left` : 'Out of stock'}
                  </Badge>
                </dd>
              </div>
              {product.discountPercentage >= 1 && (
                <div className={styles.spec}>
                  <dt>Discount</dt>
                  <dd>
                    <Badge tone="accent">{Math.round(product.discountPercentage)}% off</Badge>
                  </dd>
                </div>
              )}
            </dl>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Description</h2>
              <p className={styles.description}>{product.description}</p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Reviews <span className={styles.reviewCount}>({product.reviews?.length ?? 0})</span>
              </h2>
              <ReviewList reviews={product.reviews} />
            </section>
          </div>
        </div>
      </article>
    </div>
  );
}

export default ProductDetailPage;
