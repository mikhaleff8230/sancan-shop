import CategoryFilter from '@/components/product/category-filter';
import DynamicProductGrid from '@/components/product/dynamic-grid';
import PlacesFeed from '@/components/places/PlacesFeed';
import { TitleSeo } from '@/components/seo/title-seo';
import client from '@/data/client';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import Layout from '@/layouts/_layout';
import type {
  CategoryQueryOptions,
  NextPageWithLayout,
  SettingsQueryOptions,
  Place,
} from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient } from '@tanstack/react-query';

interface HomePageProps {
  initialPlaces: Place[];
  initialPaginatorInfo: any;
}

export const getStaticProps: GetStaticProps<HomePageProps> = async ({ locale }) => {
  const queryClient = new QueryClient();

  try {
    const [settings, categories] = await Promise.all([
      queryClient.prefetchQuery(
        [API_ENDPOINTS.SETTINGS, { language: locale }],
        ({ queryKey }) =>
          client.settings.all(queryKey[1] as SettingsQueryOptions)
      ),
      queryClient.prefetchInfiniteQuery(
        [API_ENDPOINTS.CATEGORIES, { limit: 100, language: locale }],
        ({ queryKey }) =>
          client.categories.all(queryKey[1] as CategoryQueryOptions)
      ),
    ]);

    // Временно отключаем SSR для places чтобы избежать 502 ошибки
    // Данные будут загружаться на клиенте
    return {
      props: {
        initialPlaces: [],
        initialPaginatorInfo: null,
        ...(await serverSideTranslations(locale!, ['common'])),
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
      revalidate: 60, // In seconds
    };
  } catch (error) {
    console.error('Home page SSR error:', error);
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

function Products() {
  const { query } = useRouter();
  
  const filters = {
    ...(query.category && { categories: query.category }),
    ...(query.price && { price: query.price }),
  };

  return (
    <DynamicProductGrid
      limit={28}
      filters={filters}
      showLoadMore={true}
    />
  );
}

// TODO: SEO text gulo translation ready hobe kina? r seo text gulo static thakbe or dynamic?
const Home: NextPageWithLayout<HomePageProps> = ({ initialPlaces, initialPaginatorInfo }) => {
  return (
    <>
      <TitleSeo 
        title={'SANCAN — медиа платформа для продвижения.'} 
        description={'Вещи со смыслом. Плейсы, где вдохновение становится выбором.'}
      />
      
      {/* Places Feed Section */}
      <section className="mb-12">
        <div className="container mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-heading mb-4">
              Последние плейсы
            </h2>
            <p className="text-body text-lg max-w-2xl mx-auto">
              Откройте для себя уникальные идеи и вдохновение от наших мастеров
            </p>
          </div>
          <PlacesFeed
            limit={5}
            showLoadMore={false}
            filters={{}}
            className="px-4 pt-5 pb-9 md:px-6 md:pb-10 md:pt-6 lg:px-7 lg:pb-12 3xl:px-8"
          />
        </div>
      </section>

      {/* Products Section */}
      <section>
        <div className="container mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-heading mb-4">
              Популярные товары
            </h2>
            <p className="text-body text-lg max-w-2xl mx-auto">
              Лучшие товары для вашего дома от проверенных мастеров
            </p>
          </div>
          <CategoryFilter />
          <Products />
        </div>
      </section>
    </>
  );
};

Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Home;


