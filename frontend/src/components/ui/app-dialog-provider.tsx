'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type AppDialogVariant = 'default' | 'destructive';

type AppDialogOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: AppDialogVariant;
};

type DialogRequest = AppDialogOptions & {
  type: 'alert' | 'confirm';
  resolve: (value: boolean) => void;
};

let pushRequest: ((request: DialogRequest) => void) | null = null;

function normalizeOptions(options: string | AppDialogOptions): AppDialogOptions {
  return typeof options === 'string' ? { description: options } : options;
}

export function appAlert(options: string | AppDialogOptions) {
  const normalized = normalizeOptions(options);

  return new Promise<void>((resolve) => {
    if (!pushRequest) {
      console.info(normalized.description);
      resolve();
      return;
    }

    pushRequest({
      title: normalized.title || 'Thông báo',
      description: normalized.description,
      confirmLabel: normalized.confirmLabel || 'Đã hiểu',
      variant: normalized.variant || 'default',
      type: 'alert',
      resolve: () => resolve(),
    });
  });
}

export function appConfirm(options: string | AppDialogOptions) {
  const normalized = normalizeOptions(options);

  return new Promise<boolean>((resolve) => {
    if (!pushRequest) {
      console.info(normalized.description);
      resolve(false);
      return;
    }

    pushRequest({
      title: normalized.title || 'Xác nhận thao tác',
      description: normalized.description,
      confirmLabel: normalized.confirmLabel || 'Xác nhận',
      cancelLabel: normalized.cancelLabel || 'Hủy',
      variant: normalized.variant || 'default',
      type: 'confirm',
      resolve,
    });
  });
}

export function AppDialogProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<DialogRequest[]>([]);
  const current = queue[0];

  const enqueue = useCallback((request: DialogRequest) => {
    setQueue((prev) => [...prev, request]);
  }, []);

  useEffect(() => {
    pushRequest = enqueue;
    return () => {
      if (pushRequest === enqueue) pushRequest = null;
    };
  }, [enqueue]);

  const closeCurrent = (value: boolean) => {
    if (!current) return;
    current.resolve(value);
    setQueue((prev) => prev.slice(1));
  };

  return (
    <>
      {children}
      <Dialog
        open={!!current}
        onOpenChange={(open) => {
          if (!open && current) closeCurrent(false);
        }}
      >
        <DialogContent className='max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl'>
          <DialogHeader>
            <DialogTitle className='text-lg font-black text-slate-900'>
              {current?.title}
            </DialogTitle>
            <DialogDescription className='text-sm leading-relaxed text-slate-500'>
              {current?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:justify-end'>
            {current?.type === 'confirm' && (
              <Button variant='outline' onClick={() => closeCurrent(false)}>
                {current.cancelLabel || 'Hủy'}
              </Button>
            )}
            <Button
              variant={current?.variant === 'destructive' ? 'destructive' : 'default'}
              onClick={() => closeCurrent(true)}
            >
              {current?.confirmLabel || 'Đã hiểu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
