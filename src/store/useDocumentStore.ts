import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { DocumentType, ChecklistTemplate } from '../types';
import {
  addDocumentType as syncAddDocumentType,
  updateDocumentType as syncUpdateDocumentType,
  deleteDocumentType as syncDeleteDocumentType,
  addChecklistTemplate as syncAddChecklistTemplate,
  updateChecklistTemplate as syncUpdateChecklistTemplate,
  deleteChecklistTemplate as syncDeleteChecklistTemplate,
  reorderChecklistTemplates as syncReorderChecklistTemplates,
} from '../lib/supabase-sync';
import { reportSyncError } from '../lib/sync-feedback';

interface DocumentStore {
  documentTypes: DocumentType[];
  checklistTemplates: ChecklistTemplate[];
  hydrate: (documentTypes: DocumentType[], checklistTemplates: ChecklistTemplate[]) => void;
  addDocumentType: (data: Omit<DocumentType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocumentType: (id: string, data: Partial<DocumentType>) => void;
  deleteDocumentType: (id: string) => void;
  addChecklistTemplate: (data: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'>) => ChecklistTemplate;
  updateChecklistTemplate: (id: string, data: Partial<ChecklistTemplate>) => void;
  deleteChecklistTemplate: (id: string) => void;
  reorderTemplates: (docTypeId: string, items: ChecklistTemplate[]) => void;
  getTemplatesByDocType: (docTypeId: string) => ChecklistTemplate[];
}

const selectTemplatesByDocType =
  (state: Pick<DocumentStore, 'checklistTemplates'>) =>
  (docTypeId: string): ChecklistTemplate[] =>
    state.checklistTemplates
      .filter(t => t.documentTypeId === docTypeId && t.status === 'active')
      .sort((a, b) => a.order - b.order);

export const useDocumentStore = create<DocumentStore>()((set, get) => ({
  documentTypes: [],
  checklistTemplates: [],

  hydrate: (documentTypes, checklistTemplates) => set({ documentTypes, checklistTemplates }),

  addDocumentType: (data) => {
    const now = new Date().toISOString();
    const doc: DocumentType = { id: nanoid(), ...data, createdAt: now, updatedAt: now };
    set((state) => ({ documentTypes: [...state.documentTypes, doc] }));
    syncAddDocumentType(data, doc.id).catch(err => reportSyncError('cadastrar tipo de documento', err));
  },

  updateDocumentType: (id, data) => {
    set((state) => ({
      documentTypes: state.documentTypes.map(d =>
        d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
      ),
    }));
    syncUpdateDocumentType(id, data).catch(err => reportSyncError('atualizar tipo de documento', err));
  },

  deleteDocumentType: (id) => {
    set((state) => ({
      documentTypes: state.documentTypes.filter(d => d.id !== id),
      checklistTemplates: state.checklistTemplates.filter(t => t.documentTypeId !== id),
    }));
    syncDeleteDocumentType(id).catch(err => reportSyncError('excluir tipo de documento', err));
  },

  addChecklistTemplate: (data) => {
    const now = new Date().toISOString();
    const item: ChecklistTemplate = { id: nanoid(), ...data, createdAt: now, updatedAt: now };
    set((state) => ({ checklistTemplates: [...state.checklistTemplates, item] }));
    syncAddChecklistTemplate(data, item.id).catch(err => reportSyncError('adicionar item de checklist', err));
    return item;
  },

  updateChecklistTemplate: (id, data) => {
    set((state) => ({
      checklistTemplates: state.checklistTemplates.map(t =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      ),
    }));
    syncUpdateChecklistTemplate(id, data).catch(err => reportSyncError('atualizar item de checklist', err));
  },

  deleteChecklistTemplate: (id) => {
    set((state) => ({
      checklistTemplates: state.checklistTemplates.filter(t => t.id !== id),
    }));
    syncDeleteChecklistTemplate(id).catch(err => reportSyncError('excluir item de checklist', err));
  },

  reorderTemplates: (_docTypeId, items) => {
    const now = new Date().toISOString();
    const reordered = items.map((item, i) => ({ ...item, order: i + 1, updatedAt: now }));
    set((state) => {
      const map = new Map(reordered.map(i => [i.id, i]));
      return {
        checklistTemplates: state.checklistTemplates.map(t => map.get(t.id) ?? t),
      };
    });
    syncReorderChecklistTemplates(reordered.map(({ id, order, updatedAt }) => ({ id, order, updatedAt })))
      .catch(err => reportSyncError('reordenar checklist', err));
  },

  getTemplatesByDocType: (docTypeId) => selectTemplatesByDocType(get())(docTypeId),
}));
