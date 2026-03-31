export interface ProductBatch {
  id: string
  title: string
  description: string | null
  image_url: string | null
  price: number | null
  pickup_start: string
  pickup_end: string
  total_quantity: number
  remaining_quantity: number
  is_active: boolean
  created_at: string
}

// LEGG TIL DISSE NYE INTERFACES:
export interface Ingredient {
  id: string
  name: string
  allergen: boolean
  created_at: string
}

export interface BatchIngredient {
  id: string
  batch_id: string
  ingredient_id: string
  created_at: string
}

// For joined data
export interface ProductBatchWithIngredients extends ProductBatch {
  ingredients: Ingredient[]
}

// ...existing code... (behold resten av interfaces)

export interface CustomerOrder {
  id: string
  customer_name: string
  customer_phone: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  batch_id: string
  quantity: number
  price_per_unit: number
  subtotal: number
  created_at: string
}

export interface CartItem {
  batch: ProductBatch
  quantity: number
}

export interface Order {
  id: string
  batch_id: string
  name: string
  phone: string
  quantity: number
  pickup_time: string | null
  status: 'confirmed' | 'cancelled' | 'picked_up'
  internal_note: string | null
  created_at: string
}

export interface CreateOrderResult {
  success: boolean
  order_id?: string
  total_amount?: number
  error?: string
}