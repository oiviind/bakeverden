import Link from 'next/link'
import { Card, getButtonClassName } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'
import { SendReceiptButton } from '@/components/SendReceiptButton'

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  let hasEmail = false
  let order: {
    total_price: number
    order_items: Array<{ quantity: number; price_at_time: number; batch: { title: string } | null }>
  } | null = null

  if (orderId) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select('email, total_price, order_items(quantity, price_at_time, batch:product_batches(title))')
      .eq('id', orderId)
      .single()
    hasEmail = !!data?.email
    order = data
      ? {
          total_price: data.total_price,
          order_items: data.order_items.map((item) => ({
            quantity: item.quantity,
            price_at_time: item.price_at_time,
            batch: Array.isArray(item.batch) ? (item.batch[0] ?? null) : item.batch,
          })),
        }
      : null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <Card.Content>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold mb-2">Bestilling mottatt!</h1>
              <p className="text-gray-600 mb-4">
                Tusen takk for din bestilling! Du vil bli kontaktet angående henting.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                <strong>Betal ved henting.</strong>
              </p>

              {order && order.order_items.length > 0 && (
                <div className="text-left border-t border-b border-gray-200 py-4 mb-6">
                  <h2 className="font-semibold mb-2">Din bestilling</h2>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {order.order_items.map((item, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span>{item.batch?.title ?? 'Ukjent'} × {item.quantity}</span>
                        <span>{item.price_at_time * item.quantity} kr</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between font-semibold mt-3 pt-3 border-t border-gray-200">
                    <span>Totalt</span>
                    <span>{order.total_price} kr</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {orderId && hasEmail && (
                  <SendReceiptButton orderId={orderId} />
                )}
                <Link href="/" className={getButtonClassName('primary', 'md', true)}>
                  Tilbake til forsiden
                </Link>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}
