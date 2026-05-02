import cn from 'classnames';
import routes from '@/config/routes';
import ActiveLink from '@/components/ui/links/active-link';
import { SettingIcon } from '@/components/icons/setting-icon';
import { CloseIcon } from '@/components/icons/close-icon';
import { useDrawer } from '@/components/drawer-views/context';
import Scrollbar from '@/components/ui/scrollbar';
import Copyright from '@/layouts/_copyright';
import { useMe } from '@/data/user';
import { CartIcon } from '@/components/icons/cart-icon';
import { useCart } from '@/components/cart/lib/cart.context';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import { useTranslation } from 'next-i18next';
import Logo from '@/components/ui/logo';
import { PlusCircleIcon } from '@/components/icons/plus-circle-icon';
import CreatePlaceModal from '@/components/places/CreatePlaceModal';
import { useMemo, useState } from 'react';
import { Sparkles, Layers, Flame, Clock3, LibraryBig, Store } from 'lucide-react';

interface NavLinkProps {
  href: string;
  title: string;
  icon: React.ReactNode;
  isExpanded?: boolean;
}

function NavLink({ href, icon, title, isExpanded }: NavLinkProps) {
  return (
    <ActiveLink
      href={href}
      className={cn(
        'group my-1 flex items-center gap-3 rounded-app-sm px-grid-2 py-grid-2 text-sm text-light-700 transition-all duration-200 ease-in-out hover:bg-[#3A3A5C] hover:text-white hover:shadow-app-glow',
        isExpanded ? 'justify-start' : 'justify-center px-0'
      )}
      activeClassName="bg-[#3A3A5C] text-white shadow-app-glow"
    >
      <span
        className={cn(
          'flex h-5 w-5 flex-shrink-0 items-center justify-center text-current transition-transform duration-200 ease-in-out group-hover:translate-x-0.5'
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          'whitespace-nowrap text-sm font-medium tracking-[0.01em] transition-all duration-200 ease-in-out',
          isExpanded
            ? 'translate-x-0 opacity-100'
            : '-translate-x-1 pointer-events-none w-0 overflow-hidden opacity-0'
        )}
      >
        {title}
      </span>
    </ActiveLink>
  );
}

function CartNavLink({ isExpanded }: { isExpanded?: boolean }) {
  const { openDrawer } = useDrawer();
  const { totalItems } = useCart();
  const isMounted = useIsMounted();
  
  return (
    <button
      onClick={() => openDrawer('CART_VIEW')}
      className={cn(
        'group my-1 flex w-full items-center gap-3 rounded-app-sm px-grid-2 py-grid-2 text-left text-sm text-light-700 transition-all duration-200 ease-in-out hover:bg-[#3A3A5C] hover:text-white hover:shadow-app-glow',
        isExpanded ? 'justify-start' : 'justify-center px-0'
      )}
    >
      <span
        className={cn(
          'relative flex h-5 w-5 flex-shrink-0 items-center justify-center text-current transition-transform duration-200 ease-in-out group-hover:translate-x-0.5'
        )}
      >
        <span className="relative">
          <CartIcon className="h-[18px] w-[18px] text-current" />
          {isMounted && totalItems > 0 && (
            <span className="absolute -top-2 -right-2 flex min-h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-light-100 bg-brand px-0.5 text-[10px] font-bold leading-none text-light dark:border-dark-250">
              {totalItems}
            </span>
          )}
        </span>
      </span>
      <span
        className={cn(
          'whitespace-nowrap text-sm font-medium tracking-[0.01em] transition-all duration-200 ease-in-out',
          isExpanded
            ? 'translate-x-0 opacity-100'
            : '-translate-x-1 pointer-events-none w-0 overflow-hidden opacity-0'
        )}
      >
        Корзина
      </span>
    </button>
  );
}

