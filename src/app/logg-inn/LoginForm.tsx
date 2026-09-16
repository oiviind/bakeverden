'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Alert, Button } from '@/components/ui'
import styles from './LoginForm.module.css'

type Status = 'idle' | 'loading' | 'sent' | 'verifying' | 'error'

export default function LoginForm({ callbackFailed }: { callbackFailed: boolean }) {
  const [supabase] = useState(() => createClient())
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [status, setStatus] = useState<Status>(callbackFailed ? 'error' : 'idle')
  const [errorMessage, setErrorMessage] = useState(
    callbackFailed ? 'Innloggingen ble ikke fullført. Prøv igjen.' : ''
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
      setErrorMessage('Kunne ikke sende engangskode. Prøv igjen.')
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
          Vi har sendt en engangskode til {email}. Skriv den inn under.
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
          Send engangskode
        </Button>
      </form>

      <button
        type="button"
        className={styles.googleBtn}
        disabled={status === 'loading'}
        onClick={handleGoogle}
      >
        <svg className={styles.googleLogo} viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        Logg inn med Google
      </button>
    </div>
  )
}
