import cn from 'classnames';
import Link from 'next/link';
import routes from '@/config/routes';
import Logo from '@/components/ui/logo';

const footerGroups = [
  {
    title: 'Помощь',
    links: [
      { label: 'Центр помощи', href: routes.help },
      { label: 'База знаний', href: routes.knowledgeBase },
      { label: 'Возврат', href: routes.return },
    ],
  },
  {
    title: 'SANCAN',
    links: [
      { label: 'Маркетплейс', href: routes.marketplace },
      { label: 'Продавцам', href: routes.earn },
      { label: 'Магазины', href: routes.shops },
    ],
  },
  {
    title: 'Документы',
    links: [
      { label: 'Лицензирование', href: routes.licensing },
      { label: 'Условия', href: routes.terms },
      { label: 'Конфиденциальность', href: routes.privacy },
    ],
  },
];

export default function Copyright({ className }: { className?: string }) {
  return (
    <footer className={cn('border-t border-ozon-border bg-[#eef2f7]', className)}>
      <div className="sancan-ozon-container py-8 md:py-10">
        <div className="grid gap-8 md:grid-cols-[minmax(220px,1.2fr)_2fr] lg:gap-12">
          <div>
            <Logo className="h-10 w-[132px]" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-ozon-muted">
              SANCAN помогает находить товары, магазины и оформлять сделки между
              покупателями и продавцами в удобном формате.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h3 className="mb-3 text-sm font-bold text-ozon-text">
                  {group.title}
                </h3>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-ozon-muted transition hover:text-ozon-blue"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[#dbe2ec] pt-5 text-xs text-ozon-muted sm:flex-row sm:items-center sm:justify-between">
          <span>2026 SANCAN. Все права защищены.</span>
          <span>Second Life Marketplace</span>
        </div>
      </div>
    </footer>
  );
}
