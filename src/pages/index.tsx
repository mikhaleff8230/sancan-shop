import MixedDiscoveryFeed from '@/components/places/MixedDiscoveryFeed';
import PlaceTopicBar from '@/components/places/PlaceTopicBar';
import { TitleSeo } from '@/components/seo/title-seo';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common'])),
  },
  revalidate: 60,
});

const Home: NextPageWithLayout = () => (
  <>
    <TitleSeo
      title="SANCAN — люди, идеи, предметы"
      description="Discovery-лента SANCAN: плейсы, идеи, баннеры и популярные товары."
    />
    <main className="web2-discovery-surface pb-16">
      <PlaceTopicBar allHref="/" />
      <section aria-label="Лента SANCAN: плейсы, товары и идеи">
        <MixedDiscoveryFeed />
      </section>
    </main>
  </>
);

Home.getLayout = (page) => <MarketplaceLayout>{page}</MarketplaceLayout>;

export default Home;
