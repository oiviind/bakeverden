'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { Alert, Badge, Button } from '@/components/ui'
import styles from './LoginForm.module.css'

type Status = 'idle' | 'loading' | 'sent' | 'verifying' | 'error'

const CODE_LENGTH = 6
const emptyDigits = () => Array<string>(CODE_LENGTH).fill('')

export default function LoginForm({ callbackFailed }: { callbackFailed: boolean }) {
  const [supabase] = useState(() => createClient())
  const [email, setEmail] = useState('')
  const [digits, setDigits] = useState<string[]>(emptyDigits)
  const [codeMessage, setCodeMessage] = useState<{ variant: 'success' | 'error'; text: string } | null>(null)
  const [status, setStatus] = useState<Status>(callbackFailed ? 'error' : 'idle')
  const [errorMessage, setErrorMessage] = useState(
    callbackFailed ? 'Innloggingen ble ikke fullført. Prøv igjen.' : ''
  )
  const digitRefs = useRef<(HTMLInputElement | null)[]>([])

  const redirectTo = () => `${window.location.origin}/auth/callback`

  const sendCode = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    })
    return !error
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    if (!(await sendCode())) {
      setErrorMessage('Kunne ikke sende engangskode. Prøv igjen.')
      setStatus('error')
      return
    }
    setDigits(emptyDigits())
    setCodeMessage(null)
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

  // ---- Step 2: code popup ----

  const verifyCode = async (token: string) => {
    setStatus('verifying')
    setCodeMessage(null)

    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })

    if (error) {
      setCodeMessage({ variant: 'error', text: 'Feil eller utløpt kode. Prøv igjen.' })
      setDigits(emptyDigits())
      setStatus('sent')
      digitRefs.current[0]?.focus()
      return
    }
    // Full navigation so server components see the new session cookie
    window.location.assign('/konto')
  }

  // Handles typing, paste and one-time-code autofill (fills from index i onwards)
  const handleDigitChange = (i: number, value: string) => {
    const chars = value.replace(/\D/g, '').slice(0, CODE_LENGTH - i)
    const next = [...digits]

    if (!chars) {
      next[i] = ''
      setDigits(next)
      return
    }

    chars.split('').forEach((c, j) => { next[i + j] = c })
    setDigits(next)
    digitRefs.current[Math.min(i + chars.length, CODE_LENGTH - 1)]?.focus()

    if (next.every(Boolean)) verifyCode(next.join(''))
  }

  const handleDigitKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      digitRefs.current[i - 1]?.focus()
    }
  }

  const handleResend = async () => {
    setCodeMessage(null)
    setDigits(emptyDigits())
    const ok = await sendCode()
    setCodeMessage(
      ok
        ? { variant: 'success', text: 'Ny kode er sendt.' }
        : { variant: 'error', text: 'Kunne ikke sende ny kode. Prøv igjen.' }
    )
    digitRefs.current[0]?.focus()
  }

  const closeCodeStep = () => {
    setDigits(emptyDigits())
    setCodeMessage(null)
    setStatus('idle')
  }

  const codeStepOpen = status === 'sent' || status === 'verifying'

  return (
    <div className="flex flex-col gap-6">
      <p className={styles.subtitle}>Ingen passord å huske.</p>

      {status === 'error' && <Alert variant="error">{errorMessage}</Alert>}

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

      <div className={styles.divider}>eller</div>

      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
        <div className="form-group">
          <label htmlFor="email" className="form-label">E-post</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="navn@epost.no"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" fullWidth loading={status === 'loading'}>
          Send engangskode
        </Button>
        <p className={styles.hint}>Du får en 6-sifret kode på e-post.</p>
      </form>

      {codeStepOpen && createPortal(
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={closeCodeStep}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="code-step-title"
            className={styles.dialog}
            onClick={(e) => e.stopPropagation()}
          >
            <Badge variant="info">Steg 2</Badge>
            <h2 id="code-step-title" className={`section-heading ${styles.dialogTitle}`}>
              Sjekk e-posten
            </h2>
            <p className={styles.dialogText}>
              Vi sendte en kode til <strong>{email}</strong>.
            </p>

            {codeMessage && <Alert variant={codeMessage.variant}>{codeMessage.text}</Alert>}

            <div className={styles.digits}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { digitRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  autoFocus={i === 0}
                  aria-label={`Siffer ${i + 1}`}
                  className={styles.digit}
                  value={digit}
                  disabled={status === 'verifying'}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                />
              ))}
            </div>

            <div className={styles.dialogLinks}>
              <button type="button" className={styles.linkBtn} onClick={handleResend}>
                Send på nytt
              </button>
              <button type="button" className={styles.linkBtn} onClick={closeCodeStep}>
                Bruk en annen e-post
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
