import type { User } from '@/types';
import { Fragment, useEffect } from 'react';
import { useRouter } from 'next/router';
import Avatar from 'react-avatar';
import routes from '@/config/routes';
import ActiveLink from '@/components/ui/links/active-link';
import { useLogout, useMe } from '@/data/user';
import { Menu } from '@/components/ui/dropdown';
import { Transition } from '@/components/ui/transition';
import { UserIcon } from '@/components/icons/user-icon';
import SearchInput from '@/components/search/search-input';
import CartButton from '@/components/cart/cart-button';
import Hamburger from '@/components/ui/hamburger';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import { useSwapBodyClassOnScrollDirection } from '@/lib/hooks/use-swap-body-class';
import { useDynamicHeader } from '@/lib/hooks/use-dynamic-header';
import { useDrawer } from '@/components/drawer-views/context';
import { useModalAction } from '@/components/modal-views/context';
import Button from '@/components/ui/button';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { Bell, Clock3, Heart, MapPin, MessageCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import Logo from '@/components/ui/logo';
import cn from 'classnames';
import DropdownCategoriesMenu from '@/components/menu/dropdown-categories-menu';
import { LocationWithModal } from '@/components/GeoLocation/LocationWithModal';

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
    label: 'Чат',
    path: routes.chat,
    icon: <MessageCircle className="h-4 w-4" />,
  },
];

function AuthorizedMenu({ user }: { user: User }) {
  const { mutate: logout } = useLogout();
  const { t } = useTranslation('common');
  return (
    <Menu>
      <Menu.Button className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-ozon-border bg-white shadow-sm">
        {/* @ts-ignore */}
        <Avatar
        size="40"
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
        <Menu.Items className="absolute top-[84%] z-30 mt-4 w-56 rounded-md bg-light py-1.5 text-dark shadow-dropdown ltr:right-0 ltr:origin-top-right rtl:left-0 rtl:origin-top-left dark:bg-dark-250 dark:text-light">
          {AuthorizedMenuItems.map((item) => (
            <Menu.Item key={item.label}>
              <ActiveLink
                href={item.path}
                className="transition-fill-colors flex w-full items-center px-5 py-2.5 hover:bg-light-400 dark:hover:bg-dark-600"
              >
                {'icon' in item && item.icon ? <span className="mr-2 flex w-5 items-center">{item.icon}</span> : null}
                {t(item.label)}
              </ActiveLink>
            </Menu.Item>
          ))}
          <Menu.Item>
            <button
              type="button"
              className="transition-fill-colors w-full px-5 py-2.5 hover:bg-light-400 ltr:text-left rtl:text-right dark:hover:bg-dark-600"
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
      <div className="h-10 w-10 animate-pulse rounded-full bg-light-300" />
    );
  }
  if (isAuthorized && me && !isLoading) {
    return <AuthorizedMenu user={me} />;
  }
  return (
    <Button
      variant="icon"
      aria-label="User"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-light-200 text-ozon-text hover:bg-brand-50 hover:text-brand"
      onClick={() => openModal('LOGIN_VIEW')}
    >
      <UserIcon className="h-5 w-5"/>
    </Button>
  );
}

function HeaderLocation({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'items-center gap-2 rounded-xl bg-light-200 px-3 py-2 text-ozon-text transition-colors hover:bg-brand-50',
        compact ? 'flex min-w-[44px]' : 'hidden min-w-[220px] lg:flex'
      )}
    >
      <MapPin className="h-5 w-5 shrink-0 text-ozon-text" />
      {!compact && (
        <div className="min-w-0">
          <LocationWithModal className="!p-0 hover:!bg-transparent" />
          <div className="truncate text-xs font-medium text-ozon-muted">
            Как можно скорее
          </div>
        </div>
      )}
    </div>
  );
}

interface HeaderProps {
  isCollapse?: boolean;
  showHamburger?: boolean;
  onClickHamburger?: () => void;
}

