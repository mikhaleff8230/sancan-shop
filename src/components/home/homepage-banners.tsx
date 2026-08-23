import { HttpClient } from '@/data/client/http-client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const MotionDiv = motion.div as any;

type Banner = {
  id?: number;
  kind: 'hero' | 'strip' | 'mobile';
  content: Record<string, any>;
};
const defaults: Banner[] = [
  {
    kind: 'strip',
    content: {
      background_type: 'gradient',
      gradient_from: '#ef68d5',
      gradient_to: '#4255ff',
      gradient_angle: 90,
      text: 'РАСПРОДАЖА УЖЕ НАЧАЛАСЬ',
      text_color: '#ffffff',
      button_text: 'Забрать сейчас',
      button_url: '#',
      button_color: '#ffffff',
      button_background: '#0b2548',
    },
  },
  {
    kind: 'hero',
    content: {
      background_type: 'color',
      background_color: '#ffe72e',
      eyebrow: 'SANCAN Маркет',
      eyebrow_color: '#111827',
      eyebrow_background: '#ffffff',
      title: 'Цены напрямую от продавцов',
      title_color: '#000000',
      description:
        'Новые товары, подборки и выгодные предложения в одном каталоге.',
      description_color: '#3f3a16',
      button_one_text: 'Промокод SANCAN',
      button_one_url: '#',
      button_one_color: '#111827',
      button_one_background: '#ffffff',
      button_two_text: 'Скидки до 80%',
      button_two_url: '#',
      button_two_color: '#ffffff',
      button_two_background: '#8057ff',
      card_text: 'Корзина сама себя не оплатит',
      card_badge: '%',
      card_note: '0+',
      card_background: '#8a65ff',
      card_text_color: '#ffffff',
    },
  },
  {
    kind: 'mobile',
    content: {
      background_type: 'image',
      background_image: '/images/sancan-seller-hero.webp',
      title: 'Цены напрямую от продавцов',
      title_color: '#ffffff',
      cta_text: 'Выгода до 70%',
      cta_url: '/explore',
      cta_color: '#ffffff',
      cta_background: '#24143f',
    },
  },
];
const apiRoot = (
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'https://api.sancan.ru'
).replace(/\/api\/?$/, '');
function background(c: Record<string, any>) {
  if (c.background_type === 'image' && c.background_image)
    return {
      backgroundImage: `url(${
        c.background_image.startsWith('/')
          ? c.background_image
          : `${apiRoot}/storage/${c.background_image}`
      })`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  if (c.background_type === 'gradient')
    return {
      background: `linear-gradient(${c.gradient_angle || 90}deg, ${
        c.gradient_from
      }, ${c.gradient_to})`,
    };
  return { background: c.background_color || '#ffe72e' };
}
function Action({
  href,
  children,
  style,
  className,
}: {
  href?: string;
  children: any;
  style: any;
  className: string;
}) {
  return href && href !== '#' ? (
    <Link href={href} style={style} className={className}>
      {children}
    </Link>
  ) : (
    <span style={style} className={className}>
      {children}
    </span>
  );
}

export default function HomepageBanners() {
  const [rows, setRows] = useState<Banner[]>(defaults),
    [autoplay, setAutoplay] = useState(true),
    [interval, setIntervalValue] = useState(5000),
    [hero, setHero] = useState(0),
    [strip, setStrip] = useState(0);
  useEffect(() => {
    HttpClient.get<any>('/api/homepage-banners')
      .then((d) => {
        if (d.banners?.length) setRows(d.banners);
        setAutoplay(d.autoplay);
        setIntervalValue(d.interval_ms || 5000);
      })
      .catch((error) => {
        if (process.env.NODE_ENV === 'development')
          console.error('Homepage banners request failed', error);
      });
  }, []);
  const heroes = useMemo(() => rows.filter((x) => x.kind === 'hero'), [rows]),
    strips = useMemo(() => rows.filter((x) => x.kind === 'strip'), [rows]),
    mobiles = useMemo(() => rows.filter((x) => x.kind === 'mobile'), [rows]);
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => {
      setHero((x) => (heroes.length ? (x + 1) % heroes.length : 0));
      setStrip((x) => (strips.length ? (x + 1) % strips.length : 0));
    }, interval);
    return () => window.clearInterval(timer);
  }, [autoplay, interval, heroes.length, strips.length]);
  const s = strips[strip % Math.max(strips.length, 1)]?.content,
    h = heroes[hero % Math.max(heroes.length, 1)]?.content,
    m = (mobiles[0] || defaults.find((x) => x.kind === 'mobile'))?.content;
  return (
    <>
      {m && (
        <div className="px-3 pt-3 sm:hidden">
          <div style={background(m)} className="relative min-h-[154px] overflow-hidden rounded-[24px] p-5 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
            <div className="relative z-[1] flex min-h-[114px] max-w-[62%] flex-col items-start justify-center">
              <h1 style={{ color: m.title_color }} className="text-[24px] font-extrabold leading-[1.05]">{m.title}</h1>
              {m.cta_text && <Action href={m.cta_url} style={{ color: m.cta_color, background: m.cta_background }} className="mt-4 inline-flex rounded-lg px-3 py-2 text-sm font-bold">{m.cta_text} ›</Action>}
            </div>
          </div>
        </div>
      )}
      {s && (
        <div className="sancan-ozon-container hidden pt-3 sm:block">
          <div
            style={background(s)}
            className="relative flex min-h-[52px] items-center justify-center overflow-hidden rounded-[18px] px-4 text-center shadow-sm"
          >
            <span
              style={{ color: s.text_color }}
              className="relative text-sm font-extrabold uppercase tracking-wide md:text-lg"
            >
              {s.text}
            </span>
            {s.button_text && (
              <Action
                href={s.button_url}
                style={{
                  color: s.button_color,
                  background: s.button_background,
                }}
                className="relative ml-3 hidden rounded-full px-4 py-2 text-sm font-bold md:inline-flex"
              >
                {s.button_text}
              </Action>
            )}
          </div>
        </div>
      )}
      {h && (
        <div className="sancan-ozon-container hidden overflow-hidden pt-3 sm:block">
          <AnimatePresence initial={false} mode="popLayout">
          <MotionDiv
            key={heroes[hero % Math.max(heroes.length, 1)]?.id ?? hero}
            style={background(h)}
            className="relative min-h-[210px] overflow-hidden rounded-[22px] px-6 py-7 shadow-sm md:min-h-[270px] md:px-12 lg:px-16"
            initial={{ x: '100%', opacity: 0.65 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.65 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            {heroes.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Предыдущий баннер"
                  onClick={() =>
                    setHero((x) => (x - 1 + heroes.length) % heroes.length)
                  }
                  className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl shadow-sm"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Следующий баннер"
                  onClick={() => setHero((x) => (x + 1) % heroes.length)}
                  className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl shadow-sm"
                >
                  ›
                </button>
              </>
            )}
            <div className="relative z-[1] grid gap-6 md:grid-cols-[1fr_380px] md:items-center">
              <div>
                {h.eyebrow && (
                  <div
                    style={{
                      color: h.eyebrow_color,
                      background: h.eyebrow_background,
                    }}
                    className="mb-5 inline-flex rounded-[28px] px-5 py-3 text-lg font-black shadow-sm md:text-2xl"
                  >
                    {h.eyebrow}
                  </div>
                )}
                <h1
                  style={{ color: h.title_color }}
                  className="max-w-[620px] text-4xl font-black leading-[0.95] tracking-[-0.02em] md:text-6xl"
                >
                  {h.title}
                </h1>
                <p
                  style={{ color: h.description_color }}
                  className="mt-5 max-w-[520px] text-base font-semibold md:text-lg"
                >
                  {h.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {h.button_one_text && (
                    <Action
                      href={h.button_one_url}
                      style={{
                        color: h.button_one_color,
                        background: h.button_one_background,
                      }}
                      className="rounded-2xl px-5 py-3 text-sm font-black shadow-sm"
                    >
                      {h.button_one_text}
                    </Action>
                  )}
                  {h.button_two_text && (
                    <Action
                      href={h.button_two_url}
                      style={{
                        color: h.button_two_color,
                        background: h.button_two_background,
                      }}
                      className="rounded-2xl px-5 py-3 text-sm font-black shadow-sm"
                    >
                      {h.button_two_text}
                    </Action>
                  )}
                </div>
              </div>
              <div
                style={{
                  color: h.card_text_color,
                  background: h.card_background,
                }}
                className="relative hidden h-[210px] rounded-[32px] p-6 shadow-[0_20px_50px_rgba(91,58,255,0.28)] md:block"
              >
                <div className="absolute right-7 top-8 rotate-6 rounded-2xl bg-white px-5 py-4 text-4xl font-black text-ozon-pink shadow-lg">
                  {h.card_badge}
                </div>
                <div className="absolute bottom-8 left-8 max-w-[240px] text-3xl font-black leading-tight">
                  {h.card_text}
                </div>
                <div className="absolute bottom-6 right-7 text-2xl font-bold opacity-60">
                  {h.card_note}
                </div>
              </div>
            </div>
            {heroes.length > 1 && (
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {heroes.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Баннер ${i + 1}`}
                    onClick={() => setHero(i)}
                    className={`h-2 rounded-full bg-white shadow ${
                      i === hero ? 'w-7' : 'w-2 opacity-70'
                    }`}
                  />
                ))}
              </div>
            )}
          </MotionDiv>
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
