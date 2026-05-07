import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMovie, getTVShow, posterUrl, backdropUrl } from '../lib/tmdb'
import { addToWatchlist, removeFromWatchlist, getUserReview, upsertReview, getReviewsForItem, getWatchlist } from '../lib/supabase'
import { useApp } from '../components/AppContext'

const STATUS_LABELS = { want: 'Want to watch', watching: 'Watching', watched: 'Watched' }
const STATUS_COLORS = { want: 'var(--text2)', watching: 'var(--teal)', watched: 'var(--accent)' }

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="stars">
      {[1,2,3,4,5].map(n => (
        <span key={n} className="star"
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          style={{ color: n <= (hover || value) ? 'var(--gold)' : 'var(--border2)', fontSize: 26 }}>★</span>
      ))}
    </div>
  )
}

function ReviewSheet({ onClose, onSave, existing }) {
  const [rating, setRating] = useState(existing?.rating || 0)
  const [text, setText] = useState(existing?.review_text || '')
  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet" style={{ maxWidth: 430, margin: '0 auto' }}>
        <div className="sheet-handle" />
        <h3 style={{ marginBottom: 16 }}>Your review</h3>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Rating</div>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Review (optional)</div>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="What did you think?" style={{ resize: 'none' }} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onSave(rating, text)} disabled={!rating}>
          Save review
        </button>
      </div>
    </div>
  )
}

export default function DetailPage() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const { user, showToast } = useApp()
  const [item, setItem] = useState(null)
  const [status, setStatus] = useState(null)
  const [myReview, setMyReview] = useState(null)
  const [reviews, setReviews] = useState([])
  const [showReview, setShowReview] = useState(false)
  const [showActions, setShowActions] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetch = type === 'movie' ? getMovie : getTVShow
    fetch(id).then(setItem)
    if (user) {
      getUserReview(user.id, id).then(({ data }) => setMyReview(data))
      getReviewsForItem(id).then(({ data }) => setReviews(data || []))
      getWatchlist(user.id).then(({ data }) => {
        const found = (data || []).find(i => String(i.tmdb_id) === String(id))
        if (found) setStatus(found.status)
      })
    }
  }, [type, id, user])

  if (!item) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  const title = item.title || item.name
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const runtime = item.runtime ? `${item.runtime}m` : item.number_of_seasons ? `${item.number_of_seasons} season${item.number_of_seasons > 1 ? 's' : ''}` : ''
  const genres = (item.genres || []).slice(0, 3).map(g => g.name).join(' · ')
  const providers = item['watch/providers']?.results?.US?.flatrate || []

  const handleStatus = async (newStatus) => {
    if (!user) return
    if (newStatus === status) {
      await removeFromWatchlist(user.id, id)
      setStatus(null)
      showToast('Removed from list')
    } else {
      await addToWatchlist(user.id, { id, media_type: type, title: item.title || item.name, poster_path: item.poster_path }, newStatus)
      setStatus(newStatus)
      showToast(STATUS_LABELS[newStatus] + ' ✓')
    }
    setShowActions(false)
  }

  const handleSaveReview = async (rating, text) => {
    if (!user) return
    await upsertReview(user.id, id, type, rating, text)
    await addToWatchlist(user.id, { id, media_type: type, title: item.title || item.name, poster_path: item.poster_path }, 'watched')
    setStatus('watched')
    setMyReview({ rating, review_text: text })
    const { data } = await getReviewsForItem(id)
    setReviews(data || [])
    setShowReview(false)
    showToast('Review saved ✓')
  }

  return (
    <div className="page-enter" style={{ paddingBottom: 'calc(var(--tab-h) + var(--safe-bottom))' }}>
      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{ position: 'fixed', top: 'calc(var(--safe-top) + 12px)', left: 16, zIndex: 50, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: 20, padding: '6px 12px 6px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        Back
      </button>

      {/* Backdrop */}
      {item.backdrop_path
        ? <img src={backdropUrl(item.backdrop_path)} alt="" className="backdrop" />
        : <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--bg3)' }} />
      }

      <div style={{ padding: '0 16px' }}>
        {/* Title row */}
        <div style={{ display: 'flex', gap: 14, marginTop: -44, marginBottom: 16, alignItems: 'flex-end' }}>
          <div style={{ width: 90, height: 134, borderRadius: 10, overflow: 'hidden', background: 'var(--bg3)', flexShrink: 0, border: '2px solid var(--border2)' }}>
            {item.poster_path && <img src={posterUrl(item.poster_path)} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>{title}</h2>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{[year, runtime, genres].filter(Boolean).join(' · ')}</div>
            {item.vote_average > 0 && <div style={{ fontSize: 13, color: 'var(--gold)' }}>★ {item.vote_average.toFixed(1)} <span style={{ color: 'var(--text3)' }}>({(item.vote_count || 0).toLocaleString()})</span></div>}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className={`btn ${status ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setShowActions(true)}>
            {status ? STATUS_LABELS[status] : '+ Add to list'}
          </button>
          <button className="btn btn-ghost" onClick={() => setShowReview(true)}>
            {myReview ? '★ ' + myReview.rating : 'Rate'}
          </button>
        </div>

        {/* Overview */}
        {item.overview && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text)' }}>{item.overview}</p>
          </div>
        )}

        {/* Streaming on */}
        {providers.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stream on</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {providers.slice(0, 5).map(p => (
                <div key={p.provider_id} style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: 'var(--bg3)' }}>
                  <img src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} alt={p.provider_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div style={{ marginBottom: 8 }}>
          <div className="section-head">
            <span className="section-title">Reviews</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{reviews.length} total</span>
          </div>
          {reviews.length === 0 ? (
            <div style={{ padding: '16px 0', color: 'var(--text3)', fontSize: 13 }}>No reviews yet. Be the first!</div>
          ) : (
            reviews.slice(0, 5).map((r, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: 'white' }}>
                    {(r.profiles?.username || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.profiles?.username}</span>
                  <span style={{ fontSize: 12, color: 'var(--gold)' }}>{'★'.repeat(r.rating)}</span>
                </div>
                {r.review_text && <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>{r.review_text}</p>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Status sheet */}
      {showActions && (
        <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && setShowActions(false)}>
          <div className="sheet" style={{ maxWidth: 430, margin: '0 auto' }}>
            <div className="sheet-handle" />
            <h3 style={{ marginBottom: 16 }}>Add to list</h3>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => handleStatus(key)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                <span style={{ color: status === key ? STATUS_COLORS[key] : 'var(--text)' }}>{label}</span>
                {status === key && <span style={{ color: STATUS_COLORS[key] }}>✓</span>}
              </button>
            ))}
            {status && (
              <button onClick={() => handleStatus(status)} style={{ width: '100%', padding: '14px 0', background: 'none', border: 'none', color: '#E24B4A', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--sans)', marginTop: 4 }}>
                Remove from list
              </button>
            )}
          </div>
        </div>
      )}

      {showReview && <ReviewSheet onClose={() => setShowReview(false)} onSave={handleSaveReview} existing={myReview} />}
    </div>
  )
}