export function Sidebar({
  isCollapse,
  className = 'hidden sm:flex',
}: {
  isCollapse?: boolean;
  className?: string;
  onToggle?: () => void;
}) {
  const { me } = useMe();
  const { openDrawer } = useDrawer();
  const [isHovering, setIsHovering] = useState(false);
  const isExpanded = useMemo(() => Boolean(isCollapse || isHovering), [isCollapse, isHovering]);

  return (
    <aside
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        'sticky top-[70px] h-[calc(100vh-82px)] flex-col justify-between overflow-hidden border border-white/10 bg-app-surface/95 text-light-900 backdrop-blur-xl transition-[width] duration-200 ease-in-out',
        'rounded-app-md shadow-app-lift',
        isExpanded ? 'sm:w-[232px]' : 'sm:w-[76px]',
        className
      )}
    >
      <Scrollbar className="relative h-full w-full">
        <div className="flex h-full w-full flex-col p-grid-1">
          <nav className="flex flex-col">
          <NavLink
              title="Explore"
              href={routes.explore}
              isExpanded={isExpanded}
              icon={<Sparkles className="h-[18px] w-[18px] text-current" />}
            />
          <NavLink
              title="Categories"
              href={routes.home}
              isExpanded={isExpanded}
              icon={<Layers className="h-[18px] w-[18px] text-current" />}
            />
            <NavLink
              title="Trending"
              href={routes.popularProducts}
              isExpanded={isExpanded}
              icon={<Flame className="h-[18px] w-[18px] text-current" />}
            />
            <NavLink
              title="New"
              href={routes.feed}
              isExpanded={isExpanded}
              icon={<Clock3 className="h-[18px] w-[18px] text-current" />}
            />
            {me ? (
              <NavLink
                title="My Library / My Orders"
                href={routes.purchases}
                isExpanded={isExpanded}
                icon={<LibraryBig className="h-[18px] w-[18px] text-current" />}
              />
            ) : (
              <button
                onClick={() => openDrawer('AUTH_VIEW')}
                className={cn(
                  'group my-1 flex w-full items-center gap-3 rounded-app-sm px-grid-2 py-grid-2 text-left text-sm text-light-700 transition-all duration-200 ease-in-out hover:bg-[#3A3A5C] hover:text-white hover:shadow-app-glow',
                  isExpanded ? 'justify-start' : 'justify-center px-0'
                )}
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-current transition-transform duration-200 ease-in-out group-hover:translate-x-0.5">
                  <LibraryBig className="h-[18px] w-[18px] text-current" />
                </span>
                <span
                  className={cn(
                    'whitespace-nowrap text-sm font-medium tracking-[0.01em] transition-all duration-200 ease-in-out',
                    isExpanded
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-1 pointer-events-none w-0 overflow-hidden opacity-0'
                  )}
                >
                  My Library / My Orders
                </span>
              </button>
            )}
            <ActiveLink
              href={routes.seller}
              className={cn(
                'group my-1 flex items-center gap-3 rounded-app-sm px-grid-2 py-grid-2 text-sm text-light-700 transition-all duration-200 ease-in-out hover:bg-[#3A3A5C] hover:text-white hover:shadow-app-glow',
                isExpanded ? 'justify-start' : 'justify-center px-0'
              )}
              activeClassName="bg-[#3A3A5C] text-white shadow-app-glow"
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-current transition-transform duration-200 ease-in-out group-hover:translate-x-0.5">
                <Store className="h-[18px] w-[18px] text-current" />
              </span>
              <span
                className={cn(
                  'whitespace-nowrap text-sm font-medium tracking-[0.01em] transition-all duration-200 ease-in-out',
                  isExpanded
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-1 pointer-events-none w-0 overflow-hidden opacity-0'
                )}
              >
                Become Seller
              </span>
            </ActiveLink>
            
          </nav>

            
    

          <nav className="mt-auto flex flex-col pb-2">
            <CartNavLink isExpanded={isExpanded} />
            <NavLink
              title="Профиль"
              href={routes.profile}
              isExpanded={isExpanded}
              icon={<SettingIcon className="h-[18px] w-[18px] text-current" />}
            />
          </nav>
        </div>
      </Scrollbar>

      <footer
        className={cn(
          'flex-col border-t border-white/10 pt-2 pb-3 text-center',
          isExpanded ? 'flex' : 'hidden'
        )}
      >
        <nav className="flex items-center justify-center gap-5 pb-1.5 text-13px font-medium tracking-[0.2px]">
          <ActiveLink
            href="https://sancan.ru/help"
            className="block py-2 text-[12px] text-light-500 transition-colors hover:text-light"
          >Частые вопросы и поддержка
          </ActiveLink>
          
        </nav>
        <Copyright className="text-xs font-medium text-light-600/80" />
      </footer>
    </aside>
  );
}

export default function SidebarDrawerView() {
  const { closeDrawer } = useDrawer();
  const { t } = useTranslation('common');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <div className="relative z-50 h-full flex flex-col">
        <div className="flex h-[70px] items-center justify-between py-2 px-5 xs:px-7 relative z-50">
          <Logo />
          <div className="ml-3 flex h-7 items-center gap-2">
            {/* Кнопка создания плейса */}
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(true);
                closeDrawer();
              }}
              className="p-2 text-dark-900 outline-none transition-all hover:text-dark dark:text-dark-800 hover:dark:text-light-200 touch-manipulation"
              aria-label={t('text-create')}
            >
              <PlusCircleIcon className="h-5 w-5" />
            </button>
            {/* Кнопка закрытия */}
            <button
              type="button"
              className="-m-2 p-2 text-dark-900 outline-none transition-all hover:text-dark dark:text-dark-800 hover:dark:text-light-200 touch-manipulation"
              onClick={closeDrawer}
            >
              <span className="sr-only">{t('text-close-panel')}</span>
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 relative z-50 overflow-hidden">
          <Sidebar
            isCollapse={true}
            className="!static !top-0 !h-full !w-full !rounded-none !border-0 !shadow-none flex text-13px relative z-50"
          />
        </div>
      </div>
      <CreatePlaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
