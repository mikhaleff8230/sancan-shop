import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import client from './client';
import { API_ENDPOINTS } from './client/endpoints';
import { Place } from '@/types';

interface UsePlacesOptions {
  limit?: number;
  filters?: Record<string, any>;
}

/**
 * =========================
 * LIST OF PLACES (pagination / infinite scroll)
 * =========================
 */
export const usePlaces = ({ limit = 30, filters = {} }: UsePlacesOptions = {}) => {
  const [page, setPage] = useState(1);
  const [places, setPlaces] = useState<Place[]>([]);

  const { data, error, isLoading, isFetching } = useQuery(
    [API_ENDPOINTS.PLACES, page, limit, filters],
    () => client.places.all({ page, limit, ...filters }),
    {
      keepPreviousData: true,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      onSuccess: (res) => {
        if (!res?.data) return;

        setPlaces((prev) =>
          page === 1 ? res.data : [...prev, ...res.data]
        );
      },
    }
  );

  const paginatorInfo = data?.meta ?? null;

  const hasNextPage =
    paginatorInfo?.current_page &&
    paginatorInfo?.per_page &&
    paginatorInfo?.total
      ? paginatorInfo.current_page * paginatorInfo.per_page <
        paginatorInfo.total
      : false;

  const isLoadingMore = isFetching && !isLoading;

  const loadMore = () => {
    if (!hasNextPage || isLoadingMore) return;
    setPage((prev) => prev + 1);
  };

  return {
    places,
    paginatorInfo,
    hasNextPage,
    loadMore,
    isLoading,
    isLoadingMore,
    error,
  };
};

/**
 * =========================
 * INFINITE PLACES FEED (cursor-based)
 * =========================
 */
export const useInfinitePlacesFeed = (options: {
  limit?: number;
  initialData?: any;
} = {}) => {
  const { limit = 20, initialData } = options;

  return useInfiniteQuery({
    queryKey: [API_ENDPOINTS.PLACES_FEED, limit],
    queryFn: async ({ pageParam = null }) => {
      const params: any = { limit };
      if (pageParam) {
        params.cursor = pageParam;
      }

      const response = await client.places.feed(params);
      return response;
    },
    getNextPageParam: (lastPage) => {
      // Возвращаем next_cursor из meta, если has_more = true
      return lastPage.meta?.has_more ? lastPage.meta?.next_cursor : undefined;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

/**
 * =========================
 * SIMILAR PLACES
 * =========================
 */
export const useSimilarPlaces = (placeId: string | number, options: {
  limit?: number;
  enabled?: boolean;
} = {}) => {
  const { limit = 12, enabled = true } = options;

  return useQuery({
    queryKey: [API_ENDPOINTS.PLACES_SIMILAR, placeId, limit],
    queryFn: () => client.places.similar(placeId, { limit }),
    enabled: enabled && !!placeId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};

/**
 * =========================
 * UNIFIED PLACES FEED (supports both filtered and infinite)
 * =========================
 */
export const useUnifiedPlacesFeed = (options: {
  limit?: number;
  filters?: Record<string, any>;
}) => {
  const { limit = 30, filters = {} } = options;
  const hasFilters = Object.keys(filters).length > 0;

  // Для страниц с фильтрами (хэштеги) используем старый usePlaces
  const filteredHook = usePlaces(
    hasFilters ? {
      limit,
      orderBy: 'created_at',
      sortedBy: 'desc',
      ...filters,
    } : {},
    { enabled: hasFilters }
  );

  // Для главной страницы используем новый cursor-based infinite scroll
  const infiniteHook = useInfinitePlacesFeed({
    limit,
  });

  // Выбираем активный хук
  const activeHook = hasFilters ? filteredHook : infiniteHook;

  // Объединяем данные в единый интерфейс
  const rawPlaces = hasFilters
    ? activeHook.places || []
    : activeHook.data?.pages?.flatMap(page => page?.data || []) || [];

  // Преобразуем данные в формат, ожидаемый PlaceCard
  const allPlaces = rawPlaces.map(place => {
    // Если это данные из нового API (с preview_image), преобразуем в старый формат
    if (place.preview_image && !place.images) {
      return {
        ...place,
        images: place.preview_image ? [{
          id: place.preview_image.id,
          url: place.preview_image.url,
          thumbnail: place.preview_image.thumbnail,
        }] : [],
      };
    }
    // Если уже в старом формате, возвращаем как есть
    return place;
  });

  return {
    // Объединенные данные
    places: allPlaces,
    isLoading: activeHook.isLoading,
    isFetchingNextPage: hasFilters ? activeHook.isLoadingMore : activeHook.isFetchingNextPage,
    hasNextPage: activeHook.hasNextPage,
    fetchNextPage: hasFilters ? activeHook.loadMore : activeHook.fetchNextPage,
    error: activeHook.error,

    // Метаданные
    hasFilters,
    totalPlaces: allPlaces.length,
  };
};

/**
 * =========================
 * SINGLE PLACE (SSR-safe)
 * =========================
 */
export const usePlace = (id: string, initialPlace?: Place) => {
  const { data, error, isLoading } = useQuery(
    [API_ENDPOINTS.PLACES, id],
    () => client.places.get(id),
    {
      enabled: !!id && !initialPlace, // 🔥 ключевая строка
      initialData: initialPlace
        ? { data: initialPlace }
        : undefined,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    }
  );

  return {
    place: data?.data ?? data,
    error,
    isLoading,
  };
};
