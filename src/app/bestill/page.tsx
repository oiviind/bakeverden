import Header from '@/components/Header'
import { Card, Alert } from '@/components/ui'
import CakeRequestForm from '@/components/CakeRequestForm'

export default function BestillPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container pt-4 pb-6">
        <div className="max-w-lg mx-auto">
          <h1 className="page-title">Bestill kake</h1>
          <p className="text-gray-600 text-sm mb-6">
            Fyll ut skjemaet så tar jeg kontakt for å avtale detaljer og pris.
          </p>

          <Alert variant="info" className="mb-6">
            Dette er en forespørsel – pris og detaljer avtales etterpå.
          </Alert>

          <Card>
            <Card.Content>
              <CakeRequestForm />
            </Card.Content>
          </Card>
        </div>
      </main>
    </div>
  )
}
