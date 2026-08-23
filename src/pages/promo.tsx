import Image from 'next/image';
import { useEffect } from 'react';
import type React from 'react';
import type { NextPageWithLayout } from '@/types';
import { TitleSeo } from '@/components/seo/title-seo';
import {
  ArrowRight, BadgeCheck, BarChart3, Brush, Check, ChevronRight,
  CircleDollarSign, Gem, HeartHandshake, LineChart, MessageCircle,
  Package, Palette, Rocket, ShieldCheck, ShoppingBag, Sparkles,
  Store, ToggleRight, Users, WandSparkles, Zap,
} from 'lucide-react';

const SELLER_REGISTER = 'https://seller.sancan.ru/register';
const SELLER_LOGIN = 'https://seller.sancan.ru/login';
const TRACKED_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid'];

declare global {
  interface Window { ym?: (id: number, method: string, goal: string) => void; }
}

const metric = (goal: string) => {
  if (typeof window === 'undefined') return;
  const id = Number(process.env.NEXT_PUBLIC_YANDEX_METRICA_ID || 0);
  if (id && window.ym) window.ym(id, 'reachGoal', goal);
};

const sellerUrl = (base: string) => {
  if (typeof window === 'undefined') return base;
  const source = new URLSearchParams(window.location.search);
  const target = new URL(base);
  TRACKED_PARAMS.forEach((key) => {
    const value = source.get(key);
    if (value) target.searchParams.set(key, value);
  });
  return target.toString();
};

const SignupLink = ({ children, final = false, className = '' }: { children: React.ReactNode; final?: boolean; className?: string }) => (
  <a
    href={SELLER_REGISTER}
    className={`promo-button ${className}`}
    onClick={(event) => {
      event.currentTarget.href = sellerUrl(SELLER_REGISTER);
      metric(final ? 'promo_final_signup_click' : 'promo_signup_click');
      metric('seller_registration');
    }}
  >
    {children}<ArrowRight size={18} />
  </a>
);

const audiences = [
  [Gem, 'Мастера handmade', 'Украшения, текстиль, керамика, свечи, декор и аксессуары.'],
  [ShoppingBag, 'Авторские бренды', 'Одежда, аксессуары, интерьерные товары и независимые марки.'],
  [Palette, 'Художники и дизайнеры', 'Картины, графика, принты, арт-объекты и авторский декор.'],
  [Package, 'Своё производство', 'Небольшие мастерские и производители собственной продукции.'],
  [Brush, 'Самозанятые', 'Для тех, кто создаёт и продаёт собственные товары.'],
  [LineChart, 'Селлеры маркетплейсов', 'Дополнительный канал продаж для продавцов крупных площадок.'],
];

const features = [
  [CircleDollarSign, 'Бесплатное размещение', 'Добавляйте товары без платы за публикацию.'],
  [ShieldCheck, 'Безопасная оплата', 'Покупатель может оплатить заказ через платёжную систему SANCAN.'],
  [Rocket, 'Продвижение товаров', 'Запускайте рекламу выбранных товаров из кабинета продавца.'],
  [MessageCircle, 'Прямой чат', 'Обсуждайте детали заказа непосредственно с покупателем.'],
  [WandSparkles, 'Товары на заказ', 'Продавайте изделия, которые создаются индивидуально.'],
];

