'use client'

import type { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProductFormValues } from '@/lib/validations/product.schema'
import type { Vendor } from '@/types'

interface StockVendorSectionProps {
  register: UseFormRegister<ProductFormValues>
  watch: UseFormWatch<ProductFormValues>
  setValue: UseFormSetValue<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
  vendors?: Vendor[]
}

export function StockVendorSection({ register, watch, setValue, errors, vendors }: StockVendorSectionProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Stock & Vendor</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Opening Stock Qty</Label>
          <Input
            type="number"
            {...register('quantityInStock', { valueAsNumber: true })}
            error={!!errors.quantityInStock}
            className="mt-1"
          />
        </div>
        <div>
          <Label required>Low Stock Alert Threshold</Label>
          <Input
            type="number"
            {...register('lowStockThreshold', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>
        <div>
          <Label required>Vendor / Supplier</Label>
          <Select
            value={watch('vendorId')}
            onValueChange={(v) => setValue('vendorId', v, { shouldValidate: true })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors?.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.vendorId && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.vendorId.message}</p>}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Switch
            checked={watch('isActive')}
            onCheckedChange={(v) => setValue('isActive', v)}
          />
          <Label>Active (visible in inventory)</Label>
        </div>
      </CardContent>
    </Card>
  )
}
