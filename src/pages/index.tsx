import HomepageBanners from '@/components/home/homepage-banners';
import CommerceProductListing from '@/components/product/commerce-product-listing';
import { TitleSeo } from '@/components/seo/title-seo';
import { useCategoriesForMenu } from '@/data/category';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common'])),
  },
  revalidate: 60,
});

const Home: NextPageWithLayout = () => {
  const { categories } = useCategoriesForMenu();

  return (
    <>
      <TitleSeo
        title="SANCAN — интернет-магазин"
        description="Товары, магазины и бренды SANCAN в едином каталоге."
      />
      <main className="pb-16">
        <HomepageBanners />
        <CommerceProductListing
          eyebrow="SANCAN"
          title="Новые товары"
          description="Авторские вещи, дизайн и находки от магазинов SANCAN."
          categories={categories}
          groupByCategories
        />
      </main>
    </>
  );
};

Home.getLayout = (page) => <MarketplaceLayout>{page}</MarketplaceLayout>;

export default Home;
