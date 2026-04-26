import Link from 'next/link';
import { Video, MessageSquare, FileText, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  {
    icon: <Video className='h-4 w-4' />,
    label: 'Video Call',
    href: '/learning/meetings', // placeholder
    badge: 'Start',
  },
  {
    icon: <FileText className='h-4 w-4' />,
    label: 'Assignments',
    href: '/dashboard/assignments',
    badge: '3',
  },
  {
    icon: <MessageSquare className='h-4 w-4' />,
    label: 'Messages',
    href: '/dashboard/chat',
    badge: '5',
  },
  {
    icon: <BookOpen className='h-4 w-4' />,
    label: 'My Notes',
    href: '/dashboard/notes',
  },
];

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-4'>
      {actions.map((action, idx) => {
        const Component = action.href ? Link : 'button';
        return (
          <Component
            key={idx}
            href={'/'}
            onClick={action.onClick}
            className={cn(
              'glass-elevated group relative flex flex-col items-center gap-2 rounded-lg px-4 py-3 transition-all hover:border-primary/30',
            )}
          >
            <div className='flex items-center gap-2 text-sm font-medium'>
              <span className='text-primary'>{action.icon}</span>
              {action.label}
            </div>
            {action.badge && (
              <span className='absolute top-2 right-2 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground'>
                {action.badge}
              </span>
            )}
          </Component>
        );
      })}
    </div>
  );
}
