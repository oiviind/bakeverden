import { createClient } from '@/lib/supabase'
import ReservationForm from '@/components/ReservationForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ReservePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = createClient()
  
  // Hent batch med ingredienser
  const { data: batch, error } = await supabase
    .from('product_batches')
    .select(`
      *,
      batch_ingredients (
        ingredients (
          id,
          name,
          allergen
        )
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !batch) {
    console.error('Error fetching batch:', error)
    notFound()
  }

  const isSoldOut = batch.remaining_quantity === 0

  const pickupDate = new Date(batch.pickup_start).toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Ekstraher ingredienser og allergener
  const ingredients = batch.batch_ingredients?.map((bi: any) => bi.ingredients).filter(Boolean) || []
  const allergens = ingredients.filter((ing: any) => ing.allergen)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← Tilbake
            </Link>
            <h1 className="text-2xl font-bold text-pink-600">Bestill kake</h1>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="max-w-2xl mx-auto">
          {/* Kakeinformasjon */}
          <div className="card mb-6">
            {/* BILDE - Samme styling som BatchCard */}
            {batch.image_url && (
              <div className="relative">
                <img 
                  src={batch.image_url} 
                  alt={batch.title}
                  className="card-image"
                />
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-lg">
                      UTSOLGT
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className="card-content">
              <h2 className="text-2xl font-bold mb-2">{batch.title}</h2>
              
              {batch.description && (
                <p className="text-gray-600 mb-4">{batch.description}</p>
              )}

              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div>
                  <div className="text-3xl font-bold text-pink-600">
                    {batch.price},-
                  </div>
                  <div className="text-sm text-gray-600">
                    📦 {batch.remaining_quantity} av {batch.total_quantity} igjen
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div className="font-semibold mb-1">📅 Henting:</div>
                  <div>{pickupDate}</div>
                </div>
              </div>

              {/* INGREDIENSER */}
              {ingredients.length > 0 && (
                <div className="mb-4 pb-4 border-b">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-xl">🥄</span>
                    Ingredienser:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ing: any) => (
                      <span 
                        key={ing.id}
                        className={`px-3 py-1 rounded-full text-sm ${
                          ing.allergen 
                            ? 'bg-red-50 text-red-700 border border-red-200 font-medium' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ing.allergen && '⚠️ '}
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ALLERGENER - Egen seksjon */}
              {allergens.length > 0 && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    Inneholder allergener:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allergens.map((allergen: any) => (
                      <span 
                        key={allergen.id}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold"
                      >
                        {allergen.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bestillingsskjema */}
          <div className="card">
            <div className="card-content">
              <h3 className="text-xl font-bold mb-4">Bestillingsinformasjon</h3>
              
              {isSoldOut ? (
                <div className="alert alert-error">
                  <p className="font-semibold">Denne kaken er dessverre utsolgt</p>
                </div>
              ) : (
                <ReservationForm batch={batch} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}