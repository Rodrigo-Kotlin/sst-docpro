import { useEffect, useState, type ReactNode } from 'react';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useProductionStore } from '../../store/useProductionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import {
  fetchCompanies, fetchDocumentTypes, fetchChecklistTemplates,
  fetchProductions, fetchProductionItems, fetchSettings,
  subscribeToTable, seedIfEmpty,
  mapCompanyFromRow, mapDocumentTypeFromRow, mapChecklistTemplateFromRow,
  mapProductionFromRow, mapProductionItemFromRow, mapSettingsFromRow,
  type RealtimePayload,
} from '../../lib/supabase-sync';

interface SyncProviderProps {
  children: ReactNode;
}

type SyncStatus = 'loading' | 'ready' | 'error';

export function SyncProvider({ children }: SyncProviderProps) {
  const [status, setStatus] = useState<SyncStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    let cleanups: (() => void)[] = [];

    async function init() {
      try {
        await seedIfEmpty();

        if (cancelled) return;

        const [
          companies, documentTypes, templates,
          productions, productionItems, settings,
        ] = await Promise.all([
          fetchCompanies(), fetchDocumentTypes(), fetchChecklistTemplates(),
          fetchProductions(), fetchProductionItems(), fetchSettings(),
        ]);

        if (cancelled) return;

        useCompanyStore.getState().hydrate(companies);
        useDocumentStore.getState().hydrate(documentTypes, templates);
        useProductionStore.getState().hydrate(productions, productionItems);
        useSettingsStore.getState().hydrate(settings);

        if (cancelled) return;

        // Set up realtime subscriptions
        cleanups = [
          subscribeToTable('companies', onCompanyChange),
          subscribeToTable('document_types', onDocumentTypeChange),
          subscribeToTable('checklist_templates', onChecklistTemplateChange),
          subscribeToTable('productions', onProductionChange),
          subscribeToTable('production_items', onProductionItemChange),
          subscribeToTable('settings', onSettingsChange),
        ];

        setStatus('ready');
      } catch (err) {
        console.error('SyncProvider initialization error:', err);
        if (!cancelled) setStatus('error');
      }
    }

    init();

    return () => {
      cancelled = true;
      cleanups.forEach(fn => fn());
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <p className="text-destructive mb-2 text-lg font-semibold">Erro de conexão</p>
          <p className="text-muted-foreground text-sm mb-4">
            Não foi possível conectar ao banco de dados. Verifique se o Supabase está configurado corretamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ─── Realtime Handlers ────────────────────────────────────────

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex(i => i.id === item.id);
  if (idx === -1) return [...list, item];
  const next = list.slice();
  next[idx] = item;
  return next;
}

function onCompanyChange(payload: RealtimePayload) {
  const store = useCompanyStore.getState();
  if (payload.eventType === 'INSERT') {
    const incoming = mapCompanyFromRow(payload.new as never);
    store.hydrate(upsertById(store.companies, incoming));
  } else if (payload.eventType === 'UPDATE') {
    const updated = mapCompanyFromRow(payload.new as never);
    store.hydrate(upsertById(store.companies, updated));
  } else if (payload.eventType === 'DELETE') {
    store.hydrate(store.companies.filter(c => c.id !== (payload.old as Record<string, unknown>).id));
  }
}

function onDocumentTypeChange(payload: RealtimePayload) {
  const store = useDocumentStore.getState();
  if (payload.eventType === 'INSERT') {
    const incoming = mapDocumentTypeFromRow(payload.new as never);
    store.hydrate(upsertById(store.documentTypes, incoming), store.checklistTemplates);
  } else if (payload.eventType === 'UPDATE') {
    const updated = mapDocumentTypeFromRow(payload.new as never);
    store.hydrate(upsertById(store.documentTypes, updated), store.checklistTemplates);
  } else if (payload.eventType === 'DELETE') {
    const oldId = (payload.old as Record<string, unknown>).id as string;
    store.hydrate(
      store.documentTypes.filter(d => d.id !== oldId),
      store.checklistTemplates.filter(t => t.documentTypeId !== oldId),
    );
  }
}

function onChecklistTemplateChange(payload: RealtimePayload) {
  const store = useDocumentStore.getState();
  if (payload.eventType === 'INSERT') {
    const incoming = mapChecklistTemplateFromRow(payload.new as never);
    store.hydrate(store.documentTypes, upsertById(store.checklistTemplates, incoming));
  } else if (payload.eventType === 'UPDATE') {
    const updated = mapChecklistTemplateFromRow(payload.new as never);
    store.hydrate(store.documentTypes, upsertById(store.checklistTemplates, updated));
  } else if (payload.eventType === 'DELETE') {
    const oldId = (payload.old as Record<string, unknown>).id as string;
    store.hydrate(store.documentTypes, store.checklistTemplates.filter(t => t.id !== oldId));
  }
}

function onProductionChange(payload: RealtimePayload) {
  const store = useProductionStore.getState();
  if (payload.eventType === 'INSERT') {
    const incoming = mapProductionFromRow(payload.new as never);
    store.hydrate(upsertById(store.productions, incoming), store.productionItems);
  } else if (payload.eventType === 'UPDATE') {
    const updated = mapProductionFromRow(payload.new as never);
    store.hydrate(upsertById(store.productions, updated), store.productionItems);
  } else if (payload.eventType === 'DELETE') {
    const oldId = (payload.old as Record<string, unknown>).id as string;
    store.hydrate(
      store.productions.filter(p => p.id !== oldId),
      store.productionItems.filter(i => i.productionDocumentId !== oldId),
    );
  }
}

function onProductionItemChange(payload: RealtimePayload) {
  const store = useProductionStore.getState();
  if (payload.eventType === 'INSERT') {
    const incoming = mapProductionItemFromRow(payload.new as never);
    store.hydrate(store.productions, upsertById(store.productionItems, incoming));
  } else if (payload.eventType === 'UPDATE') {
    const updated = mapProductionItemFromRow(payload.new as never);
    store.hydrate(store.productions, upsertById(store.productionItems, updated));
  } else if (payload.eventType === 'DELETE') {
    const oldId = (payload.old as Record<string, unknown>).id as string;
    store.hydrate(store.productions, store.productionItems.filter(i => i.id !== oldId));
  }
}

function onSettingsChange(payload: RealtimePayload) {
  if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
    const updated = mapSettingsFromRow(payload.new as never);
    useSettingsStore.getState().hydrate({
      responsibles: updated.responsibles,
      categories: updated.categories,
      periodicities: updated.periodicities,
    });
  }
}
