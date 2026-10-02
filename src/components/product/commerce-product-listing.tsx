import { useEffect, useState } from 'react';
import Image from '@/components/ui/image';
import placeholder from '@/assets/images/placeholders/product.svg';
import type { Category } from '@/types';
import DynamicProductGrid from '@/components/product/dynamic-grid';
import ProductFilterBar from '@/components/product/product-filter-bar';
import { useViewMode } from '@/components/product/grid-switcher';
import { CompactGridIcon } from '@/components/icons/compact-grid-icon';
import { NormalGridIcon } from '@/components/icons/normal-grid-icon';
import Link from 'next/link';

type ListingFilters = {
  categories?: string;
  tags?: string;
  shop_id?: string;
  price?: string;
  name?: string;
};

interface CommerceProductListingProps {
  eyebrow?: string;
  title: string;
  description: string;
  categories?: Category[];
  categoryId?: number;
  activeCategorySlug?: string;
  filters?: ListingFilters;
}

function CategoryChip({ category, active }: { category: Category; active: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const source = category.menu_banner?.thumbnail || category.menu_banner?.original || category.image?.thumbnail || category.image?.original;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={active ? 'web2-commerce-category web2-commerce-category-active' : 'web2-commerce-category'}
    >
      <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-full bg-[#eeeaf4]">
        <Image
          src={imageFailed || !source ? placeholder : source}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      </span>
      <span className="truncate">{category.name}</span>
    </Link>
  );
}

export default function CommerceProductListing({
  eyebrow = 'SANCAN MARKET',
  title,
  description,
  categories = [],
  categoryId,
  activeCategorySlug,
  filters = {},
}: CommerceProductListingProps) {
  const [sortParams, setSortParams] = useState({ orderBy: 'orders_count', sortedBy: 'desc' });
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string[]>>({});
  const [total, setTotal] = useState<number | null>(null);
  const { viewMode, setViewMode } = useViewMode();

  useEffect(() => {
    setAttributeFilters({});
  }, [categoryId, activeCategorySlug]);

  return (
    <main className="web2-commerce-surface pb-16 pt-4 sm:pt-5">
      <section className="web2-commerce-hero web2-commerce-hero-market">
        <div className="relative z-[1]">
          <p className="web2-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <p className="web2-commerce-signature" aria-hidden="true">Больше,<br />чем просто вещи</p>
      </section>

      {categories.length > 0 ? (
        <nav className="web2-commerce-categories" aria-label="Категории товаров">
          {categories.slice(0, 10).map((category) => (
            <CategoryChip key={category.id} category={category} active={category.slug === activeCategorySlug} />
          ))}
          <Link href="/products" className="web2-commerce-category web2-commerce-category-more">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#efe7ff] text-xl text-[#7b3dff]">→</span>
            <span>Все товары</span>
          </Link>
        </nav>
      ) : null}

      <ProductFilterBar
        categoryId={categoryId}
        onSortChange={(orderBy, sortedBy) => setSortParams({ orderBy, sortedBy })}
        onFilterChange={setAttributeFilters}
      />

      <div className="web2-product-grid-meta">
        <span>{total === null ? 'Загружаем товары…' : `Найдено ${total.toLocaleString('ru-RU')} товаров`}</span>
        <div className="web2-view-switcher" aria-label="Вид товаров">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'is-active' : ''}
            aria-label="Сетка"
          >
            <NormalGridIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'is-active' : ''}
            aria-label="Список"
          >
            <CompactGridIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <DynamicProductGrid
        limit={36}
        filters={{ ...filters, ...sortParams, attribute_values: attributeFilters }}
        showLoadMore
        showSummary={false}
        dense
        onMetaChange={setTotal}
        className="px-0 pt-0"
      />
    </main>
  );
}
