import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types'
import type { PaginatedResponse } from '@/types/api'
import { USE_MOCK, apiClient } from './api-client'
import { mockCategories } from './mock/categories.mock'

export const categoriesService = {
  list(params: { page: number; pageSize: number; search?: string }): Promise<PaginatedResponse<Category>> {
    if (USE_MOCK) return mockCategories.list(params)
    return apiClient.get('/api/v1/categories', params as Record<string, unknown>)
  },

  getAll(): Promise<Category[]> {
    if (USE_MOCK) return mockCategories.getAll()
    return apiClient.get('/api/v1/categories/all')
  },

  getById(id: string): Promise<Category> {
    if (USE_MOCK) return mockCategories.getById(id)
    return apiClient.get(`/api/v1/categories/${id}`)
  },

  create(dto: CreateCategoryDto): Promise<Category> {
    if (USE_MOCK) return mockCategories.create(dto)
    return apiClient.post('/api/v1/categories', dto)
  },

  update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    if (USE_MOCK) return mockCategories.update(id, dto)
    return apiClient.patch(`/api/v1/categories/${id}`, dto)
  },

  delete(id: string): Promise<void> {
    if (USE_MOCK) return mockCategories.delete(id)
    return apiClient.delete(`/api/v1/categories/${id}`)
  },
}
