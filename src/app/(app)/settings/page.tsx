'use client'

import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/providers/toast-provider'
import { INDIAN_STATES } from '@/lib/constants'

interface StoreSettings {
  storeName: string
  ownerName: string
  phone: string
  email: string
  addressLine1: string
  city: string
  state: string
  pincode: string
  gstin: string
  bankName: string
  accountNumber: string
  ifscCode: string
  upiId: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { register, handleSubmit, watch, setValue } = useForm<StoreSettings>({
    defaultValues: {
      storeName: 'Vama Saree Centre',
      state: 'Maharashtra',
    },
  })

  const onSubmit = () => {
    toast({ title: 'Settings saved', variant: 'success' })
  }

  return (
    <div>
      <PageHeader title="Store Settings" description="Manage your store profile and configuration" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Store Profile</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label required>Store Name</Label>
              <Input {...register('storeName')} className="mt-1" />
            </div>
            <div>
              <Label>Owner Name</Label>
              <Input {...register('ownerName')} className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...register('phone')} className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input {...register('email')} type="email" className="mt-1" />
            </div>
            <div>
              <Label>GSTIN</Label>
              <Input {...register('gstin')} className="mt-1" placeholder="15-char GSTIN" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Address</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Input {...register('addressLine1')} className="mt-1" />
            </div>
            <div>
              <Label>City</Label>
              <Input {...register('city')} className="mt-1" />
            </div>
            <div>
              <Label>State</Label>
              <Select value={watch('state')} onValueChange={(v) => setValue('state', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pincode</Label>
              <Input {...register('pincode')} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payment Details (for invoices)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>UPI ID</Label>
              <Input {...register('upiId')} className="mt-1" placeholder="store@upi" />
            </div>
            <div>
              <Label>Bank Name</Label>
              <Input {...register('bankName')} className="mt-1" />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input {...register('accountNumber')} className="mt-1" />
            </div>
            <div>
              <Label>IFSC Code</Label>
              <Input {...register('ifscCode')} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Separator />
        <Button type="submit">Save Settings</Button>
      </form>
    </div>
  )
}
