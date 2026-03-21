import type { GSTSlab } from '@/lib/format'

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT' | 'MIXED'
export type BillStatus = 'DRAFT' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED'

export interface BillLineItem {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number        // paise
  discountPercent: number
  discountAmount: number   // paise
  taxableAmount: number    // paise
  cgst: number             // paise
  sgst: number             // paise
  igst: number             // paise
  lineTotal: number        // paise
  hsnCode: string
  gstSlab: GSTSlab
}

export interface Bill {
  id: string
  billNumber: string
  customerId?: string
  customerName: string
  customerPhone?: string
  customerGstin?: string
  status: BillStatus
  isInterState: boolean
  isGstEnabled: boolean
  lineItems: BillLineItem[]
  subtotal: number         // paise
  totalDiscount: number    // paise
  totalCgst: number        // paise
  totalSgst: number        // paise
  totalIgst: number        // paise
  totalGst: number         // paise
  roundOff: number         // paise
  grandTotal: number       // paise
  amountPaid: number       // paise
  balanceDue: number       // paise
  paymentMethod: PaymentMethod
  paymentDetails?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type CreateBillLineItemDto = Omit<BillLineItem, 'id' | 'discountAmount' | 'taxableAmount' | 'cgst' | 'sgst' | 'igst' | 'lineTotal'>

export type CreateBillDto = Omit<
  Bill,
  'id' | 'billNumber' | 'createdAt' | 'updatedAt'
  | 'subtotal' | 'totalDiscount' | 'totalCgst' | 'totalSgst' | 'totalIgst' | 'totalGst' | 'grandTotal' | 'balanceDue'
  | 'roundOff' | 'lineItems'
> & {
  lineItems: CreateBillLineItemDto[]
}
