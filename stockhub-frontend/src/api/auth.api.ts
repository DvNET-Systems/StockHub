import client from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types'

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/auth/login', data)
    return res.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/auth/register', data)
    return res.data
  },

  me: async (): Promise<{ userId: string; username: string }> => {
    const res = await client.get('/auth/me')
    return res.data
  },
}
