import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../components/AppContext'
import { getWatchlist } from '../lib/supabase'
import { signOut, updateProfile } from '../lib/supabase'

export default function ProfilePage() {
  const { user, profile, showToast, refetchProfile } = useApp()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ watched: 0, watching: 0, want: 0 })
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (!user) return
    setUsername(profile?.username || '')
    getWatchlist(user.id).then(({ data }) => {
      const all = data || []
      setStats({
        watched: all.filter(i => i.status === 'watched').length,
        watching: all.filter(i => i.status === 'watching').length,
        want: all.filter(i => i.status === 'want').length,
      })
    })
  }, [user, profile])

  const handleSave = async () => {
    await updateProfile(user.id, { username })
    await refetchProfile()
    setEditing(false)
    showToast('Profile updated ✓')
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const colors = ['#D85A30','#1D9E75','#7F77DD','#378ADD','#EF9F27']
  const avatarColor = colors[((profile?.username || '').charCodeAt(0) || 0) % colors.length]

  return (
    <div className="page page-enter">
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="logo">Good<span>Views</span></div>
          <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
            Sign out
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 500, color: 'white', marginBottom: 12 }}>
            {(profile?.username || user?.email || '?').slice(0, 2).toUpperCase()}
          </div>
          {editing ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', maxWidth: 240 }}>
              <input value={username} onChange={e => setUsername(e.target.value)} style={{ textAlign: 'center' }} />
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>{profile?.username || 'Set a username'}</h2>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>{user?.email}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit profile</button>
            </>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
          {[['Watched', stats.watched, 'var(--accent)'], ['Watching', stats.watching, 'var(--teal)'], ['Want', stats.want, 'var(--text)']].map(([label, val, color]) => (
            <div key={label} style={{ background: 'var(--bg2)', borderRadius: 12, padding: '14px 10px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 500, color, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        {[
          ['My watchlist', () => navigate('/watchlist')],
          ['Friends', () => navigate('/friends')],
        ].map(([label, action]) => (
          <button key={label} onClick={action} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
            {label}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)' }}>
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}
