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
        <h2 className="mb-6 text-2xl font-bold text-ozon-text">Рекомендуем также</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-[#eef2f7]" />
          ))}
        </div>
      </section>
    );
  }

  if (error || !displayProducts || displayProducts.length === 0) return null;

  return (
    <section className={`sancan-ozon-section ${className}`}>
      <h2 className="mb-6 text-2xl font-bold text-ozon-text">Рекомендуем также</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {displayProducts.map((product) => (
          <Card key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
