import type { ProductionChecklistItem, ProductionDocument } from '../types';

/**
 * Regra simples: OK ÷ aplicáveis × 100
 * Regra ponderada: Σ pesos OK ÷ Σ pesos aplicáveis × 100
 */
export const calculateProgress = (
  items: ProductionChecklistItem[],
  weighted = false
): number => {
  const applicable = items.filter(i => i.status !== 'not_applicable');
  if (applicable.length === 0) return 0;

  if (weighted) {
    const totalWeight = applicable.reduce((sum, i) => sum + i.weight, 0);
    if (totalWeight === 0) return 0;
    const okWeight = applicable
      .filter(i => i.status === 'ok')
      .reduce((sum, i) => sum + i.weight, 0);
    return Math.round((okWeight / totalWeight) * 100);
  }

  const ok = applicable.filter(i => i.status === 'ok').length;
  return Math.round((ok / applicable.length) * 100);
};

export type ProgressStage = {
  label: string;
  color: string;
  bg: string;
  range: string;
};

export const getProgressStage = (progress: number): ProgressStage => {
  if (progress === 100) return { label: 'Concluído', color: 'text-emerald-700', bg: 'bg-emerald-500', range: '100%' };
  if (progress >= 76) return { label: 'Em finalização', color: 'text-green-700', bg: 'bg-green-500', range: '76–99%' };
  if (progress >= 51) return { label: 'Avançado', color: 'text-teal-700', bg: 'bg-teal-500', range: '51–75%' };
  if (progress >= 26) return { label: 'Em desenvolvimento', color: 'text-yellow-700', bg: 'bg-yellow-400', range: '26–50%' };
  return { label: 'Inicial', color: 'text-orange-700', bg: 'bg-orange-400', range: '0–25%' };
};

export const isDelayed = (prod: ProductionDocument): boolean => {
  if (prod.status === 'completed' || prod.status === 'cancelled') return false;
  return new Date() > new Date(prod.dueDate + 'T23:59:59');
};

export const isDueSoon = (prod: ProductionDocument, days = 7): boolean => {
  if (prod.status === 'completed' || prod.status === 'cancelled') return false;
  const due = new Date(prod.dueDate + 'T23:59:59');
  const now = new Date();
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
};
