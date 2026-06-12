import type { GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Seo from '@/components/seo/seo';
import SecondLifeOrderCheckout from '@/components/second-life/order-checkout';
import type { NextPageWithLayout } from '@/types';

const SecondLifeOrderPage: NextPageWithLayout = () => {
  return (
    <>
      <Seo
        title="SANCAN Second Life Order"
        description="Страница безопасного сопровождения C2C сделки SANCAN."
        url="/second-life/order/demo"
      />
      <SecondLifeOrderCheckout />
    </>
  );
};

SecondLifeOrderPage.getLayout = function getLayout(page: React.ReactNode) {
  return page;
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
    revalidate: 60,
  };
};

export default SecondLifeOrderPage;
