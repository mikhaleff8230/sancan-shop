import CreatePlacePage from '@/components/places/CreatePlacePage';
import { TitleSeo } from '@/components/seo/title-seo';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale!, ['common'])) },
});

const CreatePlaceRoute: NextPageWithLayout = () => (
  <>
    <TitleSeo title="Создание Place — SANCAN" description="Создайте новый Place в SANCAN." />
    <CreatePlacePage />
  </>
);

CreatePlaceRoute.getLayout = (page) => <MarketplaceLayout>{page}</MarketplaceLayout>;
export default CreatePlaceRoute;
