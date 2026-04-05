import { getAvailableBatches } from '@/lib/actions/getBatches'
import BatchCard from '@/components/BatchCard'
import Header from '@/components/Header'
import { Card } from '@/components/ui'

export const revalidate = 0

export default async function Home() {
  const batches = await getAvailableBatches()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <section className="mb-4">
          <h1 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.25rem', paddingTop: '0.25rem' }}>
            Julen 2026
          </h1>
          <p className="text-gray-600 text-sm">
            Småkaker og andre godsaker klare for bestilling til jul. Henting innen 18. Desember kl 16:00
          </p>
        </section>

        {batches.length === 0 ? (
          <Card>
            <Card.Content>
              <div className="text-center py-4">
                <p className="text-gray-500">Ingen kaker tilgjengelig akkurat nå.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Sjekk tilbake senere eller følg meg på sosiale medier!
                </p>
              </div>
            </Card.Content>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
            {batches.map(batch => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
