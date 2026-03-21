'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersService } from '@/services/customers.service'
import type { CreateCustomerDto, UpdateCustomerDto } from '@/types'

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: object) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  search: (q: string) => [...customerKeys.all, 'search', q] as const,
}

export function useCustomers(params: { page: number; pageSize: number; search?: string }) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customersService.list(params),
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersService.getById(id),
    enabled: !!id,
  })
}

export function useCustomerSearch(query: string) {
  return useQuery({
    queryKey: customerKeys.search(query),
    queryFn: () => customersService.search(query),
    enabled: query.length >= 2,
  })
}

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateCustomerDto) => customersService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.lists() }),
  })
}

export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCustomerDto }) =>
      customersService.update(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: customerKeys.detail(id) })
      qc.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => customersService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.lists() }),
  })
}
