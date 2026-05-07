import { useEffect, useState } from 'react'
import { useApp } from '../components/AppContext'
import { getFriendActivity, searchUsers, sendFriendRequest } from '../lib/supabase'
import { supabase } from '../lib/supabase'

function AvatarCircle({ name, size = 36 }) {
  const colors = ['#D85A30','#1D9E75','#7F77DD','#378ADD','#EF9F27']
  const bg = colors[(name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 500, color: 'white', flexShrink: 0 }}>
      {(name || '?').slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function FriendsPage() {
  const { user, showToast } = useApp()
  const [activity, setActivity] = useState([])
  const [friends, setFriends] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [tab, setTab] = useState('activity')
  const debounce = { current: null }

  useEffect(() => {
    if (!user) return
    getFriendActivity(user.id).then(({ data }) => setActivity(data || []))
    supabase.from('friends').select('friend_id, profiles!friends_friend_id_fkey(username)').eq('user_id', user.id).eq('status', 'accepted')
      .then(({ data }) => setFriends(data || []))
  }, [user])

  const handleSearch = (q) => {
    setSearchQuery(q)
    clearTimeout(debounce.current)
    if (!q.trim()) { setSearchResults([]); return }
    debounce.current = setTimeout(async () => {
      const { data } = await searchUsers(q)
      setSearchResults((data || []).filter(u => u.id !== user?.id))
    }, 400)
  }

  const handleAdd = async (friendId, username) => {
    await sendFriendRequest(user.id, friendId)
    showToast(`Request sent to ${username} ✓`)
    setSearchResults(r => r.filter(u => u.id !== friendId))
  }

  return (
    <div className="page page-enter">
      <div className="top-nav">
        <div className="top-nav-inner">
          <div className="logo">Good<span>Views</span></div>
        </div>
      </div>

      <div style={{ paddingTop: 'calc(var(--nav-h) + var(--safe-top))', paddingBottom: 'calc(var(--tab-h) + var(--safe-bottom))' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', paddingTop: 8 }}>
          {[['activity','Activity'],['friends','Friends'],['find','Find friends']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '12px 4px', background: 'none', border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)', color: tab === key ? 'var(--accent)' : 'var(--text2)', borderBottom: `2px solid ${tab === key ? 'var(--accent)' : 'transparent'}`, marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: 16 }}>
          {tab === 'activity' && (
            activity.length === 0 ? (
              <div className="empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
                <h3>No activity yet</h3>
                <p>Add friends to see what they're watching and rating</p>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('find')}>Find friends</button>
              </div>
            ) : (
              activity.map((item, i) => (
                <div key={i} className="activity-item">
                  <AvatarCircle name={item.profiles?.username} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                      <strong style={{ fontWeight: 500 }}>{item.profiles?.username}</strong>
                      {' '}rated a {item.media_type}{' '}
                      <span style={{ color: 'var(--gold)' }}>{'★'.repeat(item.rating)}</span>
                    </div>
                    {item.review_text && <p style={{ fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{item.review_text.slice(0, 100)}{item.review_text.length > 100 ? '…' : ''}</p>}
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{new Date(item.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )
          )}

          {tab === 'friends' && (
            friends.length === 0 ? (
              <div className="empty">
                <h3 style={{ color: 'var(--text2)' }}>No friends yet</h3>
                <p>Search for people you know</p>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('find')}>Find friends</button>
              </div>
            ) : (
              friends.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <AvatarCircle name={f.profiles?.username} />
                  <span style={{ fontWeight: 500, fontSize: 15 }}>{f.profiles?.username}</span>
                </div>
              ))
            )
          )}

          {tab === 'find' && (
            <>
              <div className="search-bar" style={{ marginBottom: 16 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="Search by username…" />
              </div>
              {searchResults.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <AvatarCircle name={u.username} />
                  <span style={{ flex: 1, fontWeight: 500, fontSize: 15 }}>{u.username}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleAdd(u.id, u.username)}>Add</button>
                </div>
              ))}
              {searchQuery && searchResults.length === 0 && (
                <div style={{ color: 'var(--text3)', fontSize: 13, padding: '16px 0' }}>No users found</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
