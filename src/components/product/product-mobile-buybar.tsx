import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { isFree } from '@/lib/is-free';
import type { Product } from '@/types';
import Button from '@/components/ui/button';
import { useCart } from '@/components/cart/lib/cart.context';
import { generateCartItem } from '@/components/cart/lib/generate-cart-item';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/data/client';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import usePrice from '@/lib/hooks/use-price';

interface Props {
  product: Product;
}

export default function ProductMobileBuyBar({ product }: Props) {
  const { t } = useTranslation('common');
  const { addItemToCart, updateCartLanguage, language, isInStock } = useCart();
  const [addToCartLoader, setAddToCartLoader] = useState(false);
  const queryClient = useQueryClient();
  const isFreeItem = isFree(product?.sale_price ?? product?.price);
  const { price, basePrice } = usePrice({
    amount: product.sale_price ? product.sale_price : product.price,
    baseAmount: product.price,
  });

  const { mutate: downloadProduct, isLoading: isDownloading } = useMutation(
    client.products.download,
    {
      onSuccess: (data) => {
        const a = document.createElement('a');
        a.href = data;
        a.setAttribute('download', product.name);
        a.click();
      },
      onSettled: () => {
        queryClient.invalidateQueries([API_ENDPOINTS.PRODUCTS, product.slug]);
      },
    }
  );

  function handleAddToCart() {
    setAddToCartLoader(true);
    setTimeout(() => {
      setAddToCartLoader(false);
      if (product?.language !== language) {
        updateCartLanguage(product?.language);
      }
      addItemToCart(generateCartItem(product), 1);
      toast.success(<b>{t('text-add-to-cart-message')}</b>);
    }, 650);
  }

  function handleFreeDownload() {
    downloadProduct({ product_id: product.id.toString() });
  }

  const isLoading = addToCartLoader || isDownloading;
  const disabled = isInStock(product?.id);

  return (
    <div className="fixed bottom-[56px] left-0 right-0 z-40 border-t border-ozon-border bg-white/95 shadow-[0_-10px_28px_rgba(23,33,43,0.12)] backdrop-blur-sm xs:bottom-[72px] sm:bottom-0 lg:hidden">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="sancan-ozon-price truncate text-xl font-extrabold">
            {isFreeItem ? t('text-free') : price}
          </div>
          {!isFreeItem && basePrice && basePrice !== price ? (
            <div className="truncate text-xs font-semibold text-ozon-muted line-through">
              {basePrice}
            </div>
          ) : null}
        </div>

        {product.is_external ? (
          <Link
            href={product.external_product_url}
            target="_blank"
            className="sancan-ozon-button flex min-w-[150px] items-center justify-center px-4 py-3 text-base font-bold leading-6"
          >
            В корзину
          </Link>
        ) : !isFreeItem ? (
          <Button
            onClick={handleAddToCart}
            isLoading={isLoading}
            disabled={disabled}
            className="sancan-ozon-button min-w-[150px] px-4 py-3 text-base font-bold leading-6"
          >
            В корзину
          </Button>
        ) : (
          <Button
            onClick={handleFreeDownload}
            isLoading={isLoading}
            disabled={disabled}
            className="sancan-ozon-button min-w-[150px] px-4 py-3 text-base font-bold leading-6"
          >
            Скачать
          </Button>
        )}
      </div>
    </div>
  );
}
