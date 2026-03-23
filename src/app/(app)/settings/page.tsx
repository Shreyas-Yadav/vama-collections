'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useStoreSettings, useSaveStoreSettings } from '@/hooks/use-settings'
import { useToast } from '@/providers/toast-provider'
import { INDIAN_STATES } from '@/lib/constants'

interface StoreSettingsForm {
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
  const { data, isLoading } = useStoreSettings()
  const saveSettings = useSaveStoreSettings()
  const { register, handleSubmit, watch, setValue, reset } = useForm<StoreSettingsForm>({
    defaultValues: {
      storeName: 'Vama Saree Centre',
      state: 'Maharashtra',
    },
  })

  useEffect(() => {
    if (!data) return
    reset({
      storeName: data.storeName ?? 'Vama Saree Centre',
      ownerName: data.ownerName ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      addressLine1: data.addressLine1 ?? '',
      city: data.city ?? '',
      state: data.state ?? 'Maharashtra',
      pincode: data.pincode ?? '',
      gstin: data.gstin ?? '',
      bankName: data.bankName ?? '',
      accountNumber: data.accountNumber ?? '',
      ifscCode: data.ifscCode ?? '',
      upiId: data.upiId ?? '',
    })
  }, [data, reset])

  const onSubmit = async (values: StoreSettingsForm) => {
    try {
      await saveSettings.mutateAsync(values)
      toast({ title: 'Settings saved', variant: 'success' })
    } catch {
      toast({ title: 'Failed to save settings', variant: 'error' })
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
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
        <Button type="submit" loading={saveSettings.isPending}>Save Settings</Button>
      </form>
    </div>
  )
}
