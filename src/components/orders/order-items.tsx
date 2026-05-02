import { Table } from '@/components/ui/table';
import usePrice from '@/lib/hooks/use-price';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/lib/locals';
import Image from '@/components/ui/image';
import { productPlaceholder } from '@/lib/placeholders';
// import { useModalAction } from '@/components/ui/modal/modal.context';
import { useModalAction } from '@/components/modal-views/context';
import Link from '@/components/ui/link';
// import { Routes } from '@/config/routes';
import routes from '@/config/routes';
import { getReview } from '@/lib/get-reviews';
import Button from '@/components/ui/button';
import { OrderStatus, PaymentStatus } from '@/types';
import { useMutation } from '@tanstack/react-query';
import client from '@/data/client';
import { DownloadIcon } from '@/components/icons/download-icon';
import toast from 'react-hot-toast';

function isPaymentSuccessful(status?: string, orderStatus?: string): boolean {
  if (!status) return false;
  const normalized = String(status).toLowerCase().trim();
  const normalizedOrder = String(orderStatus ?? '').toLowerCase().trim();
  return (
    normalized === PaymentStatus.SUCCESS ||
    normalized === 'success' ||
    normalized === 'paid' ||
    normalizedOrder === OrderStatus.COMPLETED
  );
}

function getDigitalFileDisplayName(record: any): string {
  const fileName =
    record?.digital_file?.file_name ||
    record?.digital_file?.name ||
    record?.digital_file_name;

  if (typeof fileName === 'string' && fileName.trim()) {
    return fileName;
  }

  const rawUrl =
    record?.digital_file?.url ||
    record?.digital_file?.original ||
    record?.digital_file?.thumbnail;
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  try {
    const clean = decodeURIComponent(rawUrl.split('?')[0]);
    return clean.substring(clean.lastIndexOf('/') + 1);
  } catch {
    const clean = rawUrl.split('?')[0];
    return clean.substring(clean.lastIndexOf('/') + 1);
  }
}

function productAccessLabel(type?: string): string {
  switch (type) {
    case 'file':
      return 'Скачать';
    case 'prompt':
      return 'Промпт';
    case 'link':
      return 'Ссылка';
    case 'account':
      return 'Доступ';
    case 'subscription':
      return 'Подписка';
    case 'key':
      return 'Ключ';
    default:
      return 'Доступ';
  }
}

