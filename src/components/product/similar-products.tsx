import { useRelatedProducts } from '@/data/product';
import Card from '@/components/product/card';

interface SimilarProductsProps {
  currentProductSlug: string;
  relatedProducts?: any[];
  className?: string;
}

export default function SimilarProducts({
  currentProductSlug,
  relatedProducts,
  className = '',
}: SimilarProductsProps) {
  const { products, isLoading, error } = useRelatedProducts(currentProductSlug, 12);
  const displayProducts = products?.length ? products : relatedProducts;

  if (isLoading) {
    return (
      <section className={`sancan-ozon-section ${className}`}>
        <h2 className="mb-5 text-xl font-bold text-ozon-text">Похожие товары</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-[#eef2f7]" />
          ))}
        </div>
      </section>
    );
  }

  if (error || !displayProducts || displayProducts.length === 0) return null;

  return (
    <section className={`sancan-ozon-section ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-ozon-text">Похожие товары</h2>
        <span className="text-xs font-medium text-ozon-muted">Смотреть все&nbsp; →</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {displayProducts.slice(0, 4).map((product) => (
          <Card key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
