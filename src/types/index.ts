// ============================================================
// SST DocPro — Type Definitions
// ============================================================

export type CompanyStatus = 'active' | 'inactive';
export type DocumentTypeStatus = 'active' | 'inactive';
export type ChecklistTemplateStatus = 'active' | 'inactive';

export type ProductionStatus =
  | 'not_started'
  | 'in_progress'
  | 'pending_info'
  | 'waiting_client'
  | 'in_review'
  | 'completed'
  | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ChecklistItemStatus = 'pending' | 'ok' | 'not_applicable';

// ─── Company ─────────────────────────────────────────────────
export interface Company {
  id: string;
  name: string;
  cnpj: string;
  city: string;
  state: string;
  contactName: string;
  phone: string;
  email: string;
  status: CompanyStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── DocumentType ─────────────────────────────────────────────
export interface DocumentType {
  id: string;
  name: string;
  acronym: string;
  category: string;
  description: string;
  periodicity: string;
  defaultResponsible: string;
  status: DocumentTypeStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── ChecklistTemplate ────────────────────────────────────────
export interface ChecklistTemplate {
  id: string;
  documentTypeId: string;
  stage: string;
  description: string;
  order: number;
  weight: number;
  isRequired: boolean;
  status: ChecklistTemplateStatus;
  observations: string;
  createdAt: string;
  updatedAt: string;
}

// ─── ProductionDocument ───────────────────────────────────────
export interface ProductionDocument {
  id: string;
  companyId: string;
  documentTypeId: string;
  responsible: string;
  startDate: string;
  dueDate: string;
  completionDate: string | null;
  status: ProductionStatus;
  priority: Priority;
  progress: number;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── ProductionChecklistItem ──────────────────────────────────
export interface ProductionChecklistItem {
  id: string;
  productionDocumentId: string;
  templateItemId: string;
  stage: string;
  description: string;
  order: number;
  weight: number;
  isRequired: boolean;
  status: ChecklistItemStatus;
  completedAt: string | null;
  notes: string;
  observations: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Settings ─────────────────────────────────────────────────
export interface Responsible {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface AppSettings {
  responsibles: Responsible[];
  categories: string[];
  periodicities: string[];
}

// ─── Dashboard Types ──────────────────────────────────────────
export interface DashboardStats {
  totalInProduction: number;
  completed: number;
  delayed: number;
  waitingClient: number;
  avgProgress: number;
  activeCompanies: number;
  inReview: number;
  pendingInfo: number;
}

export interface ProductionWithDetails extends ProductionDocument {
  company: Company;
  documentType: DocumentType;
  checklistItems: ProductionChecklistItem[];
  isDelayed: boolean;
}
