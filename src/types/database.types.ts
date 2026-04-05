// src/types/database.types.ts
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

export interface ProductBatchWithIngredients extends ProductBatch {
  batch_ingredients?: BatchIngredient[]
  ingredients?: Ingredient[]
}

export interface OrderItem {
  id: string
  order_id: string
  batch_id: string
  quantity: number
  price_at_time: number
  created_at: string
  batch?: ProductBatch
}

export interface CakeRequest {
  id: string
  occasion: string
  num_people: number | null
  desired_date: string | null
  description: string
  name: string
  email: string
  phone: string | null
  status: 'ny' | 'kontaktet' | 'avtalt' | 'avslått'
  created_at: string
}

export interface GalleryImage {
  id: string
  image_url: string
  category: string
  created_at: string
}

export interface Order {
  id: string
  name: string
  phone: string
  email?: string
  total_price: number
  status: 'pending' | 'ready' | 'delivered' | 'cancelled'
  sms_sent: boolean
  email_sent: boolean
  created_at: string
  order_items?: OrderItem[]
}