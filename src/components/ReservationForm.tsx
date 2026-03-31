'use client'

import { useState } from 'react'
import { createOrder } from '@/lib/actions/createOrder'
import type { ProductBatch } from '@/types/database.types'

interface ReservationFormProps {
  batch: ProductBatch
}

export default function ReservationForm({ batch }: ReservationFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    // DEBUG: Se hva som sendes
    console.log('Form data:', {
      batchId: formData.get('batchId'),
      name: formData.get('name'),
      phone: formData.get('phone'),
      quantity: formData.get('quantity'),
      batch_remaining: batch.remaining_quantity
    })
    
    const result = await createOrder(formData)
    
    console.log('Result:', result)
    
    setLoading(false)
    
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Noe gikk galt')
    }
  }
  
  if (success) {
    return (
      <div className="alert alert-success">
        <h2 className="card-title mb-2">✅ Bestilt!</h2>
        <p>Din bestilling er registrert! Tusen takk for at du valgte å bestille mine kaker</p>
        <p className="mt-2"><strong>Betal ved henting.</strong></p>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="batchId" value={batch.id} />
      
      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label className="form-label">Navn *</label>
        <input 
          type="text" 
          name="name" 
          required 
          className="form-input"
          placeholder="Ditt fulle navn"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Telefon *</label>
        <input 
          type="tel" 
          name="phone" 
          required 
          className="form-input"
          placeholder="12345678"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Antall *</label>
        <input 
          type="number" 
          name="quantity" 
          min="1" 
          max={batch.remaining_quantity}
          defaultValue="1"
          required 
          className="form-input"
        />
        <small className="text-gray-500 mt-1 block">
          Maks {batch.remaining_quantity} tilgjengelig
        </small>
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="btn btn-primary btn-block"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner"></span>
            Reserverer...
          </span>
        ) : (
          'Bestill'
        )}
      </button>
    </form>
  )
}