import ReviewCard from '@/components/review/review-card';
import Pagination from '@/components/ui/pagination';
import { useState } from 'react';
import Sorting from './sorting';
import { useRouter } from 'next/router';
import { useReviews } from '@/data/review';
import { useTranslation } from 'next-i18next';

type ProductReviewsProps = {
  className?: any;
  productId: string;
  productType?: string;
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { query } = useRouter();
  const { text, ...restQuery } = query;
  const [page, setPage] = useState(1);

  const { reviews, paginatorInfo } = useReviews({
    product_id: productId,
    limit: 5,
    page,
    ...restQuery,
  });

  function onPagination(current: number) {
    setPage(current);
  }
  const { t } = useTranslation('common');
  return (
    <div className="block">
      <div className="mb-5 flex flex-col justify-between gap-3 border-b border-ozon-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ozon-text">
            Отзывы о товаре <sup className="text-sm font-semibold text-ozon-muted">{paginatorInfo?.total ?? 0}</sup>
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ozon-text shadow-[0_2px_8px_rgba(23,33,43,0.08)]">
              Все отзывы
            </span>
            <span className="rounded-full bg-[#f1f4f8] px-4 py-2 text-sm font-semibold text-ozon-text">
              Этот вариант товара
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <Sorting />
        </div>
      </div>

      {reviews?.length !== 0 ? (
        <div className="block">
          <div className="block">
            {reviews?.map((review: any) => (
              <ReviewCard key={`review-no-${review?.id}`} review={review} />
            ))}
          </div>

          {/* Pagination */}
          {paginatorInfo && (
            <div className="flex flex-col items-center justify-between space-y-1 border-t border-ozon-border py-5 md:flex-row md:space-y-0 md:py-3">
              <div className="text-13px text-ozon-muted md:mt-2">
                {t('text-page')} {paginatorInfo.currentPage} {t('text-of')}{' '}
                {Math.ceil(paginatorInfo.total / paginatorInfo.perPage)}
              </div>

              <Pagination
                total={paginatorInfo.total}
                current={paginatorInfo.currentPage}
                pageSize={paginatorInfo.perPage}
                onChange={onPagination}
                showTitle={false}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#f5f7fb] px-5 py-16">
          <h3 className="text-lg font-semibold text-ozon-muted">
            {t('text-no-reviews-found')}
          </h3>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
