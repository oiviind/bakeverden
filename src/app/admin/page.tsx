import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Header from '@/components/Header'

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
          <div className="alert alert-error">
            Feil ved lasting: {error.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link href="/admin/batches" className="btn btn-primary">
            Administrer kaker
          </Link>
        </div>

        <div className="card">
          <div className="card-content">
            <h2 className="font-semibold text-lg mb-4">Alle bestillinger ({orders?.length || 0})</h2>
            
            {!orders || orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Ingen bestillinger ennå</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{order.name}</h3>
                        <p className="text-sm text-gray-600">📞 {order.phone}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleString('nb-NO')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-pink-600">
                          {order.total_price},-
                        </div>
                        <span className={`badge ${
                          order.status === 'completed' ? 'badge-success' :
                          order.status === 'confirmed' ? 'badge-warning' :
                          order.status === 'cancelled' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {order.status === 'pending' && 'Venter'}
                          {order.status === 'confirmed' && 'Bekreftet'}
                          {order.status === 'completed' && 'Fullført'}
                          {order.status === 'cancelled' && 'Kansellert'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="font-semibold text-sm mb-2">Produkter:</h4>
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm py-1">
                          <span>
                            {item.batch?.title} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            {item.price_at_time * item.quantity},-
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}