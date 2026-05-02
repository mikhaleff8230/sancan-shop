import PlacesFeed from '@/components/places/PlacesFeed';
import { TitleSeo } from '@/components/seo/title-seo';
import Layout from '@/layouts/_layout';
import type { NextPageWithLayout, Hashtag } from '@/types';
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from 'next';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation('common');

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
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-heading mb-4">
            #{hashtag.name}
          </h1>
          <p className="text-body text-lg max-w-2xl mx-auto">
            Плейсы с хэштегом #{hashtag.name}
          </p>
        </div>

        {/* Используем PlacesFeed как в ТЗ */}
        <PlacesFeed
          limit={30}
          showLoadMore={true}
          filters={filters}
          initialPlaces={initialPlaces}
          initialPaginatorInfo={initialPaginatorInfo}
          className="px-4 pt-5 pb-9 md:px-6 md:pb-10 md:pt-6 lg:px-7 lg:pb-12 3xl:px-8"
        />
      </div>
    </>
  );
};

HashtagPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default HashtagPage;

