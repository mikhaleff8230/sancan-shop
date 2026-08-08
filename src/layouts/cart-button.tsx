import Button from '@/components/ui/button';
import { CartIcon } from '@/components/icons/cart-icon';
import { useCart } from '@/components/cart/lib/cart.context';
import { useDrawer } from '@/components/drawer-views/context';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import { useMe } from '@/data/user';
import { useModalAction } from '@/components/modal-views/context';

export default function CartButton({ className }: { className?: string }) {
  const isMounted = useIsMounted();
  const { openDrawer } = useDrawer();
  const { openModal } = useModalAction();
  const { isAuthorized } = useMe();
  const { totalItems } = useCart();
  const handleClick = () => {
    if (!isAuthorized) {
      openModal('LOGIN_VIEW');
      return;
    }
    openDrawer('CART_VIEW');
  };
  return (
    <Button
      variant="icon"
      aria-label="Cart"
      onClick={handleClick}
      className={className}
    >
      <span className="relative flex items-center">
        <CartIcon className="h-5 w-5 text-[#E0F316]" />
        <span className="absolute -top-3 -right-2.5 flex min-h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full border-2 border-orange-500 bg-brand px-0.5 text-10px font-bold leading-none text-orange-600 dark:border-orange-400">

          {isMounted && totalItems}
        </span>
      </span>
    </Button>
  );
}
