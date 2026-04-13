import Header from '@/components/Header'
import { Card } from '@/components/ui'

export default function PersonvernPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="page-title">Personvernerklæring</h1>
          <p className="text-gray-500 text-sm mb-8">Sist oppdatert: april 2025</p>

          <Card>
            <Card.Content>
              <section className="mb-8">
                <h2 className="section-heading mb-3">Hva samler vi inn?</h2>
                <p className="text-gray-600 mb-3">
                  Når du legger inn en bestilling hos Kjerstis Bakeverden, samler vi inn følgende opplysninger:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Navn</li>
                  <li>Telefonnummer</li>
                  <li>E-postadresse</li>
                  <li>Bestillingsinformasjon</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="section-heading mb-3">Hvorfor samler vi inn dette?</h2>
                <p className="text-gray-600 mb-3">
                  Vi bruker opplysningene dine kun til å:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Behandle og administrere bestillingen din</li>
                  <li>Sende ordrebekreftelse og kvittering</li>
                  <li>Varsle deg via SMS/E-post når bestillingen er klar for henting</li>
                  <li>Kontakte deg ved spørsmål knyttet til bestillingen</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="section-heading mb-3">Hvor lagres dataene?</h2>
                <p className="text-gray-600">
                  All informasjon lagres sikkert i Supabase — en moderne og sikker databasetjeneste.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="section-heading mb-3">Deles dataene med andre?</h2>
                <p className="text-gray-600">
                  Nei. Vi deler ikke personopplysningene dine med tredjeparter. Informasjonen brukes
                  utelukkende til å håndtere din bestilling.
                </p>
              </section>

              <section>
                <h2 className="section-heading mb-3">Dine rettigheter</h2>
                <p className="text-gray-600 mb-3">
                  Du har rett til å:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Be om innsyn i hvilke opplysninger vi har om deg</li>
                  <li>Be om at opplysningene dine slettes</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  Ta kontakt på{' '}
                  <a href="mailto:kjerstisbakeverden@gmail.com" className="text-blue-600 underline">
                  kjerstisbakeverden@gmail.com
                  </a>{' '}
                  eller ring{' '}
                  <a href="tel:+4745477878" className="text-blue-600 underline">
                    454 77 878
                  </a>{' '}
                  så hjelper jeg deg.
                </p>
              </section>
            </Card.Content>
          </Card>
        </div>
      </main>
    </div>
  )
}
