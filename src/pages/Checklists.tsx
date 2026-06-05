import { useState } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { FileText, Plus, List, Search, Edit2, Trash2, GripVertical } from 'lucide-react';
import type { ChecklistTemplate } from '../types';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const STAGES = ['Coleta de dados', 'Análise', 'Elaboração', 'Revisão', 'Aprovação', 'Entrega'];

interface ChecklistItemModalProps {
  template?: ChecklistTemplate | null;
  documentTypeId: string;
  nextOrder: number;
  onClose: () => void;
}

function ChecklistItemModal({ template, documentTypeId, nextOrder, onClose }: ChecklistItemModalProps) {
  const { addChecklistTemplate, updateChecklistTemplate } = useDocumentStore();
  const [form, setForm] = useState({
    stage: template?.stage || STAGES[0],
    description: template?.description || '',
    weight: template?.weight ?? 1,
    isRequired: template?.isRequired ?? true,
    observations: template?.observations || '',
    order: template?.order ?? nextOrder,
    documentTypeId,
    status: 'active' as const,
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) { setError('Descrição é obrigatória'); return; }
    if (template) {
      updateChecklistTemplate(template.id, form);
      toast.success('Item atualizado!');
    } else {
      addChecklistTemplate(form);
      toast.success('Item adicionado ao checklist!');
    }
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={template ? 'Editar Item' : 'Novo Item de Checklist'}
      description="Configure as propriedades da etapa"
      icon={<List className="w-5 h-5" />}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" form="checklist-form" className="btn-primary">{template ? 'Salvar Alterações' : 'Adicionar Item'}</button>
        </>
      }
    >
        <form id="checklist-form" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Etapa</label>
                <select className="select" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Peso (relevância)</label>
                <input type="number" className="input" min={1} max={10} value={form.weight}
                  onChange={e => setForm(f => ({ ...f, weight: Number(e.target.value) }))} />
              </div>
            </div>

            <div>
              <label className="label">Descrição do Item *</label>
              <textarea className={`textarea ${error ? 'input-error' : ''}`} rows={3} value={form.description}
                onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setError(''); }}
                placeholder="Ex: Levantar lista de trabalhadores expostos a agentes de risco..." />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            <div>
              <label className="label">Observações (instruções internas)</label>
              <textarea className="textarea" rows={2} value={form.observations}
                onChange={e => setForm(f => ({ ...f, observations: e.target.value }))}
                placeholder="Dicas ou instruções para quem for executar esta etapa..." />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="isRequired"
                checked={form.isRequired}
                onChange={e => setForm(f => ({ ...f, isRequired: e.target.checked }))}
                className="w-4 h-4 rounded accent-primary-600"
              />
              <label htmlFor="isRequired" className="text-sm font-medium text-slate-700 cursor-pointer">
                Item obrigatório <span className="text-slate-400 font-normal">(não pode ser marcado como N/A na produção)</span>
              </label>
            </div>
          </div>
        </form>
    </Modal>
  );
}

export function Checklists() {
  const { documentTypes, getTemplatesByDocType, deleteChecklistTemplate } = useDocumentStore();
  const [selectedDocId, setSelectedDocId] = useState<string>(() => '');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistTemplate | null>(null);

  const activeDoc = documentTypes.find(d => d.id === selectedDocId) ?? (documentTypes[0] ?? null);
  const effectiveDocId = activeDoc?.id ?? '';
  const allItems = getTemplatesByDocType(effectiveDocId);
  const items = allItems.filter(i => i.description.toLowerCase().includes(search.toLowerCase()) || i.stage.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditingItem(null); setModalOpen(true); };
  const openEdit = (item: ChecklistTemplate) => { setEditingItem(item); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); };
  const [pendingDelete, setPendingDelete] = useState<ChecklistTemplate | null>(null);

  const confirmDelete = () => {
    if (pendingDelete) {
      deleteChecklistTemplate(pendingDelete.id);
      toast.success('Item removido do checklist.');
      setPendingDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="section-header flex-shrink-0">
        <div>
          <h1 className="page-title">Modelos de Checklist</h1>
          <p className="page-subtitle">Configure as etapas padrão para cada documento</p>
        </div>
        <button className="btn-primary" disabled={!effectiveDocId} onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Novo Item
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Sidebar de Documentos */}
        <div className="w-full lg:w-72 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-600" />
              Tipos de Documento
            </h3>
            <p className="text-xs text-slate-400 mt-1">{documentTypes.length} tipos cadastrados</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {documentTypes.map(doc => {
              const count = getTemplatesByDocType(doc.id).length;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left p-3 rounded-xl mb-1 transition-all ${
                    effectiveDocId === doc.id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'hover:bg-slate-50 border border-transparent text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm">{doc.acronym}</div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${effectiveDocId === doc.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                  </div>
                  <div className="text-xs truncate opacity-80 mt-0.5">{doc.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Itens do Checklist */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-w-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-800">
                Checklist: <span className="text-primary-700">{activeDoc?.acronym || 'Selecione'}</span>
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">{allItems.length} {allItems.length === 1 ? 'item configurado' : 'itens configurados'}</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input type="text" placeholder="Buscar na lista..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 py-2 w-56" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {items.length === 0 && allItems.length === 0 ? (
              <div className="empty-state">
                <List className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Nenhum item configurado para este documento</p>
                <p className="text-sm text-slate-400 mt-1">Adicione etapas que farão parte do checklist padrão.</p>
                <button className="btn-primary mt-4" onClick={openAdd}><Plus className="w-4 h-4" />Criar o primeiro item</button>
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <p className="text-slate-400">Nenhum item corresponde à busca.</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="checklist-item items-center justify-between group">
                  <div className="flex items-start gap-3 flex-1">
                    <GripVertical className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">
                      {item.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-gray">{item.stage}</span>
                        {item.isRequired && <span className="badge badge-orange">Obrigatório</span>}
                      </div>
                      <p className="font-medium text-slate-800 text-sm">{item.description}</p>
                      {item.observations && <p className="text-xs text-slate-400 mt-1 italic">{item.observations}</p>}
                      <div className="flex gap-4 mt-2 text-xs text-slate-400">
                        <span>Peso: <strong className="text-slate-600">{item.weight}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <button className="btn-icon btn-sm text-slate-400 hover:text-primary-600" onClick={() => openEdit(item)} title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="btn-icon btn-sm text-slate-400 hover:text-red-500" onClick={() => setPendingDelete(item)} title="Remover">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <ChecklistItemModal
          template={editingItem}
          documentTypeId={effectiveDocId}
          nextOrder={allItems.length + 1}
          onClose={closeModal}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
        title={`Remover "${pendingDelete?.description ?? ''}"?`}
        description="Esta ação não pode ser desfeita e afetará apenas novas produções."
        confirmText="Remover"
        destructive
      />
    </div>
  );
}
