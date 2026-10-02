import type { Product } from '@/types';
import cn from 'classnames';
import { motion } from 'framer-motion';
import Image from '@/components/ui/image';
import AnchorLink from '@/components/ui/links/anchor-link';
import routes from '@/config/routes';
import usePrice from '@/lib/hooks/use-price';
import placeholder from '@/assets/images/placeholders/product.svg';
import { useViewMode } from '@/components/product/grid-switcher';
import { fadeInBottomWithScaleX } from '@/lib/framer-motion/fade-in-bottom';
import { isFree } from '@/lib/is-free';
import { useTranslation } from 'next-i18next';
import { ExternalIcon } from '@/components/icons/external-icon';
import { HeartOutlineIcon } from '@/components/icons/heart-outline';
import { HeartFillIcon } from '@/components/icons/heart-fill';
import { useToggleWishlist, useInWishlist } from '@/data/wishlist';
import { useMe } from '@/data/user';
import { useModalAction } from '@/components/modal-views/context';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getOrderedProductMedia } from '@/lib/product-media';
import AddToCart from '@/components/cart/add-to-cart';
import { ShoppingCart, Star } from 'lucide-react';

export default function Card({ product }: { product: Product }) {
  const { name, slug, shop, is_external, has_video_as_cover, cover_video, id, url } = product ?? {};
  const router = useRouter();
  const { isAuthorized } = useMe();
  const { toggleWishlist } = useToggleWishlist(id?.toString() || '');
  const { inWishlist } = useInWishlist({
    enabled: isAuthorized && !!id,
    product_id: id?.toString() || '',
  });
  const { openModal } = useModalAction();
  const { viewMode } = useViewMode();
  const { price, basePrice } = usePrice({
    amount: product.sale_price ? product.sale_price : product.price,
    baseAmount: product.price,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [shopLogoFailed, setShopLogoFailed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseMovedRef = useRef(false);
  const lastMouseXRef = useRef<number | null>(null);
  const mouseDownXRef = useRef<number | null>(null);
  const mouseDownYRef = useRef<number | null>(null);
  
  // Состояния для плавного свайпа на мобильных
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState(0);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation('common');
  const isFreeItem = isFree(product?.sale_price ?? product?.price);
  const hasDiscount = Boolean(product?.sale_price && product?.price && product.sale_price < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)
    : 0;
  const productMarkers = [
    product?.type?.name,
    ...(product?.categories || []).map((category) => category.name),
    ...(product?.tags || []).map((tag) => tag.name),
  ].filter(Boolean).join(' ').toLowerCase();
  const isHandmade = /handmade|ручн|авторск/.test(productMarkers);
  const rating = Number(product?.ratings || 0);
  const reviewsCount = Number(product?.total_reviews || 0);
  
  const orderedMedia = getOrderedProductMedia(product);
  const resolvedCoverVideo = cover_video || product.videos?.[0] || null;
  const hasVideoCover = Boolean(
    (has_video_as_cover ?? product.video_as_cover) && resolvedCoverVideo
  );
  // В гриде отдельно загруженное главное фото всегда остаётся первым.
  // Остальные media (включая видео) сохраняют заданный продавцом порядок.
  const primaryImageMedia = orderedMedia.find((item) => {
    if (item.type !== 'image' || !product.image) return false;
    if (item.data === product.image) return true;
    if (item.data?.id && product.image?.id) {
      return String(item.data.id) === String(product.image.id);
    }
    const itemSource = item.data?.thumbnail || item.data?.url || item.data?.original;
    const primarySource =
      product.image?.thumbnail || product.image?.url || product.image?.original;
    return Boolean(itemSource && primarySource && itemSource === primarySource);
  });
  const cardMedia = !hasVideoCover && primaryImageMedia
    ? [
        primaryImageMedia,
        ...orderedMedia.filter((item) => item.key !== primaryImageMedia.key),
      ]
    : orderedMedia;
  const displayImages = cardMedia
    .filter((item) => item.type === 'image')
    .map((item) => item.data);
  
  // Определяем, показывать ли видео вместо изображения
  // Добавляем отладочную информацию
  if (process.env.NODE_ENV === 'development') {
    console.log('Card - video debug:', {
      product_id: product?.id,
      product_name: product?.name,
      has_video_as_cover,
      cover_video,
      videos: product?.videos,
      videos_count: product?.videos?.length || 0,
    });
  }
  
  // На десктопе каждая зона карточки соответствует элементу общей
  // media-ленты. Видео не должно выпадать из последовательности между фото.
  const activeMedia = cardMedia[currentMediaIndex] || cardMedia[0];
  const hoverVideo = activeMedia?.type === 'video'
    ? activeMedia.data
    : hasVideoCover && currentMediaIndex === 0
      ? resolvedCoverVideo
      : null;
  const shouldShowVideo = Boolean(hoverVideo && !videoFailed && isHovered);
  const posterUrl =
    hoverVideo && !posterFailed
      ? hoverVideo.poster_url || hoverVideo.thumbnail_url
      : null;
  const previewUrl =
    hoverVideo
      ? hoverVideo.preview_url || hoverVideo.video_url || hoverVideo.url
      : null;

  useEffect(() => {
    setVideoFailed(false);
    setPosterFailed(false);
    setImageFailed(false);
    setShopLogoFailed(false);
  }, [id, previewUrl, hoverVideo?.poster_url, hoverVideo?.thumbnail_url]);

  const safeImageSource = (source: any) => imageFailed ? placeholder : (source || placeholder);
  if (process.env.NODE_ENV === 'development' && has_video_as_cover) {
    console.log('Card - video URLs:', {
      shouldShowVideo,
      posterUrl,
      previewUrl,
      isHovered,
      cover_video_id: cover_video?.id,
    });
  }
  
  const hasMultipleImages = displayImages.length > 1;
  const hasMultipleMedia = cardMedia.length > 1;

  // Управление воспроизведением видео при наведении (3 секунды)
  useEffect(() => {
    if (videoRef.current && shouldShowVideo && previewUrl) {
      if (isHovered) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          // Игнорируем ошибки автоплея (браузер может блокировать)
        });
        
        // Останавливаем видео после 3 секунд
        const timeout = setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
        }, 3000);
        
        return () => clearTimeout(timeout);
      } else {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }
    }
  }, [isHovered, shouldShowVideo, previewUrl]);

  // Сброс индекса при уходе мыши
  useEffect(() => {
    if (!isHovered) {
      setCurrentImageIndex(0);
      setCurrentMediaIndex(0);
    }
  }, [isHovered]);

  // Проверка, мобильное ли это устройство
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(typeof window !== 'undefined' && window.innerWidth < 640);
    };
    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Обработчики для плавного свайпа на мобильных
  const handleTouchStart = (e: React.TouchEvent) => {
    if (displayImages.length <= 1 || !isMobileDevice) return;
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
    setDragOffset(0);
    setIsHorizontalSwipe(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || displayImages.length <= 1 || !isMobileDevice) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - dragStart.x;
    const diffY = touch.clientY - dragStart.y;
    
    // Определяем, горизонтальный ли это свайп
    if (!isHorizontalSwipe && Math.abs(diffX) > 10) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        setIsHorizontalSwipe(true);
      }
    }
    
    // Если это горизонтальный свайп, предотвращаем скролл страницы
    if (isHorizontalSwipe || Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault();
      
      // Ограничиваем свайп в пределах разумного
      const containerWidth = imageContainerRef.current?.clientWidth || 300;
      const limitedDiff = Math.max(-containerWidth, Math.min(containerWidth, diffX));
      setDragOffset(limitedDiff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || displayImages.length <= 1 || !isMobileDevice) {
      setIsDragging(false);
      setDragOffset(0);
      setIsHorizontalSwipe(false);
      return;
    }

    // Если это был горизонтальный свайп, применяем snap
    if (isHorizontalSwipe) {
      const containerWidth = imageContainerRef.current?.clientWidth || 300;
      const threshold = containerWidth * 0.3; // 30% от ширины для snap
      const shouldSnap = Math.abs(dragOffset) > threshold;

      if (shouldSnap) {
        // Определяем направление свайпа (бесконечное пролистывание по кругу)
        if (dragOffset > 0) {
          // Свайп вправо - предыдущее фото
          setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
        } else {
          // Свайп влево - следующее фото
          setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
        }
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    setIsHorizontalSwipe(false);
  };

  // Обработка движения мыши для смены изображений
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !hasMultipleMedia) {
      return;
    }
    
    // Отмечаем, что мышь двигалась (только если движение значительное)
    const currentX = e.clientX;
    if (lastMouseXRef.current !== null && Math.abs(currentX - lastMouseXRef.current) > 10) {
      mouseMovedRef.current = true;
    }
    lastMouseXRef.current = currentX;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    
    // Делим карточку на зоны по количеству всех media, включая видео.
    const newIndex = Math.floor(percentage * cardMedia.length);
    const clampedIndex = Math.max(0, Math.min(newIndex, cardMedia.length - 1));

    if (clampedIndex !== currentMediaIndex) {
      setCurrentMediaIndex(clampedIndex);
    }
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    mouseMovedRef.current = false;
    lastMouseXRef.current = null;
    mouseDownXRef.current = null;
    mouseDownYRef.current = null;
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentMediaIndex(0);
    mouseMovedRef.current = false;
    lastMouseXRef.current = null;
    mouseDownXRef.current = null;
    mouseDownYRef.current = null;
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseDownXRef.current = e.clientX;
    mouseDownYRef.current = e.clientY;
    mouseMovedRef.current = false;
  };
  
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Проверяем, было ли значительное движение мыши с момента нажатия
    if (mouseDownXRef.current !== null && mouseDownYRef.current !== null) {
      const deltaX = Math.abs(e.clientX - mouseDownXRef.current);
      const deltaY = Math.abs(e.clientY - mouseDownYRef.current);
      const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Если движение было небольшое (меньше 10px), считаем это кликом
      // ВАЖНО: Используем url из API (уже содержит полный путь с кодом) или формируем из slug
      const productUrl = url || ((product as any)?.canonical_url?.replace(/^https?:\/\/[^\/]+/, '') || slug);
      router.push(routes.productUrl(productUrl, id));
    } else if (!mouseMovedRef.current) {
      // Если нет данных о нажатии, но мышь не двигалась - тоже клик
      const productUrl = url || ((product as any)?.canonical_url?.replace(/^https?:\/\/[^\/]+/, '') || slug);
      router.push(routes.productUrl(productUrl, id));
    }
  };

  const isListView = viewMode === 'list';

  return (
    <motion.div 
      variants={fadeInBottomWithScaleX()} 
      title={name}
      className={cn(
        'web2-product-card h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(23,33,43,0.10)]',
        isListView && 'flex w-full items-center gap-4'
      )}
    >
      <div
        ref={cardRef}
        className={cn(
          "group relative flex flex-col justify-center overflow-hidden rounded-xl cursor-pointer bg-[#f3f5f9]",
          isListView ? "w-32 h-32 flex-shrink-0" : "aspect-[3/4] w-full"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onClick={handleCardClick}
      >
        {is_external ? (
          <div className="absolute left-2 top-2 z-30 rounded-lg bg-white/95 px-2 py-2 text-ozon-text shadow-sm">
            <ExternalIcon className="h-5 w-5" />
          </div>
        ) : null}
        {!is_external && (hasDiscount || isHandmade) ? (
          <span className={cn('web2-product-badge', hasDiscount ? 'web2-product-badge-sale' : 'web2-product-badge-neutral')}>
            {hasDiscount ? `-${discountPercent}%` : 'Ручная работа'}
          </span>
        ) : null}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isAuthorized) {
              openModal('LOGIN_VIEW');
              return;
            }
            toggleWishlist({ product_id: id?.toString() || '' });
          }}
          className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/88 text-slate-600 shadow-sm backdrop-blur transition-colors hover:text-[#7b3dff]"
          title={inWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          {inWishlist ? (
            <HeartFillIcon className="h-4 w-4 text-ozon-pink" />
          ) : (
            <HeartOutlineIcon className="h-4 w-4" />
          )}
        </button>
        
        {/* Видео превью при наведении (3 секунды) */}
        {shouldShowVideo && previewUrl ? (
          <video
            ref={videoRef}
            src={previewUrl}
            poster={posterUrl || undefined}
            className="absolute inset-0 z-20 h-full w-full rounded-xl object-cover"
            muted
            loop={false}
            playsInline
            preload="metadata"
            onError={(e) => {
              console.error('Video playback error:', e);
              console.error('Video src:', previewUrl);
              setVideoFailed(true);
            }}
            onLoadStart={() => {
              if (process.env.NODE_ENV === 'development') {
                console.log('Video loading started:', previewUrl);
              }
            }}
          />
        ) : hasVideoCover && posterUrl ? (
          /* Показываем постер видео, когда не наведено */
          <div className="relative w-full h-full">
            <Image
              alt={name}
              fill
              quality={85}
              src={safeImageSource(posterUrl)}
              className="pointer-events-none rounded-xl bg-[#f3f5f9] object-cover"
              sizes="(max-width: 768px) 100vw,
                  (max-width: 1200px) 50vw,
                  33vw"
              priority
              onError={() => {
                setPosterFailed(true);
                setImageFailed(true);
              }}
            />
          </div>
        ) : activeMedia?.type === 'video' && videoFailed ? (
          /* Ошибка превью не должна оставлять пустой слайд между фото. */
          <div className="relative w-full h-full">
            <Image
              alt={name}
              fill
              quality={85}
              src={safeImageSource(
                posterUrl ||
                primaryImageMedia?.data?.thumbnail ||
                primaryImageMedia?.data?.original ||
                placeholder
              )}
              className="pointer-events-none rounded-xl bg-[#f3f5f9] object-cover"
              sizes="(max-width: 768px) 100vw,
                  (max-width: 1200px) 50vw,
                  33vw"
              onError={() => setImageFailed(true)}
            />
          </div>
        ) : hasVideoCover && currentMediaIndex === 0 && primaryImageMedia ? (
          /* Если постер видео недоступен, карточка не должна оставаться пустой. */
          <div className="relative w-full h-full">
            <Image
              alt={name}
              fill
              quality={85}
              src={safeImageSource(
                primaryImageMedia.data?.thumbnail ||
                primaryImageMedia.data?.original ||
                placeholder
              )}
              className="pointer-events-none rounded-xl bg-[#f3f5f9] object-cover"
              sizes="(max-width: 768px) 100vw,
                  (max-width: 1200px) 50vw,
                  33vw"
              priority
              onError={() => setImageFailed(true)}
            />
          </div>
        ) : (
          /* Слайдер изображений */
          <div 
            ref={imageContainerRef}
            className="relative w-full h-full overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              touchAction: isMobileDevice ? 'pan-y pinch-zoom' : 'auto'
            }}
          >
            {displayImages.length > 0 ? (
              <>
                {/* На мобильных - горизонтальный контейнер с свайпом */}
                {isMobileDevice ? (
                  <div 
                    className="relative w-full h-full flex"
                    style={{
                      transform: `translateX(calc(${-currentImageIndex * 100}% + ${dragOffset}px))`,
                      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      willChange: isDragging ? 'transform' : 'auto',
                    }}
                  >
                    {displayImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative flex-shrink-0 w-full h-full"
                        style={{
                          minWidth: '100%',
                          maxWidth: '100%',
                        }}
                      >
                        <Image
                          alt={`${name} - ${index + 1}`}
                          fill
                          quality={90}
                          src={safeImageSource(img?.thumbnail || img?.original)}
                          className="pointer-events-none absolute inset-0 rounded-xl bg-[#f3f5f9] object-cover"
                          sizes="(max-width: 768px) 100vw,
                              (max-width: 1200px) 50vw,
                              33vw"
                          loading={index === 0 ? "eager" : "lazy"}
                          priority={index === 0}
                          onError={() => setImageFailed(true)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* На десктопе индекс совпадает с общей media-лентой. */
                  cardMedia.map((media, index) =>
                    media.type === 'image' ? (
                      <Image
                        key={media.key}
                        alt={`${name} - ${index + 1}`}
                        fill
                        quality={90}
                        src={safeImageSource(media.data?.thumbnail || media.data?.original)}
                        className={cn(
                          "absolute inset-0 rounded-xl bg-[#f3f5f9] object-cover transition-opacity duration-300 pointer-events-none",
                          index === currentMediaIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                        )}
                        sizes="(max-width: 768px) 100vw,
                            (max-width: 1200px) 50vw,
                            33vw"
                        loading={index === 0 ? "eager" : "lazy"}
                        priority={index === 0}
                        onError={() => setImageFailed(true)}
                      />
                    ) : null
                  )
                )}
              </>
            ) : (
              <Image
                alt={name}
                fill
                quality={85}
                src={placeholder}
                className="pointer-events-none rounded-xl bg-[#f3f5f9] object-cover"
                sizes="(max-width: 768px) 100vw,
                    (max-width: 1200px) 50vw,
                    33vw"
              />
            )}
          </div>
        )}
        
        {/* Точки тоже отражают общий порядок фото и видео. */}
        {hasMultipleMedia &&
          (!hasVideoCover || posterFailed) &&
          !isHovered && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 flex gap-1.5 pointer-events-auto">
            {cardMedia.map((media, index) => (
              <button
                key={media.key}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentMediaIndex(index);
                }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  index === currentMediaIndex
                    ? "bg-white scale-125 shadow-md"
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Перейти к медиа ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className={cn(
        "flex min-w-0 flex-col",
        isListView ? "flex-1 py-1" : "px-2.5 pb-2.5 pt-2"
      )}>
        <div className="flex min-h-[24px] items-baseline gap-2">
          <span className={cn('web2-product-price', hasDiscount && 'web2-product-price-sale')}>
            {isFreeItem ? t('text-free') : price}
          </span>
          {hasDiscount && basePrice && basePrice !== price ? (
            <del className="text-[11px] font-medium text-slate-400">{basePrice}</del>
          ) : null}
        </div>
        <h3
          title={name}
          className="mt-0.5 line-clamp-2 min-h-[34px] text-[13px] font-medium leading-[17px] text-[#172033]"
        >
          <AnchorLink
            href={routes.productUrl(url || ((product as any)?.canonical_url?.replace(/^https?:\/\/[^\/]+/, '') || slug), id)}
            className="transition-colors hover:text-[#7b3dff]"
          >
            {name}
          </AnchorLink>
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-slate-100">
              <Image
                alt={shop?.name || ''}
                quality={90}
                fill
                src={shopLogoFailed ? placeholder : (shop?.logo?.thumbnail ?? placeholder)}
                className="object-cover"
                sizes="20px"
                onError={() => setShopLogoFailed(true)}
              />
            </div>
            <AnchorLink
              href={routes.shopUrl(shop?.slug)}
              className="truncate text-[11px] font-medium text-slate-500 transition-colors hover:text-[#7b3dff]"
            >
              {shop?.name || 'SANCAN'}
            </AnchorLink>
          </div>
          {rating > 0 ? (
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-slate-500">
              <Star className="h-3.5 w-3.5 fill-[#ff9f1c] text-[#ff9f1c]" />
              {rating.toFixed(1)}{reviewsCount > 0 ? ` (${reviewsCount})` : ''}
            </span>
          ) : null}
          {!isFreeItem && !is_external ? (
            <div onClick={(event) => event.stopPropagation()}>
              <AddToCart
                item={product}
                withPrice={false}
                ariaLabel={`Добавить «${name}» в корзину`}
                className="web2-card-cart-button"
              >
                <ShoppingCart className="h-4 w-4" />
              </AddToCart>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
