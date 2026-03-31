'use server'

import { createClient } from '@/lib/supabase'
import type { ProductBatchWithIngredients } from '@/types/database.types'

export async function getAvailableBatches(): Promise<ProductBatchWithIngredients[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('product_batches')
    .select(`
      *,
      batch_ingredients (
        ingredient:ingredients (
          id,
          name,
          allergen
        )
      )
    `)
    .eq('is_active', true)
    .order('pickup_start', { ascending: true })
  
  if (error) {
    console.error('Error fetching batches:', error)
    return []
  }
  
  // Transform data to flatten ingredients
  const batches = data?.map(batch => ({
    ...batch,
    ingredients: batch.batch_ingredients?.map((bi: any) => bi.ingredient) || []
  })) || []
  
  return batches
}

export async function getBatchById(id: string): Promise<ProductBatchWithIngredients | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('product_batches')
    .select(`
      *,
      batch_ingredients (
        ingredient:ingredients (
          id,
          name,
          allergen
        )
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching batch:', error)
    return null
  }
  
  return {
    ...data,
    ingredients: data.batch_ingredients?.map((bi: any) => bi.ingredient) || []
  }
}