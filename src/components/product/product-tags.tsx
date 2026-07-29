import { motion } from 'framer-motion';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import AnchorLink from '@/components/ui/links/anchor-link';
import routes from '@/config/routes';
import type { Tag } from '@/types';

interface ProductTagsProps {
  tags?: Tag[];
  className?: string;
}

export default function ProductTags({
  tags,
  className = '',
}: ProductTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <motion.div variants={fadeInBottom()} className={className}>
      <h2 className="mb-4 text-2xl font-bold text-ozon-text">
        Подборки товаров в категории
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag: Tag) => (
          <AnchorLink
            key={tag.id}
            href={routes.tagUrl(tag.slug)}
            className="inline-flex items-center justify-center rounded-full bg-[#f0f5fb] px-4 py-2 text-sm font-semibold text-ozon-blue transition hover:bg-[#f4dcff]"
          >
            #{tag.name}
          </AnchorLink>
        ))}
      </div>
    </motion.div>
  );
}
