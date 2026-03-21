'use client'

import { useState } from 'react'
import { Plus, Tag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import {
  useAllCategories, useCategories,
  useCreateCategory, useUpdateCategory, useDeleteCategory,
} from '@/hooks/use-categories'
import { useToast } from '@/providers/toast-provider'
import type { Category } from '@/types'
import { Pencil, Trash2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  parentId: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export default function CategoriesPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const { data: paginatedData, isLoading } = useCategories({ page: 1, pageSize: 100, search })
  const { data: allCategories } = useAllCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true },
  })

  const openAdd = () => {
    reset({ isActive: true })
    setEditTarget(null)
    setFormOpen(true)
  }

  const openEdit = (cat: Category) => {
    reset({
      name: cat.name,
      parentId: cat.parentId ?? undefined,
      description: cat.description ?? '',
      isActive: cat.isActive,
    })
    setEditTarget(cat)
    setFormOpen(true)
  }

  const onSubmit = async (values: FormValues) => {
    const dto = {
      name: values.name,
      parentId: values.parentId && values.parentId !== 'none' ? values.parentId : null,
      description: values.description || undefined,
      isActive: values.isActive,
    }
    try {
      if (editTarget) {
        await updateCategory.mutateAsync({ id: editTarget.id, dto })
        toast({ title: 'Category updated', variant: 'success' })
      } else {
        await createCategory.mutateAsync(dto)
        toast({ title: 'Category created', variant: 'success' })
      }
      setFormOpen(false)
    } catch {
      toast({ title: 'Something went wrong', variant: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCategory.mutateAsync(deleteTarget.id)
      toast({ title: 'Category deleted', variant: 'success' })
    } catch {
      toast({ title: 'Failed to delete', variant: 'error' })
    } finally {
      setDeleteTarget(null)
    }
  }

  const categories = paginatedData?.data ?? []

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organise your products into categories"
        action={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search categories..."
      />

      {!isLoading && categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories yet"
          description="Add categories to organise your inventory"
          action={<Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Category</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const parent = allCategories?.find((c) => c.id === cat.parentId)
            return (
              <Card key={cat.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{cat.name}</p>
                        <Badge variant={cat.isActive ? 'success' : 'default'} className="text-xs">
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {parent && (
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          Under: {parent.name}
                        </p>
                      )}
                      {cat.description && (
                        <p className="text-xs text-[var(--color-muted)] mt-1 line-clamp-2">{cat.description}</p>
                      )}
                      <p className="text-xs text-[var(--color-muted)] mt-2">
                        {cat.productCount} products
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cat)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[var(--color-danger)]"
                        onClick={() => setDeleteTarget(cat)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="cat-name" required>Name</Label>
              <Input id="cat-name" {...register('name')} error={!!errors.name} className="mt-1" />
              {errors.name && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Parent Category</Label>
              <Select
                value={watch('parentId') ?? 'none'}
                onValueChange={(v) => setValue('parentId', v === 'none' ? undefined : v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top-level)</SelectItem>
                  {allCategories
                    ?.filter((c) => c.id !== editTarget?.id)
                    .map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea id="cat-desc" {...register('description')} className="mt-1" rows={3} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={watch('isActive')} onCheckedChange={(v) => setValue('isActive', v)} />
              <Label>Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" loading={isSubmitting}>
                {editTarget ? 'Save Changes' : 'Add Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--color-muted)]">
            Delete <strong>{deleteTarget?.name}</strong>? Products in this category will need to be reassigned.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteCategory.isPending} onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
