'use client'

import { useCart } from '@/lib/contexts/CartContext'

export default function CartIcon() {
  const { getTotalItems } = useCart()
  const itemCount = getTotalItems()

  return (
    <div className="relative inline-flex items-center">
      <span className="text-xl">🛒</span>
      {itemCount > 0 && (
        <span className="cart-notification-badge" style={{ top: '-0.5rem', right: '-0.5rem' }}>
          {itemCount}
        </span>
      )}
    </div>
  )
}