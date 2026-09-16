'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Alert, Button } from '@/components/ui'

type Status = 'idle' | 'loading' | 'sent' | 'verifying' | 'error'

export default function LoginForm({ callbackFailed }: { callbackFailed: boolean }) {
  const [supabase] = useState(() => createClient())
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)
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

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('verifying')
    setCodeError(false)

    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'email' })

    if (error) {
      setCodeError(true)
      setStatus('sent')
      return
    }
    // Full navigation so server components see the new session cookie
    window.location.assign('/konto')
  }

  if (status === 'sent' || status === 'verifying') {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="success">
          Sjekk e-posten din. Skriv inn koden fra e-posten, eller klikk på lenken.
        </Alert>
        {codeError && <Alert variant="error">Feil eller utløpt kode. Prøv igjen.</Alert>}

        <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label htmlFor="code" className="form-label">Engangskode</label>
            <input
              id="code"
              type="text"
              name="code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              className="form-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <Button type="submit" fullWidth loading={status === 'verifying'}>
            Logg inn
          </Button>
        </form>
      </div>
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
