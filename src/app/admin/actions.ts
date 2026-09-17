'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

export async function updateOrderStatus(
  orderId: string, 
  status: 'pending' | 'ready' | 'delivered' | 'cancelled'
) {
  try {
    console.log('🔍 updateOrderStatus called:', { orderId, status }) // Debug log
    
    const supabase = createAdminClient()

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
    revalidatePath('/admin/bestillinger')
    return { success: true }
  } catch (err) {
    console.error('💥 Unexpected error:', err)
    return { success: false, error: 'Noe gikk galt' }
  }
}

export async function sendReceiptEmail(orderId: string) {
  try {
    const supabase = createAdminClient()
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(quantity, price_at_time, batch:product_batches(title))')
      .eq('id', orderId)
      .single()

    if (error || !order?.email) return { success: false, error: 'Ordre ikke funnet' }

    const firstName = order.name?.trim().split(/\s+/)[0] ?? ''

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: emailError } = await resend.emails.send({
      from: 'Kjerstis Bakeverden <noreply@kjerstisbakeverden.com>',
      to: order.email,
      subject: 'Takk for bestillingen — Kjerstis Bakeverden',
      html: orderEmailHtml('receipt', firstName, order.order_number, order.order_items ?? [], order.total_price),
    })

    if (emailError) return { success: false, error: emailError.message }
    return { success: true }
  } catch (err) {
    console.error('Receipt email error:', err)
    return { success: false, error: 'Kunne ikke sende e-post' }
  }
}

export async function markEmailSent(orderId: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('orders')
      .update({ email_sent: true })
      .eq('id', orderId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin')
    revalidatePath('/admin/bestillinger')
    return { success: true }
  } catch {
    return { success: false, error: 'Noe gikk galt' }
  }
}

export async function markSmsSent(orderId: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('orders')
      .update({ sms_sent: true })
      .eq('id', orderId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin')
    revalidatePath('/admin/bestillinger')
    return { success: true }
  } catch {
    return { success: false, error: 'Noe gikk galt' }
  }
}

// --- Ordre-e-poster: kvittering og «Kaken din er klar» (HTML, tabellbasert for e-postklienter) ---

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Norsk tusenskille med hardt mellomrom: 1&nbsp;200 kr
const formatKr = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '&nbsp;')} kr`

function orderEmailHtml(
  kind: 'receipt' | 'ready',
  firstName: string,
  orderNumber: number | null | undefined,
  items: Array<{ quantity: number; price_at_time: number; batch?: { title: string } | null }>,
  total: number
) {
  const cell = 'font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:25px;mso-line-height-rule:exactly;color:#201e1d;border-bottom:1px solid #e0d2b8;'
  const itemRows = items
    .map(item => `
              <tr>
                <td width="380" style="width:380px;padding:10px 0 10px 0;${cell}">
                  ${escapeHtml(item.batch?.title ?? 'Ukjent')}<span style="color:#6b6359;"> &nbsp;${item.quantity} × ${formatKr(item.price_at_time)}</span>
                </td>
                <td width="140" align="right" style="width:140px;padding:10px 0 10px 0;${cell}">
                  ${formatKr(item.quantity * item.price_at_time)}
                </td>
              </tr>`)
    .join('')
  const greeting = firstName ? `Hei ${escapeHtml(firstName)}!` : 'Hei!'
  const ready = kind === 'ready'
  const title = ready ? 'Kaken din er klar' : 'Takk for bestillingen'
  const preheader = ready
    ? 'Bestillingen din står klar i Lyngvegen 11. Betal med Vipps eller kontant når du henter.'
    : 'Vi har mottatt bestillingen din. Du får en ny e-post når den er klar til henting.'
  const intro = ready
    ? 'Nå er bestillingen din ferdig og står klar til å hentes.'
    : 'Tusen takk for bestillingen! Du får en ny e-post når den er klar til å hentes.'

  return `<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${title} — Kjerstis Bakeverden</title>
