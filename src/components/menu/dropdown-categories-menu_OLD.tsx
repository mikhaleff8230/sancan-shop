import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import * as categoriesIcon from '@/components/icons/category';
import { getIcon } from '@/lib/get-icon';
import { useCategoriesForMenu } from '@/data/category';
import type { Category } from '@/types';

// Маппинг иконок для категорий
const getCategoryIcon = (iconName?: string) => {
  const fallback = 'Sofa';
  const name = iconName && (categoriesIcon as any)[iconName] ? iconName : fallback;
  return (
    <span className="inline-flex items-center justify-center">
      {getIcon({ iconList: categoriesIcon as any, iconName: name, className: 'w-5 h-5 text-gray-500' })}
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

export default function DropdownCategoriesMenu({ compact = false }: { compact?: boolean }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
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
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setActiveCategory(null);
  };

  // Закрываем меню при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
          ? `px-3 py-1.5 text-sm font-bold border border-gray-300 rounded-full transition-all duration-200 focus:outline-none flex items-center justify-center hover:bg-[#fa6830] hover:text-white ${isOpen ? 'text-black bg-gray-100' : 'text-gray-800 bg-white'}`
          : `px-5 py-2 text-base font-bold border border-gray-300 rounded-full transition-all duration-200 focus:outline-none flex items-center justify-center hover:bg-[#fa6830] hover:text-white ${isOpen ? 'text-black bg-gray-100' : 'text-gray-800 bg-white'}`
        }
        style={{ minWidth: compact ? 90 : 135 }}
        onClick={handleToggleMenu}
      >
        Каталог
        {isOpen && (
          <span className="ml-2 text-lg font-normal">×</span>
        )}
      </button>
      {/* Мега-меню: десктоп и планшет */}
      {isOpen && (
        <>
          {/* Мобильная версия: full screen overlay */}
          <div className="fixed inset-0 z-[100] bg-white flex flex-col sm:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="text-lg font-bold">Каталог</span>
              <button
                className="text-gray-400 hover:text-gray-700 text-3xl focus:outline-none"
                onClick={handleCloseMenu}
                aria-label="Закрыть меню"
              >
                <span className="material-icons text-3xl">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Категории */}
              <div className="flex flex-row overflow-x-auto border-b border-gray-100 bg-gray-50">
                {categoriesData.map((cat) => (
                  <button
                    key={cat.id}
                    className={`flex flex-col items-center justify-center min-w-[90px] px-3 py-3 text-sm font-semibold focus:outline-none transition-all duration-150 ${activeCategory === cat.id ? 'text-[#fa6830]' : 'text-gray-700'} ${activeCategory === cat.id ? 'border-b-2 border-[#fa6830] bg-white' : ''}`}
                    onClick={() => setActiveCategory(String(cat.id))}
                  >
                    <span className="text-lg mb-1">{getCategoryIcon(cat.icon)}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
              {/* Подкатегории */}
              <div className="flex-1 p-4">
                {activeCatObj ? (
                  <>
                    <div className="text-base font-bold text-gray-800 mb-3">{activeCatObj.name}</div>
                    <div className="flex flex-col gap-4">
                      {activeCatObj.columns.map((col, idx) => (
                        <div key={idx}>
                          {col.sections.map((section, sIdx) => (
                            <div key={sIdx} className="mb-4">
                              {section.slug && section.slug !== '#' ? (
                                <Link prefetch={false}
                                  href={`/categories/${section.slug}`}
                                  className="font-semibold mb-2 text-gray-800 text-sm hover:text-[#fa6830] cursor-pointer transition-colors block"
                                  onClick={handleLinkClick}
                                >
                                  {section.title}
                                </Link>
                              ) : (
                                <div className="font-semibold mb-2 text-gray-800 text-sm">{section.title}</div>
                              )}
                              {section.items && section.items.length > 0 && (
                                <ul>
                                  {section.items.map((item: any, i: number) => (
                                    <li key={i}>
                                      <Link prefetch={false}
                                        href={`/categories/${item.slug}`}
                                        className="block py-2 text-gray-600 hover:text-[#fa6830] cursor-pointer text-base transition-colors"
                                        onClick={handleLinkClick}
                                      >
                                        {item.name}
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
                  <div className="text-gray-400 text-center mt-8">Выберите категорию выше</div>
                )}
              </div>
            </div>
          </div>
          {/* Десктоп/планшет: широкое меню */}
          <div className="absolute left-0 mt-0 z-50 w-[1280px] h-[calc(100vh-80px)] bg-white border border-gray-200 rounded-bl-2xl rounded-br-2xl shadow-2xl animate-fade-in overflow-hidden hidden sm:flex">
            {/* Левая панель */}
            <div className="w-72 border-r border-gray-100 bg-gray-50 py-6 flex flex-col transition-all duration-200 overflow-y-auto h-full">
              {categoriesData.map((cat) => (
                <Link prefetch={false}
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className={`flex items-center gap-3 px-6 py-3 cursor-pointer text-gray-700 hover:bg-[#fa6830]/10 hover:text-[#fa6830] transition-all duration-150 relative text-lg tracking-tight ${activeCategory === cat.id ? 'bg-[#fa6830]/10 text-[#fa6830] font-semibold border-l-4 border-[#fa6830]' : 'border-l-4 border-transparent'}`}
                  onMouseEnter={() => setActiveCategory(String(cat.id))}
                  onClick={handleLinkClick}
                >
                  <span className="text-lg">{getCategoryIcon(cat.icon)}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
            {/* Центральная часть с колонками */}
            <div className="flex-1 flex flex-col p-8 relative bg-white overflow-y-auto h-full">
              {/* Название родительской категории */}
              {activeCatObj && (
                <div className="text-2xl font-extrabold text-gray-900 mb-6 pl-2 tracking-tight">{activeCatObj.name}</div>
              )}
              <div className="flex flex-row gap-10">
                {activeCatObj ? (
                  activeCatObj.columns.map((col, idx) => (
                    <div key={idx} className="min-w-[220px] pr-6">
                      {col.sections.map((section: any, i: number) => (
                        <div key={i} className="mb-6">
                          {section.slug && section.slug !== '#' ? (
                            <Link prefetch={false}
                              href={`/categories/${section.slug}`}
                              className="font-bold mb-2 text-gray-900 text-base hover:text-[#fa6830] cursor-pointer transition-colors block"
                              onClick={handleLinkClick}
                            >
                              {section.title}
                            </Link>
                          ) : (
                            <div className="font-bold mb-2 text-gray-900 text-base">{section.title}</div>
                          )}
                          {section.items && section.items.length > 0 && (
                            <ul>
                              {section.items.map((item: any, j: number) => (
                                <li key={j}>
                                  <Link prefetch={false}
                                    href={`/categories/${item.slug}`}
                                    className="block py-1.5 text-gray-600 hover:text-[#fa6830] cursor-pointer text-[15px] transition-colors"
                                    onClick={handleLinkClick}
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 self-center">Выберите категорию слева</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 