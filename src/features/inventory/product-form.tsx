'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAllCategories } from '@/hooks/use-categories'
import { useAllVendors } from '@/hooks/use-vendors'
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-products'
import { useToast } from '@/providers/toast-provider'
import { rupeesToPaise, paiToRupees } from '@/lib/format'
import { FABRIC_TYPES, PRODUCT_TYPES, GST_SLABS, HSN_CODES } from '@/lib/constants'
import type { Product } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  productType: z.string().min(1, 'Product type is required'),
  categoryId: z.string().min(1, 'Category is required'),
  fabricType: z.string().min(1, 'Fabric type is required'),
  color: z.string().min(1, 'Color is required'),
  pattern: z.string().min(1, 'Pattern is required'),
  designCode: z.string().optional(),
  vendorId: z.string().min(1, 'Vendor is required'),
  costPriceRupees: z.number().positive('Enter a valid cost price'),
  sellingPriceRupees: z.number().positive('Enter a valid selling price'),
  mrpRupees: z.number().optional(),
  gstSlab: z.number(),
  hsnCode: z.string().min(1, 'HSN code is required'),
  quantityInStock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0),
  length: z.number().optional(),
  blouseIncluded: z.boolean().optional(),
  blouseLength: z.number().optional(),
  weight: z.number().optional(),
  tags: z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: categories } = useAllCategories()
  const { data: vendors } = useAllVendors()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          ...product,
          costPriceRupees: paiToRupees(product.costPrice),
          sellingPriceRupees: paiToRupees(product.sellingPrice),
          mrpRupees: product.mrp ? paiToRupees(product.mrp) : undefined,
          tags: product.tags.join(', '),
        }
      : {
          gstSlab: 5,
          quantityInStock: 0,
          lowStockThreshold: 5,
          isActive: true,
          blouseIncluded: false,
        },
  })

  const blouseIncluded = watch('blouseIncluded')
  const productType = watch('productType')

  const onSubmit = async (values: FormValues) => {
    const dto = {
      name: values.name,
      sku: values.sku,
      productType: values.productType as Product['productType'],
      categoryId: values.categoryId,
      fabricType: values.fabricType as Product['fabricType'],
      color: values.color,
      pattern: values.pattern,
      designCode: values.designCode || undefined,
      vendorId: values.vendorId,
      costPrice: rupeesToPaise(values.costPriceRupees),
      sellingPrice: rupeesToPaise(values.sellingPriceRupees),
      mrp: values.mrpRupees ? rupeesToPaise(values.mrpRupees) : undefined,
      gstSlab: values.gstSlab as Product['gstSlab'],
      hsnCode: values.hsnCode,
      quantityInStock: values.quantityInStock,
      lowStockThreshold: values.lowStockThreshold,
      length: values.length,
      blouseIncluded: values.blouseIncluded,
      blouseLength: values.blouseLength,
      weight: values.weight,
      tags: values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      images: product?.images ?? [],
      isActive: values.isActive,
    }

    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, dto })
        toast({ title: 'Product updated', variant: 'success' })
      } else {
        await createProduct.mutateAsync(dto)
        toast({ title: 'Product added', variant: 'success' })
      }
      router.push('/inventory')
    } catch {
      toast({ title: 'Something went wrong', variant: 'error' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {/* Basic Info */}
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

      {/* Fabric & Design */}
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

      {/* Pricing & GST */}
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

      {/* Stock */}
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
