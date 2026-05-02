import cn from 'classnames';

export default function Copyright({ className }: { className?: string }) {
  return (
    <div className={cn('tracking-[0.2px]', className)}>
      2018-2026 Проект ООО"САНКЭН"
    </div>
  );
}
