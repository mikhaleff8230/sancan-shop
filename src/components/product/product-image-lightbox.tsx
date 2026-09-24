import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { ChevronLeft } from '@/components/icons/chevron-left';
import { ChevronRight } from '@/components/icons/chevron-right';
import { CloseIcon } from '@/components/icons/close-icon';
import type { Attachment } from '@/types';

interface ProductImageLightboxProps {
  images: Attachment[];
  startIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductImageLightbox({
  images,
  startIndex,
  isOpen,
  onClose
}: ProductImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isMounted, setIsMounted] = useState(false);
  const thumbsContainerRef = useRef<HTMLDivElement>(null);
  const swipeStartRef = useRef<number | null>(null);
  const swipeEndRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Обновляем индекс при изменении startIndex
  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  // Обработка клавиш
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Блокируем скролл body
  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index: number) => {
    setCurrentIndex(index);
  };

  const startSwipe = (clientX: number) => {
    swipeStartRef.current = clientX;
    swipeEndRef.current = null;
  };

  const moveSwipe = (clientX: number) => {
    if (swipeStartRef.current !== null) {
      swipeEndRef.current = clientX;
    }
  };

  const endSwipe = () => {
    const swipeStart = swipeStartRef.current;
    const swipeEnd = swipeEndRef.current;

    swipeStartRef.current = null;
    swipeEndRef.current = null;

    if (swipeStart === null || swipeEnd === null) return;
    
    const distance = swipeStart - swipeEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }

  };

  // Автоскролл к активной миниатюре
  useEffect(() => {
    if (thumbsContainerRef.current) {
      const activeThumb = thumbsContainerRef.current.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [currentIndex]);

  if (!isMounted || !isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const placeholder = '/placeholders/placeholder-450.svg';

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/90"
      style={{ zIndex: 2147483647 }}
      role="dialog"
      aria-modal="true"
      aria-label="Галерея изображений товара"
      onClick={onClose}
    >
      {/* Вертикальные миниатюры слева */}
      <div className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 lg:block" onClick={(event) => event.stopPropagation()}>
        <div
          ref={thumbsContainerRef}
          className="flex h-[600px] w-20 flex-col gap-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-light-400 dark:scrollbar-thumb-dark-400"
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                index === currentIndex
                  ? 'border-brand shadow-lg shadow-brand/30'
                  : 'border-white/30 hover:border-white/50'
              }`}
            >
              {image && (image?.thumbnail || image?.original) ? (
                <Image
                  alt={`${image?.alt || 'Product'} - превью ${index + 1}`}
                  fill
                  quality={100}
                  src={image?.thumbnail || image?.original}
                  className="object-cover"
                  onError={() => {
                    console.warn(`Failed to load lightbox thumbnail ${index + 1}`);
                  }}
                />
              ) : (
                <Image
                  alt={`Product - превью ${index + 1}`}
                  fill
                  quality={100}
                  src={placeholder}
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Основное изображение по центру */}
      <div className="relative flex h-full w-full items-center justify-center px-4 sm:px-16 lg:px-24" onClick={(event) => event.stopPropagation()}>
        <div
          className="relative h-full w-full max-w-4xl"
          style={{ touchAction: 'pan-y pinch-zoom' }}
          onTouchStart={(e) => startSwipe(e.targetTouches[0].clientX)}
          onTouchMove={(e) => moveSwipe(e.targetTouches[0].clientX)}
          onTouchEnd={endSwipe}
          onTouchCancel={endSwipe}
          onMouseDown={(e) => startSwipe(e.clientX)}
          onMouseMove={(e) => moveSwipe(e.clientX)}
          onMouseUp={endSwipe}
          onMouseLeave={() => {
            if (swipeStartRef.current !== null) endSwipe();
          }}
        >
          {currentImage && (currentImage?.original || currentImage?.thumbnail) ? (
            <Image
              alt={currentImage?.alt || 'Product image'}
              fill
              quality={100}
              src={currentImage?.original || currentImage?.thumbnail}
              className="object-contain"
              draggable={false}
              onError={() => {
                console.warn(`Failed to load lightbox image at index ${currentIndex}`);
              }}
            />
          ) : (
            <Image
              alt="Product image"
              fill
              quality={100}
              src={placeholder}
              className="object-contain"
              draggable={false}
            />
          )}
        </div>

        {/* Навигационные стрелки */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30 lg:left-28"
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30"
              aria-label="Следующее изображение"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Счетчик изображений */}
        {images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Кнопка закрытия */}
      <button
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/25 p-3 text-white shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/40 sm:right-6 sm:top-6"
        aria-label="Закрыть галерею"
      >
        <CloseIcon className="h-6 w-6" />
      </button>
    </div>,
    document.body
  );
}
