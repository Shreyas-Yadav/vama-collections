'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Truck } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { SortableHeader } from '@/components/ui/sortable-header'
import { useVendors, useDeleteVendor } from '@/hooks/use-vendors'
import { useToast } from '@/providers/toast-provider'
import { formatINR } from '@/lib/format'
import { VENDOR_TYPE_LABELS, PAGE_SIZE_DEFAULT } from '@/lib/constants'
import type { Vendor } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function VendorActions({ vendor, onView, onEdit, onDelete }: {
  vendor: Vendor
  onView: (v: Vendor) => void
  onEdit: (v: Vendor) => void
  onDelete: (v: Vendor) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(vendor)}><Eye className="h-4 w-4" /> View</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(vendor)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(vendor)}
          className="text-[var(--color-danger)] focus:text-[var(--color-danger)]"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function VendorsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null)
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (key === sortKey) { setSortDir((d) => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const { data, isLoading } = useVendors({ page, pageSize, search, sortKey, sortDir })
  const deleteVendor = useDeleteVendor()

  const columns: ColumnDef<Vendor, unknown>[] = [
    {
      accessorKey: 'name',
      header: () => <SortableHeader label="Vendor Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-[var(--color-muted)]">{row.original.contactPerson}</p>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone,
    },
    {
      accessorKey: 'city',
      header: () => <SortableHeader label="Location" sortKey="city" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      cell: ({ row }) => `${row.original.city}, ${row.original.state}`,
    },
    {
      accessorKey: 'vendorType',
      header: () => <SortableHeader label="Type" sortKey="vendorType" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      cell: ({ row }) => (
        <Badge variant="outline">{VENDOR_TYPE_LABELS[row.original.vendorType]}</Badge>
      ),
    },
    {
      accessorKey: 'creditPeriodDays',
      header: () => <SortableHeader label="Credit Days" sortKey="creditPeriodDays" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      size: 100,
      cell: ({ row }) => `${row.original.creditPeriodDays} days`,
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
      accessorKey: 'isActive',
      header: () => <SortableHeader label="Status" sortKey="isActive" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />,
      size: 80,
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'default'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      size: 50,
      cell: ({ row }) => (
        <VendorActions
          vendor={row.original}
          onView={(v) => router.push(`/vendors/${v.id}`)}
          onEdit={(v) => router.push(`/vendors/${v.id}`)}
          onDelete={setDeleteTarget}
        />
      ),
    },
  ]

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteVendor.mutateAsync(deleteTarget.id)
      toast({ title: 'Vendor deleted', variant: 'success' })
    } catch {
      toast({ title: 'Failed to delete', variant: 'error' })
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Vendors"
        description="Manage your suppliers and vendors"
        action={
          <Button onClick={() => router.push('/vendors/new')}>
            <Plus className="h-4 w-4" /> Add Vendor
          </Button>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Search vendors..."
      />

      {!isLoading && data?.total === 0 ? (
        <EmptyState
          icon={Truck}
          title="No vendors yet"
          description="Add vendors to track your suppliers"
          action={<Button onClick={() => router.push('/vendors/new')}><Plus className="h-4 w-4" /> Add Vendor</Button>}
        />
      ) : (
        <>
          <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} />
          {data && (
            <DataTablePagination
              page={page} pageSize={pageSize} total={data.total} totalPages={data.totalPages}
              onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
            />
          )}
        </>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
            <DialogDescription>
              Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteVendor.isPending} onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
