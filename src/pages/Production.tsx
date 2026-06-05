import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductionStore } from '../store/useProductionStore';
import { useCompanyStore } from '../store/useCompanyStore';
import { useDocumentStore } from '../store/useDocumentStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Plus, Search, Filter, ArrowRight, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ProductionStatus, Priority } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../lib/utils';
import { isDelayed } from '../lib/calculations';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';

// ─── New Production Modal ──────────────────────────────────────────────────────
interface NewProductionModalProps {
  onClose: () => void;
}

const today = new Date().toISOString().split('T')[0];
const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

function NewProductionModal({ onClose }: NewProductionModalProps) {
  const { createProduction } = useProductionStore();
  const { companies } = useCompanyStore();
  const { documentTypes, getTemplatesByDocType } = useDocumentStore();
  const { settings } = useSettingsStore();

  const [form, setForm] = useState({
    companyId: '',
    documentTypeId: '',
    responsible: '',
    startDate: today,
    dueDate: in30,
    status: 'not_started' as ProductionStatus,
    priority: 'medium' as Priority,
    notes: '',
    completionDate: null as null,
    createdBy: 'Sistema',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const templateCount = useMemo(
    () => (form.documentTypeId ? getTemplatesByDocType(form.documentTypeId).length : 0),
    [form.documentTypeId, getTemplatesByDocType]
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.companyId) e.companyId = 'Selecione uma empresa';
    if (!form.documentTypeId) e.documentTypeId = 'Selecione um tipo de documento';
    if (!form.responsible.trim()) e.responsible = 'Informe o responsável';
    if (!form.startDate) e.startDate = 'Data de início é obrigatória';
    if (!form.dueDate) e.dueDate = 'Prazo é obrigatório';
    if (form.startDate && form.dueDate && form.startDate > form.dueDate) e.dueDate = 'Prazo deve ser após a data de início';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const templates = getTemplatesByDocType(form.documentTypeId);
    const prod = createProduction(form, templates);
    toast.success(`Processo iniciado! ${templates.length} itens de checklist carregados.`);
    onClose();
    return prod;
  };

  const activeCompanies = companies.filter(c => c.status === 'active');
  const activeDocTypes = documentTypes.filter(d => d.status === 'active');
  const activeResponsibles = settings.responsibles.filter(r => r.status === 'active');

  const selectedDoc = documentTypes.find(d => d.id === form.documentTypeId);

  return (
    <Modal
      open
      onClose={onClose}
      title="Novo Processo Documental"
      description="Inicie um novo documento para uma empresa"
      icon={<Layers className="w-5 h-5" />}
      size="lg"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" form="production-form" className="btn-primary">
            <Layers className="w-4 h-4" />
            Iniciar Processo
          </button>
        </>
      }
    >
        <form id="production-form" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Empresa */}
            <div>
              <label className="label">Empresa *</label>
              <select className={`select ${errors.companyId ? 'input-error' : ''}`} value={form.companyId} onChange={e => set('companyId', e.target.value)}>
                <option value="">Selecione a empresa...</option>
                {activeCompanies.map(c => <option key={c.id} value={c.id}>{c.name} — {c.city}/{c.state}</option>)}
              </select>
              {errors.companyId && <p className="text-xs text-red-500 mt-1">{errors.companyId}</p>}
            </div>

            {/* Tipo de Documento */}
            <div>
              <label className="label">Tipo de Documento *</label>
              <select className={`select ${errors.documentTypeId ? 'input-error' : ''}`} value={form.documentTypeId} onChange={e => set('documentTypeId', e.target.value)}>
                <option value="">Selecione o documento...</option>
                {activeDocTypes.map(d => <option key={d.id} value={d.id}>{d.acronym} — {d.name}</option>)}
              </select>
              {errors.documentTypeId && <p className="text-xs text-red-500 mt-1">{errors.documentTypeId}</p>}
              {selectedDoc && (
                <div className="mt-2 flex items-center gap-2 text-xs text-primary-600">
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
                  <span>{templateCount} {templateCount === 1 ? 'item' : 'itens'} de checklist serão carregados automaticamente</span>
                </div>
              )}
            </div>

            {/* Responsável */}
            <div>
              <label className="label">Responsável *</label>
              {activeResponsibles.length > 0 ? (
                <select className={`select ${errors.responsible ? 'input-error' : ''}`} value={form.responsible} onChange={e => set('responsible', e.target.value)}>
                  <option value="">Selecione o responsável...</option>
                  {activeResponsibles.map(r => <option key={r.id} value={r.name}>{r.name} — {r.role}</option>)}
                </select>
              ) : (
                <input className={`input ${errors.responsible ? 'input-error' : ''}`} value={form.responsible}
                  onChange={e => set('responsible', e.target.value)} placeholder="Nome do responsável" />
              )}
              {errors.responsible && <p className="text-xs text-red-500 mt-1">{errors.responsible}</p>}
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Data de Início *</label>
                <input type="date" className={`input ${errors.startDate ? 'input-error' : ''}`} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="label">Prazo de Entrega *</label>
                <input type="date" className={`input ${errors.dueDate ? 'input-error' : ''}`} value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
                {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
              </div>
            </div>

            {/* Prioridade + Status Inicial */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Prioridade</label>
                <select className="select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
              <div>
                <label className="label">Status Inicial</label>
                <select className="select" value={form.status} onChange={e => set('status', e.target.value as ProductionStatus)}>
                  <option value="not_started">Não iniciado</option>
                  <option value="in_progress">Em andamento</option>
                </select>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="label">Observações</label>
              <textarea className="textarea" rows={2} value={form.notes}
                onChange={e => set('notes', e.target.value)} placeholder="Informações adicionais sobre este processo..." />
            </div>
          </div>
        </form>
    </Modal>
  );
}

// ─── Production Page ───────────────────────────────────────────────────────────
export function Production() {
  const navigate = useNavigate();
  const { productions } = useProductionStore();
  const { companies } = useCompanyStore();
  const { documentTypes } = useDocumentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'Desconhecida';
  const getDocAcronym = (id: string) => documentTypes.find(d => d.id === id)?.acronym || 'DOC';

  const uniqueResponsibles = useMemo(
    () => Array.from(new Set(productions.map(p => p.responsible).filter(Boolean))).sort(),
    [productions]
  );

  const filtered = productions.filter(p => {
    const compName = getCompanyName(p.companyId).toLowerCase();
    const docName = getDocAcronym(p.documentTypeId).toLowerCase();
    const term = searchTerm.trim().toLowerCase();
    const matchTerm = !term || compName.includes(term) || docName.includes(term) || p.responsible.toLowerCase().includes(term);
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchPriority = !priorityFilter || p.priority === priorityFilter;
    const matchResponsible = !responsibleFilter || p.responsible === responsibleFilter;
    const matchDocType = !docTypeFilter || p.documentTypeId === docTypeFilter;
    return matchTerm && matchStatus && matchPriority && matchResponsible && matchDocType;
  });

  const getStatusBadge = (status: ProductionStatus) => (
    <span className={`badge ${STATUS_CONFIG[status]?.color ?? 'badge-gray'}`}>
      {STATUS_CONFIG[status]?.label ?? status}
    </span>
  );

  const getPriorityBadge = (priority: Priority) => (
    <span className={`badge ${PRIORITY_CONFIG[priority]?.color ?? 'badge-gray'}`}>
      {PRIORITY_CONFIG[priority]?.label ?? priority}
    </span>
  );

  const activeFilters = [statusFilter, priorityFilter, responsibleFilter, docTypeFilter].filter(Boolean).length;
  const hasFilters = activeFilters > 0;

  const clearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setResponsibleFilter('');
    setDocTypeFilter('');
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">Produção Documental</h1>
          <p className="page-subtitle">Acompanhamento dos processos em andamento</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo Processo
        </button>
      </div>

      <div className="card mb-6">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por empresa, doc ou responsável..."
                className="input pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={`btn-secondary ${hasFilters ? 'border-primary-400 text-primary-600 bg-primary-50' : ''}`} onClick={() => setShowFilters(f => !f)}>
              <Filter className="w-4 h-4" />
              Filtros
              {hasFilters && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-600 text-white text-[10px] font-bold leading-none">
                  {activeFilters}
                </span>
              )}
            </button>
            <span className="text-sm text-slate-500 font-medium ml-auto">{filtered.length} processo{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-slate-100">
              <div className="flex-1 min-w-[160px]">
                <label className="label !mb-1 text-xs">Status</label>
                <select className="select py-1.5 text-sm w-full" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="not_started">Não iniciado</option>
                  <option value="in_progress">Em andamento</option>
                  <option value="pending_info">Pend. Informação</option>
                  <option value="waiting_client">Aguard. Cliente</option>
                  <option value="in_review">Em revisão</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="label !mb-1 text-xs">Prioridade</label>
                <select className="select py-1.5 text-sm w-full" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                  <option value="">Todas</option>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="label !mb-1 text-xs">Responsável</label>
                <select className="select py-1.5 text-sm w-full" value={responsibleFilter} onChange={e => setResponsibleFilter(e.target.value)}>
                  <option value="">Todos</option>
                  {uniqueResponsibles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="label !mb-1 text-xs">Tipo de Documento</label>
                <select className="select py-1.5 text-sm w-full" value={docTypeFilter} onChange={e => setDocTypeFilter(e.target.value)}>
                  <option value="">Todos</option>
                  {documentTypes.map(d => <option key={d.id} value={d.id}>{d.acronym} — {d.name}</option>)}
                </select>
              </div>
              {hasFilters && (
                <button className="btn-ghost btn-sm text-xs whitespace-nowrap" onClick={clearFilters}>Limpar filtros</button>
              )}
            </div>
          )}
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Empresa</th>
                <th>Responsável</th>
                <th>Progresso</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Prazo</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(prod => (
                <tr
                  key={prod.id}
                  className={`cursor-pointer group hover:bg-slate-50 ${isDelayed(prod) ? 'bg-red-50/30' : ''}`}
                  onClick={() => navigate(`/production/${prod.id}`)}
                >
                  <td>
                    <div className="font-bold text-slate-800">{getDocAcronym(prod.documentTypeId)}</div>
                  </td>
                  <td className="font-medium text-slate-700">{getCompanyName(prod.companyId)}</td>
                  <td className="text-sm text-slate-600">{prod.responsible || '—'}</td>
                  <td className="w-44">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 progress-bar-track h-2">
                        <div
                          className={`progress-bar-fill ${prod.progress === 100 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                          style={{ width: `${prod.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 w-8">{prod.progress}%</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(prod.status)}</td>
                  <td>{getPriorityBadge(prod.priority)}</td>
                  <td>
                    <div className={`text-sm font-medium ${isDelayed(prod) ? 'text-red-600' : 'text-slate-700'}`}>
                      {format(new Date(prod.dueDate), "dd MMM yyyy", { locale: ptBR })}
                    </div>
                    {isDelayed(prod) && <div className="text-xs text-red-400 mt-0.5">⚠ Atrasado</div>}
                  </td>
                  <td className="text-right" onClick={e => e.stopPropagation()}>
                    <button
                      className="btn-ghost btn-icon text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-50 transition-colors"
                      onClick={() => navigate(`/production/${prod.id}`)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <Layers className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium">Nenhum processo encontrado</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {productions.length === 0
                          ? 'Inicie um novo processo para começar.'
                          : 'Tente ajustar os filtros ou inicie um novo processo.'}
                      </p>
                      <button className="btn-primary mt-4" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" />Novo Processo</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && <NewProductionModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
