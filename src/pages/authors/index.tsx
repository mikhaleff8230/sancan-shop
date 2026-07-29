import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import type { NextPageWithLayout } from '@/types';
import { useState } from 'react';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import MarketplacePageShell, {
  MarketplacePageHeader,
} from '@/components/layout/marketplace-page-shell';
import Grid from '@/components/shop/grid';
import Seo from '@/layouts/_seo';
import routes from '@/config/routes';
import { useTopShops } from '@/data/shop';
import ButtonGroup from '@/components/ui/button-group';
import { SearchIcon } from '@/components/icons/search-icon';
import { useTranslation } from 'next-i18next';

const MAP_RANGE_FILTER = [
  {
    label: 'text-weekly',
    range: 7,
  },
  {
    label: 'text-monthly',
    range: 30,
  },
  {
    label: 'text-yearly',
    range: 365,
  },
];

// Every shop owner in an author here
function Shops() {
  let [selected, setRange] = useState(MAP_RANGE_FILTER[2]);
  let [searchText, setSearchText] = useState('');
  const { shops, loadMore, hasNextPage, isLoadingMore, isLoading } =
    useTopShops({
      range: selected.range,
      name: searchText,
    });
  const { t } = useTranslation('common');
  return (
    <MarketplacePageShell>
      <MarketplacePageHeader
        title="Магазины"
        subtitle="Продавцы SANCAN, товары и подборки в одном месте"
      />
      <div className="my-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative mt-3 w-full max-w-xs sm:mt-0">
          <SearchIcon className="absolute left-1 top-1/2 -mt-2 h-4 w-4" />
          <input
            type="search"
            onChange={(e) => setSearchText(e.target.value)}
            autoFocus={true}
            placeholder={t('text-placeholder-search')}
            className="h-11 w-full rounded-2xl border border-ozon-border bg-white pl-8 pr-4 text-13px font-medium text-ozon-text outline-none focus:border-ozon-blue focus:ring-0"
          />
        </div>
        <ButtonGroup
          items={MAP_RANGE_FILTER}
          selectedValue={selected}
          onChange={setRange}
        />
      </div>
      <Grid
        shops={shops}
        onLoadMore={loadMore}
        hasNextPage={hasNextPage}
        isLoadingMore={isLoadingMore}
        isLoading={isLoading}
      />
    </MarketplacePageShell>
  );
}

const AuthorsPage: NextPageWithLayout = () => {
  return (
    <>
      <Seo
        title="Shops"
        description="Fastest digital download template built with React, NextJS, TypeScript, React-Query and Tailwind CSS."
        url={routes.shops}
      />
      <Shops />
    </>
  );
};

AuthorsPage.getLayout = function getLayout(page) {
  return <MarketplaceLayout>{page}</MarketplaceLayout>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
    revalidate: 60, // In seconds
  };
};

export default AuthorsPage;
