import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types'
import type { PaginatedResponse } from '@/types/api'
import { USE_MOCK, apiClient } from './api-client'
import { mockCustomers } from './mock/customers.mock'

export const customersService = {
  list(params: { page: number; pageSize: number; search?: string; sortKey?: string; sortDir?: 'asc' | 'desc' }): Promise<PaginatedResponse<Customer>> {
    if (USE_MOCK) return mockCustomers.list(params)
    return apiClient.get('/api/v1/customers', params as Record<string, unknown>)
  },

  getById(id: string): Promise<Customer> {
    if (USE_MOCK) return mockCustomers.getById(id)
    return apiClient.get(`/api/v1/customers/${id}`)
  },

  search(query: string): Promise<Customer[]> {
    if (USE_MOCK) return mockCustomers.search(query)
    return apiClient.get('/api/v1/customers/search', { q: query })
  },

  create(dto: CreateCustomerDto): Promise<Customer> {
    if (USE_MOCK) return mockCustomers.create(dto)
    return apiClient.post('/api/v1/customers', dto)
  },

  update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    if (USE_MOCK) return mockCustomers.update(id, dto)
    return apiClient.patch(`/api/v1/customers/${id}`, dto)
  },

  delete(id: string): Promise<void> {
    if (USE_MOCK) return mockCustomers.delete(id)
    return apiClient.delete(`/api/v1/customers/${id}`)
  },
}
