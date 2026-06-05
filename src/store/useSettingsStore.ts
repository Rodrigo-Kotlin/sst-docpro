import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { AppSettings, Responsible } from '../types';
import { updateSettings as syncUpdateSettings } from '../lib/supabase-sync';
import { reportSyncError } from '../lib/sync-feedback';

interface SettingsStore {
  settings: AppSettings;
  hydrate: (settings: AppSettings) => void;
  addResponsible: (data: Omit<Responsible, 'id'>) => void;
  updateResponsible: (id: string, data: Partial<Responsible>) => void;
  toggleResponsibleStatus: (id: string) => void;
  removeResponsible: (id: string) => void;
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
  addPeriodicity: (name: string) => void;
  removePeriodicity: (name: string) => void;
}

function persistSettings(getSettings: () => AppSettings) {
  syncUpdateSettings(getSettings()).catch(err => reportSyncError('salvar configurações', err));
}

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  settings: { responsibles: [], categories: [], periodicities: [] },

  hydrate: (settings) => set({ settings }),

  addResponsible: (data) => {
    set((state) => ({
      settings: {
        ...state.settings,
        responsibles: [...state.settings.responsibles, { id: nanoid(), ...data }],
      },
    }));
    persistSettings(() => get().settings);
  },

  updateResponsible: (id, data) => {
    set((state) => ({
      settings: {
        ...state.settings,
        responsibles: state.settings.responsibles.map(r =>
          r.id === id ? { ...r, ...data } : r
        ),
      },
    }));
    persistSettings(() => get().settings);
  },

  toggleResponsibleStatus: (id) => {
    set((state) => ({
      settings: {
        ...state.settings,
        responsibles: state.settings.responsibles.map(r =>
          r.id === id
            ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' }
            : r
        ),
      },
    }));
    persistSettings(() => get().settings);
  },

  removeResponsible: (id) => {
    set((state) => ({
      settings: {
        ...state.settings,
        responsibles: state.settings.responsibles.filter(r => r.id !== id),
      },
    }));
    persistSettings(() => get().settings);
  },

  addCategory: (name) => {
    set((state) => {
      if (state.settings.categories.includes(name)) return state;
      return {
        settings: { ...state.settings, categories: [...state.settings.categories, name] },
      };
    });
    persistSettings(() => get().settings);
  },

  removeCategory: (name) => {
    set((state) => ({
      settings: {
        ...state.settings,
        categories: state.settings.categories.filter(c => c !== name),
      },
    }));
    persistSettings(() => get().settings);
  },

  addPeriodicity: (name) => {
    set((state) => {
      if (state.settings.periodicities.includes(name)) return state;
      return {
        settings: { ...state.settings, periodicities: [...state.settings.periodicities, name] },
      };
    });
    persistSettings(() => get().settings);
  },

  removePeriodicity: (name) => {
    set((state) => ({
      settings: {
        ...state.settings,
        periodicities: state.settings.periodicities.filter(p => p !== name),
      },
    }));
    persistSettings(() => get().settings);
  },
}));
