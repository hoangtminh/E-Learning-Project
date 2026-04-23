'use client';

import { useState } from 'react';
import { useCallContext } from '../contexts/CallContext';

export default function ChatPanel() {
  const { messages, sendMessage } = useCallContext();
  const [inputValue, setInputValue] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      <div className='flex-1 p-3 overflow-y-auto space-y-3'>
        {messages.length === 0 ? (
          <div className='text-center text-xs text-on-surface-variant py-2'>
            Chưa có tin nhắn nào. Bắt đầu trò chuyện!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderName === 'Bạn'; // Basic check for now
            return (
              <div
                key={index}
                className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className='text-[10px] text-on-surface-variant px-1'>
                  {msg.senderName}
                </span>
                <div
                  className={`px-2.5 py-1.5 rounded-xl max-w-[85%] text-xs break-words ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-surface-container-high text-on-surface rounded-tl-sm'}`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className='p-2 bg-surface border-t border-outline-variant/30'>
        <form onSubmit={handleSend} className='relative'>
          <input
            className='w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all text-xs text-on-surface placeholder:text-on-surface-variant'
            placeholder='Nhập tin nhắn...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            type='text'
          />
          <button
            type='submit'
            disabled={!inputValue.trim()}
            className='absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 text-primary rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-50'
          >
            <span className='material-symbols-outlined text-[16px]'>send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
