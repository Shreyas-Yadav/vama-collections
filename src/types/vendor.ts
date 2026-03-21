export type VendorType = 'MANUFACTURER' | 'WHOLESALER' | 'DISTRIBUTOR' | 'OTHER'

export interface Vendor {
  id: string
  name: string
  contactPerson: string
  phone: string
  alternatePhone?: string
  email?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  gstin?: string
  panNumber?: string
  vendorType: VendorType
  creditPeriodDays: number
  notes?: string
  isActive: boolean
  totalPurchaseValue: number    // paise
  createdAt: string
  updatedAt: string
}

export type CreateVendorDto = Omit<Vendor, 'id' | 'totalPurchaseValue' | 'createdAt' | 'updatedAt'>
export type UpdateVendorDto = Partial<CreateVendorDto>
