'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AddToCartModal from './AddToCartModal'
import type { ProductBatch } from '@/types/database.types'

interface AddToCartButtonProps {
  batch: ProductBatch
}

export default function AddToCartButton({ batch }: AddToCartButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-block"
        >
          🛒 Legg i kurv
        </button>

        <button
          onClick={() => router.push('/cart')}
          className="btn btn-secondary btn-block"
        >
          Gå til handlekurv
        </button>
      </div>

      <AddToCartModal
        batch={batch}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}