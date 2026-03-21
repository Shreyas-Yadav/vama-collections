'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Search, Package, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProductSearch } from '@/hooks/use-products'
import { formatINR } from '@/lib/format'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: results, isFetching } = useProductSearch(query)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleSelect = (id: string) => {
    onOpenChange(false)
    router.push(`/inventory/${id}`)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-[15%] z-50 -translate-x-1/2',
            'w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--color-border)]',
            'bg-white shadow-xl overflow-hidden',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'duration-200',
          )}
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">Search products</DialogPrimitive.Title>

          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
            <Search className="h-4 w-4 text-[var(--color-muted)] shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by name, SKU, or color..."
              className="flex-1 text-sm bg-transparent outline-none text-[var(--color-foreground)] placeholder:text-[var(--color-muted)]"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd className="hidden sm:block text-[10px] bg-[var(--color-surface-raised)] px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-muted)]">Esc</kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {query.length < 2 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
                Type at least 2 characters to search
              </p>
            ) : isFetching ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">Searching...</p>
            ) : results && results.length > 0 ? (
              <ul className="py-2">
                {results.map((product) => (
                  <li key={product.id}>
                    <button
                      onClick={() => handleSelect(product.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--color-surface-raised)] transition-colors"
                    >
                      <div className="h-8 w-8 rounded-[var(--radius)] bg-[var(--color-surface-raised)] flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-[var(--color-muted)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-foreground)] truncate">{product.name}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                          {product.sku} · {product.productType} · {product.fabricType}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-[var(--color-primary)] shrink-0">
                        {formatINR(product.sellingPrice)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
                No products found for &ldquo;{query}&rdquo;
              </p>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
