'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, UserPlus } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { ConversationType } from '@/api/chat';

export const CreateChatDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [participantEmails, setParticipantEmails] = useState<string[]>([]);
  const { createConversation } = useChat();

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && !participantEmails.includes(email)) {
      setParticipantEmails([...participantEmails, email]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setParticipantEmails(participantEmails.filter((e) => e !== email));
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createConversation({
      title,
      participantEmails,
      type: ConversationType.CUSTOM_GROUP,
    });
    setTitle('');
    setParticipantEmails([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full hover:bg-primary/10 text-primary'
        >
          <Plus size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] rounded-3xl border-outline-variant bg-surface-container-lowest'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>
            Tạo cuộc trò chuyện mới
          </DialogTitle>
        </DialogHeader>
        <div className='py-4 space-y-6'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-on-surface-variant'>
              Tên cuộc trò chuyện
            </label>
            <Input
              placeholder='Ví dụ: Nhóm học tập, Dự án IT...'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='rounded-xl border-outline-variant focus-visible:ring-primary/20'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-on-surface-variant'>
              Thêm thành viên (Email)
            </label>
            <div className='flex gap-2'>
              <Input
                placeholder='user@example.com'
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), handleAddEmail())
                }
                className='rounded-xl border-outline-variant focus-visible:ring-primary/20'
              />
              <Button
                type='button'
                onClick={handleAddEmail}
                size='icon'
                className='bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl shrink-0'
              >
                <Plus size={20} />
              </Button>
            </div>
          </div>

          {participantEmails.length > 0 && (
            <div className='space-y-2'>
              <label className='text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50'>
                Danh sách thành viên ({participantEmails.length})
              </label>
              <div className='flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1'>
                {participantEmails.map((email) => (
                  <div
                    key={email}
                    className='flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-primary/5 text-primary text-xs font-medium rounded-full border border-primary/10 group animate-in zoom-in-95 duration-200'
                  >
                    {email}
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className='p-0.5 hover:bg-primary/20 rounded-full transition-colors'
                    >
                      <Plus className='rotate-45 size-3.5' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant='ghost'
            onClick={() => setOpen(false)}
            className='rounded-xl'
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || participantEmails.length === 0}
            className='bg-primary hover:bg-primary-dim text-white rounded-xl shadow-lg shadow-primary/20'
          >
            Tạo ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
