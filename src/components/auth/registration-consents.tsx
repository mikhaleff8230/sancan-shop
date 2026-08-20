type Props = {
  terms: boolean;
  privacy: boolean;
  emailMarketing: boolean;
  pushMarketing: boolean;
  onChange: (field: 'terms' | 'privacy' | 'emailMarketing' | 'pushMarketing', value: boolean) => void;
};

const ConsentRow = ({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode }) => (
  <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-dark/70 dark:text-light/70">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-violet-700" />
    <span>{children}</span>
  </label>
);

export default function RegistrationConsents({ terms, privacy, emailMarketing, pushMarketing, onChange }: Props) {
  const linkClass = 'font-semibold text-violet-700 underline hover:text-violet-900';
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <ConsentRow checked={terms} onChange={(value) => onChange('terms', value)}>
        Я принимаю <a className={linkClass} href="/terms" target="_blank" rel="noreferrer">Пользовательское соглашение</a> и <a className={linkClass} href="/licensing" target="_blank" rel="noreferrer">Публичную оферту</a>. <b>*</b>
      </ConsentRow>
      <ConsentRow checked={privacy} onChange={(value) => onChange('privacy', value)}>
        Я даю согласие на обработку персональных данных и ознакомлен(а) с <a className={linkClass} href="/privacy" target="_blank" rel="noreferrer">Политикой конфиденциальности</a>. <b>*</b>
      </ConsentRow>
      <ConsentRow checked={emailMarketing} onChange={(value) => onChange('emailMarketing', value)}>
        Согласен(на) получать рекламные и информационные письма. Можно отозвать в любой момент.
      </ConsentRow>
      <ConsentRow checked={pushMarketing} onChange={(value) => onChange('pushMarketing', value)}>
        Согласен(на) получать рекламные push-уведомления. Разрешение можно отключить в браузере.
      </ConsentRow>
      <p className="text-[11px] text-gray-500">* Обязательные согласия. Рассылки и push — добровольные.</p>
    </div>
  );
}
