import Grid from '@/components/product/grid';
import { TitleSeo } from '@/components/seo/title-seo';
import ButtonGroup from '@/components/ui/button-group';
import MarketplacePageShell, { MarketplacePageHeader } from '@/components/layout/marketplace-page-shell';
import { usePopularProducts } from '@/data/product';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';

const MAP_RANGE_FILTER = [
  { label: 'text-weekly', range: 7 },
  { label: 'text-monthly', range: 30 },
  { label: 'text-yearly', range: 365 },
];

function Products() {
  const [selected, setRange] = useState(MAP_RANGE_FILTER[2]);
  const { popularProducts, isLoading } = usePopularProducts({
    range: selected.range,
  });
  const { t } = useTranslation('common');

  return (
    <>
      <div className="mb-4 flex flex-col-reverse flex-wrap items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-ozon-muted">
          {t('text-total')} {popularProducts.length} {t('text-product-found')}
        </p>
        <ButtonGroup items={MAP_RANGE_FILTER} selectedValue={selected} onChange={setRange} />
      </div>
      <Grid
        products={popularProducts}
        hasNextPage={false}
        isLoadingMore={false}
        isLoading={isLoading}
      />
    </>
  );
}

const PopularProductsPage: NextPageWithLayout = () => {
  return (
    <MarketplacePageShell>
      <TitleSeo title="Популярные товары" />
      <MarketplacePageHeader title="Популярные товары" subtitle="Самые востребованные предложения SANCAN" />
      <div className="pt-4">
        <Products />
      </div>
    </MarketplacePageShell>
  );
};

PopularProductsPage.getLayout = function getLayout(page) {
  return <MarketplaceLayout>{page}</MarketplaceLayout>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
    revalidate: 60,
  };
};

export default PopularProductsPage;
