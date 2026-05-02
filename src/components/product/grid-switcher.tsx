import { atom, useAtom } from 'jotai';
import Button from '@/components/ui/button';
import { CompactGridIcon } from '@/components/icons/compact-grid-icon';
import { NormalGridIcon } from '@/components/icons/normal-grid-icon';

const gridCompactViewAtom = atom(true);
const viewModeAtom = atom<'grid' | 'list' | 'map'>('grid');

export function useGridSwitcher() {
  const [isGridCompact, setIsGridCompact] = useAtom(gridCompactViewAtom);
  return {
    isGridCompact,
    setIsGridCompact,
  };
}

export function useViewMode() {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  return {
    viewMode,
    setViewMode,
  };
}

export function useMapView() {
  const { viewMode, setViewMode } = useViewMode();
  const isMapView = viewMode === 'map';
  const toggleMap = () => setViewMode(isMapView ? 'grid' : 'map');
  
  return { isMapView, toggleMap, viewMode };
}

/**
 * Простой toggle в стиле "чекбокс + текст"
 * Когда включен (Карта) — ползунок залит акцентным цветом (violet/purple)
 * Без эмодзи, минималистично и чисто
 */
export function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode();
  const isMap = viewMode === 'map';

  const toggle = () => {
    setViewMode(isMap ? 'grid' : 'map');
  };

  return (
    <button
      onClick={toggle}
      className={`
        group relative flex h-9 items-center gap-3 rounded-2xl border px-5 text-sm font-medium 
        transition-all duration-200 shadow-sm hover:shadow active:scale-[0.985]
        ${isMap 
          ? 'bg-white dark:bg-dark-100 border-violet-300 dark:border-violet-500 text-dark-900 dark:text-white' 
          : 'bg-light-100 dark:bg-dark-300 border-light-200 dark:border-dark-400 text-dark-500 dark:text-light-400 hover:text-dark-700 dark:hover:text-light-200'
        }
      `}
      aria-label={isMap ? "Переключить на список товаров" : "Переключить на карту"}
    >
      {/* Текст */}
      <span className="font-semibold tracking-tight">
        {isMap ? 'Карта' : 'Список'}
      </span>

      {/* Ползунок в стиле чекбокса/тумблера */}
      <div className={`
        relative h-5 w-9 rounded-full border transition-colors duration-200
        ${isMap 
          ? 'bg-violet-600 border-violet-600' 
          : 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500'
        }
      `}>
        <div className={`
          absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200
          ${isMap ? 'translate-x-4' : 'translate-x-0.5'}
        `} />
      </div>
    </button>
  );
}

export default function GridSwitcher() {
  const { isGridCompact, setIsGridCompact } = useGridSwitcher();
  return (
    <Button
      onClick={() => setIsGridCompact(!isGridCompact)}
      variant="icon"
      aria-label="Layout"
      className="hidden 2xl:flex 2xl:w-5"
    >
      {isGridCompact ? (
        <CompactGridIcon className="h-[18px] w-[18px]" />
      ) : (
        <NormalGridIcon className="h-[16px] w-[16px]" />
      )}
    </Button>
  );
}

