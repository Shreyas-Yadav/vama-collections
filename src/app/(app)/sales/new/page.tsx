'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { useProductSearch } from '@/hooks/use-products'
import { useCustomerSearch, useCreateCustomer } from '@/hooks/use-customers'
import { useCreateBill } from '@/hooks/use-sales'
import { useToast } from '@/providers/toast-provider'
import { calculateBill, formatINR, paiToRupees } from '@/lib/format'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@/lib/constants'
import type { Product, Customer } from '@/types'
import type { GSTSlab } from '@/lib/format'

interface LineItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number    // paise
  discountPercent: number
  gstSlab: GSTSlab
  hsnCode: string
}

export default function NewBillPage() {
  const router = useRouter()
  const { toast } = useToast()
  const createBill = useCreateBill()

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerId, setCustomerId] = useState<string>()
  const [isInterState, setIsInterState] = useState(false)
  const [isGstEnabled, setIsGstEnabled] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [amountPaidRupees, setAmountPaidRupees] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const createCustomer = useCreateCustomer()

  const { data: productResults } = useProductSearch(productSearch)
  const { data: customerResults } = useCustomerSearch(customerSearch)

  const totals = calculateBill(
    lineItems.map((li) => ({
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      discountPercent: li.discountPercent,
      gstSlab: li.gstSlab,
    })),
    isInterState,
    isGstEnabled,
  )

  const addProduct = (product: Product) => {
    setLineItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.sellingPrice,
        discountPercent: 0,
        gstSlab: product.gstSlab,
        hsnCode: product.hsnCode,
      },
    ])
    setProductSearch('')
    setShowProductSearch(false)
  }

  const selectCustomer = (c: Customer) => {
    setCustomerId(c.id)
    setCustomerName(c.name)
    setCustomerPhone(c.phone)
    setCustomerSearch('')
    setShowCustomerSearch(false)
  }

  const openNewCustomerDialog = () => {
    setNewCustomerName(customerName)
    setNewCustomerPhone(customerPhone)
    setNewCustomerEmail('')
    setShowNewCustomerDialog(true)
  }

  const handleAddNewCustomer = async () => {
    if (!newCustomerName) {
      toast({ title: 'Enter customer name', variant: 'warning' })
      return
    }
    try {
      const customer = await createCustomer.mutateAsync({
        name: newCustomerName,
        phone: newCustomerPhone,
        email: newCustomerEmail || undefined,
      })
      setCustomerId(customer.id)
      setCustomerName(customer.name)
      setCustomerPhone(customer.phone)
      setCustomerSearch('')
      setShowCustomerSearch(false)
      setShowNewCustomerDialog(false)
      toast({ title: 'Customer added', variant: 'success' })
    } catch {
      toast({ title: 'Failed to add customer', variant: 'error' })
    }
  }

  const updateLine = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeLine = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (lineItems.length === 0) {
      toast({ title: 'Add at least one item', variant: 'warning' })
      return
    }
    if (!customerName) {
      toast({ title: 'Enter customer name', variant: 'warning' })
      return
    }

    const amountPaid = Math.round((parseFloat(amountPaidRupees) || 0) * 100)
    const status = amountPaid >= totals.grandTotal ? 'PAID' : amountPaid > 0 ? 'PARTIALLY_PAID' : 'DRAFT'

    setSubmitting(true)
    try {
      const bill = await createBill.mutateAsync({
        customerId,
        customerName,
        customerPhone: customerPhone || undefined,
        status,
        isInterState,
        isGstEnabled,
        lineItems: lineItems.map((li) => ({
          productId: li.productId,
          productName: li.productName,
          sku: li.sku,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          discountPercent: li.discountPercent,
          gstSlab: li.gstSlab,
          hsnCode: li.hsnCode,
        })),
        amountPaid,
        paymentMethod: paymentMethod as 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT' | 'MIXED',
      })
      toast({ title: 'Bill created!', description: bill.billNumber, variant: 'success' })
      router.push(`/sales/${bill.id}`)
    } catch {
      toast({ title: 'Failed to create bill', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title="New Bill" description="Create a new sales invoice" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Label>Customer Name</Label>
                <div className="relative mt-1">
                  <Input
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value)
                      setCustomerSearch(e.target.value)
                      setShowCustomerSearch(true)
                      if (!e.target.value) setCustomerId(undefined)
                    }}
                    placeholder="Customer name or search..."
                  />
                  {showCustomerSearch && customerSearch.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-lg">
                      {customerResults && customerResults.length > 0
                        ? customerResults.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-surface-raised)] transition-colors first:rounded-t-[var(--radius-lg)] last:rounded-b-[var(--radius-lg)]"
                              onClick={() => selectCustomer(c)}
                            >
                              <span className="font-medium">{c.name}</span>
                              <span className="text-[var(--color-muted)] ml-2">{c.phone}</span>
                            </button>
                          ))
                        : (
                            <div className="px-3 py-2 text-sm text-[var(--color-muted)]">No customers found</div>
                          )
                      }
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm text-[var(--color-primary)] font-medium hover:bg-[var(--color-surface-raised)] transition-colors border-t border-[var(--color-border)] rounded-b-[var(--radius-lg)]"
                        onClick={openNewCustomerDialog}
                      >
                        + Add as new customer
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isGstEnabled} onCheckedChange={setIsGstEnabled} />
                <div>
                  <Label>Charge GST</Label>
                  {!isGstEnabled && (
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">GST disabled — prices are inclusive / unregistered business</p>
                  )}
                </div>
              </div>
              {isGstEnabled && (
                <div className="flex items-center gap-3">
                  <Switch checked={isInterState} onCheckedChange={setIsInterState} />
                  <Label>Inter-state sale (IGST instead of CGST+SGST)</Label>
                </div>
              )}
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
                      placeholder="Search products..."
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
                          <span className="text-[var(--color-muted)] ml-2 text-xs">{formatINR(p.sellingPrice)}</span>
                        </button>
                      ))}
                      {productSearch.length >= 2 && (!productResults || productResults.length === 0) && (
                        <p className="px-2 py-3 text-sm text-[var(--color-muted)] text-center">No products found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {lineItems.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)] text-center py-8">
                  No items added. Click "Add Item" to search and add products.
                </p>
              ) : (
                <div className="space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-[var(--color-muted-fg)] pb-1 border-b border-[var(--color-border)]">
                    <div className="col-span-4">Product</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Rate (₹)</div>
                    <div className="col-span-2">Disc%</div>
                    <div className="col-span-1 text-right">Total</div>
                    <div className="col-span-1" />
                  </div>
                  {lineItems.map((li, i) => {
                    const gross = li.quantity * li.unitPrice
                    const disc = Math.round((gross * li.discountPercent) / 100)
                    const taxable = gross - disc
                    const gst = Math.round((taxable * li.gstSlab) / 100)
                    const lineTotal = taxable + gst
                    return (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
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
                        <div className="col-span-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={paiToRupees(li.unitPrice)}
                            onChange={(e) => updateLine(i, 'unitPrice', Math.round(parseFloat(e.target.value || '0') * 100))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={li.discountPercent}
                            onChange={(e) => updateLine(i, 'discountPercent', parseFloat(e.target.value) || 0)}
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

        {/* Bill Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader><CardTitle>Bill Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Subtotal</span>
                  <span>{formatINR(totals.subtotal)}</span>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between text-[var(--color-success)]">
                    <span>Discount</span>
                    <span>- {formatINR(totals.totalDiscount)}</span>
                  </div>
                )}
                {isGstEnabled ? (
                  isInterState ? (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">IGST</span>
                      <span>{formatINR(totals.totalIgst)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-muted)]">CGST</span>
                        <span>{formatINR(totals.totalCgst)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-muted)]">SGST</span>
                        <span>{formatINR(totals.totalSgst)}</span>
                      </div>
                    </>
                  )
                ) : (
                  <div className="flex justify-between text-[var(--color-muted)]">
                    <span>GST</span>
                    <span className="text-xs italic">Not applicable</span>
                  </div>
                )}
                {totals.roundOff !== 0 && (
                  <div className="flex justify-between text-[var(--color-muted)]">
                    <span>Round Off</span>
                    <span>{totals.roundOff > 0 ? '+' : ''}{formatINR(totals.roundOff)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span className="text-[var(--color-primary)]">{formatINR(totals.grandTotal)}</span>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount Paid (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={amountPaidRupees}
                    onChange={(e) => setAmountPaidRupees(e.target.value)}
                    placeholder={paiToRupees(totals.grandTotal).toFixed(2)}
                    className="mt-1"
                  />
                </div>
                {amountPaidRupees && totals.grandTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted)]">Balance Due</span>
                    <span className={totals.grandTotal - Math.round(parseFloat(amountPaidRupees) * 100) > 0 ? 'text-[var(--color-danger)] font-medium' : 'text-[var(--color-success)]'}>
                      {formatINR(Math.max(0, totals.grandTotal - Math.round(parseFloat(amountPaidRupees) * 100)))}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <Button
                className="w-full"
                onClick={handleSubmit}
                loading={submitting}
                disabled={lineItems.length === 0}
              >
                Create Bill
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

      <Dialog open={showNewCustomerDialog} onOpenChange={(open) => !open && setShowNewCustomerDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Create a new customer record and select them for this bill.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name</Label>
              <Input value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} className="mt-1" autoFocus />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} placeholder="10-digit mobile" className="mt-1" />
            </div>
            <div>
              <Label>Email <span className="text-[var(--color-muted)]">(optional)</span></Label>
              <Input value={newCustomerEmail} onChange={(e) => setNewCustomerEmail(e.target.value)} type="email" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCustomerDialog(false)}>Cancel</Button>
            <Button variant="primary" loading={createCustomer.isPending} onClick={handleAddNewCustomer}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

