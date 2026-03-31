import { getAvailableBatches } from '@/lib/actions/getBatches'
import BatchCard from '@/components/BatchCard'

export const revalidate = 0

export default async function Home() {
  const batches = await getAvailableBatches()
  
  return (
    <div>
      <header className="header">
        <div className="container">
          <h1 className="header-title">🧁 Kjerstis Bakeverden</h1>
        </div>
      </header>

      <main className="container">
        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Julebaksten 2026</h2>
          <p className="text-gray-600">
            Småkaker and andre godsaker som er klare for bestilling til Julen 2026
          </p>
        </section>
        
        {batches.length === 0 ? (
          <div className="card card-content text-center">
            <p className="text-gray-500">Ingen kaker tilgjengelig akkurat nå.</p>
            <p className="text-sm text-gray-400 mt-2">
              Sjekk tilbake senere eller følg oss på sosiale medier!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batches.map(batch => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}