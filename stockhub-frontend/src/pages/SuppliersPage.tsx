import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Phone, Mail } from 'lucide-react'
import { suppliersApi } from '../api/suppliers.api'
import type { SupplierResponse } from '../types'
import { Button, Card, Dialog, Input, Textarea, EmptyState, ConfirmDialog, Spinner } from '../components/ui'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function SuppliersPage() {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<SupplierResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SupplierResponse | null>(null)

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersApi.getAll,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const createMut = useMutation({
    mutationFn: suppliersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Supplier added!'); closeDialog() },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => suppliersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Updated!'); closeDialog() },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMut = useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Deleted!'); setDeleteTarget(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  const openCreate = () => { setEditItem(null); reset(); setDialogOpen(true) }
  const openEdit = (s: SupplierResponse) => {
    setEditItem(s)
    reset({ name: s.name, contactPerson: s.contactPerson ?? '', phone: s.phone ?? '', email: s.email ?? '', address: s.address ?? '' })
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
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Suppliers</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{suppliers.length} active suppliers</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Add Supplier</Button>
      </div>

      <Card padding={false}>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : suppliers.length === 0 ? (
          <EmptyState message="No suppliers yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {['Name', 'Contact', 'Phone', 'Email', 'Address', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                    <td className="px-5 py-3 font-medium text-[var(--color-text)]">{s.name}</td>
                    <td className="px-5 py-3 text-[var(--color-text-muted)]">{s.contactPerson ?? '—'}</td>
                    <td className="px-5 py-3">
                      {s.phone ? (
                        <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                          <Phone size={11} />{s.phone}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {s.email ? (
                        <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                          <Mail size={11} />{s.email}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-[var(--color-text-dim)] max-w-[180px] truncate">{s.address ?? '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-blue)] hover:bg-[var(--color-blue-dim)] rounded-lg transition-all"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(s)} className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-red)] hover:bg-[var(--color-red-dim)] rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} title={editItem ? 'Edit Supplier' : 'New Supplier'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Company Name *" placeholder="TechCorp Supplies" error={errors.name?.message} {...register('name')} />
          <Input label="Contact Person" placeholder="John Smith" {...register('contactPerson')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" placeholder="+94 77 123 4567" {...register('phone')} />
            <Input label="Email" type="email" placeholder="contact@company.com" error={errors.email?.message} {...register('email')} />
          </div>
          <Textarea label="Address" placeholder="123 Main St, City" {...register('address')} />
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={closeDialog}>Cancel</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending}>
              {editItem ? 'Save Changes' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        loading={deleteMut.isPending}
        message={`Remove supplier "${deleteTarget?.name}"?`}
      />
    </div>
  )
}
