import { useRouter } from 'next/router';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import client from '@/data/client';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import { PlaceGrid } from '@/components/places/PlaceGrid';
import { TitleSeo } from '@/components/seo/title-seo';
import MarketplaceLayout from '@/layouts/_marketplace-layout';
import type { NextPageWithLayout } from '@/types';
import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale!, ['common'])) },
});

const normalizePlaces = (response: any) => response?.data?.data ?? response?.data ?? [];

const CommunityPage: NextPageWithLayout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const { data: community, isLoading, error } = useQuery(
    [API_ENDPOINTS.COMMUNITIES, slug],
    () => client.communities.get(slug),
    { enabled: Boolean(slug) }
  );
  const resolved = community?.data ?? community;
  const { data: placesResponse, isLoading: placesLoading } = useQuery(
    [API_ENDPOINTS.COMMUNITIES, resolved?.id, 'places'],
    () => client.communities.places(resolved.id, { limit: 30 }),
    { enabled: Boolean(resolved?.id) }
  );
  const membership = useMutation({
    mutationFn: () => resolved?.is_joined ? client.communities.leave(resolved.id) : client.communities.join(resolved.id),
    onSuccess: () => queryClient.invalidateQueries([API_ENDPOINTS.COMMUNITIES, slug]),
  });

  if (isLoading) return <div className="web2-community-loading">Загружаем сообщество…</div>;
  if (error || !resolved) return <div className="web2-state-panel"><h1>Сообщество не найдено</h1></div>;
  const places = normalizePlaces(placesResponse);

  return (
    <>
      <TitleSeo title={`${resolved.name} — SANCAN`} description={resolved.description} />
      <main className="web2-discovery-surface web2-community-detail pb-16">
        <section className="web2-community-detail-hero">
          <div className="web2-community-detail-cover">{resolved.cover?.original ? <Image src={resolved.cover.original} alt="" width={960} height={480} unoptimized /> : <span>{resolved.name.slice(0, 1)}</span>}</div>
          <div><p className="web2-eyebrow">СООБЩЕСТВО SANCAN</p><h1>{resolved.name}</h1><p>{resolved.description}</p><small><Users /> {Number(resolved.members_count || 0).toLocaleString('ru-RU')} участников · {Number(resolved.places_count || 0).toLocaleString('ru-RU')} Places</small></div>
          <button type="button" disabled={membership.isLoading} onClick={() => membership.mutate()}>{resolved.is_joined ? 'Вы вступили' : 'Вступить'}</button>
        </section>
        <div className="web2-community-detail-title"><h2>Places сообщества</h2><a href={`/places/create?community=${resolved.id}`}>Создать Place</a></div>
        {placesLoading ? <div className="web2-community-loading">Загружаем Places…</div> : places.length ? <PlaceGrid places={places} /> : <div className="web2-state-panel"><h2>Пока нет Places</h2><p>Станьте первым автором в этом сообществе.</p></div>}
      </main>
    </>
  );
};

CommunityPage.getLayout = (page) => <MarketplaceLayout>{page}</MarketplaceLayout>;
export default CommunityPage;
