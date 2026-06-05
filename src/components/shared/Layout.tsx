import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { Header } from './Header';
import { UpdatePrompt } from './UpdatePrompt';

export function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar />
      <MobileSidebar open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <UpdatePrompt />
    </div>
  );
}
