import { createAdminClient } from '@/lib/supabase/admin'
import Header from '@/components/Header'
import RequestCard from '@/components/admin/RequestCard'
import { getButtonClassName } from '@/components/ui'
import Link from 'next/link'

export const revalidate = 0

export default async function AdminRequestsPage() {
  const supabase = createAdminClient()
  const { data: requests } = await supabase
    .from('cake_requests')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn />
      <main className="container pt-4 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="page-title">Kakeforespørsler</h1>
        </div>

        {!requests || requests.length === 0 ? (
          <p className="text-gray-500">Ingen forespørsler ennå.</p>
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <RequestCard key={r.id} request={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
