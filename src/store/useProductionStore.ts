import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  ProductionDocument, ProductionChecklistItem, ChecklistTemplate,
  ProductionStatus, ChecklistItemStatus,
} from '../types';
import { calculateProgress } from '../lib/calculations';
import {
  addProduction as syncAddProduction,
  updateProduction as syncUpdateProduction,
  deleteProduction as syncDeleteProduction,
  addProductionItems as syncAddProductionItems,
  updateProductionItem as syncUpdateProductionItem,
  deleteProductionItemsByProduction,
} from '../lib/supabase-sync';
import { reportSyncError } from '../lib/sync-feedback';

interface ProductionStore {
  productions: ProductionDocument[];
  productionItems: ProductionChecklistItem[];
  hydrate: (productions: ProductionDocument[], productionItems: ProductionChecklistItem[]) => void;
  createProduction: (
    data: Omit<ProductionDocument, 'id' | 'progress' | 'createdAt' | 'updatedAt'>,
    templates: ChecklistTemplate[]
  ) => ProductionDocument;
  updateProduction: (id: string, data: Partial<ProductionDocument>) => void;
  deleteProduction: (id: string) => void;
  updateChecklistItem: (id: string, status: ChecklistItemStatus, notes?: string) => void;
  getItemsByProduction: (productionId: string) => ProductionChecklistItem[];
  getProductionById: (id: string) => ProductionDocument | undefined;
  recalculateProgress: (productionId: string) => void;
}

export const useProductionStore = create<ProductionStore>()((set, get) => ({
  productions: [],
  productionItems: [],

  hydrate: (productions, productionItems) => set({ productions, productionItems }),

  createProduction: (data, templates) => {
    const now = new Date().toISOString();
    const prod: ProductionDocument = {
      id: nanoid(),
      ...data,
      progress: 0,
      createdAt: now,
      updatedAt: now,
    };

    const items: ProductionChecklistItem[] = templates.map(t => ({
      id: nanoid(),
      productionDocumentId: prod.id,
      templateItemId: t.id,
      stage: t.stage,
      description: t.description,
      order: t.order,
      weight: t.weight,
      isRequired: t.isRequired,
      status: 'pending' as ChecklistItemStatus,
      completedAt: null,
      notes: '',
      observations: '',
      createdAt: now,
      updatedAt: now,
    }));

    set((state) => ({
      productions: [...state.productions, prod],
      productionItems: [...state.productionItems, ...items],
    }));

    syncAddProduction(data, prod.id).catch(err => reportSyncError('criar produção', err));
    syncAddProductionItems(items).catch(err => reportSyncError('criar itens da produção', err));

    return prod;
  },

  updateProduction: (id, data) => {
    set((state) => ({
      productions: state.productions.map(p =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      ),
    }));
    syncUpdateProduction(id, data).catch(err => reportSyncError('atualizar produção', err));
  },

  deleteProduction: (id) => {
    set((state) => ({
      productions: state.productions.filter(p => p.id !== id),
      productionItems: state.productionItems.filter(i => i.productionDocumentId !== id),
    }));
    syncDeleteProduction(id).catch(err => reportSyncError('excluir produção', err));
    deleteProductionItemsByProduction(id).catch(err => reportSyncError('excluir itens da produção', err));
  },

  updateChecklistItem: (id, status, notes) => {
    const now = new Date().toISOString();
    let item: ProductionChecklistItem | undefined;
    let updatedItems: ProductionChecklistItem[] = [];

    set((state) => {
      updatedItems = state.productionItems.map(i => {
        if (i.id !== id) return i;
        item = {
          ...i,
          status,
          notes: notes ?? i.notes,
          completedAt: status === 'ok' ? now : null,
          updatedAt: now,
        };
        return item;
      });
      return { productionItems: updatedItems };
    });

    if (!item) return;

    syncUpdateProductionItem(id, {
      status, notes: notes ?? undefined,
      completedAt: status === 'ok' ? now : null,
    }).catch(err => reportSyncError('atualizar item de checklist', err));

    const prodItems = updatedItems.filter(i => i.productionDocumentId === item!.productionDocumentId);
    const progress = calculateProgress(prodItems, true);

    set((state) => ({
      productions: state.productions.map(p => {
        if (p.id !== item!.productionDocumentId) return p;
        let newStatus: ProductionStatus = p.status;
        if (p.status === 'cancelled') return p;
        if (progress === 100 && p.status !== 'completed') newStatus = 'in_review';
        else if (progress > 0 && (p.status === 'not_started' || p.status === 'pending_info' || p.status === 'waiting_client')) {
          newStatus = 'in_progress';
        }
        return { ...p, progress, status: newStatus, updatedAt: now };
      }),
    }));

    const prod = get().productions.find(p => p.id === item!.productionDocumentId);
    if (prod) {
      syncUpdateProduction(prod.id, { progress: prod.progress, status: prod.status }).catch(err => reportSyncError('atualizar progresso da produção', err));
    }
  },

  getItemsByProduction: (productionId) =>
    get()
      .productionItems
      .filter(i => i.productionDocumentId === productionId)
      .sort((a, b) => a.order - b.order),

  getProductionById: (id) => get().productions.find(p => p.id === id),

  recalculateProgress: (productionId) => {
    const items = get().productionItems.filter(i => i.productionDocumentId === productionId);
    const progress = calculateProgress(items, true);
    set((state) => ({
      productions: state.productions.map(p =>
        p.id === productionId ? { ...p, progress, updatedAt: new Date().toISOString() } : p
      ),
    }));
    syncUpdateProduction(productionId, { progress }).catch(err => reportSyncError('recalcular progresso', err));
  },
}));
