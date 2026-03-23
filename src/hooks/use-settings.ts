'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsService, type StoreSettings } from '@/services/settings.service'

export const settingsKeys = {
  all: ['settings'] as const,
  store: () => [...settingsKeys.all, 'store'] as const,
}

export function useStoreSettings() {
  return useQuery({
    queryKey: settingsKeys.store(),
    queryFn: () => settingsService.getStore(),
  })
}

export function useSaveStoreSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: StoreSettings) => settingsService.saveStore(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKeys.store() }),
  })
}
