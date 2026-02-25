import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { getErrorMessage } from '../api/client'
import { Button, Input } from '../components/ui'
import toast from 'react-hot-toast'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const result = await authApi.login(data)
      login(result)
      toast.success(`Welcome back, ${result.username}!`)
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-blue)] opacity-[0.03] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-blue)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--color-blue)]/20">
            <span className="text-white text-xl font-bold tracking-tighter">SH</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">StockHub</h1>
          <p className="text-sm text-[var(--color-text-dim)] mt-1 font-mono">DvNET Systems · 2026</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-7">
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-5">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Username"
              placeholder="admin"
              error={errors.username?.message}
              {...register('username')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" loading={loading} className="w-full justify-center mt-1">
              Sign In
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-[var(--color-text-dim)]">
            Default credentials: <span className="font-mono text-[var(--color-text-muted)]">admin / Admin@123</span>
          </p>
        </div>

        <p className="text-center text-xs text-[var(--color-text-dim)] mt-6">
          Inventory Management System · Built with .NET 10 &amp; React 19
        </p>
      </div>
    </div>
  )
}
