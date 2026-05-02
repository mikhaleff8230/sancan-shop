import { motion } from 'framer-motion';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import Link from 'next/link';
import { useProSubscriptionCheck } from '@/data/pro-subscription';

interface ProductExternalLinkBlockProps {
  product: any;
  className?: string;
}

export default function ProductExternalLinkBlock({ 
  product, 
  className = '' 
}: ProductExternalLinkBlockProps) {
  // Проверяем тип товара
  const productTypeName = product?.type?.name || '';
  const isOzon = productTypeName.toLowerCase().includes('ozon');
  const isWildberries = productTypeName.toLowerCase().includes('wildberries');
  
  // Если ни один из типов не подходит, не отображаем плашку
  if (!isOzon && !isWildberries) {
    return null;
  }

  // Проверяем наличие preview_url
  const previewUrl = product?.preview_url;
  if (!previewUrl) {
    return null;
  }

  // Проверяем подписку PRO у продавца
  const sellerId = product?.shop?.owner?.id;
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useProSubscriptionCheck(sellerId);
  const hasProSubscription = subscriptionData?.data?.has_active ?? false;

  // Если подписка PRO не активна, не отображаем плашку
  if (!hasProSubscription) {
    return null;
  }

  // Определяем данные в зависимости от типа
  const platformName = isOzon ? 'Ozon' : 'Wildberries';
  const linkText = `Смотреть на ${platformName}`;
  const faviconUrl = isOzon 
    ? 'https://www.ozon.ru/favicon.ico'
    : 'https://www.wildberries.ru/favicon.ico';

  return (
    <motion.div 
      variants={fadeInBottom()}
      className={`bg-light-100 dark:bg-dark-200 p-6 rounded-lg ${className}`}
    >
      <Link
        href={previewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3.5 rounded-lg bg-light dark:bg-dark-200 hover:bg-light-200 dark:hover:bg-dark-300 transition-all duration-200 group cursor-pointer border border-transparent hover:border-light-300 dark:hover:border-dark-400"
      >
        {/* Иконка (favicon) */}
        <div className="flex-shrink-0 w-5 h-5 relative">
          <img
            src={faviconUrl}
            alt={platformName}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback на пустую иконку если favicon не загрузился
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        {/* Текст ссылки */}
        <span className="text-sm font-medium text-dark dark:text-light group-hover:text-brand transition-colors">
          {linkText}
        </span>
      </Link>
    </motion.div>
  );
}

