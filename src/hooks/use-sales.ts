'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesService } from '@/services/sales.service'
import type { CreateBillDto } from '@/types'

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (filters: object) => [...saleKeys.lists(), filters] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
  stats: () => [...saleKeys.all, 'stats', 'dashboard'] as const,
}

export function useSales(params: {
  page: number
  pageSize: number
  search?: string
  status?: string
}) {
  return useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => salesService.list(params),
  })
}

export function useSale(id: string) {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => salesService.getById(id),
    enabled: !!id,
  })
}

export function useDashboardStats() {
  return useQuery({
    queryKey: saleKeys.stats(),
    queryFn: () => salesService.getDashboardStats(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateBillDto) => salesService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: saleKeys.lists() })
      qc.invalidateQueries({ queryKey: saleKeys.stats() })
    },
  })
}
