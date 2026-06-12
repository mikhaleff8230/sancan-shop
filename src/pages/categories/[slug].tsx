import DynamicProductGrid from '@/components/product/dynamic-grid';
import { TitleSeo } from '@/components/seo/title-seo';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import SubcategoryFilter from '@/components/categories/subcategory-filter';
import ProductFilterBar from '@/components/product/product-filter-bar';
import MarketplacePageShell, {
  MarketplacePageHeader,
} from '@/components/layout/marketplace-page-shell';
import { useCategoryBySlug, useCategoryBreadcrumbs } from '@/data/category-hooks';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { GetServerSideProps } from 'next';
import type { NextPageWithLayout } from '@/types';
import React, { useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

interface CategoryPageProps {
  categorySlug: string;
}

const CategoryPage: NextPageWithLayout<CategoryPageProps> = ({ categorySlug }) => {
  const { category, isLoading: categoryLoading } = useCategoryBySlug(categorySlug);
  const breadcrumbs = useCategoryBreadcrumbs(category);
  const [sortParams, setSortParams] = useState({ orderBy: 'orders_count', sortedBy: 'desc' });
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string[]>>({});

  const filters = {
    categories: categorySlug,
    ...sortParams,
    attribute_values: attributeFilters,
  };

  const baseUrl = 'https://sancan.ru';
  const canonicalUrl = category
    ? `${baseUrl}/categories/${category.slug}`
    : `${baseUrl}/categories/${categorySlug}`;

  if (categoryLoading) {
    return (
      <MarketplacePageShell>
        <TitleSeo title="Загрузка..." canonical={canonicalUrl} />
        <div className="grid grid-cols-2 gap-3 py-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="sancan-ozon-card aspect-[3/4] animate-pulse bg-[#eef1f6]" />
          ))}
        </div>
      </MarketplacePageShell>
    );
  }

  if (!category) {
    return (
      <MarketplacePageShell>
        <TitleSeo title="Категория не найдена" canonical={canonicalUrl} />
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold text-ozon-text">Категория не найдена</h1>
          <p className="mt-2 text-sm text-ozon-muted">
            Запрашиваемая категория не существует или была удалена.
          </p>
        </div>
      </MarketplacePageShell>
    );
  }

  return (
    <>
      <TitleSeo title={category.name} canonical={canonicalUrl} />
      {category.children && category.children.length > 0 ? (
        <SubcategoryFilter subcategories={category.children} currentCategorySlug={categorySlug} />
      ) : null}
      <ProductFilterBar
        categoryId={category?.id ? Number(category.id) : undefined}
        onSortChange={(orderBy, sortedBy) => setSortParams({ orderBy, sortedBy })}
        onFilterChange={setAttributeFilters}
      />
      <MarketplacePageShell>
        <div className="mb-4 pt-2">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        <MarketplacePageHeader title={category.name} subtitle="Товары в категории SANCAN" />
        <div className="pt-4">
          <DynamicProductGrid limit={45} filters={filters} showLoadMore className="px-0 pt-0" />
        </div>
      </MarketplacePageShell>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
  const { slug } = params!;
  const categorySlug = Array.isArray(slug) ? slug[0] : slug;

  return {
    props: {
      categorySlug: categorySlug || '',
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  };
};

CategoryPage.getLayout = function getLayout(page) {
  return <MarketplaceLayout>{page}</MarketplaceLayout>;
};

export default CategoryPage;
