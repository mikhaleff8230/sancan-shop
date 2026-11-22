export function generateCartItem(item: any) {
  const variationId = item.variation_option_id;
  return {
    id: variationId ? `${item.id}.${variationId}` : item.id,
    product_id: item.id,
    variation_option_id: variationId || null,
    variation_title: item.variation_title || null,
    variation_options_snapshot: item.variation_options_snapshot || null,
    name: item.name,
    slug: item.slug,
    unit: item.unit,
    image: item.image?.thumbnail || item.image?.original,
    stock: item.quantity,
    price: Number(item.sale_price ? item.sale_price : item.price),
    shop: {
      slug: item.shop.slug,
      name: item.shop.name,
    },
    language: item.language,
    payment_method: item.payment_method,
  };
}
