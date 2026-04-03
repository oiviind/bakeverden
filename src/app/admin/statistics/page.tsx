// src/app/admin/statistics/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, getButtonClassName } from '@/components/ui'

export const revalidate = 0

export default async function StatisticsPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      total_price,
      status,
      order_items (
        quantity
      )
    `)

  const stats = {
    totalOrdered: 0,
    totalDelivered: 0,
    totalReady: 0,
    revenueTotal: 0,
    revenueDelivered: 0,
    revenueReady: 0
  }

  orders?.forEach(order => {
    const cakeCount = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
    
    stats.totalOrdered += cakeCount
    stats.revenueTotal += order.total_price

    if (order.status === 'delivered') {
      stats.totalDelivered += cakeCount
      stats.revenueDelivered += order.total_price
    } else if (order.status === 'ready') {
      stats.totalReady += cakeCount
      stats.revenueReady += order.total_price
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="header sticky top-0 z-10">
        <div className="container">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-white">
              📊 Statistikk
            </h1>
            <Link href="/admin" className={getButtonClassName('ghost', 'sm')}>
              ← Tilbake til admin
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="max-w-4xl mx-auto">
          {/* Cake statistics */}
          <section className="mb-8">
            <h2 className="section-heading mb-4">Antall kaker</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <Card.Content>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Totalt bestilt</p>
                    <p className="text-4xl font-bold text-primary">{stats.totalOrdered}</p>
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Content>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Levert</p>
                    <p className="text-4xl font-bold text-success">{stats.totalDelivered}</p>
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Content>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Klare for henting</p>
                    <p className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>
                      {stats.totalReady}
                    </p>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </section>

          {/* Revenue statistics */}
          <section>
            <h2 className="section-heading mb-4">Økonomi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <Card.Content>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Total inntekt (bestilt)</p>
                    <p className="text-4xl font-bold text-primary">{stats.revenueTotal},-</p>
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Content>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Inntekt (levert)</p>
                    <p className="text-4xl font-bold text-success">{stats.revenueDelivered},-</p>
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Content>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Forventet (klare)</p>
                    <p className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>
                      {stats.revenueReady},-
                    </p>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}