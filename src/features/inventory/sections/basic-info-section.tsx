'use client'

import type { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PRODUCT_TYPES } from '@/lib/constants'
import type { ProductFormValues } from '@/lib/validations/product.schema'
import type { Category } from '@/types'

interface BasicInfoSectionProps {
  register: UseFormRegister<ProductFormValues>
  watch: UseFormWatch<ProductFormValues>
  setValue: UseFormSetValue<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
  categories?: Category[]
}

export function BasicInfoSection({ register, watch, setValue, errors, categories }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="name" required>Product Name</Label>
          <Input id="name" {...register('name')} error={!!errors.name} className="mt-1" />
          {errors.name && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="sku" required>SKU</Label>
          <Input id="sku" {...register('sku')} error={!!errors.sku} className="mt-1" placeholder="e.g. SA-KJ-001" />
          {errors.sku && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.sku.message}</p>}
        </div>
        <div>
          <Label htmlFor="designCode">Design Code</Label>
          <Input id="designCode" {...register('designCode')} className="mt-1" />
        </div>
        <div>
          <Label required>Product Type</Label>
          <Select
            value={watch('productType')}
            onValueChange={(v) => setValue('productType', v, { shouldValidate: true })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.productType && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.productType.message}</p>}
        </div>
        <div>
          <Label required>Category</Label>
          <Select
            value={watch('categoryId')}
            onValueChange={(v) => setValue('categoryId', v, { shouldValidate: true })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.categoryId.message}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
