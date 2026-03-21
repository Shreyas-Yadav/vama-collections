'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories.service'
import type { CreateCategoryDto, UpdateCategoryDto } from '@/types'

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: object) => [...categoryKeys.lists(), filters] as const,
  allList: () => [...categoryKeys.all, 'all'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

export function useCategories(params: { page: number; pageSize: number; search?: string }) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoriesService.list(params),
  })
}

export function useAllCategories() {
  return useQuery({
    queryKey: categoryKeys.allList(),
    queryFn: () => categoriesService.getAll(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesService.getById(id),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateCategoryDto) => categoriesService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() })
      qc.invalidateQueries({ queryKey: categoryKeys.allList() })
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDto }) =>
      categoriesService.update(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: categoryKeys.detail(id) })
      qc.invalidateQueries({ queryKey: categoryKeys.lists() })
      qc.invalidateQueries({ queryKey: categoryKeys.allList() })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() })
      qc.invalidateQueries({ queryKey: categoryKeys.allList() })
    },
  })
}
