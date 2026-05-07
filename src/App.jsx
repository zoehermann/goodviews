import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './components/AppContext'
import TabBar from './components/TabBar'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import WatchlistPage from './pages/WatchlistPage'
import FriendsPage from './pages/FriendsPage'
import ProfilePage from './pages/ProfilePage'
import DetailPage from './pages/DetailPage'
import AuthPage from './pages/AuthPage'
import './index.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useApp()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          Good<span style={{ color: '#D85A30' }}>Views</span>
        </div>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    </div>
  )
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function AppShell() {
  const { user } = useApp()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/:type/:id" element={<ProtectedRoute><DetailPage /></ProtectedRoute>} />
      </Routes>
      {user && <TabBar />}
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
