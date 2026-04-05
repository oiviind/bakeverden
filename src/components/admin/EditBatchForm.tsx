'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBatch } from '@/lib/actions/updateBatch'
import ImageUpload from './ImageUpload'
import { Button, Alert } from '@/components/ui'
import type { Ingredient } from '@/types/database.types'

interface EditBatchFormProps {
  batch: any
  ingredients: Ingredient[]
  selectedIngredientIds: string[]
}

// datetime-local inputs require "YYYY-MM-DDTHH:MM" format
function toDatetimeLocal(iso: string) {
  return iso ? iso.slice(0, 16) : ''
}

const DISCOUNTS = [5, 10, 20, 25, 30, 35, 40]

export default function EditBatchForm({ batch, ingredients, selectedIngredientIds }: EditBatchFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(selectedIngredientIds)
  const [imageUrl, setImageUrl] = useState<string>(batch.image_url || '')
  const [basePrice, setBasePrice] = useState<number>(batch.original_price ?? batch.price)
  const [discount, setDiscount] = useState<number>(batch.discount_percent ?? 0)

  function toggleIngredient(ingredientId: string) {
    setSelectedIngredients(prev =>
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    )
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('ingredients', JSON.stringify(selectedIngredients))
    formData.set('image_url', imageUrl)

    const result = await updateBatch(batch.id, formData)

    setLoading(false)

    if (result.success) {
      router.push('/admin/batches?updated=1')
    } else {
      setError(result.error || 'Noe gikk galt')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Tittel *</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={batch.title}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Pris *</label>
          <input
            type="number"
            name="price"
            required
            value={basePrice}
            onChange={e => setBasePrice(Number(e.target.value))}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Legg ut på tilbud</label>
        <select
          name="discount_percent"
          className="form-input"
          value={discount}
          onChange={e => setDiscount(Number(e.target.value))}
        >
          <option value={0}>Ingen rabatt</option>
          {DISCOUNTS.map(d => (
            <option key={d} value={d}>{d}% rabatt</option>
          ))}
        </select>
        {discount > 0 && (
          <small className="text-gray-500 mt-1 block">
            Pris etter rabatt: <strong>{Math.round(basePrice * (1 - discount / 100))},-</strong> (fra {basePrice},-)
          </small>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Beskrivelse</label>
        <textarea
          name="description"
          className="form-input"
          rows={3}
          defaultValue={batch.description || ''}
        />
      </div>

      <ImageUpload
        onImageUploaded={(url) => setImageUrl(url)}
        currentImageUrl={batch.image_url || ''}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Henting starter *</label>
          <input
            type="datetime-local"
            name="pickup_start"
            required
            defaultValue={toDatetimeLocal(batch.pickup_start)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Henting slutter *</label>
          <input
            type="datetime-local"
            name="pickup_end"
            required
            defaultValue={toDatetimeLocal(batch.pickup_end)}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Totalt antall</label>
        <input
          type="number"
          name="total_quantity"
          min="1"
          defaultValue={batch.total_quantity ?? ''}
          className="form-input"
          placeholder="La stå tomt for ubegrenset"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Ingredienser</label>
        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ingredients.map(ingredient => (
              <label
                key={ingredient.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedIngredients.includes(ingredient.id)}
                  onChange={() => toggleIngredient(ingredient.id)}
                  className="form-checkbox"
                />
                <span className={ingredient.allergen ? 'text-red-600 font-semibold' : ''}>
                  {ingredient.name}
                  {ingredient.allergen && ' ⚠️'}
                </span>
              </label>
            ))}
          </div>
        </div>
        <small className="text-gray-500">Røde = allergener</small>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={batch.is_active}
            className="form-checkbox"
          />
          <span>Aktiv (synlig for kunder)</span>
        </label>
      </div>

      <Button type="submit" fullWidth loading={loading}>
        {loading ? 'Lagrer...' : 'Lagre endringer'}
      </Button>
    </form>
  )
}
