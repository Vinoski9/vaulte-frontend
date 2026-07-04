import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import styles from './CryptoComingSoon.module.css'

function CryptoComingSoon() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    // Fetch wallet balance
    const fetchBalance = async () => {
      try {
        const res = await api.get('/withdrawals/balance')
        setBalance(res.data.balance || 0)
      } catch {
        console.error('Failed to fetch balance')
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [])

  useEffect(() => {
    const launchDate = new Date('2026-07-30T00:00:00').getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = launchDate - now

      setDays(Math.floor(distance / (1000 * 60 * 60 * 24)))
      setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
      setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)))
      setSeconds(Math.floor((distance % (1000 * 60)) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.container}>
      {/* Background Particles */}
      <div className={styles.bgParticles}>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
      </div>

      <div className={styles.content}>
        {/* Badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot}></span>
          Phase 2 — Coming soon
        </div>

        {/* Logo */}
        <div className={styles.iconWrapper}>
          <svg width="72" height="72" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#2A4AB5"/>
            <path d="M20 8L32 14V22C32 28.6 26.8 34.6 20 36C13.2 34.6 8 28.6 8 22V14L20 8Z" fill="#3D64E0"/>
            <path d="M16 21L19 24L25 18" stroke="#A8D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className={styles.title}>
          Crypto Exchange
        </h1>
        <p className={styles.subtitle}>
          Coming to Vaulte <span className={styles.gradientText}>soon</span>
        </p>

        {/* Wallet Balance */}
        <div className={styles.balanceCard}>
          <div className={styles.balanceLabel}>Your wallet balance</div>
          <div className={styles.balanceAmount}>
            {loading ? '...' : `₦${balance.toLocaleString('en-NG')}`}
          </div>
          <div className={styles.balanceSub}>
            Available for withdrawal when crypto launches
          </div>
        </div>

        {/* Countdown */}
        <div className={styles.countdown}>
          <div className={styles.countdownItem}>
            <span className={styles.countdownValue}>{String(days).padStart(2, '0')}</span>
            <span className={styles.countdownLabel}>Days</span>
          </div>
          <span className={styles.countdownSeparator}>:</span>
          <div className={styles.countdownItem}>
            <span className={styles.countdownValue}>{String(hours).padStart(2, '0')}</span>
            <span className={styles.countdownLabel}>Hours</span>
          </div>
          <span className={styles.countdownSeparator}>:</span>
          <div className={styles.countdownItem}>
            <span className={styles.countdownValue}>{String(minutes).padStart(2, '0')}</span>
            <span className={styles.countdownLabel}>Minutes</span>
          </div>
          <span className={styles.countdownSeparator}>:</span>
          <div className={styles.countdownItem}>
            <span className={styles.countdownValue}>{String(seconds).padStart(2, '0')}</span>
            <span className={styles.countdownLabel}>Seconds</span>
          </div>
        </div>

        {/* Features */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>SEC compliant</span>
          </div>
          <div className={styles.feature}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <span>Instant swaps</span>
          </div>
          <div className={styles.feature}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>Multi-asset</span>
          </div>
        </div>

        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default CryptoComingSoon