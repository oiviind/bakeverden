'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { ProductBatch } from '@/types/database.types'

interface CartItem {
  batch: ProductBatch
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (batch: ProductBatch, quantity: number) => void
  removeItem: (batchId: string) => void
  updateQuantity: (batchId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Last inn fra localStorage ved mount
  useEffect(() => {
    const saved = localStorage.getItem('bakeverden-cart')
    if (saved) {
      setItems(JSON.parse(saved))
    }
  }, [])

  // Lagre til localStorage ved endringer
  useEffect(() => {
    localStorage.setItem('bakeverden-cart', JSON.stringify(items))
  }, [items])

  const addItem = (batch: ProductBatch, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(item => item.batch.id === batch.id)
      
      if (existing) {
        // Oppdater eksisterende item
        return prev.map(item =>
          item.batch.id === batch.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, batch.remaining_quantity) }
            : item
        )
      }
      
      // Legg til nytt item
      return [...prev, { batch, quantity }]
    })
  }

  const removeItem = (batchId: string) => {
    setItems(prev => prev.filter(item => item.batch.id !== batchId))
  }

  const updateQuantity = (batchId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(batchId)
      return
    }

    setItems(prev =>
      prev.map(item =>
        item.batch.id === batchId
          ? { ...item, quantity: Math.min(quantity, item.batch.remaining_quantity) }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + (item.batch.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart må brukes innenfor CartProvider')
  }
  return context
}