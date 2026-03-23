'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAllVendors } from '@/hooks/use-vendors'
import { useProductSearch } from '@/hooks/use-products'
import { useCreatePurchaseOrder } from '@/hooks/use-purchase-orders'
import { useToast } from '@/providers/toast-provider'
import { formatINR, paiToRupees } from '@/lib/format'
import { PO_STATUS_LABELS } from '@/lib/constants'
import type { Product } from '@/types'
import type { POStatus } from '@/types/purchase-order'
import type { GSTSlab } from '@/lib/format'

interface POLineItemDraft {
  productId: string
  productName: string
  sku: string
  unitCostRupees: number
  quantity: number
  gstSlab: GSTSlab
  hsnCode: string
}

const CREATABLE_STATUSES: POStatus[] = ['DRAFT', 'SENT']

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const createPO = useCreatePurchaseOrder()

  const [vendorId, setVendorId] = useState('')
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')
  const [status, setStatus] = useState<POStatus>('DRAFT')
  const [notes, setNotes] = useState('')
  const [discountRupees, setDiscountRupees] = useState('')
  const [lineItems, setLineItems] = useState<POLineItemDraft[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { data: vendors } = useAllVendors()
  const { data: productResults } = useProductSearch(productSearch)

  // --- Totals ---
  const subtotal = lineItems.reduce((s, li) => s + li.quantity * Math.round(li.unitCostRupees * 100), 0)
  const totalGst = lineItems.reduce((s, li) => {
    const cost = li.quantity * Math.round(li.unitCostRupees * 100)
    return s + Math.round((cost * li.gstSlab) / 100)
  }, 0)
  const discountAmount = Math.round(parseFloat(discountRupees || '0') * 100)
  const totalAmount = subtotal + totalGst - discountAmount

  // --- Line item handlers ---
  const addProduct = (product: Product) => {
    setLineItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitCostRupees: paiToRupees(product.costPrice),
        quantity: 1,
        gstSlab: product.gstSlab,
        hsnCode: product.hsnCode,
      },
    ])
    setProductSearch('')
    setShowProductSearch(false)
  }

  const updateLine = (index: number, field: 'quantity' | 'unitCostRupees', value: number) => {
    setLineItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeLine = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  // --- Submit ---
  const handleSubmit = async () => {
    if (!vendorId) {
      toast({ title: 'Select a vendor', variant: 'warning' })
      return
    }
    if (lineItems.length === 0) {
      toast({ title: 'Add at least one item', variant: 'warning' })
      return
    }

    setSubmitting(true)
    try {
      const po = await createPO.mutateAsync({
        vendorId,
        status,
        orderDate,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        discountAmount,
        notes: notes || undefined,
        lineItems: lineItems.map((li) => ({
          productId: li.productId,
          quantity: li.quantity,
          unitCost: Math.round(li.unitCostRupees * 100),
          gstSlab: li.gstSlab,
          hsnCode: li.hsnCode,
        })),
      })
      toast({ title: 'Purchase order created', description: po.poNumber, variant: 'success' })
      router.push(`/purchase-orders/${po.id}`)
    } catch {
      toast({ title: 'Failed to create purchase order', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="New Purchase Order"
        description="Create a purchase order for your vendors"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Vendor */}
          <Card>
            <CardHeader><CardTitle>Vendor</CardTitle></CardHeader>
            <CardContent>
              <div>
                <Label required>Select Vendor</Label>
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a vendor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors?.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                        <span className="text-[var(--color-muted)] ml-2 text-xs">{v.city}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Order Date</Label>
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Expected Delivery Date</Label>
                <Input
                  type="date"
                  value={expectedDeliveryDate}
                  min={orderDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label required>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as POStatus)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CREATABLE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{PO_STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Notes</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes for the vendor..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProductSearch((s) => !s)}
                >
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
                {showProductSearch && (
                  <div className="absolute right-0 top-full mt-1 w-80 z-10 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-lg p-2">
                    <Input
                      autoFocus
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products by name or SKU..."
                      className="mb-2"
                    />
                    <div className="max-h-56 overflow-y-auto space-y-0.5">
                      {productResults?.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="w-full text-left px-2 py-2 text-sm rounded hover:bg-[var(--color-surface-raised)] transition-colors"
                          onClick={() => addProduct(p)}
                        >
                          <span className="font-medium">{p.name}</span>
                          <span className="text-[var(--color-muted)] ml-2 text-xs">
                            {p.sku} · Cost: {formatINR(p.costPrice)}
                          </span>
                        </button>
                      ))}
                      {productSearch.length >= 2 && (!productResults || productResults.length === 0) && (
                        <p className="px-2 py-3 text-sm text-[var(--color-muted)] text-center">No products found</p>
                      )}
                      {productSearch.length < 2 && (
                        <p className="px-2 py-3 text-sm text-[var(--color-muted)] text-center">Type to search...</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {lineItems.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)] text-center py-8">
                  No items added. Click &quot;Add Item&quot; to search and add products.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-[var(--color-muted-fg)] pb-1 border-b border-[var(--color-border)]">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-3">Unit Cost (₹)</div>
                    <div className="col-span-1 text-right">Total</div>
                    <div className="col-span-1" />
                  </div>
                  {lineItems.map((li, i) => {
                    const lineTotal = li.quantity * Math.round(li.unitCostRupees * 100)
                    return (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <p className="text-sm font-medium truncate">{li.productName}</p>
                          <p className="text-xs text-[var(--color-muted)]">{li.sku} · GST {li.gstSlab}%</p>
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="1"
                            value={li.quantity}
                            onChange={(e) => updateLine(i, 'quantity', parseInt(e.target.value) || 1)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={li.unitCostRupees}
                            onChange={(e) => updateLine(i, 'unitCostRupees', parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          <span className="text-sm font-medium">{formatINR(lineTotal)}</span>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[var(--color-danger)]"
                            onClick={() => removeLine(i)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">GST</span>
                  <span>{formatINR(totalGst)}</span>
                </div>
              </div>

              <div>
                <Label>Discount (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountRupees}
                  onChange={(e) => setDiscountRupees(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-[var(--color-primary)]">{formatINR(totalAmount)}</span>
              </div>

              <Separator />

              <Button
                className="w-full"
                onClick={handleSubmit}
                loading={submitting}
                disabled={lineItems.length === 0 || !vendorId}
              >
                Create Purchase Order
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
