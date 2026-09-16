import Header from '@/components/Header'
import { Card } from '@/components/ui'
import LoginForm from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-16">
        <div className="max-w-sm mx-auto">
          <Card>
            <Card.Content>
              <h1 className="section-heading mb-6 text-center">Logg inn</h1>
              <LoginForm callbackFailed={error === '1'} />
            </Card.Content>
          </Card>
        </div>
      </main>
    </div>
  )
}
