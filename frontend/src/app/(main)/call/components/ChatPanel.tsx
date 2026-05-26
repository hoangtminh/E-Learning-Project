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
    <div className='flex h-full min-h-0 flex-col bg-slate-900'>
      <div
        ref={scrollRef}
        className='scrollbar-hide min-h-0 flex-1 space-y-4 overflow-y-auto p-4'
      >
        {messages.length === 0 ? (
          <div className='flex h-full flex-col items-center justify-center text-slate-500'>
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
                  <span className='mb-1 ml-1 text-[10px] font-bold text-slate-400'>
                    {msg.senderName}
                  </span>
                )}
                <div className='flex items-end gap-1.5'>
                  {isMe && (
                    <span className='mb-1 text-[9px] text-slate-500'>
                      {formatTime(msg.timestamp)}
                    </span>
                  )}
                  <div
                    className={cn(
                      'px-3 py-2 rounded-2xl text-[13px] leading-relaxed shadow-sm',
                      isMe
                        ? 'rounded-tr-none bg-sky-600 text-white'
                        : 'rounded-tl-none bg-slate-800 text-slate-100',
                    )}
                  >
                    {msg.message}
                  </div>
                  {!isMe && (
                    <span className='mb-1 text-[9px] text-slate-500'>
                      {formatTime(msg.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className='shrink-0 border-t border-white/10 bg-slate-950/60 p-3 backdrop-blur-sm'>
        <form onSubmit={handleSend} className='relative group'>
          <input
            className='w-full rounded-xl border border-white/10 bg-slate-800 py-2.5 pl-4 pr-12 text-[13px] text-slate-100 transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/20'
            placeholder='Gửi tin nhắn...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            type='text'
          />
          <button
            type='submit'
            disabled={!inputValue.trim()}
            className='absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm transition-all hover:bg-sky-500 active:scale-95 disabled:pointer-events-none disabled:opacity-30'
          >
            <span className='material-symbols-outlined text-[18px]'>send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
