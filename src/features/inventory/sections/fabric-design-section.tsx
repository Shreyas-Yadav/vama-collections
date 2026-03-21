'use client'

import type { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FABRIC_TYPES } from '@/lib/constants'
import type { ProductFormValues } from '@/lib/validations/product.schema'

interface FabricDesignSectionProps {
  register: UseFormRegister<ProductFormValues>
  watch: UseFormWatch<ProductFormValues>
  setValue: UseFormSetValue<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
}

export function FabricDesignSection({ register, watch, setValue, errors }: FabricDesignSectionProps) {
  const blouseIncluded = watch('blouseIncluded')
  const productType = watch('productType')

  return (
    <Card>
      <CardHeader><CardTitle>Fabric & Design</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Fabric Type</Label>
          <Select
            value={watch('fabricType')}
            onValueChange={(v) => setValue('fabricType', v, { shouldValidate: true })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select fabric" />
            </SelectTrigger>
            <SelectContent>
              {FABRIC_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.fabricType && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.fabricType.message}</p>}
        </div>
        <div>
          <Label required>Color</Label>
          <Input id="color" {...register('color')} error={!!errors.color} className="mt-1" placeholder="e.g. Deep Crimson" />
          {errors.color && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.color.message}</p>}
        </div>
        <div>
          <Label required>Pattern</Label>
          <Input id="pattern" {...register('pattern')} error={!!errors.pattern} className="mt-1" placeholder="e.g. Floral Zari" />
        </div>
        {(productType === 'Saree' || productType === 'Fabric') && (
          <div>
            <Label>Length (meters)</Label>
            <Input
              type="number"
              step="0.1"
              {...register('length', { valueAsNumber: true })}
              className="mt-1"
            />
          </div>
        )}
        {productType === 'Saree' && (
          <>
            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={!!blouseIncluded}
                onCheckedChange={(v) => setValue('blouseIncluded', v)}
              />
              <Label>Blouse Included</Label>
            </div>
            {blouseIncluded && (
              <div>
                <Label>Blouse Length (cm)</Label>
                <Input
                  type="number"
                  {...register('blouseLength', { valueAsNumber: true })}
                  className="mt-1"
                  placeholder="80"
                />
              </div>
            )}
          </>
        )}
        <div>
          <Label>Weight (grams)</Label>
          <Input type="number" {...register('weight', { valueAsNumber: true })} className="mt-1" />
        </div>
        <div>
          <Label>Tags</Label>
          <Input
            {...register('tags')}
            className="mt-1"
            placeholder="bridal, zari, kanjivaram (comma separated)"
          />
        </div>
      </CardContent>
    </Card>
  )
}
