// src/components/admin/BatchListItem.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, ImageIcon } from 'lucide-react'
import { toggleBatchActive } from '@/lib/actions/toggleBatchActive'
import { Alert, getButtonClassName } from '@/components/ui'
import styles from './BatchListItem.module.css'

interface BatchListItemProps {
  batch: any
}

export default function BatchListItem({ batch }: BatchListItemProps) {
  const [isActive, setIsActive] = useState<boolean>(batch.is_active)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Optimistic toggle — revert if the save fails
  async function handleToggle() {
    const next = !isActive
    setIsActive(next)
    setSaving(true)
    setError(null)

    const result = await toggleBatchActive(batch.id, next)

    setSaving(false)

    if (!result.success) {
      setIsActive(!next)
      setError(result.error || 'Noe gikk galt')
    }
  }

  return (
    <div className={`${styles.card} ${isActive ? '' : styles.inactive}`}>
      {/* Header: image + name + price */}
      <div className={styles.header}>
        {batch.image_url ? (
          <img src={batch.image_url} alt={batch.title} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>
            <ImageIcon size={28} strokeWidth={2.75} aria-hidden />
          </div>
        )}
        <div className={styles.info}>
          <h2 className={styles.title}>{batch.title}</h2>
          <p className={styles.price}>{batch.price} kr</p>
        </div>
      </div>

      {/* Status switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        onClick={handleToggle}
        disabled={saving}
        className={styles.statusRow}
      >
        <span className={styles.track}>
          <span className={styles.thumb} />
        </span>
        <span className={styles.statusText}>
          {isActive ? 'Vises i butikken' : 'Skjult for kunder'}
        </span>
      </button>

      {error && <Alert variant="error">{error}</Alert>}

      <Link
        href={`/admin/batches/${batch.id}/edit`}
        className={getButtonClassName('secondary', 'lg', true)}
      >
        <Pencil size={18} strokeWidth={2.75} aria-hidden />
        Rediger kake
      </Link>
    </div>
  )
}
