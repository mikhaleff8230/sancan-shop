import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ArrowLeft, ChevronRight, ImagePlus, MapPin, MessageCircle, Package, Settings2, Trash2, Upload, Users, X } from 'lucide-react';
import client from '@/data/client';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import { useMe, useMyShops } from '@/data/user';
import ProductAutocomplete from '@/components/place/product-autocomplete';

type Community = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: { thumbnail?: string; original?: string };
  members_count?: number;
};

const normalizeCommunities = (response: any): Community[] => {
  const payload = response?.data ?? response;
  return Array.isArray(payload) ? payload : payload?.data ?? [];
};

export default function CreatePlacePage() {
  const router = useRouter();
  const { isAuthorized } = useMe();
  const { shops = [], isLoading: shopsLoading } = useMyShops();
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [altText, setAltText] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');

  const { data: communitiesResponse, isLoading: communitiesLoading } = useQuery(
    [API_ENDPOINTS.COMMUNITIES],
    () => client.communities.all(),
    { staleTime: 5 * 60 * 1000 }
  );
  const communities = useMemo(() => normalizeCommunities(communitiesResponse), [communitiesResponse]);
  const selectedCommunity = communities.find((item) => item.id === communityId);
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews]);
  useEffect(() => {
    const preset = typeof router.query.community === 'string' ? Number(router.query.community) : null;
    if (preset && communities.some((item) => item.id === preset)) setCommunityId(preset);
  }, [communities, router.query.community]);

  const publish = useMutation({
    mutationFn: (formData: FormData) => client.places.create(formData),
    onSuccess: (place: any) => {
      const result = place?.data ?? place;
      router.push(result?.url || (result?.id ? `/places/${result.id}` : '/'));
    },
    onError: (requestError: any) => {
      const message = requestError?.response?.data?.message;
      setError(typeof message === 'string' ? message : 'Не удалось опубликовать Place. Проверьте поля и попробуйте ещё раз.');
    },
  });

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const accepted = Array.from(incoming).filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));
    setFiles((current) => [...current, ...accepted].slice(0, 20));
  };

  const moveFile = (from: number, to: number) => {
    if (Number.isNaN(from) || from === to) return;
    setFiles((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const handlePublish = () => {
    setError('');
    if (!isAuthorized) return setError('Войдите в аккаунт, чтобы создать Place.');
    if (!title.trim()) return setError('Добавьте название Place.');
    if (files.length === 0) return setError('Добавьте хотя бы одно фото или видео.');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    if (communityId) formData.append('community_id', String(communityId));
    if (location.trim()) formData.append('location', location.trim());
    if (altText.trim()) formData.append('alt_text', altText.trim());
    formData.append('allow_comments', allowComments ? '1' : '0');
    if (selectedProduct?.id) formData.append('product_ids[]', String(selectedProduct.id));
    files.forEach((file) => formData.append(file.type.startsWith('video/') ? 'videos[]' : 'images[]', file));
    publish.mutate(formData);
  };

  const imageCount = files.filter((file) => file.type.startsWith('image/')).length;
  const videoCount = files.filter((file) => file.type.startsWith('video/')).length;
  const primaryPreview = previews[0];
  const shopId = shops[0]?.id;

  return (
    <main className="web2-create-place-page">
      <header className="web2-create-place-heading">
        <button type="button" onClick={() => router.back()} aria-label="Назад"><ArrowLeft /></button>
        <h1>Создание Place</h1>
        <button type="button" className="web2-create-place-cancel" onClick={() => router.push('/')}><X /> Отменить</button>
      </header>

      {error ? <div className="web2-create-place-error">{error}</div> : null}

      <div className="web2-create-place-layout">
        <section className="web2-create-card web2-create-media-card">
          <div className="web2-create-section-title">
            <div><h2>Фото и видео</h2><p>До 20 файлов. Перетащите миниатюры, чтобы изменить порядок.</p></div>
            <span>{files.length} из 20</span>
          </div>
          <div className="web2-create-media-workspace">
            <div className="web2-create-thumbnails">
              {previews.map(({ file, url }, index) => (
                <button type="button" key={`${file.name}-${file.lastModified}`} draggable
                  onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => moveFile(Number(event.dataTransfer.getData('text/plain')), index)}
                  className={index === 0 ? 'is-active' : ''}>
                  {file.type.startsWith('video/') ? <video src={url} muted /> : <Image src={url} alt="" fill unoptimized className="object-cover" />}
                  <b>{index + 1}</b>
                  <span onClick={(event) => { event.stopPropagation(); setFiles((items) => items.filter((_, itemIndex) => itemIndex !== index)); }}><Trash2 /></span>
                </button>
              ))}
              <button type="button" className="web2-create-add-media" onClick={() => mediaInputRef.current?.click()}>
                <ImagePlus /><span>Добавить<br />фото или видео</span>
              </button>
            </div>
            <div className="web2-create-preview">
              {primaryPreview ? (
                primaryPreview.file.type.startsWith('video/')
                  ? <video src={primaryPreview.url} controls />
                  : <Image src={primaryPreview.url} alt={altText || ''} fill unoptimized className="object-contain" />
              ) : (
                <button type="button" onClick={() => mediaInputRef.current?.click()}><Upload /><strong>Загрузить медиа</strong><span>Фото или видео для вашего Place</span></button>
              )}
            </div>
          </div>
          <input ref={mediaInputRef} type="file" accept="image/*,video/mp4,video/webm" multiple hidden onChange={(event) => addFiles(event.target.files)} />
        </section>

        <div className="web2-create-middle">
          <section className="web2-create-card">
            <div className="web2-create-section-title"><h2>Описание</h2><span>{description.length}/2200</span></div>
            <input className="web2-create-title-input" value={title} maxLength={255} onChange={(event) => setTitle(event.target.value)} placeholder="Название Place" />
            <textarea value={description} maxLength={2200} onChange={(event) => setDescription(event.target.value)} placeholder="Расскажите об этом…" />
          </section>

          <section className="web2-create-card web2-create-options">
            <label>
              <Users /><span><strong>Сообщество</strong><small>{selectedCommunity?.name || 'Выберите тематическое сообщество'}</small></span>
              <select value={communityId ?? ''} disabled={communitiesLoading} onChange={(event) => setCommunityId(event.target.value ? Number(event.target.value) : null)}>
                <option value="">Не выбрано</option>
                {communities.map((community) => <option value={community.id} key={community.id}>{community.name}</option>)}
              </select><ChevronRight />
            </label>
            <div className="web2-create-product-row">
              <Package /><span><strong>Связать товар</strong><small>{selectedProduct?.name || 'Необязательно'}</small></span>
              <div className="min-w-0 flex-1">
                {isAuthorized && !shopsLoading && shopId ? <ProductAutocomplete shopId={shopId} value={selectedProduct} onChange={setSelectedProduct} /> : <small>{shopsLoading ? 'Загрузка…' : 'Доступно владельцу магазина'}</small>}
              </div>
            </div>
            <label>
              <MapPin /><span><strong>Место</strong><small>{location || 'Не указано'}</small></span>
              <input value={location} maxLength={255} onChange={(event) => setLocation(event.target.value)} placeholder="Например, Москва" /><ChevronRight />
            </label>
            <div className="web2-create-settings-title"><Settings2 /> Дополнительные настройки</div>
            <label className="web2-create-switch-row">
              <MessageCircle /><span><strong>Разрешить комментарии</strong><small>Пользователи смогут комментировать этот Place</small></span>
              <input type="checkbox" checked={allowComments} onChange={(event) => setAllowComments(event.target.checked)} />
            </label>
            <label className="web2-create-alt-row">
              <ImagePlus /><span><strong>Альтернативный текст</strong><small>Опишите, что изображено на медиа</small></span>
              <textarea value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={1000} placeholder="Описание для доступности…" />
            </label>
          </section>
        </div>

        <aside className="web2-create-card web2-create-publish">
          <h2>Публикация</h2>
          <button type="button" className="web2-create-publish-button" disabled={publish.isLoading} onClick={handlePublish}>{publish.isLoading ? 'Публикуем…' : 'Опубликовать'}</button>
          <div className="web2-create-status"><i /><div><strong>Готово к публикации</strong><p>{imageCount} фото · {videoCount} видео{selectedCommunity ? ` · ${selectedCommunity.name}` : ''}{location ? ` · ${location}` : ''}</p></div></div>
          {selectedCommunity ? <div className="web2-create-summary"><span>Выбранное сообщество</span><strong>{selectedCommunity.name}</strong><small>{selectedCommunity.members_count?.toLocaleString('ru-RU') || 0} участников</small></div> : null}
          {selectedProduct ? <div className="web2-create-summary"><span>Связанный товар</span><strong>{selectedProduct.name}</strong></div> : null}
          {location ? <div className="web2-create-summary"><span>Место</span><strong>{location}</strong></div> : null}
          <p className="web2-create-note">После публикации Place появится в вашем профиле и в выбранном сообществе.</p>
        </aside>
      </div>
    </main>
  );
}
