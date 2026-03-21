'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCreateVendor } from '@/hooks/use-vendors'
import { useToast } from '@/providers/toast-provider'
import { VENDOR_TYPES, VENDOR_TYPE_LABELS, INDIAN_STATES } from '@/lib/constants'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  phone: z.string().min(10, 'Enter valid phone'),
  alternatePhone: z.string().optional(),
  email: z.string().email('Enter valid email').optional().or(z.literal('')),
  addressLine1: z.string().min(2, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, 'Enter 6-digit pincode'),
  gstin: z.string().optional(),
  panNumber: z.string().optional(),
  vendorType: z.string().min(1, 'Vendor type is required'),
  creditPeriodDays: z.number().int().min(0),
  notes: z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export default function NewVendorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const createVendor = useCreateVendor()

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, creditPeriodDays: 30, vendorType: 'WHOLESALER' },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await createVendor.mutateAsync({
        ...values,
        vendorType: values.vendorType as 'MANUFACTURER' | 'WHOLESALER' | 'DISTRIBUTOR' | 'OTHER',
        alternatePhone: values.alternatePhone || undefined,
        email: values.email || undefined,
        addressLine2: values.addressLine2 || undefined,
        gstin: values.gstin || undefined,
        panNumber: values.panNumber || undefined,
        notes: values.notes || undefined,
      })
      toast({ title: 'Vendor added', variant: 'success' })
      router.push('/vendors')
    } catch {
      toast({ title: 'Something went wrong', variant: 'error' })
    }
  }

  return (
    <div>
      <PageHeader title="Add Vendor" description="Add a new supplier or vendor" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader><CardTitle>Vendor Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label required>Business Name</Label>
              <Input {...register('name')} error={!!errors.name} className="mt-1" />
              {errors.name && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.name.message}</p>}
            </div>
            <div>
              <Label required>Contact Person</Label>
              <Input {...register('contactPerson')} error={!!errors.contactPerson} className="mt-1" />
              {errors.contactPerson && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.contactPerson.message}</p>}
            </div>
            <div>
              <Label required>Phone</Label>
              <Input {...register('phone')} error={!!errors.phone} className="mt-1" placeholder="10-digit mobile" />
              {errors.phone && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.phone.message}</p>}
            </div>
            <div>
              <Label>Alternate Phone</Label>
              <Input {...register('alternatePhone')} className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input {...register('email')} type="email" error={!!errors.email} className="mt-1" />
              {errors.email && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.email.message}</p>}
            </div>
            <div>
              <Label required>Vendor Type</Label>
              <Select
                value={watch('vendorType')}
                onValueChange={(v) => setValue('vendorType', v, { shouldValidate: true })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{VENDOR_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label required>Credit Period (days)</Label>
              <Input
                type="number"
                {...register('creditPeriodDays', { valueAsNumber: true })}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Address</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label required>Address Line 1</Label>
              <Input {...register('addressLine1')} error={!!errors.addressLine1} className="mt-1" />
              {errors.addressLine1 && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.addressLine1.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label>Address Line 2</Label>
              <Input {...register('addressLine2')} className="mt-1" />
            </div>
            <div>
              <Label required>City</Label>
              <Input {...register('city')} error={!!errors.city} className="mt-1" />
              {errors.city && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.city.message}</p>}
            </div>
            <div>
              <Label required>State</Label>
              <Select
                value={watch('state')}
                onValueChange={(v) => setValue('state', v, { shouldValidate: true })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.state && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.state.message}</p>}
            </div>
            <div>
              <Label required>Pincode</Label>
              <Input {...register('pincode')} error={!!errors.pincode} className="mt-1" placeholder="6 digits" />
              {errors.pincode && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.pincode.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>GST & Tax Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>GSTIN</Label>
              <Input {...register('gstin')} className="mt-1" placeholder="15-char GSTIN" />
            </div>
            <div>
              <Label>PAN Number</Label>
              <Input {...register('panNumber')} className="mt-1" placeholder="ABCDE1234F" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Textarea {...register('notes')} rows={3} placeholder="Any additional notes about this vendor..." />
            <div className="flex items-center gap-3">
              <Switch checked={watch('isActive')} onCheckedChange={(v) => setValue('isActive', v)} />
              <Label>Active</Label>
            </div>
          </CardContent>
        </Card>

        <Separator />
        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting}>Add Vendor</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
