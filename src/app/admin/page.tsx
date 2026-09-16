// src/app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Header from '@/components/Header'
import UpdatedToast from '@/components/admin/UpdatedToast'
import { Alert } from '@/components/ui'
import Link from 'next/link'
import {
  ClipboardList,
  MessageCircleQuestion,
  CakeSlice,
  Images,
  BarChart3,
  PlusCircle,
} from 'lucide-react'
import styles from './admin-dashboard.module.css'

export const revalidate = 0

function startOfWeek(): Date {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay() // man=1 ... søn=7
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() - (day - 1))
  return monday
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function oldestUnansweredLabel(dateStr: string): string {
  const dayDiff = Math.floor(
    (startOfDay(new Date()).getTime() - startOfDay(new Date(dateStr)).getTime()) / 86400000
  )
  if (dayDiff <= 0) return 'Eldste er fra i dag'
  if (dayDiff === 1) return 'Eldste er fra i går'
  return `Eldste er fra ${dayDiff} dager siden`
}

function weekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function greetingWord(): string {
  const hour = new Date().getHours()
  if (hour < 10) return 'God morgen'
  if (hour < 18) return 'God dag'
  return 'God kveld'
}

export default async function AdminPage() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const [ordersRes, requestsRes, batchesTotalRes, batchesActiveRes, galleryRes] =
    await Promise.all([
      adminSupabase
        .from('orders')
        .select('id, status, created_at'),
      adminSupabase.from('cake_requests').select('id, status, created_at'),
      supabase.from('product_batches').select('id', { count: 'exact', head: true }),
      supabase
        .from('product_batches')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase.from('gallery_images').select('id', { count: 'exact', head: true }),
    ])

  if (ordersRes.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header isLoggedIn={true} />
        <div className="container mt-8">
          <Alert variant="error">Feil ved lasting: {ordersRes.error.message}</Alert>
        </div>
      </div>
    )
  }

  const orders = ordersRes.data || []
  const requests = requestsRes.data || []

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const readyOrders = orders.filter(o => o.status === 'ready')
  const weekOrders = orders.filter(o => new Date(o.created_at) >= startOfWeek())

  const unansweredRequests = requests.filter(r => r.status === 'ny')
  const oldestUnanswered = unansweredRequests.reduce<string | null>((oldest, r) => {
    if (!oldest || new Date(r.created_at) < new Date(oldest)) return r.created_at
    return oldest
  }, null)

  const totalBatches = batchesTotalRes.count ?? 0
  const activeBatches = batchesActiveRes.count ?? 0
  const inactiveBatches = totalBatches - activeBatches
  const galleryCount = galleryRes.count ?? 0

  const waitingCount = pendingOrders.length
  const readyCount = readyOrders.length

  const cards = [
    {
      href: '/admin/bestillinger',
      icon: ClipboardList,
      title: 'Bestillinger',
      tag: waitingCount > 0 ? `${waitingCount} nye` : null,
      meta:
        readyCount > 0
          ? `${readyCount} klar${readyCount === 1 ? '' : 'e'} for henting`
          : 'Ingen klare for henting',
      iconVariant: 'A' as const,
    },
    {
      href: '/admin/requests',
      icon: MessageCircleQuestion,
      title: 'Forespørsler',
      tag:
        unansweredRequests.length > 0
          ? `${unansweredRequests.length} ubesvart${unansweredRequests.length === 1 ? '' : 'e'}`
          : null,
      meta: oldestUnanswered
        ? oldestUnansweredLabel(oldestUnanswered)
        : 'Ingen ubesvarte forespørsler',
      iconVariant: 'B' as const,
    },
    {
      href: '/admin/batches',
      icon: CakeSlice,
      title: 'Administrer kaker',
      tag: null,
      meta: `${totalBatches} varer, ${inactiveBatches} inaktive`,
      iconVariant: 'A' as const,
    },
    {
      href: '/admin/galleri',
      icon: Images,
      title: 'Galleri',
      tag: null,
      meta: `${galleryCount} bilder publisert`,
      iconVariant: 'B' as const,
    },
    {
      href: '/admin/statistics',
      icon: BarChart3,
      title: 'Statistikk',
      tag: null,
      meta: `Uke ${weekNumber(new Date())}: ${weekOrders.length} bestillinger`,
      iconVariant: 'A' as const,
    },
    {
      href: '/admin/orders/new',
      icon: PlusCircle,
      title: 'Ny bestilling',
      tag: null,
      meta: 'Registrer en bestilling du har fått på telefon',
      iconVariant: 'B' as const,
      accent: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <UpdatedToast />
      <Header isLoggedIn={true} />

      <main className="container pt-4 pb-6">
        <div className={styles.greeting}>
          <h1 className={`page-title ${styles.greetingTitle}`}>{greetingWord()}, Kjersti</h1>
          <p className={styles.greetingSubtitle}>
            {waitingCount} bestilling{waitingCount === 1 ? '' : 'er'} venter på svar, og{' '}
            {readyCount} kake{readyCount === 1 ? '' : 'r'} er klar for henting.
          </p>
        </div>

        <div className={styles.grid}>
          {cards.map(card => (
            <Link
              key={card.href + card.title}
              href={card.href}
              className={`${styles.card} ${card.accent ? styles.cardAccent : ''}`}
            >
              <span
                className={`${styles.iconDisc} ${
                  card.iconVariant === 'A' ? styles.iconDiscA : styles.iconDiscB
                }`}
              >
                <card.icon size={26} strokeWidth={2.75} />
              </span>
              <div className={styles.cardTitleRow}>
                <span className={styles.cardTitle}>{card.title}</span>
                {card.tag && <span className={styles.tag}>{card.tag}</span>}
              </div>
              <p className={styles.cardMeta}>{card.meta}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
