import type { User } from '@/types';
import { Fragment, useEffect } from 'react';
import { useRouter } from 'next/router';
import Avatar from 'react-avatar';
import routes from '@/config/routes';
import ThemeSwitcher from '@/components/ui/theme-switcher';
import ActiveLink from '@/components/ui/links/active-link';
import { useLogout, useMe } from '@/data/user';
import { Menu } from '@/components/ui/dropdown';
import { Transition } from '@/components/ui/transition';
import { UserIcon } from '@/components/icons/user-icon';
import SearchInput from '@/components/search/search-input';
import CartButton from '@/components/cart/cart-button';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import { useSwapBodyClassOnScrollDirection } from '@/lib/hooks/use-swap-body-class';
import { useDynamicHeader } from '@/lib/hooks/use-dynamic-header';
import { useModalAction } from '@/components/modal-views/context';
import Button from '@/components/ui/button';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { useTranslation } from 'next-i18next';
import DropdownCategoriesMenu from '@/components/menu/dropdown-categories-menu';
import CreatePlaceModal from '@/components/places/CreatePlaceModal';
import Logo from '@/components/ui/logo';
import { useState } from 'react';
import cn from 'classnames';
import { PlusCircleIcon } from '@/components/icons/plus-circle-icon';
import ChatButton from '@/components/chat/ChatButton';

const AuthorizedMenuItems = [
  {
    label: 'text-auth-profile',
    path: routes.profile,
  },
  {
    label: 'text-auth-purchase',
    path: routes.purchases,
  },
  {
    label: 'text-auth-wishlist',
    path: routes.wishlists,
  },
  {
    label: 'text-followed-authors',
    path: routes.followedShop,
  },
  {
    label: 'text-auth-password',
    path: routes.password,
  },
  {
    label: 'Сообщения',
    path: '/chat',
  },
];

function AuthorizedMenu({ user }: { user: User }) {
  const { mutate: logout } = useLogout();
  const { t } = useTranslation('common');
  return (
    <Menu>
      <Menu.Button className="app-interactive relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-app-card/60">
        {/* @ts-ignore */}
        <Avatar
          size="32"
          round={true}
          name={user.name}
          textSizeRatio={2}
          src={user?.profile?.avatar?.thumbnail}
        />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute top-[84%] z-30 mt-4 w-56 rounded-app-md border border-white/10 bg-app-surface/95 py-1.5 text-light shadow-app-lift backdrop-blur-xl ltr:right-0 ltr:origin-top-right rtl:left-0 rtl:origin-top-left">
          {AuthorizedMenuItems.map((item) => (
            <Menu.Item key={item.label}>
              <ActiveLink
                href={item.path}
                className="transition-fill-colors mx-1 flex w-auto items-center rounded-app-sm px-4 py-2.5 hover:bg-app-card"
              >
                {t(item.label)}
              </ActiveLink>
            </Menu.Item>
          ))}
          <Menu.Item>
            <button
              type="button"
              className="transition-fill-colors mx-1 w-[calc(100%-8px)] rounded-app-sm px-4 py-2.5 hover:bg-app-card ltr:text-left rtl:text-right"
              onClick={() => logout()}
            >
              {t('text-logout')}
            </button>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function LoginMenu() {
  const { openModal } = useModalAction();
  const { me, isAuthorized, isLoading } = useMe();
  const isMounted = useIsMounted();
  if (!isMounted) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-light-300 dark:bg-dark-500" />
    );
  }
  if (isAuthorized && me && !isLoading) {
    return <AuthorizedMenu user={me} />;
  }
  return (
    <Button
      variant="icon"
      aria-label="User"
      className="app-interactive flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-app-card/40"
      onClick={() => openModal('LOGIN_VIEW')}
    >
      <UserIcon className="h-5 w-5 text-light" />
    </Button>
  );
}

interface HeaderProps {
  isCollapse?: boolean;
  showHamburger?: boolean;
  onClickHamburger?: () => void;
}

