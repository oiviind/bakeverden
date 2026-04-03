'use client'

import { useCart } from '@/lib/contexts/CartContext'
import Link from 'next/link'
import { Card, getButtonClassName } from '@/components/ui'
import styles from './Cart.module.css'

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart()

  if (items.length === 0) {
    return (
      <Card>
        <Card.Content>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">🛒 Handlekurven er tom</p>
            <Link href="/" className={getButtonClassName('primary')}>
              Se tilgjengelige kaker
            </Link>
          </div>
        </Card.Content>
      </Card>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {items.map(item => (
        <Card key={item.batch.id}>
          <Card.Content>
            <div className="flex gap-4">
              {item.batch.image_url && (
                <img
                  src={item.batch.image_url}
                  alt={item.batch.title}
                  className={styles.thumbnail}
                />
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {item.batch.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {item.batch.price},- per stk
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.batch.id, item.quantity - 1)}
                    className="stepper-button stepper-minus"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.batch.id, item.quantity + 1)}
                    disabled={item.quantity >= item.batch.remaining_quantity}
                    className="stepper-button stepper-plus"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeItem(item.batch.id)}
                    className="text-gray-600 hover:text-gray-800 text-sm ml-2"
                  >
                    🗑️ Fjern
                  </button>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-bold text-lg">
                  {item.batch.price * item.quantity},-
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      ))}

      <Card>
        <Card.Content>
          <div className="flex justify-between items-center text-xl font-bold mb-4">
            <span>Totalt ({getTotalItems()} stk):</span>
            <span>{getTotalPrice()},-</span>
          </div>

          <Link href="/checkout" className={getButtonClassName('primary', 'md', true)}>
            Gå til kassen
          </Link>
        </Card.Content>
      </Card>
    </div>
  )
}
