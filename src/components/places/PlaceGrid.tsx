import React from 'react';
import Masonry from 'react-masonry-css';
import PlaceCard from '../place/place-card';
import { Place } from '@/domain/place/place.types';

interface PlaceGridProps {
  places: Place[];
  onLastItemRef?: React.RefObject<HTMLDivElement>;
  className?: string;
  onPlaceClick?: (place: Place) => void;
}

export function PlaceGrid({
  places,
  onLastItemRef,
  className = '',
  onPlaceClick,
}: PlaceGridProps) {
  if (!places || places.length === 0) {
    return <div className="flex justify-center py-12 text-gray-500">Плейсы не найдены</div>;
  }

  const breakpointColumnsObj = {
    default: 7,
    1900: 6,
    1550: 5,
    1200: 4,
    900: 3,
    640: 2,
  };

  return (
    <div className={`w-full ${className}`}>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="-ml-3 flex w-auto md:-ml-4"
        columnClassName="flex flex-col gap-4 pl-3 md:pl-4"
      >
        {places.map((place, index) => {
          const isLastItem = index === places.length - 1;
          return (
            <div
              key={place.id}
              className="break-inside-avoid"
              ref={isLastItem ? onLastItemRef : null}
              onClick={() => onPlaceClick?.(place)}
            >
              <PlaceCard place={place} />
            </div>
          );
        })}
      </Masonry>
    </div>
  );
}
