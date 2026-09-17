// src/app/admin/statistics/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { Card } from '@/components/ui'
import Header from '@/components/Header'

export const revalidate = 0

export default async function StatisticsPage() {
  const supabase = createAdminClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      total_price,
      status,
      order_items (
        quantity,
        batch:product_batches (
          title
        )
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

  const cakeTotals: Record<string, { title: string; count: number }> = {}

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

    order.order_items?.forEach((item: any) => {
      const title = item.batch?.title || 'Ukjent'
      if (!cakeTotals[title]) cakeTotals[title] = { title, count: 0 }
      cakeTotals[title].count += item.quantity
    })
  })

  const topCakes = Object.values(cakeTotals)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="container pt-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">📊 Statistikk</h1>
          {/* Cake statistics */}
          <section className="mb-8">
            <h2 className="section-heading mb-4">Antall kaker</h2>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <Card>
                <Card.Content className="p-3! md:p-6!">
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Totalt bestilt</p>
                    <p className="text-xl md:text-4xl font-bold text-primary">{stats.totalOrdered}</p>
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Content className="p-3! md:p-6!">
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Levert</p>
                    <p className="text-xl md:text-4xl font-bold text-success">{stats.totalDelivered}</p>
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Content className="p-3! md:p-6!">
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Klare for henting</p>
                    <p className="text-xl md:text-4xl font-bold text-primary">
                      {stats.totalReady}
                    </p>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </section>

          {/* Revenue statistics */}
          <section className="mb-8">
            <h2 className="section-heading mb-4">Økonomi</h2>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <Card>
                <Card.Content className="p-3! md:p-6!">
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Total inntekt (bestilt)</p>
                    <p className="text-xl md:text-4xl font-bold text-primary">{stats.revenueTotal},-</p>
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Content className="p-3! md:p-6!">
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Inntekt (levert)</p>
                    <p className="text-xl md:text-4xl font-bold text-success">{stats.revenueDelivered},-</p>
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Content className="p-3! md:p-6!">
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Forventet (klare)</p>
                    <p className="text-xl md:text-4xl font-bold text-primary">
                      {stats.revenueReady},-
                    </p>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </section>

          {/* Popular cakes */}
          <section>
            <h2 className="section-heading mb-4">Mest populære kaker</h2>
            <Card>
              <Card.Content>
                {topCakes.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Ingen data</p>
                ) : (
                  <ol className="space-y-3">
                    {topCakes.map((cake, i) => (
                      <li key={cake.title} className="flex justify-between items-center">
                        <span className="font-medium">{i + 1}. {cake.title}</span>
                        <span className="text-gray-600 text-sm">{cake.count} stk</span>
                      </li>
                    ))}
                  </ol>
                )}
              </Card.Content>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
