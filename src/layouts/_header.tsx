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
import { useModalAction } from '@/components/modal-views/context';
import Button from '@/components/ui/button';
import { Heart, MapPin, MessageCircle } from 'lucide-react';
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
        compact ? 'flex min-w-[44px]' : 'hidden max-w-[150px] lg:flex'
      )}
    >
      <MapPin className="h-5 w-5 shrink-0 text-ozon-text" />
      {!compact && (
        <div className="min-w-0 truncate text-[13px] font-medium [&_button]:!max-w-[112px] [&_button]:!truncate [&_button]:!p-0 [&_button]:!font-medium [&_button]:hover:!bg-transparent">
          <LocationWithModal className="!p-0 hover:!bg-transparent" />
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
  
  
  useSwapBodyClassOnScrollDirection();
  
  // Используем динамический хедер только для мобильных устройств
  const { isCompact, isVisible } = useDynamicHeader();
  
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
      <header className="app-header web2-desktop-header sticky top-0 z-50 hidden w-full backdrop-blur sm:block">
        <div className="web2-header-surface web2-header-frame">
          <div className="flex h-[72px] items-center gap-3 xl:gap-4">
            <div className="flex shrink-0 items-center gap-2">
              {showHamburger && (
                <Hamburger isToggle={isCollapse} onClick={onClickHamburger} className="hidden lg:flex" />
              )}
              <Logo className="h-10 w-[132px]" />
              <div className="hidden shrink-0 sm:block"><DropdownCategoriesMenu /></div>
            </div>

            <div className="hidden min-w-[280px] flex-1 md:block">
              <SearchInput className="web2-global-search" placeholder="Найти товары, магазины и вещи..." />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <HeaderLocation />
              <Link href={routes.wishlists} className="hidden h-10 items-center gap-2 rounded-xl px-2.5 text-[13px] font-medium text-slate-700 transition hover:bg-[#f5f1ff] hover:text-[#7b3dff] xl:flex">
                <Heart className="h-5 w-5" />Избранное
              </Link>
              <Link href={routes.chat} className="hidden h-10 items-center gap-2 rounded-xl px-2.5 text-[13px] font-medium text-slate-700 transition hover:bg-[#f5f1ff] hover:text-[#7b3dff] xl:flex">
                <MessageCircle className="h-5 w-5" />Чат
              </Link>
              <span className="mx-1 hidden h-7 w-px bg-slate-200 xl:block" aria-hidden="true" />
              {asPath !== routes.checkout && (
                <div className="web2-commerce-cart hidden sm:flex">
                  <CartButton className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-800" />
                  <span>Корзина</span>
                </div>
              )}
              <LoginMenu />
            </div>
          </div>
        </div>
      </header>

      <header className={cn('app-header sticky top-0 z-50 border-b border-slate-200 bg-white transition-transform sm:hidden', !isVisible && '-translate-y-full')}>
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <Logo className="h-9 w-[126px]" />
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => router.push(routes.chat)} className="web2-icon-button" aria-label="Сообщения"><MessageCircle className="h-5 w-5" /></button>
              {asPath !== routes.checkout && <CartButton className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800" />}
              <LoginMenu />
            </div>
          </div>
          {!isCompact && <SearchInput className="web2-global-search mt-2" placeholder="Найти товары, магазины и вещи..." />}
        </div>
      </header>
    </>
  );
}
