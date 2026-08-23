import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import type { NextPageWithLayout } from '@/types';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import AnchorLink from '@/components/ui/links/anchor-link';
import routes from '@/config/routes';
import Seo from '@/layouts/_seo';
import {
  ArrowRight,
  Compass,
  Home,
  Search,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

const ErrorPage: NextPageWithLayout = () => (
  <>
    <Seo
      title="Страница не найдена — SANCAN"
      description="Вернитесь на главную или продолжите покупки в каталоге SANCAN."
      url="/404"
    />
    <main className="sancan-ozon-page min-h-[calc(100vh-72px)] px-3 py-5 pb-24 sm:px-5 md:py-8">
      <section className="sancan-ozon-container relative isolate overflow-hidden rounded-[30px] bg-gradient-to-br from-[#35136f] via-[#7134dd] to-[#ad4dff] px-5 py-10 text-white shadow-[0_24px_70px_rgba(67,29,133,0.24)] sm:px-10 md:min-h-[560px] md:px-14 md:py-14 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:items-center lg:gap-10 lg:px-20">
        <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-[#ff5bd7]/30 blur-3xl" />
        <div className="absolute -bottom-44 right-0 h-96 w-96 rounded-full bg-[#53d8ff]/25 blur-3xl" />
        <div className="relative z-10 max-w-xl">
          <div className="bg-white/15 mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            Потерялись? Мы рядом
          </div>
          <p className="text-[76px] font-black leading-[0.82] tracking-[-0.08em] text-white/95 sm:text-[104px]">
            404
          </p>
          <h1 className="mt-7 text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl md:text-5xl">
            Здесь пока ничего нет
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-white/75 md:text-lg">
            Возможно, ссылка устарела или страница переехала. Вернитесь на
            главную либо найдите нужный товар в каталоге SANCAN.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <AnchorLink
              href={routes.home}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-[#4f239d] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Home className="h-5 w-5" />
              На главную
            </AnchorLink>
            <AnchorLink
              href={routes.explore}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <Compass className="h-5 w-5" />
              Открыть каталог
              <ArrowRight className="h-4 w-4" />
            </AnchorLink>
          </div>
        </div>
        <div
          className="relative mx-auto mt-12 h-[300px] w-full max-w-[520px] lg:mt-0 lg:h-[430px]"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 sm:h-[310px] sm:w-[310px]" />
          <div className="absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/25 sm:h-[220px] sm:w-[220px]" />
          <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[38px] bg-white text-[#7134dd] shadow-[0_24px_70px_rgba(18,5,46,0.35)] sm:h-40 sm:w-40">
            <Search className="h-14 w-14 sm:h-16 sm:w-16" strokeWidth={2.4} />
          </div>
          <div className="absolute left-[3%] top-[15%] flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-[#221532] shadow-xl sm:left-[5%] sm:px-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0e8ff] text-[#7134dd]">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span>
              <b className="block text-sm">Много товаров</b>
              <small className="text-[#7a6d88]">в одном каталоге</small>
            </span>
          </div>
          <div className="absolute bottom-[10%] right-[1%] flex items-center gap-3 rounded-2xl bg-[#d9ff9f] px-4 py-3 text-[#26183b] shadow-xl sm:right-[4%] sm:px-5">
            <Compass className="h-7 w-7" />
            <span className="text-sm font-extrabold">Путь найден</span>
          </div>
          <div className="absolute right-[7%] top-[9%] grid h-12 w-12 rotate-12 place-items-center rounded-2xl bg-[#ff5bd7] text-xl font-black shadow-lg">
            ?
          </div>
          <div className="absolute bottom-[6%] left-[14%] grid h-9 w-9 -rotate-12 place-items-center rounded-xl bg-[#55d8ff] text-sm font-black shadow-lg">
            404
          </div>
        </div>
      </section>
    </main>
  </>
);

ErrorPage.getLayout = function getLayout(page) {
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

export default ErrorPage;
