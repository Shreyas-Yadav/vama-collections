'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { useSales } from '@/hooks/use-sales'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { formatINR, formatDate } from '@/lib/format'
import { BILL_STATUS_LABELS, PAGE_SIZE_DEFAULT } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import type { Bill } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

export default function SalesReportPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT)
  const { data, isLoading } = useSales({ page, pageSize, status: 'PAID' })

  const paidBills = data?.data ?? []
  const totalRevenue = paidBills.reduce((sum, b) => sum + b.grandTotal, 0)
  const totalGST = paidBills.reduce((sum, b) => sum + b.totalGst, 0)

  const columns: ColumnDef<Bill, unknown>[] = [
    { accessorKey: 'billNumber', header: 'Bill #', size: 160, cell: ({ row }) => <span className="font-mono text-sm">{row.original.billNumber}</span> },
    { accessorKey: 'customerName', header: 'Customer' },
    { accessorKey: 'createdAt', header: 'Date', size: 120, cell: ({ row }) => formatDate(row.original.createdAt) },
    { accessorKey: 'subtotal', header: 'Taxable Amount', size: 140, cell: ({ row }) => formatINR(row.original.subtotal) },
    { accessorKey: 'totalGst', header: 'GST', size: 110, cell: ({ row }) => formatINR(row.original.totalGst) },
    { accessorKey: 'grandTotal', header: 'Total', size: 130, cell: ({ row }) => <span className="font-semibold">{formatINR(row.original.grandTotal)}</span> },
    { accessorKey: 'status', header: 'Status', size: 100, cell: ({ row }) => <Badge variant="success">{BILL_STATUS_LABELS[row.original.status]}</Badge> },
  ]

  return (
    <div>
      <PageHeader title="Sales Report" description="Paid bills summary" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[var(--color-muted)]">Total Revenue</p>
            <p className="text-2xl font-bold text-[var(--color-primary)] mt-1">{formatINR(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[var(--color-muted)]">Total GST Collected</p>
            <p className="text-2xl font-bold mt-1">{formatINR(totalGST)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[var(--color-muted)]">Bills</p>
            <p className="text-2xl font-bold mt-1">{data?.total ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={paidBills} isLoading={isLoading} />
      {data && (
        <DataTablePagination
          page={page} pageSize={pageSize} total={data.total} totalPages={data.totalPages}
          onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
        />
      )}
    </div>
  )
}
