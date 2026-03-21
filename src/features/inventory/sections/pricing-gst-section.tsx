'use client'

import type { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GST_SLABS, HSN_CODES } from '@/lib/constants'
import type { ProductFormValues } from '@/lib/validations/product.schema'

interface PricingGstSectionProps {
  register: UseFormRegister<ProductFormValues>
  watch: UseFormWatch<ProductFormValues>
  setValue: UseFormSetValue<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
}

export function PricingGstSection({ register, watch, setValue, errors }: PricingGstSectionProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Pricing & GST</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Cost Price (₹)</Label>
          <Input
            type="number"
            step="0.01"
            {...register('costPriceRupees', { valueAsNumber: true })}
            error={!!errors.costPriceRupees}
            className="mt-1"
            placeholder="0.00"
          />
          {errors.costPriceRupees && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.costPriceRupees.message}</p>}
        </div>
        <div>
          <Label required>Selling Price (₹)</Label>
          <Input
            type="number"
            step="0.01"
            {...register('sellingPriceRupees', { valueAsNumber: true })}
            error={!!errors.sellingPriceRupees}
            className="mt-1"
            placeholder="0.00"
          />
          {errors.sellingPriceRupees && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.sellingPriceRupees.message}</p>}
        </div>
        <div>
          <Label>MRP (₹)</Label>
          <Input
            type="number"
            step="0.01"
            {...register('mrpRupees', { valueAsNumber: true })}
            className="mt-1"
            placeholder="Optional"
          />
        </div>
        <div>
          <Label required>GST Slab</Label>
          <Select
            value={String(watch('gstSlab') ?? 5)}
            onValueChange={(v) => setValue('gstSlab', Number(v))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GST_SLABS.map((s) => <SelectItem key={s} value={String(s)}>{s}%</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label required>HSN Code</Label>
          <Select
            value={watch('hsnCode')}
            onValueChange={(v) => setValue('hsnCode', v, { shouldValidate: true })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select HSN code" />
            </SelectTrigger>
            <SelectContent>
              {HSN_CODES.map((h) => (
                <SelectItem key={h.code} value={h.code}>
                  {h.code} — {h.description.slice(0, 40)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.hsnCode && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.hsnCode.message}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
