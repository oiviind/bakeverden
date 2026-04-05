// src/app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import OrderTabs from '@/components/admin/OrderTabs'
import UpdatedToast from '@/components/admin/UpdatedToast'
import { Alert } from '@/components/ui'

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
      email_sent,
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
        <Header isLoggedIn={true} />
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
      <Header isLoggedIn={true} />

      <main className="container pt-4 pb-6">
        <div className="mb-6">
          <h1 className="page-title">Admin Dashboard</h1>
        </div>

        <OrderTabs
          pendingOrders={pendingOrders}
          readyOrders={readyOrders}
          deliveredOrders={deliveredOrders}
        />
      </main>
    </div>
  )
}