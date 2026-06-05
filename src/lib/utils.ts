import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ProductionStatus, Priority, ChecklistItemStatus } from '../types';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDate = (iso: string) => {
  try { return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR }); }
  catch { return '—'; }
};

export const formatDateTime = (iso: string) => {
  try { return format(parseISO(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }); }
  catch { return '—'; }
};

export const timeAgo = (iso: string) => {
  try { return formatDistanceToNow(parseISO(iso), { locale: ptBR, addSuffix: true }); }
  catch { return '—'; }
};

export const formatCNPJ = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 14);
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

// ─── Status Labels & Colors ───────────────────────────────────
export const STATUS_CONFIG: Record<ProductionStatus, { label: string; color: string; dot: string }> = {
  not_started:    { label: 'Não iniciado',           color: 'badge-gray',    dot: 'bg-gray-400' },
  in_progress:    { label: 'Em andamento',           color: 'badge-blue',    dot: 'bg-blue-500' },
  pending_info:   { label: 'Pendente de informação', color: 'badge-orange',  dot: 'bg-orange-500' },
  waiting_client: { label: 'Aguardando cliente',     color: 'badge-yellow',  dot: 'bg-yellow-500' },
  in_review:      { label: 'Em revisão',             color: 'badge-purple',  dot: 'bg-purple-500' },
  completed:      { label: 'Concluído',              color: 'badge-green',   dot: 'bg-emerald-500' },
  cancelled:      { label: 'Cancelado',              color: 'badge-red',     dot: 'bg-red-500' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low:      { label: 'Baixa',    color: 'badge-gray' },
  medium:   { label: 'Média',    color: 'badge-blue' },
  high:     { label: 'Alta',     color: 'badge-orange' },
  critical: { label: 'Crítica',  color: 'badge-red' },
};

export const CHECKLIST_STATUS_CONFIG: Record<ChecklistItemStatus, { label: string; color: string; icon: string }> = {
  pending:        { label: 'Pendente',       color: 'text-gray-500',   icon: '○' },
  ok:             { label: 'OK',             color: 'text-emerald-600', icon: '●' },
  not_applicable: { label: 'Não aplicável',  color: 'text-gray-400',   icon: '—' },
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
