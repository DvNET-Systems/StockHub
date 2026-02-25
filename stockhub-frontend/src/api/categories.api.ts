import client from './client'
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../types'

export const categoriesApi = {
  getAll: async (): Promise<CategoryResponse[]> => {
    const res = await client.get<CategoryResponse[]>('/categories')
    return res.data
  },

  getById: async (id: number): Promise<CategoryResponse> => {
    const res = await client.get<CategoryResponse>(`/categories/${id}`)
    return res.data
  },

  create: async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
    const res = await client.post<CategoryResponse>('/categories', data)
    return res.data
  },

  update: async (id: number, data: UpdateCategoryRequest): Promise<CategoryResponse> => {
    const res = await client.put<CategoryResponse>(`/categories/${id}`, data)
    return res.data
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/categories/${id}`)
  },
}
