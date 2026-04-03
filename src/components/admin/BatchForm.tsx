'use client'

import { useState, useRef } from 'react'
import { createBatch } from '@/lib/actions/createBatch'
import ImageUpload from './ImageUpload'
import { Button, Alert } from '@/components/ui'
import type { Ingredient } from '@/types/database.types'

interface BatchFormProps {
  ingredients: Ingredient[]
}

export default function BatchForm({ ingredients }: BatchFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState<string>('')
  const [resetImage, setResetImage] = useState(0) // Counter for å tvinge reset
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    // Legg til valgte ingredienser og bilde-URL
    formData.append('ingredients', JSON.stringify(selectedIngredients))
    formData.set('image_url', imageUrl)
    
    const result = await createBatch(formData)
    
    setLoading(false)
    
    if (result.success) {
      setSuccess(true)
      setSelectedIngredients([])
      setImageUrl('')
      setResetImage(prev => prev + 1) // Trigger ImageUpload reset
      formRef.current?.reset()
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || 'Noe gikk galt')
    }
  }

  function toggleIngredient(ingredientId: string) {
    setSelectedIngredients(prev => 
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <Alert variant="success">✅ Kaken ble opprettet!</Alert>
      )}

      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Tittel *</label>
          <input 
            type="text" 
            name="title"
            required 
            className="form-input"
            placeholder="Sjokoladekake"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Pris *</label>
          <input 
            type="number" 
            name="price"
            required 
            className="form-input"
            placeholder="150"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Beskrivelse</label>
        <textarea 
          name="description"
          className="form-input"
          rows={3}
          placeholder="Deilig sjokoladekake med kremost..."
        />
      </div>

      {/* BILDEOPPLASTING - med reset key */}
      <ImageUpload 
        key={resetImage} // Force re-render når resetImage endres
        onImageUploaded={(url) => setImageUrl(url)}
        currentImageUrl=""
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Henting starter *</label>
          <input 
            type="datetime-local" 
            name="pickup_start"
            required 
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Henting slutter *</label>
          <input 
            type="datetime-local" 
            name="pickup_end"
            required 
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Totalt antall *</label>
        <input 
          type="number" 
          name="total_quantity"
          required 
          min="1"
          className="form-input"
          placeholder="10"
        />
      </div>

      {/* Ingredienser */}
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
            defaultChecked
            className="form-checkbox"
          />
          <span>Aktiv (synlig for kunder)</span>
        </label>
      </div>

      <Button type="submit" fullWidth loading={loading}>
        {loading ? 'Oppretter...' : 'Opprett kake'}
      </Button>
    </form>
  )
}