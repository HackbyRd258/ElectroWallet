import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: Notification['type'], message: string) => {
    const id = Math.random().toString(36);
    setNotifications(prev => [...prev, { id, type, message, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  return { notifications, addNotification };
}

export function NotificationContainer({ notifications }: { notifications: Notification[] }) {
  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠'
  };

  const colors = {
    success: 'bg-green-500/20 border-green-500 text-green-400',
    error: 'bg-red-500/20 border-red-500 text-red-400',
    info: 'bg-blue-500/20 border-blue-500 text-blue-400',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`${colors[notif.type]} border-l-4 p-4 rounded-lg backdrop-blur-xl animate-slide-in`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{icons[notif.type]}</span>
            <p className="flex-1 text-sm">{notif.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
