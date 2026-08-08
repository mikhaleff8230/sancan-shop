import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import client from '@/data/client';
import { getAuthToken } from '@/data/client/token.utils';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { useRouter } from 'next/router';
import Layout from '@/layouts/_layout';
import type { NextPageWithLayout } from '@/types';
import Link from 'next/link';

const ChatPage: NextPageWithLayout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const token = getAuthToken();

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      router.push('/');
    }
  }, [token, router]);

  // Fetch conversations
  const { data: conversationsResponse, isLoading: conversationsLoading } = useQuery(
    ['chat-conversations'],
    () => client.chat.conversations(),
    {
      enabled: !!token,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const conversations = conversationsResponse?.conversations
    || conversationsResponse?.data?.data
    || conversationsResponse?.data
    || [];

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery(
    ['chat-messages', selectedConversationId],
    () => client.chat.conversation(selectedConversationId!),
    {
      enabled: !!selectedConversationId && !!token,
      refetchInterval: 8000,
    }
  );

  useEffect(() => {
    if (!selectedConversationId || !token) return;
    client.chat.markAsRead(selectedConversationId)
      .then(() => queryClient.invalidateQueries(['chat-conversations']))
      .catch(() => undefined);
  }, [selectedConversationId, token, queryClient, messagesData?.messages?.length]);

  // Set conversation from URL
  useEffect(() => {
    if (router.query.id && typeof router.query.id === 'string' && router.query.id !== 'undefined' && router.query.id !== 'null') {
      setSelectedConversationId(router.query.id);
    } else {
      setSelectedConversationId(null);
    }
  }, [router.query.id]);

  if (!token) {
    return null;
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-73px)] w-full max-w-[1440px] overflow-hidden bg-[#f5f7fb] sm:p-4 lg:p-6">
      <div className={`${selectedConversationId ? 'hidden md:block' : 'block'} w-full shrink-0 overflow-hidden border-ozon-border bg-white md:w-[380px] md:rounded-l-3xl md:border md:border-r-0`}>
        <ChatSidebar
          conversations={Array.isArray(conversations) ? conversations : []}
          selectedId={selectedConversationId}
          onSelect={(id) => {
            setSelectedConversationId(id);
            router.push(`/chat?id=${id}`, undefined, { shallow: true });
          }}
          loading={conversationsLoading}
        />
      </div>
      <div className={`${selectedConversationId ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col overflow-hidden bg-white md:rounded-r-3xl md:border md:border-ozon-border`}>
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            conversation={messagesData?.conversation}
            messages={messagesData?.messages || []}
            loading={messagesLoading}
            onBack={() => {
              setSelectedConversationId(null);
              router.push('/chat', undefined, { shallow: true });
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-[#f5f7fb]">
            <div className="text-center max-w-md px-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Выберите диалог для начала общения
              </h3>
              <p className="text-gray-500 mb-6">
                {(!conversations || conversations.length === 0)
                  ? 'У вас пока нет диалогов. Начните общение с продавцом, перейдя на страницу его магазина.'
                  : 'Выберите диалог из списка слева или начните новый, перейдя на страницу магазина.'}
              </p>
              {(!conversations || conversations.length === 0) && (
                <Link
                  href="/authors"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Найти магазины
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ChatPage.getLayout = function getLayout(page) {
  return <Layout hideSidebar immersive>{page}</Layout>;
};

ChatPage.authorization = true;

export default ChatPage;






