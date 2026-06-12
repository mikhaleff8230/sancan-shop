import type { CategoryPaginator, CategoryQueryOptions } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import client from '@/data/client';
import { useRouter } from 'next/router';

export function useCategories(options?: CategoryQueryOptions) {
  const { locale } = useRouter();

  const formattedOptions = {
    ...options,
    language: locale,
  };

  const {
    data,
    isLoading,
    error,
    isFetching,
  } = useQuery<CategoryPaginator, Error>(
    [API_ENDPOINTS.CATEGORIES, formattedOptions],
    ({ queryKey }) => client.categories.all(queryKey[1] as CategoryQueryOptions),
    {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    }
  );

  return {
    categories: Array.isArray(data?.data) ? data.data : [],
    paginatorInfo: data ?? null,
    hasNextPage: data ? data.current_page < data.last_page : false,
    isLoadingMore: isFetching && !isLoading,
    isLoading,
    error,
    loadMore: () => {},
  };
}

// Хук для получения категорий для меню с иерархией
export function useCategoriesForMenu() {
  const { locale } = useRouter();

  const {
    data,
    isLoading,
    error,
  } = useQuery(
    ['categories-menu', locale],
    () => client.categories.getMenuCategories({ 
      language: locale
    }),
    {
      staleTime: 5 * 60 * 1000, // 5 минут
      cacheTime: 10 * 60 * 1000, // 10 минут
    }
  );

  // Сбор иерархии, поддержка разных форматов parent, фильтрация и сортировка
  const buildCategoryHierarchy = (categories: any[]) => {
    if (!Array.isArray(categories)) return [];

    // Оставляем только опубликованные
    const filtered = categories.filter((c) => (c?.status || 'publish') === 'publish');

    // Сортируем один раз по sort_order, затем по name
    filtered.sort((a, b) => {
      const as = (a?.sort_order ?? 0) as number;
      const bs = (b?.sort_order ?? 0) as number;
      if (as !== bs) return as - bs;
      return (a?.name || '').localeCompare(b?.name || '');
    });

    const byId = new Map<string | number, any>();
    const roots: any[] = [];

    // Создаем индексы
    filtered.forEach((c) => {
      byId.set(c.id, { ...c, children: [] });
    });

    const getParentKey = (c: any) => {
      // Приходит как: number | string | { id } | null | undefined
      if (c?.parent == null && c?.parent_id == null) return null;
      if (typeof c?.parent === 'number' || typeof c?.parent === 'string') return c.parent;
      if (c?.parent && typeof c.parent === 'object' && 'id' in c.parent) return (c.parent as any).id;
      if (typeof c?.parent_id === 'number' || typeof c?.parent_id === 'string') return c.parent_id;
      return null;
    };

    // Формируем дерево
    filtered.forEach((c) => {
      const node = byId.get(c.id);
      const parentKey = getParentKey(c);
      if (parentKey != null && byId.has(parentKey)) {
        const parent = byId.get(parentKey);
        parent.children.push(node);
        parent.children.sort((a: any, b: any) => {
          const as = (a?.sort_order ?? 0) as number;
          const bs = (b?.sort_order ?? 0) as number;
          if (as !== bs) return as - bs;
          return (a?.name || '').localeCompare(b?.name || '');
        });
      } else {
        roots.push(node);
      }
    });

    // Финальная сортировка корня
    roots.sort((a: any, b: any) => {
      const as = (a?.sort_order ?? 0) as number;
      const bs = (b?.sort_order ?? 0) as number;
      if (as !== bs) return as - bs;
      return (a?.name || '').localeCompare(b?.name || '');
    });

    return roots;
  };

  const categories = data || [];
  const hierarchicalCategories = buildCategoryHierarchy(categories);

  return {
    categories: hierarchicalCategories,
    isLoading,
    error,
  };
}
