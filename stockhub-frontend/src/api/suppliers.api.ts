import client from './client'
import type { CreateSupplierRequest, SupplierResponse, UpdateSupplierRequest } from '../types'

export const suppliersApi = {
  getAll: async (): Promise<SupplierResponse[]> => {
    const res = await client.get<SupplierResponse[]>('/suppliers')
    return res.data
  },

  getById: async (id: number): Promise<SupplierResponse> => {
    const res = await client.get<SupplierResponse>(`/suppliers/${id}`)
    return res.data
  },

  create: async (data: CreateSupplierRequest): Promise<SupplierResponse> => {
    const res = await client.post<SupplierResponse>('/suppliers', data)
    return res.data
  },

  update: async (id: number, data: UpdateSupplierRequest): Promise<SupplierResponse> => {
    const res = await client.put<SupplierResponse>(`/suppliers/${id}`, data)
    return res.data
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/suppliers/${id}`)
  },
}
