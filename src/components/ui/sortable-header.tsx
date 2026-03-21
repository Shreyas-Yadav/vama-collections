import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

interface SortableHeaderProps {
  label: string
  sortKey: string
  currentKey: string
  currentDir: 'asc' | 'desc'
  onSort: (key: string) => void
  className?: string
}

export function SortableHeader({ label, sortKey, currentKey, currentDir, onSort, className }: SortableHeaderProps) {
  const isActive = currentKey === sortKey
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 select-none cursor-pointer hover:text-[var(--color-fg)] transition-colors ${isActive ? 'text-[var(--color-fg)]' : 'text-[var(--color-muted-fg)]'} ${className ?? ''}`}
    >
      {label}
      {isActive
        ? currentDir === 'asc'
          ? <ChevronUp className="h-3.5 w-3.5" />
          : <ChevronDown className="h-3.5 w-3.5" />
        : <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
      }
    </button>
  )
}
