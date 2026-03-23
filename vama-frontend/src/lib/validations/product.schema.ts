import { z } from 'zod'

const requiredSelect = (message: string) =>
  z.string({
    error: (issue) => issue.input === undefined ? message : 'Invalid input',
  }).min(1, message)

export const productSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100, 'Product name cannot exceed 100 characters'),
  sku: z.string().min(1, 'SKU is required'),
  productType: requiredSelect('Product type is required'),
  categoryId: requiredSelect('Category is required'),
  fabricType: requiredSelect('Fabric type is required'),
  color: z.string().min(1, 'Color is required').max(50, 'Color cannot exceed 50 characters'),
  pattern: z.string().min(1, 'Pattern is required').max(50, 'Pattern cannot exceed 50 characters'),
  designCode: z.string().max(50, 'Design code cannot exceed 50 characters').optional(),
  vendorId: requiredSelect('Vendor is required'),
  costPriceRupees: z.number().min(0, 'Price must be a positive number'),
  sellingPriceRupees: z.number().min(0, 'Price must be a positive number'),
  mrpRupees: z.number().min(0, 'Price must be a positive number').optional(),
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
