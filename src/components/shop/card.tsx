import type { Shop } from '@/types';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Image from '@/components/ui/image';
import routes from '@/config/routes';
import placeholder from '@/assets/images/placeholders/product.svg';
import { fadeInBottomWithScaleX } from '@/lib/framer-motion/fade-in-bottom';
import { useTranslation } from 'next-i18next';

export default function Card({ shop }: { shop: Shop }) {
  const { name, slug, logo, products_count } = shop ?? {};
  const router = useRouter();
  const { t } = useTranslation('common');
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      variants={fadeInBottomWithScaleX()}
      onClick={() => router.push(routes.shopUrl(slug))}
      className="group app-card-ui app-card-ui-hover cursor-pointer rounded-app-md p-grid-3 text-center"
    >
      <div className="relative mx-auto mb-3 h-[78px] w-[78px] md:h-[84px] md:w-[84px] lg:h-[92px] lg:w-[92px]">
        <Image
          alt={name}
          fill
          quality={50}
          src={logo?.original ?? placeholder}
          className="rounded-2xl border border-white/15 object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-light transition-colors group-hover:text-brand">
        {name}
      </h3>
      <div className="text-xs font-medium text-app-muted">
        {products_count} {t('text-products')}
      </div>
      <div className="mt-3">
        <span className="app-chip group-hover:bg-app-card">
          View Shop
        </span>
      </div>
    </motion.div>
  );
}
