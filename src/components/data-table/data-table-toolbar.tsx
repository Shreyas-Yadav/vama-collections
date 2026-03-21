'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'

interface DataTableToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  filters?: React.ReactNode
  actions?: React.ReactNode
}

export function DataTableToolbar({
  search,
  onSearchChange,
  placeholder = 'Search...',
  filters,
  actions,
}: DataTableToolbarProps) {
  const [localValue, setLocalValue] = useState(search)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    setLocalValue(search)
  }, [search])

  const handleChange = (value: string) => {
    setLocalValue(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearchChange(value), 300)
  }

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)] pointer-events-none" />
        <Input
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="pl-8 pr-8"
        />
        {localValue && (
          <button
            onClick={() => handleChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {filters}

      <div className="ml-auto flex items-center gap-2">
        {actions}
      </div>
    </div>
  )
}
