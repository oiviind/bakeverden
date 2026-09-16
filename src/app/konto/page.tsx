import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  // Claim guest orders placed with the same (verified) email
  if (user.email) {
    await createAdminClient()
      .from('orders')
      .update({ user_id: user.id })
      .is('user_id', null)
      .ilike('email', user.email.replace(/[\\%_]/g, '\\$&'))
  }

  // RLS restricts rows to user_id = auth.uid()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total_price, created_at, order_items(quantity, price_at_time, batch:product_batches(title))')
    .order('created_at', { ascending: false })

  // Set by Google OAuth; absent for email OTP logins
  const avatarUrl: string | undefined = user.user_metadata?.avatar_url ?? user.user_metadata?.picture

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })

  const activeOrders = (orders ?? []).filter((o) => o.status !== 'delivered')
  const pastOrders = (orders ?? []).filter((o) => o.status === 'delivered')

  const renderOrder = (order: NonNullable<typeof orders>[number]) => {
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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="section-heading mb-2">Min konto</h1>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>

          <h2 className="section-heading mb-4">Mine bestillinger</h2>

          {!orders || orders.length === 0 ? (
            <Card>
              <Card.Content>
                <p className="text-center py-4">Du har ingen bestillinger ennå.</p>
              </Card.Content>
            </Card>
          ) : (
            <>
              {activeOrders.length === 0 ? (
                <p className="text-sm">Du har ingen aktive bestillinger.</p>
              ) : (
                <div className="space-y-4 md:space-y-6">{activeOrders.map(renderOrder)}</div>
              )}

              {pastOrders.length > 0 && (
                <details className="group mt-8">
                  <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 border-b border-[var(--border)] py-3 [&::-webkit-details-marker]:hidden">
                    <span className="section-heading">Tidligere bestillinger ({pastOrders.length})</span>
                    <svg
                      className="h-5 w-5 shrink-0 text-[var(--text-light)] transition-transform group-open:rotate-180"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </summary>
                  <div className="space-y-4 md:space-y-6 mt-4">{pastOrders.map(renderOrder)}</div>
                </details>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
