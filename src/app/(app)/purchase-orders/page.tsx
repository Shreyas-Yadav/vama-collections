'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { usePurchaseOrders } from '@/hooks/use-purchase-orders'
import { formatINR, formatDate } from '@/lib/format'
import { PO_STATUS_LABELS, PAGE_SIZE_DEFAULT } from '@/lib/constants'
import type { PurchaseOrder } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  DRAFT: 'default',
  SENT: 'info',
  PARTIALLY_RECEIVED: 'warning',
  RECEIVED: 'success',
  CANCELLED: 'danger',
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading } = usePurchaseOrders({ page, pageSize, search, status: status || undefined })

  const columns: ColumnDef<PurchaseOrder, unknown>[] = [
    {
      accessorKey: 'poNumber',
      header: 'PO Number',
      size: 150,
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.poNumber}</span>
      ),
    },
    {
      accessorKey: 'vendorName',
      header: 'Vendor',
      cell: ({ row }) => row.original.vendorName,
    },
    {
      accessorKey: 'orderDate',
      header: 'Order Date',
      size: 120,
      cell: ({ row }) => formatDate(row.original.orderDate + 'T00:00:00Z'),
    },
    {
      accessorKey: 'expectedDeliveryDate',
      header: 'Expected By',
      size: 130,
      cell: ({ row }) =>
        row.original.expectedDeliveryDate
          ? formatDate(row.original.expectedDeliveryDate + 'T00:00:00Z')
          : '—',
    },
    {
      accessorKey: 'lineItems',
      header: 'Items',
      size: 70,
      cell: ({ row }) => row.original.lineItems.length,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      size: 130,
      cell: ({ row }) => (
        <span className="font-medium">{formatINR(row.original.totalAmount)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 150,
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status] ?? 'default'}>
          {PO_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="Track orders placed with your vendors"
        action={
          <Button onClick={() => router.push('/purchase-orders/new')}>
            <Plus className="h-4 w-4" /> New PO
          </Button>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Search by PO number or vendor..."
        filters={
          <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(PO_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {!isLoading && data?.total === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No purchase orders"
          description="Create your first purchase order to track stock procurement"
          action={
            <Button onClick={() => router.push('/purchase-orders/new')}>
              <Plus className="h-4 w-4" /> New PO
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            onRowClick={(po) => router.push(`/purchase-orders/${po.id}`)}
          />
          {data && (
            <DataTablePagination
              page={page} pageSize={pageSize} total={data.total} totalPages={data.totalPages}
              onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
            />
          )}
        </>
      )}
    </div>
  )
}
