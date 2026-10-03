import { useRouter } from 'next/router';
import routes from '@/config/routes';
import Button from '@/components/ui/button';
import { HomeIcon } from '@/components/icons/home-icon';
import { SearchIcon } from '@/components/icons/search-icon';
import { HeartOutlineIcon } from '@/components/icons/heart-outline';
import { useMe } from '@/data/user';
import Avatar from 'react-avatar';
import { UserIcon } from '@/components/icons/user-icon';
import { ShoppingBag } from 'lucide-react';
import cn from 'classnames';

export default function BottomNavigation() {
  const router = useRouter();
  const { me, isAuthorized } = useMe();
  const isMarket =
    router.asPath.startsWith('/products') ||
    router.asPath.startsWith('/shops') ||
    router.asPath.startsWith('/popular-products') ||
    router.asPath.startsWith('/categories') ||
    router.asPath.startsWith('/element/') ||
    router.asPath.startsWith('/cart') ||
    router.asPath.startsWith('/checkout') ||
    router.asPath.startsWith('/wishlists');
  const itemClass = (active = false) => cn(
    'web2-mobile-nav-item',
    active && 'web2-mobile-nav-item-active'
  );
  
  return (
    <>
      {/* 🌌 SYSTEM GLOW — АНИМИРОВАННЫЙ ФОН ПОД НАВИГАЦИЕЙ */}
      <div className="system-glow pointer-events-none" />
      
      <nav className="bottom-menu fixed bottom-0 left-0 right-0 z-[100] grid h-[66px] w-full grid-cols-5 items-center justify-items-center border-t border-slate-200 bg-light/95 px-1 text-center shadow-bottom-nav backdrop-blur-xl dark:bg-dark-300/95 sm:hidden">
        {/* Основной переключатель поверхностей */}
        <Button
          variant="icon"
          aria-label="Плейсы"
          onClick={() => router.push(routes.home)}
          className={itemClass(!isMarket)}
        >
          <HomeIcon className="h-5 w-5" />
          <span>Плейсы</span>
        </Button>

        <Button
          variant="icon"
          aria-label="Маркет"
          onClick={() => router.push(routes.products)}
          className={itemClass(isMarket)}
        >
          <ShoppingBag className="h-5 w-5" />
          <span>Маркет</span>
        </Button>

        {/* Поиск */}
        <Button
          variant="icon"
          aria-label="Поиск"
          onClick={() => router.push('/search')}
          className={itemClass(router.asPath.startsWith('/search'))}
        >
          <SearchIcon className="h-5 w-5" />
          <span>Поиск</span>
        </Button>

        {/* Избранное */}
        <Button
          variant="icon"
          aria-label="Избранное"
          onClick={() => router.push(routes.wishlists)}
          className={itemClass(router.asPath.startsWith('/wishlists'))}
        >
          <HeartOutlineIcon className="h-5 w-5" />
          <span>Избранное</span>
        </Button>

        {/* Профиль/Аватар (справа) */}
        {isAuthorized && me ? (
          <Button
            variant="icon"
            aria-label="Profile"
            onClick={() => router.push(routes.profile)}
            className={itemClass(router.asPath.startsWith('/profile'))}
          >
            <Avatar
              size="24"
              round={true}
              name={me.name}
              textSizeRatio={2}
              src={me?.profile?.avatar?.thumbnail}
            />
            <span>Профиль</span>
          </Button>
        ) : (
          <Button
            variant="icon"
            aria-label="Profile"
            onClick={() => router.push(routes.profile)}
            className={itemClass(router.asPath.startsWith('/profile'))}
          >
            <UserIcon className="h-5 w-5" />
            <span>Профиль</span>
          </Button>
        )}
      </nav>
      
    </>
  );
}
