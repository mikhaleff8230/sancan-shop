import type { Product } from '@/types';
import cn from 'classnames';
import { motion } from 'framer-motion';
import Image from '@/components/ui/image';
import AnchorLink from '@/components/ui/links/anchor-link';
import routes from '@/config/routes';
import usePrice from '@/lib/hooks/use-price';
import placeholder from '@/assets/images/placeholders/product.svg';
import { useGridSwitcher, useViewMode } from '@/components/product/grid-switcher';
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

export default function Card({ product }: { product: Product }) {
  const { name, slug, image, gallery, shop, is_external, has_video_as_cover, cover_video, id, url } = product ?? {};
  const router = useRouter();
  const { isAuthorized } = useMe();
  const { toggleWishlist } = useToggleWishlist(id?.toString() || '');
  const { inWishlist } = useInWishlist({
    enabled: isAuthorized && !!id,
    product_id: id?.toString() || '',
  });
  const { openModal } = useModalAction();
  const { isGridCompact } = useGridSwitcher();
  const { viewMode } = useViewMode();
  const { price, basePrice } = usePrice({
    amount: product.sale_price ? product.sale_price : product.price,
    baseAmount: product.price,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
  
  // Собираем все изображения: главное + галерея
  const allImages: Array<{ thumbnail?: string; original?: string }> = [];
  if (image) {
    allImages.push(image);
  }
  if (gallery && Array.isArray(gallery)) {
    allImages.push(...gallery);
  }
  
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
  
  const shouldShowVideo = has_video_as_cover && cover_video && isHovered;
  const posterUrl = has_video_as_cover && cover_video ? (cover_video.poster_url || cover_video.thumbnail_url) : null;
  const previewUrl = has_video_as_cover && cover_video ? cover_video.preview_url : null;
  
  if (process.env.NODE_ENV === 'development' && has_video_as_cover) {
    console.log('Card - video URLs:', {
      shouldShowVideo,
      posterUrl,
      previewUrl,
      isHovered,
      cover_video_id: cover_video?.id,
    });
  }
  
  // Если есть видео-обложка, НЕ добавляем постер в слайдер, так как он будет показан отдельно
  // Постер будет показан как основное изображение, когда не наведено
  const displayImages = allImages;
  
  const hasMultipleImages = displayImages.length > 1;
  const currentImage = displayImages[currentImageIndex] || displayImages[0];
  const defaultImageSrc = currentImage?.thumbnail || currentImage?.original || placeholder;

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
    // ВАЖНО: Проверяем только наличие карточки и множественных изображений
    if (!cardRef.current) {
      return;
    }
    
    if (!hasMultipleImages) {
      return;
    }
    
    // Если показывается видео, не меняем слайды (видео имеет приоритет)
    if (shouldShowVideo) {
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
    
    // Определяем индекс на основе позиции мыши
    // Делим карточку на зоны по количеству изображений
    const newIndex = Math.floor(percentage * displayImages.length);
    const clampedIndex = Math.max(0, Math.min(newIndex, displayImages.length - 1));
    
    if (clampedIndex !== currentImageIndex) {
      setCurrentImageIndex(clampedIndex);
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

  const handleViewButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // ВАЖНО: Используем url из API (уже содержит полный путь с кодом) или формируем из slug
    const productUrl = url || ((product as any)?.canonical_url?.replace(/^https?:\/\/[^\/]+/, '') || slug);
    router.push(routes.productUrl(productUrl, id));
  };

  const isListView = viewMode === 'list';

  return (
    <motion.div 
      variants={fadeInBottomWithScaleX()} 
      title={name}
      whileHover={{ scale: isListView ? 1 : 1.02 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'group app-card-ui app-card-ui-hover rounded-app-md p-grid-2',
        isListView ? 'flex w-full items-center gap-4' : 'flex flex-col'
      )}
    >
      <div
        ref={cardRef}
        className={cn(
          "relative flex cursor-pointer flex-col justify-center overflow-hidden rounded-2xl",
          isListView ? "h-32 w-32 flex-shrink-0" : "aspect-square w-full"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onClick={handleCardClick}
      >
        {is_external ? (
          <div className="absolute top-2 right-2 z-10 rounded-md bg-dark-300/70 px-2 py-2 text-white">
            <ExternalIcon className="h-5 w-5" />
          </div>
        ) : null}
        
        {/* Видео превью при наведении (3 секунды) */}
        {shouldShowVideo && previewUrl ? (
          <video
            ref={videoRef}
            src={previewUrl}
            poster={posterUrl || undefined}
            className="absolute inset-0 z-20 h-full w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            muted
            loop={false}
            playsInline
            preload="metadata"
            onError={(e) => {
              console.error('Video playback error:', e);
              console.error('Video src:', previewUrl);
            }}
            onLoadStart={() => {
              if (process.env.NODE_ENV === 'development') {
                console.log('Video loading started:', previewUrl);
              }
            }}
          />
        ) : has_video_as_cover && cover_video && posterUrl ? (
          /* Показываем постер видео, когда не наведено */
          <div className="relative w-full h-full">
            <Image
              alt={name}
              fill
              quality={85}
              src={posterUrl}
              className="pointer-events-none rounded-2xl bg-light-500 object-cover transition-transform duration-300 group-hover:scale-[1.03] dark:bg-dark-400"
              sizes="(max-width: 768px) 100vw,
                  (max-width: 1200px) 50vw,
                  33vw"
              priority
            />
            {/* Слайдер изображений поверх постера (если есть другие изображения) */}
            {displayImages.length > 0 && (
              <>
                {displayImages.map((img, index) => (
                  <Image
                    key={index}
                    alt={`${name} - ${index + 1}`}
                    fill
                    quality={85}
                    src={img?.original || img?.thumbnail || placeholder}
                    className={cn(
                      "pointer-events-none absolute inset-0 rounded-2xl bg-light-500 object-cover transition-all duration-300 group-hover:scale-[1.03] dark:bg-dark-400",
                      index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                    sizes="(max-width: 768px) 100vw,
                        (max-width: 1200px) 50vw,
                        33vw"
                    loading={index === 0 ? "eager" : "lazy"}
                    priority={index === 0}
                  />
                ))}
              </>
            )}
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
                          src={img?.thumbnail || img?.original || placeholder}
                          className="pointer-events-none absolute inset-0 rounded-2xl bg-light-500 object-cover transition-transform duration-300 group-hover:scale-[1.03] dark:bg-dark-400"
                          sizes="(max-width: 768px) 100vw,
                              (max-width: 1200px) 50vw,
                              33vw"
                          loading={index === 0 ? "eager" : "lazy"}
                          priority={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* На десктопе - обычное отображение с opacity */
                  displayImages.map((img, index) => (
                    <Image
                      key={index}
                      alt={`${name} - ${index + 1}`}
                      fill
                      quality={90}
                      src={img?.thumbnail || img?.original || placeholder}
                      className={cn(
                        "pointer-events-none absolute inset-0 rounded-2xl bg-light-500 object-cover transition-all duration-300 group-hover:scale-[1.03] dark:bg-dark-400",
                        index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                      )}
                      sizes="(max-width: 768px) 100vw,
                          (max-width: 1200px) 50vw,
                          33vw"
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                    />
                  ))
                )}
              </>
            ) : (
              <Image
                alt={name}
                fill
                quality={85}
                src={placeholder}
                className="pointer-events-none rounded-2xl bg-light-500 object-cover transition-transform duration-300 group-hover:scale-[1.03] dark:bg-dark-400"
                sizes="(max-width: 768px) 100vw,
                    (max-width: 1200px) 50vw,
                    33vw"
              />
            )}
          </div>
        )}
        
        {/* Кнопка "Перейти к товару" - появляется при наведении */}
        {isHovered && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
            <button
              onClick={handleViewButtonClick}
              className={cn(
                "flex items-center justify-between gap-2 whitespace-nowrap rounded-xl border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200",
                "bg-app-surface/75 backdrop-blur-sm hover:bg-app-card/90",
                "shadow-lg hover:shadow-app-glow"
              )}
            >
              <span>Buy</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthorized) {
                    openModal('LOGIN_VIEW');
                    return;
                  }
                  toggleWishlist({ product_id: id?.toString() || '' });
                }}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                title={inWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
              >
                {inWishlist ? (
                  <HeartFillIcon 
                    className="flex-shrink-0" 
                    style={{ width: '12px', height: '12px' }}
                  />
                ) : (
                  <HeartOutlineIcon 
                    className="flex-shrink-0" 
                    style={{ width: '12px', height: '12px' }}
                  />
                )}
              </button>
            </button>
          </div>
        )}
        
        {/* Индикаторы (точки) внизу карточки - показываем только если есть несколько изображений и нет наведения (чтобы не мешать кнопке) */}
        {((hasMultipleImages && !shouldShowVideo) || (has_video_as_cover && cover_video && displayImages.length > 0 && !shouldShowVideo)) && !isHovered && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 flex gap-1.5 pointer-events-auto">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  index === currentImageIndex
                    ? "bg-white scale-125 shadow-md"
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Перейти к изображению ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className={cn(
        "flex w-full flex-col",
        isListView ? "flex-1" : "pt-3.5"
      )}>
        <h3
          title={name}
          className={cn(
            "line-clamp-2 text-base font-semibold leading-snug text-light",
            isListView ? "mb-1" : "mb-1"
          )}
        >
          <div className="relative overflow-hidden">
            <AnchorLink 
              href={routes.productUrl(url || ((product as any)?.canonical_url?.replace(/^https?:\/\/[^\/]+/, '') || slug), id)}
              className="block truncate pr-6 text-[15px] font-semibold leading-6 text-light transition-colors hover:text-brand"
            >
              {name}
            </AnchorLink>
            <div 
              className="pointer-events-none absolute bottom-0 right-0 top-0 w-12 bg-gradient-to-r from-transparent via-transparent to-app-card"
            />
          </div>
        </h3>
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 flex-shrink-0 overflow-hidden">
            <Image
              alt={shop?.name}
              quality={100}
              fill
              src={shop?.logo?.thumbnail ?? placeholder}
              className="rounded-full border border-white/20 bg-light-500 object-cover dark:bg-dark-400"
              sizes="32px"
            />
          </div>
          <AnchorLink
            href={routes.shopUrl(shop?.slug)}
            className="line-clamp-1 block text-xs font-medium text-app-muted transition-colors hover:text-light"
          >
            {shop?.name}
          </AnchorLink>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.01em] text-light sm:text-base">
            {isFreeItem ? t('text-free') : price}
          </span>
          {!isFreeItem && basePrice && basePrice !== price && (
            <>
              <del className="text-xs text-app-muted line-through">
                {basePrice}
              </del>
              <span className="text-xs font-medium text-[#ff5e7a]">
                -{Math.round(((parseFloat(basePrice.replace(/[^\d.]/g, '')) - parseFloat(price.replace(/[^\d.]/g, ''))) / parseFloat(basePrice.replace(/[^\d.]/g, ''))) * 100)}%
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
