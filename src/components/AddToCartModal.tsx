'use client'

import { useState } from 'react'
import { useCart } from '@/lib/contexts/CartContext'
import { Button } from '@/components/ui'
import styles from './AddToCartModal.module.css'
import type { ProductBatch } from '@/types/database.types'

interface AddToCartModalProps {
  batch: ProductBatch
  isOpen: boolean
  onClose: () => void
}

export default function AddToCartModal({ batch, isOpen, onClose }: AddToCartModalProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  if (!isOpen) return null

  const handleAddToCart = () => {
    addItem(batch, quantity)
    onClose()
    setQuantity(1)
  }

  const totalPrice = batch.price * quantity

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-md w-full ${styles.modalBody}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold">{batch.title}</h3>
              <p className="text-sm text-gray-600">{batch.price},- per stk</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none -mt-1 ml-2"
              aria-label="Lukk"
            >
              ×
            </button>
          </div>

          {batch.image_url && (
            <img
              src={batch.image_url}
              alt={batch.title}
              className={styles.thumbnail}
            />
          )}

          {/* Antall-velger */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-center">
              Hvor mange vil du ha?
            </label>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="stepper-button stepper-minus"
              >
                −
              </button>
              <div className="text-center min-w-[60px]">
                <div className="text-2xl font-bold">{quantity}</div>
                <div className="text-xs text-gray-600">av {batch.remaining_quantity}</div>
              </div>
              <button
                onClick={() => setQuantity(Math.min(batch.remaining_quantity, quantity + 1))}
                disabled={quantity >= batch.remaining_quantity}
                className="stepper-button stepper-plus"
              >
                +
              </button>
            </div>
          </div>

          {/* Total pris */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-xl font-bold text-pink-600">{totalPrice},-</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="neutral" onClick={onClose} className="flex-1">
              Avbryt
            </Button>
            <Button onClick={handleAddToCart} className="flex-1">
              🛒 Legg til
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
