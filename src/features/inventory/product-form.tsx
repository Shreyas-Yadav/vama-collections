'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useProductForm } from './use-product-form'
import { BasicInfoSection } from './sections/basic-info-section'
import { FabricDesignSection } from './sections/fabric-design-section'
import { PricingGstSection } from './sections/pricing-gst-section'
import { StockVendorSection } from './sections/stock-vendor-section'
import type { Product } from '@/types'

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const { control, register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, onSubmit, categories, vendors } = useProductForm(product)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <BasicInfoSection control={control} register={register} watch={watch} setValue={setValue} errors={errors} categories={categories} />
      <FabricDesignSection register={register} watch={watch} setValue={setValue} errors={errors} />
      <PricingGstSection control={control} register={register} watch={watch} setValue={setValue} errors={errors} />
      <StockVendorSection register={register} watch={watch} setValue={setValue} errors={errors} vendors={vendors} />

      <Separator />

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting}>
          {product ? 'Save Changes' : 'Add Product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
