-- ============================================================
-- SST DocPro — Supabase RLS Policies (Permissive for anon)
-- Execute this SQL in the Supabase SQL Editor
-- ============================================================
-- The app uses the anon key for all operations (no auth).
-- Run AFTER supabase/schema.sql.

-- ─── Companies ────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_all_companies" ON companies;
CREATE POLICY "anon_all_companies"
  ON companies
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ─── Document Types ───────────────────────────────────────────
DROP POLICY IF EXISTS "anon_all_document_types" ON document_types;
CREATE POLICY "anon_all_document_types"
  ON document_types
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ─── Checklist Templates ──────────────────────────────────────
DROP POLICY IF EXISTS "anon_all_checklist_templates" ON checklist_templates;
CREATE POLICY "anon_all_checklist_templates"
  ON checklist_templates
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ─── Productions ──────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_all_productions" ON productions;
CREATE POLICY "anon_all_productions"
  ON productions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ─── Production Items ─────────────────────────────────────────
DROP POLICY IF EXISTS "anon_all_production_items" ON production_items;
CREATE POLICY "anon_all_production_items"
  ON production_items
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ─── Settings ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_all_settings" ON settings;
CREATE POLICY "anon_all_settings"
  ON settings
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Verificação: rode isto para confirmar que RLS está ativo
-- mas as policies estão aplicadas:
--
--   SELECT schemaname, tablename, rowsecurity
--   FROM pg_tables
--   WHERE schemaname = 'public';
--
--   SELECT tablename, policyname, cmd, roles
--   FROM pg_policies
--   WHERE schemaname = 'public';
-- ============================================================
