'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMultipleOrders } from '@/lib/actions/createMultipleOrders'
import { Button, Alert } from '@/components/ui'
import type { ProductBatch } from '@/types/database.types'

interface AdminOrderFormProps {
  batches: ProductBatch[]
}

export default function AdminOrderForm({ batches }: AdminOrderFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  function setQty(batchId: string, value: number) {
    setQuantities(prev => {
      const next = { ...prev }
      if (value <= 0) delete next[batchId]
      else next[batchId] = value
      return next
    })
  }

  const selectedItems = Object.entries(quantities).filter(([, qty]) => qty > 0)
  const total = selectedItems.reduce((sum, [id, qty]) => {
    const batch = batches.find(b => b.id === id)
    return sum + (batch?.price ?? 0) * qty
  }, 0)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedItems.length === 0) {
      setError('Velg minst én kake')
      return
    }
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('cartItems', JSON.stringify(
      selectedItems.map(([batchId, quantity]) => ({ batchId, quantity }))
    ))

    const result = await createMultipleOrders(formData)
    setLoading(false)

    if (result.success) {
      router.push('/admin?created=1')
    } else {
      setError(result.error || 'Noe gikk galt')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      {/* Velg kaker */}
      <div>
        <h3 className="font-semibold mb-3">Velg kaker</h3>
        <div className="space-y-3">
          {batches.map(batch => (
            <div key={batch.id} className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <div className="font-medium">{batch.title}</div>
                <div className="text-sm text-gray-500">{batch.price},- per stk · {batch.remaining_quantity} igjen</div>
              </div>
              <input
                type="number"
                min="0"
                max={batch.remaining_quantity}
                value={quantities[batch.id] ?? 0}
                onChange={e => setQty(batch.id, Number(e.target.value))}
                className="form-input w-20 text-center"
              />
            </div>
          ))}
        </div>
        {selectedItems.length > 0 && (
          <div className="mt-3 text-right font-semibold">Totalt: {total},-</div>
        )}
      </div>

      {/* Kundeinformasjon */}
      <div>
        <h3 className="font-semibold mb-3">Kundeinformasjon</h3>
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Navn *</label>
            <input type="text" name="name" required className="form-input" placeholder="Fullt navn" />
          </div>
          <div className="form-group">
            <label className="form-label">Telefon *</label>
            <input type="tel" name="phone" required className="form-input" placeholder="12345678" />
          </div>
          <div className="form-group">
            <label className="form-label">E-post *</label>
            <input type="email" name="email" required className="form-input" placeholder="kunde@epost.no" />
          </div>
        </div>
      </div>

      <Button type="submit" fullWidth loading={loading}>
        {loading ? 'Oppretter bestilling...' : 'Opprett bestilling'}
      </Button>
    </form>
  )
}
