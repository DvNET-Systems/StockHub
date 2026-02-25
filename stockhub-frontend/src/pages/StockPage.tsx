import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, PlusCircle } from 'lucide-react'
import { stockApi } from '../api/stock.api'
import { productsApi } from '../api/products.api'
import { Button, Card, Dialog, Select, Input, EmptyState, Badge, Spinner } from '../components/ui'
import { normalizeMovementType } from '../utils'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

const adjustSchema = z.object({
  productId: z.coerce.number().min(1, 'Select a product'),
  type: z.coerce.number().min(0).max(2),
  quantity: z.coerce.number().min(0.01, 'Must be > 0'),
  notes: z.string().optional(),
})
type AdjustForm = z.infer<typeof adjustSchema>

type Tab = 'stock' | 'movements'

export function StockPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('stock')
  const [adjustOpen, setAdjustOpen] = useState(false)

  const { data: products = [], isLoading: pLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  })
  const { data: movements = [], isLoading: mLoading } = useQuery({
    queryKey: ['stock', 'movements'],
    queryFn: stockApi.getMovements,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdjustForm>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { type: 0, quantity: 1 },
  })

  const adjustMut = useMutation({
    mutationFn: stockApi.adjust,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
      toast.success('Stock adjustment recorded!')
      setAdjustOpen(false)
      reset()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const movementTypeLabel = (type: string | number) => normalizeMovementType(type)

  const movementIcon = (type: string | number) => {
    const t = movementTypeLabel(type)
    if (t === 'In') return <ArrowDownCircle size={15} className="text-[var(--color-green)]" />
    if (t === 'Out') return <ArrowUpCircle size={15} className="text-[var(--color-red)]" />
    return <RefreshCw size={15} className="text-[var(--color-yellow)]" />
  }

  const movementBadge = (type: string | number) => {
    const t = movementTypeLabel(type)
    if (t === 'In') return <Badge variant="green">In</Badge>
    if (t === 'Out') return <Badge variant="red">Out</Badge>
    return <Badge variant="yellow">Adjustment</Badge>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Stock</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Live stock levels and movement history</p>
        </div>
        <Button icon={<PlusCircle size={16} />} onClick={() => { reset({ type: 0, quantity: 1 }); setAdjustOpen(true) }}>
          Manual Adjustment
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1 w-fit">
        {(['stock', 'movements'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t
                ? 'bg-[var(--color-blue)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {t === 'stock' ? 'Current Stock' : 'Movement History'}
          </button>
        ))}
      </div>

      {/* Current Stock Tab */}
      {tab === 'stock' && (
        <Card padding={false}>
          {pLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : products.length === 0 ? (
            <EmptyState message="No products found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {['Product', 'SKU', 'Category', 'Current Stock', 'Reorder Level', 'Stock Value', 'Status'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {products.map((p) => (
                    <tr key={p.id} className={`hover:bg-[var(--color-surface-2)] transition-colors ${p.isLowStock ? 'bg-[var(--color-yellow-dim)]/30' : ''}`}>
                      <td className="px-5 py-3 font-medium text-[var(--color-text)]">{p.name}</td>
                      <td className="px-5 py-3 font-mono text-xs text-[var(--color-text-dim)]">{p.sku}</td>
                      <td className="px-5 py-3 text-[var(--color-text-muted)]">{p.categoryName}</td>
                      <td className="px-5 py-3">
                        <span className={`font-mono text-sm font-semibold ${p.isLowStock ? 'text-[var(--color-yellow)]' : 'text-[var(--color-text)]'}`}>
                          {p.currentStock}
                        </span>
                        <span className="text-xs text-[var(--color-text-dim)] ml-1">{p.unitSymbol}</span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-[var(--color-text-muted)]">{p.reorderLevel}</td>
                      <td className="px-5 py-3 font-mono text-xs text-[var(--color-green)]">
                        ${(p.currentStock * p.costPrice).toFixed(2)}
                      </td>
                      <td className="px-5 py-3">
                        {p.isLowStock ? <Badge variant="yellow">⚠ Low</Badge> : <Badge variant="green">✓ OK</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Movements Tab */}
      {tab === 'movements' && (
        <Card padding={false}>
          {mLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : movements.length === 0 ? (
            <EmptyState message="No movements recorded yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {['Date', 'Product', 'Type', 'Qty', 'Reference', 'Notes'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="px-5 py-3 text-xs text-[var(--color-text-dim)] whitespace-nowrap">
                        {format(parseISO(m.movementDate), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-[var(--color-text)] font-medium">{m.productName}</p>
                        <p className="text-xs font-mono text-[var(--color-text-dim)]">{m.sku}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {movementIcon(m.type)}
                          {movementBadge(m.type)}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono font-semibold text-[var(--color-text)]">{m.quantity}</td>
                      <td className="px-5 py-3 text-xs text-[var(--color-text-muted)]">
                        {m.referenceType && m.referenceId ? `${m.referenceType} #${m.referenceId}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-xs text-[var(--color-text-dim)] max-w-[200px] truncate">{m.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Manual Adjustment Dialog */}
      <Dialog open={adjustOpen} onClose={() => setAdjustOpen(false)} title="Manual Stock Adjustment">
        <form onSubmit={handleSubmit((d) => adjustMut.mutate(d))} className="space-y-4">
          <Select
            label="Product *"
            placeholder="Select product"
            options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku}) — Stock: ${p.currentStock}` }))}
            error={errors.productId?.message}
            {...register('productId')}
          />
          <Select
            label="Type *"
            options={[
              { value: 0, label: '📥 In — Add stock' },
              { value: 1, label: '📤 Out — Remove stock' },
              { value: 2, label: '🔄 Adjustment — Correction' },
            ]}
            {...register('type')}
          />
          <Input label="Quantity *" type="number" step="0.01" placeholder="0" error={errors.quantity?.message} {...register('quantity')} />
          <Input label="Notes" placeholder="Opening stock, write-off, correction…" {...register('notes')} />
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={() => setAdjustOpen(false)}>Cancel</Button>
            <Button type="submit" loading={adjustMut.isPending}>Record Adjustment</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
