import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useScannerStore } from '../store';

const icons = {
  info: <Info className="text-blue-400" size={20} />,
  success: <CheckCircle className="text-neon-green" size={20} />,
  warning: <AlertTriangle className="text-yellow-400" size={20} />,
  error: <AlertCircle className="text-red-400" size={20} />,
};

const borderColors = {
  info: 'border-blue-500/20',
  success: 'border-neon-green/20',
  warning: 'border-yellow-500/20',
  error: 'border-red-500/20',
};

export const NotificationToast = () => {
  const { notifications, removeNotification } = useScannerStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`pointer-events-auto flex items-center gap-4 p-4 bg-[#0a0f16] border ${borderColors[notification.type]} rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] min-w-[320px] max-w-md backdrop-blur-md`}
          >
            <div className="flex-shrink-0">
              {icons[notification.type]}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 font-mono">
                System Alert
              </p>
              <p className="text-sm font-medium text-slate-100">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-slate-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
