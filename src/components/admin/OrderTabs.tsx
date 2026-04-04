'use client'

import { useState } from 'react'
import OrderCard from './OrderCard'
import { Card } from '@/components/ui'

type Tab = 'pending' | 'ready' | 'history'

interface OrderTabsProps {
  pendingOrders: any[]
  readyOrders: any[]
  deliveredOrders: any[]
}

export default function OrderTabs({ pendingOrders, readyOrders, deliveredOrders }: OrderTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('pending')

  const tabs: { key: Tab; label: string; count: number; emptyText: string }[] = [
    { key: 'pending', label: 'Nye bestillinger', count: pendingOrders.length, emptyText: 'Ingen nye bestillinger' },
    { key: 'ready', label: 'Klare for henting', count: readyOrders.length, emptyText: 'Ingen bestillinger klare for henting' },
    { key: 'history', label: 'Historikk', count: deliveredOrders.length, emptyText: 'Ingen leverte bestillinger' },
  ]

  const ordersMap: Record<Tab, any[]> = {
    pending: pendingOrders,
    ready: readyOrders,
    history: deliveredOrders,
  }

  const activeOrders = ordersMap[activeTab]
  const emptyText = tabs.find(t => t.key === activeTab)!.emptyText

  return (
    <>
      {/* Tabs */}
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
            <span className="block">{tab.label}</span>
            <span className="block">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Orders */}
      {activeOrders.length === 0 ? (
        <Card>
          <Card.Content>
            <p className="text-gray-500 text-center py-8">{emptyText}</p>
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {activeOrders.map((order: any) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </>
  )
}
