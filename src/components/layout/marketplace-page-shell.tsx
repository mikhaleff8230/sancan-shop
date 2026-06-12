import type { ReactNode } from 'react';
import cn from 'classnames';

type MarketplacePageShellProps = {
  children: ReactNode;
  className?: string;
  /** Full-bleed blocks (filters, subcategory bar) rendered outside inner padding */
  before?: ReactNode;
  after?: ReactNode;
};

export default function MarketplacePageShell({
  children,
  className,
  before,
  after,
}: MarketplacePageShellProps) {
  return (
    <div className={cn('sancan-ozon-page pb-8', className)}>
      {before}
      <div className="sancan-ozon-container">{children}</div>
      {after}
    </div>
  );
}

export function MarketplacePageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-ozon-border pb-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-ozon-text md:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-ozon-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
