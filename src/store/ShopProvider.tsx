import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useProducts } from './ProductProvider'

export type CartItem = { id: string; qty: number }
export type Customer = {
  name: string
  phone: string
  email: string
  city: string
  warehouse: string
  delivery: 'branch' | 'courier'
  payment: 'card' | 'cod'
  note: string
}
export type OrderStatus = 'new' | 'seen' | 'processing' | 'shipped'
export type Order = {
  id: string
  createdAt: string
  customer: Customer
  items: Array<{ id: string; name: string; image: string; images?: string[]; qty: number; price: number }>
  total: number
  paymentStatus: 'paid' | 'pending'
  status?: OrderStatus
}

type ShopContextValue = {
  cart: CartItem[]
  cartCount: number
  addToCart: (id: string, qty?: number) => void
  setQty: (id: string, qty: number) => void
  clearCart: () => void
  cartLines: Array<{ id: string; qty: number; product: ReturnType<typeof useProducts>['products'][number] }>
  cartTotal: number
  createOrder: (customer: Customer) => Promise<Order>
}

export const CART_KEY = 'esther.cart.v2'
export const ORDER_KEY = 'esther.orders.v2'

function loadCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch { return [] }
}

const ShopContext = createContext<ShopContextValue | null>(null)

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadCart)
  const { products } = useProducts()

  const persist = (next: CartItem[]) => {
    setCart(next)
    localStorage.setItem(CART_KEY, JSON.stringify(next))
  }

  const addToCart = (id: string, qty = 1) => {
    const found = cart.find((item) => item.id === id)
    persist(found ? cart.map((item) => item.id === id ? { ...item, qty: item.qty + qty } : item) : [...cart, { id, qty }])
  }

  const setQty = (id: string, qty: number) => {
    persist(qty <= 0 ? cart.filter((item) => item.id !== id) : cart.map((item) => item.id === id ? { ...item, qty } : item))
  }

  const clearCart = () => persist([])

  const cartLines = useMemo(() => cart.map((item) => ({ ...item, product: products.find((p) => p.id === item.id)! })).filter((line) => line.product), [cart, products])
  const cartTotal = cartLines.reduce((sum, line) => sum + line.product.price * line.qty, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  const createOrder = async (customer: Customer) => {
    const order: Order = {
      id: `EST-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      customer,
      items: cartLines.map(({ product, qty }) => ({ id: product.id, name: product.name, image: product.image, images: product.images, qty, price: product.price })),
      total: cartTotal,
      paymentStatus: customer.payment === 'card' ? 'paid' : 'pending',
      status: 'new',
    }

    const endpoint = import.meta.env.VITE_ORDER_ENDPOINT
    if (endpoint) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })
      if (!response.ok) throw new Error('Не вдалося створити замовлення')
    } else {
      const current = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]') as Order[]
      localStorage.setItem(ORDER_KEY, JSON.stringify([order, ...current]))
    }

    if (customer.payment === 'card' && import.meta.env.VITE_PAYMENT_ENDPOINT) {
      await fetch(import.meta.env.VITE_PAYMENT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, amount: order.total, customer }),
      })
    }

    clearCart()
    return order
  }

  return <ShopContext.Provider value={{ cart, cartCount, addToCart, setQty, clearCart, cartLines, cartTotal, createOrder }}>{children}</ShopContext.Provider>
}

export function useShop() {
  const value = useContext(ShopContext)
  if (!value) throw new Error('useShop must be used inside ShopProvider')
  return value
}
