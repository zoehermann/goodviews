import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchMulti, getTrending, posterUrl } from '../lib/tmdb'

function ResultCard({ item, onClick }) {
  const title = item.title || item.name
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const type = item.media_type
  if (type === 'person') return null
  return (
    <div onClick={onClick} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}>
      <div style={{ width: 48, height: 70, borderRadius: 8, overflow: 'hidden', background: 'var(--bg3)', flexShrink: 0 }}>
        {item.poster_path
          ? <img src={posterUrl(item.poster_path, 'w92')} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎬</div>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className={`badge badge-${type === 'movie' ? 'movie' : 'tv'}`}>{type === 'movie' ? 'Film' : 'TV'}</span>
          {year && <span style={{ fontSize: 12, color: 'var(--text3)' }}>{year}</span>}
          {item.vote_average > 0 && <span style={{ fontSize: 12, color: 'var(--gold)' }}>★ {item.vote_average.toFixed(1)}</span>}
        </div>
        {item.overview && <p style={{ fontSize: 12, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.overview}</p>}
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef()
  const debounce = useRef()

  useEffect(() => {
    getTrending('day').then(d => setTrending((d.results || []).filter(i => i.media_type !== 'person').slice(0, 9)))
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  useEffect(() => {
    clearTimeout(debounce.current)
    if (!query.trim()) { setResults([]); return }
    debounce.current = setTimeout(async () => {
      setLoading(true)
      const d = await searchMulti(query)
      setResults((d.results || []).filter(i => i.media_type !== 'person'))
      setLoading(false)
    }, 400)
  }, [query])

  const go = (item) => navigate(`/${item.media_type}/${item.id}`)

  return (
    <div className="page page-enter">
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="logo">Good<span>Views</span></div>
        </div>
      </div>

      <div className="page-content">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search movies & TV shows…"
          />
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
            <div className="spinner" />
          </div>
        )}

        {!query && !loading && (
          <>
            <div className="section-head" style={{ marginBottom: 12 }}>
              <span className="section-title">Trending today</span>
            </div>
            <div className="poster-grid">
              {trending.map(item => (
                <div key={item.id} className="poster-wrap" onClick={() => go(item)}>
                  {item.poster_path
                    ? <img src={posterUrl(item.poster_path)} alt={item.title || item.name} />
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 24 }}>🎬</div>
                  }
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 8px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', fontSize: 11, fontWeight: 500, lineHeight: 1.3 }}>
                    {item.title || item.name}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {results.length > 0 && (
          <div>
            {results.map(item => (
              <ResultCard key={item.id} item={item} onClick={() => go(item)} />
            ))}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <h3>No results for "{query}"</h3>
            <p>Try a different title or spelling</p>
          </div>
        )}
      </div>
    </div>
  )
}
