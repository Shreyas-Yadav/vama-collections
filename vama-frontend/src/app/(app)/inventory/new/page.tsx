import { PageHeader } from '@/components/layout/page-header'
import { ProductForm } from '@/features/inventory/product-form'

export default function NewProductPage() {
  return (
    <div>
      <PageHeader
        title="Add Product"
        description="Add a new product to your inventory"
      />
      <ProductForm />
    </div>
  )
}
