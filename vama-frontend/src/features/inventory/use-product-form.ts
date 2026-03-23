'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useAllCategories } from '@/hooks/use-categories'
import { useAllVendors } from '@/hooks/use-vendors'
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-products'
import { useToast } from '@/providers/toast-provider'
import { rupeesToPaise, paiToRupees } from '@/lib/format'
import { productSchema, type ProductFormValues } from '@/lib/validations/product.schema'
import type { Product } from '@/types'

export function useProductForm(product?: Product) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: categories } = useAllCategories()
  const { data: vendors } = useAllVendors()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
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
          lowStockThreshold: 0,
          isActive: true,
          blouseIncluded: false,
        },
  })

  const onSubmit = async (values: ProductFormValues) => {
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

  return { ...form, onSubmit, categories, vendors }
}
