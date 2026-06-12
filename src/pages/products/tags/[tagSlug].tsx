import DynamicProductGrid from '@/components/product/dynamic-grid';
import { TitleSeo } from '@/components/seo/title-seo';
import client from '@/data/client';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import MarketplacePageShell, { MarketplacePageHeader } from '@/components/layout/marketplace-page-shell';
import type { NextPageWithLayout, Tag } from '@/types';
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { dehydrate, QueryClient } from '@tanstack/react-query';

// Dynamic rendering - no static generation
type PageProps = {
  tag: Tag;
};

export const getServerSideProps: GetServerSideProps<
  PageProps
> = async ({ params, locale, res }) => {
  const { tagSlug } = params!;

  console.log('[TagPage] getServerSideProps called', {
    tagSlug,
    locale,
    timestamp: new Date().toISOString()
  });

  // Set cache headers for better performance
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  );

  const queryClient = new QueryClient();
  try {
    console.log('[TagPage] Attempting to fetch tag', { tagSlug, locale });

    const tag = await client.tags.get({ slug: tagSlug as string, language: locale });

    console.log('[TagPage] Tag fetched successfully', {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      language: tag.language
    });

    return {
      props: {
        tag,
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
        ...(await serverSideTranslations(locale!, ['common'])),
      },
    };
  } catch (error) {
    console.error('[TagPage] Error fetching tag', {
      tagSlug,
      locale,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return {
      notFound: true,
    };
  }
};
const TagPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ tag }) => {
  const { t } = useTranslation('common');
  
  const filters = {
    tags: tag.slug,
  };

  // Формируем canonical URL для страницы тега товара
  const baseUrl = 'https://sancan.ru';
  const canonicalUrl = `${baseUrl}/products/tags/${tag.slug}`;

  return (
    <MarketplacePageShell>
      <TitleSeo title={tag.name} canonical={canonicalUrl} />
      <MarketplacePageHeader title={`#${tag.name}`} subtitle="Товары по тегу" />
      <div className="pt-4">
        <DynamicProductGrid limit={45} filters={filters} showLoadMore className="px-0 pt-0" />
      </div>
    </MarketplacePageShell>
  );
};

TagPage.getLayout = function getLayout(page) {
  return <MarketplaceLayout>{page}</MarketplaceLayout>;
};
export default TagPage;
