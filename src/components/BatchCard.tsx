'use client'

import { useState } from 'react'
import Link from 'next/link'
import AddToCartModal from './AddToCartModal'
import { Card, Button } from '@/components/ui'
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

        <Card.Content className="max-md:!p-2">
          <Link href={`/reserve/${batch.id}`}>
            <Card.Title className="max-md:!text-sm max-md:!text-gray-800 mb-1 md:mb-2 hover:text-pink-600 transition-colors">
              {batch.title}
            </Card.Title>
          </Link>

          {batch.description && (
            <Card.Description className="text-sm max-md:!text-gray-800 max-md:mb-1 mb-4 line-clamp-2">
              {batch.description}
            </Card.Description>
          )}

          <div className="flex items-center justify-between mb-4 max-md:mb-1">
            <Card.Price className="md:block hidden">
              {batch.price},-
            </Card.Price>
            <div className="text-sm text-gray-600 max-md:hidden">{batch.remaining_quantity} igjen</div>
          </div>

          <div className="font-semibold mb-1 max-md:font-normal max-md:text-sm max-md:text-gray-800">📅 Levering innen:</div>
          <div className="mb-3 text-sm max-md:text-gray-800 max-md:mb-2">{pickupEnd}</div>

          <div className="flex flex-col gap-3 mt-4 max-md:gap-1 max-md:mt-2">
            {!isSoldOut && (
              <>
                <div className="md:hidden text-[15px] text-gray-800">{batch.price},-</div>
                <Button onClick={() => setIsModalOpen(true)} fullWidth>
                  Kjøp
                </Button>
              </>
            )}
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
