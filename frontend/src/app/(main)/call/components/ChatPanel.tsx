'use client';

import { useState, useRef, useEffect } from 'react';
import { useCallContext } from '../../../../contexts/CallContext';
import { cn } from '@/lib/utils';

export default function ChatPanel() {
  const { messages, sendMessage, socket } = useCallContext();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return new Date(time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='flex flex-col h-full bg-surface'>
      <div
        ref={scrollRef}
        className='flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide'
      >
        {messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full opacity-40'>
            <span className='material-symbols-outlined text-4xl mb-2'>
              chat_bubble
            </span>
            <p className='text-xs font-medium'>
              Bắt đầu trò chuyện trong cuộc gọi
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === socket?.id;
            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col max-w-[85%]',
                  isMe ? 'ml-auto items-end' : 'mr-auto items-start',
                )}
              >
                {!isMe && (
                  <span className='text-[10px] font-bold text-on-surface-variant/70 mb-1 ml-1'>
                    {msg.senderName}
                  </span>
                )}
                <div className='flex items-end gap-1.5'>
                  {isMe && (
                    <span className='text-[9px] text-on-surface-variant/40 mb-1'>
                      {formatTime(msg.timestamp)}
                    </span>
                  )}
                  <div
                    className={cn(
                      'px-3 py-2 rounded-2xl text-[13px] leading-relaxed shadow-sm',
                      isMe
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-surface-container-high text-on-surface rounded-tl-none',
                    )}
                  >
                    {msg.message}
                  </div>
                  {!isMe && (
                    <span className='text-[9px] text-on-surface-variant/40 mb-1'>
                      {formatTime(msg.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className='p-3 border-t border-outline-variant/20 bg-surface-container-low/30 backdrop-blur-sm'>
        <form onSubmit={handleSend} className='relative group'>
          <input
            className='w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl py-2.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[13px] text-on-surface placeholder:text-on-surface-variant/50'
            placeholder='Gửi tin nhắn...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            type='text'
          />
          <button
            type='submit'
            disabled={!inputValue.trim()}
            className='absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:pointer-events-none'
          >
            <span className='material-symbols-outlined text-[18px]'>send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
