'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { sendReceiptEmail } from '@/app/admin/actions'

export function SendReceiptButton({ orderId }: { orderId: string }) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    const result = await sendReceiptEmail(orderId)
    if (result.success) {
      setSent(true)
    } else {
      setError('Her ble ingrediensene blandet feil. Kunne ikke sende E-post.')
    }
    setLoading(false)
  }

  if (sent) {
    return <p className="text-sm text-green-600">✅ Kvittering sendt på e-post</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" size="md" fullWidth onClick={handleClick} loading={loading}>
        Send kvittering på e-post
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
