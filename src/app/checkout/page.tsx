'use client'

import { useCart } from '@/lib/contexts/CartContext'
import { createMultipleOrders } from '@/lib/actions/createMultipleOrders'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { Card, Button, Alert, getButtonClassName } from '@/components/ui'

export default function CheckoutPage() {
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

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
            <Card>
              <Card.Content>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Handlekurven er tom</p>
                  <Link href="/" className={getButtonClassName('primary')}>
                    Tilbake til forsiden
                  </Link>
                </div>
              </Card.Content>
            </Card>
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
          <Card className="mb-6">
            <Card.Content>
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
            </Card.Content>
          </Card>

          {/* Kontaktinformasjon */}
          <Card>
            <Card.Content>
              <h2 className="font-semibold text-lg mb-4">Kontaktinformasjon:</h2>

              {error && (
                <Alert variant="error" className="mb-4">
                  {error}
                </Alert>
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

                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                >
                  {loading ? 'Sender bestilling...' : `Bestill (${getTotalPrice()},-)`}
                </Button>
              </form>
            </Card.Content>
          </Card>
        </div>
      </main>
    </div>
  )
}
