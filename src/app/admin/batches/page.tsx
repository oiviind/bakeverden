import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import BatchForm from '@/components/admin/BatchForm'
import { Card, Badge, getButtonClassName } from '@/components/ui'

export const revalidate = 0

export default async function AdminBatchesPage() {
  const supabase = createClient()

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
      <header className="header sticky top-0 z-10">
        <div className="container">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-white">
              👨‍🍳 Admin - Kaker
            </h1>
            <Link href="/admin" className={getButtonClassName('ghost', 'sm')}>
              ← Bestillingsoversikt
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Form for ny kake */}
        <Card className="mb-6">
          <Card.Content>
            <h2 className="section-heading mb-4">Legg til ny kake</h2>
            <BatchForm ingredients={allIngredients || []} />
          </Card.Content>
        </Card>

        {/* Liste over eksisterende kaker */}
        <h2 className="section-heading mb-4">Eksisterende kaker</h2>
        <div className="space-y-4 md:space-y-6">
          {batches?.map(batch => {
            const ingredients = batch.batch_ingredients?.map((bi: any) => bi.ingredient) || []
            return (
              <Card key={batch.id}>
                <Card.Content>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{batch.title}</h3>
                      <p className="text-sm text-gray-600">{batch.description}</p>
                    </div>
                    <Badge variant={batch.is_active ? 'success' : 'error'}>
                      {batch.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>

                  {ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {ingredients.map((ing: any) => (
                        <Badge
                          key={ing.id}
                          variant={ing.allergen ? 'error' : 'info'}
                        >
                          {ing.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <span>💰 {batch.price},-</span>
                    <span className="ml-4">📦 {batch.remaining_quantity}/{batch.total_quantity}</span>
                  </div>
                </Card.Content>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