//FIXME: need to fix this usePrice hooks issue within the table render we may check with nested property
const OrderItemList = (_: any, record: any) => {
  const { price } = usePrice({
    amount: record.pivot?.unit_price,
  });
  let name = record.name;
  if (record?.pivot?.variation_option_id) {
    const variationTitle = record?.variation_options?.find(
      (vo: any) => vo?.id === record?.pivot?.variation_option_id
    )['title'];
    name = `${name} - ${variationTitle}`;
  }
  return (
    <div className="flex items-center">
      <div className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded">
        <Image
          src={record.image?.thumbnail ?? productPlaceholder}
          alt={name}
          className="h-full w-full object-cover"
          fill
        />
      </div>

      <div className="flex flex-col overflow-hidden ltr:ml-4 rtl:mr-4">
        <div className="mb-1 flex space-x-1 rtl:space-x-reverse">
          <Link
            href={routes.product(record?.slug)}
            className="text-body hover:text-accent inline-block overflow-hidden truncate text-sm transition-colors hover:underline"
            locale={record?.language}
          >
            {name}
          </Link>
          <span className="text-body inline-block overflow-hidden truncate text-sm">
            x
          </span>
          <span className="text-heading inline-block overflow-hidden truncate text-sm font-semibold">
            {record.unit}
          </span>
        </div>
        <span className="text-accent mb-1 inline-block overflow-hidden truncate text-sm font-semibold">
          {price}
        </span>
        {getDigitalFileDisplayName(record) && (
          <span className="text-xs text-body truncate">
            Файл: {getDigitalFileDisplayName(record)}
          </span>
        )}
      </div>
    </div>
  );
};
export const OrderItems = ({
  products,
  orderId,
  trackingNumber,
  buyerEmail,
  status,
  orderStatus,
}: {
  products: any;
  orderId: any;
  trackingNumber?: string;
  buyerEmail?: string;
  status: PaymentStatus;
  orderStatus?: OrderStatus | string;
}) => {
  const { t } = useTranslation('common');
  const { alignLeft } = useIsRTL();
  const { openModal } = useModalAction();

  const getStatus = isPaymentSuccessful(status, orderStatus);

  const { mutate: requestProductAccess } = useMutation(
    ({
      productId,
      productType,
      fileName,
    }: {
      productId: string | number;
      productType?: string;
      fileName: string;
    }) =>
      client.products.access(productId, {
        tracking_number: trackingNumber,
        ...(buyerEmail ? { email: buyerEmail } : {}),
      }),
    {
      onSuccess: (response, variables) => {
        const type = response?.type || variables.productType || 'file';
        const payload = response?.payload ?? {};

        if (type === 'file' && payload?.download_url) {
          const a = document.createElement('a');
          a.href = payload.download_url;
          a.setAttribute('download', variables.fileName || 'digital-file');
          a.click();
          return;
        }

        if (type === 'link' && payload?.external_url) {
          window.open(payload.external_url, '_blank', 'noopener,noreferrer');
          return;
        }

        if (type === 'prompt' && payload?.prompt_text) {
          navigator.clipboard
            .writeText(payload.prompt_text)
            .then(() => toast.success('Промпт скопирован в буфер обмена'))
            .catch(() => toast('Промпт получен, но не удалось скопировать автоматически'));
          return;
        }

        if (type === 'account' || type === 'subscription' || type === 'key') {
          let text: string;
          if (type === 'key') {
            text =
              payload?.license_key != null
                ? String(payload.license_key)
                : JSON.stringify(payload?.key_data ?? {}, null, 2);
          } else if (type === 'subscription') {
            text = payload?.expires_at
              ? JSON.stringify(
                  {
                    expires_at: payload.expires_at,
                    subscription_data: payload.subscription_data,
                  },
                  null,
                  2
                )
              : JSON.stringify(payload?.subscription_data ?? {}, null, 2);
          } else {
            text = JSON.stringify(payload?.account_data ?? {}, null, 2);
          }
          navigator.clipboard
            .writeText(text)
            .then(() => toast.success('Данные доступа скопированы в буфер обмена'))
            .catch(() => toast('Данные доступа получены'));
        }
      },
      onError: () => {
        toast.error('Доступ к этому товару недоступен.');
      },
    }
  );

  const openReviewModal = (record: any) => {
    openModal('REVIEW_RATING', {
      product_id: record.id,
      shop_id: record.shop_id,
      order_id: orderId,
      name: record.name,
      image: record.image,
      my_review: getReview(record?.my_review, record?.order_id),
      ...(record.pivot?.variation_option_id && {
        variation_option_id: record.pivot?.variation_option_id,
      }),
    });
  };

  const orderTableColumns = [
    {
      title: <span className="ltr:pl-20 rtl:pr-20">{t('text-item')}</span>,
      dataIndex: '',
      key: 'items',
      align: alignLeft,
      width: 250,
      ellipsis: true,
      render: OrderItemList,
    },
    {
      title: t('text-quantity'),
      dataIndex: 'pivot',
      key: 'pivot',
      align: 'center',
      width: 100,
      render: function renderQuantity(pivot: any) {
        return <p className="text-base">{pivot.order_quantity}</p>;
      },
    },
    {
      title: ' ',
      dataIndex: '',
      align: alignLeft,
      width: 250,
      render: function RenderReview(_: any, record: any) {
        const productType = record?.digital_product_type || 'file';
        const productIdForAccess = record?.pivot?.product_id || record?.id;
        const canDownload = getStatus && Boolean(productIdForAccess);

        return (
          <div className="flex items-center justify-end gap-4">
            <button
              className={`flex shrink-0 items-center font-semibold text-brand transition-all duration-200 hover:bg-brand hover:text-white sm:h-12 sm:rounded sm:border sm:border-light-500 sm:bg-transparent sm:py-3 sm:px-5 sm:dark:border-dark-600 ${
                getStatus
                  ? ''
                  : 'pointer-events-none cursor-not-allowed opacity-70'
              }`}
              onClick={() => (getStatus ? openReviewModal(record) : null)}
              disabled={getStatus ? false : true}
            >
              {getReview(record?.my_review, record?.order_id)
                ? t('text-update-review')
                : t('text-write-review')}
            </button>
            <Button
              onClick={() =>
                canDownload
                  ? requestProductAccess({
                      productId: productIdForAccess,
                      productType,
                      fileName: record?.name || 'digital-file',
                    })
                  : null
              }
              disabled={!canDownload}
              className="shrink-0"
            >
              <DownloadIcon className="h-auto w-4" />
              {productAccessLabel(productType)}
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <Table
      //@ts-ignore
      columns={orderTableColumns}
      data={products}
      rowKey={(record: any) =>
        record.pivot?.variation_option_id
          ? record.pivot.variation_option_id
          : record.created_at
      }
      className="orderDetailsTable w-full"
      rowClassName="!cursor-auto"
      scroll={{ x: 750 }}
    />
  );
};
