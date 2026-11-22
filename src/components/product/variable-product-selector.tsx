import { useEffect, useMemo, useState } from 'react';

type Props = {
  product: any;
  onChange: (variation: any | null) => void;
};

const optionMap = (variation: any) =>
  (Array.isArray(variation?.options) ? variation.options : []).reduce(
    (result: Record<string, string>, option: any) => {
      const name = String(option?.name || '').trim();
      const value = String(option?.value || '').trim();
      if (name && value) result[name] = value;
      return result;
    },
    {}
  );

const isAvailable = (variation: any) =>
  !variation?.is_disable && Number(variation?.quantity || 0) > 0;

export default function VariableProductSelector({ product, onChange }: Props) {
  const variations = useMemo(
    () => (Array.isArray(product?.variation_options) ? product.variation_options : []),
    [product?.variation_options]
  );
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [showChart, setShowChart] = useState(false);

  const axes = useMemo(() => {
    const result = new Map<string, Set<string>>();
    variations.forEach((variation: any) => {
      Object.entries(optionMap(variation)).forEach(([name, value]) => {
        if (!result.has(name)) result.set(name, new Set());
        result.get(name)?.add(value);
      });
    });
    return Array.from(result.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  }, [variations]);

  const selectedVariation = useMemo(() => {
    if (!axes.length || Object.keys(selected).length !== axes.length) return null;
    return (
      variations.find((variation: any) => {
        const values = optionMap(variation);
        return axes.every((axis) => values[axis.name] === selected[axis.name]);
      }) || null
    );
  }, [axes, selected, variations]);

  useEffect(() => {
    onChange(selectedVariation && isAvailable(selectedVariation) ? selectedVariation : null);
  }, [onChange, selectedVariation]);

  useEffect(() => {
    setSelected({});
  }, [product?.id]);

  const chartRows = Array.isArray(product?.size_chart)
    ? product.size_chart
    : Array.isArray(product?.size_chart?.rows)
      ? product.size_chart.rows
      : [];

  if (product?.product_type !== 'variable' || !variations.length || !axes.length) return null;

  const valueAvailable = (axisName: string, value: string) =>
    variations.some((variation: any) => {
      if (!isAvailable(variation)) return false;
      const values = optionMap(variation);
      if (values[axisName] !== value) return false;
      return Object.entries(selected).every(
        ([selectedName, selectedValue]) =>
          selectedName === axisName || values[selectedName] === selectedValue
      );
    });

  return (
    <section className="sancan-ozon-card p-5 lg:p-6" aria-label="Выбор вариации товара">
      {axes.map((axis) => {
        const sizeAxis = /размер|size|рост|ru|eu|uk|us/i.test(axis.name);
        return (
          <fieldset key={axis.name} className="mb-5 last:mb-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <legend className="text-sm font-semibold text-ozon-text">{axis.name}</legend>
              {sizeAxis && chartRows.length > 0 && (
                <button type="button" onClick={() => setShowChart(true)} className="text-xs font-semibold text-ozon-blue hover:underline">
                  Таблица размеров ›
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {axis.values.map((value) => {
                const available = valueAvailable(axis.name, value);
                const active = selected[axis.name] === value;
                return (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={active}
                    aria-label={`${axis.name}: ${value}${available ? '' : ', недоступно'}`}
                    disabled={!available}
                    onClick={() => setSelected((current) => ({ ...current, [axis.name]: value }))}
                    className={`min-w-[52px] rounded-xl border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-ozon-blue focus:ring-offset-2 ${
                      active
                        ? 'border-ozon-blue bg-blue-50 font-bold text-ozon-blue'
                        : available
                          ? 'border-[#d8e0eb] bg-white font-semibold text-ozon-text hover:border-ozon-blue'
                          : 'cursor-not-allowed border-[#eceff3] bg-[#f3f4f6] text-[#a6adba] line-through'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {selectedVariation && !isAvailable(selectedVariation) && (
        <p className="mt-3 text-sm font-medium text-red-600">Эта комбинация сейчас недоступна.</p>
      )}
      {!selectedVariation && Object.keys(selected).length < axes.length && (
        <p className="mt-3 text-xs text-ozon-muted">Выберите все параметры, чтобы увидеть цену и добавить конкретный SKU в корзину.</p>
      )}

      {showChart && (
        <div role="dialog" aria-modal="true" aria-labelledby="size-chart-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onMouseDown={() => setShowChart(false)}>
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-5 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 id="size-chart-title" className="text-xl font-bold text-ozon-text">Таблица размеров</h2>
              <button type="button" aria-label="Закрыть таблицу размеров" onClick={() => setShowChart(false)} className="rounded-lg px-3 py-2 text-xl">×</button>
            </div>
            <table className="w-full border-collapse text-left text-sm">
              <thead><tr>{Object.keys(chartRows[0] || {}).map((key) => <th key={key} className="border-b p-2 font-semibold">{key}</th>)}</tr></thead>
              <tbody>{chartRows.map((row: any, index: number) => <tr key={index}>{Object.keys(chartRows[0] || {}).map((key) => <td key={key} className="border-b p-2">{row[key] ?? '—'}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
