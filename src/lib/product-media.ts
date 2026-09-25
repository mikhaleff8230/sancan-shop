import type { Product, ProductVideo } from '@/types';

export type ProductMediaItem =
  | { key: string; type: 'image'; data: any }
  | { key: string; type: 'video'; data: ProductVideo };

const imageSource = (image: any) =>
  image?.thumbnail || image?.url || image?.original || '';

const imageKey = (image: any) => `image:${image?.id || imageSource(image)}`;
const videoKey = (video: ProductVideo) => `video:${video.id}`;

export function getOrderedProductMedia(product: Product): ProductMediaItem[] {
  const images: ProductMediaItem[] = [];
  const seenImages = new Set<string>();

  [product.image, ...(Array.isArray(product.gallery) ? product.gallery : [])].forEach(
    (image) => {
      if (!imageSource(image)) return;
      const key = imageKey(image);
      if (seenImages.has(key)) return;
      seenImages.add(key);
      images.push({ key, type: 'image', data: image });
    }
  );

  const videos: ProductMediaItem[] = (Array.isArray(product.videos)
    ? product.videos
    : []
  ).map((video) => ({ key: videoKey(video), type: 'video', data: video }));

  const usesVideoCover = Boolean(
    product.has_video_as_cover ?? product.video_as_cover
  );
  const coverVideo = usesVideoCover
    ? product.cover_video || product.videos?.[0]
    : undefined;
  const coverKey = coverVideo ? videoKey(coverVideo) : null;
  const sortableItems = [...images, ...videos].filter(
    (item) => item.key !== coverKey
  );
  const byKey = new Map(sortableItems.map((item) => [item.key, item]));
  const ordered = (Array.isArray(product.media_order) ? product.media_order : [])
    .map((key) => byKey.get(key))
    .filter((item): item is ProductMediaItem => Boolean(item));
  const present = new Set(ordered.map((item) => item.key));

  sortableItems.forEach((item) => {
    if (!present.has(item.key)) ordered.push(item);
  });

  return coverVideo
    ? [{ key: videoKey(coverVideo), type: 'video', data: coverVideo }, ...ordered]
    : ordered;
}
