'use client'

import { useState } from 'react'
import { updateRequestStatus } from '@/app/admin/requests/actions'
import { Card, Badge } from '@/components/ui'

type RequestStatus = 'ny' | 'kontaktet' | 'avtalt' | 'avslått'

interface RequestCardProps {
  request: {
    id: string
    occasion: string
    num_people: number | null
    desired_date: string | null
    description: string
    name: string
    email: string
    phone: string | null
    status: RequestStatus
    created_at: string
  }
}

const statusConfig: Record<RequestStatus, { label: string; variant: 'warning' | 'info' | 'success' | 'error' }> = {
  ny: { label: 'Ny', variant: 'warning' },
  kontaktet: { label: 'Kontaktet', variant: 'info' },
  avtalt: { label: 'Avtalt', variant: 'success' },
  avslått: { label: 'Avslått', variant: 'error' },
}

export default function RequestCard({ request }: RequestCardProps) {
  const [status, setStatus] = useState<RequestStatus>(request.status)
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(newStatus: RequestStatus) {
    setLoading(true)
    const result = await updateRequestStatus(request.id, newStatus)
    if (result.success) setStatus(newStatus)
    setLoading(false)
  }

  const config = statusConfig[status]

  return (
    <Card>
      <Card.Content>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{request.name}</h3>
            <p className="text-sm text-gray-600">📧 {request.email}</p>
            {request.phone && <p className="text-sm text-gray-600">📞 {request.phone}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {new Date(request.created_at).toLocaleString('nb-NO', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
          <p><span className="font-medium">Anledning:</span> {request.occasion}</p>
          {request.num_people && <p><span className="font-medium">Antall:</span> {request.num_people} pers.</p>}
          {request.desired_date && (
            <p><span className="font-medium">Ønsket dato:</span>{' '}
              {new Date(request.desired_date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          <p className="mt-2"><span className="font-medium">Beskrivelse:</span></p>
          <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
        </div>

        <select
          value={status}
          disabled={loading}
          onChange={e => handleStatusChange(e.target.value as RequestStatus)}
          className="form-input"
        >
          {(Object.keys(statusConfig) as RequestStatus[]).map(s => (
            <option key={s} value={s}>{statusConfig[s].label}</option>
          ))}
        </select>
      </Card.Content>
    </Card>
  )
}
