import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types'
import type { PaginatedResponse } from '@/types/api'
import { slugify } from '@/lib/format'

const now = new Date().toISOString()

let categories: Category[] = [
  { id: 'cat-1', name: 'Silk Sarees', slug: 'silk-sarees', parentId: null, description: 'Premium silk sarees', productCount: 12, isActive: true, createdAt: now, updatedAt: now },
  { id: 'cat-2', name: 'Kanjivaram Sarees', slug: 'kanjivaram-sarees', parentId: 'cat-1', description: 'Traditional South Indian silk sarees', productCount: 5, isActive: true, createdAt: now, updatedAt: now },
  { id: 'cat-3', name: 'Banarasi Sarees', slug: 'banarasi-sarees', parentId: 'cat-1', description: 'Handwoven Banarasi silk sarees', productCount: 4, isActive: true, createdAt: now, updatedAt: now },
  { id: 'cat-4', name: 'Cotton Sarees', slug: 'cotton-sarees', parentId: null, description: 'Comfortable cotton sarees', productCount: 8, isActive: true, createdAt: now, updatedAt: now },
  { id: 'cat-5', name: 'Georgette Sarees', slug: 'georgette-sarees', parentId: null, description: 'Light georgette sarees', productCount: 6, isActive: true, createdAt: now, updatedAt: now },
  { id: 'cat-6', name: 'Designer Suits', slug: 'designer-suits', parentId: null, description: 'Salwar suits and dress materials', productCount: 10, isActive: true, createdAt: now, updatedAt: now },
  { id: 'cat-7', name: 'Lehengas', slug: 'lehengas', parentId: null, description: 'Bridal and party lehengas', productCount: 5, isActive: true, createdAt: now, updatedAt: now },
  { id: 'cat-8', name: 'Dupattas', slug: 'dupattas', parentId: null, description: 'Matching dupattas', productCount: 15, isActive: true, createdAt: now, updatedAt: now },
  { id: 'cat-9', name: 'Chanderi Sarees', slug: 'chanderi-sarees', parentId: null, description: 'Light Chanderi silk-cotton sarees', productCount: 3, isActive: true, createdAt: now, updatedAt: now },
]

let seq = categories.length + 1

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)
  return { data, total: items.length, page, pageSize, totalPages: Math.ceil(items.length / pageSize) }
}

export const mockCategories = {
  list(params: { page: number; pageSize: number; search?: string }): Promise<PaginatedResponse<Category>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...categories]
        if (params.search) {
          const s = params.search.toLowerCase()
          filtered = filtered.filter((c) => c.name.toLowerCase().includes(s))
        }
        resolve(paginate(filtered, params.page, params.pageSize))
      }, 200)
    })
  },

  getById(id: string): Promise<Category> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const c = categories.find((c) => c.id === id)
        if (!c) return reject(new Error('Category not found'))
        resolve(c)
      }, 150)
    })
  },

  getAll(): Promise<Category[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...categories]), 150)
    })
  },

  create(dto: CreateCategoryDto): Promise<Category> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const category: Category = {
          ...dto,
          id: `cat-${++seq}`,
          slug: slugify(dto.name),
          productCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        categories.push(category)
        resolve(category)
      }, 300)
    })
  },

  update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = categories.findIndex((c) => c.id === id)
        if (idx === -1) return reject(new Error('Category not found'))
        categories[idx] = {
          ...categories[idx],
          ...dto,
          slug: dto.name ? slugify(dto.name) : categories[idx].slug,
          updatedAt: new Date().toISOString(),
        }
        resolve(categories[idx])
      }, 300)
    })
  },

  delete(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        categories = categories.filter((c) => c.id !== id)
        resolve()
      }, 300)
    })
  },
}
