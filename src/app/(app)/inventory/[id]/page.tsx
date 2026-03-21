'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, ArrowLeft, Package } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useProduct } from '@/hooks/use-products'
import { formatINR, formatDate } from '@/lib/format'
import type { Product } from '@/types'

const stockBadge: Record<Product['stockStatus'], { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  IN_STOCK: { label: 'In Stock', variant: 'success' },
  LOW_STOCK: { label: 'Low Stock', variant: 'warning' },
  OUT_OF_STOCK: { label: 'Out of Stock', variant: 'danger' },
}

function DetailRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex justify-between py-2 border-b border-[var(--color-border)] last:border-0">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <span className="text-sm font-medium text-right max-w-xs">{String(value)}</span>
    </div>
  )
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: product, isLoading } = useProduct(id)

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Package className="h-12 w-12 text-[var(--color-muted)]" />
        <p className="text-[var(--color-muted)]">Product not found</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const stock = stockBadge[product.stockStatus]

  return (
    <div>
      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/inventory')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => router.push(`/inventory/${id}/edit`)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent>
              <DetailRow label="Product Type" value={product.productType} />
              <DetailRow label="Fabric Type" value={product.fabricType} />
              <DetailRow label="Color" value={product.color} />
              <DetailRow label="Pattern" value={product.pattern} />
              {product.designCode && <DetailRow label="Design Code" value={product.designCode} />}
              {product.length && <DetailRow label="Length" value={`${product.length} m`} />}
              {product.blouseIncluded && <DetailRow label="Blouse Included" value={product.blouseIncluded ? 'Yes' : 'No'} />}
              {product.blouseLength && <DetailRow label="Blouse Length" value={`${product.blouseLength} cm`} />}
              {product.weight && <DetailRow label="Weight" value={`${product.weight} g`} />}
              {product.tags.length > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-sm text-[var(--color-muted)]">Tags</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pricing & GST</CardTitle></CardHeader>
            <CardContent>
              <DetailRow label="Selling Price" value={formatINR(product.sellingPrice)} />
              <DetailRow label="Cost Price" value={formatINR(product.costPrice)} />
              {product.mrp && <DetailRow label="MRP" value={formatINR(product.mrp)} />}
              <DetailRow label="GST Slab" value={`${product.gstSlab}%`} />
              <DetailRow label="HSN Code" value={product.hsnCode} />
              <DetailRow
                label="Margin"
                value={`${(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100).toFixed(1)}%`}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Stock Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-muted)]">Status</span>
                <Badge variant={stock.variant}>{stock.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-muted)]">Qty in Stock</span>
                <span className="text-2xl font-bold">{product.quantityInStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-muted)]">Low Stock Alert</span>
                <span className="text-sm font-medium">{product.lowStockThreshold} units</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-muted)]">Active</span>
                <Badge variant={product.isActive ? 'success' : 'default'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Timestamps</CardTitle></CardHeader>
            <CardContent>
              <DetailRow label="Created" value={formatDate(product.createdAt)} />
              <DetailRow label="Last Updated" value={formatDate(product.updatedAt)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
