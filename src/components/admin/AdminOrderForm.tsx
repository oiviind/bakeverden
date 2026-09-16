'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMultipleOrders } from '@/lib/actions/createMultipleOrders'
import { Button, Alert } from '@/components/ui'
import CakeRequestForm from '@/components/CakeRequestForm'
import type { ProductBatch } from '@/types/database.types'

interface AdminOrderFormProps {
  batches: ProductBatch[]
}

export default function AdminOrderForm({ batches }: AdminOrderFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [orderType, setOrderType] = useState<'julebakst' | 'kake'>('julebakst')

  function setQty(batchId: string, value: number) {
    setQuantities(prev => {
      const next = { ...prev }
      if (value <= 0) delete next[batchId]
      else next[batchId] = value
      return next
    })
  }

  const selectedItems = Object.entries(quantities).filter(([, qty]) => qty > 0)

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
    <div className="space-y-6">
      {/* Velg type bestilling */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant={orderType === 'julebakst' ? 'primary' : 'secondary'}
          onClick={() => setOrderType('julebakst')}
        >
          Julebakst
        </Button>
        <Button
          type="button"
          variant={orderType === 'kake' ? 'primary' : 'secondary'}
          onClick={() => setOrderType('kake')}
        >
          Kakebestilling
        </Button>
      </div>

      {orderType === 'kake' ? (
        <CakeRequestForm isAdmin />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          {/* Velg kaker */}
          <div>
            <h3 className="font-semibold mb-3">Velg kaker</h3>
            <div className="space-y-3">
              {batches.map(batch => (
                <div key={batch.id} className="flex items-center justify-between gap-3 border rounded-lg p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {batch.image_url ? (
                      <img
                        src={batch.image_url}
                        alt={batch.title}
                        className="w-14 h-14 object-cover rounded-lg shrink-0"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-2xl opacity-60"
                        aria-label="Ingen bilde"
                      >
                        📷
                      </div>
                    )}
                    <div className="font-medium truncate">{batch.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty(batch.id, (quantities[batch.id] ?? 0) - 1)}
                      disabled={!quantities[batch.id]}
                      className="stepper-button stepper-minus"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{quantities[batch.id] ?? 0}</span>
                    <button
                      type="button"
                      onClick={() => setQty(batch.id, (quantities[batch.id] ?? 0) + 1)}
                      disabled={(quantities[batch.id] ?? 0) >= batch.remaining_quantity}
                      className="stepper-button stepper-plus"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
      )}
    </div>
  )
}
