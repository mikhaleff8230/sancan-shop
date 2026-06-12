import { useRouter } from 'next/router';
import cn from 'classnames';
import { ChevronLeft } from '@/components/icons/chevron-left';
import { ChevronRight } from '@/components/icons/chevron-right';
import { useScrollableSlider } from '@/lib/hooks/use-scrollable-slider';
import { useTranslation } from 'next-i18next';
import type { Category } from '@/types';

interface SubcategoryItemProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

function SubcategoryItem({ category, isActive, onClick }: SubcategoryItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-medium outline-none transition-colors',
        isActive ? 'sancan-ozon-pill-active' : 'sancan-ozon-pill'
      )}
    >
      {category.name}
    </button>
  );
}

interface SubcategoryFilterProps {
  subcategories: Category[];
  currentCategorySlug?: string;
}

export default function SubcategoryFilter({
  subcategories,
  currentCategorySlug,
}: SubcategoryFilterProps) {
  const router = useRouter();
  const { t } = useTranslation('common');

  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  function handleClick(categorySlug: string) {
    router.push(`/categories/${categorySlug}`);
  }

  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  return (
    <div className="sancan-ozon-filter-bar">
      <div className="sancan-ozon-container relative flex min-h-[56px] items-center py-3">
        <button
          title={t('text-prev')}
          ref={sliderPrevBtn}
          onClick={() => scrollToTheLeft()}
          className="invisible absolute left-0 top-1/2 z-[1] -mt-3 flex h-6 w-6 items-center justify-start rounded-full text-ozon-text opacity-0 hover:text-brand"
        >
          <ChevronLeft className="h-[18px] w-[18px]" />
        </button>

        <div className="flex w-full min-w-0 items-center">
          <div
            className="flex w-full max-w-full min-w-0 gap-2 overflow-x-auto scroll-smooth pb-1 scrollbar-hide"
            ref={sliderEl}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {subcategories.map((subcategory) => (
              <SubcategoryItem
                key={subcategory.id}
                category={subcategory}
                isActive={subcategory.slug === currentCategorySlug}
                onClick={() => handleClick(subcategory.slug)}
              />
            ))}
          </div>
        </div>

        <button
          title={t('text-next')}
          ref={sliderNextBtn}
          onClick={() => scrollToTheRight()}
          className="invisible absolute right-0 top-1/2 z-[1] -mt-3 flex h-6 w-6 items-center justify-end rounded-full text-ozon-text opacity-0 hover:text-brand"
        >
          <ChevronRight className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
