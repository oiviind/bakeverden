import Link from 'next/link'

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="card-content text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2">Bestilling mottatt!</h1>
            <p className="text-gray-600 mb-4">
              Tusen takk for din bestilling! Du vil bli kontaktet angående henting.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              <strong>Betal ved henting.</strong>
            </p>
            <Link href="/" className="btn btn-primary btn-block">
              Tilbake til forsiden
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}