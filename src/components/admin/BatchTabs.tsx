'use client'

import { useState } from 'react'
import BatchForm from './BatchForm'
import BatchListItem from './BatchListItem'
import { Card } from '@/components/ui'

type Tab = 'new' | 'existing'

interface BatchTabsProps {
  batches: any[]
  ingredients: any[]
}

export default function BatchTabs({ batches, ingredients }: BatchTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('existing')

  const activeCount = batches.filter(b => b.is_active).length

  const tabs: { key: Tab; label: string }[] = [
    { key: 'new', label: 'Legg til ny' },
    { key: 'existing', label: `Eksisterende kaker (${activeCount})` },
  ]

  return (
    <>
      <div className="flex mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'flex-1 px-2 py-2 text-s sm:text-sm font-medium border-b-2 -mb-px transition-colors text-center',
              activeTab === tab.key
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'new' && (
        <Card>
          <Card.Content>
            <BatchForm ingredients={ingredients} />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'existing' && (
        <div className="space-y-4 md:space-y-6">
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
      )}
    </>
  )
}
