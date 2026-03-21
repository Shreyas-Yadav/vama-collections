import type { Vendor, CreateVendorDto, UpdateVendorDto } from '@/types'
import type { PaginatedResponse } from '@/types/api'
import { USE_MOCK, apiClient } from './api-client'
import { mockVendors } from './mock/vendors.mock'

export const vendorsService = {
  list(params: { page: number; pageSize: number; search?: string; sortKey?: string; sortDir?: 'asc' | 'desc' }): Promise<PaginatedResponse<Vendor>> {
    if (USE_MOCK) return mockVendors.list(params)
    return apiClient.get('/api/v1/vendors', params as Record<string, unknown>)
  },

  getAll(): Promise<Vendor[]> {
    if (USE_MOCK) return mockVendors.getAll()
    return apiClient.get('/api/v1/vendors/all')
  },

  getById(id: string): Promise<Vendor> {
    if (USE_MOCK) return mockVendors.getById(id)
    return apiClient.get(`/api/v1/vendors/${id}`)
  },

  create(dto: CreateVendorDto): Promise<Vendor> {
    if (USE_MOCK) return mockVendors.create(dto)
    return apiClient.post('/api/v1/vendors', dto)
  },

  update(id: string, dto: UpdateVendorDto): Promise<Vendor> {
    if (USE_MOCK) return mockVendors.update(id, dto)
    return apiClient.patch(`/api/v1/vendors/${id}`, dto)
  },

  delete(id: string): Promise<void> {
    if (USE_MOCK) return mockVendors.delete(id)
    return apiClient.delete(`/api/v1/vendors/${id}`)
  },
}