const PromoPage: NextPageWithLayout = () => {
  useEffect(() => {
    metric('promo_view');
    const seen = new Set<string>();
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting || seen.has(entry.target.id)) return;
      seen.add(entry.target.id);
      metric(entry.target.id === 'payment' ? 'promo_payment_section_view' : 'promo_boost_section_view');
    }), { threshold: 0.35 });
    ['payment', 'boost'].forEach((id) => { const node = document.getElementById(id); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <TitleSeo
        title="Продавайте handmade и авторские товары на SANCAN"
        description="Откройте магазин на SANCAN бесплатно. 0% комиссии при прямой оплате по СБП, товары на заказ, чат с покупателями и продвижение товаров в Яндексе."
        canonical="https://sancan.ru/promo"
        ogImage="https://sancan.ru/promo/sancan-seller-hero.webp"
        exactTitle
      />
      <main className="promo-page">
        <header className="promo-header">
          <a href="https://sancan.ru" className="promo-logo" aria-label="SANCAN">SAN<span>CAN</span></a>
          <nav><a href="#benefits">Возможности</a><a href="#payment">Оплата</a><a href="#start">Как начать</a></nav>
          <a href={SELLER_LOGIN} className="promo-login" onClick={(e) => { e.currentTarget.href = sellerUrl(SELLER_LOGIN); metric('promo_login_click'); }}>Войти продавцу</a>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={15} /> Новый маркетплейс для тех, кто создаёт своё</div>
            <h1>Продавайте <em>авторские товары</em> на SANCAN</h1>
            <p className="hero-lead">Размещайте товары бесплатно, принимайте оплату напрямую и находите новых покупателей.</p>
            <div className="hero-actions"><SignupLink>Создать магазин бесплатно</SignupLink><a className="text-link" href={SELLER_LOGIN} onClick={(e) => { e.currentTarget.href = sellerUrl(SELLER_LOGIN); metric('promo_login_click'); }}>Войти как продавец <ChevronRight size={17} /></a></div>
            <div className="hero-facts"><span><b>0 ₽</b> за размещение</span><span><b>0%</b> по СБП</span><span><b>Яндекс</b> продвижение</span></div>
            <p className="early-note"><span /> SANCAN только открывается. Станьте одним из первых продавцов.</p>
          </div>
          <div className="hero-visual">
            <div className="hero-image"><Image src="/promo/sancan-seller-hero.webp" alt="Авторская керамика, одежда, украшения и аксессуары" fill priority sizes="(max-width: 768px) 94vw, 52vw" /></div>
            <div className="float-card float-zero"><b>0%</b><span>комиссия SANCAN<br />при оплате по СБП</span></div>
            <div className="float-card float-boost"><ToggleRight size={30} /><span>Продвижение<br /><b>включено</b></span></div>
            <div className="shop-chip"><Store size={17} /><span>Ваш магазин</span><BadgeCheck size={16} /></div>
          </div>
        </section>

        <section className="audience promo-section">
          <div className="section-heading"><span className="kicker">Для кого</span><h2>Для тех, кто<br /><i>создаёт своё</i></h2><p>От первой коллекции до действующего бренда — откройте ещё один канал продаж.</p></div>
          <div className="audience-grid">{audiences.map(([Icon, title, text], i) => <article className={`audience-card c${i}`} key={title as string}><Icon size={24} /><div><h3>{title as string}</h3><p>{text as string}</p></div></article>)}</div>
        </section>

        <section id="benefits" className="benefits promo-section">
          <div className="benefit-lead"><span className="kicker light">Главные преимущества</span><h2>Больше свободы<br />продавцу</h2><p>Вы сами выбираете, как работать с покупателем.</p><div className="big-zero"><strong>0%</strong><span>комиссии SANCAN<br />при прямой оплате по СБП</span></div></div>
          <div className="feature-grid">{features.map(([Icon, title, text]) => <article key={title as string}><Icon size={25} /><h3>{title as string}</h3><p>{text as string}</p></article>)}</div>
        </section>

        <section id="payment" className="payment promo-section">
          <div className="section-heading centered"><span className="kicker">Оплата без сложных условий</span><h2>Выбирайте, как получать оплату</h2><p>Прямой перевод или платёж через сайт — покажем разницу честно.</p></div>
          <div className="payment-grid">
            <article className="pay-card sbp"><div className="pay-top"><span className="pay-label">СБП напрямую</span><b>0%</b></div><h3>Деньги сразу продавцу</h3><p>Покупатель переводит оплату напрямую через СБП. SANCAN не удерживает комиссию с такой продажи.</p><div className="flow"><span><Users />Покупатель</span><i><ArrowRight /></i><span className="sbp-dot">СБП</span><i><ArrowRight /></i><span><Store />Продавец</span></div><small><Check /> Простой вариант для прямой сделки</small></article>
            <article className="pay-card safe"><div className="pay-top"><span className="pay-label">Оплата через SANCAN</span><b>20–23%</b></div><h3>Сделка через сайт</h3><p>Покупатель оплачивает заказ на сайте. Комиссия применяется <strong>только при выборе этого способа оплаты.</strong></p><div className="flow"><span><Users />Покупатель</span><i><ArrowRight /></i><span className="brand-dot"><ShieldCheck />SANCAN</span><i><ArrowRight /></i><span><Package />Заказ</span></div><small><Check /> Платёжная механика сайта</small></article>
          </div>
          <div className="compare"><div /><b>СБП напрямую</b><b>Через SANCAN</b><span>Комиссия SANCAN</span><strong>0%</strong><strong>20–23%</strong><span>Деньги</span><strong>Сразу продавцу</strong><strong>Через сайт</strong><span>Чат и товары на заказ</span><strong>Есть</strong><strong>Есть</strong></div>
        </section>

        <section id="boost" className="boost promo-section">
          <div className="boost-copy"><span className="kicker light">Продвижение в Яндексе</span><h2>Нужно больше покупателей?</h2><p>Вы просто включаете продвижение нужного товара. Техническую настройку рекламы SANCAN выполняет автоматически.</p><ul><li><Check />Выбираете товары</li><li><Check />Управляете интенсивностью</li><li><Check />Видите показы и переходы</li><li><Check />Расход — с рекламного баланса</li></ul><SignupLink>Создать магазин бесплатно</SignupLink></div>
          <div className="boost-ui"><div className="product-row"><div className="product-art">льняное<br />платье</div><div><small>Авторская одежда</small><h3>Льняное платье</h3><b>12 900 ₽</b></div></div><div className="switch-row"><span><b>Продвижение</b><small>Яндекс Директ</small></span><span className="switch"><i /></span></div><div className="intensity"><span>Интенсивность продвижения</span><div className="range"><i /></div><div className="range-values"><span>5 ₽</span><span>10 ₽</span><b>15 ₽</b><span>20 ₽</span><span>30 ₽</span><span>40 ₽</span></div></div><div className="stats"><article><BarChart3 /><span>Показы<b>8 420</b></span></article><article><Zap /><span>Переходы<b>173</b></span></article></div><div className="boost-flow"><span>Товар</span><ArrowRight /><b>Boost ON</b><ArrowRight /><span>Яндекс</span><ArrowRight /><strong>Покупатели</strong></div></div>
        </section>

        <section className="conversation promo-section">
          <div className="chat-ui"><div className="chat-head"><span className="avatar">A</span><div><b>Анна · Linen studio</b><small>обычно отвечает быстро</small></div><span className="online" /></div><div className="bubble buyer">Можно сделать в другом цвете?</div><div className="bubble seller">Да, конечно. Срок изготовления — 5 дней.</div><div className="chat-input">Сообщение… <ArrowRight /></div></div>
          <div className="conversation-copy"><span className="kicker">Прямой диалог</span><h2>Обсудите заказ напрямую</h2><p>Покупатель может уточнить размер, цвет, материал, сроки изготовления, доставку или индивидуальные изменения до покупки.</p><div className="mini-points"><span><MessageCircle />Чат до покупки</span><span><HeartHandshake />Договоритесь о деталях</span></div></div>
        </section>

        <section className="custom promo-section">
          <div><span className="kicker light">Не только готовые товары</span><h2>Создавайте<br /><i>по заказу</i></h2><p>SANCAN подходит для изделий, которые создаются после заказа. Детали можно обсудить до оформления.</p></div>
          <div className="custom-cloud">{['Одежда по размеру','Украшения','Мебель','Керамика','Картины','Текстиль','Декор','Подарки','Персонализация'].map((x, i) => <span className={`tag t${i}`} key={x}>{x}</span>)}</div>
        </section>

        <section id="start" className="start promo-section">
          <div className="section-heading"><span className="kicker">Простой старт</span><h2>Начните продавать<br />за несколько шагов</h2></div>
          <div className="timeline">{[['01','Зарегистрируйтесь','Создайте аккаунт продавца.'],['02','Откройте магазин','Расскажите о бренде.'],['03','Добавьте товары','Фото, цена и описание.'],['04','Получайте заказы','Общайтесь и выбирайте оплату.']].map(([n,t,d]) => <article key={n}><b>{n}</b><span><h3>{t}</h3><p>{d}</p></span></article>)}</div>
          <div className="start-more"><Rocket /><span><b>Хотите больше трафика?</b> Включите продвижение.</span></div>
        </section>

        <section className="capabilities promo-section">
          <div><span className="kicker light">В одном кабинете</span><h2>Всё необходимое<br />для продаж</h2></div>
          <div className="cap-list">{[['Регистрация','Бесплатно'],['Добавление товаров','Бесплатно'],['СБП напрямую продавцу','0%'],['Оплата через сайт','Есть'],['Продвижение в Яндексе','Есть'],['Чат с покупателем','Есть'],['Товары на заказ','Есть'],['Управление магазином','Есть']].map(([a,b]) => <div key={a}><span>{a}</span><b>{b}<Check /></b></div>)}</div>
        </section>

        <section className="early promo-section"><div className="early-orbit"><span /><span /><Store /></div><div><span className="kicker">Присоединяйтесь на старте</span><h2>Станьте одним из первых продавцов SANCAN</h2><p>Сейчас мы приглашаем мастеров, независимые бренды и продавцов собственного производства. Создайте магазин и займите своё место на новой площадке.</p><SignupLink>Создать магазин бесплатно</SignupLink></div></section>

        <section className="final-cta promo-section"><span className="kicker light">Ваш следующий канал продаж</span><h2>Ваши товары уже готовы.<br /><i>Покажите их новым покупателям.</i></h2><p>Создайте магазин на SANCAN бесплатно и начните размещать товары уже сегодня.</p><SignupLink final>Создать магазин бесплатно</SignupLink><div><span><Check />Бесплатная регистрация</span><span><Check />Бесплатное размещение</span><span><Check />0% при прямой оплате по СБП</span></div></section>

        <footer><a href="https://sancan.ru" className="promo-logo">SAN<span>CAN</span></a><p>Маркетплейс авторских товаров и независимых брендов.</p><a href={SELLER_LOGIN}>Кабинет продавца</a></footer>
        <div className="mobile-sticky"><SignupLink>Создать магазин</SignupLink></div>
      </main>
      <style jsx global>{`
        :root{--pv:#6d38e0;--pvd:#321374;--ink:#17131f;--cream:#f7f4ef;--lilac:#eee8ff;--line:#ded8e5}
        .promo-page{background:var(--cream);color:var(--ink);font-family:Inter,system-ui,sans-serif;overflow:hidden}.promo-page *{box-sizing:border-box}.promo-header{height:76px;max-width:1440px;margin:auto;padding:0 5vw;display:flex;align-items:center;justify-content:space-between}.promo-logo{font-size:24px;font-weight:900;letter-spacing:-1.5px}.promo-logo span{color:var(--pv)}.promo-header nav{display:flex;gap:30px;font-size:14px}.promo-header a{color:inherit}.promo-login{padding:11px 18px;border:1px solid #bbb2c5;border-radius:99px;font-weight:700}.hero{min-height:720px;max-width:1440px;margin:auto;padding:42px 5vw 90px;display:grid;grid-template-columns:.92fr 1.08fr;align-items:center;gap:4vw}.hero-copy{position:relative;z-index:2}.eyebrow,.kicker{display:inline-flex;align-items:center;gap:7px;color:var(--pv);text-transform:uppercase;letter-spacing:.13em;font-size:12px;font-weight:800}.hero h1{font-size:clamp(48px,5.2vw,80px);line-height:.97;letter-spacing:-.06em;margin:23px 0}.hero h1 em,.section-heading h2 i,.custom h2 i,.final-cta h2 i{font-family:Georgia,serif;font-weight:400;color:var(--pv)}.hero-lead{font-size:19px;line-height:1.6;max-width:570px;color:#5d5664}.hero-actions{display:flex;align-items:center;gap:24px;margin:32px 0}.promo-button{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:var(--pv);color:#fff!important;border-radius:99px;padding:16px 24px;font-weight:800;box-shadow:0 12px 30px #6d38e033;transition:.25s}.promo-button:hover{transform:translateY(-2px);background:#5b27cf}.text-link{display:flex;align-items:center;font-weight:750}.hero-facts{display:flex;gap:20px;padding-top:20px;border-top:1px solid var(--line)}.hero-facts span{font-size:12px;color:#716979}.hero-facts b{display:block;font-size:19px;color:var(--ink)}.early-note{display:flex;align-items:center;gap:9px;font-size:13px;margin-top:25px}.early-note span{width:8px;height:8px;border-radius:50%;background:#71c98b;box-shadow:0 0 0 5px #71c98b22}.hero-visual{position:relative;height:610px}.hero-image{position:absolute;inset:20px 0 20px 45px;border-radius:190px 28px 150px 28px;overflow:hidden;box-shadow:0 35px 90px #2f17422b}.hero-image img{object-fit:cover}.hero-visual:before{content:'';position:absolute;width:70%;height:70%;right:-10%;top:-4%;background:#9d75ff55;filter:blur(80px);border-radius:50%}.float-card{position:absolute;background:#fff;padding:17px;border-radius:18px;box-shadow:0 18px 50px #25133126;display:flex;align-items:center;gap:11px;z-index:2}.float-zero{left:0;top:90px}.float-zero b{font-size:32px;color:var(--pv)}.float-zero span,.float-boost span{font-size:11px;line-height:1.35}.float-boost{right:-5px;bottom:90px}.float-boost svg{color:var(--pv)}.shop-chip{position:absolute;left:20%;bottom:8px;background:#19141f;color:#fff;border-radius:99px;padding:12px 16px;display:flex;gap:8px;align-items:center;font-size:12px}.shop-chip svg:last-child{color:#bba4ff}.promo-section{padding:110px max(5vw,calc((100vw - 1300px)/2))}.section-heading{max-width:500px}.section-heading.centered{text-align:center;margin:0 auto 50px}.section-heading h2,.conversation h2,.boost h2,.benefit-lead h2,.custom h2,.capabilities h2,.early h2{font-size:clamp(40px,4.2vw,62px);line-height:1.02;letter-spacing:-.045em;margin:16px 0}.section-heading p,.conversation-copy>p,.boost-copy>p,.custom p,.early p{color:#6b6371;line-height:1.7;font-size:17px}.audience{display:grid;grid-template-columns:.72fr 1.28fr;gap:7vw}.audience-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.audience-card{background:#fff;border:1px solid #e9e4ec;border-radius:24px;padding:23px;display:flex;gap:15px;transition:.25s}.audience-card:hover{transform:translateY(-4px);box-shadow:0 18px 45px #32137412}.audience-card svg{color:var(--pv);flex:none}.audience-card h3{font-size:17px;margin:0 0 8px}.audience-card p{font-size:13px;color:#716979;line-height:1.5;margin:0}.audience-card.c1,.audience-card.c4{background:var(--lilac)}.benefits{background:var(--pvd);color:#fff;display:grid;grid-template-columns:.8fr 1.2fr;gap:7vw}.kicker.light{color:#cbbcff}.benefit-lead>p{color:#c7bdd5}.big-zero{margin-top:55px;display:flex;align-items:end;gap:18px}.big-zero strong{font-size:90px;line-height:.8;color:#b9ff8c;letter-spacing:-.08em}.big-zero span{font-size:13px;color:#d5cce2}.feature-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.feature-grid article{padding:26px;border:1px solid #ffffff20;border-radius:25px;background:#ffffff0a}.feature-grid article:first-child{grid-column:span 2;background:#fff;color:var(--ink)}.feature-grid svg{color:#b9ff8c}.feature-grid article:first-child svg{color:var(--pv)}.feature-grid h3{font-size:18px;margin:25px 0 8px}.feature-grid p{font-size:13px;line-height:1.55;color:#cfc5dc}.feature-grid article:first-child p{color:#716979}.payment-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.pay-card{border-radius:32px;padding:36px;border:1px solid var(--line);background:#fff}.pay-card.sbp{background:#eaffde;border-color:#c9eeba}.pay-card.safe{background:#eee8ff;border-color:#dbceff}.pay-top{display:flex;justify-content:space-between;align-items:start}.pay-label{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}.pay-top b{font-size:38px;color:var(--pv)}.pay-card h3{font-size:27px;margin:30px 0 8px}.pay-card>p{color:#665e6d;line-height:1.6;min-height:76px}.flow{display:flex;align-items:center;justify-content:space-between;margin:30px 0;padding:20px;background:#ffffffb5;border-radius:20px}.flow span{display:flex;flex-direction:column;align-items:center;gap:7px;font-size:11px;font-weight:700}.flow svg{width:20px}.flow i svg{width:16px;color:#91879b}.sbp-dot{background:linear-gradient(135deg,#08b9ce,#6c3be1);color:#fff;padding:14px;border-radius:50%}.brand-dot{color:var(--pv)}.pay-card small{display:flex;gap:7px;align-items:center;font-weight:700}.pay-card small svg{width:17px}.compare{display:grid;grid-template-columns:1.3fr 1fr 1fr;margin-top:24px;background:#fff;border-radius:25px;padding:10px 28px}.compare>*{padding:15px;border-bottom:1px solid #eee8f0}.compare>*:nth-last-child(-n+3){border:0}.compare b{color:var(--pv)}.compare strong{font-size:14px}.compare span{color:#746b7a;font-size:13px}.boost{background:#19141f;color:#fff;display:grid;grid-template-columns:.85fr 1.15fr;gap:7vw;align-items:center}.boost-copy>p{color:#c4bbc9}.boost-copy ul{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:0;margin:30px 0;list-style:none}.boost-copy li{display:flex;align-items:center;gap:8px;font-size:13px}.boost-copy li svg{width:17px;color:#b9ff8c}.boost-ui{background:#f7f4f9;color:var(--ink);border-radius:32px;padding:26px;box-shadow:0 35px 90px #0008;transform:rotate(1deg)}.product-row{display:flex;gap:16px;align-items:center}.product-art{width:105px;height:115px;border-radius:20px;background:linear-gradient(140deg,#d7c6aa,#f2e9dc);display:flex;align-items:center;justify-content:center;text-align:center;font-family:Georgia,serif;color:#765c43}.product-row small,.switch-row small{display:block;color:#8a8190}.product-row h3{margin:6px 0}.switch-row{display:flex;justify-content:space-between;margin:22px 0;padding:18px 0;border-top:1px solid #ddd6e0;border-bottom:1px solid #ddd6e0}.switch{width:51px;height:29px;border-radius:99px;background:var(--pv);padding:4px}.switch i{display:block;width:21px;height:21px;background:#fff;border-radius:50%;margin-left:auto}.intensity>span{font-size:12px;font-weight:700}.range{height:5px;background:#d8cfe1;border-radius:9px;margin:20px 5px 12px}.range i{display:block;width:42%;height:100%;background:var(--pv);position:relative}.range i:after{content:'';position:absolute;right:-7px;top:-5px;width:15px;height:15px;border-radius:50%;background:var(--pv);box-shadow:0 0 0 5px #6d38e022}.range-values{display:flex;justify-content:space-between;font-size:10px}.range-values b{color:var(--pv)}.stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:25px}.stats article{background:#fff;padding:16px;border-radius:18px;display:flex;gap:12px}.stats svg{color:var(--pv)}.stats span{font-size:11px;color:#817889}.stats b{display:block;font-size:22px;color:var(--ink)}.boost-flow{display:flex;align-items:center;justify-content:center;gap:8px;font-size:10px;margin-top:20px}.boost-flow svg{width:12px}.boost-flow b{background:var(--pv);color:#fff;padding:7px 10px;border-radius:99px}.boost-flow strong{color:var(--pv)}.conversation{display:grid;grid-template-columns:1fr 1fr;gap:9vw;align-items:center}.chat-ui{background:#eee8ff;border-radius:40px;padding:30px;min-height:470px;box-shadow:inset 0 0 0 1px #ded2ff}.chat-head{display:flex;align-items:center;gap:12px;border-bottom:1px solid #d8ccef;padding-bottom:18px}.avatar{width:43px;height:43px;display:grid;place-items:center;background:var(--pv);color:#fff;border-radius:50%;font-weight:800}.chat-head small{display:block;color:#786e83}.online{margin-left:auto;width:9px;height:9px;border-radius:50%;background:#62c883}.bubble{max-width:76%;padding:15px 18px;border-radius:19px;margin-top:35px;font-size:14px}.bubble.buyer{background:#fff;border-bottom-left-radius:5px}.bubble.seller{margin-left:auto;background:var(--pv);color:#fff;border-bottom-right-radius:5px}.chat-input{margin-top:45px;background:#fff;border-radius:99px;color:#98909f;padding:15px 18px;display:flex;justify-content:space-between}.chat-input svg{background:var(--ink);color:#fff;border-radius:50%;padding:5px;width:25px;height:25px}.mini-points{display:flex;gap:25px;margin-top:30px}.mini-points span{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700}.mini-points svg{color:var(--pv)}.custom{background:#7b48e8;color:#fff;display:grid;grid-template-columns:.8fr 1.2fr;align-items:center;gap:8vw}.custom p{color:#e6ddff}.custom h2 i{color:#c9ff99}.custom-cloud{position:relative;min-height:400px}.tag{position:absolute;background:#fff;color:var(--ink);padding:14px 19px;border-radius:99px;font-weight:700;box-shadow:0 12px 30px #32137440}.t0{left:2%;top:10%}.t1{left:44%;top:2%}.t2{right:2%;top:23%}.t3{left:23%;top:35%;font-size:22px}.t4{left:3%;bottom:28%}.t5{right:18%;bottom:30%}.t6{left:36%;bottom:5%}.t7{right:0;bottom:2%}.t8{left:55%;top:57%;background:#c9ff99}.start .section-heading{max-width:650px}.timeline{display:grid;grid-template-columns:repeat(4,1fr);margin-top:60px;border-top:1px solid #cbc3d0}.timeline article{padding:28px 25px;border-left:1px solid #cbc3d0;display:flex;gap:17px}.timeline article:first-child{border-left:0}.timeline article>b{font-size:13px;color:var(--pv)}.timeline h3{font-size:17px;margin:0 0 7px}.timeline p{font-size:12px;color:#776e7c}.start-more{margin-top:25px;background:#fff;border-radius:18px;padding:18px;display:flex;align-items:center;gap:13px;max-width:420px}.start-more svg{color:var(--pv)}.capabilities{background:#21192b;color:#fff;display:grid;grid-template-columns:.8fr 1.2fr;gap:8vw}.cap-list div{display:flex;justify-content:space-between;padding:17px 0;border-bottom:1px solid #ffffff1f}.cap-list b{display:flex;align-items:center;gap:8px;color:#c9ff99;font-size:13px}.cap-list svg{width:16px}.early{display:grid;grid-template-columns:.65fr 1.35fr;gap:7vw;align-items:center}.early>div:last-child{max-width:750px}.early-orbit{height:360px;position:relative;border:1px solid #c9bddb;border-radius:50%;display:grid;place-items:center}.early-orbit:before,.early-orbit:after{content:'';position:absolute;border:1px solid #d9cfdf;border-radius:50%;inset:16%;transform:rotate(35deg)}.early-orbit:after{inset:33%;background:var(--pv);border:0}.early-orbit svg{position:relative;z-index:2;color:#fff;width:42px;height:42px}.final-cta{text-align:center;background:linear-gradient(135deg,#321374,#6d38e0);color:#fff}.final-cta h2{font-size:clamp(42px,5vw,74px);line-height:1;letter-spacing:-.05em;margin:20px auto;max-width:1000px}.final-cta h2 i{color:#c9ff99}.final-cta>p{color:#d8cfea;font-size:17px;margin-bottom:30px}.final-cta .promo-button{background:#c9ff99;color:#26183b!important;box-shadow:none}.final-cta>div{display:flex;justify-content:center;gap:30px;margin-top:30px;font-size:12px}.final-cta>div span{display:flex;align-items:center;gap:6px}.final-cta svg{width:15px}footer{min-height:120px;background:#17131f;color:#fff;padding:35px 5vw;display:flex;align-items:center;gap:30px}footer p{color:#a99eb1;font-size:12px;margin-right:auto}footer>a:last-child{font-size:13px;color:#fff}.mobile-sticky{display:none}
        @media(max-width:900px){.promo-header nav{display:none}.hero{grid-template-columns:1fr;padding-top:25px}.hero-visual{height:520px}.audience,.benefits,.boost,.conversation,.custom,.capabilities,.early{grid-template-columns:1fr}.section-heading{max-width:650px}.feature-grid{margin-top:25px}.conversation-copy{grid-row:1}.timeline{grid-template-columns:1fr 1fr}.early-orbit{display:none}.promo-section{padding:80px 6vw}}
        @media(max-width:600px){.promo-header{height:64px;padding:0 18px}.promo-header .promo-login{font-size:12px;padding:9px 13px}.hero{padding:28px 18px 80px;min-height:auto}.hero h1{font-size:48px}.hero-lead{font-size:16px}.hero-actions{align-items:stretch;flex-direction:column;gap:16px}.text-link{justify-content:center}.hero-facts{gap:10px}.hero-facts span{flex:1}.hero-facts b{font-size:17px}.hero-visual{height:410px;margin-top:10px}.hero-image{inset:15px 0;border-radius:95px 18px 80px 18px}.float-zero{top:24px;left:-4px;padding:12px}.float-zero b{font-size:24px}.float-boost{right:-4px;bottom:35px;padding:11px}.shop-chip{display:none}.promo-section{padding:70px 18px}.section-heading h2,.conversation h2,.boost h2,.benefit-lead h2,.custom h2,.capabilities h2,.early h2{font-size:39px}.audience-grid,.payment-grid,.feature-grid,.stats{grid-template-columns:1fr}.audience-card.c1,.audience-card.c4{background:#fff}.feature-grid article:first-child{grid-column:auto}.big-zero strong{font-size:72px}.compare{grid-template-columns:1.3fr .8fr .8fr;padding:7px;font-size:11px}.compare>*{padding:11px 6px}.flow{padding:14px 8px}.flow i svg{transform:rotate(0deg)}.pay-card{padding:25px 20px}.pay-top b{font-size:29px}.boost-copy ul{grid-template-columns:1fr}.boost-ui{padding:17px;transform:none}.boost-flow{gap:3px}.product-art{width:83px;height:96px}.conversation{gap:45px}.chat-ui{min-height:410px;padding:20px}.custom-cloud{min-height:360px}.tag{font-size:12px;padding:11px 13px}.t3{font-size:18px}.timeline{grid-template-columns:1fr;border-top:0;border-left:1px solid #cbc3d0;margin-left:12px}.timeline article,.timeline article:first-child{border-left:0;border-top:1px solid #cbc3d0}.final-cta>div{align-items:flex-start;flex-direction:column;gap:9px;margin-left:auto;margin-right:auto;width:max-content}.mobile-sticky{display:block;position:fixed;left:0;right:0;bottom:0;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:#ffffffec;backdrop-filter:blur(12px);z-index:50;border-top:1px solid #ddd5e2}.mobile-sticky .promo-button{width:100%;padding:13px}footer{padding-bottom:100px;align-items:flex-start;flex-direction:column;gap:12px}footer p{margin:0}.promo-page{padding-bottom:0}}
        @media(prefers-reduced-motion:reduce){.promo-page *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
      `}</style>
    </>
  );
};

export default PromoPage;
