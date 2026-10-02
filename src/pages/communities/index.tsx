import { TitleSeo } from '@/components/seo/title-seo';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import client from '@/data/client';
import { API_ENDPOINTS } from '@/data/client/endpoints';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale!, ['common'])) },
  revalidate: 60,
});

const normalize = (response: any) => {
  const payload = response?.data ?? response;
  return Array.isArray(payload) ? payload : payload?.data ?? [];
};

const CommunitiesPage: NextPageWithLayout = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useQuery(
    [API_ENDPOINTS.COMMUNITIES],
    () => client.communities.all(),
    { staleTime: 60_000 }
  );
  const communities = useMemo(() => normalize(data), [data]);
  const visible = communities.filter((community: any) =>
    `${community.name} ${community.description || ''}`.toLowerCase().includes(search.toLowerCase())
  );
  const membership = useMutation({
    mutationFn: ({ id, joined }: { id: number; joined: boolean }) => joined ? client.communities.leave(id) : client.communities.join(id),
    onSuccess: () => queryClient.invalidateQueries([API_ENDPOINTS.COMMUNITIES]),
  });

  return (
    <>
      <TitleSeo title="Сообщества — SANCAN" description="Тематические сообщества людей, идей и Places SANCAN." />
      <main className="web2-discovery-surface web2-communities-page pb-16">
        <section className="web2-communities-hero">
          <div><p className="web2-eyebrow">SANCAN / COMMUNITIES</p><h1>Сообщества</h1><p>Люди, идеи и проекты, которые вас вдохновляют.</p></div>
          <div className="web2-community-search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти сообщество" /></div>
        </section>

        <nav className="web2-community-chips" aria-label="Темы сообществ">
          <button className="is-active">Все</button>
          {communities.slice(0, 8).map((community: any) => <Link key={community.id} href={`/community/${community.slug}`}>{community.name}</Link>)}
        </nav>

        {isLoading ? <div className="web2-community-loading">Загружаем сообщества…</div> : null}
        {error ? <div className="web2-state-panel"><h2>Не удалось загрузить</h2><p>Попробуйте обновить страницу.</p></div> : null}

        {!isLoading && !error ? (
          <>
            <section className="web2-community-featured" aria-label="Системные сообщества">
              {visible.slice(0, 5).map((community: any, index: number) => (
                <article className={`web2-community-feature web2-community-tone-${index % 5}`} key={community.id}>
                  <Link href={`/community/${community.slug}`}><div className="web2-community-feature-cover">{community.cover?.original ? <Image src={community.cover.original} alt="" width={640} height={280} unoptimized /> : <span>{community.name.slice(0, 1)}</span>}</div></Link>
                  <div><Link href={`/community/${community.slug}`}><strong>{community.name}</strong><small>{Number(community.members_count || 0).toLocaleString('ru-RU')} участников</small></Link>
                    <button type="button" disabled={membership.isLoading} onClick={() => membership.mutate({ id: community.id, joined: Boolean(community.is_joined) })}>{community.is_joined ? 'Вы вступили' : 'Вступить'}</button>
                  </div>
                </article>
              ))}
            </section>

            <div className="web2-community-body">
              <aside className="web2-community-side-nav">
                <strong>Навигация</strong>
                <a className="is-active">Лента сообществ</a><a>Мои сообщества</a><a>Популярное</a><a>Новые</a><a>Сохранённое</a>
              </aside>
              <section className="web2-community-directory">
                <div className="web2-community-directory-title"><div><h2>Системные сообщества SANCAN</h2><p>Единые темы для web, mobile и создания Places.</p></div><Users /></div>
                <div className="web2-community-directory-grid">
                  {visible.map((community: any, index: number) => (
                    <article key={community.id}>
                      <Link href={`/community/${community.slug}`} className={`web2-community-avatar web2-community-tone-${index % 5}`}>{community.avatar?.original ? <Image src={community.avatar.original} alt="" width={96} height={96} unoptimized /> : community.name.slice(0, 1)}</Link>
                      <div><Link href={`/community/${community.slug}`}><h3>{community.name}</h3></Link><p>{community.description}</p><small>{Number(community.places_count || 0).toLocaleString('ru-RU')} Places</small></div>
                      <button type="button" onClick={() => membership.mutate({ id: community.id, joined: Boolean(community.is_joined) })}>{community.is_joined ? 'В сообществе' : 'Вступить'}</button>
                    </article>
                  ))}
                </div>
              </section>
              <aside className="web2-community-recommended">
                <h3>Рекомендуемые сообщества</h3>
                {communities.slice(5, 10).map((community: any, index: number) => (
                  <Link href={`/community/${community.slug}`} key={community.id}><span className={`web2-community-tone-${index % 5}`}>{community.name.slice(0, 1)}</span><div><strong>{community.name}</strong><small>{Number(community.members_count || 0).toLocaleString('ru-RU')} участников</small></div><b>→</b></Link>
                ))}
              </aside>
            </div>
          </>
        ) : null}
      </main>
    </>
  );
};

CommunitiesPage.getLayout = (page) => <MarketplaceLayout>{page}</MarketplaceLayout>;
export default CommunitiesPage;
