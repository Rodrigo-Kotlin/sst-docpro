import { supabase } from './supabase';
import type {
  Company, DocumentType, ChecklistTemplate,
  ProductionDocument, ProductionChecklistItem, AppSettings,
} from '../types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ─── DB Row types (snake_case from Supabase) ──────────────────

type CompanyRow = {
  id: string; name: string; cnpj: string; city: string; state: string;
  contact_name: string; phone: string; email: string;
  status: string; notes: string; created_at: string; updated_at: string;
};

type DocumentTypeRow = {
  id: string; name: string; acronym: string; category: string;
  description: string; periodicity: string; default_responsible: string;
  status: string; created_at: string; updated_at: string;
};

type ChecklistTemplateRow = {
  id: string; document_type_id: string; stage: string; description: string;
  order: number; weight: number; is_required: boolean;
  status: string; observations: string; created_at: string; updated_at: string;
};

type ProductionRow = {
  id: string; company_id: string; document_type_id: string;
  responsible: string; start_date: string; due_date: string;
  completion_date: string | null; status: string; priority: string;
  progress: number; notes: string; created_by: string;
  created_at: string; updated_at: string;
};

type ProductionItemRow = {
  id: string; production_document_id: string; template_item_id: string;
  stage: string; description: string; order: number; weight: number;
  is_required: boolean; status: string; completed_at: string | null;
  notes: string; observations: string; created_at: string; updated_at: string;
};

type SettingsRow = {
  id: string;
  responsibles: unknown;
  categories: unknown;
  periodicities: unknown;
  created_at: string; updated_at: string;
};

// ─── Mapping Helpers (DB ⇄ TypeScript) ───────────────────────

