'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Alert, Button } from '@/components/ui'

type Status = 'idle' | 'loading' | 'sent' | 'error'

export default function LoginForm({ callbackFailed }: { callbackFailed: boolean }) {
  const [supabase] = useState(() => createClient())
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>(callbackFailed ? 'error' : 'idle')
  const [errorMessage, setErrorMessage] = useState(
    callbackFailed ? 'Innloggingslenken er ugyldig eller utløpt. Prøv igjen.' : ''
  )

  const redirectTo = () => `${window.location.origin}/auth/callback`

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    })

    if (error) {
      setErrorMessage('Kunne ikke sende innloggingslenke. Prøv igjen.')
      setStatus('error')
      return
    }
    setStatus('sent')
  }

  const handleGoogle = async () => {
    setStatus('loading')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectTo() },
    })
    if (error) {
      setErrorMessage('Kunne ikke starte Google-innlogging. Prøv igjen.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <Alert variant="success">
        Sjekk e-posten din. Vi har sendt deg en lenke for å logge inn.
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {status === 'error' && <Alert variant="error">{errorMessage}</Alert>}

      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
        <div className="form-group">
          <label htmlFor="email" className="form-label">E-post</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" fullWidth loading={status === 'loading'}>
          Send innloggingslenke
        </Button>
      </form>

      <Button
        type="button"
        variant="secondary"
        fullWidth
        disabled={status === 'loading'}
        onClick={handleGoogle}
      >
        Logg inn med Google
      </Button>
    </div>
  )
}
