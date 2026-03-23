'use client'

import { use } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { ProductForm } from '@/features/inventory/product-form'
import { useProduct } from '@/hooks/use-products'
import { Spinner } from '@/components/ui/spinner'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: product, isLoading } = useProduct(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Edit Product"
        description={product?.name}
      />
      {product && <ProductForm product={product} />}
    </div>
  )
}
