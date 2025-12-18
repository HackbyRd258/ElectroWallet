import React, { createContext, useContext, useMemo, useState } from 'react';

type NoticeType = 'info' | 'success' | 'warning' | 'error';
type Notice = { id: string; type: NoticeType; message: string; ts: number };

const NoticeCtx = createContext<{ notify: (type: NoticeType, message: string) => void } | null>(null);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [list, setList] = useState<Notice[]>([]);

  const notify = (type: NoticeType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    const ts = Date.now();
    const n: Notice = { id, type, message, ts };
    setList((prev) => [...prev, n]);
    setTimeout(() => setList((prev) => prev.filter((x) => x.id !== id)), 4500);
  };

  const value = useMemo(() => ({ notify }), []);

  return (
    <NoticeCtx.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[200] space-y-2 w-[320px]">
        {list.map((n) => (
          <div key={n.id} className={`glass p-3 rounded-xl border text-xs font-mono flex items-start gap-2 animate-slide-in shadow-accent-glow ${
            n.type === 'success' ? 'border-success/30 text-success bg-success/10' :
            n.type === 'error' ? 'border-danger/30 text-danger bg-danger/10' :
            n.type === 'warning' ? 'border-yellow-400/30 text-yellow-300 bg-yellow-400/10' :
            'border-white/10 text-white/80 bg-white/5'
          }`}>
            <span className="mt-0.5 w-2 h-2 rounded-full bg-white/30"></span>
            <p className="flex-1">{n.message}</p>
          </div>
        ))}
      </div>
    </NoticeCtx.Provider>
  );
};

export function useNotify() {
  const ctx = useContext(NoticeCtx);
  if (!ctx) throw new Error('useNotify must be used within NotificationsProvider');
  return ctx.notify;
}
