'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { SortableHeader } from '@/components/ui/sortable-header'
import { useCustomers } from '@/hooks/use-customers'
import { formatINR, formatDate } from '@/lib/format'
import { PAGE_SIZE_DEFAULT } from '@/lib/constants'
import type { Customer } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

export default function CustomersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (key === sortKey) { setSortDir((d) => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const { data, isLoading } = useCustomers({ page, pageSize, search, sortKey, sortDir })

  const columns: ColumnDef<Customer, unknown>[] = [
    {
      accessorKey: 'name',
      header: () => <SortableHeader label="Customer" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-[var(--color-muted)]">{row.original.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: 'city',
      header: 'Location',
      cell: ({ row }) =>
        row.original.city ? `${row.original.city}, ${row.original.state}` : '—',
    },
    {
      accessorKey: 'totalOrders',
      header: () => <SortableHeader label="Orders" sortKey="totalOrders" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      size: 80,
    },
    {
      accessorKey: 'totalPurchaseValue',
      header: () => <SortableHeader label="Total Purchases" sortKey="totalPurchaseValue" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      size: 140,
      cell: ({ row }) => (
        <span className="font-medium">{formatINR(row.original.totalPurchaseValue)}</span>
      ),
    },
    {
      accessorKey: 'loyaltyPoints',
      header: () => <SortableHeader label="Points" sortKey="loyaltyPoints" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      size: 80,
      cell: ({ row }) => (
        <span className="text-[var(--color-accent)] font-medium">{row.original.loyaltyPoints}</span>
      ),
    },
    {
      accessorKey: 'lastPurchaseDate',
      header: () => <SortableHeader label="Last Purchase" sortKey="lastPurchaseDate" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      size: 130,
      cell: ({ row }) =>
        row.original.lastPurchaseDate
          ? formatDate(row.original.lastPurchaseDate)
          : '—',
    },
    {
      accessorKey: 'gstin',
      header: 'Type',
      size: 80,
      cell: ({ row }) => (
        <Badge variant={row.original.gstin ? 'info' : 'default'}>
          {row.original.gstin ? 'B2B' : 'Retail'}
        </Badge>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage your customer database"
        action={
          <Button onClick={() => router.push('/sales/new')}>
            <Plus className="h-4 w-4" /> New Bill
          </Button>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Search by name or phone..."
      />

      {!isLoading && data?.total === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Customers are added automatically when you create bills"
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            onRowClick={(c) => router.push(`/customers/${c.id}`)}
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
