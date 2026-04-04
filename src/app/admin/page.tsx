// src/app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Header from '@/components/Header'
import OrderCard from '@/components/admin/OrderCard'
import UpdatedToast from '@/components/admin/UpdatedToast'
import { Card, Alert, getButtonClassName } from '@/components/ui'

export const revalidate = 0

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      name,
      phone,
      email,
      total_price,
      status,
      sms_sent,
      created_at,
      order_items (
        id,
        quantity,
        price_at_time,
        batch:product_batches (
          title,
          pickup_start,
          pickup_end
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mt-8">
          <Alert variant="error">Feil ved lasting: {error.message}</Alert>
        </div>
      </div>
    )
  }

  // Group orders by status
  const pendingOrders = orders?.filter(o => o.status === 'pending') || []
  const readyOrders = orders?.filter(o => o.status === 'ready') || []
  const deliveredOrders = orders?.filter(o => o.status === 'delivered') || []

  return (
    <div className="min-h-screen bg-gray-50">
      <UpdatedToast />
      <Header />

      <main className="container py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="page-title" style={{ marginBottom: 0 }}>Admin Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/admin/statistics" className={getButtonClassName('secondary')}>
              📊 Statistikk
            </Link>
            <Link href="/admin/orders/new" className={getButtonClassName('secondary')}>
              📝 Ny bestilling
            </Link>
            <Link href="/admin/batches" className={getButtonClassName('primary')}>
              🍰 Administrer kaker
            </Link>
          </div>
        </div>

        {/* Pending Orders */}
        <section className="mb-8">
          <h2 className="section-heading mb-4">
            Nye bestillinger ({pendingOrders.length})
          </h2>
          {pendingOrders.length === 0 ? (
            <Card>
              <Card.Content>
                <p className="text-gray-500 text-center py-8">Ingen nye bestillinger</p>
              </Card.Content>
            </Card>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {pendingOrders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>

        {/* Ready Orders */}
        <section className="mb-8">
          <h2 className="section-heading mb-4">
            Klare for henting ({readyOrders.length})
          </h2>
          {readyOrders.length === 0 ? (
            <Card>
              <Card.Content>
                <p className="text-gray-500 text-center py-8">Ingen bestillinger klare for henting</p>
              </Card.Content>
            </Card>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {readyOrders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>

        {/* Delivered Orders - History */}
        <section>
          <h2 className="section-heading mb-4">
            Historikk ({deliveredOrders.length})
          </h2>
          {deliveredOrders.length === 0 ? (
            <Card>
              <Card.Content>
                <p className="text-gray-500 text-center py-8">Ingen leverte bestillinger</p>
              </Card.Content>
            </Card>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {deliveredOrders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}