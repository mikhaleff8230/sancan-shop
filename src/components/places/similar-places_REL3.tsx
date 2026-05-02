import { useState, useEffect, useRef, useCallback } from 'react';
import { Place } from '@/types';
import { PlaceGrid } from '@/components/places/PlaceGrid';
import { usePlaces } from '@/data/place';
import Loader from '@/components/ui/loader/spinner/spinner';

interface SimilarPlacesProps {
  currentPlaceId: string;
  currentPlaceTitle?: string; // для фильтра похожих
  className?: string;
}

/**
 * Стабильный Pinterest-style infinite scroll
 * Загружает все плейсы, похожие по теме, бесконечно
 */
export default function SimilarPlaces({
  currentPlaceId,
  currentPlaceTitle = '',
  className = '',
}: SimilarPlacesProps) {
  const [page, setPage] = useState(1); // текущая страница API
  const [allPlaces, setAllPlaces] = useState<Place[]>([]); // накопленные плейсы
  const [hasMore, setHasMore] = useState(true); // есть ли ещё данные
  const observer = useRef<IntersectionObserver | null>(null);

  // ============================
  // Получаем плейсы с API
  // ============================
  const { places, paginatorInfo, isLoading, error } = usePlaces({
    limit: 12,
    page,
    orderBy: 'created_at',
    sortedBy: 'desc',
  });

  // Обработка ошибок
  useEffect(() => {
    if (error) {
      console.error('SimilarPlaces: Error loading places:', error);
    }
  }, [error]);

  // ============================
  // Фильтруем похожие плейсы
  // ============================
  const filterSimilar = useCallback(
    (items: Place[]) => {
      try {
      if (!currentPlaceTitle) return items.filter(p => p.id !== currentPlaceId);

      // Простая фильтрация по ключевым словам
      const keywords = currentPlaceTitle.toLowerCase().split(' ').filter(w => w.length > 2);
      return items
        .filter(p => p.id !== currentPlaceId)
        .map(p => ({
          ...p,
          similarity: keywords.reduce((score, kw) => {
            if (p.title?.toLowerCase().includes(kw)) score += 1;
            if (p.description?.toLowerCase().includes(kw)) score += 0.5;
            return score;
          }, 0),
        }))
        .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
      } catch (err) {
        console.error('SimilarPlaces: Error in filterSimilar:', err);
        return items.filter(p => p.id !== currentPlaceId);
      }
    },
    [currentPlaceId, currentPlaceTitle]
  );

  // ============================
  // Добавляем новые плейсы в список
  // ============================
  useEffect(() => {
    if (!places) return;

    const similar = filterSimilar(places);

    // Защита от дублей
    setAllPlaces(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const filteredNew = similar.filter(p => !existingIds.has(p.id));
      return [...prev, ...filteredNew];
    });

    setHasMore(paginatorInfo ? paginatorInfo.currentPage < paginatorInfo.lastPage : false);
  }, [places, paginatorInfo, filterSimilar]);

  // ============================
  // Callback-ref для последнего элемента
  // ============================
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && hasMore) {
            setPage(prev => prev + 1);
          }
        },
        { rootMargin: '200px' }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  // ============================
  // Рендер
  // ============================
  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        Ошибка загрузки похожих плейсов
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Grid плейсов */}
      {allPlaces.length > 0 && (
        <PlaceGrid
          places={allPlaces}
          onLastItemRef={lastItemRef} // передаём callback последнему элементу
        />
      )}

      {/* Невидимый блок вместо loader при подгрузке */}
      {isLoading && (
        <div className="h-32 opacity-0" />
      )}

      {/* Сообщение о конце списка */}
      {!hasMore && allPlaces.length > 0 && (
        <div className="py-8 text-center text-sm opacity-60">
          Больше плейсов нет
        </div>
      )}
    </div>
  );
}
