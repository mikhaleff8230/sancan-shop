type RatingProgressProps = {
  ratingId?: number;
  ratingProgressItem: any;
  totalReviews: number;
};

export default function RatingProgressBar({
  ratingId = 0,
  ratingProgressItem,
  totalReviews,
}: RatingProgressProps) {
  const total = ratingProgressItem?.total ?? 0;
  const percent = totalReviews > 0 ? Math.min(100, (total / totalReviews) * 100) : 0;

  return (
    <div className="flex items-center gap-3 text-sm text-ozon-muted">
      <div className="w-16 shrink-0">{ratingId} звезды</div>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#e4e8ef]">
        <div
          className="absolute h-full rounded-full bg-[#ff9f00]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="w-8 shrink-0 text-right text-ozon-text">{total}</div>
    </div>
  );
}
