import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import * as categoriesIcon from '@/components/icons/category';
import { getIcon } from '@/lib/get-icon';
import { useCategoriesForMenu } from '@/data/category';
import type { Category } from '@/types';
import { ChevronLeft } from '@/components/icons/chevron-left';
import { ChevronRight } from '@/components/icons/chevron-right';

// Маппинг иконок для категорий
const getCategoryIcon = (iconName?: string) => {
  const fallback = 'Sofa';
  const name = iconName && (categoriesIcon as any)[iconName] ? iconName : fallback;
  return (
    <span className="inline-flex items-center justify-center">
      {getIcon({ iconList: categoriesIcon as any, iconName: name, className: 'w-5 h-5 text-current' })}
    </span>
  );
};

// Функция для создания структуры меню из категорий
const createMenuStructure = (categories: Category[]) => {
  if (!Array.isArray(categories)) {
    console.warn('Categories is not an array:', categories);
    return [];
  }
  
  try {
    return categories.map((category, index) => {
      // Отладочный лог
      if (typeof category.slug !== 'string') {
        console.error('Category slug is not string:', {
          id: category.id,
          name: category.name,
          slug: category.slug,
          slugType: typeof category.slug,
          index
        });
      }
      
      const safeSlug = (value: any) => {
        if (typeof value === 'string' && value.trim() !== '') {
          return encodeURIComponent(value);
        }
        return `category-${category.id || index}`;
      };

      return {
        id: String(category.id || index),
        name: category.name || 'Категория',
        slug: safeSlug(category.slug),
        icon: category.icon || undefined,
        columns: createColumnsFromCategory(category),
      };
    });
  } catch (error) {
    console.error('Error creating menu structure:', error);
    return [];
  }
};

// Функция для создания колонок: заголовок = подкатегория 2-го уровня, список = 3-й уровень
const createColumnsFromCategory = (category: Category) => {
  try {
    const seconds = Array.isArray(category?.children) ? category.children : [];
    if (seconds.length === 0) {
      return [
        { sections: [] },
        { sections: [] },
        { sections: [] },
      ];
    }

  const itemsPerColumn = Math.ceil(seconds.length / 3) || 1;
  const colsSeconds = [
    seconds.slice(0, itemsPerColumn),
    seconds.slice(itemsPerColumn, itemsPerColumn * 2),
    seconds.slice(itemsPerColumn * 2),
  ];

  const columns = colsSeconds.map((secList) => ({
    sections: secList.map((sec) => {
      // Безопасная обработка slug для секций (2-го уровня)
      const sectionSafeSlug = (value: any) => {
        if (typeof value === 'string' && value.trim() !== '') {
          return encodeURIComponent(value);
        }
        return `category-${sec?.id || 'unknown'}`;
      };
      
      return {
        title: sec?.name || 'Категория',
        slug: sectionSafeSlug(sec?.slug), // Добавляем slug для секции
        items: Array.isArray(sec?.children)
          ? sec.children.map((c: any) => {
              // Безопасная обработка slug для дочерних категорий (3-го уровня)
              const itemSafeSlug = (value: any) => {
                if (typeof value === 'string' && value.trim() !== '') {
                  return encodeURIComponent(value);
                }
                return `category-${c?.id || 'unknown'}`;
              };
              
              return { 
                name: c?.name || 'Категория', 
                slug: itemSafeSlug(c?.slug)
              };
            })
          : [],
      };
    }),
  }));

  return columns;
  } catch (error) {
    console.error('Error creating columns from category:', error, category);
    return [
      { sections: [] },
      { sections: [] },
      { sections: [] },
    ];
  }
};

// Типы для навигации по уровням
type NavigationLevel = 'level1' | 'level2' | 'level3';

interface NavigationState {
  level: NavigationLevel;
  categoryId?: string;
  sectionTitle?: string;
  sectionSlug?: string;
}

