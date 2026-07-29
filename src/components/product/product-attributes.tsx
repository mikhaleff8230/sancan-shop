import { motion } from 'framer-motion';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

interface ProductAttributesProps {
  product: any;
  className?: string;
}

interface Attribute {
  id: string | number;
  name: string;
  values?: Array<{ id: string; value: string }>;
  pivot?: { value?: string | number | null };
}

export default function ProductAttributes({
  product,
  className = '',
}: ProductAttributesProps) {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, any>>({});

  const { data: attributesData, isLoading, error: attributesError } = useQuery(
    ['product-attributes', product?.id],
    async () => {
      if (!product?.id) return null;
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'https://api.sancan.ru'}/api/products/${product.id}/attributes`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(apiUrl, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          return { product_attributes: [], category_attributes: [], attribute_values: {} };
        }

        const data = await response.json();
        return data.success ? data.data : null;
      } catch (error) {
        console.error('[ProductAttributes] Fetch error:', error);
        return { product_attributes: [], category_attributes: [], attribute_values: {} };
      }
    },
    {
      enabled: !!product?.id,
      staleTime: 5 * 60 * 1000,
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (attributesData) {
      setAttributes(attributesData.product_attributes || []);
      setAttributeValues(attributesData.attribute_values || {});
      return;
    }

    if (product?.attributes && Array.isArray(product.attributes)) {
      setAttributes(product.attributes);
      setAttributeValues(product.attribute_values || {});
      return;
    }

    setAttributes([]);
    setAttributeValues({});
  }, [attributesData, product]);

  const getAttributeValue = (attribute: Attribute) => {
    const attrId = String(attribute.id);
    const value = attributeValues[attrId] || attributeValues[Number(attribute.id)] || attribute.pivot?.value;

    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'object' && 'value' in value) return value.value;
    if (Array.isArray(value)) return value.map((item) => item?.value || item).filter(Boolean).join(', ');
    return String(value);
  };

  const rows = useMemo(
    () => attributes
      .map((attr) => ({ label: attr.name, value: getAttributeValue(attr) }))
      .filter((row) => row.value),
    [attributes, attributeValues]
  );

  if (isLoading) {
    return (
      <motion.div variants={fadeInBottom()} className={className}>
        <h2 className="mb-5 text-2xl font-bold text-ozon-text">Характеристики</h2>
        <div className="grid gap-x-12 gap-y-3 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-8 animate-pulse rounded-lg bg-[#eef2f7]" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (attributesError || rows.length === 0) return null;

  return (
    <motion.div variants={fadeInBottom()} className={className}>
      <h2 className="mb-5 text-2xl font-bold text-ozon-text">Характеристики</h2>
      <div className="grid gap-x-12 md:grid-cols-2">
        {rows.map((row, index) => (
          <div key={`${row.label}-${index}`} className="sancan-ozon-spec-row">
            <span className="text-ozon-muted">{row.label}</span>
            <span className="font-medium text-ozon-text">{row.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 max-w-4xl text-xs leading-relaxed text-ozon-muted">
        Информация о характеристиках, комплектации, стране изготовления и внешнем виде товара
        носит справочный характер и основывается на данных продавца.
      </p>
    </motion.div>
  );
}
