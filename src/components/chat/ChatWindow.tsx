import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/data/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';
import { usePusher } from '@/hooks/usePusher';
import { useMe } from '@/data/user';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Paperclip, Send, X } from 'lucide-react';

dayjs.extend(relativeTime);
dayjs.locale('ru');

interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  body: string;
  read_at: string | null;
  attachments?: Array<{
    id: string;
    file_path: string;
    file_type: string;
    file_name: string;
    file_size: number;
  }>;
  chat_attachments?: Message['attachments'];
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: string;
  title?: string;
  type: 'private' | 'group';
  user?: {
    id: string;
    name: string;
  };
  shop?: {
    id: string;
    name: string;
  };
}

interface ChatWindowProps {
  conversationId: string;
  conversation?: Conversation;
  messages: Message[];
  loading?: boolean;
  onBack?: () => void;
}

export default function ChatWindow({
  conversationId,
  conversation,
  messages,
  loading,
  onBack,
}: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { me } = useMe();

  // Subscribe to Pusher channel
  usePusher(`conversation.${conversationId}`, 'message.sent', (data: Message) => {
    queryClient.setQueryData(['chat-messages', conversationId], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        messages: oldData.messages.some((message: Message) => String(message.id) === String(data.id))
          ? oldData.messages
          : [...oldData.messages, data],
      };
    });
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation(
    (data: { body?: string; attachments?: File[] }) =>
      client.chat.sendMessage({
        conversation_id: conversationId,
        body: data.body,
        attachments: data.attachments,
      }),
    {
      onSuccess: () => {
        setMessageText('');
        setSelectedFiles([]);
        queryClient.invalidateQueries(['chat-messages', conversationId]);
        queryClient.invalidateQueries(['chat-conversations']);
      },
      onError: (error: any) => {
        console.error('Error sending message:', error);
        toast.error(error?.response?.data?.message || 'Ошибка при отправке сообщения');
      },
    }
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем валидность conversationId
    if (!conversationId || conversationId === 'undefined' || conversationId === 'null') {
      console.error('Invalid conversationId:', conversationId);
      toast.error('Ошибка: неверный ID диалога');
      return;
    }
    
    if (!messageText.trim() && selectedFiles.length === 0) return;

    sendMessageMutation.mutate({
      body: messageText,
      attachments: selectedFiles.length > 0 ? selectedFiles : undefined,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const tooLarge = files.find((file) => file.size > 10 * 1024 * 1024);
      if (tooLarge) {
        toast.error(`Файл «${tooLarge.name}» больше 10 МБ`);
        e.target.value = '';
        return;
      }
      setSelectedFiles(files);
    }
  };

  const getConversationName = () => {
    if (conversation?.title) return conversation.title;
    if (conversation?.type === 'private') {
      return String(conversation.user?.id) === String(me?.id)
        ? conversation.shop?.name || 'Продавец SANCAN'
        : conversation.user?.name || conversation.shop?.name || 'Безымянный диалог';
    }
    return 'Групповой чат';
  };

  const currentUserId = me?.id;
  const apiUrl = (process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:8000').replace(/\/$/, '');

  if (loading && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Header */}
      <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-ozon-border bg-white px-4 sm:px-6">
        <button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-light-200 md:hidden" aria-label="Назад к диалогам">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
          {getConversationName().charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-ozon-text">{getConversationName()}</h3>
          <p className="text-xs font-medium text-ozon-muted">Продавец SANCAN</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#f5f7fb] p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Нет сообщений. Начните общение!
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = String(message.user_id) === String(currentUserId);
            const attachments = message.attachments || message.chat_attachments || [];
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 shadow-sm sm:max-w-md ${
                    isOwn
                      ? 'rounded-[20px_20px_6px_20px] bg-brand text-white'
                      : 'rounded-[20px_20px_20px_6px] bg-white text-ozon-text'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium mb-1 opacity-75">
                      {message.user.name}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                  
                  {/* Attachments */}
                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="mt-2">
                          {attachment.file_type === 'image' ? (
                            <img
                              src={`${apiUrl}/storage/${attachment.file_path}`}
                              alt={attachment.file_name}
                              className="max-w-full rounded-lg"
                            />
                          ) : (
                            <a
                              href={`${apiUrl}/storage/${attachment.file_path}`}
                              download
                              className="text-sm underline hover:no-underline"
                            >
                              📎 {attachment.file_name}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${isOwn ? 'text-white/75' : 'text-ozon-muted'}`}>
                    {dayjs(message.created_at).format('HH:mm')}
                    {message.read_at && isOwn && ' ✓✓'}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-ozon-border bg-white px-3 py-3 sm:px-5">
        {selectedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand"
              >
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
                  }
                  className="text-[0px] text-ozon-muted hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-light-200 text-[0px] text-ozon-text transition hover:bg-brand-50 hover:text-brand"
          >
            <Paperclip className="h-5 w-5" />
          </label>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Введите сообщение..."
            className="h-11 min-w-0 flex-1 rounded-full border border-ozon-border bg-[#f5f7fb] px-5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
          <button
            type="submit"
            disabled={sendMessageMutation.isLoading || (!messageText.trim() && selectedFiles.length === 0)}
            aria-label="Отправить"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-[0px] text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sendMessageMutation.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
