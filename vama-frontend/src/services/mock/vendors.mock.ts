import type { Vendor, CreateVendorDto, UpdateVendorDto } from '@/types'
import type { PaginatedResponse } from '@/types/api'
import { sortItems } from './sort'

const now = new Date().toISOString()

let vendors: Vendor[] = [
  {
    id: 'v-1', name: 'Shree Kanjivaram Silks', contactPerson: 'Rajan Subramaniam',
    phone: '9884123456', email: 'rajan@kanjivaramsilks.com',
    addressLine1: '45 Silk Weavers Street', city: 'Kanchipuram', state: 'Tamil Nadu', pincode: '631501',
    gstin: '33AABCS1234B1Z5', vendorType: 'MANUFACTURER', creditPeriodDays: 30,
    isActive: true, totalPurchaseValue: 48500000, createdAt: now, updatedAt: now,
  },
  {
    id: 'v-2', name: 'Banarasi Bhandar', contactPerson: 'Mohammad Iqbal',
    phone: '9415234567', email: 'iqbal@banarasibhandar.com',
    addressLine1: 'Shop 12, Vishwanath Gali', city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001',
    gstin: '09AABCB5678C1Z3', vendorType: 'WHOLESALER', creditPeriodDays: 15,
    isActive: true, totalPurchaseValue: 32000000, createdAt: now, updatedAt: now,
  },
  {
    id: 'v-3', name: 'Surat Synthetic Traders', contactPerson: 'Praful Patel',
    phone: '9898456789', email: 'praful@suratsynthetic.com',
    addressLine1: 'Plot 7, Textile Market', city: 'Surat', state: 'Gujarat', pincode: '395003',
    gstin: '24AABCS9012D1Z1', vendorType: 'DISTRIBUTOR', creditPeriodDays: 45,
    isActive: true, totalPurchaseValue: 27500000, createdAt: now, updatedAt: now,
  },
  {
    id: 'v-4', name: 'Mumbai Cotton House', contactPerson: 'Suresh Gala',
    phone: '9820345678', addressLine1: '34 Cotton Exchange Road', city: 'Mumbai',
    state: 'Maharashtra', pincode: '400002', vendorType: 'WHOLESALER', creditPeriodDays: 21,
    isActive: true, totalPurchaseValue: 19000000, createdAt: now, updatedAt: now,
  },
  {
    id: 'v-5', name: 'Jaipur Bandhani Works', contactPerson: 'Ramesh Bairwa',
    phone: '9414567890', email: 'ramesh@jaipurbandhani.com',
    addressLine1: 'Near Johari Bazaar', city: 'Jaipur', state: 'Rajasthan', pincode: '302003',
    gstin: '08AABCJ3456E1Z9', vendorType: 'MANUFACTURER', creditPeriodDays: 30,
    isActive: true, totalPurchaseValue: 15500000, createdAt: now, updatedAt: now,
  },
]

let seq = vendors.length + 1

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)
  return { data, total: items.length, page, pageSize, totalPages: Math.ceil(items.length / pageSize) }
}

export const mockVendors = {
  list(params: { page: number; pageSize: number; search?: string; sortKey?: string; sortDir?: 'asc' | 'desc' }): Promise<PaginatedResponse<Vendor>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...vendors]
        if (params.search) {
          const s = params.search.toLowerCase()
          filtered = filtered.filter((v) => v.name.toLowerCase().includes(s) || v.city.toLowerCase().includes(s))
        }
        filtered = sortItems(filtered as unknown as Record<string, unknown>[], params.sortKey ?? 'name', params.sortDir ?? 'asc') as unknown as Vendor[]
        resolve(paginate(filtered, params.page, params.pageSize))
      }, 200)
    })
  },

  getById(id: string): Promise<Vendor> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const v = vendors.find((v) => v.id === id)
        if (!v) return reject(new Error('Vendor not found'))
        resolve(v)
      }, 150)
    })
  },

  getAll(): Promise<Vendor[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...vendors]), 150)
    })
  },

  create(dto: CreateVendorDto): Promise<Vendor> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const vendor: Vendor = {
          ...dto,
          id: `v-${++seq}`,
          totalPurchaseValue: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        vendors.push(vendor)
        resolve(vendor)
      }, 300)
    })
  },

  update(id: string, dto: UpdateVendorDto): Promise<Vendor> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = vendors.findIndex((v) => v.id === id)
        if (idx === -1) return reject(new Error('Vendor not found'))
        vendors[idx] = { ...vendors[idx], ...dto, updatedAt: new Date().toISOString() }
        resolve(vendors[idx])
      }, 300)
    })
  },

  delete(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        vendors = vendors.filter((v) => v.id !== id)
        resolve()
      }, 300)
    })
  },
}
