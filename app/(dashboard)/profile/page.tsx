'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/axios'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem 1rem',
  borderRadius: '10px',
  border: '1px solid #E5E0DC',
  fontSize: '0.875rem',
  outline: 'none',
  background: '#FAF7F5',
  color: '#4E342E',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 500,
  color: '#4E342E',
  marginBottom: '0.5rem',
}

export default function ProfilePage() {
  const [user, setUser]     = useState<any>(null)
  const [name, setName]     = useState('')
  const [phone, setPhone]   = useState('')
  const [dept, setDept]     = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      const u = JSON.parse(stored)
      setUser(u)
      setName(u.name       ?? '')
      setPhone(u.phone     ?? '')
      setDept(u.department ?? '')
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!user) return
    setSaving(true)
    setSaved(false)
    setError('')
    const form = { name, phone, department: dept }
    try {
      await api.put('/profile', form)
      const updated = { ...user, ...form }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        try {
          await api.put('/user', form)
          const updated = { ...user, ...form }
          localStorage.setItem('user', JSON.stringify(updated))
          setUser(updated)
          setSaved(true)
          setTimeout(() => setSaved(false), 2500)
        } catch (e2: any) {
          setError(e2.response?.data?.message ?? 'Failed to save profile')
        }
      } else {
        setError(err.response?.data?.message ?? 'Failed to save profile')
      }
    } finally {
      setSaving(false)
    }
  }, [user, name, phone, dept])

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
          {(name || user.name)?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#4E342E' }}>{name || user.name}</div>
          <div style={{ fontSize: '0.8rem', color: '#9E9E9E' }}>{user.email}</div>
          <span style={{
            fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '999px',
            background: user.role === 'admin' ? '#F5EDE8' : '#F0F9FF',
            color: user.role === 'admin' ? '#6D4C41' : '#0369A1',
            fontWeight: 600, display: 'inline-block', marginTop: '0.25rem'
          }}>{user.role}</span>
        </div>
      </div>

      {/* Form — inputs are inlined directly, no child components, no focus loss */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid #F0EAE6' }}>

        {/* Email — read only */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Email (cannot be changed)</label>
          <input
            type="email"
            value={user.email ?? ''}
            readOnly
            style={{ ...inputStyle, background: '#F5F5F5', color: '#9E9E9E', cursor: 'not-allowed' }}
          />
        </div>

        {/* Full Name */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
            style={inputStyle}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+1 234 567 8900"
            style={inputStyle}
          />
        </div>

        {/* Department */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Department</label>
          <input
            type="text"
            value={dept}
            onChange={e => setDept(e.target.value)}
            placeholder="e.g. Engineering"
            style={inputStyle}
          />
        </div>

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
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}