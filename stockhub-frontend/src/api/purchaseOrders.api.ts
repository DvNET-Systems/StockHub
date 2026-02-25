import client from './client'
import type { CreatePurchaseOrderRequest, PurchaseOrderResponse } from '../types'

export const purchaseOrdersApi = {
  getAll: async (): Promise<PurchaseOrderResponse[]> => {
    const res = await client.get<PurchaseOrderResponse[]>('/purchase-orders')
    return res.data
  },

  getById: async (id: number): Promise<PurchaseOrderResponse> => {
    const res = await client.get<PurchaseOrderResponse>(`/purchase-orders/${id}`)
    return res.data
  },

  create: async (data: CreatePurchaseOrderRequest): Promise<PurchaseOrderResponse> => {
    const res = await client.post<PurchaseOrderResponse>('/purchase-orders', data)
    return res.data
  },

  confirm: async (id: number): Promise<PurchaseOrderResponse> => {
    const res = await client.post<PurchaseOrderResponse>(`/purchase-orders/${id}/confirm`)
    return res.data
  },

  complete: async (id: number): Promise<PurchaseOrderResponse> => {
    const res = await client.post<PurchaseOrderResponse>(`/purchase-orders/${id}/complete`)
    return res.data
  },

  cancel: async (id: number): Promise<void> => {
    await client.post(`/purchase-orders/${id}/cancel`)
  },
}
