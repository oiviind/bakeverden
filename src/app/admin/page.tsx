import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Header from '@/components/Header'
import { Card, Badge, Alert, getButtonClassName } from '@/components/ui'

export const revalidate = 0

export default async function AdminPage() {
  const supabase = createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      name,
      phone,
      total_price,
      status,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="page-title" style={{ marginBottom: 0 }}>Admin Dashboard</h1>
          <Link href="/admin/batches" className={getButtonClassName('primary')}>
            Administrer kaker
          </Link>
        </div>

        <p className="text-gray-600 mb-6">
          Alle bestillinger ({orders?.length || 0})
        </p>

        {!orders || orders.length === 0 ? (
          <Card>
            <Card.Content>
              <p className="text-gray-500 text-center py-8">Ingen bestillinger ennå</p>
            </Card.Content>
          </Card>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {orders.map((order: any) => (
              <Card key={order.id}>
                <Card.Content>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-semibold text-lg">{order.name}</h2>
                      <p className="text-sm text-gray-600">📞 {order.phone}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.created_at).toLocaleString('nb-NO')}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="text-xl font-bold text-pink-600">
                        {order.total_price},-
                      </span>
                      <Badge
                        variant={
                          order.status === 'completed' ? 'success' :
                          order.status === 'cancelled' ? 'error' :
                          'warning'
                        }
                      >
                        {order.status === 'pending' && 'Venter'}
                        {order.status === 'confirmed' && 'Bekreftet'}
                        {order.status === 'completed' && 'Fullført'}
                        {order.status === 'cancelled' && 'Kansellert'}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="font-semibold text-sm mb-2">Produkter:</h3>
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm py-1">
                        <span>{item.batch?.title} × {item.quantity}</span>
                        <span className="font-medium">
                          {item.price_at_time * item.quantity},-
                        </span>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
