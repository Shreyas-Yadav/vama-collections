'use client'

import * as Toast from '@radix-ui/react-toast'
import { createContext, useContext, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'success' | 'error' | 'warning'

interface ToastMessage {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toast: (opts: Omit<ToastMessage, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback((opts: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, ...opts }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toast.Provider swipeDirection="right" duration={4000}>
        {children}
        {toasts.map((t) => (
          <Toast.Root
            key={t.id}
            onOpenChange={(open) => { if (!open) remove(t.id) }}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-4 shadow-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full',
              'transition-all duration-200',
              t.variant === 'success' && 'border-green-200 bg-green-50 text-green-900',
              t.variant === 'error' && 'border-red-200 bg-red-50 text-red-900',
              t.variant === 'warning' && 'border-amber-200 bg-amber-50 text-amber-900',
              (!t.variant || t.variant === 'default') && 'border-[var(--color-border)] bg-white text-[var(--color-foreground)]',
            )}
          >
            <div className="flex-1 min-w-0">
              <Toast.Title className="text-sm font-semibold">{t.title}</Toast.Title>
              {t.description && (
                <Toast.Description className="text-sm opacity-80 mt-0.5">{t.description}</Toast.Description>
              )}
            </div>
            <Toast.Close className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <X className="h-4 w-4" />
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[380px] max-w-[calc(100vw-2rem)]" />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}
