'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (options: ToastOptions | string, type?: ToastType) => string;
  dismissToast: (id: string) => void;
  toast: {
    (messageOrOptions: string | ToastOptions, type?: ToastType): string;
    success: (message: string, title?: string, duration?: number) => string;
    error: (message: string, title?: string, duration?: number) => string;
    warning: (message: string, title?: string, duration?: number) => string;
    info: (message: string, title?: string, duration?: number) => string;
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions | string, defaultType: ToastType = 'info'): string => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      let item: ToastItem;

      if (typeof options === 'string') {
        item = {
          id,
          message: options,
          type: defaultType,
          duration: 4000,
        };
      } else {
        item = {
          id,
          message: options.message,
          title: options.title,
          type: options.type || defaultType,
          duration: options.duration !== undefined ? options.duration : 4000,
        };
      }

      setToasts((prev) => [...prev, item]);

      if (item.duration && item.duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, item.duration);
      }

      return id;
    },
    [dismissToast]
  );

  const toastMethods = useMemo(() => {
    const fn = (messageOrOptions: string | ToastOptions, type?: ToastType) => {
      return showToast(messageOrOptions, type);
    };

    fn.success = (message: string, title?: string, duration?: number) =>
      showToast({ message, title, type: 'success', duration }, 'success');

    fn.error = (message: string, title?: string, duration?: number) =>
      showToast({ message, title, type: 'error', duration }, 'error');

    fn.warning = (message: string, title?: string, duration?: number) =>
      showToast({ message, title, type: 'warning', duration }, 'warning');

    fn.info = (message: string, title?: string, duration?: number) =>
      showToast({ message, title, type: 'info', duration }, 'info');

    fn.dismiss = dismissToast;

    return fn;
  }, [showToast, dismissToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        toast: toastMethods,
      }}
    >
      {children}
      <GlobalToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function GlobalToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[9999] pointer-events-none flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={() => onDismiss(item.id)} />
      ))}
    </div>
  );
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const iconConfig = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/60',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800/60',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/60',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/60',
    },
  }[item.type];

  const Icon = iconConfig.icon;

  return (
    <div
      role="alert"
      className="pointer-events-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-neutral-200/90 dark:border-zinc-800 shadow-xl shadow-neutral-900/5 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-200 transition-all hover:shadow-2xl"
    >
      <div
        className={`size-8 rounded-xl ${iconConfig.bg} ${iconConfig.text} ${iconConfig.border} flex items-center justify-center shrink-0 border`}
      >
        <Icon className="size-4.5 stroke-[2.2]" />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        {item.title && (
          <h4 className="text-xs font-bold text-neutral-900 dark:text-zinc-100 leading-snug">
            {item.title}
          </h4>
        )}
        <p className="text-xs text-neutral-600 dark:text-zinc-300 leading-relaxed break-words font-medium">
          {item.message}
        </p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer"
        aria-label="Tutup"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
