'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export default function UpdatedToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState<string | null>(null)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    const updated = searchParams.get('updated') === '1'
    const created = searchParams.get('created') === '1'
    if (updated || created) {
      handled.current = true
      setVisible(created ? '✅ Bestilling opprettet!' : '✅ Bestillingen ble oppdatert!')
      router.replace(pathname, { scroll: false })
      setTimeout(() => setVisible(null), 3000)
    }
  }, [searchParams, router, pathname])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium">
      {visible}
    </div>
  )
}
