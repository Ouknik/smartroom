'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.875rem',
  border: '1px solid #E5E0DC', borderRadius: '8px',
  fontSize: '0.875rem', outline: 'none',
  background: '#FAF7F5', boxSizing: 'border-box',
  color: '#4E342E',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8rem',
  fontWeight: 500, color: '#4E342E', marginBottom: '0.375rem',
}

const fieldWrap: React.CSSProperties = { marginBottom: '1rem' }

export default function AddRoomPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  // ─── Separate state per field — no focus loss ───────────────────────────────
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity]       = useState('1')
  const [floor, setFloor]             = useState('')
  const [building, setBuilding]       = useState('')
  const [type, setType]               = useState('meeting')
  const [status, setStatus]           = useState('available')
  const [requiresApproval, setRequiresApproval] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      const u = JSON.parse(stored)
      if (u.role !== 'admin') router.replace('/dashboard')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/admin/rooms', {
        name, description,
        capacity: Number(capacity),
        floor: floor ? Number(floor) : null,
        building, type, status,
        requires_approval: requiresApproval,
      })
      router.push('/rooms')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to create room')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6D4C41', fontSize: '0.875rem', fontWeight: 500, padding: 0, marginBottom: '0.75rem' }}
        >← Back</button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4E342E' }}>Add New Room</h2>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #F0EAE6' }}>
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Room Name */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Room Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Innovation Lab"
              required
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description"
              style={inputStyle}
            />
          </div>

          {/* Capacity + Floor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                placeholder="10"
                min={1}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Floor</label>
              <input
                type="number"
                value={floor}
                onChange={e => setFloor(e.target.value)}
                placeholder="1"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Building */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Building</label>
            <input
              type="text"
              value={building}
              onChange={e => setBuilding(e.target.value)}
              placeholder="Building A"
              style={inputStyle}
            />
          </div>

          {/* Type */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              style={inputStyle}
            >
              <option value="meeting">Meeting Room</option>
              <option value="classroom">Classroom</option>
              <option value="lab">Lab</option>
              <option value="coworking">Coworking Space</option>
              <option value="conference">Conference Hall</option>
            </select>
          </div>

          {/* Status */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={inputStyle}
            >
              <option value="available">Available</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Requires approval */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <input
              type="checkbox"
              id="approval"
              checked={requiresApproval}
              onChange={e => setRequiresApproval(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="approval" style={{ fontSize: '0.8rem', color: '#4E342E', cursor: 'pointer' }}>
              Requires admin approval
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none',
              background: submitting ? '#A1887F' : 'linear-gradient(135deg, #6D4C41, #4E342E)',
              color: 'white', fontSize: '0.875rem', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Creating...' : 'Create Room'}
          </button>

        </form>
      </div>
    </div>
  )
}