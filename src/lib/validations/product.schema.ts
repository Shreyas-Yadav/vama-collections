import { z } from 'zod'

export const productSchema = z.object({
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

export type ProductFormValues = z.infer<typeof productSchema>
