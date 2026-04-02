export interface ProductBatch {
  id: string
  title: string
  description?: string
  image_url?: string
  price: number
  pickup_start: string
  pickup_end: string
  total_quantity: number
  remaining_quantity: number
  is_active: boolean
  created_at?: string
}

export interface Ingredient {
  id: string
  name: string
  allergen: boolean
}

export interface BatchIngredient {
  batch_id: string
  ingredient_id: string
  ingredient?: Ingredient
}

// Type for batch med ingredienser
export interface ProductBatchWithIngredients extends ProductBatch {
  batch_ingredients?: BatchIngredient[]
  ingredients?: Ingredient[]
}

export interface Reservation {
  id: string
  batch_id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  quantity: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
}