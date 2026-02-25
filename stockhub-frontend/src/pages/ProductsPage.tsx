import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { productsApi } from '../api/products.api'
import { categoriesApi } from '../api/categories.api'
import { unitsApi } from '../api/units.api'
import type { ProductResponse, CreateProductRequest } from '../types'
import {
  Button, Card, Dialog, Input, Select, Textarea,
  Badge, EmptyState, ConfirmDialog, Spinner,
} from '../components/ui'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  costPrice: z.coerce.number().min(0, 'Must be ≥ 0'),
  sellingPrice: z.coerce.number().min(0, 'Must be ≥ 0'),
  reorderLevel: z.coerce.number().int().min(0),
  categoryId: z.coerce.number().min(1, 'Select a category'),
  unitId: z.coerce.number().min(1, 'Select a unit'),
})
type FormData = z.infer<typeof schema>

export function ProductsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<ProductResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  })
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })
  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: unitsApi.getAll,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const createMut = useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created!')
      closeDialog()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateProductRequest }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated!')
      closeDialog()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted!')
      setDeleteTarget(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const openCreate = () => {
    setEditProduct(null)
    reset({ reorderLevel: 10, costPrice: 0, sellingPrice: 0 })
    setDialogOpen(true)
  }

  const openEdit = (p: ProductResponse) => {
    setEditProduct(p)
    reset({
      name: p.name, sku: p.sku, description: p.description ?? '',
      costPrice: p.costPrice, sellingPrice: p.sellingPrice,
      reorderLevel: p.reorderLevel, categoryId: p.categoryId, unitId: p.unitId,
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditProduct(null)
    reset()
  }

  const onSubmit = (data: FormData) => {
    const payload = { ...data, description: data.description || undefined }
    if (editProduct) {
      updateMut.mutate({ id: editProduct.id, data: payload })
    } else {
      createMut.mutate(payload)
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Products</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{products.length} total products</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>New Product</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, SKU, or category…"
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-dim)] outline-none focus:border-[var(--color-blue)] transition-all"
        />
      </div>

      {/* Table */}
      <Card padding={false}>
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState message="No products found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {['Name', 'SKU', 'Category', 'Cost', 'Price', 'Stock', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-[var(--color-text)]">{p.name}</p>
                        {p.description && (
                          <p className="text-xs text-[var(--color-text-dim)] truncate max-w-[200px]">{p.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-[var(--color-text-muted)]">{p.sku}</td>
                    <td className="px-5 py-3 text-[var(--color-text-muted)]">{p.categoryName}</td>
                    <td className="px-5 py-3 font-mono text-xs">${p.costPrice.toFixed(2)}</td>
                    <td className="px-5 py-3 font-mono text-xs text-[var(--color-green)]">${p.sellingPrice.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`font-mono text-sm font-medium ${p.isLowStock ? 'text-[var(--color-yellow)]' : 'text-[var(--color-text)]'}`}>
                        {p.currentStock}
                      </span>
                      <span className="text-xs text-[var(--color-text-dim)] ml-1">{p.unitSymbol}</span>
                    </td>
                    <td className="px-5 py-3">
                      {p.isLowStock ? (
                        <Badge variant="yellow">Low Stock</Badge>
                      ) : (
                        <Badge variant="green">OK</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-blue)] hover:bg-[var(--color-blue-dim)] rounded-lg transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
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
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editProduct ? 'Edit Product' : 'New Product'}
        width="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" placeholder="Wireless Mouse" error={errors.name?.message} {...register('name')} />
            <Input label="SKU" placeholder="WM-001" error={errors.sku?.message} {...register('sku')} />
          </div>
          <Textarea label="Description (optional)" placeholder="Product description…" {...register('description')} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Cost Price" type="number" step="0.01" placeholder="0.00" error={errors.costPrice?.message} {...register('costPrice')} />
            <Input label="Selling Price" type="number" step="0.01" placeholder="0.00" error={errors.sellingPrice?.message} {...register('sellingPrice')} />
            <Input label="Reorder Level" type="number" placeholder="10" error={errors.reorderLevel?.message} {...register('reorderLevel')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              placeholder="Select category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              error={errors.categoryId?.message}
              {...register('categoryId')}
            />
            <Select
              label="Unit"
              placeholder="Select unit"
              options={units.map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` }))}
              error={errors.unitId?.message}
              {...register('unitId')}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={closeDialog}>Cancel</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending}>
              {editProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        loading={deleteMut.isPending}
        message={`Delete "${deleteTarget?.name}"? This will soft-delete it.`}
      />
    </div>
  )
}
