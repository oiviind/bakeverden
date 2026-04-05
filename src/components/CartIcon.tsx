'use client'

import { useCart } from '@/lib/contexts/CartContext'
import styles from './CartIcon.module.css'

export default function CartIcon() {
  const { getTotalItems } = useCart()
  const itemCount = getTotalItems()

  return (
    <div className="relative inline-flex items-center">
      <span className="text-xl">🛒</span>
      {itemCount > 0 && (
        <span className={`cart-notification-badge ${styles.badge}`}>
          {itemCount}
        </span>
      )}
    </div>
  )
}