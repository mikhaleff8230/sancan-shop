import { useMemo, useState } from 'react';
import cn from 'classnames';
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  ShieldCheck,
  Star,
  Truck,
  UploadCloud,
  UserCheck,
} from 'lucide-react';
import Button from '@/components/ui/button';

type OrderStepStatus = 'done' | 'active' | 'pending';

type OrderStep = {
  label: string;
  status: OrderStepStatus;
};

type ChatMessage = {
  id: number;
  type: 'system' | 'buyer' | 'seller';
  author?: string;
  text: string;
  time: string;
};

const orderSteps: OrderStep[] = [
  { label: 'Заказ создан', status: 'done' },
  { label: 'Ожидание оплаты', status: 'done' },
  { label: 'Оплата отправлена', status: 'active' },
  { label: 'Подтверждение продавца', status: 'pending' },
  { label: 'Отправка товара', status: 'pending' },
  { label: 'Сделка завершена', status: 'pending' },
];

const chatMessages: ChatMessage[] = [
  {
    id: 1,
    type: 'system',
    text: 'Заказ создан. Товар зарезервирован за покупателем.',
    time: '12:10',
  },
  {
    id: 2,
    type: 'seller',
    author: 'Александр',
    text: 'Здравствуйте! Товар в наличии, отправлю сегодня после подтверждения оплаты.',
    time: '12:12',
  },
  {
    id: 3,
    type: 'system',
    text: 'Покупатель отметил оплату.',
    time: '12:18',
  },
];

const trustItems = [
  { icon: Phone, label: 'Телефон', checked: true },
  { icon: Mail, label: 'Email', checked: true },
  { icon: UserCheck, label: 'Лицо', checked: true },
  { icon: FileText, label: 'Паспорт', checked: true },
];

const quickActions = [
  { icon: Copy, label: 'Скопировать телефон' },
  { icon: Copy, label: 'Скопировать реквизиты' },
  { icon: ExternalLink, label: 'Открыть банк' },
  { icon: Download, label: 'Скачать QR' },
];

