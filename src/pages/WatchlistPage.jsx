import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../components/AppContext'
import { getWatchlist } from '../lib/supabase'
import { posterUrl } from '../lib/tmdb'

const TABS = [
  { key: 'watching', label: 'Watching' },
  { key: 'want', label: 'Want to watch' },
  { key: 'watched', label: 'Watched' },
]

export default function WatchlistPage() {
  const { user } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('watching')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getWatchlist(user.id, tab).then(({ data }) => {
      setItems(data || [])
      setLoading(false)
    })
  }, [user, tab])

  return (
    <div className="page page-enter">
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="logo">Good<span>Views</span></div>
        </div>
      </div>

      <div style={{ paddingTop: 'calc(var(--nav-h) + var(--safe-top))', paddingBottom: 'calc(var(--tab-h) + var(--safe-bottom))' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', paddingTop: 8 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '12px 4px', background: 'none', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)', color: tab === t.key ? 'var(--accent)' : 'var(--text2)', borderBottom: `2px solid ${tab === t.key ? 'var(--accent)' : 'transparent'}`, transition: 'all 0.15s', marginBottom: -1 }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" style={{ width: 28, height: 28 }} />
            </div>
          ) : items.length === 0 ? (
            <div className="empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              <h3>Nothing here yet</h3>
              <p>Search for movies or TV shows to add them to this list</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/search')}>Browse titles</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {items.map(item => (
                <div key={item.tmdb_id} onClick={() => navigate(`/${item.media_type}/${item.tmdb_id}`)}
                  style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}>
                  <div style={{ width: 50, height: 74, borderRadius: 8, overflow: 'hidden', background: 'var(--bg3)', flexShrink: 0 }}>
                    {item.poster_path
                      ? <img src={posterUrl(item.poster_path, 'w92')} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎬</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                    <span className={`badge badge-${item.media_type === 'movie' ? 'movie' : 'tv'}`}>{item.media_type === 'movie' ? 'Film' : 'TV'}</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)', flexShrink: 0 }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
