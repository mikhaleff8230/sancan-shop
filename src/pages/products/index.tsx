import CommerceProductListing from '@/components/product/commerce-product-listing';
import { TitleSeo } from '@/components/seo/title-seo';
import { useCategoriesForMenu } from '@/data/category';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common'])),
  },
  revalidate: 60,
});

const ProductsPage: NextPageWithLayout = () => {
  const { query } = useRouter();
  const { categories } = useCategoriesForMenu();
  const filters = {
    ...(typeof query.category === 'string' && { categories: query.category }),
    ...(typeof query.price === 'string' && { price: query.price }),
  };

  return (
    <>
      <TitleSeo title="Товары — SANCAN" description="Товары, магазины и бренды SANCAN." />
      <CommerceProductListing
        title="Товары"
        description="Авторские вещи, дизайн и находки от магазинов SANCAN."
        categories={categories}
        filters={filters}
      />
    </>
  );
};

ProductsPage.getLayout = function getLayout(page) {
  return <MarketplaceLayout>{page}</MarketplaceLayout>;
};

export default ProductsPage;
