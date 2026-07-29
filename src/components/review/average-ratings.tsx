import RatingProgressBar from './rating-progress-bar';
import { RatingCount } from '@/types';

type AverageRatingsProps = {
  totalReviews?: number;
  ratings?: number;
  ratingCount?: RatingCount[];
};

const AverageRatings: React.FC<AverageRatingsProps> = ({
  totalReviews = 0,
  ratings = 0,
  ratingCount = [],
}) => {
  const normalizedRating = Number(ratings || 0);

  return (
    <aside className="sancan-ozon-flat p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex text-2xl text-[#ff9f00]" aria-label={`Рейтинг ${normalizedRating}`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index}>{index < Math.round(normalizedRating) ? '★' : '☆'}</span>
          ))}
        </div>
        <div className="text-2xl font-extrabold text-ozon-text">
          {normalizedRating ? normalizedRating.toFixed(1) : '0'} / 5
        </div>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-ozon-muted">
        Рейтинг формируется на основе актуальных отзывов покупателей.
      </p>
      <div className="space-y-2.5">
        {[5, 4, 3, 2, 1].map((ratingId) => (
          <RatingProgressBar
            key={ratingId}
            ratingProgressItem={ratingCount.find((rating) => Number(rating.rating) === ratingId)}
            ratingId={ratingId}
            totalReviews={totalReviews}
          />
        ))}
      </div>
      <p className="mt-6 text-sm leading-relaxed text-ozon-muted">
        Отзывы могут оставлять только пользователи, которые оформили заказ.
      </p>
    </aside>
  );
};

export default AverageRatings;
