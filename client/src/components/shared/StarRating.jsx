import { Star } from 'phosphor-react';

export default function StarRating({ rating = 0, onRate, size = 18, interactive = false }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          weight={n <= rating ? 'fill' : 'regular'}
          className={`star ${n <= rating ? 'filled' : ''}`}
          onClick={() => interactive && onRate && onRate(n)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
      ))}
    </div>
  );
}
