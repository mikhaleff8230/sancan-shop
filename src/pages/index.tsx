import CategoryFilter from '@/components/product/category-filter';
import DynamicProductGrid from '@/components/product/dynamic-grid';
import { TitleSeo } from '@/components/seo/title-seo';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

interface HomePageProps {}

export const getStaticProps: GetStaticProps<HomePageProps> = async ({ locale }) => {
  try {
    return {
      props: {
        ...(await serverSideTranslations(locale!, ['common'])),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Home page SSR error:', error);
    return {
      props: {
        ...(await serverSideTranslations(locale!, ['common'])),
      },
    };
  }
};

function Products() {
  const { query } = useRouter();

  const filters = {
    ...(query.category && { categories: query.category }),
    ...(query.price && { price: query.price }),
  };

  return (
    <DynamicProductGrid
      limit={30}
      filters={filters}
      showLoadMore={true}
      className="px-0 pt-0"
    />
  );
}

function PromoStrip() {
  return (
    <div className="sancan-ozon-container pt-3">
      <div className="relative flex min-h-[52px] items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-r from-[#ff5bd7] via-[#00b7ff] to-[#304dff] px-4 text-center text-white shadow-sm">
        <div className="absolute -left-5 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-white/25 blur-xl" />
        <div className="absolute -right-4 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-white/25 blur-xl" />
        <span className="relative text-sm font-extrabold uppercase tracking-wide md:text-lg">
          Распродажа уже началась
        </span>
        <span className="relative ml-3 hidden rounded-full bg-[#0b2548] px-4 py-2 text-sm font-bold md:inline-flex">
          Забрать сейчас
        </span>
      </div>
    </div>
  );
}

function HeroBanner() {
  return (
    <div className="sancan-ozon-container pt-3">
      <div className="relative min-h-[210px] overflow-hidden rounded-[22px] bg-[#ffe72e] px-6 py-7 shadow-sm md:min-h-[270px] md:px-12 lg:px-16">
        <button
          type="button"
          aria-label="Предыдущий баннер"
          className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl text-ozon-text shadow-sm"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Следующий баннер"
          className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl text-ozon-text shadow-sm"
        >
          ›
        </button>

        <div className="relative z-[1] grid gap-6 md:grid-cols-[1fr_380px] md:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-[28px] bg-white px-5 py-3 text-lg font-black text-ozon-text shadow-sm md:text-2xl">
              SANCAN Маркет
            </div>
            <h1 className="max-w-[620px] text-4xl font-black leading-[0.95] tracking-[-0.02em] text-black md:text-6xl">
              Цены напрямую от продавцов
            </h1>
            <p className="mt-5 max-w-[520px] text-base font-semibold text-black/70 md:text-lg">
              Новые товары, подборки и выгодные предложения в одном каталоге.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-ozon-text shadow-sm">
                Промокод SANCAN
              </span>
              <span className="rounded-2xl bg-[#8057ff] px-5 py-3 text-sm font-black text-white shadow-sm">
                Скидки до 80%
              </span>
            </div>
          </div>

          <div className="relative hidden h-[210px] rounded-[32px] bg-[#8a65ff] p-6 text-white shadow-[0_20px_50px_rgba(91,58,255,0.28)] md:block">
            <div className="absolute -left-4 top-8 h-20 w-20 rounded-3xl bg-white/25 blur-sm" />
            <div className="absolute right-7 top-8 rotate-6 rounded-2xl bg-white px-5 py-4 text-4xl font-black text-ozon-pink shadow-lg">
              %
            </div>
            <div className="absolute bottom-8 left-8 max-w-[240px] text-3xl font-black leading-tight">
              Корзина сама себя не оплатит
            </div>
            <div className="absolute bottom-6 right-7 text-2xl font-bold text-white/60">
              0+
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Home: NextPageWithLayout<HomePageProps> = () => {
  return (
    <>
      <TitleSeo
        title="SANCAN — каталог товаров"
        description="SANCAN: товары, подборки и покупки в едином каталоге."
      />

      <section className="sancan-ozon-page pb-12">
        <PromoStrip />
        <HeroBanner />
        <CategoryFilter />
        <div className="sancan-ozon-container">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-ozon-text md:text-3xl">
                Популярные товары
              </h2>
              <p className="mt-1 text-sm text-ozon-muted">
                Последние обновления каталога SANCAN.
              </p>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand shadow-sm">
              Новинки и хиты
            </div>
          </div>
          <Products />
        </div>
      </section>
    </>
  );
};

Home.getLayout = function getLayout(page) {
  return <MarketplaceLayout>{page}</MarketplaceLayout>;
};

export default Home;
