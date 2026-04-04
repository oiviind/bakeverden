'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export default function UpdatedToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    if (searchParams.get('updated') === '1') {
      handled.current = true
      setVisible(true)
      router.replace(pathname, { scroll: false })
      setTimeout(() => setVisible(false), 3000)
    }
  }, [searchParams, router, pathname])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium">
      ✅ Kaken ble oppdatert!
    </div>
  )
}
