import type { Product, CreateProductDto, UpdateProductDto } from '@/types'
import type { PaginatedResponse } from '@/types/api'
import { USE_MOCK, apiClient } from './api-client'
import { mockProducts } from './mock/products.mock'

interface ProductListParams {
  page: number
  pageSize: number
  search?: string
  categoryId?: string
  stockStatus?: string
  productType?: string
  vendorId?: string
}

export const productsService = {
  list(params: ProductListParams): Promise<PaginatedResponse<Product>> {
    if (USE_MOCK) return mockProducts.list(params)
    return apiClient.get('/api/v1/products', params as unknown as Record<string, unknown>)
  },

  getById(id: string): Promise<Product> {
    if (USE_MOCK) return mockProducts.getById(id)
    return apiClient.get(`/api/v1/products/${id}`)
  },

  search(query: string): Promise<Product[]> {
    if (USE_MOCK) return mockProducts.search(query)
    return apiClient.get('/api/v1/products/search', { q: query })
  },

  create(dto: CreateProductDto): Promise<Product> {
    if (USE_MOCK) return mockProducts.create(dto)
    return apiClient.post('/api/v1/products', dto)
  },

  update(id: string, dto: UpdateProductDto): Promise<Product> {
    if (USE_MOCK) return mockProducts.update(id, dto)
    return apiClient.patch(`/api/v1/products/${id}`, dto)
  },

  delete(id: string): Promise<void> {
    if (USE_MOCK) return mockProducts.delete(id)
    return apiClient.delete(`/api/v1/products/${id}`)
  },
}
