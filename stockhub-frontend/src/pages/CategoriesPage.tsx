import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { categoriesApi } from '../api/categories.api'
import type { CategoryResponse } from '../types'
import { Button, Card, Dialog, Input, Textarea, EmptyState, ConfirmDialog, Spinner } from '../components/ui'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function CategoriesPage() {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<CategoryResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null)

  const { data: categories = [], isLoading, isError, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const createMut = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created!')
      closeDialog()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated!')
      closeDialog()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMut = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Deleted!')
      setDeleteTarget(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const openCreate = () => {
    setEditItem(null)
    reset()
    setDialogOpen(true)
  }

  const openEdit = (c: CategoryResponse) => {
    setEditItem(c)
    reset({ name: c.name, description: c.description ?? '' })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditItem(null)
    reset()
  }

  const onSubmit = (data: FormData) => {
    if (editItem) updateMut.mutate({ id: editItem.id, data })
    else createMut.mutate(data)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Categories</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{categories.length} categories</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>New Category</Button>
      </div>

      <Card padding={false}>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-sm text-[var(--color-red)]">Failed to load categories</p>
            <p className="text-xs text-[var(--color-text-dim)] font-mono">
              {(error as Error)?.message ?? 'Unknown error'}
            </p>
            <p className="text-xs text-[var(--color-text-dim)]">
              Check that your backend is running and the /api/categories endpoint is reachable.
            </p>
          </div>
        ) : categories.length === 0 ? (
          <EmptyState message="No categories yet — click New Category to add one" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {['Name', 'Description', 'Active', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                  <td className="px-5 py-3 font-medium text-[var(--color-text)]">{c.name}</td>
                  <td className="px-5 py-3 text-[var(--color-text-muted)]">
                    {c.description ?? <span className="text-[var(--color-text-dim)]">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${c.isActive ? 'text-[var(--color-green)]' : 'text-[var(--color-text-dim)]'}`}>
                      {c.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-blue)] hover:bg-[var(--color-blue-dim)] rounded-lg transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-red)] hover:bg-[var(--color-red-dim)] rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} title={editItem ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name *"
            placeholder="Electronics"
            error={errors.name?.message}
            {...register('name')}
          />
          <Textarea
            label="Description (optional)"
            placeholder="What this category covers…"
            {...register('description')}
          />
          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={closeDialog}>Cancel</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending}>
              {editItem ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        loading={deleteMut.isPending}
        message={`Delete category "${deleteTarget?.name}"?`}
      />
    </div>
  )
}
