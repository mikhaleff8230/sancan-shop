import { useRouter } from 'next/router';
import cn from 'classnames';
import { ChevronLeft } from '@/components/icons/chevron-left';
import { ChevronRight } from '@/components/icons/chevron-right';
import { useScrollableSlider } from '@/lib/hooks/use-scrollable-slider';
import { useCategories } from '@/data/category';
import { useTranslation } from 'next-i18next';

function CategoryItem({
  categoryName,
  isActive,
  onClick,
}: {
  categoryName: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-medium outline-none transition-colors',
        {
          'border-brand bg-brand text-white shadow-sm hover:bg-brand-dark':
            isActive,
          'border-ozon-border bg-white text-ozon-text hover:border-brand hover:text-brand':
            !isActive,
        }
      )}
    >
      {categoryName}
    </button>
  );
}

export default function CategoryFilter({
  defaultActivePath = '/',
}: {
  defaultActivePath?: string;
}) {
  const router = useRouter();
  const { categories } = useCategories({
    limit: 100,
  });
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider(defaultActivePath);
  function handleClick(categorySlug: string) {
    router.push({
      pathname: router.pathname,
      ...(categorySlug !== defaultActivePath && {
        query: {
          category: categorySlug,
        },
      }),
    });
  }
  function handleFree() {
    router.push({
      pathname: router.pathname,
      query: {
        price: '0,0',
      },
    });
  }
  const { t } = useTranslation('common');
  return (
    <div className="app-category-filter-bar sancan-ozon-container flex min-h-[72px] w-full overflow-hidden py-4">
      <button
        title={t('text-prev')}
        ref={sliderPrevBtn}
        onClick={() => scrollToTheLeft()}
        className="invisible absolute top-1/2 left-2 z-[1] -mt-3 flex h-8 w-8 items-center justify-start rounded-full bg-white text-ozon-text opacity-0 shadow hover:text-brand"
      >
        <ChevronLeft className="h-[18px] w-[18px]" />
      </button>
      <div className="-mb-4 flex items-start overflow-hidden">
        <div
          className="-mb-7 flex w-full gap-2 overflow-x-auto scroll-smooth pb-7"
          ref={sliderEl}
        >
          <CategoryItem
            categoryName={t('text-category-all')}
            isActive={defaultActivePath === router.asPath}
            onClick={() => handleClick(defaultActivePath)}
          />
          {/*<CategoryItem
            categoryName={t('text-free')}
            isActive={Boolean(router.query.price)}
            onClick={handleFree}
          />*/}
          {categories
            .filter((category) => category.slug.toLowerCase() !== 'free')
            .map((category) => (
              <CategoryItem
                key={category.id}
                categoryName={category.name}
                isActive={category.slug === router.query.category}
                onClick={() => handleClick(category.slug)}
              />
            ))}
        </div>
      </div>
      <button
        title={t('text-next')}
        ref={sliderNextBtn}
        onClick={() => scrollToTheRight()}
        className="invisible absolute top-1/2 right-2 z-[1] -mt-3 flex h-8 w-8 items-center justify-end rounded-full bg-white text-ozon-text opacity-0 shadow hover:text-brand"
      >
        <ChevronRight className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
