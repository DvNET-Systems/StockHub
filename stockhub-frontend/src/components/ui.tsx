// ─────────────────────────────────────────────────────────────────────────────
// Shared UI primitive components — styled for the Twitter dark mode theme.
// All live in one file for simplicity; split them if the project grows.
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react'

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }[size]
  return (
    <svg
      className={`${sz} animate-spin text-[var(--color-blue)]`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-blue)] hover:bg-[var(--color-blue-hover)] text-white font-semibold',
  secondary:
    'bg-transparent border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]',
  danger:
    'bg-transparent border border-[var(--color-red)] text-[var(--color-red)] hover:bg-[var(--color-red-dim)]',
  ghost:
    'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]',
  success:
    'bg-transparent border border-[var(--color-green)] text-[var(--color-green)] hover:bg-[var(--color-green-dim)]',
}

const buttonSizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 rounded-full transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${buttonVariants[variant]} ${buttonSizes[size]} ${className}
      `}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeVariant = 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'orange'

const badgeStyles: Record<BadgeVariant, string> = {
  blue: 'bg-[var(--color-blue-dim)] text-[var(--color-blue)]',
  green: 'bg-[var(--color-green-dim)] text-[var(--color-green)]',
  red: 'bg-[var(--color-red-dim)] text-[var(--color-red)]',
  yellow: 'bg-[var(--color-yellow-dim)] text-[var(--color-yellow)]',
  orange: 'bg-orange-500/10 text-orange-400',
  gray: 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]',
}

export function Badge({ children, variant = 'gray' }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyles[variant]}`}>
      {children}
    </span>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...rest }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full bg-[var(--color-surface)] border rounded-lg px-3 py-2
          text-[var(--color-text)] text-sm placeholder-[var(--color-text-dim)]
          outline-none transition-all duration-150
          ${error
            ? 'border-[var(--color-red)] focus:border-[var(--color-red)] focus:ring-1 focus:ring-[var(--color-red)]'
            : 'border-[var(--color-border)] focus:border-[var(--color-blue)] focus:ring-1 focus:ring-[var(--color-blue-dim)]'
          }
          ${className}
        `}
        {...rest}
      />
      {error && <span className="text-xs text-[var(--color-red)]">{error}</span>}
    </div>
  )
)
Input.displayName = 'Input'

// ── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...rest }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={3}
        className={`
          w-full bg-[var(--color-surface)] border rounded-lg px-3 py-2
          text-[var(--color-text)] text-sm placeholder-[var(--color-text-dim)]
          outline-none resize-none transition-all duration-150
          ${error
            ? 'border-[var(--color-red)] focus:border-[var(--color-red)]'
            : 'border-[var(--color-border)] focus:border-[var(--color-blue)]'
          }
          ${className}
        `}
        {...rest}
      />
      {error && <span className="text-xs text-[var(--color-red)]">{error}</span>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...rest }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full bg-[var(--color-surface)] border rounded-lg px-3 py-2
          text-[var(--color-text)] text-sm outline-none transition-all duration-150
          ${error
            ? 'border-[var(--color-red)]'
            : 'border-[var(--color-border)] focus:border-[var(--color-blue)]'
          }
          ${className}
        `}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-[var(--color-red)]">{error}</span>}
    </div>
  )
)
Select.displayName = 'Select'

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className = '',
  padding = true,
}: {
  children: ReactNode
  className?: string
  padding?: boolean
}) {
  return (
    <div
      className={`
        bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl
        ${padding ? 'p-5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// ── Dialog / Modal ────────────────────────────────────────────────────────────
interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: string
}

export function Dialog({ open, onClose, title, children, width = 'max-w-lg' }: DialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`
          relative z-10 w-full ${width} bg-[var(--color-surface)] border border-[var(--color-border)]
          rounded-2xl shadow-2xl overflow-hidden
          animate-[fadeSlideIn_0.15s_ease-out]
        `}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Status Badge helper ───────────────────────────────────────────────────────
import type { OrderStatus } from '../types'
import { normalizeStatus } from '../utils'

const statusVariants: Record<OrderStatus, BadgeVariant> = {
  Draft: 'gray',
  Confirmed: 'blue',
  Completed: 'green',
  Cancelled: 'red',
}

export function StatusBadge({ status }: { status: OrderStatus | number }) {
  const s = normalizeStatus(status as OrderStatus | number)
  return <Badge variant={statusVariants[s]}>{s}</Badge>
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ message = 'No data found' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <svg
        className="h-10 w-10 text-[var(--color-text-dim)]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <p className="text-[var(--color-text-muted)] text-sm">{message}</p>
    </div>
  )
}

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  title?: string
  message?: string
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading,
  title = 'Confirm Delete',
  message = 'Are you sure? This action cannot be undone.',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-sm text-[var(--color-text-muted)] mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </div>
    </Dialog>
  )
}
