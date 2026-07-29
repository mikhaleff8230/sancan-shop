import { motion } from 'framer-motion';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import { MapPinIcon } from '@/components/icons/map-pin-icon';
import { InformationIcon } from '@/components/icons/information-icon';
import { useQuery } from '@tanstack/react-query';
import { useMe } from '@/data/user';
import { userAddressesApi } from '@/data/user-addresses';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import routes from '@/config/routes';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { useModalAction } from '@/components/modal-views/context';

dayjs.locale('ru');

interface ProductDeliveryBlockProps {
  product: any;
  className?: string;
}

interface DeliveryDate {
  courier?: string;
  pvz?: string;
}

export default function ProductDeliveryBlock({
  product,
  className = '',
}: ProductDeliveryBlockProps) {
  const router = useRouter();
  const { me } = useMe();
  const { openModal } = useModalAction();
  const [userCity, setUserCity] = useState<string>('');
  const [deliveryDates, setDeliveryDates] = useState<DeliveryDate>({});
  const [selectedPvz, setSelectedPvz] = useState<any>(null);

  const { data: addressesData } = useQuery(
    ['user-addresses', 'pvz'],
    () => userAddressesApi.getAddresses('pvz'),
    {
      enabled: !!me,
      staleTime: 5 * 60 * 1000,
    }
  );

  useEffect(() => {
    const getUserCity = async () => {
      try {
        if (addressesData?.data && addressesData.data.length > 0) {
          const defaultPvz = addressesData.data.find((addr) => addr.is_default) || addressesData.data[0];
          setSelectedPvz(defaultPvz);
          setUserCity(defaultPvz.city);
          return;
        }

        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
          const location = JSON.parse(savedLocation);
          setUserCity(location.city || 'Москва');
          return;
        }

        const geoResponse = await fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:8000'}/api/geo/location`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          setUserCity(geoData.city || 'Москва');
        } else {
          setUserCity('Москва');
        }
      } catch (error) {
        console.error('Error getting user city:', error);
        setUserCity('Москва');
      }
    };

    getUserCity();
  }, [addressesData]);

  const sellerCity = product?.shop?.address?.city || 'Москва';

  useEffect(() => {
    const calculateDeliveryDates = async () => {
      if (!userCity || !sellerCity) return;

      try {
        const requestBody = {
          from_city: sellerCity,
          to_city: userCity,
          weight: 1,
          length: 10,
          width: 10,
          height: 10,
        };

        const [courierResponse, pvzResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:8000'}/api/cdek/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...requestBody, tariff_code: 136 }),
          }),
          fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:8000'}/api/cdek/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...requestBody, tariff_code: 137 }),
          }),
        ]);

        if (courierResponse.ok) {
          const courierData = await courierResponse.json();
          if (courierData.period_min && courierData.period_max) {
            setDeliveryDates((prev) => ({
              ...prev,
              courier: `${dayjs().add(courierData.period_min, 'day').format('D MMMM')} - ${dayjs().add(courierData.period_max, 'day').format('D MMMM')}`,
            }));
          }
        }

        if (pvzResponse.ok) {
          const pvzData = await pvzResponse.json();
          if (pvzData.period_min && pvzData.period_max) {
            setDeliveryDates((prev) => ({
              ...prev,
              pvz: `${dayjs().add(pvzData.period_min, 'day').format('D MMMM')} - ${dayjs().add(pvzData.period_max, 'day').format('D MMMM')}`,
            }));
          }
        }
      } catch (error) {
        console.error('Error calculating delivery dates:', error);
        const tomorrow = dayjs().add(1, 'day').format('D MMMM');
        setDeliveryDates({ courier: tomorrow, pvz: tomorrow });
      }
    };

    calculateDeliveryDates();
  }, [userCity, sellerCity]);

  const displayAddress = selectedPvz
    ? selectedPvz.address || selectedPvz.name || 'ПВЗ СДЭК'
    : userCity
      ? `${userCity}, пункты СДЭК`
      : 'Выберите город';

  const handleChangeAddress = () => {
    if (!me) {
      localStorage.setItem('returnUrl', router.asPath);
      openModal('LOGIN_VIEW');
      return;
    }
    localStorage.setItem('returnUrl', router.asPath);
    router.push('/select-address');
  };

  return (
    <motion.div
      variants={fadeInBottom()}
      className={`sancan-ozon-card p-5 ${className}`}
    >
      <h3 className="mb-4 text-lg font-bold text-ozon-text">
        Доставка и возврат
      </h3>

      <button
        type="button"
        onClick={handleChangeAddress}
        className="mb-4 flex w-full items-start gap-3 rounded-2xl bg-[#f3f7fc] p-3 text-left transition hover:bg-[#edf4ff]"
      >
        <MapPinIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-ozon-muted" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-ozon-muted">
            {selectedPvz ? 'Пункт выдачи' : 'Город доставки'}
          </span>
          <span className="block break-words text-sm font-semibold text-ozon-text">
            {displayAddress}
          </span>
          <span className="mt-1 block text-xs font-semibold text-ozon-blue">
            Изменить
          </span>
        </span>
        <span className="text-ozon-muted">›</span>
      </button>

      <div className="space-y-3">
        {[
          ['Курьером СДЭК', deliveryDates.courier],
          ['Пункты выдачи и постаматы', deliveryDates.pvz],
        ].map(([label, date]) => (
          <div key={label} className="flex items-start justify-between gap-3 border-b border-ozon-border pb-3 last:border-b-0">
            <div>
              <div className="text-sm font-semibold text-ozon-text">{label}</div>
              <div className="mt-0.5 text-xs text-ozon-muted">{date || 'Расчет даты...'}</div>
            </div>
            <span className="shrink-0 rounded-lg bg-[#f1f5f9] px-2 py-1 text-xs font-bold text-ozon-text">
              Без доплат
            </span>
          </div>
        ))}
      </div>

      <Link
        href={routes.return || '/help/return'}
        className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f3f7fc] px-3 py-3 text-sm font-semibold text-ozon-text transition hover:text-ozon-blue"
      >
        <InformationIcon className="h-5 w-5 text-ozon-muted" />
        Можно вернуть в течение 21 дня
        <span className="ml-auto text-ozon-muted">›</span>
      </Link>
    </motion.div>
  );
}
