'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { usePurchaseOrder, useUpdatePOStatus } from '@/hooks/use-purchase-orders'
import { useToast } from '@/providers/toast-provider'
import { formatINR, formatDate } from '@/lib/format'
import { PO_STATUS_LABELS } from '@/lib/constants'
import type { POStatus } from '@/types/purchase-order'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  DRAFT: 'default', SENT: 'info', PARTIALLY_RECEIVED: 'warning', RECEIVED: 'success', CANCELLED: 'danger',
}

const STATUS_TRANSITIONS: Record<POStatus, POStatus[]> = {
  DRAFT:              ['SENT', 'CANCELLED'],
  SENT:               ['PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
  PARTIALLY_RECEIVED: ['RECEIVED', 'CANCELLED'],
  RECEIVED:           [],
  CANCELLED:          [],
}

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: po, isLoading } = usePurchaseOrder(id)
  const updateStatus = useUpdatePOStatus()
  const { toast } = useToast()

  const [pendingStatus, setPendingStatus] = useState<POStatus | null>(null)

  const handleConfirm = async () => {
    if (!pendingStatus) return
    try {
      await updateStatus.mutateAsync({ id, status: pendingStatus })
      toast({ title: `Status updated to "${PO_STATUS_LABELS[pendingStatus]}"`, variant: 'success' })
    } catch {
      toast({ title: 'Failed to update status', variant: 'error' })
    } finally {
      setPendingStatus(null)
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!po) return <p className="text-center py-20 text-[var(--color-muted)]">Purchase order not found</p>

  const nextStatuses = STATUS_TRANSITIONS[po.status]
  const isCancelling = pendingStatus === 'CANCELLED'

  return (
    <div>
      <PageHeader
        title={po.poNumber}
        description={`Vendor: ${po.vendorName}`}
        action={
          <div className="flex gap-2 items-center">
            <Badge variant={statusVariant[po.status] ?? 'default'}>{PO_STATUS_LABELS[po.status]}</Badge>
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
                      {PO_STATUS_LABELS[s]}
                    </DropdownMenuItem>
                  ))}
                  {nextStatuses.includes('CANCELLED') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setPendingStatus('CANCELLED')}
                        className="text-[var(--color-danger)] focus:text-[var(--color-danger)]"
                      >
                        {PO_STATUS_LABELS['CANCELLED']}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="outline" onClick={() => router.push('/purchase-orders')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-surface-raised)] border-b border-[var(--color-border)]">
                    <tr>
                      {['Product', 'SKU', 'Ordered', 'Received', 'Unit Cost', 'Total'].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-[var(--color-muted-fg)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {po.lineItems.map((li) => (
                      <tr key={li.id}>
                        <td className="px-4 py-3 font-medium">{li.productName}</td>
                        <td className="px-4 py-3 font-mono text-xs">{li.sku}</td>
                        <td className="px-4 py-3">{li.quantity}</td>
                        <td className="px-4 py-3">{li.receivedQuantity}</td>
                        <td className="px-4 py-3">{formatINR(li.unitCost)}</td>
                        <td className="px-4 py-3 font-semibold">{formatINR(li.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-muted)]">Order Date</span>
                <span>{formatDate(po.orderDate + 'T00:00:00Z')}</span>
              </div>
              {po.expectedDeliveryDate && (
                <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-muted)]">Expected By</span>
                  <span>{formatDate(po.expectedDeliveryDate + 'T00:00:00Z')}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-muted)]">Subtotal</span>
                <span>{formatINR(po.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-muted)]">GST</span>
                <span>{formatINR(po.totalGst)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-base">
                <span>Total</span>
                <span className="text-[var(--color-primary)]">{formatINR(po.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={!!pendingStatus} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isCancelling ? 'Cancel Purchase Order?' : 'Update Status?'}
            </DialogTitle>
            <DialogDescription>
              {isCancelling
                ? `This will cancel ${po.poNumber}. This action cannot be undone.`
                : `Change status of ${po.poNumber} from "${PO_STATUS_LABELS[po.status]}" to "${pendingStatus ? PO_STATUS_LABELS[pendingStatus] : ''}"?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingStatus(null)}>
              No, go back
            </Button>
            <Button
              variant={isCancelling ? 'danger' : 'primary'}
              loading={updateStatus.isPending}
              onClick={handleConfirm}
            >
              {isCancelling ? 'Yes, Cancel PO' : 'Yes, Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
