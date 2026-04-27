'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useChat } from '@/contexts/ChatContext';
import { ChatWindow } from '../components/ChatWindow';

const ChatIdPage = () => {
  const { chatId } = useParams();
  const { setCurrentConversationById } = useChat();

  useEffect(() => {
    if (chatId) {
      setCurrentConversationById(chatId as string);
    }
  }, [chatId]);

  return <ChatWindow />;
};

export default ChatIdPage;