export default function DropdownCategoriesMenu({ compact = false }: { compact?: boolean }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  /** Мобильное меню рендерится через createPortal в document.body — учитываем его в «клик снаружи». */
  const mobileMenuPortalRef = useRef<HTMLDivElement>(null);
  
  // Состояние для мобильной навигации по уровням
  const [mobileNav, setMobileNav] = useState<NavigationState>({ level: 'level1' });
  const [navHistory, setNavHistory] = useState<NavigationState[]>([]);
  
  // Получаем категории из API
  const { categories, isLoading, error } = useCategoriesForMenu();
  
  // ОТЛАДКА: логируем сырые данные от API
  
  // Проверяем на ошибки обработки данных
  if (error) {
    console.error('Categories API error:', error);
  }
  
  // Создаем структуру меню из полученных категорий
  const categoriesData = createMenuStructure(categories);
  
  // ОТЛАДКА: логируем обработанные данные

  const handleToggleMenu = () => {
    setIsOpen((prev) => !prev);
    if (isOpen) setActiveCategory(null);
  };

  const handleCloseMenu = () => {
    setIsOpen(false);
    setActiveCategory(null);
    // Сбрасываем мобильную навигацию
    setMobileNav({ level: 'level1' });
    setNavHistory([]);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setActiveCategory(null);
    // Сбрасываем мобильную навигацию
    setMobileNav({ level: 'level1' });
    setNavHistory([]);
  };

  // Функции для мобильной навигации
  const handleMobileCategoryClick = (categoryId: string) => {
    const category = categoriesData.find(cat => cat.id === categoryId);
    if (!category) return;
    
    // Проверяем, есть ли подкатегории
    const hasSubcategories = category.columns.some(col => 
      col.sections.some(section => section.items && section.items.length > 0)
    ) || category.columns.some(col => col.sections.length > 0);
    
    if (hasSubcategories) {
      // Переходим на уровень 2
      setNavHistory([{ level: 'level1' }]);
      setMobileNav({ level: 'level2', categoryId });
    } else {
      // Если нет подкатегорий, переходим сразу на страницу категории
      window.location.href = `/categories/${category.slug}`;
    }
  };

  const handleMobileSectionClick = (sectionTitle: string, sectionSlug: string, hasItems: boolean) => {
    if (hasItems) {
      // Переходим на уровень 3
      setNavHistory(prev => [...prev, mobileNav]);
      setMobileNav({ 
        level: 'level3', 
        categoryId: mobileNav.categoryId,
        sectionTitle,
        sectionSlug
      });
    } else if (sectionSlug && sectionSlug !== '#') {
      // Если нет подкатегорий 3-го уровня, но есть slug, переходим на страницу
      // Используем router для перехода без закрытия меню сразу
      window.location.href = `/categories/${sectionSlug}`;
    } else {
      // Если нет ни items, ни slug, просто закрываем меню
      handleLinkClick();
    }
  };

  const handleMobileBack = () => {
    if (navHistory.length > 0) {
      const previousState = navHistory[navHistory.length - 1];
      setNavHistory(prev => prev.slice(0, -1));
      setMobileNav(previousState);
    } else {
      // Возвращаемся на уровень 1
      setMobileNav({ level: 'level1' });
      setNavHistory([]);
    }
  };

  // Закрываем меню при клике вне триггера и вне мобильного оверлея (портал в body)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (mobileMenuPortalRef.current?.contains(target)) return;

      setIsOpen(false);
      setActiveCategory(null);
      setMobileNav({ level: 'level1' });
      setNavHistory([]);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (activeCategory) return;
    if (categoriesData.length === 0) return;
    setActiveCategory(categoriesData[0].id);
  }, [isOpen, activeCategory, categoriesData]);

  const activeCatObj = categoriesData.find((cat) => cat.id === activeCategory);

  // Показываем загрузку если данные еще не загружены
  if (isLoading) {
    return (
      <div className="relative inline-block text-left">
        <button
          className={compact
            ? "px-3 py-1.5 text-sm font-bold text-gray-800 bg-white border border-gray-300 rounded-full transition-all duration-200 focus:outline-none flex items-center justify-center opacity-50 cursor-not-allowed"
            : "px-5 py-2 text-base font-bold text-gray-800 bg-white border border-gray-300 rounded-full transition-all duration-200 focus:outline-none flex items-center justify-center opacity-50 cursor-not-allowed"
          }
          style={{ minWidth: compact ? 90 : 135 }}
          disabled
        >
          Загрузка...
        </button>
      </div>
    );
  }

  // Показываем ошибку если что-то пошло не так
  if (error) {
    return (
      <div className="relative inline-block text-left">
        <button
          className={compact
            ? "px-3 py-1.5 text-sm font-bold text-gray-800 bg-white border border-gray-300 rounded-full transition-all duration-200 focus:outline-none flex items-center justify-center opacity-50 cursor-not-allowed"
            : "px-5 py-2 text-base font-bold text-gray-800 bg-white border border-gray-300 rounded-full transition-all duration-200 focus:outline-none flex items-center justify-center opacity-50 cursor-not-allowed"
          }
          style={{ minWidth: compact ? 90 : 135 }}
          disabled
        >
          Ошибка загрузки
        </button>
      </div>
    );
  }

  // Если нет категорий, показываем пустое состояние
  if (!categoriesData || categoriesData.length === 0) {
    return (
      <div className="relative inline-block text-left">
        <button
          className={compact
            ? "px-3 py-1.5 text-sm font-bold text-gray-800 bg-white border border-gray-300 rounded-full transition-all duration-200 focus:outline-none flex items-center justify-center opacity-50 cursor-not-allowed"
            : "px-5 py-2 text-base font-bold text-gray-800 bg-white border border-gray-300 rounded-full transition-all duration-200 focus:outline-none flex items-center justify-center opacity-50 cursor-not-allowed"
          }
          style={{ minWidth: compact ? 90 : 135 }}
          disabled
        >
          Нет категорий
        </button>
      </div>
    );
  }

  // --- Кнопка Каталог ---
  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        className={compact
          ? `group my-1 flex items-center gap-2 rounded-app-sm px-3 py-2 text-sm font-medium tracking-[0.01em] transition-all duration-200 ease-in-out ${
              isOpen
                ? 'bg-[#3A3A5C] text-white shadow-app-glow'
                : 'text-light-700 hover:bg-[#3A3A5C] hover:text-white hover:shadow-app-glow'
            }`
          : `group my-1 flex items-center gap-2 rounded-app-sm px-grid-2 py-grid-2 text-sm font-medium tracking-[0.01em] transition-all duration-200 ease-in-out ${
              isOpen
                ? 'bg-[#3A3A5C] text-white shadow-app-glow'
                : 'text-light-700 hover:bg-[#3A3A5C] hover:text-white hover:shadow-app-glow'
            }`
        }
        onClick={handleToggleMenu}
      >
        Каталог
        {isOpen && (
          <span className="ml-1 text-base font-normal leading-none">×</span>
        )}
      </button>
      {/* Мега-меню: десктоп и планшет */}
      {isOpen && (
        <>
          {/* Мобильная версия: full screen overlay с навигацией по уровням */}
          {/* Показываем только на мобильных устройствах (< 640px) */}
          {typeof window !== 'undefined' && createPortal(
            <div
              ref={mobileMenuPortalRef}
              className="fixed inset-0 z-[9999] bg-white flex flex-col sm:hidden"
              style={{ top: 0, left: 0, right: 0, bottom: 0, position: 'fixed' }}
            >
            {/* Шапка меню */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
              {mobileNav.level !== 'level1' ? (
                <button
                  onClick={handleMobileBack}
                  className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-700 hover:text-brand transition-colors focus:outline-none touch-manipulation"
                  aria-label="Назад"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              ) : (
                <div className="w-10" />
              )}
              <span className="text-lg font-bold flex-1 text-center">
                {mobileNav.level === 'level1' 
                  ? 'Каталог' 
                  : mobileNav.level === 'level2' 
                    ? categoriesData.find(c => c.id === mobileNav.categoryId)?.name || 'Каталог'
                    : mobileNav.sectionTitle || 'Каталог'}
              </span>
              <button
                className="flex items-center justify-center w-10 h-10 -mr-2 text-gray-400 hover:text-gray-700 focus:outline-none touch-manipulation"
                onClick={handleCloseMenu}
                aria-label="Закрыть меню"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Контейнер для уровней с анимацией */}
            <div className="flex-1 overflow-hidden relative">
              {/* Уровень 1: Главные категории */}
              <div 
                className={`absolute inset-0 overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out bg-white ${
                  mobileNav.level === 'level1' ? 'translate-x-0 z-10' : '-translate-x-full z-0'
                }`}
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div className="p-4">
                  {categoriesData.map((cat) => {
                    const hasSubcategories = cat.columns.some(col => 
                      col.sections.some(section => section.items && section.items.length > 0)
                    ) || cat.columns.some(col => col.sections.length > 0);
                    
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleMobileCategoryClick(cat.id)}
                        className="w-full flex items-center justify-between px-4 py-4 mb-2 bg-white border border-gray-200 rounded-lg hover:border-brand hover:bg-brand/5 active:bg-brand/10 transition-all duration-150 focus:outline-none touch-manipulation min-h-[60px]"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0">{getCategoryIcon(cat.icon)}</span>
                          <span className="text-base font-semibold text-gray-800 text-left flex-1 truncate">
                            {cat.name}
                          </span>
                        </div>
                        {hasSubcategories && (
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Уровень 2: Подкатегории (sections) */}
              {mobileNav.categoryId && (() => {
                const category = categoriesData.find(c => c.id === mobileNav.categoryId);
                if (!category) return null;
                
                // Собираем все sections из всех columns
                const allSections: any[] = [];
                category.columns.forEach(col => {
                  col.sections.forEach(section => {
                    allSections.push(section);
                  });
                });

                return (
                  <div 
                    className={`absolute inset-0 overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out bg-white ${
                      mobileNav.level === 'level2' ? 'translate-x-0 z-20' : 
                      mobileNav.level === 'level3' ? '-translate-x-full z-10' : 
                      'translate-x-full z-0'
                    }`}
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    <div className="p-4">
                      {allSections.length > 0 ? (
                        allSections.map((section, idx) => {
                          const hasItems = section.items && section.items.length > 0;
                          const hasSlug = section.slug && section.slug !== '#';
                          
                          // Если нет items, но есть slug, делаем ссылку
                          if (!hasItems && hasSlug) {
                            return (
                              <Link
                                key={idx}
                                prefetch={false}
                                href={`/categories/${section.slug}`}
                                onClick={handleLinkClick}
                                className="block w-full flex items-center justify-between px-4 py-4 mb-2 bg-white border border-gray-200 rounded-lg hover:border-brand hover:bg-brand/5 active:bg-brand/10 transition-all duration-150 focus:outline-none touch-manipulation min-h-[56px]"
                              >
                                <span className="text-base font-semibold text-gray-800 text-left flex-1">
                                  {section.title}
                                </span>
                              </Link>
                            );
                          }
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => handleMobileSectionClick(
                                section.title, 
                                section.slug || '#', 
                                hasItems
                              )}
                              className="w-full flex items-center justify-between px-4 py-4 mb-2 bg-white border border-gray-200 rounded-lg hover:border-brand hover:bg-brand/5 active:bg-brand/10 transition-all duration-150 focus:outline-none touch-manipulation min-h-[56px]"
                            >
                              <span className="text-base font-semibold text-gray-800 text-left flex-1">
                                {section.title}
                              </span>
                              {hasItems && (
                                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          Нет подкатегорий
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Уровень 3: Подкатегории 3-го уровня (items) */}
              {mobileNav.categoryId && mobileNav.sectionSlug && (() => {
                const category = categoriesData.find(c => c.id === mobileNav.categoryId);
                if (!category) return null;
                
                // Находим нужную section
                let targetSection: any = null;
                category.columns.forEach(col => {
                  col.sections.forEach(section => {
                    if (section.slug === mobileNav.sectionSlug || section.title === mobileNav.sectionTitle) {
                      targetSection = section;
                    }
                  });
                });

                if (!targetSection || !targetSection.items || targetSection.items.length === 0) {
                  return null;
                }

                return (
                  <div 
                    className={`absolute inset-0 overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out bg-white ${
                      mobileNav.level === 'level3' ? 'translate-x-0 z-30' : 'translate-x-full z-0'
                    }`}
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    <div className="p-4">
                      {targetSection.items.map((item: any, idx: number) => (
                        <Link
                          key={idx}
                          prefetch={false}
                          href={`/categories/${item.slug}`}
                          onClick={handleLinkClick}
                          className="block w-full px-4 py-4 mb-2 bg-white border border-gray-200 rounded-lg hover:border-brand hover:bg-brand/5 active:bg-brand/10 transition-all duration-150 focus:outline-none touch-manipulation min-h-[52px]"
                        >
                          <span className="text-base font-medium text-gray-800">
                            {item.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>,
          document.body
          )}
          {/* Десктоп/планшет: двухуровневое меню как у референса */}
          {/* Полностью скрываем на мобильных устройствах, показываем только на sm и выше */}
          <div className="absolute left-0 mt-2 z-50 hidden w-[1120px] max-w-[calc(100vw-48px)] sm:block">
            <div className="overflow-hidden rounded-app-md border border-white/10 bg-app-surface/95 shadow-app-lift backdrop-blur-xl">
              {/* 1-й уровень: строка верхних категорий */}
              <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10 px-grid-1 py-grid-1 scrollbar-hide">
                {categoriesData.map((cat) => (
                  <Link
                    prefetch={false}
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    onMouseEnter={() => setActiveCategory(String(cat.id))}
                    onClick={handleLinkClick}
                    className={`group inline-flex shrink-0 items-center gap-2 rounded-app-sm px-grid-2 py-grid-2 text-sm font-medium tracking-[0.01em] transition-all duration-200 ease-in-out ${
                      activeCategory === cat.id
                        ? 'bg-app-card text-white shadow-app-glow'
                        : 'text-light-700 hover:bg-app-card hover:text-white hover:shadow-app-glow'
                    }`}
                  >
                    <span className="transition-transform duration-200 ease-in-out group-hover:translate-x-0.5">{getCategoryIcon(cat.icon)}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>

              {/* 2-й уровень: динамический нижний блок по hover */}
              <div className="min-h-[230px] p-grid-2">
                {activeCatObj ? (
                  <>
                    <div className="mb-4 flex items-center justify-between px-1">
                      <Link
                        prefetch={false}
                        href={`/categories/${activeCatObj.slug}`}
                        onClick={handleLinkClick}
                        className="rounded-app-sm px-2 py-1 text-base font-medium tracking-[0.01em] text-light-700 transition-all duration-200 ease-in-out hover:bg-app-card hover:text-white"
                      >
                        {activeCatObj.name}
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-grid-2">
                      {activeCatObj.columns.map((col, idx) => (
                        <div key={idx} className="min-w-0">
                          {col.sections.map((section: any, i: number) => (
                            <div key={i} className="mb-3 rounded-app-sm border border-white/5 bg-app-card/35 p-2">
                              {section.slug && section.slug !== '#' ? (
                                <Link
                                  prefetch={false}
                                  href={`/categories/${section.slug}`}
                                  className="mb-1 block rounded-app-sm px-2 py-1 text-sm font-medium tracking-[0.01em] text-light-700 transition-all duration-200 ease-in-out hover:bg-app-card hover:text-white"
                                  onClick={handleLinkClick}
                                >
                                  {section.title}
                                </Link>
                              ) : (
                                <div className="mb-1 rounded-app-sm px-2 py-1 text-sm font-medium tracking-[0.01em] text-light-700">{section.title}</div>
                              )}
                              {section.items && section.items.length > 0 && (
                                <ul className="space-y-1">
                                  {section.items.map((item: any, j: number) => (
                                    <li key={j}>
                                      <Link
                                        prefetch={false}
                                        href={`/categories/${item.slug}`}
                                        className="group block rounded-app-sm px-2 py-1 text-sm text-light-600 transition-all duration-200 ease-in-out hover:bg-app-card hover:text-white"
                                        onClick={handleLinkClick}
                                      >
                                        <span className="transition-transform duration-200 ease-in-out group-hover:translate-x-0.5">{item.name}</span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-sm text-light-600">Наведите курсор на категорию.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 