'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useCustomer } from '@/hooks/use-customers'
import { formatINR, formatDate } from '@/lib/format'

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between py-2 border-b border-[var(--color-border)] last:border-0">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: customer, isLoading } = useCustomer(id)

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!customer) return <p className="text-center py-20 text-[var(--color-muted)]">Customer not found</p>

  return (
    <div>
      <PageHeader
        title={customer.name}
        description={customer.phone}
        action={
          <Button variant="outline" onClick={() => router.push('/customers')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
          <CardContent>
            <DetailRow label="Name" value={customer.name} />
            <DetailRow label="Phone" value={customer.phone} />
            <DetailRow label="Alternate Phone" value={customer.alternatePhone} />
            <DetailRow label="Email" value={customer.email} />
            <DetailRow label="GSTIN (B2B)" value={customer.gstin} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Purchase History</CardTitle></CardHeader>
          <CardContent>
            <DetailRow label="Total Orders" value={String(customer.totalOrders)} />
            <DetailRow label="Total Purchases" value={formatINR(customer.totalPurchaseValue)} />
            <DetailRow label="Loyalty Points" value={String(customer.loyaltyPoints)} />
            <DetailRow label="Last Purchase" value={customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : undefined} />
            <DetailRow label="Member Since" value={formatDate(customer.createdAt)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
