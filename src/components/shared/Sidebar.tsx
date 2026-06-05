import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileText,
  ListChecks,
  ClipboardList,
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Building2, label: 'Empresas', path: '/companies' },
  { icon: FileText, label: 'Documentos Padrão', path: '/documents' },
  { icon: ListChecks, label: 'Modelos de Checklist', path: '/checklists' },
  { icon: ClipboardList, label: 'Produção Documental', path: '/production' },
  { icon: SettingsIcon, label: 'Configurações', path: '/settings' },
];

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation();

  return (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-primary-700 font-bold text-xl">
          <ShieldCheck className="w-6 h-6" />
          <span>SST DocPro</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path ||
                           (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                'sidebar-link',
                isActive && 'active'
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
        Versão 1.0.0
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col hidden md:flex">
      <SidebarContent />
    </aside>
  );
}
