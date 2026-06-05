import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered() {},
    onRegisterError() {},
  });

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (offlineReady) {
      toast.success('App pronto para uso offline', { duration: 3000 });
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady]);

  if (!needRefresh || dismissed) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] bg-slate-900 text-white shadow-2xl rounded-2xl p-4 flex items-start gap-3"
    >
      <div className="flex-1">
        <p className="font-semibold text-sm">Nova versão disponível</p>
        <p className="text-xs text-slate-300 mt-0.5">
          Atualize para carregar as últimas correções e melhorias.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => { setDismissed(true); }}
          className="text-xs text-slate-300 hover:text-white px-2 py-1"
        >
          Depois
        </button>
        <button
          onClick={() => updateServiceWorker(true)}
          className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg"
        >
          Atualizar
        </button>
      </div>
    </div>
  );
}
