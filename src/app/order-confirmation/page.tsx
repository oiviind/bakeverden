import Link from 'next/link'
import { Card, getButtonClassName } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'
import { SendReceiptButton } from '@/components/SendReceiptButton'

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  let hasEmail = false
  if (orderId) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select('email')
      .eq('id', orderId)
      .single()
    hasEmail = !!data?.email
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <Card.Content>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold mb-2">Bestilling mottatt!</h1>
              <p className="text-gray-600 mb-4">
                Tusen takk for din bestilling! Du vil bli kontaktet angående henting.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                <strong>Betal ved henting.</strong>
              </p>
              <div className="flex flex-col gap-3">
                {orderId && hasEmail && (
                  <SendReceiptButton orderId={orderId} />
                )}
                <Link href="/" className={getButtonClassName('primary', 'md', true)}>
                  Tilbake til forsiden
                </Link>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}
