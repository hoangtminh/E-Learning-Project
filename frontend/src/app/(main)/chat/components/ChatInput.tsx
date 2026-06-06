'use client';

import { ImageIcon, Smile, Send } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSend: (content: string) => void;
  members?: Array<{ id: string; name: string; email?: string }>;
}

const ChatInput = React.memo(
  ({ onSend, members = [] }: ChatInputProps) => {
    const [input, setInput] = useState('');
    const [mentionSearch, setMentionSearch] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [mentionIndex, setMentionIndex] = useState(0);
    const [selectedMentions, setSelectedMentions] = useState<Array<{ name: string; id: string }>>([]);

    const handleSend = () => {
      if (!input.trim()) return;

      // Replace mentions in input content from clean "@Name" to markdown format "@[Name](id)" before sending
      let textToSend = input;
      selectedMentions.forEach(mention => {
        const mentionPlaceholder = `@${mention.name}`;
        if (textToSend.includes(mentionPlaceholder)) {
          textToSend = textToSend.split(mentionPlaceholder).join(`@[${mention.name}](${mention.id})`);
        }
      });

      onSend(textToSend);
      setInput('');
      setSelectedMentions([]);
      setMentionSearch(null);
      setSuggestions([]);
    };

    const handleInputChange = (val: string) => {
      setInput(val);
      if (!val) {
        setSelectedMentions([]);
      }
      const lastAt = val.lastIndexOf('@');
      if (lastAt !== -1 && (lastAt === 0 || val[lastAt - 1] === ' ')) {
        const textAfter = val.slice(lastAt + 1);
        if (!textAfter.includes(' ')) {
          setMentionSearch(textAfter);
          return;
        }
      }
      setMentionSearch(null);
    };

    useEffect(() => {
      if (mentionSearch === null) {
        setSuggestions([]);
        return;
      }

      const query = mentionSearch.toLowerCase();
      const allOption = { id: 'all', name: 'Mọi người', email: 'all' };
      const filteredMembers = members.filter(m => 
        m.name.toLowerCase().includes(query) || 
        m.email?.toLowerCase().includes(query)
      );

      const list = query === '' || 'all'.includes(query) 
        ? [allOption, ...filteredMembers] 
        : filteredMembers;

      setSuggestions(list);
      setMentionIndex(0);
    }, [mentionSearch, members]);

    const handleSelectSuggestion = (suggestion: any) => {
      const lastAt = input.lastIndexOf('@');
      if (lastAt === -1) return;

      const prefix = input.slice(0, lastAt);
      const mentionText = suggestion.id === 'all' 
        ? '@all' 
        : `@${suggestion.name}`;

      setInput(prefix + mentionText + ' ');
      if (suggestion.id !== 'all') {
        setSelectedMentions(prev => {
          if (prev.some(m => m.id === suggestion.id)) return prev;
          return [...prev, { name: suggestion.name, id: suggestion.id }];
        });
      }
      setMentionSearch(null);
      setSuggestions([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setMentionIndex((prev) => (prev + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setMentionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleSelectSuggestion(suggestions[mentionIndex]);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setMentionSearch(null);
          setSuggestions([]);
        }
      } else if (e.key === 'Enter') {
        handleSend();
      }
    };

    return (
      <div className='p-3.5 bg-white border-t border-outline-variant/20 relative z-20'>
        <div className='flex items-center gap-3.5 max-w-5xl mx-auto relative'>
          
          {/* Suggestion Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute bottom-full left-14 mb-2 w-64 max-h-48 overflow-y-auto bg-white border border-slate-200/60 rounded-xl shadow-lg z-50 p-1 flex flex-col gap-0.5">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`w-full px-3 py-2 text-left text-xs rounded-lg transition-colors flex flex-col gap-0.5 cursor-pointer ${
                    index === mentionIndex 
                      ? 'bg-primary/10 text-primary font-bold' 
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-extrabold">{suggestion.name}</span>
                  {suggestion.id !== 'all' && (
                    <span className="text-[10px] text-slate-400 font-medium">{suggestion.email}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className='flex items-center shrink-0'>
            <Button
              variant='ghost'
              size='icon'
              className='text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors rounded-xl h-10 w-10 cursor-pointer'
            >
              <ImageIcon size={18} />
            </Button>
          </div>
          <div className='flex-1 relative flex items-center min-w-0'>
            <Input
              className='w-full bg-slate-50/80 border border-slate-200/50 rounded-xl pl-4 pr-11 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-primary/20 focus:bg-white transition-all shadow-none h-10'
              placeholder='Nhập tin nhắn của bạn...'
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='absolute right-2 text-slate-400 hover:text-primary hover:bg-transparent rounded-lg h-7 w-7 transition-colors cursor-pointer'
            >
              <Smile size={16} />
            </Button>
          </div>
          <Button
            size='icon'
            onClick={handleSend}
            disabled={!input.trim()}
            className='bg-primary text-white hover:bg-primary-dim active:scale-[0.98] rounded-xl h-10 w-10 shrink-0 transition-all duration-200 flex items-center justify-center border-none shadow-xs cursor-pointer'
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    );
  },
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
