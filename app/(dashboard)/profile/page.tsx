'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'

// ─── Field must be defined OUTSIDE the component ──────────────────────────────
// If defined inside, React destroys & recreates it on every render (every
// keystroke), causing the input to lose focus immediately after each character.
// ─────────────────────────────────────────────────────────────────────────────
interface FieldProps {
  label: string
  field: string
  value: string
  type?: string
  readOnly?: boolean
  onChange: (field: string, value: string) => void
}

function Field({ label, field, value, type = 'text', readOnly = false, onChange }: FieldProps) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{
        display: 'block', fontSize: '0.8rem', fontWeight: 500,
        color: '#4E342E', marginBottom: '0.5rem'
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={e => onChange(field, e.target.value)}
        style={{
          width: '100%', padding: '0.7rem 1rem', borderRadius: '10px',
          border: '1px solid #E5E0DC', fontSize: '0.875rem', outline: 'none',
          background: readOnly ? '#F5F5F5' : '#FAF7F5',
          color: readOnly ? '#9E9E9E' : '#4E342E',
          cursor: readOnly ? 'not-allowed' : 'text',
          boxSizing: 'border-box' as const,
        }}
      />
    </div>
  )
}

export default function ProfilePage() {
  const [user, setUser]     = useState<any>(null)
  const [form, setForm]     = useState({ name: '', phone: '', department: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      const u = JSON.parse(stored)
      setUser(u)
      setForm({
        name:       u.name       ?? '',
        phone:      u.phone      ?? '',
        department: u.department ?? '',
      })
    }
  }, [])

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      // Try /profile first (standard Laravel auth endpoint)
      // Falls back to /user if /profile doesn't exist
      const res = await api.put('/profile', form)
      const updated = { ...user, ...form }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      // If /profile returns 404, try /user
      if (err.response?.status === 404 || err.response?.status === 405) {
        try {
          await api.put('/user', form)
          const updated = { ...user, ...form }
          localStorage.setItem('user', JSON.stringify(updated))
          setUser(updated)
          setSaved(true)
          setTimeout(() => setSaved(false), 2500)
        } catch (err2: any) {
          setError(err2.response?.data?.message ?? 'Failed to save profile')
        }
      } else {
        setError(err.response?.data?.message ?? 'Failed to save profile')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!user) return <div style={{ padding: '2rem', color: '#9E9E9E' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4E342E' }}>Profile</h2>
        <p style={{ fontSize: '0.875rem', color: '#9E9E9E', marginTop: '0.25rem' }}>
          Manage your account details
        </p>
      </div>

      {/* Avatar card */}
      <div style={{
        background: 'white', borderRadius: '14px', padding: '1.5rem',
        border: '1px solid #F0EAE6', marginBottom: '1rem',
        display: 'flex', alignItems: 'center', gap: '1rem'
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #C8A97E, #6D4C41)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0
        }}>
          {user.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#4E342E' }}>{user.name}</div>
          <div style={{ fontSize: '0.8rem', color: '#9E9E9E' }}>{user.email}</div>
          <span style={{
            fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '999px',
            background: user.role === 'admin' ? '#F5EDE8' : '#F0F9FF',
            color: user.role === 'admin' ? '#6D4C41' : '#0369A1',
            fontWeight: 600, textTransform: 'capitalize' as const,
            marginTop: '0.25rem', display: 'inline-block'
          }}>{user.role}</span>
        </div>
      </div>

      {/* Form */}
      <div style={{
        background: 'white', borderRadius: '14px', padding: '1.5rem',
        border: '1px solid #F0EAE6'
      }}>
        {/* Read-only email */}
        <Field
          label="Email (cannot be changed)"
          field="email"
          value={user.email ?? ''}
          readOnly
          onChange={() => {}}
        />

        <Field label="Full Name"   field="name"       value={form.name}       onChange={handleChange} />
        <Field label="Phone"       field="phone"      value={form.phone}      onChange={handleChange} />
        <Field label="Department"  field="department" value={form.department} onChange={handleChange} />

        {saved && (
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A',
            padding: '0.625rem 1rem', borderRadius: '8px', fontSize: '0.8rem',
            marginBottom: '1rem'
          }}>
            ✓ Profile saved successfully.
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
            padding: '0.625rem 1rem', borderRadius: '8px', fontSize: '0.8rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none',
            background: saving ? '#A1887F' : 'linear-gradient(135deg, #6D4C41, #4E342E)',
            color: 'white', fontSize: '0.875rem', fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}