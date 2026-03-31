import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 0

export default async function AdminPage() {
  const supabase = createClient()
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      name,
      phone,
      quantity,
      status,
      created_at,
      batch:product_batches(
        title,
        price,
        pickup_start,
        pickup_end
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return (
      <div className="container mt-8">
        <div className="alert alert-error">
          Feil ved lasting: {error.message}
        </div>
      </div>
    )
  }

  // Grupper etter kake
  const ordersByBatch = orders?.reduce((acc: any, order: any) => {
    const batchTitle = order.batch?.title || 'Ukjent'
    if (!acc[batchTitle]) {
      acc[batchTitle] = []
    }
    acc[batchTitle].push(order)
    return acc
  }, {})

  const totalOrders = orders?.length || 0
  const totalQuantity = orders?.reduce((sum: number, order: any) => sum + order.quantity, 0) || 0
  const totalRevenue = orders?.reduce((sum: number, order: any) => {
    const price = order.batch?.price || 0
    return sum + (price * order.quantity)
  }, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile optimized */}
      <header className="header sticky top-0 z-10">
  <div className="container">
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
      <h1 className="text-xl sm:text-2xl font-bold text-pink-600">
        ⚙️ Oversikt over bestillinger
      </h1>
      <div className="flex gap-4">
        <Link 
          href="/admin/batches" 
          className="text-blue-500 hover:underline text-sm sm:text-base"
        >
          + Legg til kaker
        </Link>
        <Link 
          href="/" 
          className="text-blue-500 hover:underline text-sm sm:text-base"
        >
          ← Til forsiden
        </Link>
      </div>
    </div>
  </div>
</header>

      <main className="container py-4">
        {/* Statistikk - Mobile stacked */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="card card-content text-center py-4">
            <div className="text-2xl sm:text-3xl font-bold text-pink-600">
              {totalOrders}
            </div>
            <div className="text-sm text-gray-600">Bestillinger</div>
          </div>
          <div className="card card-content text-center py-4">
            <div className="text-2xl sm:text-3xl font-bold text-pink-600">
              {totalQuantity}
            </div>
            <div className="text-sm text-gray-600">Kaker</div>
          </div>
          <div className="card card-content text-center py-4">
            <div className="text-2xl sm:text-3xl font-bold text-pink-600">
              {totalRevenue.toFixed(0)},-
            </div>
            <div className="text-sm text-gray-600">Totalt</div>
          </div>
        </div>

        {/* Bestillinger */}
        {!orders || orders.length === 0 ? (
          <div className="card card-content text-center py-8">
            <p className="text-gray-500">Ingen bestillinger enda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(ordersByBatch || {}).map(([batchTitle, batchOrders]: [string, any]) => {
              const orders = batchOrders as any[]
              const totalQty = orders.reduce((sum, o) => sum + o.quantity, 0)
              const pickupDate = orders[0]?.batch?.pickup_start
              
              return (
                <div key={batchTitle} className="card">
                  <div className="card-content">
                    {/* Cake header - Mobile optimized */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 pb-4 border-b">
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl font-bold mb-1">
                          {batchTitle}
                        </h2>
                        {pickupDate && (
                          <p className="text-sm text-gray-600">
                            📅 {new Date(pickupDate).toLocaleDateString('nb-NO', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-4 sm:flex-col sm:text-right">
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-pink-600">
                            {totalQty} stk
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            {orders.length} bestillinger
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Orders list - Mobile cards instead of table */}
                    <div className="space-y-3">
                      {orders.map((order: any) => (
                        <div 
                          key={order.id} 
                          className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          {/* Mobile layout */}
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                {order.name}
                              </div>
                              <a 
                                href={`tel:${order.phone}`} 
                                className="text-sm text-blue-600 hover:underline"
                              >
                                📞 {order.phone}
                              </a>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-pink-600">
                                {order.quantity} stk
                              </div>
                              <div className="text-sm font-semibold text-gray-700">
                                {order.batch?.price ? (order.batch.price * order.quantity).toFixed(0) : '0'},-
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            🕐 {new Date(order.created_at).toLocaleString('nb-NO', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}