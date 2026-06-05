import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, FileText } from 'lucide-react';
import { useDocumentStore } from '../store/useDocumentStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useProductionStore } from '../store/useProductionStore';
import type { DocumentType } from '../types';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', acronym: '', category: '', description: '', periodicity: '', defaultResponsible: '', status: 'active' as const,
};

interface DocumentModalProps {
  document?: DocumentType | null;
  onClose: () => void;
}

function DocumentModal({ document, onClose }: DocumentModalProps) {
  const { addDocumentType, updateDocumentType } = useDocumentStore();
  const { settings } = useSettingsStore();
  const [form, setForm] = useState(document ? {
    name: document.name, acronym: document.acronym, category: document.category,
    description: document.description, periodicity: document.periodicity,
    defaultResponsible: document.defaultResponsible, status: document.status,
  } : EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.acronym.trim()) e.acronym = 'Sigla é obrigatória';
    if (!form.category.trim()) e.category = 'Categoria é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (document) {
      updateDocumentType(document.id, form);
      toast.success('Documento atualizado com sucesso!');
    } else {
      addDocumentType(form);
      toast.success('Tipo de documento cadastrado!');
    }
    onClose();
  };

  const activeResponsibles = settings.responsibles.filter(r => r.status === 'active');
  const categories = settings.categories.length > 0 ? settings.categories : ['Saúde', 'Segurança', 'Ambiental', 'Treinamento'];
  const periodicities = settings.periodicities.length > 0 ? settings.periodicities : ['Anual', 'Bienal', 'Trienal', 'Quadrienal', 'Quinquenal', 'Sob demanda'];

  return (
    <Modal
      open
      onClose={onClose}
      title={document ? 'Editar Documento' : 'Novo Tipo de Documento'}
      description="Configure as propriedades do documento"
      icon={<FileText className="w-5 h-5" />}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" form="document-form" className="btn-primary">{document ? 'Salvar Alterações' : 'Criar Documento'}</button>
        </>
      }
    >
        <form id="document-form" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="label">Nome do Documento *</label>
                <input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name}
                  onChange={e => set('name', e.target.value)} placeholder="Ex: Programa de Gerenciamento de Riscos" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="label">Sigla *</label>
                <input className={`input ${errors.acronym ? 'input-error' : ''} font-bold uppercase`} value={form.acronym}
                  onChange={e => set('acronym', e.target.value.toUpperCase())} placeholder="PGR" maxLength={10} />
                {errors.acronym && <p className="text-xs text-red-500 mt-1">{errors.acronym}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Categoria *</label>
                <select className={`select ${errors.category ? 'input-error' : ''}`} value={form.category}
                  onChange={e => set('category', e.target.value)}>
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="label">Periodicidade</label>
                <select className="select" value={form.periodicity} onChange={e => set('periodicity', e.target.value)}>
                  <option value="">Selecione...</option>
                  {periodicities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Descrição</label>
              <textarea className="textarea" rows={2} value={form.description}
                onChange={e => set('description', e.target.value)} placeholder="Breve descrição do documento e sua finalidade..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Responsável Padrão</label>
                {activeResponsibles.length > 0 ? (
                  <select className="select" value={form.defaultResponsible} onChange={e => set('defaultResponsible', e.target.value)}>
                    <option value="">Nenhum</option>
                    {activeResponsibles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                ) : (
                  <input className="input" value={form.defaultResponsible}
                    onChange={e => set('defaultResponsible', e.target.value)} placeholder="Nome do responsável" />
                )}
              </div>
              <div>
                <label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
          </div>
        </form>
    </Modal>
  );
}

export function Documents() {
  const { documentTypes, deleteDocumentType } = useDocumentStore();
  const { productions, deleteProduction } = useProductionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentType | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DocumentType | null>(null);

  const filtered = documentTypes.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.acronym.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAdd = () => { setEditingDoc(null); setModalOpen(true); };
  const openEdit = (doc: DocumentType) => { setEditingDoc(doc); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingDoc(null); };

  const productionsUsingDoc = (docId: string) =>
    productions.filter(p => p.documentTypeId === docId).length;

  const pendingInUse = pendingDelete ? productionsUsingDoc(pendingDelete.id) : 0;

  const handleDelete = () => {
    if (!pendingDelete) return;
    const linked = productions.filter(p => p.documentTypeId === pendingDelete.id);
    linked.forEach(p => deleteProduction(p.id));
    deleteDocumentType(pendingDelete.id);
    toast.success(
      linked.length > 0
        ? `Documento "${pendingDelete.acronym}" e ${linked.length} produção(ões) excluídas.`
        : `Documento "${pendingDelete.acronym}" excluído.`
    );
    setPendingDelete(null);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">Documentos Padrão</h1>
          <p className="page-subtitle">Tipos de documentos emitidos pela empresa</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Novo Documento
        </button>
      </div>

      <div className="card mb-6">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nome ou sigla..."
              className="input pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-sm text-slate-500 font-medium">{filtered.length} documento{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Sigla</th>
                <th>Nome do Documento</th>
                <th>Categoria</th>
                <th>Periodicidade</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => {
                const inUse = productionsUsingDoc(doc.id);
                return (
                  <tr key={doc.id}>
                    <td>
                      <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg text-sm">{doc.acronym}</span>
                    </td>
                    <td className="font-medium text-slate-900">{doc.name}</td>
                    <td>
                      <span className="badge badge-blue">{doc.category}</span>
                    </td>
                    <td className="text-slate-600">{doc.periodicity || '—'}</td>
                    <td>
                      <span className={`badge ${doc.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                        {doc.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                      {inUse > 0 && (
                        <span className="ml-2 text-xs text-slate-400">({inUse} uso{inUse !== 1 ? 's' : ''})</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button className="btn-icon text-slate-400 hover:text-primary-600" title="Editar" onClick={() => openEdit(doc)}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="btn-icon ml-1 text-slate-400 hover:text-red-500"
                        onClick={() => setPendingDelete(doc)}
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
                      <FileText className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium">Nenhum documento encontrado</p>
                      <button className="btn-primary mt-4" onClick={openAdd}><Plus className="w-4 h-4" />Novo Documento</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && <DocumentModal document={editingDoc} onClose={closeModal} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        title={`Excluir "${pendingDelete?.acronym ?? ''}"?`}
        description={
          pendingInUse > 0
            ? `Esta ação não pode ser desfeita. ${pendingInUse} produção(ões) vinculada(s) e os itens do checklist padrão também serão excluídos.`
            : 'Esta ação não pode ser desfeita. Os itens do checklist padrão vinculados a este documento também serão removidos.'
        }
        confirmText={pendingInUse > 0 ? `Excluir documento e ${pendingInUse} produção(ões)` : 'Excluir'}
        destructive
      />
    </div>
  );
}
