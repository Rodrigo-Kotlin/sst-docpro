import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { useProductionStore } from '../../store/useProductionStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useDocumentStore } from '../../store/useDocumentStore';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [resultsOpen, setResultsOpen] = useState(false);

  const { productions } = useProductionStore();
  const { companies } = useCompanyStore();
  const { documentTypes } = useDocumentStore();

  const term = query.trim().toLowerCase();
  const companyMatches = term
    ? companies.filter(c => c.name.toLowerCase().includes(term)).slice(0, 3)
    : [];
  const docMatches = term
    ? documentTypes.filter(d => d.name.toLowerCase().includes(term) || d.acronym.toLowerCase().includes(term)).slice(0, 3)
    : [];
  const productionMatches = term
    ? productions.filter(p => p.responsible.toLowerCase().includes(term)).slice(0, 3)
    : [];
  const hasResults = companyMatches.length + docMatches.length + productionMatches.length > 0;

  const handleSelect = (path: string) => {
    setQuery('');
    setResultsOpen(false);
    navigate(path);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 gap-3">
      <div className="flex items-center gap-2 flex-1 max-w-md relative">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar empresa, documento..."
            className="w-full bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-lg py-2 pl-9 pr-4 text-sm transition-all outline-none"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setResultsOpen(true); }}
            onFocus={() => setResultsOpen(true)}
            onBlur={() => setTimeout(() => setResultsOpen(false), 150)}
          />
          {resultsOpen && term && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-40 max-h-80 overflow-y-auto">
              {!hasResults ? (
                <p className="p-4 text-sm text-slate-500">Nenhum resultado para "{query}"</p>
              ) : (
                <>
                  {companyMatches.length > 0 && (
                    <div>
                      <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">Empresas</p>
                      {companyMatches.map(c => (
                        <button key={c.id} onMouseDown={() => handleSelect('/companies')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                          <span className="font-medium text-slate-800">{c.name}</span>
                          <span className="text-xs text-slate-400">{c.cnpj}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {docMatches.length > 0 && (
                    <div>
                      <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">Documentos</p>
                      {docMatches.map(d => (
                        <button key={d.id} onMouseDown={() => handleSelect('/documents')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">
                          <span className="font-bold text-primary-700 mr-2">{d.acronym}</span>
                          <span className="text-slate-700">{d.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {productionMatches.length > 0 && (
                    <div>
                      <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">Produções</p>
                      {productionMatches.map(p => (
                        <button key={p.id} onMouseDown={() => handleSelect(`/production/${p.id}`)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">
                          <span className="text-slate-700">{p.responsible}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors" aria-label="Notificações">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
        <button className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
            AD
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 leading-none">Admin</p>
            <p className="text-xs text-slate-500 mt-1">SST Manager</p>
          </div>
        </button>
      </div>
    </header>
  );
}
