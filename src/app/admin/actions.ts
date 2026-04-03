'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(
  orderId: string, 
  status: 'pending' | 'ready' | 'delivered' | 'cancelled'
) {
  try {
    console.log('🔍 updateOrderStatus called:', { orderId, status }) // Debug log
    
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select() // Legg til .select() for å få tilbake oppdatert data

    console.log('📊 Supabase response:', { data, error }) // Debug log

    if (error) {
      console.error('❌ Error updating order status:', error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      console.error('⚠️ No rows updated')
      return { success: false, error: 'Ingen ordre ble oppdatert' }
    }

    console.log('✅ Order updated successfully:', data[0])
    
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    console.error('💥 Unexpected error:', err)
    return { success: false, error: 'Noe gikk galt' }
  }
}