import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  size = 'md',
  children,
  footer,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-[fadeIn_0.15s_ease-out]" />
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-50 w-full ${SIZE_CLASSES[size]} -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col data-[state=open]:animate-[scaleIn_0.2s_ease-out] focus:outline-none`}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {icon && <div className="p-2 bg-primary-50 rounded-xl text-primary-600">{icon}</div>}
              <div>
                <Dialog.Title className="text-lg font-bold text-slate-800">{title}</Dialog.Title>
                {description && (
                  <Dialog.Description className="text-sm text-slate-500 mt-0.5">
                    {description}
                  </Dialog.Description>
                )}
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="btn-icon text-slate-400 hover:text-slate-600" aria-label="Fechar">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto flex-1">{children}</div>

          {footer && <div className="flex justify-end gap-3 p-6 border-t border-slate-100">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
