import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ArrowLeft, ChevronRight, GripVertical, ImagePlus, MapPin, Package, Trash2, Upload, Users, Video, X } from 'lucide-react';
import client from '@/data/client';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import { useMe, useMyShops } from '@/data/user';
import ProductAutocomplete from '@/components/place/product-autocomplete';
import HashtagAutocomplete from '@/components/places/HashtagAutocomplete';

type HashtagValue = Array<{ id?: string; name: string } | string>;
type PlaceFormData = { title: string; description: string; hashtags: HashtagValue; product_id?: string };
type Community = { id: number; name: string; slug: string; members_count?: number; is_joined?: boolean };

const IMAGE_SLOTS = 5;

const normalizeCommunities = (response: any): Community[] => {
  const payload = response?.data ?? response;
  return Array.isArray(payload) ? payload : payload?.data ?? [];
};

const normalizeHashtags = (hashtags: HashtagValue = []) => hashtags
  .map((tag) => typeof tag === 'string' ? tag.trim() : tag?.name?.trim())
  .filter((tag): tag is string => Boolean(tag));

export default function CreatePlacePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthorized } = useMe();
  const { shops = [], isLoading: shopsLoading } = useMyShops();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>(Array(IMAGE_SLOTS).fill(null));
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(Array(IMAGE_SLOTS).fill(null));
  const [videoPreview, setVideoPreview] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [location, setLocation] = useState('');
  const [formError, setFormError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<PlaceFormData>({
    defaultValues: { title: '', description: '', hashtags: [], product_id: '' },
  });

  const { data: communitiesResponse, isLoading: communitiesLoading } = useQuery(
    [API_ENDPOINTS.COMMUNITIES],
    () => client.communities.all(),
    { staleTime: 5 * 60 * 1000 }
  );
  const communities = useMemo(() => normalizeCommunities(communitiesResponse), [communitiesResponse]);
  const selectedCommunity = communities.find((community) => community.id === communityId);
  const selectedImages = imagePreviews.filter((preview): preview is string => Boolean(preview));
  const primaryImage = selectedImages[0];
  const shopId = shops[0]?.id;

  useEffect(() => {
    const preset = typeof router.query.community === 'string' ? Number(router.query.community) : null;
    if (preset && communities.some((community) => community.id === preset)) setCommunityId(preset);
  }, [communities, router.query.community]);

  useEffect(() => () => {
    if (videoPreview.startsWith('blob:')) URL.revokeObjectURL(videoPreview);
  }, [videoPreview]);

  const createPlace = useMutation({
    mutationFn: async (formData: FormData) => {
      if (selectedCommunity && !selectedCommunity.is_joined) await client.communities.join(selectedCommunity.id);
      return client.places.create(formData);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PLACES] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.COMMUNITIES] });
      const place = response?.data ?? response;
      router.push(place?.url || (place?.id ? `/places/${place.id}` : '/places'));
    },
    onError: (error: any) => {
      const validationErrors = error?.response?.data?.errors;
      const firstError = validationErrors ? Object.values(validationErrors)[0] : null;
      const message = Array.isArray(firstError)
        ? firstError[0]
        : error?.response?.data?.message || 'Не удалось опубликовать Place. Проверьте данные и попробуйте ещё раз.';
      setFormError(String(message));
    },
  });

  const handleImageChange = (index: number, file: File | null) => {
    setFormError('');
    if (file && file.size > 5 * 1024 * 1024) {
      setFormError('Фотография должна быть не больше 5 МБ.');
      return;
    }
    setImageFiles((current) => current.map((item, itemIndex) => itemIndex === index ? file : item));
    if (!file) {
      setImagePreviews((current) => current.map((item, itemIndex) => itemIndex === index ? null : item));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreviews((current) => current.map((item, itemIndex) => itemIndex === index ? String(reader.result) : item));
    reader.readAsDataURL(file);
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFormError('');
    if (!file) return setVideoPreview('');
    if (file.size > 40 * 1024 * 1024) {
      event.target.value = '';
      setFormError('Видео должно быть не больше 40 МБ.');
      return;
    }
    setVideoPreview(URL.createObjectURL(file));
  };

  const moveImage = (from: number, to: number) => {
    if (Number.isNaN(from) || from === to) return;
    setImageFiles((current) => {
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setImagePreviews((current) => {
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const onSubmit = (data: PlaceFormData) => {
    setFormError('');
    if (!isAuthorized) return setFormError('Войдите в аккаунт, чтобы создать Place.');
    const title = data.title?.trim();
    if (!title) return setFormError('Введите название Place.');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', data.description?.trim() || '');
    normalizeHashtags(getValues('hashtags')).forEach((tag) => formData.append('hashtags[]', tag));
    imageFiles.filter((file): file is File => file instanceof File).forEach((file) => formData.append('images[]', file));
    const video = videoInputRef.current?.files?.[0];
    if (video) formData.append('video', video);
    if (data.product_id) formData.append('product_ids[]', String(data.product_id));
    if (communityId) formData.append('community_id', String(communityId));
    if (location.trim()) formData.append('location', location.trim());
    createPlace.mutate(formData);
  };

  const hashtagValues = watch('hashtags') || [];

  return (
    <main className="web2-create-place-page">
      <header className="web2-create-place-heading">
        <button type="button" onClick={() => router.back()} aria-label="Назад"><ArrowLeft /></button>
        <h1>Создание Place</h1>
        <button type="button" className="web2-create-place-cancel" onClick={() => router.push('/')}><X /> Отменить</button>
      </header>

      {formError ? <div className="web2-create-place-error">{formError}</div> : null}

      <form id="create-place-form" onSubmit={handleSubmit(onSubmit)} className="web2-create-place-layout">
        <section className="web2-create-card web2-create-media-card">
          <div className="web2-create-section-title">
            <div><h2>Фото и видео</h2><p>До 5 фотографий и 1 видео. Фото можно менять местами.</p></div>
            <span>{selectedImages.length + (videoPreview ? 1 : 0)} из 6</span>
          </div>
          <div className="web2-create-media-workspace">
            <div className="web2-create-thumbnails">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className={`web2-create-media-slot ${preview ? 'has-media' : ''}`}
                  draggable={Boolean(preview)}
                  onDragStart={(event) => { setDraggedIndex(index); event.dataTransfer.setData('text/plain', String(index)); }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => { moveImage(Number(event.dataTransfer.getData('text/plain')), index); setDraggedIndex(null); }}
                  onDragEnd={() => setDraggedIndex(null)}
                >
                  {preview ? <>
                    <Image src={preview} alt={`Фото ${index + 1}`} fill unoptimized className="object-cover" />
                    <b>{index + 1}</b><GripVertical className="web2-create-drag-icon" />
                    <button type="button" onClick={() => handleImageChange(index, null)} aria-label="Удалить фото"><Trash2 /></button>
                  </> : <label><ImagePlus /><span>Фото</span><input type="file" accept="image/*" hidden onChange={(event) => handleImageChange(index, event.target.files?.[0] || null)} /></label>}
                  {draggedIndex === index ? <i /> : null}
                </div>
              ))}
              <label className={`web2-create-video-slot ${videoPreview ? 'has-media' : ''}`}>
                {videoPreview ? <video src={videoPreview} muted /> : <><Video /><span>Видео</span></>}
                <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" hidden onChange={handleVideoChange} />
                {videoPreview ? <b>▶</b> : null}
              </label>
            </div>
            <div className="web2-create-preview">
              {primaryImage ? <Image src={primaryImage} alt="" fill unoptimized className="object-contain" />
                : videoPreview ? <video src={videoPreview} controls playsInline />
                  : <label><Upload /><strong>Загрузить фотографию</strong><span>JPG, PNG или WebP до 5 МБ</span><input type="file" accept="image/*" hidden onChange={(event) => handleImageChange(0, event.target.files?.[0] || null)} /></label>}
            </div>
          </div>
        </section>

        <div className="web2-create-middle">
          <section className="web2-create-card">
            <div className="web2-create-section-title"><h2>Описание</h2><span>{watch('description')?.length || 0}/2200</span></div>
            <input className="web2-create-title-input" maxLength={255} placeholder="Название Place" {...register('title', { required: 'Введите название Place' })} />
            <textarea maxLength={2200} placeholder="Расскажите об этом…" {...register('description')} />
            {errors.title ? <small className="web2-create-field-error">{errors.title.message}</small> : null}
            <div className="web2-create-hashtags">
              <strong># Метки</strong>
              <input type="hidden" {...register('hashtags')} />
              <HashtagAutocomplete value={hashtagValues} onChange={(value) => setValue('hashtags', value, { shouldDirty: true, shouldTouch: true })} maxTags={10} />
            </div>
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
              <div className="web2-create-product-control">
                {!isAuthorized ? <small>Авторизуйтесь для привязки</small>
                  : shopsLoading ? <small>Загрузка магазинов…</small>
                    : shopId ? <ProductAutocomplete shopId={shopId} value={selectedProduct} onChange={(product) => { setSelectedProduct(product); setValue('product_id', product?.id ? String(product.id) : ''); }} />
                      : <a href="http://seller.sancan.ru/" target="_blank" rel="noreferrer">Создать магазин</a>}
              </div>
              <input type="hidden" {...register('product_id')} />
            </div>
            <label>
              <MapPin /><span><strong>Место</strong><small>{location || 'Не указано'}</small></span>
              <input value={location} maxLength={255} onChange={(event) => setLocation(event.target.value)} placeholder="Например, Москва" /><ChevronRight />
            </label>
          </section>
        </div>

        <aside className="web2-create-card web2-create-publish">
          <h2>Публикация</h2>
          <button type="submit" className="web2-create-publish-button" disabled={createPlace.isLoading}>{createPlace.isLoading ? 'Публикуем…' : 'Опубликовать'}</button>
          <div className="web2-create-status"><i /><div><strong>Готово к публикации</strong><p>{selectedImages.length} фото · {videoPreview ? 1 : 0} видео</p></div></div>
          {selectedCommunity ? <div className="web2-create-summary"><span>Выбранное сообщество</span><strong>{selectedCommunity.name}</strong><small>{Number(selectedCommunity.members_count || 0).toLocaleString('ru-RU')} участников</small></div> : null}
          {selectedProduct ? <div className="web2-create-summary"><span>Связанный товар</span><strong>{selectedProduct.name}</strong></div> : null}
          {normalizeHashtags(hashtagValues).length ? <div className="web2-create-summary"><span>Метки</span><strong>{normalizeHashtags(hashtagValues).map((tag) => `#${tag}`).join(' ')}</strong></div> : null}
          {location ? <div className="web2-create-summary"><span>Место</span><strong>{location}</strong></div> : null}
          <p className="web2-create-note">После публикации Place появится в вашем профиле и в выбранном сообществе.</p>
        </aside>
      </form>
    </main>
  );
}
