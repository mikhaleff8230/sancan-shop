import Masonry from 'react-masonry-css';
import Link from 'next/link';
import PlaceCard from '@/components/place/place-card';
import ProductCard from '@/components/product/card';
import { usePlacesFeed } from '@/feeds/places/usePlacesFeed';
import { FEED_TYPES } from '@/feeds/places/feeds.config';
import { useDynamicProducts } from '@/data/product-dynamic';
import { InfiniteScroll } from '@/components/places/Pagination/InfiniteScroll';

type MixedItem =
  | { kind: 'place'; key: string; data: any }
  | { kind: 'product'; key: string; data: any }
  | { kind: 'banner'; key: string };

const columns = {
  default: 7,
  1900: 6,
  1550: 5,
  1200: 4,
  900: 3,
  640: 2,
};

export default function MixedDiscoveryFeed() {
  const { places, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } = usePlacesFeed({
    type: FEED_TYPES.MAIN,
    params: { limit: 36 },
  });
  const { products, isLoading: productsLoading } = useDynamicProducts({
    limit: 6,
    orderBy: 'orders_count',
    sortedBy: 'desc',
  });

  if (error) {
    return <div className="py-14 text-center text-slate-500">Не удалось загрузить ленту</div>;
  }

  if (isLoading && !places.length) {
    return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 15 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-xl bg-slate-100" />)}</div>;
  }

  const items: MixedItem[] = places.map((place: any) => ({ kind: 'place', key: `place-${place.id}`, data: place }));
  items.splice(Math.min(2, items.length), 0, { kind: 'banner', key: 'editorial-banner' });

  if (!productsLoading) {
    products.slice(0, 5).forEach((product: any, index: number) => {
      const target = Math.min(6 + index * 4, items.length);
      items.splice(target, 0, { kind: 'product', key: `product-${product.id}`, data: product });
    });
  }

  return (
    <InfiniteScroll hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage}>
      <>
        <Masonry breakpointCols={columns} className="-ml-3 flex w-auto md:-ml-4" columnClassName="flex flex-col gap-4 pl-3 md:pl-4">
          {items.map((item) => {
            if (item.kind === 'place') return <div key={item.key} className="break-inside-avoid"><PlaceCard place={item.data} /></div>;
            if (item.kind === 'product') return <div key={item.key} className="web2-mixed-product break-inside-avoid"><ProductCard product={item.data} /></div>;
            return (
              <Link key={item.key} href="/communities" className="web2-mixed-banner break-inside-avoid">
                <span className="web2-mixed-banner-kicker">SANCAN</span>
                <strong>Больше<br />чем вещи</strong>
                <p>Люди. Идеи. Предметы.<br />Вдохновение каждый день.</p>
                <i aria-hidden="true">→</i>
              </Link>
            );
          })}
        </Masonry>
        {isFetchingNextPage ? <div className="h-24 opacity-0" /> : null}
      </>
    </InfiniteScroll>
  );
}
