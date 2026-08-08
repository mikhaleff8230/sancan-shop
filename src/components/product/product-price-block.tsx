import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import client from '@/data/client';
import toast from 'react-hot-toast';
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
  const router = useRouter();
  const [paymentChoiceOpen, setPaymentChoiceOpen] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [commissionRate, setCommissionRate] = useState(0);
  const [sitePaymentPrice, setSitePaymentPrice] = useState(0);
  const [directSbpAvailable, setDirectSbpAvailable] = useState(false);
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
  const isSecondLife = Boolean((product as any).is_personal_item);
  const sitePrice = sitePaymentPrice || currentPrice;
  const formatRub = (value: number) => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';

  useEffect(() => {
    if (!isSecondLife) return;
    client.secondLife.paymentOptions(product.id).then((options:any) => {
      setDirectSbpAvailable(Boolean(options?.direct_sbp?.available));
      setCommissionRate(Number(options?.site_payment?.commission_rate || 0));
      setSitePaymentPrice(Number(options?.site_payment?.price || currentPrice));
    }).catch(() => { setDirectSbpAvailable(false); setSitePaymentPrice(currentPrice); });
  }, [product.id, isSecondLife, currentPrice]);

  async function startDirectSbp() {
    setCreatingOrder(true);
    try {
      const response = await client.secondLife.createOrder(product.id);
      const publicId = response?.order?.public_id;
      if (!publicId) throw new Error('Заказ не создан');
      await router.push(`/second-life/orders/${publicId}/payment`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.response?.data?.errors?.payment_profile?.[0] || 'Не удалось создать заказ СБП');
    } finally { setCreatingOrder(false); }
  }
  async function openPaymentChoice() {
    setPaymentChoiceOpen(true);
    try {
      const options = await client.secondLife.paymentOptions(product.id);
      setCommissionRate(Number(options?.site_payment?.commission_rate || 0));
      setSitePaymentPrice(Number(options?.site_payment?.price || currentPrice));
    } catch { setCommissionRate(0); setSitePaymentPrice(currentPrice); }
  }

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

      {isSecondLife && directSbpAvailable ? <div className="group relative mb-4">
        <button type="button" disabled={creatingOrder} onClick={startDirectSbp} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#f1f5fb] px-4 py-3 font-extrabold text-ozon-text transition hover:bg-[#e7eef8]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-600 to-fuchsia-500 text-[10px] font-black text-white">СБП</span>
          {creatingOrder?'Создаём заказ…':'Оплата СБП'}
        </button>
        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-[290px] -translate-x-1/2 rounded-xl bg-ozon-text p-3 text-xs leading-5 text-white shadow-xl group-hover:block">Оплата идёт напрямую продавцу. SANCAN не принимает платёж, но помогает организовать сделку, общение и подтверждение.</div>
      </div>:null}

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
        ) : !isFreeItem && isSecondLife ? (
          <AddToCart item={{...product, price: sitePrice, sale_price: null, payment_method: 'site_payment'} as Product} withPrice={false} className="sancan-ozon-button flex flex-1 items-center justify-center gap-2 px-6 py-3 text-base font-bold leading-6">
            <ShoppingCartIcon className="h-5 w-5" />
            Добавить в корзину
          </AddToCart>
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
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf2ff] text-ozon-blue transition-colors hover:text-ozon-pink"
        />
      </div>

      {product.shop?.name ? (
        <Link href={`/shops/${product.shop.slug}`} className="mt-5 block rounded-2xl border border-ozon-border bg-white px-4 py-3 transition hover:border-ozon-blue hover:shadow-sm">
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
        </Link>
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
      {paymentChoiceOpen ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4" onClick={() => setPaymentChoiceOpen(false)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-2xl font-black text-ozon-text">Как оплатить?</h2>
            <p className="mt-2 text-sm text-ozon-muted">Два независимых варианта оплаты с разной итоговой стоимостью.</p>
            <div className="mt-5 grid gap-3">
              <button type="button" disabled={creatingOrder} onClick={startDirectSbp} className="rounded-2xl border-2 border-brand bg-brand-50 p-5 text-left transition hover:bg-brand-100 disabled:opacity-50">
                <span className="block text-base font-black text-brand">Напрямую продавцу по СБП</span>
                <span className="mt-1 block text-2xl font-black text-ozon-text">{formatRub(currentPrice)}</span>
                <span className="mt-2 block text-sm text-ozon-muted">Перевод физлицу. SANCAN не принимает деньги за товар.</span>
              </button>
              <div className="rounded-2xl border border-ozon-border p-5 text-left transition hover:border-brand">
                <span className="block text-base font-black text-ozon-text">Оплата на сайте</span>
                <span className="mt-1 block text-2xl font-black text-ozon-text">{formatRub(sitePrice)}</span>
                <span className="mt-2 block text-sm text-ozon-muted">Цена товара + комиссия магазина {commissionRate}%.</span>
                <span className="mt-3 block text-sm font-bold text-brand">Через существующий checkout и оплату сайта</span>
                <AddToCart item={{...product, price: sitePrice, sale_price: null, payment_method: 'site_payment'} as Product} withPrice={false} className="mt-4 flex w-full items-center justify-center rounded-xl bg-ozon-pink px-5 py-3 font-black text-white" />
              </div>
            </div>
            <button type="button" onClick={() => setPaymentChoiceOpen(false)} className="mt-4 w-full rounded-xl bg-light-200 px-4 py-3 font-bold">Закрыть</button>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
