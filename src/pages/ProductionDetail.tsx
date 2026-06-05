import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductionStore } from '../store/useProductionStore';
import { useCompanyStore } from '../store/useCompanyStore';
import { useDocumentStore } from '../store/useDocumentStore';
import {
  ArrowLeft, CheckCircle2, Circle, MinusCircle, FileText, Calendar,
  MessageSquare, AlertTriangle, CheckCheck, ChevronDown, Pencil, Eye, EyeOff, X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ChecklistItemStatus, ProductionStatus } from '../types';
import { STATUS_CONFIG } from '../lib/utils';
import { isDelayed as checkIsDelayed } from '../lib/calculations';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: { value: ProductionStatus; label: string; cls: string }[] = (
  Object.entries(STATUS_CONFIG) as [ProductionStatus, { label: string; color: string }][]
).map(([value, { label, color }]) => ({ value, label, cls: color }));

export function ProductionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { productions, updateChecklistItem, getItemsByProduction, updateProduction } = useProductionStore();
  const { companies } = useCompanyStore();
  const { documentTypes } = useDocumentStore();
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [editingDue, setEditingDue] = useState(false);
  const [dueDraft, setDueDraft] = useState('');
  const [editingProcNote, setEditingProcNote] = useState(false);
  const [procNoteDraft, setProcNoteDraft] = useState('');
  const [procNoteHidden, setProcNoteHidden] = useState(false);

  const production = productions.find(p => p.id === id);
  const items = id ? getItemsByProduction(id) : [];
  const company = companies.find(c => c.id === production?.companyId);
  const docType = documentTypes.find(d => d.id === production?.documentTypeId);

  if (!production || !company || !docType) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Carregando processo...</p>
      </div>
    </div>
  );

  const isDelayed = checkIsDelayed(production);
  const completedCount = items.filter(i => i.status === 'ok').length;
  const naCount = items.filter(i => i.status === 'not_applicable').length;
  const pendingCount = items.filter(i => i.status === 'pending').length;

  const currentStatusOption = STATUS_OPTIONS.find(s => s.value === production.status) || STATUS_OPTIONS[0];

  const handleStatusChange = (itemId: string, status: ChecklistItemStatus) => {
    const note = noteInputs[itemId] || undefined;
    updateChecklistItem(itemId, status, note);
  };

  const handleStatusUpdate = (newStatus: ProductionStatus) => {
    updateProduction(production.id, { status: newStatus });
    setStatusMenuOpen(false);
    toast.success(`Status atualizado para "${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}"`);
  };

  const handleNoteBlur = (itemId: string) => {
    const note = noteInputs[itemId];
    if (note !== undefined) {
      const item = items.find(i => i.id === itemId);
      if (item && note !== item.notes) {
        updateChecklistItem(itemId, item.status, note);
        toast.success('Nota salva!');
      }
    }
  };

  const getStatusIcon = (status: ChecklistItemStatus) => {
    if (status === 'ok') return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    if (status === 'not_applicable') return <MinusCircle className="w-5 h-5 text-slate-400 shrink-0" />;
    return <Circle className="w-5 h-5 text-slate-300 shrink-0" />;
  };

  // Group items by stage
  const stages = Array.from(new Set(items.map(i => i.stage)));

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 pl-2">
        <ArrowLeft className="w-4 h-4" />
        Voltar para lista
      </button>

      {/* Header Card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="badge badge-blue text-base px-3 py-1">{docType.acronym}</span>
              <h1 className="text-2xl font-bold text-slate-800">{company.name}</h1>
              {isDelayed && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Atrasado
                </div>
              )}
            </div>
            <p className="text-slate-600 flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4" /> {docType.name}
            </p>
            <p className="text-sm text-slate-500">Responsável: <strong className="text-slate-700">{production.responsible}</strong></p>
          </div>

          <div className="flex flex-col gap-3 min-w-fit">
            {/* Status selector */}
            <div className="relative">
              <button
                onClick={() => setStatusMenuOpen(o => !o)}
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-primary-300 transition-colors shadow-sm"
              >
                <span className={`badge ${currentStatusOption.cls}`}>{currentStatusOption.label}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {statusMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden w-52">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusUpdate(opt.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors ${production.status === opt.value ? 'bg-slate-50 font-medium' : ''}`}
                    >
                      <span className={`badge ${opt.cls}`}>{opt.label}</span>
                      {production.status === opt.value && <CheckCheck className="w-3.5 h-3.5 text-primary-600 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-sm text-slate-600">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" />
                <span>Prazo:</span>
                {editingDue ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="date"
                      className="input py-1 px-2 text-sm flex-1"
                      value={dueDraft}
                      onChange={e => setDueDraft(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        if (dueDraft && dueDraft !== production.dueDate) {
                          updateProduction(production.id, { dueDate: dueDraft });
                          toast.success('Prazo atualizado!');
                        }
                        setEditingDue(false);
                      }}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-2"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => { setDueDraft(production.dueDate); setEditingDue(false); }}
                      className="text-xs text-slate-500 hover:text-slate-700 px-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setDueDraft(production.dueDate); setEditingDue(true); }}
                    className={`group inline-flex items-center gap-1.5 font-semibold px-2 py-0.5 -mx-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all ${isDelayed ? 'text-red-600' : 'text-slate-800'}`}
                    title="Clique para editar o prazo"
                  >
                    {format(new Date(production.dueDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Progresso do Documento</span>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{completedCount} ok</span>
              <span className="flex items-center gap-1"><MinusCircle className="w-3.5 h-3.5 text-slate-400" />{naCount} N/A</span>
              <span className="flex items-center gap-1"><Circle className="w-3.5 h-3.5 text-slate-300" />{pendingCount} pendente</span>
              <strong className="text-xl font-bold text-primary-700 ml-2">{production.progress}%</strong>
            </div>
          </div>
          <div className="progress-bar-track h-3 bg-slate-100">
            <div
              className={`progress-bar-fill ${production.progress === 100 ? 'bg-emerald-500' : 'bg-primary-500'}`}
              style={{ width: `${production.progress}%` }}
            />
          </div>
          {production.progress === 100 && (
            <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <CheckCheck className="w-4 h-4" /> Todos os itens concluídos! Mude o status para "Concluído".
            </p>
          )}
        </div>

        {/* Notas do processo */}
        <div className="mt-4">
          {procNoteHidden ? (
            <button
              onClick={() => setProcNoteHidden(false)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              <Eye className="w-3.5 h-3.5" />
              {production.notes ? 'Mostrar notas do processo' : 'Adicionar notas do processo'}
            </button>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <div className="flex items-start justify-between gap-2 mb-1">
                <strong className="shrink-0">📋 Notas:</strong>
                <div className="flex items-center gap-1 -mt-1 -mr-1">
                  <button
                    onClick={() => { setProcNoteDraft(production.notes); setEditingProcNote(e => !e); }}
                    className="p-1 rounded hover:bg-amber-100 text-amber-700"
                    title="Editar notas"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setProcNoteHidden(true)}
                    className="p-1 rounded hover:bg-amber-100 text-amber-700"
                    title="Ocultar notas"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {editingProcNote ? (
                <div className="mt-2">
                  <textarea
                    className="textarea text-sm bg-white border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                    rows={3}
                    value={procNoteDraft}
                    onChange={e => setProcNoteDraft(e.target.value)}
                    placeholder="Anotações gerais do processo..."
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => { setProcNoteDraft(production.notes); setEditingProcNote(false); }}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        updateProduction(production.id, { notes: procNoteDraft });
                        setEditingProcNote(false);
                        toast.success('Notas atualizadas!');
                      }}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap break-words">
                  {production.notes || <span className="italic text-amber-600/70">Sem notas. Clique no lápis para adicionar.</span>}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Checklist por etapa */}
      <h2 className="text-lg font-bold text-slate-800 mb-4">Etapas do Checklist</h2>

      {stages.map(stage => {
        const stageItems = items.filter(i => i.stage === stage);
        const stageOk = stageItems.filter(i => i.status === 'ok').length;
        const stageTotal = stageItems.filter(i => i.status !== 'not_applicable').length;

        return (
          <div key={stage} className="mb-4">
            <div className="flex items-center gap-3 mb-2 px-1">
              <span className="badge badge-gray font-semibold text-xs uppercase tracking-wider">{stage}</span>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">{stageOk}/{stageTotal}</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {stageItems.map((item) => (
                <div
                  key={item.id}
                  className={`border-b border-slate-100 last:border-0 transition-colors ${
                    item.status === 'ok' ? 'bg-emerald-50/40' :
                    item.status === 'not_applicable' ? 'bg-slate-50/80 opacity-70' : ''
                  }`}
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-medium text-sm ${item.status === 'not_applicable' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {item.description}
                          </p>
                          {item.isRequired && <span className="badge badge-orange shrink-0 text-[10px]">Obrig.</span>}
                        </div>
                        {item.observations && (
                          <p className="text-xs text-slate-400 italic mt-0.5">{item.observations}</p>
                        )}
                        {/* Note */}
                        {expandedNote === item.id ? (
                          <div className="mt-2">
                            <textarea
                              className="textarea text-xs py-1.5 h-16"
                              placeholder="Adicionar anotação neste item..."
                              value={noteInputs[item.id] ?? item.notes}
                              onChange={e => setNoteInputs(n => ({ ...n, [item.id]: e.target.value }))}
                              onBlur={() => handleNoteBlur(item.id)}
                            />
                          </div>
                        ) : item.notes ? (
                          <button
                            onClick={() => setExpandedNote(item.id)}
                            className="text-xs text-blue-500 mt-1 flex items-center gap-1 hover:text-blue-700 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                            {item.notes}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-8 sm:ml-0 shrink-0">
                      {/* Note toggle */}
                      <button
                        onClick={() => setExpandedNote(expandedNote === item.id ? null : item.id)}
                        className={`btn-icon btn-sm text-slate-400 hover:text-blue-500 transition-colors ${expandedNote === item.id ? 'text-blue-500 bg-blue-50' : ''}`}
                        title="Anotação"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* Status buttons */}
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleStatusChange(item.id, 'pending')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${item.status === 'pending' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Pendente
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'ok')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${item.status === 'ok' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-600'}`}
                        >
                          OK
                        </button>
                        <button
                          onClick={() => {
                            if (item.isRequired) { toast.error('Este item é obrigatório e não pode ser marcado como N/A'); return; }
                            handleStatusChange(item.id, 'not_applicable');
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${item.status === 'not_applicable' ? 'bg-slate-300 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          title="Não Aplicável"
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Click outside to close status menu */}
      {statusMenuOpen && (
        <div className="fixed inset-0 z-9" onClick={() => setStatusMenuOpen(false)} />
      )}
    </div>
  );
}
