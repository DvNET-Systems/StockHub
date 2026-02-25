import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Phone, Mail } from 'lucide-react'
import { customersApi } from '../api/customers.api'
import type { CustomerResponse } from '../types'
import { Button, Card, Dialog, Input, Textarea, EmptyState, ConfirmDialog, Spinner } from '../components/ui'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function CustomersPage() {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<CustomerResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CustomerResponse | null>(null)

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getAll,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const createMut = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer added!'); closeDialog() },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => customersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Updated!'); closeDialog() },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMut = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Deleted!'); setDeleteTarget(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  const openCreate = () => { setEditItem(null); reset(); setDialogOpen(true) }
  const openEdit = (c: CustomerResponse) => {
    setEditItem(c)
    reset({ name: c.name, phone: c.phone ?? '', email: c.email ?? '', address: c.address ?? '' })
    setDialogOpen(true)
  }
  const closeDialog = () => { setDialogOpen(false); setEditItem(null); reset() }
  const onSubmit = (data: FormData) => {
    const clean = { ...data, email: data.email || undefined }
    if (editItem) updateMut.mutate({ id: editItem.id, data: clean })
    else createMut.mutate(clean)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Customers</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{customers.length} active customers</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Add Customer</Button>
      </div>

      <Card padding={false}>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : customers.length === 0 ? (
          <EmptyState message="No customers yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {['Name', 'Phone', 'Email', 'Address', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                    <td className="px-5 py-3 font-medium text-[var(--color-text)]">{c.name}</td>
                    <td className="px-5 py-3">
                      {c.phone ? (
                        <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]"><Phone size={11} />{c.phone}</span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {c.email ? (
                        <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]"><Mail size={11} />{c.email}</span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-[var(--color-text-dim)] max-w-[180px] truncate">{c.address ?? '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-blue)] hover:bg-[var(--color-blue-dim)] rounded-lg transition-all"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(c)} className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-red)] hover:bg-[var(--color-red-dim)] rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} title={editItem ? 'Edit Customer' : 'New Customer'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name *" placeholder="ABC Hardware" error={errors.name?.message} {...register('name')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" placeholder="+94 11 234 5678" {...register('phone')} />
            <Input label="Email" type="email" placeholder="orders@company.com" error={errors.email?.message} {...register('email')} />
          </div>
          <Textarea label="Address" placeholder="456 Main St, City" {...register('address')} />
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={closeDialog}>Cancel</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending}>
              {editItem ? 'Save Changes' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        loading={deleteMut.isPending}
        message={`Remove customer "${deleteTarget?.name}"?`}
      />
    </div>
  )
}
