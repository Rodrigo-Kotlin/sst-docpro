import { describe, it, expect } from 'vitest';
import { calculateProgress, isDelayed, isDueSoon, getProgressStage } from './calculations';
import type { ProductionChecklistItem, ProductionDocument, ChecklistItemStatus } from '../types';

const item = (id: string, status: ChecklistItemStatus, weight = 1): ProductionChecklistItem => ({
  id,
  productionDocumentId: 'p1',
  templateItemId: 't1',
  stage: 'S1',
  description: 'd',
  order: 1,
  weight,
  isRequired: true,
  status,
  completedAt: null,
  notes: '',
  observations: '',
  createdAt: '',
  updatedAt: '',
});

describe('calculateProgress (unweighted)', () => {
  it('returns 0 when no items', () => {
    expect(calculateProgress([])).toBe(0);
  });

  it('returns 0 when all items are N/A', () => {
    expect(calculateProgress([item('a', 'not_applicable'), item('b', 'not_applicable')])).toBe(0);
  });

  it('ignores N/A items from the base', () => {
    const items = [item('a', 'ok'), item('b', 'not_applicable'), item('c', 'pending')];
    expect(calculateProgress(items)).toBe(50);
  });

  it('rounds correctly', () => {
    const items = [item('a', 'ok'), item('b', 'pending'), item('c', 'pending')];
    expect(calculateProgress(items)).toBe(33);
  });

  it('returns 100 when all applicable are OK', () => {
    const items = [item('a', 'ok'), item('b', 'ok'), item('c', 'not_applicable')];
    expect(calculateProgress(items)).toBe(100);
  });
});

describe('calculateProgress (weighted)', () => {
  it('returns 0 when all weights are zero', () => {
    expect(calculateProgress([item('a', 'ok', 0), item('b', 'pending', 0)], true)).toBe(0);
  });

  it('weights heavier items more', () => {
    const items = [item('a', 'ok', 3), item('b', 'pending', 1)];
    expect(calculateProgress(items, true)).toBe(75);
  });

  it('excludes N/A from total weight', () => {
    const items = [item('a', 'ok', 2), item('b', 'pending', 2), item('c', 'not_applicable', 10)];
    expect(calculateProgress(items, true)).toBe(50);
  });
});

const prod = (over: Partial<ProductionDocument> = {}): ProductionDocument => ({
  id: 'p1',
  companyId: 'c1',
  documentTypeId: 'd1',
  responsible: 'r',
  startDate: '2025-01-01',
  dueDate: '2025-12-31',
  completionDate: null,
  status: 'in_progress',
  priority: 'medium',
  progress: 0,
  notes: '',
  createdBy: '',
  createdAt: '',
  updatedAt: '',
  ...over,
});

describe('isDelayed', () => {
  const localISODate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  it('returns true when dueDate is in the past and not completed', () => {
    const past = new Date(); past.setDate(past.getDate() - 1);
    expect(isDelayed(prod({ dueDate: localISODate(past) }))).toBe(true);
  });

  it('returns false when dueDate is today and not completed (T23:59:59 grace)', () => {
    const today = localISODate(new Date());
    expect(isDelayed(prod({ dueDate: today }))).toBe(false);
  });

  it('returns false when completed even if past due', () => {
    const past = new Date(); past.setDate(past.getDate() - 5);
    expect(isDelayed(prod({ dueDate: localISODate(past), status: 'completed' }))).toBe(false);
  });

  it('returns false when cancelled', () => {
    const past = new Date(); past.setDate(past.getDate() - 5);
    expect(isDelayed(prod({ dueDate: localISODate(past), status: 'cancelled' }))).toBe(false);
  });
});

describe('isDueSoon', () => {
  const localISODate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  it('returns true when due within window', () => {
    const future = new Date(); future.setDate(future.getDate() + 3);
    expect(isDueSoon(prod({ dueDate: localISODate(future) }))).toBe(true);
  });

  it('returns false when due past window', () => {
    const future = new Date(); future.setDate(future.getDate() + 30);
    expect(isDueSoon(prod({ dueDate: localISODate(future) }))).toBe(false);
  });

  it('returns false when already overdue', () => {
    const past = new Date(); past.setDate(past.getDate() - 1);
    expect(isDueSoon(prod({ dueDate: localISODate(past) }))).toBe(false);
  });
});

describe('getProgressStage', () => {
  it('classifies by range', () => {
    expect(getProgressStage(0).label).toBe('Inicial');
    expect(getProgressStage(25).label).toBe('Inicial');
    expect(getProgressStage(26).label).toBe('Em desenvolvimento');
    expect(getProgressStage(50).label).toBe('Em desenvolvimento');
    expect(getProgressStage(51).label).toBe('Avançado');
    expect(getProgressStage(75).label).toBe('Avançado');
    expect(getProgressStage(76).label).toBe('Em finalização');
    expect(getProgressStage(99).label).toBe('Em finalização');
    expect(getProgressStage(100).label).toBe('Concluído');
  });
});
