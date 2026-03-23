'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Receipt } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { useSales } from '@/hooks/use-sales'
import { formatINR, formatDateTime } from '@/lib/format'
import { BILL_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAGE_SIZE_DEFAULT } from '@/lib/constants'
import { SortableHeader } from '@/components/ui/sortable-header'
import type { Bill } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  DRAFT: 'default',
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  CANCELLED: 'danger',
}

export default function SalesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = (key: string) => {
    if (key === sortKey) { setSortDir((d) => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const { data, isLoading } = useSales({ page, pageSize, search, status: status || undefined, sortKey, sortDir })

  const columns: ColumnDef<Bill, unknown>[] = [
    {
      accessorKey: 'billNumber',
      header: () => <SortableHeader label="Bill #" sortKey="billNumber" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      size: 160,
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.billNumber}</span>
      ),
    },
    {
      accessorKey: 'customerName',
      header: () => <SortableHeader label="Customer" sortKey="customerName" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.customerName}</p>
          {row.original.customerPhone && (
            <p className="text-xs text-[var(--color-muted)]">{row.original.customerPhone}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'lineItems',
      header: 'Items',
      size: 70,
      cell: ({ row }) => row.original.lineItems.length,
    },
    {
      accessorKey: 'grandTotal',
      header: () => <SortableHeader label="Total" sortKey="grandTotal" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      size: 130,
      cell: ({ row }) => (
        <span className="font-semibold">{formatINR(row.original.grandTotal)}</span>
      ),
    },
    {
      accessorKey: 'balanceDue',
      header: () => <SortableHeader label="Balance Due" sortKey="balanceDue" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      size: 120,
      cell: ({ row }) => (
        <span className={row.original.balanceDue > 0 ? 'text-[var(--color-danger)] font-medium' : 'text-[var(--color-muted)]'}>
          {row.original.balanceDue > 0 ? formatINR(row.original.balanceDue) : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment',
      size: 110,
      cell: ({ row }) => PAYMENT_METHOD_LABELS[row.original.paymentMethod] ?? row.original.paymentMethod,
    },
    {
      accessorKey: 'status',
      header: () => <SortableHeader label="Status" sortKey="status" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      size: 120,
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status] ?? 'default'}>
          {BILL_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: () => <SortableHeader label="Date" sortKey="createdAt" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      size: 160,
      cell: ({ row }) => (
        <span className="text-xs text-[var(--color-muted)]">{formatDateTime(row.original.createdAt)}</span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Bills & Invoices"
        description="View and manage all sales bills"
        action={
          <Button onClick={() => router.push('/sales/new')}>
            <Plus className="h-4 w-4" /> New Bill
          </Button>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Search by bill number or customer..."
        filters={
          <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(BILL_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {!isLoading && data?.total === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No bills yet"
          description="Create your first bill to start tracking sales"
          action={
            <Button onClick={() => router.push('/sales/new')}>
              <Plus className="h-4 w-4" /> New Bill
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            onRowClick={(b) => router.push(`/sales/${b.id}`)}
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
