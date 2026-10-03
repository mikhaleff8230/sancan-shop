import PlacesFeed from '@/components/places/PlacesFeed';
import { TitleSeo } from '@/components/seo/title-seo';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';

const topics = [
  { label: 'Все', slug: '', href: '/' },
  { label: 'Искусство', slug: 'art', href: '/community/art' },
  { label: 'Интерьер', slug: 'interior', href: '/community/interior' },
  { label: 'Fashion', slug: 'fashion', href: '/community/fashion' },
  { label: 'Handmade', slug: 'handmade', href: '/community/handmade' },
  { label: 'Design', slug: 'design', href: '/community/design' },
  { label: 'Архитектура', slug: 'architecture', href: '/community/architecture' },
  { label: 'Фото', slug: 'photography', href: '/community/photography' },
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
              href={topic.href}
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
