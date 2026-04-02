'use client'

import { useCart } from '@/lib/contexts/CartContext'
import { createMultipleOrders } from '@/lib/actions/createMultipleOrders'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function CheckoutPage() {
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Legg til cart items i formData
    formData.append('cartItems', JSON.stringify(
      items.map(item => ({
        batchId: item.batch.id,
        quantity: item.quantity
      }))
    ))

    const result = await createMultipleOrders(formData)

    setLoading(false)

    if (result.success) {
      clearCart()
      router.push(`/order-confirmation?orderId=${result.orderId}`)
    } else {
      setError(result.error || 'Noe gikk galt')
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container py-6">
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <div className="card-content text-center py-8">
                <p className="text-gray-500 mb-4">Handlekurven er tom</p>
                <Link href="/" className="btn btn-primary">
                  Tilbake til forsiden
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Fullfør bestilling</h1>

          {/* Ordre-sammendrag */}
          <div className="card mb-6">
            <div className="card-content">
              <h2 className="font-semibold text-lg mb-4">Din bestilling:</h2>
              
              {items.map(item => (
                <div key={item.batch.id} className="flex justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{item.batch.title}</div>
                    <div className="text-sm text-gray-600">
                      {item.quantity} stk × {item.batch.price},-
                    </div>
                  </div>
                  <div className="font-semibold">
                    {item.batch.price * item.quantity},-
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4 text-xl font-bold border-t mt-4">
                <span>Totalt ({getTotalItems()} stk):</span>
                <span className="text-pink-600">{getTotalPrice()},-</span>
              </div>
            </div>
          </div>

          {/* Kontaktinformasjon */}
          <div className="card">
            <div className="card-content">
              <h2 className="font-semibold text-lg mb-4">Kontaktinformasjon:</h2>

              {error && (
                <div className="alert alert-error mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="spinner"></span>
                      Sender bestilling...
                    </span>
                  ) : (
                    `Bestill (${getTotalPrice()},-)`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}