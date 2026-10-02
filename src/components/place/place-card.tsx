import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Place } from '@/types';
import { motion } from 'framer-motion';
import { fadeInBottomWithScaleX } from '@/lib/motion/fade-in-bottom';
import cn from 'classnames';
import { HeartIcon } from '@/components/icons/heart-icon';
import { BookmarkSaveIcon } from '@/components/icons/bookmark-save-icon';
import { CheckMark } from '@/components/icons/checkmark';
import placeholder from '@/assets/images/placeholders/product.svg';
import VideoTimeDisplay from '@/components/places/video-time-display';
import { extractMediaUrls } from '@/data/utils/media-utils';
import { useTogglePlaceLike, useIsPlaceLiked } from '@/data/place-like';
import { useTogglePlaceWishlist, useInPlaceWishlist } from '@/data/place-wishlist';
import { useMe } from '@/data/user';
import { useModalAction } from '@/components/modal-views/context';

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthorized } = useMe();

  const {
    id,
    title,
    images,
    videos,
    likes_count = 0
  } = place;

  // Функционал лайка
  const { liked, isLoading: likeLoading } = useIsPlaceLiked(id, isAuthorized);
  const { togglePlaceLike, isLoading: toggling, data: toggleData } = useTogglePlaceLike(id);
  const [localLiked, setLocalLiked] = useState(liked);
  const [localLikes, setLocalLikes] = useState(likes_count);

  // Функционал избранного
  const { toggleWishlist, isLoading: wishlistToggling } = useTogglePlaceWishlist(id);
  const { inWishlist, isLoading: wishlistChecking } = useInPlaceWishlist({
    enabled: isAuthorized && !!id,
    place_id: id,
  });
  const [localInWishlist, setLocalInWishlist] = useState(inWishlist);
  const { openModal } = useModalAction();

  useEffect(() => {
    setLocalLiked(liked);
  }, [liked]);

  useEffect(() => {
    setLocalLikes(likes_count);
  }, [likes_count]);

  useEffect(() => {
    if (toggleData) {
      setLocalLiked(toggleData.liked);
      setLocalLikes(toggleData.likes_count);
    }
  }, [toggleData]);

  useEffect(() => {
    setLocalInWishlist(inWishlist);
  }, [inWishlist]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthorized) {
      return;
    }
    // Оптимистичное обновление UI
    setLocalLiked((prev: boolean) => !prev);
    setLocalLikes((prev: number) => prev + (localLiked ? -1 : 1));
    togglePlaceLike();
  };

  const handleSaveToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthorized) {
      openModal('LOGIN_VIEW');
      return;
    }
    // Оптимистичное обновление UI
    setLocalInWishlist((prev: boolean) => !prev);
    toggleWishlist({ place_id: id });
  };

  const hasImages = Array.isArray(images) && images.length > 0;
  const hasVideo = Array.isArray(videos) && videos.length > 0;

  // Безопасное извлечение URL изображений и видео
  const safeImages = extractMediaUrls(images);
  const safeVideos = extractMediaUrls(videos);

  const mainImage = safeImages.length > 0 ? safeImages[0] : null;
  const mainVideo = safeVideos.length > 0 ? safeVideos[0] : null;

  // Извлекаем данные видео (preview, poster, url)
  const videoData = hasVideo && videos[0] ? videos[0] : null;
  const videoPreview = videoData?.preview || videoData?.preview_url || null; // 3-секундное превью для автопроигрывания
  const videoPoster = videoData?.poster || videoData?.poster_url || null; // Постер (первый кадр) для обложки
  const videoUrl = videoData?.url || mainVideo || null; // Полное видео (fallback)

  // Используем постер видео как обложку, если есть видео и нет изображений
  // Или используем изображение, если есть
  const displayImage = mainImage || videoPoster || placeholder;
  const safeTitle = title || t('Без названия');

  // Обработка наведения мыши для автопроигрывания видео (3 секунды)
  const handleMouseEnter = () => {
    // Используем превью видео (3 секунды) вместо полного видео для быстрой загрузки
    if (hasVideo && videoRef.current && !isVideoPlaying && videoPreview) {
      setIsVideoPlaying(true);
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);

      // Автоматическая остановка через 3 секунды (длина превью)
      autoPlayTimerRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsVideoPlaying(false);
        }
      }, 3000);
    }
  };

  const handleMouseLeave = () => {
    if (hasVideo && videoRef.current && isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);

      // Очищаем таймер
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }
  };

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, []);

  const handleCardClick = () => {
    router.push(`/place/${id}`);
  };

  const authorName = place.user?.name || 'SANCAN';
  const authorAvatar = typeof place.user?.avatar === 'string'
    ? place.user.avatar
    : (place.user?.avatar as any)?.thumbnail || (place.user?.avatar as any)?.original;
  const caption = place.description || place.title;
  const linkedProduct = place.products?.[0];

  useEffect(() => {
    setMediaFailed(false);
    setAvatarFailed(false);
  }, [id, displayImage, authorAvatar]);

  return (
    <motion.div
      variants={fadeInBottomWithScaleX()}
      className="place-card group cursor-pointer break-inside-avoid"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
        <div className="relative overflow-hidden rounded-xl bg-light-500 dark:bg-dark-400">
        {/* Main Image/Video */}
        <div className="relative w-full">
          {/* Статическое изображение или видео превью */}
          {mediaFailed ? (
            <div className="flex aspect-[4/5] w-full items-end bg-gradient-to-br from-[#f8f5ff] via-[#f5f1f7] to-[#eee7df] p-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">SANCAN</span>
            </div>
          ) : hasImages ? (
            <div className="relative w-full overflow-hidden">
              <img
                src={displayImage}
                alt={safeTitle}
                className={cn(
                  "w-full h-auto object-cover transition-all duration-300 group-hover:scale-105",
                  isVideoPlaying && hasVideo ? "opacity-0" : "opacity-100"
                )}
                loading="lazy"
                onError={() => setMediaFailed(true)}
              />
            </div>
          ) : hasVideo && videoPoster ? (
            /* Показываем постер видео (первый кадр) как обложку, когда нет изображений */
            <img
              src={videoPoster}
              alt={safeTitle}
              className={cn(
                "w-full h-auto object-cover transition-all duration-300 group-hover:scale-105",
                isVideoPlaying ? "opacity-0" : "opacity-100"
              )}
              loading="lazy"
              onError={() => setMediaFailed(true)}
            />
          ) : (
            /* Fallback к placeholder, если нет ни изображений, ни видео */
            <div className="relative w-full overflow-hidden">
              <img
                src={typeof placeholder === 'string' ? placeholder : (placeholder as any)?.src || ''}
                alt={safeTitle}
                className="w-full h-auto object-cover transition-all duration-300 group-hover:scale-105"
                loading="lazy"
                onError={() => setMediaFailed(true)}
              />
            </div>
          )}

          {/* Видео превью (3 секунды) для автопроигрывания при наведении */}
          {hasVideo && videoPreview && (
            <video
              ref={videoRef}
              src={videoPreview}
              muted
              playsInline
              preload="none"
              className={cn(
                "absolute top-0 left-0 w-full h-full object-cover transition-all duration-300",
                isVideoPlaying ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              )}
              onEnded={() => setIsVideoPlaying(false)}
              style={{ height: '100%' }}
            >
              <source src={videoPreview} type="video/mp4" />
            </video>
          )}

          {/* Video duration indicator - показываем в нижнем левом углу */}
          {hasVideo && !isVideoPlaying && videoUrl && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium z-[1]">
              <VideoTimeDisplay videoUrl={videoUrl} />
            </div>
          )}

          {/* Likes count indicator */}
          <div className="absolute right-3 top-3 z-[1] flex flex-col gap-2 opacity-100 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100">
            <div className="rounded-full bg-black/60 px-2 py-1 text-xs text-white flex items-center gap-1">
              <HeartIcon
                className={`w-3 h-3 ${localLiked ? 'fill-white' : 'fill-none'} stroke-white`}
                strokeWidth={localLiked ? 0 : 1.5}
              />
              <span>{localLikes}</span>
            </div>

            {/* Save to wishlist button */}
            <button
              onClick={handleSaveToWishlist}
              className={cn(
                "rounded-full px-2 py-1 text-xs flex items-center justify-center transition-all duration-200",
                localInWishlist
                  ? "bg-white"
                  : "bg-black/60 text-white hover:bg-black/80",
                (wishlistToggling || wishlistChecking) && "pointer-events-none opacity-60"
              )}
              aria-label={localInWishlist ? 'Удалить из избранного' : 'Сохранить в избранное'}
            >
              {localInWishlist ? (
                <CheckMark className="w-4 h-4 text-black" />
              ) : (
                <BookmarkSaveIcon
                  className="w-4 h-4 text-white"
                  fill="none"
                  strokeWidth={1.5}
                />
              )}
            </button>
          </div>

          {/* Like button - показывается только при наведении */}
          <div
            onClick={handleLike}
            className={cn(
              "absolute bottom-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 z-[1] cursor-pointer",
              (toggling || likeLoading) && "pointer-events-none opacity-60"
            )}
          >
            <button
              className="rounded-full bg-white/80 p-2 hover:bg-white transition-colors border-0 shadow-sm"
              aria-label={localLiked ? t('text-unlike') : t('text-like')}
            >
              <HeartIcon
                className={cn(
                  "w-5 h-5 transition-colors",
                  localLiked ? "text-red-500 fill-red-500" : "text-dark dark:text-light fill-none"
                )}
                strokeWidth={localLiked ? 0 : 1.5}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="px-0.5 pb-1 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {authorAvatar && !avatarFailed ? (
              <img
                src={authorAvatar}
                alt=""
                className="h-7 w-7 shrink-0 rounded-full object-cover"
                loading="lazy"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                {authorName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="truncate text-xs font-semibold text-slate-800">{authorName}</span>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
            <HeartIcon className="h-3.5 w-3.5 fill-none" strokeWidth={1.5} />
            {localLikes}
          </span>
        </div>

        {caption && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.45] text-slate-700">
            {caption}
          </p>
        )}

        {linkedProduct && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/element/${linkedProduct.slug}`);
            }}
            className="mt-2 flex w-full items-center justify-between gap-2 rounded-lg border border-violet-100 bg-violet-50/70 px-2.5 py-2 text-left"
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-violet-600">Связанный товар</span>
              <span className="block truncate text-xs font-medium text-slate-900">{linkedProduct.name}</span>
            </span>
            <span aria-hidden="true" className="text-violet-600">→</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
