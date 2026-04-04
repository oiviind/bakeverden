'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

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

export async function sendReceiptEmail(orderId: string) {
  try {
    const supabase = await createClient()
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(quantity, price_at_time, batch:product_batches(title))')
      .eq('id', orderId)
      .single()

    if (error || !order?.email) return { success: false, error: 'Ordre ikke funnet' }

    const itemLines = (order.order_items ?? [])
      .map((item: { quantity: number; price_at_time: number; batch?: { title: string } }) =>
        `- ${item.batch?.title ?? 'Ukjent'}: ${item.quantity} stk × ${item.price_at_time} kr`
      )
      .join('\n')

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: emailError } = await resend.emails.send({
      from: 'Kjerstis Bakeverden <noreply@bakeverden.no>',
      to: order.email,
      subject: 'Kvittering fra Kjerstis Bakeverden',
      text: `Hei ${order.name},\n\nTakk for din bestilling!\n\n${itemLines}\n\nTotalt: ${order.total_price} kr\n\nBetaling ved henting.\nLyngvegen 11, 2833 Raufoss`,
    })

    if (emailError) return { success: false, error: emailError.message }
    return { success: true }
  } catch (err) {
    console.error('Receipt email error:', err)
    return { success: false, error: 'Kunne ikke sende e-post' }
  }
}

export async function sendReadyEmail(email: string) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: 'Kjerstis Bakeverden <noreply@bakeverden.no>',
      to: email,
      subject: 'Dine kaker er klar for henting',
      text: 'Dine kaker kan hentes i Lyngvegen 11, 2833 Raufoss',
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    console.error('Email error:', err)
    return { success: false, error: 'Kunne ikke sende e-post' }
  }
}