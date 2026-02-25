import client from './client'
import type { CreateCustomerRequest, CustomerResponse, UpdateCustomerRequest } from '../types'

export const customersApi = {
  getAll: async (): Promise<CustomerResponse[]> => {
    const res = await client.get<CustomerResponse[]>('/customers')
    return res.data
  },

  getById: async (id: number): Promise<CustomerResponse> => {
    const res = await client.get<CustomerResponse>(`/customers/${id}`)
    return res.data
  },

  create: async (data: CreateCustomerRequest): Promise<CustomerResponse> => {
    const res = await client.post<CustomerResponse>('/customers', data)
    return res.data
  },

  update: async (id: number, data: UpdateCustomerRequest): Promise<CustomerResponse> => {
    const res = await client.put<CustomerResponse>(`/customers/${id}`, data)
    return res.data
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/customers/${id}`)
  },
}
