import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/shared/Layout';
import { Dashboard } from './pages/Dashboard';
import { Companies } from './pages/Companies';
import { Documents } from './pages/Documents';
import { Checklists } from './pages/Checklists';
import { Production } from './pages/Production';
import { ProductionDetail } from './pages/ProductionDetail';
import { Settings } from './pages/Settings';
import { Toaster } from 'react-hot-toast';
import { SyncProvider } from './components/shared/SyncProvider';

function App() {
  return (
    <SyncProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="documents" element={<Documents />} />
            <Route path="checklists" element={<Checklists />} />
            <Route path="production" element={<Production />} />
            <Route path="production/:id" element={<ProductionDetail />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SyncProvider>
  );
}

export default App;
