import type { Product, CreateProductDto, UpdateProductDto } from '@/types'
import type { PaginatedResponse } from '@/types/api'
import { sortItems } from './sort'

const now = new Date().toISOString()

function deriveStockStatus(qty: number, threshold: number): Product['stockStatus'] {
  if (qty === 0) return 'OUT_OF_STOCK'
  if (qty <= threshold) return 'LOW_STOCK'
  return 'IN_STOCK'
}

let products: Product[] = [
  {
    id: 'p-1', sku: 'SA-KJ-001', name: 'Royal Crimson Kanjivaram Saree',
    productType: 'Saree', categoryId: 'cat-2', fabricType: 'Kanjivaram', color: 'Deep Crimson',
    pattern: 'Temple Border with Zari', designCode: 'KJ-2026-R01', vendorId: 'v-1',
    costPrice: 1200000, sellingPrice: 1800000, mrp: 2000000, gstSlab: 5, hsnCode: '5007',
    quantityInStock: 3, lowStockThreshold: 2, stockStatus: 'IN_STOCK',
    length: 6.3, blouseIncluded: true, blouseLength: 80, weight: 900,
    images: [], tags: ['bridal', 'zari', 'kanjivaram'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-2', sku: 'SA-KJ-002', name: 'Emerald Green Kanjivaram Saree',
    productType: 'Saree', categoryId: 'cat-2', fabricType: 'Kanjivaram', color: 'Emerald Green',
    pattern: 'Peacock Motif', designCode: 'KJ-2026-G01', vendorId: 'v-1',
    costPrice: 1500000, sellingPrice: 2200000, mrp: 2500000, gstSlab: 5, hsnCode: '5007',
    quantityInStock: 2, lowStockThreshold: 2, stockStatus: 'LOW_STOCK',
    length: 6.3, blouseIncluded: true, blouseLength: 75, weight: 950,
    images: [], tags: ['bridal', 'peacock', 'kanjivaram'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-3', sku: 'SA-BA-001', name: 'Gold Woven Banarasi Saree',
    productType: 'Saree', categoryId: 'cat-3', fabricType: 'Banarasi', color: 'Gold & Red',
    pattern: 'Minakari Jaal Work', designCode: 'BN-2026-G01', vendorId: 'v-2',
    costPrice: 1800000, sellingPrice: 2800000, mrp: 3200000, gstSlab: 5, hsnCode: '5007',
    quantityInStock: 4, lowStockThreshold: 2, stockStatus: 'IN_STOCK',
    length: 6.5, blouseIncluded: true, blouseLength: 80, weight: 1100,
    images: [], tags: ['bridal', 'minakari', 'banarasi'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-4', sku: 'SA-BA-002', name: 'Navy Blue Banarasi Silk',
    productType: 'Saree', categoryId: 'cat-3', fabricType: 'Banarasi', color: 'Navy Blue',
    pattern: 'Floral Brocade', vendorId: 'v-2',
    costPrice: 1400000, sellingPrice: 2100000, gstSlab: 5, hsnCode: '5007',
    quantityInStock: 5, lowStockThreshold: 2, stockStatus: 'IN_STOCK',
    length: 6.5, blouseIncluded: false, weight: 1050,
    images: [], tags: ['party', 'brocade', 'banarasi'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-5', sku: 'SA-CT-001', name: 'Kerala Kasavu Cotton Saree',
    productType: 'Saree', categoryId: 'cat-4', fabricType: 'Cotton', color: 'White & Gold',
    pattern: 'Kasavu Border', vendorId: 'v-4',
    costPrice: 45000, sellingPrice: 85000, gstSlab: 5, hsnCode: '5208',
    quantityInStock: 12, lowStockThreshold: 5, stockStatus: 'IN_STOCK',
    length: 6.0, blouseIncluded: true, blouseLength: 80, weight: 450,
    images: [], tags: ['casual', 'kasavu', 'cotton'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-6', sku: 'SA-CT-002', name: 'Pochampally Ikat Cotton Saree',
    productType: 'Saree', categoryId: 'cat-4', fabricType: 'Cotton', color: 'Rust & Teal',
    pattern: 'Ikat Geometric', vendorId: 'v-4',
    costPrice: 60000, sellingPrice: 110000, gstSlab: 5, hsnCode: '5208',
    quantityInStock: 8, lowStockThreshold: 3, stockStatus: 'IN_STOCK',
    length: 6.0, blouseIncluded: false, weight: 480,
    images: [], tags: ['ikat', 'pochampally', 'handloom'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-7', sku: 'SA-GG-001', name: 'Peach Chiffon Georgette Saree',
    productType: 'Saree', categoryId: 'cat-5', fabricType: 'Georgette', color: 'Peach',
    pattern: 'Digital Floral Print', vendorId: 'v-3',
    costPrice: 80000, sellingPrice: 160000, gstSlab: 12, hsnCode: '5407',
    quantityInStock: 7, lowStockThreshold: 3, stockStatus: 'IN_STOCK',
    length: 5.5, blouseIncluded: true, blouseLength: 75, weight: 300,
    images: [], tags: ['party', 'printed', 'georgette'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-8', sku: 'SA-GG-002', name: 'Black & Silver Georgette Saree',
    productType: 'Saree', categoryId: 'cat-5', fabricType: 'Georgette', color: 'Black & Silver',
    pattern: 'Sequin Embroidery', vendorId: 'v-3',
    costPrice: 120000, sellingPrice: 220000, gstSlab: 12, hsnCode: '5407',
    quantityInStock: 4, lowStockThreshold: 2, stockStatus: 'IN_STOCK',
    length: 5.5, blouseIncluded: true, blouseLength: 80, weight: 380,
    images: [], tags: ['evening', 'sequin', 'georgette'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-9', sku: 'SU-DS-001', name: 'Pink Anarkali Suit',
    productType: 'Suit', categoryId: 'cat-6', fabricType: 'Georgette', color: 'Rose Pink',
    pattern: 'Thread Embroidery', vendorId: 'v-3',
    costPrice: 150000, sellingPrice: 280000, gstSlab: 12, hsnCode: '6211',
    quantityInStock: 6, lowStockThreshold: 3, stockStatus: 'IN_STOCK',
    images: [], tags: ['anarkali', 'party', 'embroidery'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-10', sku: 'SU-DS-002', name: 'Turquoise Palazzo Suit Set',
    productType: 'Suit', categoryId: 'cat-6', fabricType: 'Chanderi', color: 'Turquoise',
    pattern: 'Block Print', vendorId: 'v-3',
    costPrice: 90000, sellingPrice: 175000, gstSlab: 12, hsnCode: '6211',
    quantityInStock: 0, lowStockThreshold: 3, stockStatus: 'OUT_OF_STOCK',
    images: [], tags: ['palazzo', 'casual', 'blockprint'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-11', sku: 'LH-BR-001', name: 'Bridal Red Lehenga Choli',
    productType: 'Lehenga', categoryId: 'cat-7', fabricType: 'Silk', color: 'Bridal Red & Gold',
    pattern: 'Heavy Zardozi Work', vendorId: 'v-1',
    costPrice: 3500000, sellingPrice: 5500000, mrp: 6500000, gstSlab: 12, hsnCode: '6211',
    quantityInStock: 2, lowStockThreshold: 1, stockStatus: 'IN_STOCK',
    weight: 1800,
    images: [], tags: ['bridal', 'zardozi', 'lehenga'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-12', sku: 'SA-CH-001', name: 'Mint Chanderi Silk Saree',
    productType: 'Saree', categoryId: 'cat-9', fabricType: 'Chanderi', color: 'Mint Green',
    pattern: 'Gold Border', vendorId: 'v-3',
    costPrice: 55000, sellingPrice: 110000, gstSlab: 5, hsnCode: '5007',
    quantityInStock: 9, lowStockThreshold: 3, stockStatus: 'IN_STOCK',
    length: 6.0, blouseIncluded: true, blouseLength: 80, weight: 380,
    images: [], tags: ['lightweight', 'chanderi', 'casual'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-13', sku: 'SA-BD-001', name: 'Bandhani Georgette Saree',
    productType: 'Saree', categoryId: 'cat-5', fabricType: 'Bandhani', color: 'Pink & Yellow',
    pattern: 'Tie-Dye Bandhani', vendorId: 'v-5',
    costPrice: 75000, sellingPrice: 149000, gstSlab: 5, hsnCode: '5407',
    quantityInStock: 1, lowStockThreshold: 2, stockStatus: 'LOW_STOCK',
    length: 5.5, blouseIncluded: false, weight: 320,
    images: [], tags: ['bandhani', 'festive', 'tie-dye'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-14', sku: 'DU-SL-001', name: 'Multicolor Silk Dupatta',
    productType: 'Dupatta', categoryId: 'cat-8', fabricType: 'Silk', color: 'Multicolor',
    pattern: 'Zari Border', vendorId: 'v-1',
    costPrice: 35000, sellingPrice: 75000, gstSlab: 5, hsnCode: '6214',
    quantityInStock: 18, lowStockThreshold: 5, stockStatus: 'IN_STOCK',
    length: 2.5, weight: 200,
    images: [], tags: ['dupatta', 'zari', 'silk'], isActive: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'p-15', sku: 'SA-TU-001', name: 'Tussar Silk Natural Saree',
    productType: 'Saree', categoryId: 'cat-1', fabricType: 'Tussar', color: 'Natural Beige',
    pattern: 'Tribal Motif', vendorId: 'v-1',
    costPrice: 180000, sellingPrice: 350000, gstSlab: 5, hsnCode: '5007',
    quantityInStock: 6, lowStockThreshold: 2, stockStatus: 'IN_STOCK',
    length: 6.0, blouseIncluded: false, weight: 700,
    images: [], tags: ['tussar', 'handloom', 'tribal'], isActive: true, createdAt: now, updatedAt: now,
  },
]

let seq = products.length + 1

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)
  return { data, total: items.length, page, pageSize, totalPages: Math.ceil(items.length / pageSize) }
}

export const mockProducts = {
  list(params: {
    page: number
    pageSize: number
    search?: string
    categoryId?: string
    stockStatus?: string
    productType?: string
    vendorId?: string
    sortKey?: string
    sortDir?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<Product>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...products]
        if (params.search) {
          const s = params.search.toLowerCase()
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(s) ||
              p.sku.toLowerCase().includes(s) ||
              p.color.toLowerCase().includes(s),
          )
        }
        if (params.categoryId) filtered = filtered.filter((p) => p.categoryId === params.categoryId)
        if (params.stockStatus) filtered = filtered.filter((p) => p.stockStatus === params.stockStatus)
        if (params.productType) filtered = filtered.filter((p) => p.productType === params.productType)
        if (params.vendorId) filtered = filtered.filter((p) => p.vendorId === params.vendorId)
        filtered = sortItems(filtered as unknown as Record<string, unknown>[], params.sortKey ?? 'name', params.sortDir ?? 'asc') as unknown as Product[]
        resolve(paginate(filtered, params.page, params.pageSize))
      }, 250)
    })
  },

  getById(id: string): Promise<Product> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const p = products.find((p) => p.id === id)
        if (!p) return reject(new Error('Product not found'))
        resolve(p)
      }, 150)
    })
  },

  search(query: string): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const q = query.toLowerCase()
        const results = products
          .filter(
            (p) =>
              p.isActive &&
              p.stockStatus !== 'OUT_OF_STOCK' &&
              (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
          )
          .slice(0, 10)
        resolve(results)
      }, 200)
    })
  },

  create(dto: CreateProductDto): Promise<Product> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product: Product = {
          ...dto,
          id: `p-${++seq}`,
          stockStatus: deriveStockStatus(dto.quantityInStock, dto.lowStockThreshold),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        products.push(product)
        resolve(product)
      }, 400)
    })
  },

  update(id: string, dto: UpdateProductDto): Promise<Product> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = products.findIndex((p) => p.id === id)
        if (idx === -1) return reject(new Error('Product not found'))
        const updated = { ...products[idx], ...dto, updatedAt: new Date().toISOString() }
        updated.stockStatus = deriveStockStatus(updated.quantityInStock, updated.lowStockThreshold)
        products[idx] = updated
        resolve(updated)
      }, 400)
    })
  },

  delete(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        products = products.filter((p) => p.id !== id)
        resolve()
      }, 300)
    })
  },
}

export function deductStock(productId: string, quantity: number): void {
  const idx = products.findIndex((p) => p.id === productId)
  if (idx === -1) return
  const newQty = Math.max(0, products[idx].quantityInStock - quantity)
  products[idx] = {
    ...products[idx],
    quantityInStock: newQty,
    stockStatus: deriveStockStatus(newQty, products[idx].lowStockThreshold),
    updatedAt: new Date().toISOString(),
  }
}

export function addStock(productId: string, quantity: number): void {
  const idx = products.findIndex((p) => p.id === productId)
  if (idx === -1) return
  const newQty = products[idx].quantityInStock + quantity
  products[idx] = {
    ...products[idx],
    quantityInStock: newQty,
    stockStatus: deriveStockStatus(newQty, products[idx].lowStockThreshold),
    updatedAt: new Date().toISOString(),
  }
}
