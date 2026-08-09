import { useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';
import { Loader2, MessageCircle, Search } from 'lucide-react';
import { useMe } from '@/data/user';

dayjs.extend(relativeTime);
dayjs.locale('ru');

interface Conversation {
  id: string;
  title?: string;
  type: 'private' | 'group';
  latest_message?: {
    id: string;
    body: string;
    created_at: string;
    user?: {
      id: string;
      name: string;
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  shop?: {
    id: string;
    name: string;
  };
  unseen?: number;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export default function ChatSidebar({
  conversations,
  selectedId,
  onSelect,
  loading,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { me } = useMe();

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.title?.toLowerCase().includes(query) ||
      conv.user?.name.toLowerCase().includes(query) ||
      conv.shop?.name.toLowerCase().includes(query) ||
      conv.latest_message?.body.toLowerCase().includes(query)
    );
  });

  const getConversationName = (conv: Conversation) => {
    if (conv.title) return conv.title;
    if (conv.type === 'private') {
      return String(conv.user?.id) === String(me?.id)
        ? conv.shop?.name || 'Продавец SANCAN'
        : conv.user?.name || conv.shop?.name || 'Безымянный диалог';
    }
    return 'Групповой чат';
  };

  const getConversationAvatar = (conv: Conversation) => {
    // Простой аватар на основе имени
    const name = getConversationName(conv);
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="border-b border-ozon-border p-5">
        <h2 className="text-xl font-semibold text-gray-900">Сообщения</h2>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ozon-muted" />
          <input
            type="text"
            placeholder="Поиск диалогов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-full border border-transparent bg-[#f5f7fb] pl-11 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            {searchQuery ? (
              <div className="text-gray-500">
                <p className="text-sm">Диалоги не найдены</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                  <MessageCircle className="h-8 w-8 text-brand" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет диалогов</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-xs">
                  Начните общение с продавцом, перейдя на страницу его магазина и нажав кнопку &quot;Написать продавцу&quot;
                </p>
                <Link
                  href="/shops"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Перейти к магазинам
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full border-l-4 px-4 py-4 text-left transition-colors hover:bg-brand-50/50 ${
                  String(selectedId) === String(conv.id) ? 'border-brand bg-brand-50' : 'border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white font-bold">
                      {getConversationAvatar(conv)}
                    </div>
                    {Number(conv.unseen) > 0 && (
                      <div className="relative -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unseen > 9 ? '9+' : conv.unseen}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getConversationName(conv)}
                      </p>
                      {conv.latest_message && (
                        <p className="text-xs text-gray-500 ml-2">
                          {dayjs(conv.latest_message.created_at).fromNow()}
                        </p>
                      )}
                    </div>
                    {conv.latest_message && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conv.latest_message.user?.name && (
                          <span className="font-medium">
                            {conv.latest_message.user.name}:{' '}
                          </span>
                        )}
                        {conv.latest_message.body}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


