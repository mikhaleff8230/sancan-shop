import type {
  NextPageWithLayout,
  SettingsQueryOptions,
  Shop,
} from '@/types';
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from 'next';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import cn from 'classnames';
import client from '@/data/client';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import Image from '@/components/ui/image';
import { Tab } from '@/components/ui/tab';
import DynamicProductGrid from '@/components/product/dynamic-grid';
import { MapPinIcon } from '@/components/icons/map-pin-icon';
import { AtIcon } from '@/components/icons/at-icon';
import { getIcon } from '@/lib/get-icon';
import * as socialIcons from '@/components/icons/social';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import placeholder from '@/assets/images/placeholders/product.svg';
import { formatAddress } from '@/lib/format-address';
import FollowButton from '@/components/follow/follow-button';
import ChatButton from '@/components/chat/ChatButton';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

// Dynamic rendering - no static generation
type PageProps = {
  shop: Shop;
};

export const getServerSideProps: GetServerSideProps<
  PageProps
> = async ({ params, locale, res }) => {
  const { shopSlug } = params!;
  
  // Set cache headers for better performance
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  );
  
  const queryClient = new QueryClient();
  try {
    const shop = await client.shops.get(shopSlug as string);
    await Promise.all([
      queryClient.prefetchQuery(
        [API_ENDPOINTS.SETTINGS, { language: locale }],
        ({ queryKey }) =>
          client.settings.all(queryKey[1] as SettingsQueryOptions)
      ),
    ]);
    return {
      props: {
        shop,
        ...(await serverSideTranslations(locale!, ['common'])),
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

function AboutShop({ shop }: { shop: Shop }) {
  const {
    description,
    name,
    address,
    owner,
    orders_count,
    products_count,
    settings: { socials },
  } = shop;
  const { t } = useTranslation('common');
  return (
    <motion.div
      variants={fadeInBottom()}
      className="sancan-ozon-container grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="flex-shrink-0 md:w-6/12 lg:w-7/12 xl:w-5/12">
        <h2 className="mb-3 text-2xl font-bold text-ozon-text">
          {name}
        </h2>
        <p className="max-w-3xl leading-7 text-ozon-muted">{description}</p>
        <div className="space-y-3.5 pt-4 text-ozon-text md:pt-6 xl:pt-7">
          <address className="flex max-w-sm items-start not-italic leading-[1.8]">
            <span className="mt-[3px] w-7 shrink-0 text-ozon-muted">
              <MapPinIcon className="h-4 w-4" />
            </span>
            {formatAddress(address)}
          </address>
          <div className="flex items-center">
            <span className="w-7 shrink-0 text-ozon-muted">
              <AtIcon className="h-4 w-4" />
            </span>
            <a href={`mailto:${owner?.email}`} className="hover:text-brand">
              {owner?.email}
            </a>
          </div>
        </div>
      </div>
      <div className="sancan-ozon-card mt-7 flex-shrink-0 p-6 md:mt-0 lg:p-8">
        <div className="-mx-2 flex pb-6 lg:pb-7">
          <div className="flex flex-shrink-0 flex-col px-2 pr-10 text-13px capitalize text-ozon-muted lg:w-1/2 lg:pr-0">
            <span className="mb-0.5 text-2xl font-bold text-ozon-text">
              {orders_count}
            </span>
            {t('text-total-sales')}
          </div>
          <div className="flex flex-shrink-0 flex-col px-2 pr-10 text-13px capitalize text-ozon-muted xl:w-1/2 xl:pr-0">
            <span className="mb-0.5 text-2xl font-bold text-ozon-text">
              {products_count}
            </span>
            {t('text-products')}
          </div>
        </div>
        <div className="space-y-3 border-t border-ozon-border pt-5">
          {socials.map(({ icon, url }, idx) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center"
            >
              {getIcon({
                iconList: socialIcons,
                iconName: icon,
                className:
                  'w-3.5 h-3.5 text-dark-800 dark:text-light-900 shrink-0',
              })}
              <span className="transition-colors group-hover:text-dark ltr:pl-2 rtl:pr-2 dark:group-hover:text-light">
                {url.slice(12, -1).split('/').slice(0, 1)}
              </span>
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ShopProducts({ shopId }: { shopId: string }) {
  const filters = {
    shop_id: shopId,
  };

  return (
    <DynamicProductGrid
      limit={45}
      filters={filters}
      showLoadMore={true}
    />
  );
}

const ShopPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ shop }) => {
  const { name, logo, cover_image } = shop;
  const { t } = useTranslation('common');
  const router = useRouter();
  const shopSlug = router.query.shopSlug as string;
  return (
    <>
      <div className="sancan-ozon-container pt-5">
      <div className="shopBanner relative w-full overflow-hidden rounded-[24px]">
        <div className="absolute top-0 left-0 h-full w-full">
          <Image
            alt={name}
            fill
            className="object-cover"
            src={cover_image?.original ?? placeholder}
          />
        </div>
        <div className="relative z-10 h-full w-full bg-white/[0.88] px-4 pt-10 pb-16 text-center backdrop-blur-sm lg:px-8 lg:pt-14 lg:pb-20">
          <div className="relative mx-auto h-[88px] w-[88px] overflow-hidden rounded-3xl border border-ozon-border bg-white shadow-sm md:h-24 md:w-24">
            <Image
              alt={name}
              fill
              className="object-cover"
              quality={100}
              src={logo?.original ?? placeholder}
            />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-ozon-text">
            {name}
          </h1>
          <div className="mt-3.5 flex justify-center gap-3 md:mt-4 lg:mt-5">
            <FollowButton shop_id={shop.id} />
            <ChatButton shopId={shop.id} shopSlug={shopSlug} />
          </div>
        </div>
      </div>
      </div>
      <Tab.Group>
        <Tab.List className="sancan-ozon-container relative z-10 -mt-[34px] flex justify-center gap-2 text-13px">
          <Tab
            className={({ selected }) =>
              cn(
                'rounded-full border border-ozon-border bg-white px-5 py-2.5 font-bold text-ozon-text transition hover:border-ozon-blue hover:text-ozon-blue',
                {
                  '!border-ozon-blue !bg-ozon-blue !text-white':
                    selected,
                }
              )
            }
          >
            {t('text-products')}
          </Tab>
          <Tab
            className={({ selected }) =>
              cn(
                'rounded-full border border-ozon-border bg-white px-5 py-2.5 font-bold text-ozon-text transition hover:border-ozon-blue hover:text-ozon-blue',
                {
                  '!border-ozon-blue !bg-ozon-blue !text-white':
                    selected,
                }
              )
            }
          >
            {t('text-about')}
          </Tab>
        </Tab.List>
        <Tab.Panels className="h-full">
          <Tab.Panel className="sancan-ozon-container flex h-full py-6 focus:outline-none">
            <ShopProducts shopId={shop.id} />
          </Tab.Panel>
          <Tab.Panel className="focus:outline-none">
            <AboutShop shop={shop} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  );
};

ShopPage.getLayout = function getLayout(page) {
  return <MarketplaceLayout>{page}</MarketplaceLayout>;
};

export default ShopPage;
