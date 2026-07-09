import Icon from './Icon.jsx';
import { formatRating } from '../../utils/format.js';
import styles from './Rating.module.css';

const MAX_STARS = 5;

/**
 * Star rating with true fractional fill.
 *
 * Rather than rounding to half-stars, we draw the five outline stars once and
 * overlay an identical filled row clipped to `value / 5` of the width — so 4.37
 * looks like 4.37. One element, no per-star maths.
 */
export function Rating({ value = 0, count, size = 'md', showValue = true }) {
  const clamped = Math.min(Math.max(Number(value) || 0, 0), MAX_STARS);
  const stars = Array.from({ length: MAX_STARS }, (_, index) => <Icon key={index} name="star" />);

  return (
    <span className={`${styles.rating} ${styles[size]}`}>
      <span
        className={styles.stars}
        role="img"
        aria-label={`Rated ${formatRating(clamped)} out of ${MAX_STARS} stars`}
      >
        <span className={styles.track}>{stars}</span>
        <span className={styles.fill} style={{ width: `${(clamped / MAX_STARS) * 100}%` }}>
          {stars}
        </span>
      </span>
      {showValue && <span className={styles.value}>({formatRating(clamped)})</span>}
      {count !== undefined && <span className={styles.count}>{count} reviews</span>}
    </span>
  );
}

export default Rating;
