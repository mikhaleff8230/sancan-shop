import { Place } from '@/types';
import { PlaceGrid } from '@/components/places/PlaceGrid';
import { usePlacesFeed, FEED_TYPES } from '@/feeds/places';
import { buildSimilarFilter } from '@/filters/places';
import { InfiniteScroll } from '@/components/places/Pagination/InfiniteScroll';
import Loader from '@/components/ui/loader/spinner/spinner';

interface SimilarPlacesProps {
  currentPlaceId: string;
  currentPlaceTitle?: string; // не используется, но оставляем для совместимости
  className?: string;
}

/**
 * Компонент для отображения похожих плейсов
 * Использует usePlacesFeed с типом SIMILAR для бесконечной прокрутки с фильтрацией по хэштегам
 */
export default function SimilarPlaces({
  currentPlaceId,
  currentPlaceTitle = '', // не используется в новой реализации
  className = '',
}: SimilarPlacesProps) {
  // ============================
  // Получаем похожие плейсы через новый usePlacesFeed с фильтром similar
  // ============================
  const { places: similarPlaces, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } = usePlacesFeed({
    type: FEED_TYPES.SIMILAR,
    params: {
      ...buildSimilarFilter(currentPlaceId),
      limit: 50, // Увеличиваем лимит для загрузки большего количества похожих плейсов
    },
  });

  // ============================
  // Обработка ошибок
  // ============================
  if (error) {
    console.error('SimilarPlaces: Error loading similar places:', error);
    return (
      <div className="py-8 text-center text-red-500">
        Ошибка загрузки похожих плейсов
      </div>
    );
  }

  // ============================
  // Рендер
  // ============================
  return (
    <div className={className}>
      {/* Loader при первой загрузке */}
      {isLoading && similarPlaces.length === 0 && (
        <div className="mt-8 flex justify-center">
          <Loader showText={false} />
        </div>
      )}

      {/* Сообщение если похожих плейсов нет */}
      {!isLoading && similarPlaces.length === 0 && (
        <div className="py-8 text-center text-sm opacity-60">
          Похожих плейсов не найдено
        </div>
      )}

      {/* Grid плейсов с бесконечной прокруткой */}
      {similarPlaces.length > 0 && (
        <InfiniteScroll
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          children={
            <>
              <PlaceGrid places={similarPlaces} />

              {/* Loading indicator при подгрузке */}
              {isFetchingNextPage && (
                <div className="mt-8 flex justify-center">
                  <Loader showText={false} />
                </div>
              )}
            </>
          }
        />
      )}
    </div>
  );
}
