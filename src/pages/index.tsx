import PlacesFeed from '@/components/places/PlacesFeed';
import { TitleSeo } from '@/components/seo/title-seo';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';

const topics = [
  { label: 'Все', slug: '' },
  { label: 'Искусство', slug: 'art' },
  { label: 'Интерьер', slug: 'interior' },
  { label: 'Fashion', slug: 'fashion' },
  { label: 'Handmade', slug: 'handmade' },
  { label: 'Design', slug: 'design' },
  { label: 'Кино', slug: 'cinema' },
  { label: 'Фото', slug: 'photo' },
];

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common'])),
  },
  revalidate: 60,
});

const Home: NextPageWithLayout = () => {
  const router = useRouter();
  const activeTopic = typeof router.query.topic === 'string' ? router.query.topic : '';

  return (
    <>
      <TitleSeo
        title="SANCAN — люди, идеи, предметы"
        description="Визуальная лента SANCAN: интерьер, дизайн, искусство, мода и handmade."
      />

      <main className="web2-discovery-surface pb-16">
        <nav className="web2-topic-bar" aria-label="Темы">
          {topics.map((topic) => (
            <Link
              key={topic.label}
              href={topic.slug ? `/?topic=${topic.slug}` : '/'}
              scroll={false}
              className={activeTopic === topic.slug ? 'web2-topic-chip web2-topic-chip-active' : 'web2-topic-chip'}
            >
              {topic.label}
            </Link>
          ))}
        </nav>

        <section className="web2-editorial-banner" aria-label="SANCAN Web 2.0">
          <div>
            <p className="web2-eyebrow">SANCAN / DISCOVERY</p>
            <h1>Больше чем вещи</h1>
            <p>Люди. Идеи. Предметы. Вдохновение каждый день.</p>
          </div>
          <Link href="/communities" className="web2-banner-action">
            Исследовать <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section aria-label="Лента Places">
          <PlacesFeed limit={30} filters={activeTopic ? { hashtag_slug: activeTopic } : {}} />
        </section>
      </main>
    </>
  );
};

Home.getLayout = function getLayout(page) {
  return <MarketplaceLayout>{page}</MarketplaceLayout>;
};

export default Home;
