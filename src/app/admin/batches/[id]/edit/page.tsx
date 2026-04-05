import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'
import { Card, getButtonClassName } from '@/components/ui'
import EditBatchForm from '@/components/admin/EditBatchForm'

export default async function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: batch }, { data: allIngredients }] = await Promise.all([
    supabase
      .from('product_batches')
      .select('*, batch_ingredients(ingredient_id)')
      .eq('id', id)
      .single(),
    supabase
      .from('ingredients')
      .select('*')
      .order('name'),
  ])

  if (!batch) notFound()

  const selectedIngredientIds: string[] = [...new Set<string>(batch.batch_ingredients?.map((bi: any) => bi.ingredient_id as string) ?? [])]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <div className="container">
        <div className="flex justify-between items-center py-4">
          <Link href="/admin/batches" className={getButtonClassName('ghost', 'sm')}>
            ← Tilbake til kaker
          </Link>
        </div>
      </div>

      <main className="container py-6">
        <Card className="mb-6">
          <Card.Content>
            <h2 className="section-heading mb-4">Rediger kake</h2>
            <EditBatchForm
              batch={batch}
              ingredients={allIngredients || []}
              selectedIngredientIds={selectedIngredientIds}
            />
          </Card.Content>
        </Card>
      </main>
    </div>
  )
}
