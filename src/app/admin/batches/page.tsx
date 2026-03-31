import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import BatchForm from '@/components/admin/BatchForm'

export const revalidate = 0

export default async function AdminBatchesPage() {
  const supabase = createClient()
  
  // Hent alle kaker
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

  // Hent alle ingredienser
  const { data: allIngredients } = await supabase
    .from('ingredients')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="header sticky top-0 z-10">
        <div className="container">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-pink-600">
              👨‍🍳 Admin - Kaker
            </h1>
            <Link href="/admin" className="text-blue-500 hover:underline">
              ← Bestillinger
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-4">
        {/* Form for ny kake */}
        <div className="card card-content mb-6">
          <h2 className="text-xl font-bold mb-4">Legg til ny kake</h2>
          <BatchForm ingredients={allIngredients || []} />
        </div>

        {/* Liste over eksisterende kaker */}
        <div className="card card-content">
          <h2 className="text-xl font-bold mb-4">Eksisterende kaker</h2>
          <div className="space-y-4">
            {batches?.map(batch => {
              const ingredients = batch.batch_ingredients?.map((bi: any) => bi.ingredient) || []
              return (
                <div key={batch.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{batch.title}</h3>
                      <p className="text-sm text-gray-600">{batch.description}</p>
                    </div>
                    <span className={`badge ${batch.is_active ? 'badge-success' : 'badge-error'}`}>
                      {batch.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {ingredients.map((ing: any) => (
                      <span 
                        key={ing.id}
                        className={`text-xs px-2 py-1 rounded-full ${
                          ing.allergen 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {ing.name}
                      </span>
                    ))}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span>💰 {batch.price},-</span>
                    <span className="ml-4">📦 {batch.remaining_quantity}/{batch.total_quantity}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}