'use client';

import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, LogOut, Info, Settings, Shield, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ChatInfo = ({ onClose }: { onClose: () => void }) => {
  const { currentConversation, removeMember } = useChat();
  const { user } = useAuth();

  if (!currentConversation) return null;

  const otherMembers = currentConversation.members.filter(
    (m) => m.userId !== user?.userId,
  );

  const handleLeave = async () => {
    if (
      user &&
      window.confirm('Bạn có chắc chắn muốn rời khỏi cuộc trò chuyện này?')
    ) {
      await removeMember(currentConversation.id, user.userId);
      onClose();
    }
  };

  return (
    <ScrollArea className='flex-1 bg-surface flex flex-col border-l border-outline-variant overflow-hidden'>
      <div className='h-12 px-6 flex items-center border-b border-outline-variant justify-between'>
        <h3 className='font-bold text-lg'>Thông tin</h3>
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='rounded-full hover:bg-surface-container-high'
        >
          <X className='size-5' />
        </Button>
      </div>

      <div className='flex-1'>
        <div className='p-6'>
          {/* Chat Identity */}
          <div className='flex flex-col items-center mb-8'>
            <Avatar className='h-24 w-24 mb-4 border-2 border-primary/10 shadow-lg'>
              <AvatarImage
                src={
                  currentConversation.type === 'private_direct'
                    ? otherMembers[0]?.user.avatarUrl || ''
                    : ''
                }
                alt={currentConversation.title || 'Chat'}
              />
              <AvatarFallback className='text-3xl bg-primary/5 text-primary uppercase font-bold'>
                {currentConversation.title?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <h2 className='text-xl font-bold text-on-surface text-center'>
              {currentConversation.title}
            </h2>
            <p className='text-sm text-on-surface-variant/70 mt-1'>
              {currentConversation.members.length} thành viên
            </p>
          </div>

          {/* Actions Quick Access */}
          <div className='flex justify-center gap-4 mb-8'>
            <Button
              variant='outline'
              size='icon'
              className='rounded-full size-11 border-outline-variant/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all duration-200'
            >
              <Shield className='size-5' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='rounded-full size-11 border-outline-variant/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all duration-200'
            >
              <Settings className='size-5' />
            </Button>
          </div>

          {/* Members List */}
          <div className='space-y-6'>
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='text-xs font-bold uppercase tracking-widest text-on-surface-variant/50'>
                  Thành viên
                </h4>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 px-2 text-primary hover:bg-primary/10 rounded-lg text-xs font-bold'
                >
                  <UserPlus className='size-3.5 mr-1.5' />
                  Thêm
                </Button>
              </div>

              <div className='space-y-4'>
                {currentConversation.members.map((member) => (
                  <div
                    key={member.userId}
                    className='flex items-center justify-between group'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='relative'>
                        <Avatar className='h-10 w-10 border border-outline-variant/20'>
                          <AvatarImage src={member.user.avatarUrl || ''} />
                          <AvatarFallback className='bg-surface-container-high text-sm font-bold uppercase'>
                            {member.user.fullName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className='absolute bottom-0 right-0 size-2.5 bg-success rounded-full border-2 border-surface' />
                      </div>
                      <div className='flex flex-col'>
                        <span className='text-sm font-bold text-on-surface'>
                          {member.user.fullName}
                          {member.userId === user?.userId && (
                            <span className='ml-2 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase font-black'>
                              Bạn
                            </span>
                          )}
                        </span>
                        <span className='text-[11px] text-on-surface-variant/60 font-medium'>
                          {member.userId === user?.userId
                            ? 'Đang hoạt động'
                            : 'Vừa mới truy cập'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className='pt-6 border-t border-outline-variant/50'>
              <Button
                variant='ghost'
                className='w-full justify-start text-error hover:bg-error/10 hover:text-error rounded-xl font-bold py-6 transition-colors'
                onClick={handleLeave}
              >
                <LogOut className='mr-3 size-5' />
                Rời khỏi cuộc trò chuyện
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
