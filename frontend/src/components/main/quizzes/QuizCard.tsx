'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Clock,
  Globe,
  Lock,
  MoreVertical,
  Play,
  Settings,
  Share2,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Quiz } from '@/api/quizzes';

interface QuizCardProps {
  quiz: Quiz;
  onEdit?: (quiz: Quiz) => void;
  onSettings?: (quiz: Quiz) => void;
  onShare?: (quiz: Quiz) => void;
  onTake?: (quiz: Quiz) => void;
  isOwner?: boolean;
}

export function QuizCard({
  quiz,
  onEdit,
  onSettings,
  onShare,
  onTake,
  isOwner,
}: QuizCardProps) {
  return (
    <Card className='overflow-hidden hover:shadow-xl transition-all duration-300 group glass-panel-elevated hover:border-primary/40 border-transparent relative'>
      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />

      <div className='flex flex-col sm:flex-row items-stretch sm:items-center relative z-10'>
        <CardHeader className='p-5 sm:p-7 flex-1'>
          <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-2'>
              <Badge
                variant={quiz.isPublic ? 'default' : 'secondary'}
                className='rounded-lg px-3 py-1 bg-white/50 backdrop-blur-sm text-primary border-primary/10 font-medium'
              >
                {quiz.isPublic ? (
                  <span className='flex items-center gap-1.5'>
                    <Globe className='size-3.5' /> Công khai
                  </span>
                ) : (
                  <span className='flex items-center gap-1.5'>
                    <Lock className='size-3.5' /> Riêng tư
                  </span>
                )}
              </Badge>
              <div className='flex items-center gap-4 text-xs font-medium text-slate-500 ml-auto sm:ml-4'>
                <div className='flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg'>
                  <Clock className='size-3.5 text-primary/70' />
                  {quiz.duration ? `${quiz.duration} phút` : 'Không giới hạn'}
                </div>
                <div className='flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg'>
                  <Users className='size-3.5 text-primary/70' />
                  {quiz._count?.memberships || 0}
                </div>
              </div>
            </div>

            <div className='space-y-1.5'>
              <CardTitle className='text-2xl font-bold group-hover:text-primary transition-colors text-slate-800'>
                {quiz.title}
              </CardTitle>
              <CardDescription className='line-clamp-2 text-slate-500 text-base leading-relaxed'>
                {quiz.description ||
                  'Khám phá kiến thức thông qua bài trắc nghiệm này.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardFooter className='p-5 sm:p-7 sm:pl-0 flex items-center gap-3 shrink-0'>
          <Button
            className='flex-1 sm:w-40 h-12 rounded-xl shadow-lg shadow-primary/10 font-semibold bg-primary hover:bg-primary-dim transition-all hover:scale-105 active:scale-95'
            onClick={() => onTake?.(quiz)}
          >
            <Play className='mr-2 size-5 fill-current' /> Làm bài
          </Button>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='icon' className='shrink-0'>
                  <MoreVertical className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem onClick={() => onEdit?.(quiz)}>
                  <Settings className='mr-2 size-4' /> Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSettings?.(quiz)}>
                  <Clock className='mr-2 size-4' /> Cài đặt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(quiz)}>
                  <Share2 className='mr-2 size-4' /> Chia sẻ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}
