import { describe, it, expect, beforeEach } from 'vitest';
import { useProductionStore } from './useProductionStore';
import type { ChecklistTemplate } from '../types';

const makeTemplate = (id: string, weight = 1): ChecklistTemplate => ({
  id,
  documentTypeId: 'doc-1',
  stage: 'S1',
  description: `item ${id}`,
  order: 1,
  weight,
  isRequired: true,
  status: 'active',
  observations: '',
  createdAt: '',
  updatedAt: '',
});

const makeProductionData = (over = {}) => ({
  companyId: 'comp-1',
  documentTypeId: 'doc-1',
  responsible: 'Eng. Maria',
  startDate: '2025-01-01',
  dueDate: '2025-12-31',
  completionDate: null as null,
  status: 'not_started' as const,
  priority: 'medium' as const,
  notes: '',
  createdBy: 'tester',
  ...over,
});

describe('useProductionStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useProductionStore.setState({ productions: [], productionItems: [] });
  });

  describe('createProduction', () => {
    it('clones templates into production items as pending', () => {
      const templates = [makeTemplate('t1'), makeTemplate('t2'), makeTemplate('t3')];
      const prod = useProductionStore.getState().createProduction(
        makeProductionData(),
        templates
      );

      const items = useProductionStore.getState().getItemsByProduction(prod.id);
      expect(items).toHaveLength(3);
      expect(items.every(i => i.status === 'pending')).toBe(true);
      expect(items.every(i => i.productionDocumentId === prod.id)).toBe(true);
      expect(prod.progress).toBe(0);
    });

    it('starts with not_started and 0% progress', () => {
      const prod = useProductionStore.getState().createProduction(
        makeProductionData(),
        [makeTemplate('t1')]
      );
      expect(prod.status).toBe('not_started');
      expect(prod.progress).toBe(0);
    });
  });

  describe('updateChecklistItem', () => {
    it('marks a single item as ok and recomputes progress', () => {
      const prod = useProductionStore.getState().createProduction(
        makeProductionData(),
        [makeTemplate('t1'), makeTemplate('t2')]
      );
      const items = useProductionStore.getState().getItemsByProduction(prod.id);
      useProductionStore.getState().updateChecklistItem(items[0].id, 'ok');

      const updated = useProductionStore.getState().getProductionById(prod.id);
      expect(updated?.progress).toBe(50);
    });

    it('transitions to in_progress when first item is completed from not_started', () => {
      const prod = useProductionStore.getState().createProduction(
        makeProductionData(),
        [makeTemplate('t1'), makeTemplate('t2')]
      );
      const items = useProductionStore.getState().getItemsByProduction(prod.id);
      useProductionStore.getState().updateChecklistItem(items[0].id, 'ok');

      const updated = useProductionStore.getState().getProductionById(prod.id);
      expect(updated?.status).toBe('in_progress');
    });

    it('transitions to in_review when reaching 100% (not completed yet)', () => {
      const prod = useProductionStore.getState().createProduction(
        makeProductionData(),
        [makeTemplate('t1'), makeTemplate('t2')]
      );
      const items = useProductionStore.getState().getItemsByProduction(prod.id);
      useProductionStore.getState().updateChecklistItem(items[0].id, 'ok');
      useProductionStore.getState().updateChecklistItem(items[1].id, 'ok');

      const updated = useProductionStore.getState().getProductionById(prod.id);
      expect(updated?.progress).toBe(100);
      expect(updated?.status).toBe('in_review');
    });

    it('resumes from waiting_client to in_progress when items are completed', () => {
      const prod = useProductionStore.getState().createProduction(
        makeProductionData({ status: 'waiting_client' }),
        [makeTemplate('t1'), makeTemplate('t2')]
      );
      const items = useProductionStore.getState().getItemsByProduction(prod.id);
      useProductionStore.getState().updateChecklistItem(items[0].id, 'ok');

      const updated = useProductionStore.getState().getProductionById(prod.id);
      expect(updated?.status).toBe('in_progress');
    });

    it('does NOT change cancelled status even at 100%', () => {
      const prod = useProductionStore.getState().createProduction(
        makeProductionData({ status: 'cancelled' }),
        [makeTemplate('t1')]
      );
      const items = useProductionStore.getState().getItemsByProduction(prod.id);
      useProductionStore.getState().updateChecklistItem(items[0].id, 'ok');

      const updated = useProductionStore.getState().getProductionById(prod.id);
      expect(updated?.status).toBe('cancelled');
    });

    it('saves notes when provided', () => {
      const prod = useProductionStore.getState().createProduction(
        makeProductionData(),
        [makeTemplate('t1')]
      );
      const items = useProductionStore.getState().getItemsByProduction(prod.id);
      useProductionStore.getState().updateChecklistItem(items[0].id, 'ok', 'documento conferido');

      const updated = useProductionStore.getState().getItemsByProduction(prod.id);
      expect(updated[0].notes).toBe('documento conferido');
      expect(updated[0].completedAt).not.toBeNull();
    });
  });

  describe('deleteProduction', () => {
    it('removes production and its items', () => {
      const prod = useProductionStore.getState().createProduction(
        makeProductionData(),
        [makeTemplate('t1'), makeTemplate('t2')]
      );
      expect(useProductionStore.getState().productions).toHaveLength(1);
      expect(useProductionStore.getState().productionItems).toHaveLength(2);

      useProductionStore.getState().deleteProduction(prod.id);

      expect(useProductionStore.getState().productions).toHaveLength(0);
      expect(useProductionStore.getState().productionItems).toHaveLength(0);
    });

    it('leaves other productions untouched', () => {
      const p1 = useProductionStore.getState().createProduction(
        makeProductionData(),
        [makeTemplate('t1')]
      );
      const p2 = useProductionStore.getState().createProduction(
        makeProductionData(),
        [makeTemplate('t2')]
      );

      useProductionStore.getState().deleteProduction(p1.id);

      expect(useProductionStore.getState().productions).toHaveLength(1);
      expect(useProductionStore.getState().productions[0].id).toBe(p2.id);
    });
  });
});
