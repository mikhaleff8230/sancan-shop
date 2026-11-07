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
  // An uploaded image always wins, so replacing a banner in the admin panel
  // does not require switching a separate background mode.
  if (c.background_image)
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

function stripBackground(c: Record<string, any>) {
  if (c.background_image) return background(c);
  if (c.background_type === 'gradient')
    return {
      background: `linear-gradient(180deg, ${c.gradient_from}, ${c.gradient_to})`,
    };
  return background(c);
}
function BannerClickTarget({ href, label }: { href?: string; label: string }) {
  if (!href || href === '#') return null;
  return (
    <Link href={href} className="absolute inset-0 z-[2]" aria-label={label}>
      <span className="sr-only">{label}</span>
    </Link>
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
          <div
            style={background(m)}
            className="relative min-h-[154px] overflow-hidden rounded-[24px] bg-cover bg-center shadow-sm"
          >
            <BannerClickTarget href={m.cta_url} label="Открыть баннер" />
          </div>
        </div>
      )}
      {s && (
        <div className="web2-header-strip-frame hidden sm:block">
          <div
            style={stripBackground(s)}
            className="web2-header-strip-banner relative overflow-hidden bg-cover bg-center"
          >
            <BannerClickTarget href={s.button_url} label="Открыть промобаннер" />
          </div>
        </div>
      )}
      {h && (
        <div className="web2-home-banner-frame hidden pt-4 sm:block">
          <div className="relative grid w-full overflow-hidden rounded-[24px] shadow-sm">
            <AnimatePresence initial={false}>
              <MotionDiv
                key={heroes[hero % Math.max(heroes.length, 1)]?.id ?? hero}
                style={background(h)}
                className="web2-image-hero-banner relative col-start-1 row-start-1 w-full overflow-hidden bg-cover bg-center"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                <BannerClickTarget
                  href={h.button_one_url || h.button_two_url}
                  label="Открыть баннер"
                />
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
        </div>
      )}
    </>
  );
}
