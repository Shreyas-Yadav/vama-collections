import type { Bill, CreateBillDto } from '@/types'
import type { PaginatedResponse } from '@/types/api'
import { USE_MOCK, apiClient } from './api-client'
import { mockSales } from './mock/sales.mock'

interface BillListParams {
  page: number
  pageSize: number
  search?: string
  status?: string
  from?: string
  to?: string
}

export const salesService = {
  list(params: BillListParams): Promise<PaginatedResponse<Bill>> {
    if (USE_MOCK) return mockSales.list(params)
    return apiClient.get('/api/v1/bills', params as unknown as Record<string, unknown>)
  },

  getById(id: string): Promise<Bill> {
    if (USE_MOCK) return mockSales.getById(id)
    return apiClient.get(`/api/v1/bills/${id}`)
  },

  create(dto: CreateBillDto): Promise<Bill> {
    if (USE_MOCK) return mockSales.create(dto)
    return apiClient.post('/api/v1/bills', dto)
  },

  updateStatus(id: string, status: Bill['status']): Promise<Bill> {
    if (USE_MOCK) return mockSales.updateStatus(id, status)
    return apiClient.patch(`/api/v1/bills/${id}/status`, { status })
  },

  recordPayment(id: string, dto: { amount: number; paymentMethod: string; note?: string }): Promise<Bill> {
    if (USE_MOCK) return mockSales.recordPayment(id, dto)
    return apiClient.patch(`/api/v1/bills/${id}/payment`, dto)
  },

  listByCustomer(customerId: string): Promise<Bill[]> {
    if (USE_MOCK) return mockSales.listByCustomer(customerId)
    return apiClient.get('/api/v1/bills', { customerId })
  },

  getDashboardStats(): Promise<{
    todaySales: number
    todayBills: number
    monthSales: number
    monthBills: number
  }> {
    if (USE_MOCK) return mockSales.getDashboardStats()
    return apiClient.get('/api/v1/bills/stats/dashboard')
  },
}
