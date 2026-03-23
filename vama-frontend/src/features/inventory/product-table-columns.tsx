'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { Product } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatINR } from '@/lib/format'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { SortableHeader } from '@/components/ui/sortable-header'

const stockBadge: Record<Product['stockStatus'], { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  IN_STOCK: { label: 'In Stock', variant: 'success' },
  LOW_STOCK: { label: 'Low Stock', variant: 'warning' },
  OUT_OF_STOCK: { label: 'Out of Stock', variant: 'danger' },
}

interface ActionsProps {
  product: Product
  onView: (p: Product) => void
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
}

function RowActions({ product, onView, onEdit, onDelete }: ActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(product)}>
          <Eye className="h-4 w-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(product)}>
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(product)}
          className="text-[var(--color-danger)] focus:text-[var(--color-danger)]"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface MakeColumnsOptions {
  onView: (p: Product) => void
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
  sortKey: string
  sortDir: 'asc' | 'desc'
  onSort: (key: string) => void
}

export function makeProductColumns({
  onView, onEdit, onDelete, sortKey, sortDir, onSort,
}: MakeColumnsOptions): ColumnDef<Product, unknown>[] {
  return [
    {
      accessorKey: 'sku',
      header: 'SKU',
      size: 100,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[var(--color-muted-fg)]">{row.original.sku}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: () => <SortableHeader label="Product Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={onSort} />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-[var(--color-muted)]">
            {row.original.productType} · {row.original.fabricType} · {row.original.color}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'sellingPrice',
      header: () => <SortableHeader label="Selling Price" sortKey="sellingPrice" currentKey={sortKey} currentDir={sortDir} onSort={onSort} />,
      size: 120,
      cell: ({ row }) => (
        <span className="font-medium">{formatINR(row.original.sellingPrice)}</span>
      ),
    },
    {
      accessorKey: 'costPrice',
      header: () => <SortableHeader label="Cost Price" sortKey="costPrice" currentKey={sortKey} currentDir={sortDir} onSort={onSort} />,
      size: 120,
      cell: ({ row }) => (
        <span className="text-[var(--color-muted)]">{formatINR(row.original.costPrice)}</span>
      ),
    },
    {
      accessorKey: 'quantityInStock',
      header: () => <SortableHeader label="Qty" sortKey="quantityInStock" currentKey={sortKey} currentDir={sortDir} onSort={onSort} />,
      size: 80,
      cell: ({ row }) => (
        <span className={row.original.stockStatus === 'OUT_OF_STOCK' ? 'text-[var(--color-danger)]' : ''}>
          {row.original.quantityInStock}
        </span>
      ),
    },
    {
      accessorKey: 'stockStatus',
      header: () => <SortableHeader label="Status" sortKey="stockStatus" currentKey={sortKey} currentDir={sortDir} onSort={onSort} />,
      size: 120,
      cell: ({ row }) => {
        const s = stockBadge[row.original.stockStatus]
        return <Badge variant={s.variant}>{s.label}</Badge>
      },
    },
    {
      accessorKey: 'gstSlab',
      header: () => <SortableHeader label="GST" sortKey="gstSlab" currentKey={sortKey} currentDir={sortDir} onSort={onSort} />,
      size: 70,
      cell: ({ row }) => (
        <span className="text-[var(--color-muted-fg)]">{row.original.gstSlab}%</span>
      ),
    },
    {
      id: 'actions',
      size: 50,
      cell: ({ row }) => (
        <RowActions product={row.original} onView={onView} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ]
}
