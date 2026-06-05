import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useProductionStore } from '../store/useProductionStore';
import {
  Users, Tag, RefreshCw, Plus, X, Edit2, CheckCircle2, XCircle,
  Save, Settings2, Trash2
} from 'lucide-react';
import type { Responsible } from '../types';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

// ─── Responsible Modal ─────────────────────────────────────────────────────────
interface ResponsibleModalProps {
  responsible?: Responsible | null;
  onClose: () => void;
}

function ResponsibleModal({ responsible, onClose }: ResponsibleModalProps) {
  const { addResponsible, updateResponsible } = useSettingsStore();
  const [form, setForm] = useState({
    name: responsible?.name || '',
    role: responsible?.role || '',
    email: responsible?.email || '',
    status: responsible?.status || 'active' as 'active' | 'inactive',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.role.trim()) e.role = 'Cargo/função é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (responsible) {
      updateResponsible(responsible.id, form);
      toast.success('Responsável atualizado!');
    } else {
      addResponsible(form);
      toast.success('Responsável cadastrado!');
    }
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={responsible ? 'Editar Responsável' : 'Novo Responsável'}
      icon={<Users className="w-5 h-5" />}
      size="sm"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" form="responsible-form" className="btn-primary">
            <Save className="w-4 h-4" />
            {responsible ? 'Salvar' : 'Cadastrar'}
          </button>
        </>
      }
    >
        <form id="responsible-form" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label">Nome *</label>
              <input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="Nome completo" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="label">Cargo / Função *</label>
              <input className={`input ${errors.role ? 'input-error' : ''}`} value={form.role}
                onChange={e => set('role', e.target.value)} placeholder="Ex: Técnico de Segurança, Engenheiro, Médico..." />
              {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
            </div>
            <div>
              <label className="label">E-mail</label>
              <input type="email" className="input" value={form.email}
                onChange={e => set('email', e.target.value)} placeholder="email@empresa.com.br" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
        </form>
    </Modal>
  );
}

// ─── Tag List (Categories / Periodicities) ────────────────────────────────────
interface TagListProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  placeholder: string;
}

