import client from './client'
import type {
  CreateProductRequest,
  ProductResponse,
  UpdateProductRequest,
} from '../types'

export const productsApi = {
  getAll: async (): Promise<ProductResponse[]> => {
    const res = await client.get<ProductResponse[]>('/products')
    return res.data
  },

  getById: async (id: number): Promise<ProductResponse> => {
    const res = await client.get<ProductResponse>(`/products/${id}`)
    return res.data
  },

  getLowStock: async (): Promise<ProductResponse[]> => {
    const res = await client.get<ProductResponse[]>('/products/low-stock')
    return res.data
  },

  create: async (data: CreateProductRequest): Promise<ProductResponse> => {
    const res = await client.post<ProductResponse>('/products', data)
    return res.data
  },

  update: async (id: number, data: UpdateProductRequest): Promise<ProductResponse> => {
    const res = await client.put<ProductResponse>(`/products/${id}`, data)
    return res.data
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/products/${id}`)
  },
}
