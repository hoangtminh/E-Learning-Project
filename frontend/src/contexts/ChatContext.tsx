'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { chatSocket, notificationSocket } from '@/lib/socket';
import { usePathname } from 'next/navigation';
import { chatApi, Message, Conversation, ConversationType } from '@/api/chat';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  hasMore: boolean;
  messageLoadingError: boolean;
  fetchConversations: () => Promise<void>;
  setCurrentConversationById: (id: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  retryLoadMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  createConversation: (data: {
    title: string;
    participantEmails: string[];
    type?: ConversationType;
  }) => Promise<void>;
  addMember: (conversationId: string, userId: string) => Promise<void>;
  removeMember: (conversationId: string, userId: string) => Promise<void>;
  showInfo: boolean;
  setShowInfo: (show: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [messageLoadingError, setMessageLoadingError] = useState(false);
  const [page, setPage] = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await chatApi.getConversations();
      if (res.success && res.data) {
        // Map last message for UI convenience
        const mappedConversations = res.data.map((conv) => ({
          ...conv,
          lastMessage: conv.messages?.[0]?.content || 'Chưa có tin nhắn',
        }));
        setConversations(mappedConversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (conversationId: string, pageNum: number) => {
      setIsLoadingMessages(true);
      setMessageLoadingError(false);
      setHasMore(true);
      try {
        const res = await chatApi.getMessages(conversationId, pageNum);
        if (res.success && res.data) {
          const newMessages = res.data;
          if (pageNum === 1) {
            setMessages(newMessages);
          } else {
            setMessages((prev) => [...prev, ...newMessages.reverse()]);
          }
          setHasMore(newMessages.length > 15);
        } else {
          setHasMore(false);
          setMessageLoadingError(true);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        setHasMore(false);
        setMessageLoadingError(true);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [hasMore],
  );

  const setCurrentConversationById = useCallback(
    async (id: string) => {
      setMessageLoadingError(false);
      const conv = conversations.find((c) => c.id === id);
      if (conv) {
        setCurrentConversation(conv);
      } else {
        try {
          const res = await chatApi.getConversation(id);
          if (res.success && res.data) {
            setCurrentConversation(res.data);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setPage(1);
      setHasMore(true);
      await loadMessages(id, 1);
    },
    [conversations, hasMore, loadMessages],
  );

  const loadMoreMessages = useCallback(async () => {
    if (!currentConversation || !hasMore || isLoadingMessages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadMessages(currentConversation.id, nextPage);
  }, [currentConversation, hasMore, isLoadingMessages, page, loadMessages]);

  const retryLoadMessages = useCallback(async () => {
    if (!currentConversation || isLoadingMessages) return;
    await loadMessages(currentConversation.id, page);
  }, [currentConversation, isLoadingMessages, page, loadMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentConversation || !user) return;

      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        content,
        createdAt: new Date().toISOString(),
        senderId: user.userId,
        conversationId: currentConversation.id,
        fileUrl: null,
        sender: {
          id: user.userId,
          fullName: user.fullname,
          avatarUrl: user.imageUrl || null,
        },
        status: 'pending',
      };

      // Add to UI immediately
      setMessages((prev) => [tempMessage, ...prev]);

      try {
        const res = await chatApi.sendMessage(currentConversation.id, content);
        if (res.success && res.data) {
          const serverMsg = res.data as Message;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId ? { ...serverMsg, status: 'sent' } : m,
            ),
          );
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, status: 'error' } : m)),
          );
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'error' } : m)),
        );
      }
    },
    [currentConversation, user],
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const res = await chatApi.deleteMessage(messageId);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, []);

  const createConversation = useCallback(
    async (data: {
      title: string;
      participantEmails: string[];
      type?: ConversationType;
    }) => {
      try {
        const res = await chatApi.createConversation({
          title: data.title,
          participantEmails: data.participantEmails,
          type: data.type || ConversationType.CUSTOM_GROUP,
        });
        if (res.success && res.data) {
          const newConversation = {
            ...res.data,
            lastMessage: 'Vừa tạo cuộc trò chuyện',
          };
          setConversations((prev) => [newConversation, ...prev]);
        }
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    },
    [],
  );

  const addMember = useCallback(
    async (conversationId: string, userId: string) => {
      try {
        await chatApi.addMember(conversationId, userId);
      } catch (error) {
        console.error('Failed to add member:', error);
      }
    },
    [],
  );

  const removeMember = useCallback(
    async (conversationId: string, userId: string) => {
      try {
        await chatApi.removeMember(conversationId, userId);
      } catch (error) {
        console.error('Failed to remove member:', error);
      }
    },
    [],
  );

  const pathname = usePathname();
  const isChatPage = pathname?.startsWith('/chat');

  useEffect(() => {
    if (!user || !isChatPage) {
      if (chatSocket.connected) chatSocket.disconnect();
      if (notificationSocket.connected) notificationSocket.disconnect();
      return;
    }

    // Configure and connect sockets
    chatSocket.auth = { userId: user.userId };
    notificationSocket.auth = { userId: user.userId };

    if (!chatSocket.connected) chatSocket.connect();
    if (!notificationSocket.connected) notificationSocket.connect();

    const handleNewMessage = (message: Message) => {
      console.log('Received new message:', message);

      // 1. If it's for the current conversation, update messages list
      if (
        currentConversation &&
        message.conversationId === currentConversation.id
      ) {
        if (message.senderId !== user?.userId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) {
              return prev;
            }
            return [{ ...message, status: 'sent' }, ...prev];
          });
        }
      }
      // 2. Update conversations list (sidebar) - Move to top
      setConversations((prev) => {
        const conversationIndex = prev.findIndex(
          (c) => c.id === message.conversationId,
        );

        if (conversationIndex === -1) {
          // If conversation not in list, might need to fetch all again
          return prev;
        }

        const updatedConversations = [...prev];
        const [targetConversation] = updatedConversations.splice(
          conversationIndex,
          1,
        );

        const updatedConversation = {
          ...targetConversation,
          lastMessage: message.content || 'Tin nhắn mới',
        };

        return [updatedConversation, ...updatedConversations];
      });
    };

    chatSocket.on('new_message', handleNewMessage);
    notificationSocket.on('new_message', handleNewMessage);

    return () => {
      chatSocket.off('new_message', handleNewMessage);
      notificationSocket.off('new_message', handleNewMessage);
    };
  }, [user, currentConversation, isChatPage]);

  useEffect(() => {
    if (user && isChatPage) {
      fetchConversations();
    }
  }, [user, fetchConversations, isChatPage]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        isLoading,
        isLoadingMessages,
        hasMore,
        messageLoadingError,
        fetchConversations,
        setCurrentConversationById,
        loadMoreMessages,
        retryLoadMessages,
        sendMessage,
        deleteMessage,
        createConversation,
        addMember,
        removeMember,
        showInfo,
        setShowInfo,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
