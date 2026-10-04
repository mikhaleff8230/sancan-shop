import Link from 'next/link';

const topics = [
  { label: 'Все', href: '/places' },
  { label: 'Искусство', href: '/community/art' },
  { label: 'Интерьер', href: '/community/interior' },
  { label: 'Fashion', href: '/community/fashion' },
  { label: 'Handmade', href: '/community/handmade' },
  { label: 'Design', href: '/community/design' },
  { label: 'Архитектура', href: '/community/architecture' },
  { label: 'Фото', href: '/community/photography' },
];

export default function PlaceTopicBar({ allHref = '/places' }: { allHref?: string }) {
  return (
    <nav className="web2-topic-bar" aria-label="Темы">
      {topics.map((topic, index) => (
        <Link
          key={topic.label}
          href={index === 0 ? allHref : topic.href}
          className={index === 0 ? 'web2-topic-chip web2-topic-chip-active' : 'web2-topic-chip'}
        >
          {topic.label}
        </Link>
      ))}
    </nav>
  );
}
