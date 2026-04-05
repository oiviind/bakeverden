// src/components/admin/BatchListItem.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toggleBatchActive } from '@/lib/actions/toggleBatchActive'
import { Card, Badge, Button, Alert, getButtonClassName } from '@/components/ui'

interface BatchListItemProps {
  batch: any
}

export default function BatchListItem({ batch }: BatchListItemProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleToggle() {
    setLoading(true)
    setError(null)

    const result = await toggleBatchActive(batch.id, !batch.is_active)

    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Noe gikk galt')
    }
  }

  const ingredients = batch.batch_ingredients?.map((bi: any) => bi.ingredient) || []

  return (
    <Card>
      <Card.Content>
        {error && (
          <Alert variant="error" className="mb-4">{error}</Alert>
        )}

        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{batch.title}</h3>
            <p className="text-sm text-gray-600">{batch.description}</p>
          </div>
          <Badge variant={batch.is_active ? 'success' : 'error'}>
            {batch.is_active ? 'Aktiv' : 'Inaktiv'}
          </Badge>
        </div>

        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {ingredients.map((ing: any) => (
              <Badge
                key={ing.id}
                variant={ing.allergen ? 'error' : 'info'}
              >
                {ing.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-600 mb-4">
          <span>💰 {batch.price},-</span>
          {batch.total_quantity < 999999 && (
            <span className="ml-4">📦 {batch.remaining_quantity}/{batch.total_quantity}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href={`/admin/batches/${batch.id}/edit`}
            className={getButtonClassName('secondary', 'md', true)}
          >
            ✏️ Rediger
          </Link>
          <Button
            onClick={handleToggle}
            loading={loading}
            variant={batch.is_active ? 'danger' : 'primary'}
            fullWidth
          >
            {batch.is_active ? '🚫 Deaktiver kake' : '✅ Aktiver kake'}
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}