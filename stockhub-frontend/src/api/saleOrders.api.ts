import client from './client'
import type { CreateSaleOrderRequest, SaleOrderResponse } from '../types'

export const saleOrdersApi = {
  getAll: async (): Promise<SaleOrderResponse[]> => {
    const res = await client.get<SaleOrderResponse[]>('/sale-orders')
    return res.data
  },

  getById: async (id: number): Promise<SaleOrderResponse> => {
    const res = await client.get<SaleOrderResponse>(`/sale-orders/${id}`)
    return res.data
  },

  create: async (data: CreateSaleOrderRequest): Promise<SaleOrderResponse> => {
    const res = await client.post<SaleOrderResponse>('/sale-orders', data)
    return res.data
  },

  confirm: async (id: number): Promise<SaleOrderResponse> => {
    const res = await client.post<SaleOrderResponse>(`/sale-orders/${id}/confirm`)
    return res.data
  },

  complete: async (id: number): Promise<SaleOrderResponse> => {
    const res = await client.post<SaleOrderResponse>(`/sale-orders/${id}/complete`)
    return res.data
  },

  cancel: async (id: number): Promise<void> => {
    await client.post(`/sale-orders/${id}/cancel`)
  },
}
