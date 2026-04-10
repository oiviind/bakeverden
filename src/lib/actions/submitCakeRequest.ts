'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitCakeRequest(formData: FormData) {
  const occasion = formData.get('occasion') as string
  const num_people = formData.get('num_people') ? Number(formData.get('num_people')) : null
  const desired_date = (formData.get('desired_date') as string) || null
  const description = formData.get('description') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = (formData.get('phone') as string) || null

  if (!occasion || !description || !name || !email) {
    return { success: false, error: 'Fyll ut alle påkrevde felt' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('cake_requests').insert({
      occasion,
      num_people,
      desired_date,
      description,
      name,
      email,
      phone,
    })

    if (error) return { success: false, error: error.message }

    await resend.emails.send({
      from: 'Bakeverden <noreply@kjerstisbakeverden.com>',
      to: 'kjerstiringelien@hotmail.com',
      subject: `Ny kakeforespørsel fra ${name}`,
      text: [
        `Ny kakeforespørsel fra ${name}`,
        `E-post: ${email}`,
        phone ? `Telefon: ${phone}` : null,
        `Anledning: ${occasion}`,
        num_people ? `Antall personer: ${num_people}` : null,
        desired_date ? `Ønsket dato: ${desired_date}` : null,
        ``,
        `Beskrivelse:`,
        description,
      ].filter(Boolean).join('\n'),
    })

    return { success: true }
  } catch (err) {
    console.error('submitCakeRequest error:', err)
    return { success: false, error: 'Noe gikk galt, prøv igjen' }
  }
}
