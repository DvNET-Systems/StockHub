import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '../types'

interface AuthState {
  user: AuthResponse | null
  isAuthenticated: boolean
  login: (data: AuthResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (data: AuthResponse) => {
        // Store token separately so the axios interceptor can read it
        localStorage.setItem('stockhub_token', data.token)
        set({ user: data, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('stockhub_token')
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'stockhub_user', // localStorage key
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
