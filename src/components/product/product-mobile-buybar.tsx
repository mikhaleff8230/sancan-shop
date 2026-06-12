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

interface Props {
  product: Product;
}

export default function ProductMobileBuyBar({ product }: Props) {
  const { t } = useTranslation('common');
  const { addItemToCart, updateCartLanguage, language, isInStock } = useCart();
  const [addToCartLoader, setAddToCartLoader] = useState(false);
  const queryClient = useQueryClient();
  const isFreeItem = isFree(product?.sale_price ?? product?.price);

  const { mutate: downloadProduct, isLoading: isDownloading } = useMutation(
    client.products.download,
    {
      onSuccess: (data) => {
        function download(fileUrl: string, fileName: string) {
          var a = document.createElement('a');
          a.href = fileUrl;
          a.setAttribute('download', fileName);
          a.click();
        }
        download(data, product.name);
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
    <div className="fixed bottom-[56px] left-0 right-0 z-40 border-t border-ozon-border bg-white/95 backdrop-blur-sm xs:bottom-[72px] sm:bottom-0 lg:hidden">
      <div className="mx-auto max-w-[1440px] px-4 py-3">
        {product.is_external ? (
          <Link
            href={product.external_product_url}
            target="_blank"
            className="sancan-ozon-button flex w-full items-center justify-center px-4 py-3 text-base font-semibold leading-6"
          >
            В корзину
          </Link>
        ) : !isFreeItem ? (
          <Button
            onClick={handleAddToCart}
            isLoading={isLoading}
            disabled={disabled}
            className="sancan-ozon-button w-full px-4 py-3 text-base font-semibold leading-6"
          >
            В корзину
          </Button>
        ) : (
          <Button
            onClick={handleFreeDownload}
            isLoading={isLoading}
            disabled={disabled}
            className="sancan-ozon-button w-full px-4 py-3 text-base font-semibold leading-6"
          >
            В корзину
          </Button>
        )}
      </div>
    </div>
  );
}