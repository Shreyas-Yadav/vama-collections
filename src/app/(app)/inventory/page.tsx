'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Package } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { makeProductColumns } from '@/features/inventory/product-table-columns'
import { useProducts, useDeleteProduct } from '@/hooks/use-products'
import { useAllCategories } from '@/hooks/use-categories'
import { useToast } from '@/providers/toast-provider'
import { PAGE_SIZE_DEFAULT, PRODUCT_TYPES, STOCK_STATUSES } from '@/lib/constants'
import type { Product } from '@/types'

export default function InventoryPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [stockStatus, setStockStatus] = useState('')
  const [productType, setProductType] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const { data, isLoading } = useProducts({
    page, pageSize, search,
    categoryId: categoryId || undefined,
    stockStatus: stockStatus || undefined,
    productType: productType || undefined,
  })

  const { data: categories } = useAllCategories()
  const deleteProduct = useDeleteProduct()

  const columns = makeProductColumns({
    onView: (p) => router.push(`/inventory/${p.id}`),
    onEdit: (p) => router.push(`/inventory/${p.id}/edit`),
    onDelete: setDeleteTarget,
  })

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteProduct.mutateAsync(deleteTarget.id)
      toast({ title: 'Product deleted', variant: 'success' })
    } catch {
      toast({ title: 'Failed to delete', variant: 'error' })
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your inventory of sarees, suits, and accessories"
        action={
          <Button onClick={() => router.push('/inventory/new')}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={handleSearchChange}
        placeholder="Search by name, SKU, color..."
        filters={
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={productType} onValueChange={(v) => { setProductType(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={stockStatus} onValueChange={(v) => { setStockStatus(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="All Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {!isLoading && data?.total === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first saree or product to get started"
          action={
            <Button onClick={() => router.push('/inventory/new')}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
          />
          {data && (
            <DataTablePagination
              page={page}
              pageSize={pageSize}
              total={data.total}
              totalPages={data.totalPages}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
            />
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteProduct.isPending} onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
