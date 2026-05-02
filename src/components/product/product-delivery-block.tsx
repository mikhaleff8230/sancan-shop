import { motion } from 'framer-motion';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';

interface ProductDeliveryBlockProps {
  product: any;
  className?: string;
}

export default function ProductDeliveryBlock({ 
  product: _product, 
  className = '' 
}: ProductDeliveryBlockProps) {
  const getFileNameFromUrl = (url?: string): string => {
    if (!url) return '';
    try {
      const clean = decodeURIComponent(url.split('?')[0]);
      return clean.substring(clean.lastIndexOf('/') + 1);
    } catch {
      const clean = url.split('?')[0];
      return clean.substring(clean.lastIndexOf('/') + 1);
    }
  };

  const fileName =
    _product?.digital_file?.file_name ||
    getFileNameFromUrl(_product?.digital_file?.url) ||
    getFileNameFromUrl(_product?.preview_url);

  return (
    <motion.div 
      variants={fadeInBottom()}
      className={`app-surface-panel rounded-app-md layout-block-24 ${className}`}
    >
      <div className="rounded-app-sm border border-dashed border-brand/35 bg-brand/10 px-grid-2 py-grid-3 text-center">
        <p className="text-sm font-medium text-light">
          Файл в составе покупки
        </p>
        <p className="mt-1 text-xs text-app-muted">
          {fileName ? fileName : 'Цифровой файл будет доступен после покупки'}
        </p>
      </div>
    </motion.div>
  );
} 