import type { GSTSlab } from '@/lib/format'

export type FabricType =
  | 'Banarasi' | 'Bandhani' | 'Chanderi' | 'Chiffon' | 'Cotton'
  | 'Crepe' | 'Georgette' | 'Kanjivaram' | 'Linen' | 'Net'
  | 'Pochampally' | 'Silk' | 'Tussar' | 'Other'

export type ProductType =
  | 'Saree' | 'Suit' | 'Lehenga' | 'Dupatta'
  | 'Fabric' | 'Blouse' | 'Accessory' | 'Other'

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

export interface ProductImage {
  id: string
  url: string
  isPrimary: boolean
}

export interface Product {
  id: string
  sku: string
  name: string
  productType: ProductType
  categoryId: string
  fabricType: FabricType
  color: string
  pattern: string
  designCode?: string
  vendorId: string
  costPrice: number        // paise
  sellingPrice: number     // paise
  mrp?: number             // paise
  gstSlab: GSTSlab
  hsnCode: string
  quantityInStock: number
  lowStockThreshold: number
  stockStatus: StockStatus
  length?: number          // meters
  width?: number           // cm
  blouseIncluded?: boolean
  blouseLength?: number    // cm
  weight?: number          // grams
  images: ProductImage[]
  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateProductDto = Omit<Product, 'id' | 'stockStatus' | 'createdAt' | 'updatedAt'>
export type UpdateProductDto = Partial<CreateProductDto>
