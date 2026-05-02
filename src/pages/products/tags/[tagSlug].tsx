import DynamicProductGrid from '@/components/product/dynamic-grid';
import { TitleSeo } from '@/components/seo/title-seo';
import client from '@/data/client';
import Layout from '@/layouts/_layout';
import type { NextPageWithLayout, Tag } from '@/types';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

type PageProps = {
  tag: Tag;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
  locale,
}) => {
  const { tagSlug } = params!;
  const language =
    locale ?? process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ?? 'ru';

  try {
    const tag = await client.tags.get({
      slug: tagSlug as string,
      language,
    });
    return {
      props: {
        tag,
        ...(await serverSideTranslations(locale ?? language, ['common'])),
      },
    };
  } catch {
    return { notFound: true };
  }
};

const TagPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ tag }) => {
  const filters = {
    tags: tag.slug,
  };

  const baseUrl = 'https://sancan.ru';
  const canonicalUrl = `${baseUrl}/products/tags/${tag.slug}`;

  return (
    <>
      <TitleSeo title={tag.name} canonical={canonicalUrl} />
      <div className="flex flex-col items-center justify-between gap-1.5 px-4 pt-5 pb-6 xs:flex-row md:px-6 md:pt-6 lg:px-7 3xl:px-8">
        <h2 className="font-medium capitalize text-dark-100 dark:text-light">
          #{tag.name}
        </h2>
      </div>
      <DynamicProductGrid
        limit={45}
        filters={filters}
        showLoadMore={true}
      />
    </>
  );
};

TagPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
export default TagPage;
