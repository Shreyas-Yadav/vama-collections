import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types'
import type { PaginatedResponse } from '@/types/api'

const now = new Date().toISOString()

let customers: Customer[] = [
  {
    id: 'cu-1', name: 'Priya Sharma', phone: '9820112233', email: 'priya.sharma@gmail.com',
    city: 'Mumbai', state: 'Maharashtra', pincode: '400001',
    totalPurchaseValue: 48500000, totalOrders: 8, lastPurchaseDate: '2026-03-15T10:00:00Z',
    loyaltyPoints: 485, notes: 'Prefers Kanjivaram sarees', createdAt: now, updatedAt: now,
  },
  {
    id: 'cu-2', name: 'Anita Desai', phone: '9876543210',
    city: 'Pune', state: 'Maharashtra', pincode: '411001',
    totalPurchaseValue: 32000000, totalOrders: 5, lastPurchaseDate: '2026-03-10T14:00:00Z',
    loyaltyPoints: 320, createdAt: now, updatedAt: now,
  },
  {
    id: 'cu-3', name: 'Lakshmi Venkataraman', phone: '9444556677', email: 'lakshmi.v@gmail.com',
    city: 'Chennai', state: 'Tamil Nadu', pincode: '600001',
    totalPurchaseValue: 75000000, totalOrders: 12, lastPurchaseDate: '2026-03-18T11:00:00Z',
    loyaltyPoints: 750, notes: 'VIP customer, bridal purchases', createdAt: now, updatedAt: now,
  },
  {
    id: 'cu-4', name: 'Radha Krishnan', phone: '9741234567',
    city: 'Bangalore', state: 'Karnataka', pincode: '560001',
    totalPurchaseValue: 22000000, totalOrders: 6, lastPurchaseDate: '2026-02-28T16:00:00Z',
    loyaltyPoints: 220, createdAt: now, updatedAt: now,
  },
  {
    id: 'cu-5', name: 'Meera Agarwal', phone: '9911223344', email: 'meera.agarwal@gmail.com',
    city: 'Delhi', state: 'Delhi', pincode: '110001',
    gstin: '07AABCA1234B1Z5',
    totalPurchaseValue: 58000000, totalOrders: 10, lastPurchaseDate: '2026-03-20T09:00:00Z',
    loyaltyPoints: 580, notes: 'B2B customer', createdAt: now, updatedAt: now,
  },
]

let seq = customers.length + 1

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)
  return { data, total: items.length, page, pageSize, totalPages: Math.ceil(items.length / pageSize) }
}

export const mockCustomers = {
  list(params: { page: number; pageSize: number; search?: string }): Promise<PaginatedResponse<Customer>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...customers]
        if (params.search) {
          const s = params.search.toLowerCase()
          filtered = filtered.filter(
            (c) => c.name.toLowerCase().includes(s) || c.phone.includes(s),
          )
        }
        resolve(paginate(filtered, params.page, params.pageSize))
      }, 200)
    })
  },

  getById(id: string): Promise<Customer> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const c = customers.find((c) => c.id === id)
        if (!c) return reject(new Error('Customer not found'))
        resolve(c)
      }, 150)
    })
  },

  search(query: string): Promise<Customer[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const q = query.toLowerCase()
        resolve(
          customers
            .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
            .slice(0, 10),
        )
      }, 200)
    })
  },

  create(dto: CreateCustomerDto): Promise<Customer> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const customer: Customer = {
          ...dto,
          id: `cu-${++seq}`,
          totalPurchaseValue: 0,
          totalOrders: 0,
          loyaltyPoints: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        customers.push(customer)
        resolve(customer)
      }, 300)
    })
  },

  update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = customers.findIndex((c) => c.id === id)
        if (idx === -1) return reject(new Error('Customer not found'))
        customers[idx] = { ...customers[idx], ...dto, updatedAt: new Date().toISOString() }
        resolve(customers[idx])
      }, 300)
    })
  },

  delete(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        customers = customers.filter((c) => c.id !== id)
        resolve()
      }, 300)
    })
  },
}
