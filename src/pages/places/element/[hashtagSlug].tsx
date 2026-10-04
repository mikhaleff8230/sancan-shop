import PlacesFeed from '@/components/places/PlacesFeed';
import PlaceTopicBar from '@/components/places/PlaceTopicBar';
import { TitleSeo } from '@/components/seo/title-seo';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout, Hashtag } from '@/types';
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { dehydrate, QueryClient } from '@tanstack/react-query';

// Dynamic rendering - no static generation
type PageProps = {
  hashtag: Hashtag;
  initialPlaces: any[];
  initialPaginatorInfo: any;
};

export const getServerSideProps: GetServerSideProps<
  PageProps
> = async ({ params, locale, res }) => {
  const { hashtagSlug } = params!;

  // Set cache headers for better performance
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  );

  const queryClient = new QueryClient();

  try {
    // ВАЖНО: На сервере используем прямой fetch, а не client (который работает только в браузере)
    const apiUrl = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'https://api.sancan.ru';

    // Получаем хэштег по slug
    const hashtagUrl = new URL(`${apiUrl}/hashtags/${hashtagSlug}`);

    const hashtagController = new AbortController();
    const hashtagTimeoutId = setTimeout(() => hashtagController.abort(), 5000); // 5 секунд timeout

    const hashtagRes = await fetch(hashtagUrl.toString(), {
      signal: hashtagController.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    clearTimeout(hashtagTimeoutId);

    if (!hashtagRes.ok) {
      console.error('Hashtag API вернул статус:', hashtagRes.status, hashtagRes.statusText);
      return {
        notFound: true,
      };
    }

    const hashtagText = await hashtagRes.text();
    let hashtagData;
    try {
      hashtagData = JSON.parse(hashtagText);
    } catch (e) {
      console.error('Hashtag JSON parse error:', e, 'Response text:', hashtagText);
      return {
        notFound: true,
      };
    }

    // Обрабатываем ответ хэштега
    const hashtag = hashtagData.data || hashtagData;
    if (!hashtag || !hashtag.id) {
      console.error('Хэштег не найден:', hashtagSlug, hashtagData);
      return {
        notFound: true,
      };
    }

    // Временно отключаем SSR для хэштегов чтобы избежать 502 ошибки
    // Данные будут загружаться на клиенте
    return {
      props: {
        hashtag,
        initialPlaces: [],
        initialPaginatorInfo: null,
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
        ...(await serverSideTranslations(locale!, ['common'])),
      },
    };
  } catch (error) {
    console.error('HashtagPage SSR - ошибка:', error);
    // В режиме разработки показываем детали ошибки
    if (process.env.NODE_ENV === 'development') {
      console.error('HashtagPage SSR - детали ошибки:', {
        hashtagSlug,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
    }
    return {
      notFound: true,
    };
  }
};

const HashtagPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ hashtag, initialPlaces, initialPaginatorInfo }) => {
  // Формируем фильтры как в ТЗ
  const filters = {
    hashtag_slug: hashtag.slug,
  };

  // Формируем canonical URL для страницы хештега плейсов
  const baseUrl = 'https://sancan.ru';
  const canonicalUrl = `${baseUrl}/places/element/${hashtag.slug}`;

  return (
    <>
      <TitleSeo
        title={`#${hashtag.name} - Плейсы`}
        canonical={canonicalUrl}
      />
      <main className="web2-discovery-surface pb-16">
        <PlaceTopicBar />
        <header className="mb-5 rounded-[14px] border border-slate-100 bg-gradient-to-r from-[#faf7ff] to-white px-5 py-5 sm:px-7">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#8b5cf6]">SANCAN / Плейсы</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-.03em] text-[#172033] sm:text-3xl">#{hashtag.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Плейсы с хэштегом #{hashtag.name}</p>
        </header>

        <section aria-label={`Плейсы с хэштегом ${hashtag.name}`}>
          <PlacesFeed
            limit={30}
            showLoadMore
            filters={filters}
            initialPlaces={initialPlaces}
            initialPaginatorInfo={initialPaginatorInfo}
          />
        </section>
      </main>
    </>
  );
};

HashtagPage.getLayout = function getLayout(page) {
  return <MarketplaceLayout>{page}</MarketplaceLayout>;
};

export default HashtagPage;

