import Rating from '../ui/Rating.jsx';
import { formatDate } from '../../utils/format.js';
import styles from './ReviewList.module.css';

export function ReviewList({ reviews = [] }) {
  if (reviews.length === 0) {
    return <p className={styles.empty}>No reviews yet for this product.</p>;
  }

  return (
    <ul className={styles.list}>
      {reviews.map((review, index) => (
        <li key={`${review.reviewerEmail}-${index}`} className={styles.review}>
          <div className={styles.head}>
            <span className={styles.name}>{review.reviewerName}</span>
            <Rating value={review.rating} size="sm" />
            {review.date && <time className={styles.date}>{formatDate(review.date)}</time>}
          </div>
          <p className={styles.comment}>{review.comment}</p>
        </li>
      ))}
    </ul>
  );
}

export default ReviewList;
