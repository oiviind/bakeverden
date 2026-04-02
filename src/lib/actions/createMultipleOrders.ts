'use server'

import { createClient } from '@/lib/supabase'

interface CreateOrderResult {
  success: boolean
  orderId?: string
  error?: string
}

export async function createMultipleOrders(formData: FormData): Promise<CreateOrderResult> {
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const cartItemsJson = formData.get('cartItems') as string
  
  if (!name || !phone || !cartItemsJson) {
    return {
      success: false,
      error: 'Mangler påkrevd informasjon'
    }
  }

  try {
    const cartItems = JSON.parse(cartItemsJson) as Array<{
      batchId: string
      quantity: number
    }>

    if (cartItems.length === 0) {
      return {
        success: false,
        error: 'Handlekurven er tom'
      }
    }

    // 1. Valider alle batches og hent data
    const batchesData: Array<{ id: string; price: number; remaining_quantity: number; title: string }> = []
    let totalPrice = 0

    for (const item of cartItems) {
      const { data: batch, error: batchError } = await supabase
        .from('product_batches')
        .select('id, title, price, remaining_quantity')
        .eq('id', item.batchId)
        .single()

      if (batchError || !batch) {
        return {
          success: false,
          error: 'En eller flere kaker finnes ikke lenger'
        }
      }

      if (batch.remaining_quantity < item.quantity) {
        return {
          success: false,
          error: `Ikke nok tilgjengelig av ${batch.title} (kun ${batch.remaining_quantity} igjen)`
        }
      }

      batchesData.push(batch)
      totalPrice += batch.price * item.quantity
    }

    // 2. Opprett hovedordre
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        name: name,
        phone: phone,
        total_price: totalPrice,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order creation error:', orderError)
      return {
        success: false,
        error: `Kunne ikke opprette ordre: ${orderError?.message || 'Ukjent feil'}`
      }
    }

    // 3. Opprett order_items og oppdater quantities
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i]
      const batch = batchesData[i]

      // Opprett order_item
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          batch_id: item.batchId,
          quantity: item.quantity,
          price_at_time: batch.price
        })

      if (itemError) {
        console.error('Order item creation error:', itemError)
        
        // Slett ordren hvis order_items feiler
        await supabase.from('orders').delete().eq('id', order.id)
        
        return {
          success: false,
          error: 'Kunne ikke opprette ordredetaljer'
        }
      }

      // Oppdater remaining_quantity
      const newQuantity = batch.remaining_quantity - item.quantity
      const { error: updateError } = await supabase
        .from('product_batches')
        .update({ remaining_quantity: newQuantity })
        .eq('id', item.batchId)

      if (updateError) {
        console.error('Quantity update error:', updateError)
        
        // Slett ordren hvis update feiler
        await supabase.from('orders').delete().eq('id', order.id)
        
        return {
          success: false,
          error: 'Kunne ikke oppdatere lagerstatus'
        }
      }
    }

    return {
      success: true,
      orderId: order.id
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    return {
      success: false,
      error: 'En uventet feil oppstod'
    }
  }
}