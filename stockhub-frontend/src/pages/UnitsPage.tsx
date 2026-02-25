import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { unitsApi } from '../api/units.api'
import { Button, Card, Dialog, Input, EmptyState, Spinner } from '../components/ui'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().min(1, 'Symbol is required'),
})
type FormData = z.infer<typeof schema>

export function UnitsPage() {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: unitsApi.getAll,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const createMut = useMutation({
    mutationFn: unitsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['units'] }); toast.success('Unit created!'); setDialogOpen(false); reset() },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Units of Measure</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Seeded defaults + custom units</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { reset(); setDialogOpen(true) }}>
          New Unit
        </Button>
      </div>

      <Card padding={false}>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : units.length === 0 ? (
          <EmptyState message="No units found" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {['#', 'Name', 'Symbol'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {units.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                  <td className="px-5 py-3 text-[var(--color-text-dim)] text-xs">{u.id}</td>
                  <td className="px-5 py-3 font-medium text-[var(--color-text)]">{u.name}</td>
                  <td className="px-5 py-3 font-mono text-[var(--color-blue)]">{u.symbol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="New Unit">
        <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4">
          <Input label="Name" placeholder="Kilogram" error={errors.name?.message} {...register('name')} />
          <Input label="Symbol" placeholder="kg" error={errors.symbol?.message} {...register('symbol')} />
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMut.isPending}>Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
