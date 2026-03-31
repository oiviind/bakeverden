import Link from 'next/link'
import type { ProductBatchWithIngredients } from '@/types/database.types'

interface BatchCardProps {
  batch: ProductBatchWithIngredients
}

export default function BatchCard({ batch }: BatchCardProps) {
  const isSoldOut = batch.remaining_quantity === 0
  
  const pickupDate = new Date(batch.pickup_start).toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })

  const allergens = batch.ingredients?.filter(i => i.allergen) || []

  return (
    <Link 
      href={`/reserve/${batch.id}`}
      className={`card block ${isSoldOut ? 'opacity-60' : ''}`}
    >
      {batch.image_url && (
        <div className="relative">
          <img 
            src={batch.image_url} 
            alt={batch.title}
            className="card-image"
          />
          {isSoldOut && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-lg">
                UTSOLGT
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="card-content">
        <h2 className="card-title">{batch.title}</h2>
        
        {batch.description && (
          <p className="card-description">{batch.description}</p>
        )}

        {/* Vis ingredienser */}
        {batch.ingredients && batch.ingredients.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 font-semibold mb-1">Ingredienser:</p>
            <div className="flex flex-wrap gap-1">
              {batch.ingredients.map(ingredient => (
                <span 
                  key={ingredient.id}
                  className={`text-xs px-2 py-1 rounded-full ${
                    ingredient.allergen 
                      ? 'bg-red-100 text-red-700 font-semibold' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {ingredient.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Allergen warning */}
        {allergens.length > 0 && (
          <div className="alert alert-warning text-xs mb-3">
            ⚠️ Allergener: {allergens.map(a => a.name).join(', ')}
          </div>
        )}
        
        {batch.price && (
          <p className="text-2xl font-bold text-pink-600 mb-4">
            {batch.price.toFixed(0)},-
          </p>
        )}
        
        <div className="card-meta">
          <div>📅 Henting: {pickupDate}</div>
          <div className="flex items-center gap-2">
            📦 {batch.remaining_quantity} av {batch.total_quantity} igjen
            {isSoldOut && (
              <span className="badge badge-warning">Utsolgt</span>
            )}
          </div>
        </div>
        
        <button className={`btn btn-block mt-4 ${isSoldOut ? 'btn-disabled' : 'btn-primary'}`}>
          {isSoldOut ? 'Se detaljer' : 'Bestill'}
        </button>
      </div>
    </Link>
  )
}