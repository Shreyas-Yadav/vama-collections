'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseOrdersService } from '@/services/purchase-orders.service'
import type { CreatePODto, PurchaseOrder } from '@/types'

export const poKeys = {
  all: ['purchase-orders'] as const,
  lists: () => [...poKeys.all, 'list'] as const,
  list: (filters: object) => [...poKeys.lists(), filters] as const,
  details: () => [...poKeys.all, 'detail'] as const,
  detail: (id: string) => [...poKeys.details(), id] as const,
}

export function usePurchaseOrders(params: {
  page: number
  pageSize: number
  search?: string
  status?: string
}) {
  return useQuery({
    queryKey: poKeys.list(params),
    queryFn: () => purchaseOrdersService.list(params),
  })
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: poKeys.detail(id),
    queryFn: () => purchaseOrdersService.getById(id),
    enabled: !!id,
  })
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreatePODto) => purchaseOrdersService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: poKeys.lists() }),
  })
}

export function useUpdatePOStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PurchaseOrder['status'] }) =>
      purchaseOrdersService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: poKeys.detail(id) })
      qc.invalidateQueries({ queryKey: poKeys.lists() })
    },
  })
}
