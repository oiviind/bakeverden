'use client'

import { useState } from 'react'
import { submitCakeRequest } from '@/lib/actions/submitCakeRequest'
import { Button, Alert } from '@/components/ui'

const OCCASIONS = ['Dåp', 'Bryllup', 'Bursdag', 'Konfirmasjon', 'Annet']

export default function CakeRequestForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await submitCakeRequest(new FormData(e.currentTarget))
      setLoading(false)
      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error || 'Noe gikk galt')
      }
    } catch (err) {
      setLoading(false)
      setError('Noe gikk galt, prøv igjen')
    }
  }

  if (submitted) {
    return (
      <Alert variant="success">
        <p className="font-semibold text-lg mb-1">Takk for forespørselen!</p>
        <p>Jeg tar kontakt med deg så snart som mulig for å avtale detaljer og pris.</p>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="form-group">
        <label className="form-label">Anledning *</label>
        <select name="occasion" required className="form-input">
          <option value="">Velg anledning</option>
          {OCCASIONS.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Antall personer</label>
        <input
          type="number"
          name="num_people"
          min={1}
          className="form-input"
          placeholder="F.eks. 20"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Ønsket dato</label>
        <input
          type="date"
          name="desired_date"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Beskrivelse *</label>
        <textarea
          name="description"
          required
          rows={4}
          className="form-input"
          placeholder="Fortell gjerne om ønsker for smak, design, størrelse, allergier, budsjett osv."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Navn *</label>
        <input type="text" name="name" required className="form-input" />
      </div>

      <div className="form-group">
        <label className="form-label">E-post *</label>
        <input type="email" name="email" required className="form-input" />
      </div>

      <div className="form-group">
        <label className="form-label">Telefon (anbefalt)</label>
        <input type="tel" name="phone" className="form-input" />
      </div>

      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Send forespørsel
      </Button>
    </form>
  )
}
