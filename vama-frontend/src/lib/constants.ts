export const GST_SLABS = [0, 5, 12, 18, 28] as const

export const FABRIC_TYPES = [
  'Banarasi', 'Bandhani', 'Chanderi', 'Chiffon', 'Cotton',
  'Crepe', 'Georgette', 'Kanjivaram', 'Linen', 'Net',
  'Pochampally', 'Silk', 'Tussar', 'Other',
] as const

export const PRODUCT_TYPES = [
  'Saree', 'Suit', 'Lehenga', 'Dupatta',
  'Fabric', 'Blouse', 'Accessory', 'Other',
] as const

export const VENDOR_TYPES = [
  'MANUFACTURER', 'WHOLESALER', 'DISTRIBUTOR', 'OTHER',
] as const

export const PO_STATUSES = [
  'DRAFT', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED',
] as const

export const BILL_STATUSES = [
  'DRAFT', 'PAID', 'PARTIALLY_PAID', 'CANCELLED',
] as const

export const PAYMENT_METHODS = [
  'CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'MIXED',
] as const

export const STOCK_STATUSES = [
  'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK',
] as const

/** Common Indian textile HSN codes */
export const HSN_CODES = [
  { code: '5007', description: 'Woven fabrics of silk (sarees, fabrics)' },
  { code: '5208', description: 'Woven fabrics of cotton' },
  { code: '5209', description: 'Woven fabrics of cotton (≥85%, >200g/m²)' },
  { code: '5407', description: 'Woven fabrics of synthetic filament yarn' },
  { code: '5408', description: 'Woven fabrics of artificial filament yarn' },
  { code: '5512', description: 'Woven fabrics of synthetic staple fibres (≥85%)' },
  { code: '5515', description: 'Woven fabrics of other synthetic staple fibres' },
  { code: '5516', description: 'Woven fabrics of artificial staple fibres' },
  { code: '6211', description: 'Tracksuits, ski suits, swimwear, suits' },
  { code: '6212', description: 'Blouses, shirts' },
  { code: '6214', description: 'Shawls, scarves, dupattas' },
  { code: '6217', description: 'Other made up clothing accessories' },
  { code: '6301', description: 'Blankets and travelling rugs' },
] as const

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Cash',
  UPI: 'UPI',
  CARD: 'Card',
  BANK_TRANSFER: 'Bank Transfer',
  CREDIT: 'Credit',
  MIXED: 'Mixed',
}

export const PO_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent to Vendor',
  PARTIALLY_RECEIVED: 'Partially Received',
  RECEIVED: 'Fully Received',
  CANCELLED: 'Cancelled',
}

export const BILL_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PAID: 'Paid',
  PARTIALLY_PAID: 'Partially Paid',
  CANCELLED: 'Cancelled',
}

export const VENDOR_TYPE_LABELS: Record<string, string> = {
  MANUFACTURER: 'Manufacturer',
  WHOLESALER: 'Wholesaler',
  DISTRIBUTOR: 'Distributor',
  OTHER: 'Other',
}

export const LOW_STOCK_DEFAULT_THRESHOLD = 5
export const PAGE_SIZE_DEFAULT = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/** Store state for GST intra-state determination */
export const STORE_STATE_DEFAULT = 'Maharashtra'
