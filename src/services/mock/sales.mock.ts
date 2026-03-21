import type { Bill, CreateBillDto } from '@/types'
import type { PaginatedResponse } from '@/types/api'
import { generateBillNumber } from '@/lib/format'
import { calculateLineGST } from '@/lib/format'
import { deductStock } from './products.mock'

const now = new Date().toISOString()

let bills: Bill[] = [
  {
    id: 'b-1', billNumber: 'VAMA-2026-00001',
    customerId: 'cu-3', customerName: 'Lakshmi Venkataraman', customerPhone: '9444556677',
    status: 'PAID', isInterState: false, isGstEnabled: true,
    lineItems: [
      {
        id: 'bli-1', productId: 'p-1', productName: 'Royal Crimson Kanjivaram Saree', sku: 'SA-KJ-001',
        quantity: 1, unitPrice: 1800000, discountPercent: 0, discountAmount: 0,
        taxableAmount: 1800000, cgst: 45000, sgst: 45000, igst: 0, lineTotal: 1890000,
        hsnCode: '5007', gstSlab: 5,
      },
    ],
    subtotal: 1800000, totalDiscount: 0, totalCgst: 45000, totalSgst: 45000, totalIgst: 0,
    totalGst: 90000, roundOff: 0, grandTotal: 1890000, amountPaid: 1890000, balanceDue: 0,
    paymentMethod: 'UPI', paymentDetails: 'UPI-TXN-2026031801',
    createdAt: '2026-03-18T11:30:00Z', updatedAt: '2026-03-18T11:30:00Z',
  },
  {
    id: 'b-2', billNumber: 'VAMA-2026-00002',
    customerId: 'cu-5', customerName: 'Meera Agarwal', customerPhone: '9911223344',
    customerGstin: '07AABCA1234B1Z5',
    status: 'PAID', isInterState: true, isGstEnabled: true,
    lineItems: [
      {
        id: 'bli-2', productId: 'p-3', productName: 'Gold Woven Banarasi Saree', sku: 'SA-BA-001',
        quantity: 2, unitPrice: 2800000, discountPercent: 5, discountAmount: 280000,
        taxableAmount: 5320000, cgst: 0, sgst: 0, igst: 266000, lineTotal: 5586000,
        hsnCode: '5007', gstSlab: 5,
      },
    ],
    subtotal: 5320000, totalDiscount: 280000, totalCgst: 0, totalSgst: 0, totalIgst: 266000,
    totalGst: 266000, roundOff: 0, grandTotal: 5586000, amountPaid: 5586000, balanceDue: 0,
    paymentMethod: 'BANK_TRANSFER', paymentDetails: 'NEFT-TXN-2026032001',
    createdAt: '2026-03-20T09:30:00Z', updatedAt: '2026-03-20T09:30:00Z',
  },
  {
    id: 'b-3', billNumber: 'VAMA-2026-00003',
    customerName: 'Walk-in Customer', customerPhone: '9876543000',
    status: 'PAID', isInterState: false, isGstEnabled: true,
    lineItems: [
      {
        id: 'bli-3', productId: 'p-5', productName: 'Kerala Kasavu Cotton Saree', sku: 'SA-CT-001',
        quantity: 1, unitPrice: 85000, discountPercent: 0, discountAmount: 0,
        taxableAmount: 85000, cgst: 2125, sgst: 2125, igst: 0, lineTotal: 89250,
        hsnCode: '5208', gstSlab: 5,
      },
      {
        id: 'bli-4', productId: 'p-14', productName: 'Multicolor Silk Dupatta', sku: 'DU-SL-001',
        quantity: 2, unitPrice: 75000, discountPercent: 0, discountAmount: 0,
        taxableAmount: 150000, cgst: 3750, sgst: 3750, igst: 0, lineTotal: 157500,
        hsnCode: '6214', gstSlab: 5,
      },
    ],
    subtotal: 235000, totalDiscount: 0, totalCgst: 5875, totalSgst: 5875, totalIgst: 0,
    totalGst: 11750, roundOff: 0, grandTotal: 246750, amountPaid: 246750, balanceDue: 0,
    paymentMethod: 'CASH',
    createdAt: '2026-03-20T14:00:00Z', updatedAt: '2026-03-20T14:00:00Z',
  },
  {
    id: 'b-4', billNumber: 'VAMA-2026-00004',
    customerId: 'cu-1', customerName: 'Priya Sharma', customerPhone: '9820112233',
    status: 'PARTIALLY_PAID', isInterState: false, isGstEnabled: true,
    lineItems: [
      {
        id: 'bli-5', productId: 'p-11', productName: 'Bridal Red Lehenga Choli', sku: 'LH-BR-001',
        quantity: 1, unitPrice: 5500000, discountPercent: 0, discountAmount: 0,
        taxableAmount: 5500000, cgst: 330000, sgst: 330000, igst: 0, lineTotal: 6160000,
        hsnCode: '6211', gstSlab: 12,
      },
    ],
    subtotal: 5500000, totalDiscount: 0, totalCgst: 330000, totalSgst: 330000, totalIgst: 0,
    totalGst: 660000, roundOff: 0, grandTotal: 6160000, amountPaid: 3000000, balanceDue: 3160000,
    paymentMethod: 'MIXED', notes: 'Balance due on delivery',
    createdAt: '2026-03-15T10:30:00Z', updatedAt: '2026-03-15T10:30:00Z',
  },
]

