import Header from '@/components/Header'
import { Card } from '@/components/ui'

export default function VilkarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="page-title">Vilkår og betingelser</h1>
          <p className="text-gray-500 text-sm mb-8">Sist oppdatert: april 2025</p>

          <Card>
            <Card.Content>
              <section className="mb-8">
                <h2 className="section-heading mb-3">Bestilling</h2>
                <p className="text-gray-600">
                  Når du legger inn en bestilling, regnes dette som bindende. Vi begynner å
                  planlegge og tilberede din ordre basert på den informasjonen du oppgir.
                  Vennligst dobbeltsjekk bestillingen din før du sender den inn.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="section-heading mb-3">Endringer og kansellering</h2>
                <p className="text-gray-600">
                  Ønsker du å endre eller kansellere en bestilling, må du ta kontakt så
                  tidlig som mulig.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="section-heading mb-3">Allergener</h2>
                <p className="text-gray-600 mb-3">
                  Det er kundens ansvar å sette seg inn i ingrediensene og eventuelle alergener i produktene før bestilling. Vi anbefaler å kontakte oss dersom du har spesielle allergier eller
                  matintoleranser før bestilling. Vær oppmerksom på følgende:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Vi kan ikke garantere et allergenfritt produksjonsmiljø</li>
                  <li>Produkter kan inneholde spor av nøtter, gluten, melk, egg og andre allergener</li>
                  <li>Ingredienslister er tilgjengelige på produktsidene</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="section-heading mb-3">Henting</h2>
                <p className="text-gray-600">
                  Du vil bli varslet når bestillingen er klar for henting. Vennligst hent
                  bestillingen innen avtalt tid. Ta kontakt dersom du ikke kan hente til
                  avtalt tidspunkt.
                </p>
              </section>

              <section>
                <h2 className="section-heading mb-3">Kontakt</h2>
                <p className="text-gray-600">
                  Har du spørsmål om en bestilling eller disse vilkårene? Ta kontakt på{' '}
                  <a href="mailto:kjerstiringelien@hotmail.com" className="text-blue-600 underline">
                    kjerstiringelien@hotmail.com
                  </a>{' '}
                  eller ring{' '}
                  <a href="tel:+4745477878" className="text-blue-600 underline">
                    454 77 878
                  </a>.
                </p>
              </section>
            </Card.Content>
          </Card>
        </div>
      </main>
    </div>
  )
}
