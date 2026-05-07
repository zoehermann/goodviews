import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ─── Auth helpers ────────────────────────────────────────────────
export const signUp = (email, password, username) =>
  supabase.auth.signUp({ email, password, options: { data: { username } } })

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getUser = () => supabase.auth.getUser()

// ─── Watchlist helpers ───────────────────────────────────────────
export const addToWatchlist = async (userId, item, status = 'want') => {
  const { data, error } = await supabase.from('watchlist').upsert({
    user_id: userId,
    tmdb_id: item.id,
    media_type: item.media_type,
    title: item.title || item.name,
    poster_path: item.poster_path,
    status, // 'want' | 'watching' | 'watched'
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,tmdb_id' })
  return { data, error }
}

export const getWatchlist = async (userId, status = null) => {
  let query = supabase.from('watchlist').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
  if (status) query = query.eq('status', status)
  return query
}

export const removeFromWatchlist = (userId, tmdbId) =>
  supabase.from('watchlist').delete().eq('user_id', userId).eq('tmdb_id', tmdbId)

// ─── Reviews/ratings ─────────────────────────────────────────────
export const upsertReview = async (userId, tmdbId, mediaType, rating, reviewText) => {
  return supabase.from('reviews').upsert({
    user_id: userId,
    tmdb_id: tmdbId,
    media_type: mediaType,
    rating,
    review_text: reviewText,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,tmdb_id' })
}

export const getReviewsForItem = (tmdbId) =>
  supabase.from('reviews').select('*, profiles(username, avatar_url)').eq('tmdb_id', tmdbId).order('updated_at', { ascending: false })

export const getUserReview = (userId, tmdbId) =>
  supabase.from('reviews').select('*').eq('user_id', userId).eq('tmdb_id', tmdbId).single()

// ─── Social / friends ─────────────────────────────────────────────
export const getFriendActivity = async (userId) => {
  // Get friends' IDs
  const { data: friendRows } = await supabase
    .from('friends').select('friend_id').eq('user_id', userId).eq('status', 'accepted')
  const friendIds = (friendRows || []).map(r => r.friend_id)
  if (!friendIds.length) return { data: [] }

  return supabase
    .from('reviews')
    .select('*, profiles(username, avatar_url)')
    .in('user_id', friendIds)
    .order('updated_at', { ascending: false })
    .limit(30)
}

export const sendFriendRequest = (userId, friendId) =>
  supabase.from('friends').insert({ user_id: userId, friend_id: friendId, status: 'pending' })

export const acceptFriendRequest = (userId, friendId) =>
  supabase.from('friends').update({ status: 'accepted' }).eq('user_id', friendId).eq('friend_id', userId)

export const searchUsers = (query) =>
  supabase.from('profiles').select('id, username, avatar_url').ilike('username', `%${query}%`).limit(10)

// ─── Profile ──────────────────────────────────────────────────────
export const getProfile = (userId) =>
  supabase.from('profiles').select('*').eq('id', userId).single()

export const updateProfile = (userId, updates) =>
  supabase.from('profiles').update(updates).eq('id', userId)
