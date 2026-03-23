export interface Customer {
  id: string
  name: string
  phone: string
  alternatePhone?: string
  email?: string
  addressLine1?: string
  city?: string
  state?: string
  pincode?: string
  gstin?: string
  totalPurchaseValue: number    // paise
  totalOrders: number
  lastPurchaseDate?: string
  loyaltyPoints: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export type CreateCustomerDto = Omit<
  Customer,
  'id' | 'totalPurchaseValue' | 'totalOrders' | 'lastPurchaseDate' | 'loyaltyPoints' | 'createdAt' | 'updatedAt'
>
export type UpdateCustomerDto = Partial<CreateCustomerDto>
