'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  return (
    <div>
      <PageHeader
        title="New Purchase Order"
        description="Create a new purchase order for your vendors"
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Purchase Order Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--color-muted)]">
            The full purchase order form with dynamic line items will be built in the next sprint.
            This connects to the vendors and product catalog modules already in place.
          </p>
          <Button variant="outline" onClick={() => router.push('/purchase-orders')}>
            Back to Purchase Orders
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
