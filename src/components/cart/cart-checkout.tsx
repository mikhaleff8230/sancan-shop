import * as React from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import usePrice from '@/lib/hooks/use-price';
import Button from '@/components/ui/button';
import { useCart } from '@/components/cart/lib/cart.context';
import {
  calculatePaidTotal,
  calculateTotal,
} from '@/components/cart/lib/cart.utils';
import CartWallet from '@/components/cart/cart-wallet';
import routes from '@/config/routes';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

interface CartCheckoutProps {
  name: string;
  email: string;
  phone: string;
  note: string;
  clearCart: () => void;
}

export default function CartCheckout({ name, email, phone, note, clearCart }: CartCheckoutProps) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { items, verifiedResponse } = useCart();

  const available_items = items.filter(
    (item) =>
      !verifiedResponse?.unavailable_products?.includes(item.id.toString())
  );

  // Calculate price
  const { price: tax } = usePrice(
    verifiedResponse && {
      amount: verifiedResponse.total_tax ?? 0,
    }
  );

  const base_amount = calculateTotal(available_items);

  const { price: sub_total } = usePrice(
    verifiedResponse && {
      amount: base_amount,
    }
  );

  const totalPrice = verifiedResponse
    ? calculatePaidTotal(
        {
          totalAmount: base_amount,
          tax: verifiedResponse.total_tax,
          shipping_charge: verifiedResponse.shipping_charge,
        },
        0
      )
    : 0;

  const { price: total } = usePrice(
    verifiedResponse && {
      amount: totalPrice,
    }
  );

  const [loading, setLoading] = useState(false);

  async function createOrder() {
    if (!email || !name || !phone) {
      toast.error('Пожалуйста, заполните все поля!');
      return;
    }

    setLoading(true);
    const amount = calculateTotal(items);

    const customerContact = {
      name,
      email,
      phone,
      comment: note,
    };

    const orderPayload: any = {
      amount,
      products: items.map((item: any) => ({
        product_id: item.id,
        order_quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      })),
      shipping_address: customerContact,
      payment_gateway: 'yookassa',
      language: 'ru',
    };

    try {
      const endpoint = 'https://api.sancan.ru/api/custom-yookassa-order';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      let data: any = {};
      const text = await res.text();

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        toast.error('Бэкенд вернул некорректный ответ.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        toast.error(`Ошибка создания заказа (${res.status}): ${data.message || text}`);
        setLoading(false);
        return;
      }

      setLoading(false);

      if (data && data.confirmation_token) {
        localStorage.setItem('yookassa_order', JSON.stringify(data));
        toast.success('Заказ создан! Загружаем форму оплаты...');
        clearCart();
        setTimeout(() => {
          router.push('/payment/yookassa');
        }, 500);
      } else if (data && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast.success('Заказ создан! Проверьте email.');
        clearCart();
        router.push(routes.purchases);
      }
    } catch (_err) {
      setLoading(false);
      toast.error('Ошибка соединения с сервером.');
    }
  }

  return (
    <div className="mt-10 border-t border-light-400 bg-light pt-6 pb-7 dark:border-dark-400 dark:bg-dark-250 sm:bottom-0 sm:mt-12 sm:pt-8 sm:pb-9">
      <div className="mb-6 flex flex-col gap-3 text-dark dark:text-light sm:mb-7">
        <div className="flex justify-between">
          <p>{t('text-subtotal')}</p>
          <strong className="font-semibold">{sub_total}</strong>
        </div>
        <div className="flex justify-between">
          <p>{t('text-tax')}</p>
          <strong className="font-semibold">{tax}</strong>
        </div>
        <div className="mt-4 flex justify-between border-t border-light-400 pt-5 dark:border-dark-400">
          <p>{t('text-total')}</p>
          <strong className="font-semibold">{total}</strong>
        </div>
      </div>

      {verifiedResponse && (
        <CartWallet
          totalPrice={totalPrice}
          walletAmount={verifiedResponse.wallet_amount}
          walletCurrency={verifiedResponse.wallet_currency}
        />
      )}

      <Button
        disabled={loading}
        isLoading={loading}
        onClick={createOrder}
        className="w-full md:h-[50px] md:text-base mt-6 bg-brand hover:bg-brand-700 text-white font-bold rounded-xl"
      >
        Оплатить онлайн
      </Button>
    </div>
  );
}
