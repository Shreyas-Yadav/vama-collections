'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { useVendor } from '@/hooks/use-vendors'
import { formatINR, formatDate } from '@/lib/format'
import { VENDOR_TYPE_LABELS } from '@/lib/constants'

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between py-2 border-b border-[var(--color-border)] last:border-0">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: vendor, isLoading } = useVendor(id)

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!vendor) return <p className="text-center py-20 text-[var(--color-muted)]">Vendor not found</p>

  return (
    <div>
      <PageHeader
        title={vendor.name}
        description={VENDOR_TYPE_LABELS[vendor.vendorType]}
        action={
          <Button variant="outline" onClick={() => router.push('/vendors')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
          <CardContent>
            <DetailRow label="Contact Person" value={vendor.contactPerson} />
            <DetailRow label="Phone" value={vendor.phone} />
            <DetailRow label="Alternate Phone" value={vendor.alternatePhone} />
            <DetailRow label="Email" value={vendor.email} />
            <DetailRow label="Credit Period" value={`${vendor.creditPeriodDays} days`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Address & Tax</CardTitle></CardHeader>
          <CardContent>
            <DetailRow label="Address" value={[vendor.addressLine1, vendor.addressLine2].filter(Boolean).join(', ')} />
            <DetailRow label="City" value={vendor.city} />
            <DetailRow label="State" value={vendor.state} />
            <DetailRow label="Pincode" value={vendor.pincode} />
            <DetailRow label="GSTIN" value={vendor.gstin} />
            <DetailRow label="PAN" value={vendor.panNumber} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Purchase History</CardTitle></CardHeader>
          <CardContent>
            <DetailRow label="Total Purchases" value={formatINR(vendor.totalPurchaseValue)} />
            <DetailRow label="Status" value={vendor.isActive ? 'Active' : 'Inactive'} />
            <DetailRow label="Member Since" value={formatDate(vendor.createdAt)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
