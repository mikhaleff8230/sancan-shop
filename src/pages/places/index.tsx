import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import type { NextPageWithLayout } from '@/types';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import PlacesFeed from '@/components/places/PlacesFeed';
import PlaceTopicBar from '@/components/places/PlaceTopicBar';
import { TitleSeo } from '@/components/seo/title-seo';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common'])),
  },
  revalidate: 60,
});

const PlacesPage: NextPageWithLayout = () => (
  <>
    <TitleSeo title="Плейсы — SANCAN" description="Люди, идеи, интерьеры, искусство и вдохновение SANCAN." />
    <main className="web2-discovery-surface pb-16">
      <PlaceTopicBar />
      <section aria-label="Лента плейсов">
        <PlacesFeed limit={36} />
      </section>
    </main>
  </>
);

PlacesPage.getLayout = (page) => <MarketplaceLayout>{page}</MarketplaceLayout>;

export default PlacesPage;
