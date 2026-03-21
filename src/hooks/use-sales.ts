'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesService } from '@/services/sales.service'
import type { Bill, CreateBillDto } from '@/types'

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (filters: object) => [...saleKeys.lists(), filters] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
  stats: () => [...saleKeys.all, 'stats', 'dashboard'] as const,
  byCustomer: (customerId: string) => [...saleKeys.all, 'customer', customerId] as const,
}

export function useSales(params: {
  page: number
  pageSize: number
  search?: string
  status?: string
  sortKey?: string
  sortDir?: 'asc' | 'desc'
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

export function useUpdateBillStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Bill['status'] }) =>
      salesService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: saleKeys.detail(id) })
      qc.invalidateQueries({ queryKey: saleKeys.lists() })
      qc.invalidateQueries({ queryKey: saleKeys.stats() })
    },
  })
}

export function useRecordPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string; amount: number; paymentMethod: string; note?: string }) =>
      salesService.recordPayment(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: saleKeys.detail(id) })
      qc.invalidateQueries({ queryKey: saleKeys.lists() })
      qc.invalidateQueries({ queryKey: saleKeys.stats() })
    },
  })
}

export function useCustomerBills(customerId: string) {
  return useQuery({
    queryKey: saleKeys.byCustomer(customerId),
    queryFn: () => salesService.listByCustomer(customerId),
    enabled: !!customerId,
  })
}
