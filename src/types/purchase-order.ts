import type { GSTSlab } from '@/lib/format'

export type POStatus =
  | 'DRAFT' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED'

export interface POLineItem {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  receivedQuantity: number
  unitCost: number        // paise
  totalCost: number       // paise
  gstSlab: GSTSlab
  hsnCode: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  vendorId: string
  vendorName: string
  status: POStatus
  orderDate: string
  expectedDeliveryDate?: string
  receivedDate?: string
  lineItems: POLineItem[]
  subtotal: number        // paise
  totalGst: number        // paise
  totalAmount: number     // paise
  discountAmount: number  // paise
  notes?: string
  createdAt: string
  updatedAt: string
}

export type CreatePOLineItemDto = Omit<POLineItem, 'id' | 'productName' | 'sku' | 'totalCost' | 'receivedQuantity'>

export type CreatePODto = Omit<
  PurchaseOrder,
  'id' | 'poNumber' | 'vendorName' | 'createdAt' | 'updatedAt' | 'subtotal' | 'totalGst' | 'totalAmount' | 'lineItems'
> & {
  lineItems: CreatePOLineItemDto[]
}

export type UpdatePODto = Partial<Omit<CreatePODto, 'lineItems'>>
