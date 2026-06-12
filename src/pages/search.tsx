import DynamicProductGrid from '@/components/product/dynamic-grid';
import { TitleSeo } from '@/components/seo/title-seo';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import ProductFilterBar from '@/components/product/product-filter-bar';
import MarketplacePageShell, {
  MarketplacePageHeader,
} from '@/components/layout/marketplace-page-shell';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import type { NextPageWithLayout } from '@/types';
import { useState, useEffect } from 'react';
import { SearchIcon } from '@/components/icons/search-icon';

interface SearchPageProps {
  initialQuery?: string;
}

const SearchPage: NextPageWithLayout<SearchPageProps> = ({ initialQuery = '' }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentQuery, setCurrentQuery] = useState(initialQuery);

  useEffect(() => {
    const { q } = router.query;
    if (q && typeof q === 'string') {
      setSearchQuery(q);
      setCurrentQuery(q);
    }
  }, [router.query]);

  const filters = {
    name: currentQuery,
  };

  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Поиск', href: '/search' },
    ...(currentQuery
      ? [{ label: `"${currentQuery}"`, href: `/search?q=${encodeURIComponent(currentQuery)}` }]
      : []),
  ];

  return (
    <>
      <TitleSeo
        title={currentQuery ? `Поиск: ${currentQuery}` : 'Поиск товаров'}
        description={
          currentQuery
            ? `Результаты поиска по запросу "${currentQuery}"`
            : 'Поиск товаров на SANCAN'
        }
      />
      {currentQuery ? <ProductFilterBar /> : null}
      <MarketplacePageShell>
        <div className="mb-4 pt-2">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        <MarketplacePageHeader
          title={currentQuery ? `Поиск: «${currentQuery}»` : 'Поиск товаров'}
          subtitle={currentQuery ? 'Результаты в каталоге SANCAN' : 'Введите запрос в строке поиска в шапке'}
        />
        {currentQuery ? (
          <div className="pt-4">
            <DynamicProductGrid limit={45} filters={filters} showLoadMore className="px-0 pt-0" />
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
            <SearchIcon className="mb-4 h-16 w-16 text-ozon-muted" />
            <h3 className="text-lg font-semibold text-ozon-text">Введите поисковый запрос</h3>
            <p className="mt-2 text-sm text-ozon-muted">
              Используйте поиск в шапке сайта
            </p>
          </div>
        )}
      </MarketplacePageShell>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  const { q } = query;

  return {
    props: {
      initialQuery: q && typeof q === 'string' ? q : '',
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  };
};

SearchPage.getLayout = function getLayout(page) {
  return <MarketplaceLayout>{page}</MarketplaceLayout>;
};

export default SearchPage;
