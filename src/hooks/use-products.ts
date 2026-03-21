'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsService } from '@/services/products.service'
import type { CreateProductDto, UpdateProductDto } from '@/types'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: object) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (q: string) => [...productKeys.all, 'search', q] as const,
}

export function useProducts(params: {
  page: number
  pageSize: number
  search?: string
  categoryId?: string
  stockStatus?: string
  productType?: string
  vendorId?: string
}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsService.list(params),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsService.getById(id),
    enabled: !!id,
  })
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => productsService.search(query),
    enabled: query.length >= 2,
    staleTime: 30_000,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateProductDto) => productsService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists() }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
      productsService.update(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: productKeys.detail(id) })
      qc.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.lists() }),
  })
}
