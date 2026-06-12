import type { ReactNode } from 'react';
import Layout from '@/layouts/_layout';

/**
 * Ozon/SANCAN marketplace shell: header without legacy left sidebar.
 */
export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <Layout hideSidebar>{children}</Layout>;
}
