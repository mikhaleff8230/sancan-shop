import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import { ShoppingCartIcon } from '@/components/icons/shopping-cart-icon';
import { isFree } from '@/lib/is-free';
import usePrice from '@/lib/hooks/use-price';
import type { Product } from '@/types';
import AddToCart from '@/components/cart/add-to-cart';
import FreeDownloadButton from '@/components/product/free-download-button';
import FavoriteButton from '@/components/favorite/favorite-button';
import Link from 'next/link';

interface ProductPriceBlockProps {
  product: Product;
  price?: number;
  sale_price?: number | null;
  className?: string;
}

function parseCurrency(value?: string) {
  if (!value) return 0;
  return Number(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
}

export default function ProductPriceBlock({
  product,
  className = '',
}: ProductPriceBlockProps) {
  const { t } = useTranslation('common');
  const { price, basePrice } = usePrice({
    amount: product.sale_price ? product.sale_price : product.price,
    baseAmount: product.price,
  });
  const isFreeItem = isFree(product?.sale_price ?? product?.price);
  const currentPrice = parseCurrency(price);
  const oldPrice = parseCurrency(basePrice);
  const discount = oldPrice > currentPrice && currentPrice > 0
    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
    : 0;

  return (
    <motion.div
      variants={fadeInBottom()}
      className={`sancan-ozon-card overflow-hidden p-5 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-pink-100 bg-pink-50 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ozon-pink text-sm font-bold text-white">
            %
          </span>
          <div>
            <div className="text-sm font-bold text-ozon-text">Распродажа</div>
            <div className="text-xs text-ozon-muted">Предложение продавца</div>
          </div>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ozon-text">
          Сегодня
        </span>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap items-end gap-2">
          <span className="sancan-ozon-price text-3xl font-extrabold leading-none">
            {isFreeItem ? t('text-free') : price}
          </span>
          {!isFreeItem && basePrice && basePrice !== price ? (
            <span className="text-lg font-semibold text-ozon-muted line-through">
              {basePrice}
            </span>
          ) : null}
        </div>
        {discount > 0 ? (
          <div className="mt-1 text-sm font-semibold text-emerald-600">
            Скидка {discount}%
          </div>
        ) : null}
      </div>

      <div className="sancan-ozon-trust-note mb-4 px-3 py-2.5">
        Оплата товара идет напрямую продавцу. SANCAN не принимает платеж за товар
        и помогает организовать сделку, общение и подтверждения.
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <button className="rounded-xl bg-[#f1f5fb] px-3 py-2.5 font-semibold text-ozon-text">
          Купить сейчас
        </button>
        <button className="rounded-xl bg-[#f1f5fb] px-3 py-2.5 font-semibold text-ozon-text">
          Хочу скидку
        </button>
      </div>

      <div className="flex items-center gap-2">
        {product.is_external ? (
          <Link
            href={product.external_product_url}
            target="_blank"
            className="sancan-ozon-button flex flex-1 items-center justify-center gap-2 px-6 py-3 text-base font-bold leading-6"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            {product.external_product_button_text || 'В корзину'}
          </Link>
        ) : !isFreeItem ? (
          <AddToCart
            item={product}
            withPrice={false}
            className="sancan-ozon-button flex flex-1 items-center justify-center gap-2 px-6 py-3 text-base font-bold leading-6"
          />
        ) : (
          <FreeDownloadButton
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            className="sancan-ozon-button flex flex-1 items-center justify-center gap-2 px-6 py-3 text-base font-bold leading-6"
          />
        )}
        <FavoriteButton
          productId={product.id}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-ozon-blue transition-colors hover:text-ozon-pink"
        />
      </div>

      {product.shop?.name ? (
        <div className="mt-5 rounded-2xl border border-ozon-border bg-white px-4 py-3">
          <div className="mb-2 text-sm font-bold text-ozon-text">Магазин</div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef3f8] text-base font-bold text-ozon-text">
              {product.shop.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-ozon-text">
                {product.shop.name}
              </div>
              <div className="text-xs text-ozon-muted">Перейти в магазин</div>
            </div>
            {product.ratings ? (
              <div className="rounded-xl bg-[#f4f7fb] px-2.5 py-1 text-xs font-bold text-ozon-text">
                ★ {Number(product.ratings).toFixed(1)}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {product.preview_url ? (
        <Link
          href={product.preview_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-between rounded-2xl border border-ozon-border bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-ozon-text transition hover:border-ozon-blue hover:text-ozon-blue"
        >
          Смотреть во внешнем магазине
          <span>→</span>
        </Link>
      ) : null}
    </motion.div>
  );
}
