import { loginAction } from './actions'
import { Card, Alert, getButtonClassName } from '@/components/ui'
import Header from '@/components/Header'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>
}) {
  const { from, error } = await searchParams

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-16">
        <div className="max-w-sm mx-auto">
          <Card>
            <Card.Content>
              <h1 className="section-heading mb-6 text-center">Admin innlogging</h1>

              {error && (
                <Alert variant="error" className="mb-4">
                  Feil brukernavn eller passord
                </Alert>
              )}

              <form action={loginAction} className="space-y-4">
                <input type="hidden" name="from" value={from || '/admin'} />
                <div className="form-group">
                  <label className="form-label">Brukernavn</label>
                  <input
                    type="text"
                    name="username"
                    required
                    autoComplete="username"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Passord</label>
                  <input
                    type="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    className="form-input"
                  />
                </div>
                <button type="submit" className={getButtonClassName('primary', 'md', true)}>
                  Logg inn
                </button>
              </form>
            </Card.Content>
          </Card>
        </div>
      </main>
    </div>
  )
}