export default function Header({
  isCollapse,
  showHamburger = false,
  onClickHamburger,
}: HeaderProps) {
  const router = useRouter();
  const { asPath } = router;
  const { openDrawer } = useDrawer();
  
  
  useSwapBodyClassOnScrollDirection();
  
  // Используем динамический хедер только для мобильных устройств
  const { isCompact, isVisible } = useDynamicHeader();
  
  const isCommerce =
    asPath === '/products' ||
    asPath.startsWith('/products?') ||
    asPath.startsWith('/element/') ||
    asPath.startsWith('/categories/') ||
    asPath.startsWith('/shops') ||
    asPath.startsWith('/cart') ||
    asPath.startsWith('/checkout') ||
    asPath.startsWith('/wishlists');
  const isPlacesSurface =
    asPath === '/' ||
    asPath.startsWith('/?') ||
    asPath.startsWith('/following') ||
    asPath.startsWith('/places') ||
    asPath.startsWith('/place/') ||
    asPath.startsWith('/communities') ||
    asPath.startsWith('/community/');
  const isMultiLangEnable =
    process.env.NEXT_PUBLIC_ENABLE_MULTI_LANG === 'true' &&
    !!process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES;

  // Функция для открытия мобильного меню (сайдбара)
  const handleMobileMenuClick = () => {
    // На мобильных устройствах открываем drawer с меню
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      openDrawer('MOBILE_MENU');
    } else {
      // На десктопе используем обычный toggle сайдбара
      onClickHamburger?.();
    }
  };

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
      <header className="app-header sticky top-0 z-50 hidden w-full border-b border-slate-200 bg-white/95 backdrop-blur sm:block">
        <div className="web2-header-surface">
          <div className="flex h-[64px] items-center gap-6">
            <div className="flex shrink-0 items-center gap-2">
              {showHamburger && (
                <Hamburger isToggle={isCollapse} onClick={onClickHamburger} className="hidden lg:flex" />
              )}
              <Logo className="h-10 w-[142px]" />
            </div>

            <div className="mx-auto hidden min-w-[320px] max-w-[900px] flex-1 md:block">
              <SearchInput className="web2-global-search" placeholder="Найти людей, плейсы и вещи..." />
            </div>

            <nav className="web2-mode-switch hidden shrink-0 lg:grid" aria-label="Раздел SANCAN">
              <Link href="/" className={cn('web2-mode-link', !isCommerce && 'web2-mode-link-active')}>Плейсы</Link>
              <Link href="/products" className={cn('web2-mode-link', isCommerce && 'web2-mode-link-active')}>Маркет</Link>
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <button type="button" className="web2-icon-button" aria-label="Уведомления">
                <Bell className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => router.push(routes.chat)} className="web2-icon-button" aria-label="Сообщения">
                <MessageCircle className="h-5 w-5" />
              </button>
              {isMultiLangEnable && <LanguageSwitcher />}
              <LoginMenu />
            </div>
          </div>

        </div>

        {isPlacesSurface && !isCommerce && (
          <div className="border-t border-slate-100 bg-white">
            <div className="web2-section-nav">
              <nav className="flex items-center gap-7" aria-label="Навигация по плейсам">
                <Link href="/" className={cn('web2-section-link', (asPath === '/' || asPath.startsWith('/?')) && 'web2-section-link-active')}>Интересное</Link>
                <Link href="/following" className={cn('web2-section-link', asPath.startsWith('/following') && 'web2-section-link-active')}>Подписки</Link>
              </nav>
            </div>
          </div>
        )}

        {isCommerce && (
          <div className="border-t border-slate-100 bg-white">
            <div className="web2-commerce-nav">
              <div className="shrink-0"><DropdownCategoriesMenu /></div>
              <nav className="flex min-w-0 items-center gap-1 overflow-x-auto" aria-label="Навигация по товарам">
                <Link href="/products" className="web2-commerce-link web2-commerce-link-active">Товары</Link>
                <Link href="/shops" className="web2-commerce-link">Магазины</Link>
                <Link href="/products?collection=brands" className="web2-commerce-link">Бренды</Link>
                <Link href="/products?sale=1" className="web2-commerce-link">Скидки</Link>
                <Link href="/products?sort=new" className="web2-commerce-link">Новинки</Link>
                <Link href="/products?made_in=russia" className="web2-commerce-link">Сделано в России</Link>
              </nav>
              <div className="ml-auto hidden shrink-0 items-center gap-1 2xl:flex">
                <HeaderLocation compact />
                <Link href="/wishlists" className="web2-commerce-icon-link"><Heart className="h-4 w-4" />Избранное</Link>
                <span className="web2-commerce-icon-link"><Clock3 className="h-4 w-4" />Недавно</span>
                {asPath !== routes.checkout && <div className="web2-commerce-cart"><CartButton className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-800" /><span>Корзина</span></div>}
              </div>
            </div>
          </div>
        )}
      </header>

      <header className={cn('app-header sticky top-0 z-50 border-b border-slate-200 bg-white transition-transform sm:hidden', !isVisible && '-translate-y-full')}>
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <Logo className="h-9 w-[126px]" />
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => router.push(routes.chat)} className="web2-icon-button" aria-label="Сообщения"><MessageCircle className="h-5 w-5" /></button>
              <button type="button" onClick={() => router.push('/places/create')} className="web2-create-button" aria-label="Создать"><Plus className="h-5 w-5" /></button>
              <LoginMenu />
            </div>
          </div>
          {!isCompact && <SearchInput className="web2-global-search mt-2" placeholder="Найти людей, плейсы и вещи..." />}
        </div>
      </header>
    </>
  );
}