let billSeq = bills.length + 1
let lineSeq = 100

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)
  return { data, total: items.length, page, pageSize, totalPages: Math.ceil(items.length / pageSize) }
}

export const mockSales = {
  list(params: {
    page: number
    pageSize: number
    search?: string
    status?: string
    from?: string
    to?: string
  }): Promise<PaginatedResponse<Bill>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...bills]
        if (params.search) {
          const s = params.search.toLowerCase()
          filtered = filtered.filter(
            (b) =>
              b.billNumber.toLowerCase().includes(s) ||
              b.customerName.toLowerCase().includes(s),
          )
        }
        if (params.status) filtered = filtered.filter((b) => b.status === params.status)
        // sort by newest first
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        resolve(paginate(filtered, params.page, params.pageSize))
      }, 200)
    })
  },

  getById(id: string): Promise<Bill> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const b = bills.find((b) => b.id === id)
        if (!b) return reject(new Error('Bill not found'))
        resolve(b)
      }, 150)
    })
  },

  create(dto: CreateBillDto): Promise<Bill> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { isInterState, isGstEnabled } = dto
        let subtotal = 0
        let totalDiscount = 0
        let totalCgst = 0
        let totalSgst = 0
        let totalIgst = 0

        const lineItems = dto.lineItems.map((li) => {
          const gross = li.quantity * li.unitPrice
          const discountAmount = Math.round((gross * li.discountPercent) / 100)
          const taxableAmount = gross - discountAmount
          const gst = calculateLineGST(taxableAmount, li.gstSlab, isInterState, isGstEnabled)
          subtotal += taxableAmount
          totalDiscount += discountAmount
          totalCgst += gst.cgst
          totalSgst += gst.sgst
          totalIgst += gst.igst
          return {
            id: `bli-${++lineSeq}`,
            productId: li.productId,
            productName: li.productName,
            sku: li.sku,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            discountPercent: li.discountPercent,
            discountAmount,
            taxableAmount,
            cgst: gst.cgst,
            sgst: gst.sgst,
            igst: gst.igst,
            lineTotal: gst.lineTotal,
            hsnCode: li.hsnCode,
            gstSlab: li.gstSlab,
          }
        })

        const totalGst = totalCgst + totalSgst + totalIgst
        const rawTotal = subtotal + totalGst
        const roundOff = Math.round(rawTotal / 100) * 100 - rawTotal
        const grandTotal = rawTotal + roundOff

        const bill: Bill = {
          ...dto,
          lineItems,
          id: `b-${++billSeq}`,
          billNumber: generateBillNumber(billSeq),
          subtotal,
          totalDiscount,
          totalCgst,
          totalSgst,
          totalIgst,
          totalGst,
          roundOff,
          grandTotal,
          balanceDue: grandTotal - dto.amountPaid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        bills.push(bill)
        for (const li of bill.lineItems) {
          if (li.productId) deductStock(li.productId, li.quantity)
        }
        resolve(bill)
      }, 400)
    })
  },

  updateStatus(id: string, status: Bill['status']): Promise<Bill> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = bills.findIndex((b) => b.id === id)
        if (idx === -1) return reject(new Error('Bill not found'))
        const updated = {
          ...bills[idx],
          status,
          amountPaid: status === 'PAID' ? bills[idx].grandTotal : bills[idx].amountPaid,
          balanceDue: status === 'PAID' ? 0 : bills[idx].balanceDue,
          updatedAt: new Date().toISOString(),
        }
        bills[idx] = updated
        resolve(updated)
      }, 300)
    })
  },

  recordPayment(id: string, dto: { amount: number; paymentMethod: string; note?: string }): Promise<Bill> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = bills.findIndex((b) => b.id === id)
        if (idx === -1) return reject(new Error('Bill not found'))
        const newAmountPaid = bills[idx].amountPaid + dto.amount
        const newBalanceDue = Math.max(0, bills[idx].grandTotal - newAmountPaid)
        const newStatus = newBalanceDue <= 0 ? 'PAID' : 'PARTIALLY_PAID'
        bills[idx] = {
          ...bills[idx],
          amountPaid: newAmountPaid,
          balanceDue: newBalanceDue,
          status: newStatus,
          paymentDetails: dto.note ?? bills[idx].paymentDetails,
          updatedAt: new Date().toISOString(),
        }
        resolve(bills[idx])
      }, 300)
    })
  },

  listByCustomer(customerId: string): Promise<Bill[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = bills
          .filter((b) => b.customerId === customerId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        resolve(result)
      }, 200)
    })
  },

  getDashboardStats(): Promise<{
    todaySales: number
    todayBills: number
    monthSales: number
    monthBills: number
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const today = new Date().toDateString()
        const month = new Date().getMonth()
        const year = new Date().getFullYear()

        const todayBills = bills.filter(
          (b) => new Date(b.createdAt).toDateString() === today && b.status !== 'CANCELLED',
        )
        const monthBills = bills.filter(
          (b) =>
            new Date(b.createdAt).getMonth() === month &&
            new Date(b.createdAt).getFullYear() === year &&
            b.status !== 'CANCELLED',
        )

        resolve({
          todaySales: todayBills.reduce((sum, b) => sum + b.grandTotal, 0),
          todayBills: todayBills.length,
          monthSales: monthBills.reduce((sum, b) => sum + b.grandTotal, 0),
          monthBills: monthBills.length,
        })
      }, 200)
    })
  },
}