<!--[if mso]>
<style>body,table,td,a{font-family:Arial,Helvetica,sans-serif !important}</style>
<![endif]-->
<style>
  @media only screen and (max-width:620px){
    .pad{padding-left:24px !important;padding-right:24px !important}
    .h1{font-size:30px !important;line-height:36px !important}
    .stackcell{display:block !important;width:100% !important;text-align:left !important;padding-left:0 !important}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#efe3cf;">
<span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${preheader}</span>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#efe3cf;">
  <tr>
    <td align="center" style="padding:32px 12px;">

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background-color:#f5ead8;border-radius:20px;">

        <!-- tittel -->
        <tr>
          <td class="pad" style="padding:38px 40px 0 40px;">
            <h1 class="h1" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:42px;mso-line-height-rule:exactly;color:#201e1d;font-weight:normal;">${title}</h1>
          </td>
        </tr>

        <tr>
          <td class="pad" style="padding:16px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:27px;mso-line-height-rule:exactly;color:#3a3532;">
            ${greeting}<br><br>
            ${intro}
          </td>
        </tr>

        <!-- hentested -->
        <tr>
          <td class="pad" style="padding:28px 40px 0 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#e6edd6;border-radius:16px;">
              <tr>
                <td style="padding:24px 26px 6px 26px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;mso-line-height-rule:exactly;color:#4a5738;letter-spacing:0.08em;text-transform:uppercase;font-weight:bold;">
                  Hentested
                </td>
              </tr>
              <tr>
                <td style="padding:0 26px 4px 26px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:32px;mso-line-height-rule:exactly;color:#201e1d;">
                  Lyngvegen 11, 2833 Raufoss
                </td>
              </tr>${ready ? `
              <tr>
                <td style="padding:0 26px 18px 26px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;mso-line-height-rule:exactly;color:#3a3532;">
                  Den står på trappa i en pose.
                </td>
              </tr>` : `
              <tr>
                <td style="padding:0 0 14px 0;font-size:0;line-height:0;">&nbsp;</td>
              </tr>`}
              <tr>
                <td style="padding:0 26px 26px 26px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" bgcolor="#c67139" style="border-radius:999px;">
                        <a href="https://www.google.com/maps/search/?api=1&amp;query=Lyngvegen+11,+2833+Raufoss" style="display:block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px;">Åpne i kart</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- bestilling -->${orderNumber ? `
        <tr>
          <td class="pad" style="padding:32px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;mso-line-height-rule:exactly;color:#8a5a2e;letter-spacing:0.08em;text-transform:uppercase;font-weight:bold;">
            Bestilling #${orderNumber}
          </td>
        </tr>` : ''}
        <tr>
          <td class="pad" style="padding:${orderNumber ? '4px' : '22px'} 40px 0 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;">${itemRows}
              <tr>
                <td width="380" style="width:380px;padding:14px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:26px;mso-line-height-rule:exactly;color:#201e1d;">
                  Å betale
                </td>
                <td width="140" align="right" style="width:140px;padding:14px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:26px;mso-line-height-rule:exactly;color:#201e1d;">
                  ${formatKr(total)}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- betaling -->
        <tr>
          <td class="pad" style="padding:22px 40px 0 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#f7ded0;border-radius:16px;">
              <tr>
                <td style="padding:22px 26px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:27px;mso-line-height-rule:exactly;color:#3a3532;">
                  <strong style="color:#201e1d;">Betaling ved henting.</strong><br>
                  Vipps til <strong style="color:#201e1d;">454&nbsp;77&nbsp;878</strong>, eller kontant.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- hvis noe ikke stemmer -->
        <tr>
          <td class="pad" style="padding:28px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:27px;mso-line-height-rule:exactly;color:#3a3532;">
            ${ready ? 'Hvis noe ikke stemmer eller du ikke finner frem' : 'Hvis noe ikke stemmer'}, kontakt meg på
            <a href="tel:+4745477878" style="color:#a1552a;text-decoration:underline;">454&nbsp;77&nbsp;878</a>.
          </td>
        </tr>

        <tr>
          <td class="pad" style="padding:26px 40px 0 40px;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:28px;mso-line-height-rule:exactly;color:#201e1d;">
            Hilsen Kjersti
          </td>
        </tr>

        <!-- anmeldelse, diskret (kun i «klar»-e-posten) -->${ready ? `
        <tr>
          <td class="pad" style="padding:30px 40px 0 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;">
              <tr>
                <td style="border-top:1px solid #e0d2b8;padding:22px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;mso-line-height-rule:exactly;color:#3a3532;">
                  Blir du fornøyd, setter jeg stor pris på noen ord på Google.
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
                    <tr>
                      <td align="center" style="border-radius:999px;border:2px solid #c67139;">
                        <a href="https://g.page/r/CVLiAwSkbdQpECE/review" style="display:block;padding:12px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#a1552a;text-decoration:none;border-radius:999px;">Legg igjen en anmeldelse</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ''}

        <tr>
          <td class="pad" style="padding:22px 40px 32px 40px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#6b6359;">
            Kjerstis Bakeverden · Lyngvegen 11, 2833 Raufoss<br>
            Du får denne e-posten fordi du har bestilt hos meg.
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>`
}

export async function sendReadyEmail(
  email: string,
  name: string,
  orderNumber: number | null | undefined,
  orderItems?: Array<{ quantity: number; price_at_time: number; batch?: { title: string } | null }>,
  totalPrice?: number
) {
  try {
    const items = orderItems ?? []
    const total = totalPrice ?? items.reduce((sum, item) => sum + item.quantity * item.price_at_time, 0)
    const firstName = name?.trim().split(/\s+/)[0] ?? ''

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: 'Kjerstis Bakeverden <noreply@kjerstisbakeverden.com>',
      to: email,
      subject: 'Kaken din er klar — Kjerstis Bakeverden',
      html: orderEmailHtml('ready', firstName, orderNumber, items, total),
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    console.error('Email error:', err)
    return { success: false, error: 'Kunne ikke sende e-post' }
  }
}