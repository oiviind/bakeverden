'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import BatchListItem from './BatchListItem'
import { Card } from '@/components/ui'
import styles from './BatchTabs.module.css'

interface BatchTabsProps {
  batches: any[]
}

export default function BatchTabs({ batches }: BatchTabsProps) {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.heading}>Mine kaker</h1>
        <Link href="/admin/batches/new" className={styles.addButton} aria-label="Legg til ny kake">
          <Plus size={22} strokeWidth={2.75} aria-hidden />
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {batches.length === 0 ? (
          <Card>
            <Card.Content>
              <p className="text-gray-500 text-center py-8">Ingen kaker lagt til ennå</p>
            </Card.Content>
          </Card>
        ) : (
          batches.map(batch => (
            <BatchListItem key={batch.id} batch={batch} />
          ))
        )}
      </div>
    </>
  )
}
