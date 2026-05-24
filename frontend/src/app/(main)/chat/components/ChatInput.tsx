'use client';

import { ImageIcon, Smile, Send } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

const ChatInput = React.memo(
  ({ onSend }: { onSend: (content: string) => void }) => {
    const [input, setInput] = useState('');

    const handleSend = () => {
      if (!input.trim()) return;
      onSend(input);
      setInput('');
    };

    return (
      <div className='p-4 bg-white backdrop-blur-md border-t border-outline-variant/10'>
        <div className='flex items-center gap-3 max-w-5xl mx-auto'>
          <div className='flex items-center gap-1.5'>
            <Button
              variant='ghost'
              size='icon'
              className='text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-colors rounded-xl h-9 w-9'
            >
              <ImageIcon size={18} />
            </Button>
          </div>
          <div className='flex-1 relative flex items-center'>
            <Input
              className='w-full bg-surface-container-low border-none rounded-2xl pl-4 pr-11 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-none h-11'
              placeholder='Nhập tin nhắn của bạn...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='absolute right-2 text-on-surface-variant hover:text-primary hover:bg-transparent rounded-full h-8 w-8 transition-colors'
            >
              <Smile size={18} />
            </Button>
          </div>
          <Button
            size='icon'
            onClick={handleSend}
            disabled={!input.trim()}
            className='bg-primary text-on-primary hover:bg-primary/95 hover:scale-105 active:scale-95 rounded-xl h-11 w-11 shrink-0 shadow-lg shadow-primary/20 transition-all duration-200 flex items-center justify-center border-none'
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    );
  },
);

export default ChatInput;
