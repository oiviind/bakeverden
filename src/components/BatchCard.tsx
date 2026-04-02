'use client'

import { useCart } from '@/lib/contexts/CartContext'
import { useState } from 'react'
import Link from 'next/link'
import type { ProductBatch } from '@/types/database.types'

interface BatchCardProps {
  batch: ProductBatch
}

export default function BatchCard({ batch }: BatchCardProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const isSoldOut = batch.remaining_quantity === 0
  
  const pickupDate = new Date(batch.pickup_start).toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })

  const handleAddToCart = () => {
    addItem(batch, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="card">
      {batch.image_url && (
        <Link href={`/reserve/${batch.id}`}>
          <div className="relative">
            <img 
              src={batch.image_url} 
              alt={batch.title}
              className="card-image"
            />
            {isSoldOut && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-lg">
                  UTSOLGT
                </span>
              </div>
            )}
          </div>
        </Link>
      )}
      
      <div className="card-content">
        <Link href={`/reserve/${batch.id}`}>
          <h2 className="card-title mb-2 hover:text-pink-600 transition-colors">
            {batch.title}
          </h2>
        </Link>
        
        {batch.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {batch.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-pink-600">
            {batch.price},-
          </div>
          <div className="text-sm text-gray-600">
            {batch.remaining_quantity} igjen
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          📅 {pickupDate}
        </div>

        {!isSoldOut && (
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              min="1"
              max={batch.remaining_quantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(Number(e.target.value), batch.remaining_quantity))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
            />
            
            <button
              onClick={handleAddToCart}
              disabled={added}
              className="flex-1 btn btn-primary"
            >
              {added ? '✅ Lagt til!' : '🛒 Legg i kurv'}
            </button>
          </div>
        )}

        <Link 
          href={`/reserve/${batch.id}`} 
          className="btn btn-secondary btn-block"
        >
          Se detaljer
        </Link>
      </div>
    </div>
  )
}