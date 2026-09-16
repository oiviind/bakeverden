import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import { Card, Badge } from '@/components/ui'

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  pending: { label: 'Venter', variant: 'warning' },
  ready: { label: 'Klar for henting', variant: 'info' },
  delivered: { label: 'Levert', variant: 'success' },
  cancelled: { label: 'Avbrutt', variant: 'error' },
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/logg-inn')

  // RLS restricts rows to user_id = auth.uid()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total_price, created_at, order_items(quantity, price_at_time, batch:product_batches(title))')
    .order('created_at', { ascending: false })

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="section-heading mb-2">Min konto</h1>
          <p className="text-sm mb-6">{user.email}</p>

          <h2 className="section-heading mb-4">Mine bestillinger</h2>

          {!orders || orders.length === 0 ? (
            <Card>
              <Card.Content>
                <p className="text-center py-4">Du har ingen bestillinger ennå.</p>
              </Card.Content>
            </Card>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {orders.map((order) => {
                const status = STATUS_LABELS[order.status] ?? { label: order.status, variant: 'info' as const }
                return (
                  <Card key={order.id}>
                    <Card.Content>
                      <div className="flex justify-between items-center mb-3">
                        <Card.Meta>{fmtDate(order.created_at)}</Card.Meta>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <ul className="space-y-1 mb-3">
                        {order.order_items.map((item, i) => {
                          const batch = Array.isArray(item.batch) ? (item.batch[0] ?? null) : item.batch
                          return (
                            <li key={i} className="flex justify-between text-sm">
                              <span>{item.quantity} × {batch?.title ?? 'Ukjent'}</span>
                              <span>{item.quantity * item.price_at_time} kr</span>
                            </li>
                          )
                        })}
                      </ul>
                      <Card.Price>Totalt: {order.total_price} kr</Card.Price>
                    </Card.Content>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
