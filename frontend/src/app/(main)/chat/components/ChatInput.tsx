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
      <div className='p-3 border-t bg-surface-container-low/30 backdrop-blur-md'>
        <div className='flex items-center gap-2'>
          <div>
            <Button
              variant='ghost'
              size='icon'
              className='text-on-surface-variant hover:bg-primary/10 rounded-full h-9 w-9'
            >
              <ImageIcon size={20} />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='text-on-surface-variant hover:bg-primary/10 rounded-full h-9 w-9'
            >
              <Smile size={20} />
            </Button>
          </div>
          <Input
            className='flex-1 bg-transparent border-outline-variant/50 outline-none py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:ring-accent-foreground/40'
            placeholder='Nhập tin nhắn...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button
            size='icon'
            onClick={handleSend}
            disabled={!input.trim()}
            className='bg-primary hover:bg-primary-dim text-white rounded-full h-9 w-9 shrink-0 shadow-md shadow-primary/20 transition-all'
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    );
  },
);

export default ChatInput;
