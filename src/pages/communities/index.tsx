import { TitleSeo } from '@/components/seo/title-seo';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale!, ['common'])) },
  revalidate: 60,
});

const CommunitiesPage: NextPageWithLayout = () => (
  <>
    <TitleSeo title="Сообщества — SANCAN" />
    <main className="web2-discovery-surface py-8">
      <div className="web2-state-panel">
        <p className="web2-eyebrow">SANCAN / COMMUNITIES</p>
        <h1>Сообщества</h1>
        <p>Тематические ленты Places появятся здесь после подключения текущего social API. Мы не показываем вымышленные данные.</p>
        <Link href="/?topic=interior" className="web2-state-action">Смотреть Places по темам</Link>
      </div>
    </main>
  </>
);

CommunitiesPage.getLayout = (page) => <MarketplaceLayout>{page}</MarketplaceLayout>;
export default CommunitiesPage;
