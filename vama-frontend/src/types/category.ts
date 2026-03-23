export interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  description?: string
  productCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateCategoryDto = Pick<Category, 'name' | 'parentId' | 'description' | 'isActive'>
export type UpdateCategoryDto = Partial<CreateCategoryDto>
