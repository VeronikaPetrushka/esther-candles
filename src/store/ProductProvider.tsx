import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { categories as seedCategories, products as seedProducts, type Product } from '../data/products'

export type ManagedProduct = Product & {
  sortOrder?: number
  active?: boolean
}

type ProductContextValue = {
  products: ManagedProduct[]
  categories: string[]
  activeProducts: ManagedProduct[]
  saveProduct: (product: ManagedProduct) => void
  deleteProduct: (id: string) => void
  replaceProducts: (products: ManagedProduct[]) => void
  addCategory: (name: string) => void
  renameCategory: (oldName: string, nextName: string) => void
  deleteCategory: (name: string) => void
}

const PRODUCTS_KEY = 'esther.products.v3'
const CATEGORIES_KEY = 'esther.categories.v3'

const normalizeProduct = (product: ManagedProduct, index: number): ManagedProduct => {
  const images = Array.isArray(product.images) && product.images.length
    ? product.images.filter(Boolean)
    : product.image ? [product.image] : []
  return {
    ...product,
    images,
    image: images[0] || product.image || '',
    active: product.active !== false,
    sortOrder: Number.isFinite(product.sortOrder) ? product.sortOrder : index,
  }
}

function loadProducts(): ManagedProduct[] {
  try {
    const stored = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || 'null') as ManagedProduct[] | null
    if (Array.isArray(stored) && stored.length) return stored.map(normalizeProduct).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0))
  } catch {}
  return seedProducts.map((product, index) => normalizeProduct({ ...product }, index))
}

function loadCategories(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || 'null') as string[] | null
    if (Array.isArray(stored) && stored.length) return stored.filter(Boolean)
  } catch {}
  return seedCategories.filter((item) => item !== 'Усі')
}

const ProductContext = createContext<ProductContextValue | null>(null)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ManagedProduct[]>(loadProducts)
  const [categories, setCategories] = useState<string[]>(loadCategories)

  const persistProducts = (next: ManagedProduct[]) => {
    const normalized = next.map(normalizeProduct).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0))
    setProducts(normalized)
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(normalized))
  }

  const persistCategories = (next: string[]) => {
    const cleaned = Array.from(new Set(next.map((item) => item.trim()).filter(Boolean)))
    setCategories(cleaned)
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cleaned))
  }

  const saveProduct = (product: ManagedProduct) => {
    const exists = products.some((item) => item.id === product.id)
    const next = exists
      ? products.map((item) => item.id === product.id ? product : item)
      : [...products, { ...product, sortOrder: products.length }]
    persistProducts(next)
  }

  const deleteProduct = (id: string) => persistProducts(products.filter((item) => item.id !== id))
  const replaceProducts = (next: ManagedProduct[]) => persistProducts(next.map((item, index) => ({ ...item, sortOrder: index })))

  const addCategory = (name: string) => {
    if (!name.trim() || categories.includes(name.trim())) return
    persistCategories([...categories, name.trim()])
  }

  const renameCategory = (oldName: string, nextName: string) => {
    const clean = nextName.trim()
    if (!clean || (clean !== oldName && categories.includes(clean))) return
    persistCategories(categories.map((item) => item === oldName ? clean : item))
    persistProducts(products.map((product) => product.category === oldName ? { ...product, category: clean } : product))
  }

  const deleteCategory = (name: string) => {
    const fallback = categories.find((item) => item !== name) || 'Без категорії'
    persistCategories(categories.filter((item) => item !== name).concat(categories.length === 1 ? [fallback] : []))
    persistProducts(products.map((product) => product.category === name ? { ...product, category: fallback } : product))
  }

  const activeProducts = useMemo(() => products.filter((item) => item.active !== false), [products])

  return <ProductContext.Provider value={{ products, categories, activeProducts, saveProduct, deleteProduct, replaceProducts, addCategory, renameCategory, deleteCategory }}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const value = useContext(ProductContext)
  if (!value) throw new Error('useProducts must be used inside ProductProvider')
  return value
}
