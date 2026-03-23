import type { PurchaseOrder, CreatePODto } from '@/types'
import type { PaginatedResponse } from '@/types/api'
import { USE_MOCK, apiClient } from './api-client'
import { mockPurchaseOrders } from './mock/purchase-orders.mock'

export const purchaseOrdersService = {
  list(params: {
    page: number
    pageSize: number
    search?: string
    status?: string
    sortKey?: string
    sortDir?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<PurchaseOrder>> {
    if (USE_MOCK) return mockPurchaseOrders.list(params)
    return apiClient.get('/api/v1/purchase-orders', params as Record<string, unknown>)
  },

  getById(id: string): Promise<PurchaseOrder> {
    if (USE_MOCK) return mockPurchaseOrders.getById(id)
    return apiClient.get(`/api/v1/purchase-orders/${id}`)
  },

  create(dto: CreatePODto): Promise<PurchaseOrder> {
    if (USE_MOCK) return mockPurchaseOrders.create(dto)
    return apiClient.post('/api/v1/purchase-orders', dto)
  },

  updateStatus(id: string, status: PurchaseOrder['status']): Promise<PurchaseOrder> {
    if (USE_MOCK) return mockPurchaseOrders.updateStatus(id, status)
    return apiClient.patch(`/api/v1/purchase-orders/${id}/status`, { status })
  },
}
