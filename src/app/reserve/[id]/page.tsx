import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import AddToCartButton from '@/components/AddToCartButton'
import { Card, Badge, Alert } from '@/components/ui'

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

  const fmtPickup = (iso: string) =>
    new Date(iso).toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  const pickupStart = fmtPickup(batch.pickup_start)
  const pickupEnd = fmtPickup(batch.pickup_end)

  // Ekstraher ingredienser og allergener
  const ingredients = batch.batch_ingredients?.map((bi: any) => bi.ingredients).filter(Boolean) || []
  const allergens = ingredients.filter((ing: any) => ing.allergen)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container py-6">
        <div className="max-w-2xl mx-auto">
          {/* Kakeinformasjon */}
          <Card className="mb-6">
            {batch.image_url && (
              <div className="relative">
                <Card.Image
                  src={batch.image_url}
                  alt={batch.title}
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

            <Card.Content>
              <h2 className="text-2xl font-bold mb-2">{batch.title}</h2>

              {batch.description && (
                <Card.Description className="mb-4">{batch.description}</Card.Description>
              )}

              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div>
                  <Card.Price>{batch.price},-</Card.Price>
                  <div className="text-sm text-gray-600">
                    {batch.total_quantity < 999999 ? `📦 ${batch.remaining_quantity} av ${batch.total_quantity} igjen` : ''}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div className="font-semibold mb-1">📅 Levering mellom:</div>
                  <div>{pickupStart} og {pickupEnd}</div>
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
                      <Badge key={ing.id} variant="info">
                        {ing.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* ALLERGENER */}
              {allergens.length > 0 && (
                <Alert variant="error" className="mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <span className="text-xl">⚠️</span>
                      Inneholder allergener:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {allergens.map((allergen: any) => (
                        <Badge key={allergen.id} variant="error">
                          {allergen.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Alert>
              )}
            </Card.Content>
          </Card>

          {/* Legg til i handlekurv */}
          <Card>
            <Card.Content>
              <h3 className="text-xl font-bold mb-4">Legg til i handlekurv</h3>

              {isSoldOut ? (
                <Alert variant="error">
                  <p className="font-semibold">Denne kaken er dessverre utsolgt</p>
                </Alert>
              ) : (
                <AddToCartButton batch={batch} />
              )}
            </Card.Content>
          </Card>
        </div>
      </main>
    </div>
  )
}
