import toast from 'react-hot-toast';

export function reportSyncError(context: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[Sync] ${context}:`, err);
  toast.error(`Falha ao sincronizar (${context}): ${message}`, {
    duration: 6000,
  });
}
