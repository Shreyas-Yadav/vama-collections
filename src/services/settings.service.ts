import { apiClient } from './api-client'

export interface StoreSettings {
  id?: string
  storeName: string
  ownerName?: string
  phone?: string
  email?: string
  addressLine1?: string
  city?: string
  state: string
  pincode?: string
  gstin?: string
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  upiId?: string
  createdAt?: string
  updatedAt?: string
}

export const settingsService = {
  getStore(): Promise<StoreSettings> {
    return apiClient.get('/api/v1/settings/store')
  },

  saveStore(dto: StoreSettings): Promise<StoreSettings> {
    return apiClient.put('/api/v1/settings/store', dto)
  },
}