function TagList({ title, icon, items, onAdd, onRemove, placeholder }: TagListProps) {
  const [input, setInput] = useState('');
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) { toast.error('Item já existe na lista'); return; }
    onAdd(trimmed);
    setInput('');
    toast.success(`"${trimmed}" adicionado!`);
  };

  const confirmRemove = () => {
    if (pendingRemove) {
      onRemove(pendingRemove);
      toast.success(`"${pendingRemove}" removido.`);
      setPendingRemove(null);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-slate-100 rounded-xl text-slate-600">{icon}</div>
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{items.length} {items.length === 1 ? 'item' : 'itens'} cadastrados</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="input flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
        />
        <button className="btn-primary" onClick={handleAdd} disabled={!input.trim()}>
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <div key={item} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-sm font-medium group hover:bg-slate-200 transition-colors">
            <span>{item}</span>
            <button
              onClick={() => setPendingRemove(item)}
              className="text-slate-400 hover:text-red-500 transition-colors ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-slate-400 italic">Nenhum item cadastrado. Adicione acima.</p>
        )}
      </div>

      <ConfirmDialog
        open={pendingRemove !== null}
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
        title={`Remover "${pendingRemove ?? ''}"?`}
        description="Esta ação não pode ser desfeita."
        confirmText="Remover"
        destructive
      />
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────────
export function Settings() {
  const { settings, toggleResponsibleStatus, removeResponsible, addCategory, removeCategory, addPeriodicity, removePeriodicity } = useSettingsStore();
  const { productions } = useProductionStore();
  const [responsibleModal, setResponsibleModal] = useState(false);
  const [editingResponsible, setEditingResponsible] = useState<Responsible | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Responsible | null>(null);

  const openAdd = () => { setEditingResponsible(null); setResponsibleModal(true); };
  const openEdit = (r: Responsible) => { setEditingResponsible(r); setResponsibleModal(true); };
  const closeModal = () => { setResponsibleModal(false); setEditingResponsible(null); };

  const productionsUsingResponsible = (name: string) =>
    productions.filter(p => p.responsible === name).length;

  const pendingInUse = pendingDelete ? productionsUsingResponsible(pendingDelete.name) : 0;

  const handleDelete = () => {
    if (!pendingDelete) return;
    removeResponsible(pendingDelete.id);
    toast.success(
      pendingInUse > 0
        ? `Responsável "${pendingDelete.name}" excluído. As ${pendingInUse} produção(ões) mantêm o nome como histórico.`
        : `Responsável "${pendingDelete.name}" excluído.`
    );
    setPendingDelete(null);
  };

  return (
    <div className="pb-8">
      <div className="section-header">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Ajustes do sistema e cadastros auxiliares</p>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Settings2 className="w-4 h-4" />
          <span className="text-sm">SST DocPro</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Responsáveis */}
        <div className="card">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Responsáveis</h3>
                <p className="text-xs text-slate-500 mt-0.5">Técnicos e profissionais que elaboram documentos SST</p>
              </div>
            </div>
            <button className="btn-primary" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              Novo Responsável
            </button>
          </div>

          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cargo / Função</th>
                  <th>E-mail</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {settings.responsibles.map(r => {
                  const inUse = productionsUsingResponsible(r.name);
                  return (
                    <tr key={r.id}>
                      <td className="font-medium text-slate-900">{r.name}</td>
                      <td className="text-slate-600">{r.role}</td>
                      <td className="text-slate-500 text-sm">{r.email || '—'}</td>
                      <td>
                        <span className={`badge ${r.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                          {r.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                        {inUse > 0 && (
                          <span className="ml-2 text-xs text-slate-400">({inUse} uso{inUse !== 1 ? 's' : ''})</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button className="btn-icon text-slate-400 hover:text-primary-600" onClick={() => openEdit(r)} title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="btn-icon text-slate-400 hover:text-slate-600 ml-1"
                          onClick={() => toggleResponsibleStatus(r.id)}
                          title={r.status === 'active' ? 'Inativar' : 'Ativar'}
                        >
                          {r.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button
                          className="btn-icon ml-1 text-slate-400 hover:text-red-500"
                          onClick={() => setPendingDelete(r)}
                          title={inUse > 0 ? `Excluir (referenciado em ${inUse} produção(ões))` : 'Excluir'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {settings.responsibles.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state py-10">
                        <Users className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">Nenhum responsável cadastrado</p>
                        <button className="btn-primary mt-3" onClick={openAdd}><Plus className="w-4 h-4" />Cadastrar primeiro</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categorias e Periodicidades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TagList
            title="Categorias de Documentos"
            icon={<Tag className="w-5 h-5" />}
            items={settings.categories}
            onAdd={addCategory}
            onRemove={removeCategory}
            placeholder="Nova categoria (ex: Saúde, Segurança...)"
          />
          <TagList
            title="Periodicidades"
            icon={<RefreshCw className="w-5 h-5" />}
            items={settings.periodicities}
            onAdd={addPeriodicity}
            onRemove={removePeriodicity}
            placeholder="Nova periodicidade (ex: Anual, Bienal...)"
          />
        </div>
      </div>

      {responsibleModal && (
        <ResponsibleModal responsible={editingResponsible} onClose={closeModal} />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        title={`Excluir "${pendingDelete?.name ?? ''}"?`}
        description={
          pendingInUse > 0
            ? `Esta ação não pode ser desfeita. ${pendingInUse} produção(ões) referenciam este responsável — elas serão mantidas com o nome como histórico, mas o cadastro será removido.`
            : 'Esta ação não pode ser desfeita.'
        }
        confirmText="Excluir"
        destructive
      />
    </div>
  );
}
