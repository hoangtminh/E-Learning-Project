'use client';

import React from 'react';
import { Send } from 'lucide-react';

const ChatPlaceholderPage = () => {
  return (
    <div className='flex-1 flex items-center justify-center bg-background/50 text-on-surface-variant/50'>
      <div className='text-center'>
        <div className='w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4'>
          <Send size={40} className='text-primary/20' />
        </div>
        <p className='text-lg font-medium'>Chọn một cuộc trò chuyện để bắt đầu</p>
        <p className='text-sm mt-2'>Kết nối với bạn bè và giảng viên ngay bây giờ</p>
      </div>
    </div>
  );
};

export default ChatPlaceholderPage;
