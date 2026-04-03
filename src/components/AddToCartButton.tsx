'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AddToCartModal from './AddToCartModal'
import { Button } from '@/components/ui'
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
        <Button onClick={() => setIsModalOpen(true)} fullWidth>
          🛒 Legg i kurv
        </Button>

        <Button
          variant="secondary"
          fullWidth
          onClick={() => router.push('/cart')}
        >
          Gå til handlekurv
        </Button>
      </div>

      <AddToCartModal
        batch={batch}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
