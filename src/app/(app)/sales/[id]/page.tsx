'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useSale } from '@/hooks/use-sales'
import { formatINR, formatDateTime } from '@/lib/format'
import { BILL_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  DRAFT: 'default', PAID: 'success', PARTIALLY_PAID: 'warning', CANCELLED: 'danger',
}

export default function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: bill, isLoading } = useSale(id)

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!bill) return <p className="text-center py-20 text-[var(--color-muted)]">Bill not found</p>

  return (
    <div>
      <PageHeader
        title={bill.billNumber}
        description={`${formatDateTime(bill.createdAt)}`}
        action={
          <div className="flex gap-2">
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
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-surface-raised)] border-b border-[var(--color-border)]">
                    <tr>
                      {['Product', 'HSN', 'Qty', 'Rate', 'Disc', 'Taxable', 'GST', 'Total'].map((h) => (
                        <th key={h} className="px-4 py-2 text-left font-semibold text-xs text-[var(--color-muted-fg)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {bill.lineItems.map((li) => (
                      <tr key={li.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{li.productName}</p>
                          <p className="text-xs text-[var(--color-muted)]">{li.sku}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{li.hsnCode}</td>
                        <td className="px-4 py-3">{li.quantity}</td>
                        <td className="px-4 py-3">{formatINR(li.unitPrice)}</td>
                        <td className="px-4 py-3">{li.discountPercent > 0 ? `${li.discountPercent}%` : '—'}</td>
                        <td className="px-4 py-3">{formatINR(li.taxableAmount)}</td>
                        <td className="px-4 py-3 text-xs">
                          {bill.isInterState
                            ? `IGST ${li.gstSlab}%`
                            : `CGST+SGST ${li.gstSlab}%`}
                        </td>
                        <td className="px-4 py-3 font-semibold">{formatINR(li.lineTotal)}</td>
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
              {bill.isInterState ? (
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
    </div>
  )
}
