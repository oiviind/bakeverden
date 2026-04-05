'use server'

import { createClient } from '@/lib/supabase'
import type { ProductBatch } from '@/types/database.types'

export async function getPopularBatches(limit = 3): Promise<ProductBatch[]> {
  const supabase = createClient()

  const { data: items } = await supabase
    .from('order_items')
    .select('batch_id, quantity')

  if (!items?.length) return []

  const counts: Record<string, number> = {}
  for (const item of items) {
    if (!item.batch_id) continue
    counts[item.batch_id] = (counts[item.batch_id] ?? 0) + item.quantity
  }

  const topIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (!topIds.length) return []

  const { data: batches } = await supabase
    .from('product_batches')
    .select('*')
    .in('id', topIds)

  return topIds
    .map(id => batches?.find(b => b.id === id))
    .filter(Boolean) as ProductBatch[]
}
