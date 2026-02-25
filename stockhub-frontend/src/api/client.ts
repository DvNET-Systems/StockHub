import axios, { type AxiosError } from 'axios'
import toast from 'react-hot-toast'
import type { ApiError } from '../types'

// Because we configured a Vite proxy in vite.config.ts,
// ALL /api calls go to http://localhost:3000/api locally,
// and Vite forwards them to https://localhost:7000/api (your .NET backend).
// This means NO cross-origin issues, NO cert issues. Clean.
const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor: attach JWT from localStorage ──────────────────
client.interceptors.request.use((config) => {
  // We pull the token directly here so we always get the latest value
  // (the Zustand store may not have hydrated yet on first load)
  const token = localStorage.getItem('stockhub_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: handle 401 globally ────────────────────────
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear everything and go to login
      localStorage.removeItem('stockhub_token')
      localStorage.removeItem('stockhub_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Helper to extract a readable error message ────────────────────────
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    if (data?.detail) return data.detail
    if (data?.title) return data.title
    if (data?.errors) {
      // Flatten validation errors
      const messages = Object.values(data.errors).flat()
      return messages.join(' • ')
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}

// ── Convenience wrapper that shows a toast on error ────────────────────
export async function apiCall<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (err) {
    toast.error(getErrorMessage(err))
    return null
  }
}

export default client
