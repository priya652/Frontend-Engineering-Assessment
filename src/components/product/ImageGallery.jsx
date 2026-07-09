import { useState } from 'react';
import styles from './ImageGallery.module.css';

/**
 * Main image + thumbnail rail. Falls back to the thumbnail when `images` is
 * empty — which happens: some DummyJSON records ship a single image.
 *
 * The caller keys this component by product id, so navigating between products
 * remounts it and the selected thumbnail resets without an effect.
 */
export function ImageGallery({ images = [], fallback, title }) {
  const gallery = images.length ? images : [fallback].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  if (gallery.length === 0) return <div className={styles.stage} />;

  return (
    <div className={styles.gallery}>
      <div className={styles.stage}>
        <img src={gallery[activeIndex]} alt={title} className={styles.main} width="480" height="480" />
      </div>

      {gallery.length > 1 && (
        <ul className={styles.thumbs}>
          {gallery.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                className={`${styles.thumb} ${index === activeIndex ? styles.thumbActive : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1} of ${gallery.length}`}
                aria-pressed={index === activeIndex}
              >
                <img src={src} alt="" loading="lazy" width="64" height="64" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ImageGallery;
