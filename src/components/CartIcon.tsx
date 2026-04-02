'use client'

import { useCart } from '@/lib/contexts/CartContext'

export default function CartIcon() {
  const { getTotalItems } = useCart()
  const itemCount = getTotalItems()

  return (
    <div className="relative inline-flex items-center">
      <span className="text-xl">🛒</span>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
          {itemCount}
        </span>
      )}
    </div>
  )
}