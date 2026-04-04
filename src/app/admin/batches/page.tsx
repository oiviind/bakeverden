// src/app/admin/batches/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import BatchForm from '@/components/admin/BatchForm'
import BatchListItem from '@/components/admin/BatchListItem'
import UpdatedToast from '@/components/admin/UpdatedToast'
import { Card, getButtonClassName } from '@/components/ui'
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
              <Header />
        <div className="container">
          <div className="flex justify-between items-center py-4">
          <Link href="/admin" className={getButtonClassName('ghost', 'sm')}>
              ← Bestillingsoversikt
            </Link>
          </div>
        </div>

      <main className="container py-6">
        <Card className="mb-6">
          <Card.Content>
            <h2 className="section-heading mb-4">Legg til ny kake</h2>
            <BatchForm ingredients={allIngredients || []} />
          </Card.Content>
        </Card>

        <h2 className="section-heading mb-4">Eksisterende kaker</h2>
        <div className="space-y-4 md:space-y-6">
          {batches?.map(batch => (
            <BatchListItem key={batch.id} batch={batch} />
          ))}
        </div>
      </main>
    </div>
  )
}