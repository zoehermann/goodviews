import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../components/AppContext'
import { getTrending, posterUrl } from '../lib/tmdb'
import { getWatchlist, getFriendActivity } from '../lib/supabase'

function PosterCard({ item, onClick }) {
  const title = item.title || item.name
  const type = item.media_type || item.type
  return (
    <div style={{ flexShrink: 0, width: 100, cursor: 'pointer' }} onClick={onClick}>
      <div style={{ width: 100, height: 148, borderRadius: 10, overflow: 'hidden', background: 'var(--bg3)', marginBottom: 6 }}>
        {item.poster_path
          ? <img src={posterUrl(item.poster_path)} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎬</div>
        }
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3, color: 'var(--text)', marginBottom: 3 }}>{title}</div>
      <span className={`badge badge-${type === 'movie' ? 'movie' : 'tv'}`}>{type === 'movie' ? 'Film' : 'TV'}</span>
    </div>
  )
}

function AvatarCircle({ name, color }) {
  const colors = ['#D85A30','#1D9E75','#7F77DD','#378ADD','#EF9F27']
  const bg = color || colors[(name?.charCodeAt(0) || 0) % colors.length]
  const initials = (name || '?').slice(0, 2).toUpperCase()
  return <div className="avatar" style={{ background: bg }}>{initials}</div>
}

export default function HomePage() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const [trending, setTrending] = useState([])
  const [watching, setWatching] = useState([])
  const [activity, setActivity] = useState([])
  const [stats, setStats] = useState({ watched: 0, watchlist: 0 })

  useEffect(() => {
    getTrending().then(d => setTrending((d.results || []).slice(0, 10)))
    if (user) {
      getWatchlist(user.id).then(({ data }) => {
        const all = data || []
        setWatching(all.filter(i => i.status === 'watching').slice(0, 6))
        setStats({ watched: all.filter(i => i.status === 'watched').length, watchlist: all.filter(i => i.status === 'want').length })
      })
      getFriendActivity(user.id).then(({ data }) => setActivity(data || []))
    }
  }, [user])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const name = profile?.username || 'there'

  return (
    <div className="page page-enter">
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="logo">Good<span>Views</span></div>
          <button onClick={() => navigate('/search')} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Greeting */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{greeting}, {name}</p>
          <h1 style={{ fontSize: 26 }}>What are you watching?</h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
          <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Watched</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: 'var(--accent)' }}>{stats.watched}</div>
          </div>
          <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Want to watch</div>
            <div style={{ fontSize: 28, fontWeight: 500 }}>{stats.watchlist}</div>
          </div>
        </div>

        {/* Currently watching */}
        {watching.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div className="section-head">
              <span className="section-title">Continue watching</span>
              <span className="section-link" onClick={() => navigate('/watchlist')}>See all</span>
            </div>
            <div className="scroll-row">
              {watching.map(item => (
                <PosterCard key={item.tmdb_id} item={{ ...item, media_type: item.media_type, poster_path: item.poster_path }} onClick={() => navigate(`/${item.media_type}/${item.tmdb_id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        <div style={{ marginBottom: 28 }}>
          <div className="section-head">
            <span className="section-title">Trending this week</span>
            <span className="section-link" onClick={() => navigate('/search')}>Explore</span>
          </div>
          <div className="scroll-row">
            {trending.map(item => (
              <PosterCard key={item.id} item={item} onClick={() => navigate(`/${item.media_type}/${item.id}`)} />
            ))}
          </div>
        </div>

        {/* Friend activity */}
        <div style={{ marginBottom: 8 }}>
          <div className="section-head">
            <span className="section-title">Friends' activity</span>
            <span className="section-link" onClick={() => navigate('/friends')}>All</span>
          </div>
          {activity.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
              Add friends to see what they're watching
            </div>
          ) : (
            activity.map((item, i) => (
              <div key={i} className="activity-item">
                <AvatarCircle name={item.profiles?.username} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                    <strong style={{ fontWeight: 500 }}>{item.profiles?.username}</strong>
                    {' '}rated{' '}
                    <span style={{ color: 'var(--accent)' }}>a {item.media_type}</span>
                    {' '}{'★'.repeat(item.rating)}
                  </div>
                  {item.review_text && <p style={{ fontSize: 12, marginTop: 3, color: 'var(--text2)', lineHeight: 1.4 }}>{item.review_text.slice(0, 80)}{item.review_text.length > 80 ? '…' : ''}</p>}
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{new Date(item.updated_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
