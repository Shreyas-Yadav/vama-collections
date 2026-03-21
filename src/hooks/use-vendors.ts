'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorsService } from '@/services/vendors.service'
import type { CreateVendorDto, UpdateVendorDto } from '@/types'

export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (filters: object) => [...vendorKeys.lists(), filters] as const,
  allList: () => [...vendorKeys.all, 'all'] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
}

export function useVendors(params: { page: number; pageSize: number; search?: string }) {
  return useQuery({
    queryKey: vendorKeys.list(params),
    queryFn: () => vendorsService.list(params),
  })
}

export function useAllVendors() {
  return useQuery({
    queryKey: vendorKeys.allList(),
    queryFn: () => vendorsService.getAll(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => vendorsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateVendorDto) => vendorsService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vendorKeys.lists() })
      qc.invalidateQueries({ queryKey: vendorKeys.allList() })
    },
  })
}

export function useUpdateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateVendorDto }) =>
      vendorsService.update(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: vendorKeys.detail(id) })
      qc.invalidateQueries({ queryKey: vendorKeys.lists() })
      qc.invalidateQueries({ queryKey: vendorKeys.allList() })
    },
  })
}

export function useDeleteVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vendorsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vendorKeys.lists() })
      qc.invalidateQueries({ queryKey: vendorKeys.allList() })
    },
  })
}
