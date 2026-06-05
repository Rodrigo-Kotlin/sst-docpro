-- ============================================================
-- SST DocPro — Supabase Schema
-- Execute this SQL in the Supabase SQL Editor
-- ============================================================

-- Enable realtime for all tables
-- (do this via Supabase UI: Database > Replication > enable for all tables)

-- ─── Companies ────────────────────────────────────────────────
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  contact_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Document Types ───────────────────────────────────────────
CREATE TABLE document_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  acronym TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  periodicity TEXT NOT NULL DEFAULT '',
  default_responsible TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Checklist Templates ──────────────────────────────────────
CREATE TABLE checklist_templates (
  id TEXT PRIMARY KEY,
  document_type_id TEXT NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  weight INTEGER NOT NULL DEFAULT 1,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'active',
  observations TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Productions ──────────────────────────────────────────────
CREATE TABLE productions (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  document_type_id TEXT NOT NULL,
  responsible TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL DEFAULT '',
  due_date TEXT NOT NULL DEFAULT '',
  completion_date TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  priority TEXT NOT NULL DEFAULT 'medium',
  progress REAL NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Production Checklist Items ───────────────────────────────
CREATE TABLE production_items (
  id TEXT PRIMARY KEY,
  production_document_id TEXT NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  template_item_id TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  weight INTEGER NOT NULL DEFAULT 1,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TEXT DEFAULT NULL,
  notes TEXT NOT NULL DEFAULT '',
  observations TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Settings (single-row table) ──────────────────────────────
CREATE TABLE settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  responsibles JSONB NOT NULL DEFAULT '[]'::jsonb,
  categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  periodicities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings row
INSERT INTO settings (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- ─── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_checklist_templates_doc_type ON checklist_templates(document_type_id);
CREATE INDEX IF NOT EXISTS idx_checklist_templates_status ON checklist_templates(status);
CREATE INDEX IF NOT EXISTS idx_productions_company ON productions(company_id);
CREATE INDEX IF NOT EXISTS idx_productions_status ON productions(status);
CREATE INDEX IF NOT EXISTS idx_production_items_production ON production_items(production_document_id);
CREATE INDEX IF NOT EXISTS idx_production_items_status ON production_items(status);

-- ─── Enable Realtime ─────────────────────────────────────────
-- Run these commands in the Supabase SQL Editor to enable realtime:
-- ALTER PUBLICATION supabase_realtime ADD TABLE companies;
-- ALTER PUBLICATION supabase_realtime ADD TABLE document_types;
-- ALTER PUBLICATION supabase_realtime ADD TABLE checklist_templates;
-- ALTER PUBLICATION supabase_realtime ADD TABLE productions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE production_items;
-- ALTER PUBLICATION supabase_realtime ADD TABLE settings;
