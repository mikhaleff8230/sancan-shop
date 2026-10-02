import CategoryFilter from '@/components/product/category-filter';
import DynamicProductGrid from '@/components/product/dynamic-grid';
import { TitleSeo } from '@/components/seo/title-seo';
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
  const filters = {
    ...(typeof query.category === 'string' && { categories: query.category }),
    ...(typeof query.price === 'string' && { price: query.price }),
  };

  return (
    <>
      <TitleSeo title="Товары — SANCAN" description="Товары, магазины и бренды SANCAN." />
      <main className="web2-commerce-surface pb-16 pt-5">
        <section className="web2-commerce-hero">
          <div>
            <p className="web2-eyebrow">SANCAN MARKET</p>
            <h1>Товары</h1>
            <p>Авторские вещи, дизайн и находки от магазинов SANCAN.</p>
          </div>
        </section>
        <CategoryFilter />
        <div className="mt-6">
          <DynamicProductGrid
            limit={30}
            filters={{ ...filters, orderBy: 'created_at', sortedBy: 'desc' }}
            showLoadMore
            showSummary
            className="px-0 pt-0"
          />
        </div>
      </main>
    </>
  );
};

ProductsPage.getLayout = function getLayout(page) {
  return <MarketplaceLayout>{page}</MarketplaceLayout>;
};

export default ProductsPage;
