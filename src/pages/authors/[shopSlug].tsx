import type {
  NextPageWithLayout,
  SettingsQueryOptions,
  Shop,
} from '@/types';
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from 'next';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import cn from 'classnames';
import client from '@/data/client';
import Layout from '@/layouts/_layout';
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

type PageProps = {
  shop: Shop;
};

const DEFAULT_AUTHOR_SSG_MAX_PAGES = 80;
const AUTHOR_PAGE_NOT_FOUND_REVALIDATE_SECONDS = 30;

function resolveAuthorPageApiBaseUrl(): string {
  const raw =
    process.env.REST_API_INTERNAL_URL ||
    process.env.REST_API_URL ||
    process.env.NEXT_PUBLIC_REST_API_ENDPOINT ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://api.sancan.ru';
  return String(raw).trim().replace(/\/+$/, '');
}

async function fetchShopForAuthorPage(
  shopSlug: string,
  language: string
): Promise<Shop | null> {
  try {
    return await client.shops.get(shopSlug, language);
  } catch {
    // fallback below
  }

  try {
    return await client.shops.get(shopSlug);
  } catch {
    // fallback below
  }

  const apiBase = resolveAuthorPageApiBaseUrl();
  const encodedSlug = encodeURIComponent(shopSlug);
  const encodedLang = encodeURIComponent(language);
  const urls = [
    `${apiBase}/shops/${encodedSlug}?language=${encodedLang}`,
    `${apiBase}/shops/${encodedSlug}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) continue;
      const shop = (await response.json()) as Shop;
      if (shop?.slug) return shop;
    } catch {
      // try next URL
    }
  }

  return null;
}

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const localeList =
    locales && locales.length > 0
      ? locales
      : [process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ?? 'ru'];

  const paths: { params: { shopSlug: string }; locale: string }[] = [];
  const maxPages = Math.min(
    500,
    Math.max(
      1,
      parseInt(
        process.env.NEXT_PUBLIC_AUTHOR_SSG_MAX_PAGES ||
          String(DEFAULT_AUTHOR_SSG_MAX_PAGES),
        10
      ) || DEFAULT_AUTHOR_SSG_MAX_PAGES
    )
  );

  try {
    for (let page = 1; page <= maxPages; page++) {
      const paginator = await client.shops.all({
        page,
        limit: 50,
        searchJoin: 'and',
        search: 'is_active:1',
      });
      const shops = paginator?.data ?? [];
      if (!shops.length) break;

      for (const shop of shops) {
        if (!shop?.slug) continue;
        for (const locale of localeList) {
          paths.push({ params: { shopSlug: shop.slug }, locale });
        }
      }

      if (page >= paginator.last_page) break;
    }
  } catch {
    // пустой paths + fallback: blocking — любой slug сгенерируется по первому запросу
  }

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<PageProps> = async ({
  params,
  locale,
}) => {
  const rawSlug = params?.shopSlug as string;
  const shopSlug = decodeURIComponent(rawSlug || '').trim();
  const language =
    locale ?? process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ?? 'ru';

  if (!shopSlug) {
    return {
      notFound: true,
      revalidate: AUTHOR_PAGE_NOT_FOUND_REVALIDATE_SECONDS,
    };
  }

  const queryClient = new QueryClient();

  const shop = await fetchShopForAuthorPage(shopSlug, language);
  if (!shop) {
    return {
      notFound: true,
      revalidate: AUTHOR_PAGE_NOT_FOUND_REVALIDATE_SECONDS,
    };
  }

  try {
    await queryClient.prefetchQuery(
      [API_ENDPOINTS.SETTINGS, { language }],
      ({ queryKey }) =>
        client.settings.all(queryKey[1] as SettingsQueryOptions)
    );
  } catch {
    // настройки не критичны для страницы селлера
  }

  return {
    props: {
      shop,
      ...(await serverSideTranslations(locale!, ['common'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
    revalidate: 60,
  };
};

function AboutShop({ shop }: { shop: Shop }) {
  const {
    description,
    name,
    address,
    owner,
    orders_count,
    products_count,
    settings,
  } = shop;
  const socials = settings?.socials ?? [];
  const { t } = useTranslation('common');
  return (
    <motion.div
      variants={fadeInBottom()}
      className="mx-auto flex max-w-[480px] flex-col justify-between md:max-w-[1000px] md:flex-row 2xl:max-w-[1280px]"
    >
      <div className="flex-shrink-0 md:w-6/12 lg:w-7/12 xl:w-5/12">
        <h2 className="mb-3 text-sm font-medium text-dark dark:text-light lg:text-15px">
          {name}
        </h2>
        <p className="leading-6">{description}</p>
        <div className="space-y-3.5 pt-4 text-dark/80 dark:text-light/80 md:pt-6 xl:pt-7">
          <address className="flex max-w-sm items-start not-italic leading-[1.8]">
            <span className="mt-[3px] w-7 shrink-0 text-dark-800 dark:text-light-900">
              <MapPinIcon className="h-4 w-4" />
            </span>
            {formatAddress(address)}
          </address>
          <div className="flex items-center">
            <span className="w-7 shrink-0 text-dark-800 dark:text-light-900">
              <AtIcon className="h-4 w-4" />
            </span>
            <a href={`mailto:${owner?.email}`} className="hover:text-brand">
              {owner?.email}
            </a>
          </div>
        </div>
      </div>
      <div className="mt-7 flex-shrink-0 rounded-md bg-light p-6 shadow-card dark:bg-dark-250 md:mt-0 md:w-72 lg:p-8">
        <div className="-mx-2 flex pb-6 lg:pb-7">
          <div className="flex flex-shrink-0 flex-col px-2 pr-10 text-13px capitalize text-dark-500 dark:text-light-900 lg:w-1/2 lg:pr-0">
            <span className="mb-0.5 text-2xl text-dark dark:text-light">
              {orders_count}
            </span>
            {t('text-total-sales')}
          </div>
          <div className="flex flex-shrink-0 flex-col px-2 pr-10 text-13px capitalize text-dark-500 dark:text-light-900 xl:w-1/2 xl:pr-0">
            <span className="mb-0.5 text-2xl text-dark dark:text-light">
              {products_count}
            </span>
            {t('text-products')}
          </div>
        </div>
        {socials.length > 0 && (
          <div className="space-y-3 border-t border-light-300 pt-5 dark:border-dark-500">
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
        )}
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
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ shop }) => {
  const { name, logo, cover_image } = shop;
  const { t } = useTranslation('common');
  const router = useRouter();
  const shopSlug = router.query.shopSlug as string;
  return (
    <>
      <div className="shopBanner relative w-full">
        <div className="absolute top-0 left-0 h-full w-full">
          <Image
            alt={name}
            fill
            className="object-cover"
            src={cover_image?.original ?? placeholder}
          />
        </div>
        <div className="relative z-10 h-full w-full bg-white/[0.85] px-4 pt-10 pb-16 text-center backdrop-blur-sm dark:bg-dark/[0.85] lg:px-8 lg:pt-14 lg:pb-20">
          <div className="relative mx-auto h-[75px] w-[75px] md:h-20 md:w-20 2xl:h-[90px] 2xl:w-[90px] 3xl:h-[100px] 3xl:w-[100px]">
            <Image
              alt={name}
              fill
              className="object-cover"
              quality={100}
              src={logo?.original ?? placeholder}
            />
          </div>
          <h1 className="mt-3 text-sm font-medium text-dark-100 dark:text-light lg:text-15px 2xl:mt-4">
            {name}
          </h1>
          <div className="mt-3.5 flex justify-center gap-3 md:mt-4 lg:mt-5">
            <FollowButton shop_id={shop.id} />
            <ChatButton shopId={shop.id} shopSlug={shopSlug} />
          </div>
        </div>
      </div>
      <Tab.Group>
        <Tab.List className="relative z-10 -mt-[34px] space-x-6 px-4 text-center text-13px rtl:space-x-reverse lg:space-x-8">
          <Tab
            className={({ selected }) =>
              cn(
                'relative pb-3.5 before:absolute before:left-0 before:bottom-0 before:h-0.5 before:bg-dark-400 before:transition-all before:duration-300 before:ease-in-out hover:text-dark-100 dark:before:bg-light-400 dark:hover:text-light',
                {
                  'font-semibold text-dark-100 before:w-full dark:text-light':
                    selected,
                  'text-dark-400 before:w-0 dark:text-light-800': !selected,
                }
              )
            }
          >
            {t('text-products')}
          </Tab>
          <Tab
            className={({ selected }) =>
              cn(
                'relative pb-3.5 before:absolute  before:left-0 before:bottom-0 before:h-0.5 before:bg-dark-400 before:transition-all before:duration-300 before:ease-in-out hover:text-dark-100 dark:before:bg-light-400 dark:hover:text-light',
                {
                  'font-semibold text-dark-100 before:w-full dark:text-light':
                    selected,
                  'text-dark-400 before:w-0 dark:text-light-800': !selected,
                }
              )
            }
          >
            {t('text-about')}
          </Tab>
        </Tab.List>
        <Tab.Panels className="h-full">
          <Tab.Panel className="flex h-full focus:outline-none lg:pt-3 xl:pt-4">
            <ShopProducts shopId={shop.id} />
          </Tab.Panel>
          <Tab.Panel className="px-4 py-6 focus:outline-none md:px-6 md:py-8 lg:py-10 lg:px-8">
            <AboutShop shop={shop} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  );
};

ShopPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ShopPage;
