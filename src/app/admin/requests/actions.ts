'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateRequestStatus(
  id: string,
  status: 'ny' | 'kontaktet' | 'avtalt' | 'avslått'
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('cake_requests')
    .update({ status })
    .eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/requests')
  return { success: true }
}
