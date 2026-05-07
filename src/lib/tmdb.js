const BASE = 'https://api.themoviedb.org/3'
const KEY = import.meta.env.VITE_TMDB_API_KEY
export const IMG = 'https://image.tmdb.org/t/p'

const get = (path, params = {}) => {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api_key', KEY)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return fetch(url).then(r => r.json())
}

export const searchMulti = (query) => get('/search/multi', { query, include_adult: false })

export const getTrending = (timeWindow = 'week') => get(`/trending/all/${timeWindow}`)

export const getMovie = (id) => get(`/movie/${id}`, { append_to_response: 'credits,videos,watch/providers' })

export const getTVShow = (id) => get(`/tv/${id}`, { append_to_response: 'credits,videos,watch/providers' })

export const getPopularMovies = () => get('/movie/popular')

export const getPopularTV = () => get('/tv/popular')

export const posterUrl = (path, size = 'w342') =>
  path ? `${IMG}/${size}${path}` : null

export const backdropUrl = (path, size = 'w780') =>
  path ? `${IMG}/${size}${path}` : null
