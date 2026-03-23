'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { useProducts } from '@/hooks/use-products'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { Badge } from '@/components/ui/badge'
import { formatINR } from '@/lib/format'
import { PAGE_SIZE_DEFAULT } from '@/lib/constants'
import type { Product } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

const stockBadge: Record<Product['stockStatus'], { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  IN_STOCK: { label: 'In Stock', variant: 'success' },
  LOW_STOCK: { label: 'Low Stock', variant: 'warning' },
  OUT_OF_STOCK: { label: 'Out of Stock', variant: 'danger' },
}

export default function StockReportPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT)
  const { data, isLoading } = useProducts({ page, pageSize })
  const { data: lowStock } = useProducts({ page: 1, pageSize: 1, stockStatus: 'LOW_STOCK' })
  const { data: outOfStock } = useProducts({ page: 1, pageSize: 1, stockStatus: 'OUT_OF_STOCK' })

  const products = data?.data ?? []
  const totalStockValue = products.reduce((sum, p) => sum + p.costPrice * p.quantityInStock, 0)

  const columns: ColumnDef<Product, unknown>[] = [
    { accessorKey: 'sku', header: 'SKU', size: 110, cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku}</span> },
    { accessorKey: 'name', header: 'Product', cell: ({ row }) => <div><p className="font-medium">{row.original.name}</p><p className="text-xs text-[var(--color-muted)]">{row.original.productType} · {row.original.fabricType}</p></div> },
    { accessorKey: 'quantityInStock', header: 'Qty', size: 80 },
    { accessorKey: 'costPrice', header: 'Cost Price', size: 120, cell: ({ row }) => formatINR(row.original.costPrice) },
    { accessorKey: 'sellingPrice', header: 'Selling Price', size: 130, cell: ({ row }) => formatINR(row.original.sellingPrice) },
    {
      id: 'stockValue',
      header: 'Stock Value',
      size: 130,
      cell: ({ row }) => <span className="font-medium">{formatINR(row.original.costPrice * row.original.quantityInStock)}</span>,
    },
    {
      accessorKey: 'stockStatus',
      header: 'Status',
      size: 120,
      cell: ({ row }) => {
        const s = stockBadge[row.original.stockStatus]
        return <Badge variant={s.variant}>{s.label}</Badge>
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Stock Report" description="Inventory valuation and stock levels" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[var(--color-muted)]">Total Stock Value</p>
            <p className="text-2xl font-bold text-[var(--color-primary)] mt-1">{formatINR(totalStockValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[var(--color-muted)]">Low Stock Items</p>
            <p className="text-2xl font-bold text-[var(--color-warning)] mt-1">{lowStock?.total ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[var(--color-muted)]">Out of Stock</p>
            <p className="text-2xl font-bold text-[var(--color-danger)] mt-1">{outOfStock?.total ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={products} isLoading={isLoading} />
      {data && (
        <DataTablePagination
          page={page} pageSize={pageSize} total={data.total} totalPages={data.totalPages}
          onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
        />
      )}
    </div>
  )
}
