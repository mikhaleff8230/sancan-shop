export const YANDEX_METRIKA_ID = 81185602;

type MetrikaParams = Record<string, unknown>;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function canTrack(): boolean {
  return typeof window !== 'undefined';
}

export function reachGoal(goal: string, params?: MetrikaParams) {
  if (!canTrack()) return;

  window.ym?.(YANDEX_METRIKA_ID, 'reachGoal', goal, params || {});
}

export function trackPageView(url: string) {
  if (!canTrack()) return;

  window.ym?.(YANDEX_METRIKA_ID, 'hit', url, {
    referer: document.referrer,
    title: document.title,
  });
}

function pushEcommerce(ecommerce: MetrikaParams) {
  if (!canTrack()) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce });
}

function normalizeProduct(item: any, quantity = 1) {
  const price = Number(item?.sale_price ?? item?.price ?? item?.unit_price ?? 0) || 0;

  return {
    id: String(item?.id ?? item?.product_id ?? item?.sku ?? ''),
    name: String(item?.name ?? item?.title ?? item?.product_name ?? 'Product'),
    price,
    quantity: Number(item?.quantity ?? item?.order_quantity ?? quantity) || quantity,
    brand: item?.shop?.name || item?.manufacturer?.name || undefined,
    category: item?.categories?.[0]?.name || item?.category?.name || undefined,
  };
}

export function trackAddToCart(item: any, quantity = 1) {
  const product = normalizeProduct(item, quantity);

  reachGoal('add_to_cart', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    quantity: product.quantity,
  });

  pushEcommerce({
    currencyCode: 'RUB',
    add: {
      products: [product],
    },
  });
}

export function trackBeginCheckout(items: any[], total?: number) {
  const products = items.map((item) => normalizeProduct(item));

  reachGoal('begin_checkout', {
    value: Number(total ?? 0) || undefined,
    items_count: products.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
  });

  pushEcommerce({
    currencyCode: 'RUB',
    checkout: {
      actionField: { step: 1 },
      products,
    },
  });
}

export function trackCheckoutSubmit(items: any[], total?: number) {
  const products = items.map((item) => normalizeProduct(item));

  reachGoal('checkout_submit', {
    value: Number(total ?? 0) || undefined,
    items_count: products.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
  });

  pushEcommerce({
    currencyCode: 'RUB',
    checkout: {
      actionField: { step: 2 },
      products,
    },
  });
}

export function trackCheckoutVerify(items: any[], total?: number) {
  const products = items.map((item) => normalizeProduct(item));

  reachGoal('checkout_verify', {
    value: Number(total ?? 0) || undefined,
    items_count: products.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
  });

  pushEcommerce({
    currencyCode: 'RUB',
    checkout: {
      actionField: { step: 2 },
      products,
    },
  });
}

export function trackOrderCreated(order: any, items: any[], total?: number) {
  const orderId = order?.order_id || order?.tracking_number || order?.id || order?.payment_id;

  reachGoal('order_created', {
    order_id: orderId,
    value: Number(total ?? order?.amount ?? 0) || undefined,
  });
}

export function trackPurchaseSuccess(order: any, items: any[] = [], total?: number) {
  const orderId = order?.tracking_number || order?.order_id || order?.id || order?.payment_id;
  const revenue = Number(total ?? order?.paid_total ?? order?.amount ?? 0) || 0;
  const products = items.map((item) => normalizeProduct(item));

  reachGoal('purchase_success', {
    order_id: orderId,
    value: revenue || undefined,
  });

  pushEcommerce({
    currencyCode: 'RUB',
    purchase: {
      actionField: {
        id: String(orderId || ''),
        revenue,
      },
      products,
    },
  });
}

export function trackPaymentSuccess(orderId?: string | number) {
  reachGoal('payment_success', {
    order_id: orderId,
  });
}