export default function Header({
  isCollapse: _isCollapse,
  showHamburger: _showHamburger = false,
  onClickHamburger: _onClickHamburger,
}: HeaderProps) {
  const router = useRouter();
  const { asPath } = router;
  const { t } = useTranslation('common');
  const { me, isAuthorized, isLoading } = useMe();
  const { openModal } = useModalAction();
  
  
  useSwapBodyClassOnScrollDirection();
  
  // Используем динамический хедер только для мобильных устройств
  const { isCompact, isVisible } = useDynamicHeader();
  
  // Проверяем, находимся ли мы на странице товара
  const isProductPage = asPath?.startsWith('/element/');
  const isMultiLangEnable =
    process.env.NEXT_PUBLIC_ENABLE_MULTI_LANG === 'true' &&
    !!process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Обработка изменения маршрута для исправления "ghost header" (только для мобильных)
  useEffect(() => {
    // Проверяем, что мы на мобильном устройстве
    if (typeof window === 'undefined' || window.innerWidth >= 640) {
      return;
    }

    const handleRouteChangeComplete = () => {
      // При изменении маршрута пересчитываем состояние хедера
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          const scrollEvent = new Event('scroll', { bubbles: true });
          window.dispatchEvent(scrollEvent);
          requestAnimationFrame(() => {
            window.dispatchEvent(scrollEvent);
            if (window.scrollY === 0) {
              window.scrollTo(0, 0);
            }
          });
        }
      }, 50);
    };

    if (router.events) {
      router.events.on('routeChangeComplete', handleRouteChangeComplete);
      router.events.on('routeChangeStart', () => {
        if (typeof window !== 'undefined' && window.scrollY === 0) {
          handleRouteChangeComplete();
        }
      });
    }
    
    handleRouteChangeComplete();

    return () => {
      if (router.events) {
        router.events.off('routeChangeComplete', handleRouteChangeComplete);
      }
    };
  }, [asPath, router]);
  
  return (
    <>
      {/* Desktop: Статичный хедер (без динамики) */}
      <header className="app-header fixed top-0 z-50 hidden w-full border-b border-white/10 bg-app-surface/60 backdrop-blur-xl ltr:left-0 rtl:right-0 sm:block">
        <div className="container mx-auto">
          <div className="flex h-[56px] items-center justify-between gap-3">
            {/* Левая часть */}
            <div className="flex items-center gap-grid-2">
              <Logo className="h-8 w-24 md:w-28" />
              <div className="hidden lg:flex">
                <DropdownCategoriesMenu />
              </div>
            </div>

            {/* Центральная часть */}
            <div className="mx-2 hidden max-w-2xl flex-1 md:flex">
              <SearchInput className="w-full [&_input]:h-10 [&_input]:rounded-full [&_input]:border-white/10 [&_input]:bg-[#3A3A5C] [&_input]:text-light [&_input]:placeholder:text-app-muted [&_input]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] [&_input]:ring-1 [&_input]:ring-white/5 [&_input]:focus:ring-app-accent/35" />
            </div>

            {/* Правая часть */}
            <div className="flex items-center gap-1.5">
              <div className="app-interactive rounded-app-sm px-1.5 py-1">
                <ThemeSwitcher />
              </div>
              {asPath !== routes.checkout && (
                <div className="app-interactive hidden rounded-app-sm px-1.5 py-1 sm:flex">
                  <CartButton className="hidden sm:flex" />
                </div>
              )}
              {isMultiLangEnable ? (
                <div className="app-interactive ltr:ml-auto rounded-app-sm px-1 py-1 rtl:mr-auto">
                  <LanguageSwitcher />
                </div>
              ) : (
                ''
              )}
               <button
                onClick={() => {
                  if (isAuthorized && me && !isLoading) {
                    setIsModalOpen(true);
                  } else {
                    openModal('LOGIN_VIEW');
                  }
                }}
                className="app-interactive hidden h-9 items-center justify-center rounded-app-sm border border-white/10 bg-app-card/45 px-grid-2 text-light hover:bg-app-card lg:flex"
              >
                <PlusCircleIcon className="h-5 w-5 text-brand" />
                <span className="hidden xl:inline">{t('text-create')}</span>
              </button>
              <CreatePlaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
              <LoginMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: Динамический хедер (с компактным режимом) */}
      {/* Скрываем на странице товара */}
      <header 
        className={cn(
          "app-header fixed top-0 z-50 w-full border-b border-white/10 bg-app-surface/60 backdrop-blur-xl ltr:left-0 rtl:right-0 transition-all duration-300 ease-in-out sm:hidden",
          {
            "transform translate-y-0": isVisible,
            "shadow-sm": isCompact,
            "hidden": isProductPage, // Скрываем на странице товара
          }
        )}
      >
        <div className={cn(
          "container mx-auto transition-all duration-300 ease-in-out",
          {
            "opacity-100 translate-y-0": isVisible,
            "opacity-95": !isVisible,
          }
        )}>
          <div className="flex items-center justify-between h-14 gap-2">
            {/* Логотип */}
            <div className="flex-shrink-0">
              <Logo className="w-20 h-8" />
            </div>

            {/* Поиск */}
            <div className="flex-1 min-w-0">
              <SearchInput className="w-full [&_input]:h-10 [&_input]:rounded-full [&_input]:border-white/10 [&_input]:bg-[#3A3A5C] [&_input]:text-light [&_input]:placeholder:text-app-muted [&_input]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] [&_input]:ring-1 [&_input]:ring-white/5" />
            </div>

            {/* Кнопка меню скрыта по запросу */}
          </div>
        </div>
      </header>
    </>
  );
}
