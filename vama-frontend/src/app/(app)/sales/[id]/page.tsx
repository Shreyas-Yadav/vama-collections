'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer, ChevronDown } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSale, useUpdateBillStatus, useRecordPayment } from '@/hooks/use-sales'
import { useToast } from '@/providers/toast-provider'
import { formatINR, formatDateTime, paiToRupees } from '@/lib/format'
import { BILL_STATUS_LABELS, PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@/lib/constants'
import type { BillStatus } from '@/types/sale'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  DRAFT: 'default', PAID: 'success', PARTIALLY_PAID: 'warning', CANCELLED: 'danger',
}

const STATUS_TRANSITIONS: Record<BillStatus, BillStatus[]> = {
  DRAFT:          ['PAID', 'PARTIALLY_PAID', 'CANCELLED'],
  PARTIALLY_PAID: ['PAID', 'CANCELLED'],
  PAID:           [],
  CANCELLED:      [],
}

export default function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: bill, isLoading } = useSale(id)
  const updateStatus = useUpdateBillStatus()
  const recordPayment = useRecordPayment()
  const { toast } = useToast()
  const [pendingStatus, setPendingStatus] = useState<BillStatus | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [paymentNote, setPaymentNote] = useState('')

  const handleConfirm = async () => {
    if (!pendingStatus) return
    try {
      await updateStatus.mutateAsync({ id, status: pendingStatus })
      toast({ title: `Bill marked as "${BILL_STATUS_LABELS[pendingStatus]}"`, variant: 'success' })
    } catch {
      toast({ title: 'Failed to update status', variant: 'error' })
    } finally {
      setPendingStatus(null)
    }
  }

  const handleReceivePayment = async () => {
    if (!bill) return
    const amountPaise = Math.round(parseFloat(paymentAmount) * 100)
    if (!amountPaise || amountPaise <= 0) {
      toast({ title: 'Enter a valid amount', variant: 'warning' })
      return
    }
    if (amountPaise > bill.balanceDue) {
      toast({ title: 'Amount exceeds balance due', variant: 'warning' })
      return
    }
    try {
      await recordPayment.mutateAsync({ id, amount: amountPaise, paymentMethod, note: paymentNote || undefined })
      toast({ title: 'Payment recorded', variant: 'success' })
      setShowPaymentDialog(false)
      setPaymentAmount('')
      setPaymentNote('')
    } catch {
      toast({ title: 'Failed to record payment', variant: 'error' })
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!bill) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-[var(--color-muted)]">Bill not found</p>
        <Button variant="outline" onClick={() => router.push('/sales')}>
          <ArrowLeft className="h-4 w-4" /> Back to Bills
        </Button>
      </div>
    )
  }

  const nextStatuses = STATUS_TRANSITIONS[bill.status]
  const isCancelling = pendingStatus === 'CANCELLED'

  return (
    <div>
      <PageHeader
        title={bill.billNumber}
        description={`${formatDateTime(bill.createdAt)}`}
        action={
          <div className="flex gap-2 items-center">
            <Badge variant={statusVariant[bill.status] ?? 'default'}>{BILL_STATUS_LABELS[bill.status]}</Badge>
            {nextStatuses.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Update Status <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {nextStatuses.filter((s) => s !== 'CANCELLED').map((s) => (
                    <DropdownMenuItem key={s} onClick={() => setPendingStatus(s)}>
                      {BILL_STATUS_LABELS[s]}
                    </DropdownMenuItem>
                  ))}
                  {nextStatuses.includes('CANCELLED') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setPendingStatus('CANCELLED')}
                        className="text-[var(--color-danger)] focus:text-[var(--color-danger)]"
                      >
                        {BILL_STATUS_LABELS['CANCELLED']}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {bill.balanceDue > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setPaymentAmount(paiToRupees(bill.balanceDue).toFixed(2))
                  setPaymentMethod('CASH')
                  setPaymentNote('')
                  setShowPaymentDialog(true)
                }}
              >
                Receive Payment
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push('/sales')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Name</span>
                <span className="font-medium">{bill.customerName}</span>
              </div>
              {bill.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Phone</span>
                  <span>{bill.customerPhone}</span>
                </div>
              )}
              {bill.customerGstin && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">GSTIN</span>
                  <span className="font-mono">{bill.customerGstin}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Sale Type</span>
                <span>{bill.isInterState ? 'Inter-state (IGST)' : 'Intra-state (CGST+SGST)'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-[780px] w-full text-sm">
                  <thead className="bg-[var(--color-surface-raised)] border-b border-[var(--color-border)]">
                    <tr>
                      {['Product', 'HSN', 'Qty', 'Rate', 'Disc', 'Taxable', 'GST', 'Total'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-xs text-[var(--color-muted-fg)] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {bill.lineItems.map((li) => (
                      <tr key={li.id}>
                        <td className="px-3 py-3 min-w-[220px]">
                          <p className="font-medium">{li.productName}</p>
                          <p className="text-xs text-[var(--color-muted)]">{li.sku}</p>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{li.hsnCode}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{li.quantity}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{formatINR(li.unitPrice)}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{li.discountPercent > 0 ? `${li.discountPercent}%` : '—'}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{formatINR(li.taxableAmount)}</td>
                        <td className="px-3 py-3 text-xs whitespace-nowrap">
                          {!bill.isGstEnabled
                            ? <span className="text-[var(--color-muted)]">—</span>
                            : bill.isInterState
                              ? `IGST ${li.gstSlab}%`
                              : `CGST+SGST ${li.gstSlab}%`}
                        </td>
                        <td className="px-3 py-3 font-semibold whitespace-nowrap">{formatINR(li.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle>Amount Summary</CardTitle>
              <Badge variant={statusVariant[bill.status] ?? 'default'}>
                {BILL_STATUS_LABELS[bill.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Subtotal</span>
                <span>{formatINR(bill.subtotal)}</span>
              </div>
              {bill.totalDiscount > 0 && (
                <div className="flex justify-between text-[var(--color-success)]">
                  <span>Discount</span>
                  <span>- {formatINR(bill.totalDiscount)}</span>
                </div>
              )}
              {bill.isGstEnabled ? (
                bill.isInterState ? (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">IGST</span>
                    <span>{formatINR(bill.totalIgst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">CGST</span>
                      <span>{formatINR(bill.totalCgst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">SGST</span>
                      <span>{formatINR(bill.totalSgst)}</span>
                    </div>
                  </>
                )
              ) : (
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>GST</span>
                  <span className="text-xs italic">Not applicable</span>
                </div>
              )}
              {bill.roundOff !== 0 && (
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Round Off</span>
                  <span>{bill.roundOff > 0 ? '+' : ''}{formatINR(bill.roundOff)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span className="text-[var(--color-primary)]">{formatINR(bill.grandTotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Amount Paid</span>
                <span className="font-medium text-[var(--color-success)]">{formatINR(bill.amountPaid)}</span>
              </div>
              {bill.balanceDue > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Balance Due</span>
                  <span className="font-semibold text-[var(--color-danger)]">{formatINR(bill.balanceDue)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Payment Method</span>
                <span>{PAYMENT_METHOD_LABELS[bill.paymentMethod]}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={(open) => !open && setShowPaymentDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive Payment</DialogTitle>
            <DialogDescription>
              Balance due: <strong>{formatINR(bill.balanceDue)}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reference / Note <span className="text-[var(--color-muted)]">(optional)</span></Label>
              <Input
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="UPI ref, cheque no., etc."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button variant="primary" loading={recordPayment.isPending} onClick={handleReceivePayment}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingStatus} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCancelling ? 'Cancel Bill?' : 'Update Bill Status?'}</DialogTitle>
            <DialogDescription>
              {isCancelling
                ? `This will cancel ${bill.billNumber}. This action cannot be undone.`
                : `Mark ${bill.billNumber} as "${pendingStatus ? BILL_STATUS_LABELS[pendingStatus] : ''}"?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingStatus(null)}>No, go back</Button>
            <Button
              variant={isCancelling ? 'danger' : 'primary'}
              loading={updateStatus.isPending}
              onClick={handleConfirm}
            >
              {isCancelling ? 'Yes, Cancel Bill' : 'Yes, Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