function Card({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-[#e8edf6] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]',
        className
      )}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon?: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#005bff]">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <div>
        <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm leading-5 text-[#64748b]">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function ProductSummary() {
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#dbeafe] via-white to-[#ffe4ef] sm:h-32 sm:w-32">
          <div className="absolute inset-3 rounded-2xl bg-white/70" />
          <div className="absolute left-5 top-5 h-16 w-16 rounded-full bg-[#005bff]/15" />
          <div className="absolute bottom-4 right-3 h-12 w-12 rounded-2xl bg-[#f91155]/20" />
          <Camera className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-[#005bff]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-xs font-semibold text-[#005bff]">
              Зарезервировано
            </span>
            <span className="rounded-full bg-[#f8fafc] px-2.5 py-1 text-xs font-medium text-[#64748b]">
              Отличное состояние
            </span>
          </div>
          <h1 className="mt-3 text-xl font-semibold leading-tight text-[#111827] sm:text-2xl">
            Камера видеонаблюдения Tiandy TC-C321N
          </h1>
          <p className="mt-2 text-sm leading-5 text-[#64748b]">
            Комплект с коробкой, проверена перед продажей. Продавец отправляет из Москвы.
          </p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
                Цена товара
              </p>
              <p className="text-2xl font-bold text-[#f91155]">11 540 ₽</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-[#f8fafc] px-3 py-2 text-sm font-medium text-[#475569] sm:flex">
              <MapPin className="h-4 w-4 text-[#005bff]" />
              Москва
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SellerTrustPanel() {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <SectionTitle
          icon={ShieldCheck}
          title="Продавец и доверие"
          subtitle="Перед переводом проверьте профиль и подтверждения продавца."
        />
        <span className="hidden rounded-full bg-[#ecfdf5] px-3 py-1 text-sm font-semibold text-[#047857] sm:inline-flex">
          Верифицирован
        </span>
      </div>
      <div className="mt-5 flex items-center gap-4 rounded-2xl bg-[#f8fafc] p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#005bff] to-[#6d5dfc] text-lg font-bold text-white">
          А
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[#111827]">Александр Петров</p>
            <BadgeCheck className="h-5 w-5 text-[#005bff]" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[#64748b]">
            <span className="inline-flex items-center gap-1 font-medium text-[#111827]">
              <Star className="h-4 w-4 fill-[#ffb020] text-[#ffb020]" />
              4.9
            </span>
            <span>128 завершенных сделок</span>
            <span>на SANCAN с 2024</span>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {trustItems.map(({ icon: Icon, label, checked }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-2xl border border-[#e8edf6] bg-white px-3 py-3"
          >
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                checked ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-[#f1f5f9] text-[#94a3b8]'
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-[#94a3b8]">Подтверждено</p>
              <p className="text-sm font-semibold text-[#111827]">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DirectPaymentWarning() {
  return (
    <div className="rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-4 text-[#1e3a8a] sm:p-5">
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#005bff]" />
        <div>
          <h3 className="font-semibold">Оплата напрямую продавцу</h3>
          <p className="mt-2 text-sm leading-6">
            Вы переводите деньги напрямую продавцу. SANCAN не принимает оплату за товар
            и не является стороной платежа. Перед переводом проверьте описание товара,
            рейтинг продавца и условия доставки.
          </p>
        </div>
      </div>
    </div>
  );
}

function QrArtwork() {
  return (
    <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-[28px] border border-[#dbeafe] bg-white p-4 shadow-inner sm:h-56 sm:w-56">
      <div className="grid h-full w-full grid-cols-5 grid-rows-5 gap-2">
        {Array.from({ length: 25 }).map((_, index) => {
          const isStrong = [0, 1, 3, 4, 5, 9, 15, 19, 20, 21, 23, 24, 12, 17].includes(index);
          return (
            <span
              key={index}
              className={cn(
                'rounded-md',
                isStrong ? 'bg-[#111827]' : index % 3 === 0 ? 'bg-[#005bff]' : 'bg-[#e2e8f0]'
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

function PaymentProfileCard({
  compact = false,
  onPaid,
}: {
  compact?: boolean;
  onPaid: () => void;
}) {
  return (
    <Card className={cn('overflow-hidden', compact ? '' : 'lg:sticky lg:top-24')}>
      <div className="bg-gradient-to-br from-[#005bff] via-[#1d4ed8] to-[#0f172a] p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white/75">Оплата по СБП</p>
            <h2 className="mt-1 text-xl font-semibold">Напрямую продавцу</h2>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <QrCode className="h-6 w-6" />
          </span>
        </div>
        <div className="mt-5">
          <QrArtwork />
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-3">
          {[
            ['Получатель', 'Александр Петров'],
            ['Банк', 'Т-Банк'],
            ['Телефон СБП', '+7 999 123-45-67'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3"
            >
              <span className="text-sm text-[#64748b]">{label}</span>
              <span className="text-right text-sm font-semibold text-[#111827]">{value}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {quickActions.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#e8edf6] bg-white px-3 text-sm font-semibold text-[#334155] transition hover:border-[#005bff] hover:text-[#005bff]"
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <Button
          className="h-14 w-full rounded-2xl bg-[#005bff] text-base shadow-[0_12px_30px_rgba(0,91,255,0.28)] hover:bg-[#004ad6]"
          onClick={onPaid}
        >
          Я оплатил
        </Button>
        <p className="text-center text-xs leading-5 text-[#64748b]">
          После перевода нажмите кнопку и приложите подтверждение оплаты.
        </p>
      </div>
    </Card>
  );
}

function DeliveryPanel() {
  return (
    <Card className="p-4 sm:p-5">
      <SectionTitle
        icon={Truck}
        title="Доставка"
        subtitle="Продавец указал отправку после подтверждения оплаты."
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ['Способ', 'СДЭК до пункта выдачи'],
          ['Трек-номер', 'Появится после отправки'],
          ['Статус', 'Ожидает подтверждения'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-[#f8fafc] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
              {label}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#111827]">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DealProgress({ isPaid }: { isPaid: boolean }) {
  const steps = useMemo(
    () =>
      orderSteps.map((step) => {
        if (!isPaid && step.label === 'Оплата отправлена') {
          return { ...step, status: 'pending' as OrderStepStatus };
        }
        if (!isPaid && step.label === 'Ожидание оплаты') {
          return { ...step, status: 'active' as OrderStepStatus };
        }
        return step;
      }),
    [isPaid]
  );

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionTitle
          icon={Clock3}
          title={isPaid ? 'Ожидаем подтверждения продавца' : 'Прогресс сделки'}
          subtitle={
            isPaid
              ? 'Обычно продавец подтверждает получение средств в течение 15-30 минут.'
              : 'Следующий шаг - перевести оплату продавцу по СБП.'
          }
        />
        {isPaid ? (
          <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-right">
            <p className="text-xs text-[#94a3b8]">Таймер ожидания</p>
            <p className="text-xl font-bold text-[#005bff]">14:58</p>
          </div>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold',
                step.status === 'done' && 'border-[#10b981] bg-[#ecfdf5] text-[#047857]',
                step.status === 'active' && 'border-[#005bff] bg-[#eff6ff] text-[#005bff]',
                step.status === 'pending' && 'border-[#e2e8f0] bg-white text-[#94a3b8]'
              )}
            >
              {step.status === 'done' ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'font-semibold',
                  step.status === 'pending' ? 'text-[#94a3b8]' : 'text-[#111827]'
                )}
              >
                {step.label}
              </p>
              {step.status === 'active' ? (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e2e8f0]">
                  <div className="h-full w-2/3 rounded-full bg-[#005bff]" />
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PaymentProofForm() {
  return (
    <Card className="p-4 sm:p-5">
      <SectionTitle
        icon={UploadCloud}
        title="Подтверждение оплаты"
        subtitle="Скриншот не обязателен, но помогает продавцу быстрее подтвердить перевод."
      />
      <div className="mt-5 grid gap-4 md:grid-cols-[220px_1fr]">
        <button
          type="button"
          className="flex min-h-[150px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-center transition hover:border-[#005bff] hover:bg-[#eff6ff]"
        >
          <ImageIcon className="h-8 w-8 text-[#005bff]" />
          <span className="mt-3 text-sm font-semibold text-[#111827]">
            Приложить скриншот
          </span>
          <span className="mt-1 text-xs text-[#64748b]">PNG, JPG до 10 МБ</span>
        </button>
        <label className="block">
          <span className="text-sm font-semibold text-[#111827]">
            Комментарий продавцу
          </span>
          <textarea
            className="mt-3 min-h-[150px] w-full resize-none rounded-2xl border border-[#e2e8f0] bg-white p-4 text-sm outline-none transition placeholder:text-[#94a3b8] focus:border-[#005bff] focus:ring-2 focus:ring-[#005bff]/10"
            placeholder="Например: оплатил с карты Т-Банк, сумма 11 540 ₽"
          />
        </label>
      </div>
    </Card>
  );
}

function OrderChatPanel() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[#e8edf6] p-4 sm:p-5">
        <SectionTitle
          icon={MessageCircle}
          title="Чат по сделке"
          subtitle="Сообщения, изображения и системные уведомления остаются внутри заказа."
        />
      </div>
      <div className="max-h-[430px] space-y-3 overflow-y-auto bg-[#f8fafc] p-4 sm:p-5">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-5',
              message.type === 'system' &&
                'mx-auto bg-white text-center text-[#64748b] shadow-sm',
              message.type === 'buyer' && 'ml-auto bg-[#005bff] text-white',
              message.type === 'seller' && 'bg-white text-[#111827] shadow-sm'
            )}
          >
            {message.author ? (
              <p className="mb-1 text-xs font-semibold text-[#005bff]">{message.author}</p>
            ) : null}
            <p>{message.text}</p>
            <p
              className={cn(
                'mt-1 text-xs',
                message.type === 'buyer' ? 'text-white/70' : 'text-[#94a3b8]'
              )}
            >
              {message.time}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-[#e8edf6] p-3">
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#64748b]"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        <input
          className="min-w-0 flex-1 rounded-xl border border-[#e2e8f0] px-4 text-sm outline-none focus:border-[#005bff]"
          placeholder="Написать продавцу..."
        />
        <button
          type="button"
          className="rounded-xl bg-[#005bff] px-4 text-sm font-semibold text-white"
        >
          Отправить
        </button>
      </div>
    </Card>
  );
}

function MobileFlow({
  isPaid,
  onPaid,
}: {
  isPaid: boolean;
  onPaid: () => void;
}) {
  return (
    <div className="space-y-4 pb-28 lg:hidden">
      <ProductSummary />
      <SellerTrustPanel />
      <DirectPaymentWarning />
      {!isPaid ? <PaymentProfileCard compact onPaid={onPaid} /> : null}
      <DealProgress isPaid={isPaid} />
      {isPaid ? <PaymentProofForm /> : null}
      <DeliveryPanel />
      <OrderChatPanel />
      {!isPaid ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e8edf6] bg-white/95 p-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <Button
            className="h-14 w-full rounded-2xl bg-[#005bff] text-base hover:bg-[#004ad6]"
            onClick={onPaid}
          >
            Я оплатил
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function DesktopDashboard({
  isPaid,
  onPaid,
}: {
  isPaid: boolean;
  onPaid: () => void;
}) {
  return (
    <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_430px]">
      <main className="space-y-5">
        <ProductSummary />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SellerTrustPanel />
          <DirectPaymentWarning />
        </div>
        <DeliveryPanel />
        <DealProgress isPaid={isPaid} />
        {isPaid ? <PaymentProofForm /> : null}
        <OrderChatPanel />
      </main>
      <aside className="space-y-5">
        <PaymentProfileCard onPaid={onPaid} />
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#047857]">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-[#111827]">SANCAN сопровождает сделку</h3>
              <p className="mt-2 text-sm leading-6 text-[#64748b]">
                Мы фиксируем статусы, чат, подтверждение оплаты и историю сделки, но
                деньги за товар не проходят через площадку.
              </p>
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}

export default function SecondLifeOrderCheckout() {
  const [isPaid, setIsPaid] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f7fa]">
      <div className="mx-auto max-w-[1440px] px-3 py-4 sm:px-5 lg:px-8 lg:py-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#334155] shadow-sm transition hover:text-[#005bff]"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111827] shadow-sm">
            <Banknote className="h-4 w-4 text-[#005bff]" />
            Заказ #SL-1024
            <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-xs text-[#c2410c]">
              {isPaid ? 'Ожидает продавца' : 'Ожидает оплаты'}
            </span>
          </div>
        </div>

        <MobileFlow isPaid={isPaid} onPaid={() => setIsPaid(true)} />
        <DesktopDashboard isPaid={isPaid} onPaid={() => setIsPaid(true)} />
      </div>
    </div>
  );
}
