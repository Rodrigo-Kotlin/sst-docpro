import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  destructive = false,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-[fadeIn_0.15s_ease-out]" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 data-[state=open]:animate-[scaleIn_0.2s_ease-out] focus:outline-none">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-xl shrink-0 ${destructive ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <AlertDialog.Title className="text-lg font-bold text-slate-800">{title}</AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-slate-500 mt-1">
                {description}
              </AlertDialog.Description>
              {children && <div className="mt-3">{children}</div>}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <AlertDialog.Cancel asChild>
              <button className="btn-secondary">{cancelText}</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className={destructive ? 'btn-danger' : 'btn-primary'}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
