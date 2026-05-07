import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handle = async () => {
    setError(''); setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/')
      } else {
        if (!username.trim()) throw new Error('Please choose a username')
        const { error } = await signUp(email, password, username)
        if (error) throw error
        setError('Check your email to confirm your account, then sign in.')
        setMode('signin')
      }
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">Good<span>Views</span></div>
      <div className="auth-tagline">Track · Share · Discover</div>

      <div className="auth-form">
        {mode === 'signup' && (
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" autoCapitalize="none" />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" autoCapitalize="none" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />

        {error && <div style={{ fontSize: 13, color: error.includes('Check your') ? 'var(--teal)' : '#E24B4A', textAlign: 'center', lineHeight: 1.5 }}>{error}</div>}

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={handle} disabled={loading}>
          {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>

        <div className="auth-switch">
          {mode === 'signin' ? <>New to GoodViews? <a onClick={() => { setMode('signup'); setError('') }}>Create account</a></> : <>Already have an account? <a onClick={() => { setMode('signin'); setError('') }}>Sign in</a></>}
        </div>
      </div>
    </div>
  )
}
