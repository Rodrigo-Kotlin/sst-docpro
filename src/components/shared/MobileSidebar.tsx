import * as Dialog from '@radix-ui/react-dialog';
import { SidebarContent } from './Sidebar';

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden data-[state=open]:animate-[fadeIn_0.15s_ease-out]" />
        <Dialog.Content
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl flex flex-col md:hidden focus:outline-none data-[state=open]:animate-[slideInLeft_0.2s_ease-out]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <Dialog.Title className="sr-only">Menu de navegação</Dialog.Title>
          <SidebarContent onNavigate={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
