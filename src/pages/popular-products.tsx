import CommerceProductListing from '@/components/product/commerce-product-listing';
import { TitleSeo } from '@/components/seo/title-seo';
import { useCategoriesForMenu } from '@/data/category';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const PopularProductsPage: NextPageWithLayout = () => {
  const { categories } = useCategoriesForMenu();

  return (
    <>
      <TitleSeo
        title="Популярные товары — SANCAN"
        description="Самые востребованные товары магазинов SANCAN."
      />
      <CommerceProductListing
        eyebrow="SANCAN MARKET"
        title="Популярные товары"
        description="Самые востребованные предложения магазинов и авторов SANCAN."
        categories={categories}
      />
    </>
  );
};

PopularProductsPage.getLayout = function getLayout(page) {
  return <MarketplaceLayout>{page}</MarketplaceLayout>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common'])),
  },
  revalidate: 60,
});

export default PopularProductsPage;
