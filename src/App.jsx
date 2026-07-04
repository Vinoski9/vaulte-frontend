import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SellGiftCard from './pages/SellGiftCard'
import Transactions from './pages/Transactions'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import CryptoComingSoon from './pages/CryptoComingSoon'
import Crypto from './pages/Crypto' // Phase 2
import LandingPage from './pages/LandingPage' 
import VerifyEmail from './pages/VerifyEmail'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/sell-gift-card" element={
          <ProtectedRoute>
            <SellGiftCard />
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/crypto-coming-soon" element={<CryptoComingSoon />} />
        <Route path="/crypto" element={<Crypto />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App