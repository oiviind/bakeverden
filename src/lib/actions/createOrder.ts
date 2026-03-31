'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { CreateOrderResult } from '@/types/database.types'

export async function createOrder(formData: FormData): Promise<CreateOrderResult> {
  const supabase = createClient()
  
  const batchId = formData.get('batchId') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const quantity = Number(formData.get('quantity'))

  console.log('=== CREATE ORDER START ===')
  console.log('Input:', { batchId, name, phone, quantity })

  // Validering
  if (!name || !phone || !quantity || quantity < 1) {
    console.log('Validation failed')
    return {
      success: false,
      error: 'Vennligst fyll ut alle feltene'
    }
  }

  // Sjekk batch først
  const { data: batchCheck } = await supabase
    .from('product_batches')
    .select('id, title, remaining_quantity, is_active')
    .eq('id', batchId)
    .single()

  console.log('Batch check:', batchCheck)

  if (!batchCheck) {
    return {
      success: false,
      error: 'Fant ikke produktet'
    }
  }

  if (!batchCheck.is_active) {
    return {
      success: false,
      error: 'Produktet er ikke aktivt'
    }
  }

  if (batchCheck.remaining_quantity < quantity) {
    return {
      success: false,
      error: `Kun ${batchCheck.remaining_quantity} igjen`
    }
  }

  try {
    const { data, error } = await supabase.rpc('create_order', {
      p_batch_id: batchId,
      p_name: name,
      p_phone: phone,
      p_quantity: quantity
    })

    console.log('RPC response:', { data, error })

    if (error) {
      console.error('Supabase RPC error:', error)
      return {
        success: false,
        error: 'Database feil: ' + error.message
      }
    }

    if (!data || !data.success) {
      console.log('RPC returned failure:', data)
      return {
        success: false,
        error: data?.error || 'Ikke nok tilgjengelig'
      }
    }

    console.log('=== ORDER SUCCESS ===')

    revalidatePath('/')
    revalidatePath(`/reserve/${batchId}`)

    return {
      success: true,
      order_id: data.order_id
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    return {
      success: false,
      error: 'En uventet feil oppstod: ' + String(err)
    }
  }
}