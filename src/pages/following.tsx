import { TitleSeo } from '@/components/seo/title-seo';
import { useMe } from '@/data/user';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale!, ['common'])) },
  revalidate: 60,
});

const FollowingPage: NextPageWithLayout = () => {
  const { isAuthorized } = useMe();

  return (
    <>
      <TitleSeo title="Подписки — SANCAN" />
      <main className="web2-discovery-surface py-8">
        <div className="web2-state-panel">
          <p className="web2-eyebrow">SANCAN / FOLLOWING</p>
          <h1>Подписки</h1>
          <p>
            {isAuthorized
              ? 'Здесь появятся Places профилей, на которые вы подписаны. Лента будет включена после подключения social identity.'
              : 'Войдите, чтобы собрать персональную ленту авторов.'}
          </p>
          <Link href="/" className="web2-state-action">Перейти к открытиям</Link>
        </div>
      </main>
    </>
  );
};

FollowingPage.getLayout = (page) => <MarketplaceLayout>{page}</MarketplaceLayout>;
export default FollowingPage;
