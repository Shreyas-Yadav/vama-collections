import type { PurchaseOrder, CreatePODto } from '@/types'
import type { PaginatedResponse } from '@/types/api'
import { generatePONumber } from '@/lib/format'
import { addStock } from './products.mock'
import { sortItems } from './sort'

const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1', poNumber: 'PO-2026-0001', vendorId: 'v-1', vendorName: 'Shree Kanjivaram Silks',
    status: 'RECEIVED', orderDate: '2026-02-15', expectedDeliveryDate: '2026-03-01', receivedDate: '2026-02-28',
    lineItems: [
      { id: 'pol-1', productId: 'p-1', productName: 'Royal Crimson Kanjivaram Saree', sku: 'SA-KJ-001', quantity: 5, receivedQuantity: 5, unitCost: 1200000, totalCost: 6000000, gstSlab: 5, hsnCode: '5007' },
      { id: 'pol-2', productId: 'p-2', productName: 'Emerald Green Kanjivaram Saree', sku: 'SA-KJ-002', quantity: 3, receivedQuantity: 3, unitCost: 1500000, totalCost: 4500000, gstSlab: 5, hsnCode: '5007' },
    ],
    subtotal: 10500000, totalGst: 525000, totalAmount: 11025000, discountAmount: 0,
    createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-02-28T10:00:00Z',
  },
  {
    id: 'po-2', poNumber: 'PO-2026-0002', vendorId: 'v-3', vendorName: 'Surat Synthetic Traders',
    status: 'PARTIALLY_RECEIVED', orderDate: '2026-03-10', expectedDeliveryDate: '2026-03-25',
    lineItems: [
      { id: 'pol-3', productId: 'p-7', productName: 'Peach Chiffon Georgette Saree', sku: 'SA-GG-001', quantity: 10, receivedQuantity: 7, unitCost: 80000, totalCost: 800000, gstSlab: 12, hsnCode: '5407' },
      { id: 'pol-4', productId: 'p-9', productName: 'Pink Anarkali Suit', sku: 'SU-DS-001', quantity: 8, receivedQuantity: 8, unitCost: 150000, totalCost: 1200000, gstSlab: 12, hsnCode: '6211' },
    ],
    subtotal: 2000000, totalGst: 240000, totalAmount: 2240000, discountAmount: 0,
    createdAt: '2026-03-10T09:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'po-3', poNumber: 'PO-2026-0003', vendorId: 'v-2', vendorName: 'Banarasi Bhandar',
    status: 'SENT', orderDate: '2026-03-18', expectedDeliveryDate: '2026-04-05',
    lineItems: [
      { id: 'pol-5', productId: 'p-3', productName: 'Gold Woven Banarasi Saree', sku: 'SA-BA-001', quantity: 6, receivedQuantity: 0, unitCost: 1800000, totalCost: 10800000, gstSlab: 5, hsnCode: '5007' },
    ],
    subtotal: 10800000, totalGst: 540000, totalAmount: 11340000, discountAmount: 200000,
    createdAt: '2026-03-18T11:00:00Z', updatedAt: '2026-03-18T11:00:00Z',
  },
]

let seq = purchaseOrders.length + 1

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)
  return { data, total: items.length, page, pageSize, totalPages: Math.ceil(items.length / pageSize) }
}

export const mockPurchaseOrders = {
  list(params: {
    page: number
    pageSize: number
    search?: string
    status?: string
    sortKey?: string
    sortDir?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<PurchaseOrder>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...purchaseOrders]
        if (params.search) {
          const s = params.search.toLowerCase()
          filtered = filtered.filter(
            (po) =>
              po.poNumber.toLowerCase().includes(s) ||
              po.vendorName.toLowerCase().includes(s),
          )
        }
        if (params.status) filtered = filtered.filter((po) => po.status === params.status)
        filtered = sortItems(filtered as unknown as Record<string, unknown>[], params.sortKey ?? 'createdAt', params.sortDir ?? 'desc') as unknown as PurchaseOrder[]
        resolve(paginate(filtered, params.page, params.pageSize))
      }, 200)
    })
  },

  getById(id: string): Promise<PurchaseOrder> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const po = purchaseOrders.find((po) => po.id === id)
        if (!po) return reject(new Error('Purchase order not found'))
        resolve(po)
      }, 150)
    })
  },

  create(dto: CreatePODto): Promise<PurchaseOrder> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let subtotal = 0
        let totalGst = 0

        const lineItems = dto.lineItems.map((li, i) => {
          const totalCost = li.quantity * li.unitCost
          const gst = Math.round((totalCost * li.gstSlab) / 100)
          subtotal += totalCost
          totalGst += gst
          return {
            id: `pol-${Date.now()}-${i}`,
            productId: li.productId,
            productName: '',
            sku: '',
            quantity: li.quantity,
            receivedQuantity: 0,
            unitCost: li.unitCost,
            totalCost,
            gstSlab: li.gstSlab,
            hsnCode: li.hsnCode,
          }
        })

        const po: PurchaseOrder = {
          ...dto,
          lineItems,
          id: `po-${++seq}`,
          poNumber: generatePONumber(seq),
          vendorName: '',
          subtotal,
          totalGst,
          totalAmount: subtotal + totalGst - (dto.discountAmount ?? 0),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        purchaseOrders.push(po)
        resolve(po)
      }, 400)
    })
  },

  updateStatus(id: string, status: PurchaseOrder['status']): Promise<PurchaseOrder> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = purchaseOrders.findIndex((po) => po.id === id)
        if (idx === -1) return reject(new Error('PO not found'))
        purchaseOrders[idx] = {
          ...purchaseOrders[idx],
          status,
          receivedDate: status === 'RECEIVED' ? new Date().toISOString() : purchaseOrders[idx].receivedDate,
          updatedAt: new Date().toISOString(),
        }
        if (status === 'RECEIVED' || status === 'PARTIALLY_RECEIVED') {
          for (const li of purchaseOrders[idx].lineItems) {
            if (li.productId) addStock(li.productId, li.quantity)
          }
        }
        resolve(purchaseOrders[idx])
      }, 300)
    })
  },
}
