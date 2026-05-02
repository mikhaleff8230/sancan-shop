import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { NextPageWithLayout, Place } from '@/types';
import Layout from '@/layouts/_layout';
import PlacesFeed from '@/components/places/PlacesFeed';
import { TitleSeo } from '@/components/seo/title-seo';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import client from '@/data/client';

interface FeedPageProps {
  initialPlaces: Place[];
  initialPaginatorInfo: any;
}

export const getServerSideProps: GetServerSideProps<FeedPageProps> = async ({ locale, res }) => {
  // Устанавливаем заголовки кэширования
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  );

  const queryClient = new QueryClient();
  const SSR_LIMIT = 30; // Первая порция через SSR
  
  try {
    // Загружаем первые плейсы без фильтра (для неавторизованных пользователей)
    // Для авторизованных фильтр будет применен на клиенте
    const response = await client.places.all({ 
      limit: SSR_LIMIT, 
      orderBy: 'created_at', 
      sortedBy: 'desc' 
    });

    const initialPlaces = response?.data ?? [];
    const initialPaginatorInfo = response?.meta ?? null;

    return {
      props: {
        initialPlaces,
        initialPaginatorInfo,
        ...(await serverSideTranslations(locale!, ['common'])),
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
    };
  } catch (error) {
    return {
      props: {
        initialPlaces: [],
        initialPaginatorInfo: null,
        ...(await serverSideTranslations(locale!, ['common'])),
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
    };
  }
};

const FeedPage: NextPageWithLayout<FeedPageProps> = ({ initialPlaces, initialPaginatorInfo }) => {
  const { t } = useTranslation('common');

  // Всегда показываем MAIN feed без фильтров
  const filters = {};

  return (
    <>
      <TitleSeo title="Фид плейсов - SANCAN" />

      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-heading mb-4">
            Фид плейсов
          </h1>
          <p className="text-body text-lg max-w-2xl mx-auto">
            Откройте для себя уникальные идеи и вдохновение от наших мастеров
          </p>
        </div>

        <PlacesFeed
          limit={30}
          showLoadMore={true}
          filters={filters}
          initialPlaces={initialPlaces}
          initialPaginatorInfo={initialPaginatorInfo}
        />
      </div>
    </>
  );
};

FeedPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default FeedPage;
