'use client'

import { useCart } from '@/lib/contexts/CartContext'
import Link from 'next/link'

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart()

  if (items.length === 0) {
    return (
      <div className="card">
        <div className="card-content text-center py-8">
          <p className="text-gray-500 mb-4">🛒 Handlekurven er tom</p>
          <Link href="/" className="btn btn-primary">
            Se tilgjengelige kaker
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.batch.id} className="card">
          <div className="card-content">
            <div className="flex gap-4">
              {item.batch.image_url && (
                <img 
                  src={item.batch.image_url} 
                  alt={item.batch.title}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {item.batch.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {item.batch.price},- per stk
                </p>
                
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.batch.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.batch.id, item.quantity + 1)}
                      disabled={item.quantity >= item.batch.remaining_quantity}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.batch.id)}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    🗑️ Fjern
                  </button>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-lg text-pink-600">
                  {item.batch.price * item.quantity},-
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="card">
        <div className="card-content">
          <div className="flex justify-between items-center text-xl font-bold mb-4">
            <span>Totalt ({getTotalItems()} stk):</span>
            <span className="text-pink-600">{getTotalPrice()},-</span>
          </div>
          
          <Link href="/checkout" className="btn btn-primary btn-block">
            Gå til kassen
          </Link>
        </div>
      </div>
    </div>
  )
}