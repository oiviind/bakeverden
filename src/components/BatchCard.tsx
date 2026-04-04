'use client'

import { useState } from 'react'
import Link from 'next/link'
import AddToCartModal from './AddToCartModal'
import { Card, Button, getButtonClassName } from '@/components/ui'
import type { ProductBatch } from '@/types/database.types'

interface BatchCardProps {
  batch: ProductBatch
}

export default function BatchCard({ batch }: BatchCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isSoldOut = batch.remaining_quantity === 0

  const fmtPickup = (iso: string) =>
    new Date(iso).toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  const pickupEnd = fmtPickup(batch.pickup_end)

  return (
    <>
      <Card muted={isSoldOut}>
        {batch.image_url && (
          <Link href={`/reserve/${batch.id}`}>
            <div className="relative">
              <Card.Image
                src={batch.image_url}
                alt={batch.title}
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

        <Card.Content>
          <Link href={`/reserve/${batch.id}`}>
            <Card.Title className="mb-2 hover:text-pink-600 transition-colors">
              {batch.title}
            </Card.Title>
          </Link>

          {batch.description && (
            <Card.Description className="text-sm mb-4 line-clamp-2">
              {batch.description}
            </Card.Description>
          )}

          <div className="flex items-center justify-between mb-4">
            <Card.Price>{batch.price},-</Card.Price>
            <div className="text-sm text-gray-600">{batch.remaining_quantity} igjen</div>
          </div>

          <div className="font-semibold mb-1">📅 Levering innen:</div>
          <div className="mb-3 text-sm">{pickupEnd}</div>

          <div className="flex flex-col gap-3 mt-4">
            {!isSoldOut && (
              <Button onClick={() => setIsModalOpen(true)} fullWidth>
                🛒 Legg i kurv
              </Button>
            )}

            <Link
              href={`/reserve/${batch.id}`}
              className={getButtonClassName('secondary', 'md', true)}
            >
              Se detaljer
            </Link>
          </div>
        </Card.Content>
      </Card>

      <AddToCartModal
        batch={batch}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
