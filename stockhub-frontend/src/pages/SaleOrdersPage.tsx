import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { saleOrdersApi } from '../api/saleOrders.api'
import { customersApi } from '../api/customers.api'
import { productsApi } from '../api/products.api'
import type { SaleOrderResponse } from '../types'
import {
  Button, Card, Dialog, Select, Input, EmptyState,
  StatusBadge, ConfirmDialog, Spinner,
} from '../components/ui'
import { normalizeStatus } from '../utils'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

const schema = z.object({
  customerId: z.coerce.number().min(1, 'Select a customer'),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.coerce.number().min(1, 'Select a product'),
    quantity: z.coerce.number().min(0.01, 'Must be > 0'),
    unitPrice: z.coerce.number().min(0, 'Must be ≥ 0'),
  })).min(1, 'Add at least one item'),
})
type FormData = z.infer<typeof schema>

export function SaleOrdersPage() {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [cancelTarget, setCancelTarget] = useState<number | null>(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['sale-orders'],
    queryFn: saleOrdersApi.getAll,
  })
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getAll,
  })
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  })

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { items: [{ productId: 0, quantity: 1, unitPrice: 0 }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchedItems = useWatch({ control, name: 'items' })
  const total = (watchedItems ?? []).reduce(
    (sum, i) => sum + (Number(i?.quantity ?? 0) * Number(i?.unitPrice ?? 0)),
    0
  )

  // When a product is selected, auto-fill unit price from product's selling price
  const handleProductChange = (index: number, productId: number) => {
    const product = products.find((p) => p.id === productId)
    if (product) setValue(`items.${index}.unitPrice`, product.sellingPrice)
  }

  const createMut = useMutation({
    mutationFn: saleOrdersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-orders'] })
      toast.success('Sale order created!')
      setDialogOpen(false)
      reset()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const confirmMut = useMutation({
    mutationFn: saleOrdersApi.confirm,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sale-orders'] }); toast.success('Order confirmed!') },
    onError: (e: Error) => toast.error(e.message),
  })

  const completeMut = useMutation({
    mutationFn: saleOrdersApi.complete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-orders'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
      toast.success('Sale completed! Stock deducted.')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const cancelMut = useMutation({
    mutationFn: saleOrdersApi.cancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-orders'] })
      toast.success('Cancelled.')
      setCancelTarget(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const openCreate = () => {
    reset({ items: [{ productId: 0, quantity: 1, unitPrice: 0 }] })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Sale Orders</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{orders.length} orders</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>New Sale</Button>
      </div>

      <div className="flex gap-2 flex-wrap text-xs text-[var(--color-text-muted)] items-center">
        <span>Draft</span><span>→</span>
        <span className="text-[var(--color-blue)]">Confirmed</span><span>→</span>
        <span className="text-[var(--color-green)]">Completed (stock OUT)</span><span>·</span>
        <span className="text-[var(--color-red)]">Cancel anytime before Completed</span>
      </div>

      <Card padding={false}>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <EmptyState message="No sale orders yet" />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {orders.map((o) => (
              <SaleOrderRow
                key={o.id}
                order={o}
                expanded={expandedId === o.id}
                onToggle={() => setExpandedId(expandedId === o.id ? null : o.id)}
                onConfirm={() => confirmMut.mutate(o.id)}
                onComplete={() => completeMut.mutate(o.id)}
                onCancel={() => setCancelTarget(o.id)}
                confirmLoading={confirmMut.isPending}
                completeLoading={completeMut.isPending}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="New Sale Order" width="max-w-2xl">
        <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Customer *"
              placeholder="Select customer"
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
              error={errors.customerId?.message}
              {...register('customerId')}
            />
            <Input label="Notes (optional)" placeholder="Urgent order…" {...register('notes')} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Items</span>
                <span className="text-xs text-[var(--color-text-dim)] ml-2">— unit price auto-fills from product selling price</span>
              </div>
              <button
                type="button"
                onClick={() => append({ productId: 0, quantity: 1, unitPrice: 0 })}
                className="flex items-center gap-1 text-xs text-[var(--color-blue)] hover:underline cursor-pointer"
              >
                <Plus size={12} /> Add Item
              </button>
            </div>

            {/* Header */}
            <div className="grid grid-cols-[1fr_90px_110px_28px] gap-2">
              <span className="text-xs text-[var(--color-text-dim)]">Product (stock shown)</span>
              <span className="text-xs text-[var(--color-text-dim)]">Qty</span>
              <span className="text-xs text-[var(--color-text-dim)]">Unit Price</span>
              <span />
            </div>

            {fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-[1fr_90px_110px_28px] gap-2 items-start">
                <Select
                  placeholder="Select product…"
                  options={products.map((p) => ({
                    value: p.id,
                    label: `${p.name} — ${p.currentStock} ${p.unitSymbol} in stock`,
                  }))}
                  error={errors.items?.[i]?.productId?.message}
                  {...register(`items.${i}.productId`, {
                    onChange: (e) => handleProductChange(i, Number(e.target.value)),
                  })}
                />
                <Input
                  placeholder="1"
                  type="number"
                  step="0.01"
                  error={errors.items?.[i]?.quantity?.message}
                  {...register(`items.${i}.quantity`)}
                />
                <Input
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  error={errors.items?.[i]?.unitPrice?.message}
                  {...register(`items.${i}.unitPrice`)}
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  disabled={fields.length === 1}
                  className="p-1 mt-1 text-[var(--color-text-dim)] hover:text-[var(--color-red)] disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {errors.items?.message && (
              <p className="text-xs text-[var(--color-red)]">{errors.items.message}</p>
            )}

            <div className="flex justify-end pt-1 border-t border-[var(--color-border)]">
              <span className="text-sm font-mono font-semibold text-[var(--color-green)]">
                Total: ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMut.isPending}>Create Sale</Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && cancelMut.mutate(cancelTarget)}
        loading={cancelMut.isPending}
        title="Cancel Sale Order"
        message="Cancel this sale order? This cannot be undone."
      />
    </div>
  )
}

// ── Sale Order Row ───────────────────────────────────────────────────────────
function SaleOrderRow({
  order, expanded, onToggle, onConfirm, onComplete, onCancel, confirmLoading, completeLoading,
}: {
  order: SaleOrderResponse
  expanded: boolean
  onToggle: () => void
  onConfirm: () => void
  onComplete: () => void
  onCancel: () => void
  confirmLoading: boolean
  completeLoading: boolean
}) {
  const status = normalizeStatus(order.status as never)

  return (
    <div>
      <div
        className="flex items-center justify-between px-5 py-4 hover:bg-[var(--color-surface-2)] cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-mono font-medium text-[var(--color-text)]">{order.orderNumber}</p>
            <p className="text-xs text-[var(--color-text-dim)]">
              {order.customerName} · {format(parseISO(order.orderDate), 'MMM d, yyyy')}
            </p>
          </div>
          <StatusBadge status={order.status as never} />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono font-semibold text-[var(--color-green)]">
            ${order.totalAmount.toFixed(2)}
          </span>
          {expanded
            ? <ChevronUp size={16} className="text-[var(--color-text-muted)]" />
            : <ChevronDown size={16} className="text-[var(--color-text-muted)]" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 bg-[var(--color-surface-2)] border-t border-[var(--color-border)]">
          <table className="w-full text-xs mt-3 mb-4">
            <thead>
              <tr className="text-[var(--color-text-muted)]">
                <td className="py-1">Product</td>
                <td className="py-1">SKU</td>
                <td className="py-1 text-right">Qty</td>
                <td className="py-1 text-right">Unit Price</td>
                <td className="py-1 text-right">Total</td>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td className="py-2 text-[var(--color-text)]">{i.productName}</td>
                  <td className="py-2 font-mono text-[var(--color-text-dim)]">{i.productSku}</td>
                  <td className="py-2 text-right font-mono">{i.quantity}</td>
                  <td className="py-2 text-right font-mono">${i.unitPrice.toFixed(2)}</td>
                  <td className="py-2 text-right font-mono font-medium text-[var(--color-green)]">
                    ${i.totalPrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {order.notes && (
            <p className="text-xs text-[var(--color-text-muted)] mb-3">Note: {order.notes}</p>
          )}

          <div className="flex gap-2 flex-wrap">
            {status === 'Draft' && (
              <Button size="sm" variant="secondary" onClick={onConfirm} loading={confirmLoading}>
                Confirm
              </Button>
            )}
            {status === 'Confirmed' && (
              <Button size="sm" variant="success" onClick={onComplete} loading={completeLoading}>
                Complete (Deduct Stock)
              </Button>
            )}
            {(status === 'Draft' || status === 'Confirmed') && (
              <Button size="sm" variant="danger" onClick={onCancel}>
                Cancel Order
              </Button>
            )}
            {(status === 'Completed' || status === 'Cancelled') && (
              <span className="text-xs text-[var(--color-text-dim)] italic">No further actions.</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