export function mapCompanyFromRow(row: CompanyRow): Company {
  return {
    id: row.id, name: row.name, cnpj: row.cnpj,
    city: row.city, state: row.state,
    contactName: row.contact_name, phone: row.phone, email: row.email,
    status: row.status as Company['status'],
    notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapCompanyToRow(data: Partial<Company>): Partial<CompanyRow> {
  const row: Partial<CompanyRow> = {};
  if (data.name !== undefined) row.name = data.name;
  if (data.cnpj !== undefined) row.cnpj = data.cnpj;
  if (data.city !== undefined) row.city = data.city;
  if (data.state !== undefined) row.state = data.state;
  if (data.contactName !== undefined) row.contact_name = data.contactName;
  if (data.phone !== undefined) row.phone = data.phone;
  if (data.email !== undefined) row.email = data.email;
  if (data.status !== undefined) row.status = data.status;
  if (data.notes !== undefined) row.notes = data.notes;
  if (data.updatedAt !== undefined) row.updated_at = data.updatedAt;
  return row;
}

export function mapDocumentTypeFromRow(row: DocumentTypeRow): DocumentType {
  return {
    id: row.id, name: row.name, acronym: row.acronym,
    category: row.category, description: row.description,
    periodicity: row.periodicity, defaultResponsible: row.default_responsible,
    status: row.status as DocumentType['status'],
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapDocumentTypeToRow(data: Partial<DocumentType>): Partial<DocumentTypeRow> {
  const row: Partial<DocumentTypeRow> = {};
  if (data.name !== undefined) row.name = data.name;
  if (data.acronym !== undefined) row.acronym = data.acronym;
  if (data.category !== undefined) row.category = data.category;
  if (data.description !== undefined) row.description = data.description;
  if (data.periodicity !== undefined) row.periodicity = data.periodicity;
  if (data.defaultResponsible !== undefined) row.default_responsible = data.defaultResponsible;
  if (data.status !== undefined) row.status = data.status;
  if (data.updatedAt !== undefined) row.updated_at = data.updatedAt;
  return row;
}

export function mapChecklistTemplateFromRow(row: ChecklistTemplateRow): ChecklistTemplate {
  return {
    id: row.id, documentTypeId: row.document_type_id,
    stage: row.stage, description: row.description, order: row.order,
    weight: row.weight, isRequired: row.is_required,
    status: row.status as ChecklistTemplate['status'],
    observations: row.observations,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapChecklistTemplateToRow(data: Partial<ChecklistTemplate>): Partial<ChecklistTemplateRow> {
  const row: Partial<ChecklistTemplateRow> = {};
  if (data.documentTypeId !== undefined) row.document_type_id = data.documentTypeId;
  if (data.stage !== undefined) row.stage = data.stage;
  if (data.description !== undefined) row.description = data.description;
  if (data.order !== undefined) row.order = data.order;
  if (data.weight !== undefined) row.weight = data.weight;
  if (data.isRequired !== undefined) row.is_required = data.isRequired;
  if (data.status !== undefined) row.status = data.status;
  if (data.observations !== undefined) row.observations = data.observations;
  if (data.updatedAt !== undefined) row.updated_at = data.updatedAt;
  return row;
}

export function mapProductionFromRow(row: ProductionRow): ProductionDocument {
  return {
    id: row.id, companyId: row.company_id, documentTypeId: row.document_type_id,
    responsible: row.responsible, startDate: row.start_date, dueDate: row.due_date,
    completionDate: row.completion_date, status: row.status as ProductionDocument['status'],
    priority: row.priority as ProductionDocument['priority'],
    progress: row.progress, notes: row.notes, createdBy: row.created_by,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapProductionToRow(data: Partial<ProductionDocument>): Partial<ProductionRow> {
  const row: Partial<ProductionRow> = {};
  if (data.companyId !== undefined) row.company_id = data.companyId;
  if (data.documentTypeId !== undefined) row.document_type_id = data.documentTypeId;
  if (data.responsible !== undefined) row.responsible = data.responsible;
  if (data.startDate !== undefined) row.start_date = data.startDate;
  if (data.dueDate !== undefined) row.due_date = data.dueDate;
  if (data.completionDate !== undefined) row.completion_date = data.completionDate;
  if (data.status !== undefined) row.status = data.status;
  if (data.priority !== undefined) row.priority = data.priority;
  if (data.progress !== undefined) row.progress = data.progress;
  if (data.notes !== undefined) row.notes = data.notes;
  if (data.createdBy !== undefined) row.created_by = data.createdBy;
  if (data.updatedAt !== undefined) row.updated_at = data.updatedAt;
  return row;
}

export function mapProductionItemFromRow(row: ProductionItemRow): ProductionChecklistItem {
  return {
    id: row.id, productionDocumentId: row.production_document_id,
    templateItemId: row.template_item_id, stage: row.stage,
    description: row.description, order: row.order, weight: row.weight,
    isRequired: row.is_required, status: row.status as ProductionChecklistItem['status'],
    completedAt: row.completed_at, notes: row.notes, observations: row.observations,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapProductionItemToRow(data: Partial<ProductionChecklistItem>): Partial<ProductionItemRow> {
  const row: Partial<ProductionItemRow> = {};
  if (data.productionDocumentId !== undefined) row.production_document_id = data.productionDocumentId;
  if (data.templateItemId !== undefined) row.template_item_id = data.templateItemId;
  if (data.stage !== undefined) row.stage = data.stage;
  if (data.description !== undefined) row.description = data.description;
  if (data.order !== undefined) row.order = data.order;
  if (data.weight !== undefined) row.weight = data.weight;
  if (data.isRequired !== undefined) row.is_required = data.isRequired;
  if (data.status !== undefined) row.status = data.status;
  if (data.completedAt !== undefined) row.completed_at = data.completedAt;
  if (data.notes !== undefined) row.notes = data.notes;
  if (data.observations !== undefined) row.observations = data.observations;
  if (data.updatedAt !== undefined) row.updated_at = data.updatedAt;
  return row;
}

export function mapSettingsFromRow(row: SettingsRow): AppSettings {
  return {
    responsibles: (row.responsibles ?? []) as AppSettings['responsibles'],
    categories: (row.categories ?? []) as AppSettings['categories'],
    periodicities: (row.periodicities ?? []) as AppSettings['periodicities'],
  };
}

// ─── Helper to create ISO timestamps ─────────────────────────
export const now = () => new Date().toISOString();

// ─── Company Sync ─────────────────────────────────────────────
export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabase.from('companies').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map(mapCompanyFromRow);
}

export async function addCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>, id: string): Promise<Company> {
  const ts = now();
  const company: Company = { id, ...data, createdAt: ts, updatedAt: ts };
  const { error } = await supabase.from('companies').insert({
    id, name: data.name, cnpj: data.cnpj, city: data.city, state: data.state,
    contact_name: data.contactName, phone: data.phone, email: data.email,
    status: data.status, notes: data.notes, created_at: ts, updated_at: ts,
  });
  if (error) throw error;
  return company;
}

export async function updateCompany(id: string, data: Partial<Company>): Promise<void> {
  const ts = now();
  const row = mapCompanyToRow({ ...data, updatedAt: ts });
  const { error } = await supabase.from('companies').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabase.from('companies').delete().eq('id', id);
  if (error) throw error;
}

// ─── Document Type Sync ───────────────────────────────────────
export async function fetchDocumentTypes(): Promise<DocumentType[]> {
  const { data, error } = await supabase.from('document_types').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map(mapDocumentTypeFromRow);
}

export async function addDocumentType(
  data: Omit<DocumentType, 'id' | 'createdAt' | 'updatedAt'>, id: string
): Promise<DocumentType> {
  const ts = now();
  const doc: DocumentType = { id, ...data, createdAt: ts, updatedAt: ts };
  const { error } = await supabase.from('document_types').insert({
    id, name: data.name, acronym: data.acronym, category: data.category,
    description: data.description, periodicity: data.periodicity,
    default_responsible: data.defaultResponsible, status: data.status,
    created_at: ts, updated_at: ts,
  });
  if (error) throw error;
  return doc;
}

export async function updateDocumentType(id: string, data: Partial<DocumentType>): Promise<void> {
  const ts = now();
  const row = mapDocumentTypeToRow({ ...data, updatedAt: ts });
  const { error } = await supabase.from('document_types').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteDocumentType(id: string): Promise<void> {
  const { error } = await supabase.from('document_types').delete().eq('id', id);
  if (error) throw error;
}

// ─── Checklist Template Sync ──────────────────────────────────
export async function fetchChecklistTemplates(): Promise<ChecklistTemplate[]> {
  const { data, error } = await supabase.from('checklist_templates').select('*').order('order');
  if (error) throw error;
  return (data ?? []).map(mapChecklistTemplateFromRow);
}

export async function addChecklistTemplate(
  data: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'>, id: string
): Promise<ChecklistTemplate> {
  const ts = now();
  const item: ChecklistTemplate = { id, ...data, createdAt: ts, updatedAt: ts };
  const { error } = await supabase.from('checklist_templates').insert({
    id, document_type_id: data.documentTypeId, stage: data.stage,
    description: data.description, order: data.order, weight: data.weight,
    is_required: data.isRequired, status: data.status, observations: data.observations,
    created_at: ts, updated_at: ts,
  });
  if (error) throw error;
  return item;
}

export async function updateChecklistTemplate(id: string, data: Partial<ChecklistTemplate>): Promise<void> {
  const ts = now();
  const row = mapChecklistTemplateToRow({ ...data, updatedAt: ts });
  const { error } = await supabase.from('checklist_templates').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteChecklistTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('checklist_templates').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderChecklistTemplates(items: { id: string; order: number; updatedAt: string }[]): Promise<void> {
  for (const item of items) {
    const { error } = await supabase.from('checklist_templates').update({
      order: item.order, updated_at: item.updatedAt,
    }).eq('id', item.id);
    if (error) throw error;
  }
}

// ─── Production Sync ──────────────────────────────────────────
export async function fetchProductions(): Promise<ProductionDocument[]> {
  const { data, error } = await supabase.from('productions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProductionFromRow);
}

export async function addProduction(
  data: Omit<ProductionDocument, 'id' | 'progress' | 'createdAt' | 'updatedAt'>, id: string
): Promise<ProductionDocument> {
  const ts = now();
  const prod: ProductionDocument = { id, ...data, progress: 0, createdAt: ts, updatedAt: ts };
  const { error } = await supabase.from('productions').insert({
    id, company_id: data.companyId, document_type_id: data.documentTypeId,
    responsible: data.responsible, start_date: data.startDate, due_date: data.dueDate,
    completion_date: data.completionDate, status: data.status, priority: data.priority,
    progress: 0, notes: data.notes, created_by: data.createdBy,
    created_at: ts, updated_at: ts,
  });
  if (error) throw error;
  return prod;
}

export async function updateProduction(id: string, data: Partial<ProductionDocument>): Promise<void> {
  const ts = now();
  const row = mapProductionToRow({ ...data, updatedAt: ts });
  const { error } = await supabase.from('productions').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteProduction(id: string): Promise<void> {
  const { error } = await supabase.from('productions').delete().eq('id', id);
  if (error) throw error;
}

// ─── Production Item Sync ─────────────────────────────────────
export async function fetchProductionItems(): Promise<ProductionChecklistItem[]> {
  const { data, error } = await supabase.from('production_items').select('*').order('order');
  if (error) throw error;
  return (data ?? []).map(mapProductionItemFromRow);
}

export async function addProductionItems(items: {
  id: string; productionDocumentId: string; templateItemId: string;
  stage: string; description: string; order: number; weight: number;
  isRequired: boolean; status: string; completedAt: string | null;
  notes: string; observations: string; createdAt: string; updatedAt: string;
}[]): Promise<void> {
  const rows = items.map(i => ({
    id: i.id, production_document_id: i.productionDocumentId,
    template_item_id: i.templateItemId, stage: i.stage, description: i.description,
    order: i.order, weight: i.weight, is_required: i.isRequired,
    status: i.status, completed_at: i.completedAt, notes: i.notes,
    observations: i.observations, created_at: i.createdAt, updated_at: i.updatedAt,
  }));
  const { error } = await supabase.from('production_items').insert(rows);
  if (error) throw error;
}

export async function updateProductionItem(id: string, data: Partial<ProductionChecklistItem>): Promise<void> {
  const ts = now();
  const row = mapProductionItemToRow({ ...data, updatedAt: ts });
  const { error } = await supabase.from('production_items').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteProductionItemsByProduction(productionId: string): Promise<void> {
  const { error } = await supabase.from('production_items').delete().eq('production_document_id', productionId);
  if (error) throw error;
}

// ─── Settings Sync ────────────────────────────────────────────
export async function fetchSettings(): Promise<AppSettings> {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 'default').single();
  if (error) {
    if (error.code === 'PGRST116') return { responsibles: [], categories: [], periodicities: [] };
    throw error;
  }
  if (!data) return { responsibles: [], categories: [], periodicities: [] };
  return mapSettingsFromRow(data as SettingsRow);
}

export async function updateSettings(settings: AppSettings): Promise<void> {
  const ts = now();
  const { error } = await supabase.from('settings').update({
    responsibles: settings.responsibles,
    categories: settings.categories,
    periodicities: settings.periodicities,
    updated_at: ts,
  }).eq('id', 'default');
  if (error) throw error;
}

// ─── Real-time Subscriptions ──────────────────────────────────

export type RealtimePayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

export type TableName =
  | 'companies' | 'document_types' | 'checklist_templates'
  | 'productions' | 'production_items' | 'settings';

export function subscribeToTable(
  table: TableName,
  onPayload: (payload: RealtimePayload) => void,
) {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload: RealtimePayload) => onPayload(payload),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Seed Initial Data ────────────────────────────────────────
export async function seedIfEmpty(): Promise<boolean> {
  const { count, error: countError } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true });
  if (countError) throw countError;
  if (count && count > 0) return false;

  const {
    SEED_COMPANIES, SEED_DOCUMENT_TYPES, SEED_CHECKLIST_TEMPLATES,
    SEED_PRODUCTIONS, SEED_SETTINGS, generateSeedChecklistItems,
  } = await import('./seed');

  if (SEED_COMPANIES.length > 0) {
    const companyRows = SEED_COMPANIES.map(c => ({
      id: c.id, name: c.name, cnpj: c.cnpj, city: c.city, state: c.state,
      contact_name: c.contactName, phone: c.phone, email: c.email,
      status: c.status, notes: c.notes, created_at: c.createdAt, updated_at: c.updatedAt,
    }));
    const { error: ce } = await supabase.from('companies').insert(companyRows);
    if (ce) throw new Error(`Seed companies: ${ce.message}`);
  }

  if (SEED_DOCUMENT_TYPES.length > 0) {
    const docRows = SEED_DOCUMENT_TYPES.map(d => ({
      id: d.id, name: d.name, acronym: d.acronym, category: d.category,
      description: d.description, periodicity: d.periodicity,
      default_responsible: d.defaultResponsible, status: d.status,
      created_at: d.createdAt, updated_at: d.updatedAt,
    }));
    const { error: de } = await supabase.from('document_types').insert(docRows);
    if (de) throw new Error(`Seed document_types: ${de.message}`);
  }

  if (SEED_CHECKLIST_TEMPLATES.length > 0) {
    const tmplRows = SEED_CHECKLIST_TEMPLATES.map(t => ({
      id: t.id, document_type_id: t.documentTypeId, stage: t.stage,
      description: t.description, order: t.order, weight: t.weight,
      is_required: t.isRequired, status: t.status, observations: t.observations,
      created_at: t.createdAt, updated_at: t.updatedAt,
    }));
    const { error: te } = await supabase.from('checklist_templates').insert(tmplRows);
    if (te) throw new Error(`Seed checklist_templates: ${te.message}`);
  }

  if (SEED_PRODUCTIONS.length > 0) {
    const prodRows = SEED_PRODUCTIONS.map(p => ({
      id: p.id, company_id: p.companyId, document_type_id: p.documentTypeId,
      responsible: p.responsible, start_date: p.startDate, due_date: p.dueDate,
      completion_date: p.completionDate, status: p.status, priority: p.priority,
      progress: p.progress, notes: p.notes, created_by: p.createdBy,
      created_at: p.createdAt, updated_at: p.updatedAt,
    }));
    const { error: pe } = await supabase.from('productions').insert(prodRows);
    if (pe) throw new Error(`Seed productions: ${pe.message}`);
  }

  const seedItems = generateSeedChecklistItems();
  if (seedItems.length > 0) {
    const itemRows = seedItems.map(i => ({
      id: i.id, production_document_id: i.productionDocumentId,
      template_item_id: i.templateItemId, stage: i.stage, description: i.description,
      order: i.order, weight: i.weight, is_required: i.isRequired,
      status: i.status, completed_at: i.completedAt, notes: i.notes,
      observations: i.observations, created_at: i.createdAt, updated_at: i.updatedAt,
    }));
    const { error: ie } = await supabase.from('production_items').insert(itemRows);
    if (ie) throw new Error(`Seed production_items: ${ie.message}`);
  }

  const { error: se } = await supabase.from('settings').upsert({
    id: 'default',
    responsibles: SEED_SETTINGS.responsibles,
    categories: SEED_SETTINGS.categories,
    periodicities: SEED_SETTINGS.periodicities,
    created_at: now(),
    updated_at: now(),
  });
  if (se) throw new Error(`Seed settings: ${se.message}`);

  return true;
}
