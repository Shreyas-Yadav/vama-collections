import { format, formatDistanceToNow, parseISO } from 'date-fns'

// ─── Money ────────────────────────────────────────────────────────────────────
// All monetary values are stored as integers in paise (1 INR = 100 paise).
// Never use floats for money arithmetic.

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Format paise as INR string — e.g. 150000 → "₹1,500.00" */
export function formatINR(paise: number): string {
  return inrFormatter.format(paise / 100)
}

/** Format paise as compact string — e.g. 1_50_000_00 → "₹1.5L" */
export function formatINRCompact(paise: number): string {
  const rupees = paise / 100
  if (rupees >= 10_000_000) return `₹${(rupees / 10_000_000).toFixed(2)}Cr`
  if (rupees >= 100_000) return `₹${(rupees / 100_000).toFixed(2)}L`
  if (rupees >= 1_000) return `₹${(rupees / 1_000).toFixed(1)}K`
  return formatINR(paise)
}

/** Convert rupees (float input from forms) to paise integer */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

/** Convert paise to rupees for form display */
export function paiToRupees(paise: number): number {
  return paise / 100
}

// ─── GST Math ─────────────────────────────────────────────────────────────────

export type GSTSlab = 0 | 5 | 12 | 18 | 28

export interface LineItemGST {
  gstSlab: GSTSlab
  taxableAmount: number    // paise, after discount
  cgst: number             // paise
  sgst: number             // paise
  igst: number             // paise (only for inter-state)
  lineTotal: number        // paise = taxableAmount + gst
}

export function calculateLineGST(
  taxableAmount: number,
  gstSlab: GSTSlab,
  isInterState: boolean,
  isGstEnabled = true,
): LineItemGST {
  if (!isGstEnabled) {
    return { gstSlab, taxableAmount, cgst: 0, sgst: 0, igst: 0, lineTotal: taxableAmount }
  }
  const gstAmount = Math.round((taxableAmount * gstSlab) / 100)
  if (isInterState) {
    return { gstSlab, taxableAmount, cgst: 0, sgst: 0, igst: gstAmount, lineTotal: taxableAmount + gstAmount }
  }
  const half = Math.round(gstAmount / 2)
  return { gstSlab, taxableAmount, cgst: half, sgst: gstAmount - half, igst: 0, lineTotal: taxableAmount + gstAmount }
}

export interface BillTotals {
  subtotal: number          // sum of taxable amounts (paise)
  totalDiscount: number     // paise
  totalCgst: number
  totalSgst: number
  totalIgst: number
  totalGst: number
  roundOff: number          // paise (-50 to +50)
  grandTotal: number        // paise
}

export interface BillLineInput {
  quantity: number
  unitPrice: number         // paise
  discountPercent: number   // 0-100
  gstSlab: GSTSlab
}

export function calculateBill(
  lines: BillLineInput[],
  isInterState: boolean,
  isGstEnabled = true,
): BillTotals {
  let subtotal = 0
  let totalDiscount = 0
  let totalCgst = 0
  let totalSgst = 0
  let totalIgst = 0

  for (const line of lines) {
    const gross = line.quantity * line.unitPrice
    const discount = Math.round((gross * line.discountPercent) / 100)
    const taxable = gross - discount
    const gst = calculateLineGST(taxable, line.gstSlab, isInterState, isGstEnabled)

    subtotal += taxable
    totalDiscount += discount
    totalCgst += gst.cgst
    totalSgst += gst.sgst
    totalIgst += gst.igst
  }

  const totalGst = totalCgst + totalSgst + totalIgst
  const rawTotal = subtotal + totalGst
  const roundOff = Math.round(rawTotal / 100) * 100 - rawTotal
  const grandTotal = rawTotal + roundOff

  return { subtotal, totalDiscount, totalCgst, totalSgst, totalIgst, totalGst, roundOff, grandTotal }
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(isoDate: string): string {
  return format(parseISO(isoDate), 'dd MMM yyyy')
}

export function formatDateTime(isoDate: string): string {
  return format(parseISO(isoDate), 'dd MMM yyyy, h:mm a')
}

export function formatRelative(isoDate: string): string {
  return formatDistanceToNow(parseISO(isoDate), { addSuffix: true })
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

// ─── Strings ──────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export function generateSKU(productType: string, fabricType: string, seq: number): string {
  const type = productType.slice(0, 2).toUpperCase()
  const fabric = fabricType.slice(0, 2).toUpperCase()
  return `${type}-${fabric}-${String(seq).padStart(3, '0')}`
}

export function generatePONumber(seq: number): string {
  const year = new Date().getFullYear()
  return `PO-${year}-${String(seq).padStart(4, '0')}`
}

export function generateBillNumber(seq: number): string {
  const year = new Date().getFullYear()
  return `VAMA-${year}-${String(seq).padStart(5, '0')}`
}
