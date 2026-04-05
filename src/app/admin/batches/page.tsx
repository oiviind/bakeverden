// src/app/admin/batches/page.tsx
import { createClient } from '@/lib/supabase/server'
import BatchTabs from '@/components/admin/BatchTabs'
import UpdatedToast from '@/components/admin/UpdatedToast'
import Header from '@/components/Header'

export const revalidate = 0

export default async function AdminBatchesPage() {
  const supabase = await createClient()

  const { data: batches } = await supabase
    .from('product_batches')
    .select(`
      *,
      batch_ingredients (
        ingredient:ingredients (
          id,
          name,
          allergen
        )
      )
    `)
    .order('created_at', { ascending: false })

  const { data: allIngredients } = await supabase
    .from('ingredients')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      <UpdatedToast />
              <Header isLoggedIn={true} />
      <main className="container pt-4 pb-6">
        <BatchTabs batches={batches || []} ingredients={allIngredients || []} />
      </main>
    </div>
  )
}