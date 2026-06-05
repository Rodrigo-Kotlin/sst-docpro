import { useState } from 'react';
import { Plus, Search, Edit2, CheckCircle2, XCircle, Building2, Trash2 } from 'lucide-react';
import { useCompanyStore } from '../store/useCompanyStore';
import { useProductionStore } from '../store/useProductionStore';
import type { Company } from '../types';
import { formatCNPJ, formatPhone } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', cnpj: '', city: '', state: '', contactName: '', phone: '', email: '', notes: '', status: 'active' as const,
};

const BR_STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

interface CompanyModalProps {
  company?: Company | null;
  onClose: () => void;
}

function CompanyModal({ company, onClose }: CompanyModalProps) {
  const { add, update } = useCompanyStore();
  const [form, setForm] = useState(company ? {
    name: company.name, cnpj: company.cnpj, city: company.city, state: company.state,
    contactName: company.contactName, phone: company.phone, email: company.email,
    notes: company.notes, status: company.status,
  } : EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.cnpj.trim() || form.cnpj.replace(/\D/g, '').length !== 14) e.cnpj = 'CNPJ inválido';
    if (!form.city.trim()) e.city = 'Cidade é obrigatória';
    if (!form.state) e.state = 'UF é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (company) {
      update(company.id, form);
      toast.success('Empresa atualizada com sucesso!');
    } else {
      add(form);
      toast.success('Empresa cadastrada com sucesso!');
    }
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={company ? 'Editar Empresa' : 'Nova Empresa'}
      description={company ? 'Altere os dados abaixo' : 'Preencha os dados para cadastrar'}
      icon={<Building2 className="w-5 h-5" />}
      size="lg"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" form="company-form" className="btn-primary">{company ? 'Salvar Alterações' : 'Cadastrar Empresa'}</button>
        </>
      }
    >
        <form id="company-form" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="label">Razão Social / Nome *</label>
              <input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: PENA FLORESTAL LTDA" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* CNPJ + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">CNPJ *</label>
                <input className={`input ${errors.cnpj ? 'input-error' : ''}`} value={form.cnpj}
                  onChange={e => set('cnpj', formatCNPJ(e.target.value))} placeholder="00.000.000/0000-00" />
                {errors.cnpj && <p className="text-xs text-red-500 mt-1">{errors.cnpj}</p>}
              </div>
              <div>
                <label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Ativa</option>
                  <option value="inactive">Inativa</option>
                </select>
              </div>
            </div>

            {/* Cidade + UF */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="label">Cidade *</label>
                <input className={`input ${errors.city ? 'input-error' : ''}`} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Ex: Curitiba" />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="label">UF *</label>
                <select className={`select ${errors.state ? 'input-error' : ''}`} value={form.state} onChange={e => set('state', e.target.value)}>
                  <option value="">UF</option>
                  {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
              </div>
            </div>

            {/* Contato */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nome do Contato</label>
                <input className="input" value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Nome do responsável" />
              </div>
              <div>
                <label className="label">Telefone</label>
                <input className="input" value={form.phone}
                  onChange={e => set('phone', formatPhone(e.target.value))} placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div>
              <label className="label">E-mail</label>
              <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contato@empresa.com.br" />
            </div>

            <div>
              <label className="label">Observações</label>
              <textarea className="textarea" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas internas sobre esta empresa..." />
            </div>
          </div>
        </form>
    </Modal>
  );
}

export function Companies() {
  const { companies, toggleStatus, remove } = useCompanyStore();
  const { productions, deleteProduction } = useProductionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Company | null>(null);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cnpj.includes(searchTerm)
  );

  const openAdd = () => { setEditingCompany(null); setModalOpen(true); };
  const openEdit = (company: Company) => { setEditingCompany(company); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingCompany(null); };

  const productionsUsingCompany = (companyId: string) =>
    productions.filter(p => p.companyId === companyId).length;

  const pendingInUse = pendingDelete ? productionsUsingCompany(pendingDelete.id) : 0;

  const handleDelete = () => {
    if (!pendingDelete) return;
    const linked = productions.filter(p => p.companyId === pendingDelete.id);
    linked.forEach(p => deleteProduction(p.id));
    remove(pendingDelete.id);
    toast.success(
      linked.length > 0
        ? `Empresa "${pendingDelete.name}" e ${linked.length} produção(ões) excluídas.`
        : `Empresa "${pendingDelete.name}" excluída.`
    );
    setPendingDelete(null);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">Empresas</h1>
          <p className="page-subtitle">Gerenciamento de clientes e filiais</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Nova Empresa
        </button>
      </div>

      <div className="card mb-6">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nome ou CNPJ..."
              className="input pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-sm text-slate-500 font-medium">{filtered.length} empresa{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nome da Empresa</th>
                <th>CNPJ</th>
                <th>Cidade/UF</th>
                <th>Contato</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(company => {
                const inUse = productionsUsingCompany(company.id);
                return (
                  <tr key={company.id}>
                    <td className="font-medium text-slate-900">{company.name}</td>
                    <td className="font-mono text-sm">{company.cnpj}</td>
                    <td>{company.city} - {company.state}</td>
                    <td>
                      <div>{company.contactName}</div>
                      <div className="text-xs text-slate-500">{company.phone}</div>
                    </td>
                    <td>
                      <span className={`badge ${company.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                        {company.status === 'active' ? 'Ativa' : 'Inativa'}
                      </span>
                      {inUse > 0 && (
                        <span className="ml-2 text-xs text-slate-400">({inUse} uso{inUse !== 1 ? 's' : ''})</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button className="btn-icon text-slate-400 hover:text-primary-600" title="Editar" onClick={() => openEdit(company)}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="btn-icon text-slate-400 hover:text-slate-600 ml-1"
                        onClick={() => toggleStatus(company.id)}
                        title={company.status === 'active' ? 'Inativar' : 'Ativar'}
                      >
                        {company.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <button
                        className="btn-icon ml-1 text-slate-400 hover:text-red-500"
                        onClick={() => setPendingDelete(company)}
                        title={inUse > 0 ? `Excluir (e ${inUse} produção(ões) vinculada(s))` : 'Excluir'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <Building2 className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium">Nenhuma empresa encontrada</p>
                      <p className="text-sm text-slate-400 mt-1">Tente ajustar os filtros ou cadastre uma nova empresa.</p>
                      <button className="btn-primary mt-4" onClick={openAdd}><Plus className="w-4 h-4" />Nova Empresa</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && <CompanyModal company={editingCompany} onClose={closeModal} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        title={`Excluir "${pendingDelete?.name ?? ''}"?`}
        description={
          pendingInUse > 0
            ? `Esta ação não pode ser desfeita. ${pendingInUse} produção(ões) vinculada(s) também serão excluídas, junto com seus itens de checklist.`
            : 'Esta ação não pode ser desfeita.'
        }
        confirmText={pendingInUse > 0 ? `Excluir empresa e ${pendingInUse} produção(ões)` : 'Excluir'}
        destructive
      />
    </div>
  );
}
