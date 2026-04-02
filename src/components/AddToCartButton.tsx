'use client'

import { useState } from 'react'
import { useCart } from '@/lib/contexts/CartContext'
import { useRouter } from 'next/navigation'
import type { ProductBatch } from '@/types/database.types'

interface AddToCartButtonProps {
  batch: ProductBatch
}

export default function AddToCartButton({ batch }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const router = useRouter()

  const handleAddToCart = () => {
    addItem(batch, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addItem(batch, quantity)
    router.push('/cart')
  }

  return (
    <div className="space-y-4">
      <div className="form-group">
        <label className="form-label">Antall</label>
        <input
          type="number"
          min="1"
          max={batch.remaining_quantity}
          value={quantity}
          onChange={(e) => setQuantity(Math.min(Number(e.target.value), batch.remaining_quantity))}
          className="form-input"
        />
        <p className="text-sm text-gray-500 mt-1">
          Pris: {batch.price * quantity},-
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={added}
          className="flex-1 btn btn-secondary"
        >
          {added ? '✅ Lagt til!' : '🛒 Legg i kurv'}
        </button>

        <button
          onClick={handleBuyNow}
          className="flex-1 btn btn-primary"
        >
          Kjøp nå
        </button>
      </div>
    </div>
  )
}