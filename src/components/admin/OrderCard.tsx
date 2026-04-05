'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { updateOrderStatus, sendReadyEmail, markSmsSent, markEmailSent } from '@/app/admin/actions'
import { Card, Badge, Button, Alert } from '@/components/ui'
import type { Order } from '@/types/database.types'

interface OrderCardProps {
  order: Order & {
    order_items?: Array<{
      id: string
      quantity: number
      price_at_time: number
      batch?: {
        title: string
        pickup_start: string
        pickup_end: string
      }
    }>
  }
}

export default function OrderCard({ order }: OrderCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(order.email_sent)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [smsSent, setSmsSent] = useState(order.sms_sent)

  async function handleSendEmail() {
    if (!order.email) return
    setLoading(true)
    setError(null)
    const result = await sendReadyEmail(order.email, order.order_items)
    setLoading(false)
    if (result.success) {
      setEmailSent(true)
      await markEmailSent(order.id)
    } else {
      setError(result.error || 'Kunne ikke sende e-post')
    }
  }

  async function handleStatusChange(newStatus: 'pending' | 'ready' | 'delivered' | 'cancelled') {
    setLoading(true)
    setError(null)

    const result = await updateOrderStatus(order.id, newStatus)

    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Noe gikk galt')
    }
  }

  const statusConfig = {
    pending: { label: 'Venter', variant: 'warning' as const, icon: '⏳' },
    ready: { label: 'Klar for henting', variant: 'info' as const, icon: '✅' },
    delivered: { label: 'Levert', variant: 'success' as const, icon: '📦' },
    cancelled: { label: 'Kansellert', variant: 'error' as const, icon: '❌' }
  }

  const config = statusConfig[order.status]

  return (
    <Card>
      <Card.Content>
        {error && (
          <Alert variant="error" className="mb-4">{error}</Alert>
        )}

        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-semibold text-lg">{order.name}</h2>
            <p className="text-sm text-gray-600">📞 {order.phone}</p>
            {order.email && (
              <p className="text-sm text-gray-600">📧 {order.email}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {new Date(order.created_at).toLocaleString('nb-NO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <span className="text-xl font-bold text-pink-600">
              {order.total_price},-
            </span>
            <Badge variant={config.variant}>
              {config.icon} {config.label}
            </Badge>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h3 className="font-semibold text-sm mb-2">Produkter:</h3>
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span>
                {item.batch?.title || 'Ukjent produkt'} × {item.quantity}
              </span>
              <span className="font-medium">
                {item.price_at_time * item.quantity},-
              </span>
            </div>
          ))}
        </div>

        {/* Status transition buttons */}
        <div className="flex flex-col gap-2">
          {order.status === 'pending' && (
            <>
              <Button
                onClick={() => handleStatusChange('ready')}
                loading={loading}
                variant="primary"
                fullWidth
              >
                ✅ Marker som klar for henting
              </Button>
              <Button
                onClick={() => setConfirmCancel(true)}
                variant="danger"
                fullWidth
              >
                ❌ Kanseller bestilling
              </Button>

              {confirmCancel && createPortal(
                <div
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                  onClick={() => setConfirmCancel(false)}
                >
                  <div
                    className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg">Kanseller bestilling</h3>
                      <button
                        onClick={() => setConfirmCancel(false)}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none -mt-1 ml-2"
                        aria-label="Lukk"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Er du sikker på at du vil kansellere bestillingen til <strong>{order.name}</strong>?
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => { setConfirmCancel(false); handleStatusChange('cancelled') }}
                        loading={loading}
                        variant="danger"
                        fullWidth
                      >
                        Kanseller
                      </Button>
                      <Button
                        onClick={() => setConfirmCancel(false)}
                        variant="neutral"
                        fullWidth
                      >
                        Avbryt
                      </Button>
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </>
          )}

          {order.status === 'ready' && (
            <>
              {order.phone && (
                <>
                  {smsSent ? (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      ✅ SMS sendt til {order.phone}
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={async () => {
                        const items = order.order_items
                          ?.map(item => `${item.batch?.title || 'Ukjent'} - x${item.quantity}`)
                          .join('\n') ?? ''
                        const body = `Din bestilling hos Kjerstis Bakeverden:\n${items}\n\nEr nå klar for henting!\nMed vennlig hilsen,\nKjersti`
                        window.location.href = `sms:${order.phone}?body=${encodeURIComponent(body)}`
                        const result = await markSmsSent(order.id)
                        if (result.success) setSmsSent(true)
                      }}
                    >
                      💬 Send SMS til kunde
                    </Button>
                  )}
                </>
              )}
              {order.email && (
                <>
                  {emailSent ? (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      ✅ E-post sendt til {order.email}
                    </div>
                  ) : (
                    <Button
                      onClick={handleSendEmail}
                      loading={loading}
                      variant="secondary"
                      fullWidth
                    >
                      📧 Send E-post til kunde
                    </Button>
                  )}
                </>
              )}
              <Button
                onClick={() => handleStatusChange('delivered')}
                loading={loading}
                variant="primary"
                fullWidth
              >
                📦 Marker som levert
              </Button>
              <Button
                onClick={() => handleStatusChange('pending')}
                loading={loading}
                variant="neutral"
                fullWidth
              >
                ⏪ Tilbake til venter
              </Button>
            </>
          )}

          {order.status === 'delivered' && (
            <Button
              onClick={() => handleStatusChange('ready')}
              loading={loading}
              variant="neutral"
              fullWidth
            >
              ⏪ Tilbake til klar for henting
            </Button>
          )}

          {order.status === 'cancelled' && (
            <Button
              onClick={() => handleStatusChange('pending')}
              loading={loading}
              variant="neutral"
              fullWidth
            >
              🔄 Reaktiver bestilling
            </Button>
          )}
        </div>
      </Card.Content>
    </Card>
  )
}