import React, { useState } from 'react';
import type { NextPageWithLayout } from '@/types';
import { useRouter } from 'next/router';
import routes from '@/config/routes';
import GeneralLayout from '@/layouts/_general-layout';
import CartItemList from '@/components/cart/cart-item-list';
import CartEmpty from '@/components/cart/cart-empty';
import Button from '@/components/ui/button';
import CInput from '@/components/ui/forms/input';
import CTextArea from '@/components/ui/forms/textarea';
import { useCart } from '@/components/cart/lib/cart.context';
import usePrice from '@/lib/hooks/use-price';
import Seo from '@/layouts/_seo';
import { LongArrowIcon } from '@/components/icons/long-arrow-icon';
import client from '@/data/client';
import { useMutation } from '@tanstack/react-query';
import CartCheckout from '@/components/cart/cart-checkout';
import { useMe } from '@/data/user';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { toast } from 'react-hot-toast';

const CheckoutPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { me } = useMe();
  const { t } = useTranslation('common');
  const {
    items,
    total,
    totalItems,
    isEmpty,
    setVerifiedResponse,
    verifiedResponse,
    resetCart, // функция очистки корзины
  } = useCart();
  const { price: totalPrice } = usePrice({
    amount: total,
  });
  const { mutate, isLoading } = useMutation(client.orders.verify, {
    onSuccess: (res) => {
      setVerifiedResponse(res);
    },
    onError: (error: any) => {
      const {
        response: { data },
      }: any = error ?? {};
      toast.error(data?.message);
    },
  });
  const [name, setName] = useState(me?.name || '');
  const [email, setEmail] = useState(me?.email || '');
  const [phone, setPhone] = useState(me?.profile?.contact || '');
  const [note, setNote] = useState('');

  function verify() {
    if (!name || !email || !phone) {
      toast.error('Заполните имя, email и телефон');
      return;
    }

    const customerContact = {
      name,
      email,
      phone,
      comment: note,
    };

    mutate({
      amount: total,
      products: items.map((item: any) => ({
        product_id: item.id,
        order_quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      })),
      shipping_address: customerContact,
      payment_gateway: 'yookassa',
    });
  }
  return (
    <>
      <Seo title="Checkout" description="Sancan.ru - вдохновляйся и покупай. Сервис авторских брендов." url={routes?.checkout} />
      <div className="mx-auto flex h-full w-full max-w-screen-sm flex-col p-4 pt-6 sm:p-5 sm:pt-8 md:pt-10 3xl:pt-12">
        {/* Форма с инпутами - ВСЕГДА отображается */}
        <form className="mb-4 bg-light shadow-card dark:bg-dark-250 dark:shadow-none md:mb-5 3xl:mb-6" onSubmit={e => e.preventDefault()}>
          <h2 className="flex items-center justify-between border-b border-light-400 px-5 py-4 text-sm font-medium text-dark dark:border-dark-400 dark:text-light sm:py-5 sm:px-7 md:text-base">
            {t('text-checkout-title')}
          </h2>
          <div className="px-5 py-4 sm:py-6 sm:px-7">
            <CInput label="Имя и Фамилия" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required />
          </div>
          <div className="px-5 py-4 sm:py-6 sm:px-7">
            <CInput label="Email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
          </div>
          <div className="px-5 py-4 sm:py-6 sm:px-7">
            <CInput label="Телефон" value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} required />
          </div>
          <div className="px-5 py-4 sm:py-6 sm:px-7">
            <CTextArea label="Комментарий к заказу" value={note} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)} />
          </div>
        </form>
        {/* Блок с товарами */}
        <div className="bg-light shadow-card dark:bg-dark-250 dark:shadow-none">
          <h2 className="flex items-center justify-between border-b border-light-400 px-5 py-4 text-sm font-medium text-dark dark:border-dark-400 dark:text-light sm:py-5 sm:px-7 md:text-base">
            {t('text-checkout-title-two')}
            <span className="font-normal text-dark-700">({totalItems})</span>
          </h2>
          <div className="px-5 pt-9 sm:px-7 sm:pt-11">
            {!isEmpty ? (
              <CartItemList className="pl-3" />
            ) : (
              <>
                <CartEmpty />
                <div className="sticky bottom-11 z-[5] mt-10 border-t border-light-400 bg-light pt-6 pb-7 dark:border-dark-400 dark:bg-dark-250 sm:bottom-0 sm:mt-12 sm:pt-8 sm:pb-9">
                  <Button
                    onClick={() => router.push(routes.home)}
                    className="w-full md:h-[50px] md:text-sm"
                  >
                    <LongArrowIcon className="h-4 w-4" />
                    {t('404-back-home')}
                  </Button>
                </div>
              </>
            )}

            {/* Кнопка "Проверить доступность" - всегда отображается если нет verifiedResponse */}
            {!Boolean(verifiedResponse) && (
              <div className="sticky bottom-11 z-[5] mt-10 border-t border-light-400 bg-light pt-6 pb-7 dark:border-dark-400 dark:bg-dark-250 sm:bottom-0 sm:mt-12 sm:pt-8 sm:pb-9">
                <div className="mb-6 flex flex-col gap-3 text-dark dark:text-light sm:mb-7">
                  <div className="flex justify-between">
                    <p>{t('text-subtotal')}</p>
                    <strong className="font-semibold">{totalPrice}</strong>
                  </div>
                  <div className="flex justify-between">
                    <p>{t('text-tax')}</p>
                    <strong className="font-semibold">
                      {t('text-calculated-checkout')}
                    </strong>
                  </div>
                </div>
                <Button
                  className="w-full md:h-[50px] md:text-sm"
                  onClick={verify}
                  isLoading={isLoading}
                >
                  {t('text-check-availability')}
                </Button>
              </div>
            )}
            {/* CartCheckout только после verifiedResponse */}
            {Boolean(verifiedResponse) && (
              <CartCheckout
                name={name}
                email={email}
                phone={phone}
                note={note}
                clearCart={resetCart}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

CheckoutPage.authorization = true;
CheckoutPage.getLayout = function getLayout(page: React.ReactNode) {
  return <GeneralLayout>{page}</GeneralLayout>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
    revalidate: 60, // In seconds
  };
};

export default CheckoutPage;