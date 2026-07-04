import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import styles from './Login.module.css'

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 35.5 24 35.5c-6.9 0-12.5-5.6-12.5-12.5S17.1 10.5 24 10.5c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.6 4.7 29.6 2.5 24 2.5 12.1 2.5 2.5 12.1 2.5 24S12.1 45.5 24 45.5 45.5 35.9 45.5 24c0-1.2-.1-2.4-.3-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.6 7.2 29.6 5 24 5c-7.7 0-14.4 4.4-17.7 10.8z"/>
    <path fill="#4CAF50" d="M24 45.5c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2.1 1.6-4.7 2.5-7.6 2.5-5.3 0-9.7-3.5-11.3-8.4l-6.6 5C9.5 41 16.2 45.5 24 45.5z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.6-2.5 4.7-4.7 6.2l6.5 5.5C40.9 36.4 45.5 30.8 45.5 24c0-1.2-.1-2.4-.3-3.5z"/>
  </svg>
)

const AppleIcon = () => (
  <svg width="15" height="17" viewBox="0 0 384 512" fill="white">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
)

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>
  </svg>
)

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.9 17.9A10.9 10.9 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 5.1-5.9M9.9 4.2A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.7 19.7 0 0 1-2.3 3.4M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="m1 1 22 22"/>
  </svg>
)

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [socialMsg, setSocialMsg] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [resending, setResending] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleResendVerification = async () => {
    if (!form.email) {
      setError('Enter your email address to resend the verification link.')
      return
    }

    setResending(true)
    setError('')

    try {
      await api.post('/auth/resend-verification', { email: form.email })
      setSuccess(`A new verification link has been sent to ${form.email}.`)
      setNeedsVerification(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend the verification email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setNeedsVerification(false)

    try {
      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password
      })

      login(res.data.user, res.data.token)

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }

      navigate('/dashboard')

    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.needsVerification) {
        setNeedsVerification(true)
        setError('Your email address hasn\'t been verified yet.')
      } else if (err.response?.status === 400) {
        setError('Invalid email or password. Please try again.')
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection.')
      } else {
        setError(err.response?.data?.error || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSocial = (provider) => {
    setSocialMsg(`${provider} sign-in is coming soon. Please use email for now.`)
    setTimeout(() => setSocialMsg(''), 4000)
  }

  return (
    <div className={styles.page}>

      {/* BRAND PANEL */}
      <aside className={styles.brandPanel}>
        <div className={styles.mesh}>
          <div className={styles.meshBlob1}></div>
          <div className={styles.meshBlob2}></div>
          <div className={styles.meshBlob3}></div>
        </div>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#2A4AB5"/>
              <path d="M20 8L32 14V22C32 28.6 26.8 34.6 20 36C13.2 34.6 8 28.6 8 22V14L20 8Z" fill="#3D64E0"/>
              <path d="M16 21L19 24L25 18" stroke="#A8D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Vaulte</span>
          </div>
          <div className={styles.brandMid}>
            <div>
              <h1 className={styles.brandTitle}>Your assets.<br /><span>Secured & traded.</span></h1>
              <p className={styles.brandSub}>Sign in to trade crypto and gift cards with the best rates in Nigeria — payouts in under 15 minutes.</p>
            </div>
            <ul className={styles.brandFeatures}>
              <li><span className={styles.featureCheck}>✓</span> Instant naira payouts</li>
              <li><span className={styles.featureCheck}>✓</span> Bank-grade security</li>
              <li><span className={styles.featureCheck}>✓</span> Best rates, always</li>
            </ul>
          </div>
          <div className={styles.brandFooter}>© 2026 Vaulte Technologies Ltd.</div>
        </div>
      </aside>

      {/* FORM PANEL */}
      <main className={styles.formPanel}>
        <div className={styles.formGlow}></div>
        <div className={styles.card}>

          <div className={styles.mobileLogo}>
            <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#2A4AB5"/>
              <path d="M20 8L32 14V22C32 28.6 26.8 34.6 20 36C13.2 34.6 8 28.6 8 22V14L20 8Z" fill="#3D64E0"/>
              <path d="M16 21L19 24L25 18" stroke="#A8D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Vaulte</span>
          </div>

          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.sub}>Sign in to your account</p>

          {error && (
            <div className={styles.error}>
              {error}
              {needsVerification && (
                <div className={styles.resendContainer}>
                  <button
                    type="button"
                    className={styles.resendBtn}
                    onClick={handleResendVerification}
                    disabled={resending}
                  >
                    {resending ? 'Sending...' : 'Resend verification email'}
                  </button>
                </div>
              )}
            </div>
          )}
          {success && <div className={styles.success}>{success}</div>}
          {socialMsg && <div className={styles.info}>{socialMsg}</div>}

          <div className={styles.socialRow}>
            <button type="button" className={styles.socialBtn} onClick={() => handleSocial('Google')}>
              <GoogleIcon /> Google
            </button>
            <button type="button" className={styles.socialBtn} onClick={() => handleSocial('Apple')}>
              <AppleIcon /> Apple
            </button>
          </div>

          <div className={styles.divider}><span>or continue with email</span></div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>Email address</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><MailIcon /></span>
                <input
                  className={styles.inputControl}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><LockIcon /></span>
                <input
                  className={styles.inputControl}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowPassword(s => !s)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className={styles.forgotRow}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? <span className={styles.spinner}></span> : 'Sign in'}
            </button>
          </form>

          <p className={styles.footer}>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default Login