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
  
  const { data: batch } = await supabase
    .from('product_batches')
    .select('*')
    .eq('id', id)
    .single()
  
  // Hvis batch ikke finnes eller er inaktiv
  if (!batch || !batch.is_active) {
    notFound()
  }

  // Hvis utsolgt, vis melding i stedet for 404
  const isSoldOut = batch.remaining_quantity === 0
  
  const pickupDate = new Date(batch.pickup_start).toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  return (
    <div>
      <header className="header">
        <div className="container">
          <Link href="/" className="text-blue-500 hover:underline">
            ← Tilbake til oversikt
          </Link>
        </div>
      </header>

      <main className="container">
        <div className="max-w-2xl mx-auto">
          <div className="card mb-6">
            {batch.image_url && (
              <img 
                src={batch.image_url} 
                alt={batch.title}
                className="card-image"
              />
            )}
            <div className="card-content">
              <h1 className="card-title text-3xl">{batch.title}</h1>
              {batch.description && (
                <p className="card-description">{batch.description}</p>
              )}
              {batch.price && (
                <p className="text-3xl font-bold text-pink-600 mb-4">
                  {batch.price.toFixed(0)},-
                </p>
              )}
              <div className="card-meta">
                <div>📅 Henting: {pickupDate}</div>
                <div>
                  📦 {batch.remaining_quantity} av {batch.total_quantity} igjen
                  {isSoldOut && (
                    <span className="badge badge-warning ml-2">Utsolgt!</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card card-content">
            {isSoldOut ? (
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-700">
                  😔 Dessverre utsolgt
                </h2>
                <p className="text-gray-600 mb-4">
                  Denne kaken er utsolgt. Sjekk våre andre kaker eller kom tilbake senere!
                </p>
                <Link 
                  href="/"
                  className="btn btn-primary"
                >
                  Se andre kaker
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">Reserver din kake</h2>
                <ReservationForm batch={batch} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}