import CommerceProductListing from '@/components/product/commerce-product-listing';
import { TitleSeo } from '@/components/seo/title-seo';
import MarketplacePageShell from '@/components/layout/marketplace-page-shell';
import { useCategoryBySlug } from '@/data/category-hooks';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { GetServerSideProps } from 'next';
import type { NextPageWithLayout } from '@/types';
import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

interface CategoryPageProps {
  categorySlug: string;
}

const CategoryPage: NextPageWithLayout<CategoryPageProps> = ({ categorySlug }) => {
  const { category, isLoading: categoryLoading } = useCategoryBySlug(categorySlug);

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
      <CommerceProductListing
        eyebrow="КАТЕГОРИЯ"
        title={category.name}
        description={category.details || `Товары в категории «${category.name}»`}
        categories={category.children || []}
        categoryId={category?.id ? Number(category.id) : undefined}
        activeCategorySlug={categorySlug}
        filters={{ categories: categorySlug }}
      />
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
