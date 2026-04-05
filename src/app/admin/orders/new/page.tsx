import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Link from 'next/link'
import { Card, getButtonClassName } from '@/components/ui'
import AdminOrderForm from '@/components/admin/AdminOrderForm'

export default async function NewAdminOrderPage() {
  const supabase = await createClient()

  const { data: batches } = await supabase
    .from('product_batches')
    .select('*')
    .eq('is_active', true)
    .gt('remaining_quantity', 0)
    .order('pickup_start', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="container pt-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <Card.Content>
              <h2 className="section-heading mb-6">Ny bestilling</h2>
              <AdminOrderForm batches={batches || []} />
            </Card.Content>
          </Card>
        </div>
      </main>
    </div>
  )
}
