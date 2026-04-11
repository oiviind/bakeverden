'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateRequestStatus(
  id: string,
  status: 'ny' | 'kontaktet' | 'avtalt' | 'avslått'
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('cake_requests')
    .update({ status })
    .eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/requests')
  return { success: true }
}
