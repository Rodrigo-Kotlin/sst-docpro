import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Company } from '../types';
import {
  addCompany as syncAddCompany,
  updateCompany as syncUpdateCompany,
  deleteCompany as syncDeleteCompany,
} from '../lib/supabase-sync';
import { reportSyncError } from '../lib/sync-feedback';

interface CompanyStore {
  companies: Company[];
  hydrate: (companies: Company[]) => void;
  add: (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  update: (id: string, data: Partial<Company>) => void;
  toggleStatus: (id: string) => void;
  remove: (id: string) => void;
}

export const useCompanyStore = create<CompanyStore>()((set) => ({
  companies: [],

  hydrate: (companies) => set({ companies }),

  add: (data) => {
    const now = new Date().toISOString();
    const company: Company = { id: nanoid(), ...data, createdAt: now, updatedAt: now };
    set((state) => ({ companies: [...state.companies, company] }));
    syncAddCompany(data, company.id).catch(err => reportSyncError('cadastrar empresa', err));
  },

  update: (id, data) => {
    set((state) => ({
      companies: state.companies.map(c =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
    }));
    syncUpdateCompany(id, data).catch(err => reportSyncError('atualizar empresa', err));
  },

  toggleStatus: (id) => {
    const company = useCompanyStore.getState().companies.find(c => c.id === id);
    if (!company) return;
    const newStatus: Company['status'] = company.status === 'active' ? 'inactive' : 'active';
    set((state) => ({
      companies: state.companies.map(c =>
        c.id === id
          ? { ...c, status: newStatus, updatedAt: new Date().toISOString() }
          : c
      ),
    }));
    syncUpdateCompany(id, { status: newStatus }).catch(err => reportSyncError('alterar status da empresa', err));
  },

  remove: (id) => {
    set((state) => ({
      companies: state.companies.filter(c => c.id !== id),
    }));
    syncDeleteCompany(id).catch(err => reportSyncError('excluir empresa', err));
  },
}));
