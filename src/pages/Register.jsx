import { useState, useEffect } from 'react'
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

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
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

const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.6 12.6 12 21.2 2.8 12l8.8-8.8H20a1 1 0 0 1 1 1v7.6a1 1 0 0 1-.4.8Z"/><circle cx="16" cy="8" r="1.5"/>
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

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm: '',
    referral_code: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [socialMsg, setSocialMsg] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '' })

  // Get referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      setForm(prev => ({ ...prev, referral_code: ref.toUpperCase() }))
    }
  }, [])

  // Check password strength
  useEffect(() => {
    const checkStrength = (pass) => {
      let score = 0
      if (pass.length >= 6) score++
      if (pass.length >= 10) score++
      if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++
      if (/\d/.test(pass)) score++
      if (/[^a-zA-Z0-9]/.test(pass)) score++
      
      const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
      return { score, label: labels[score] || '' }
    }
    
    setPasswordStrength(checkStrength(form.password))
  }, [form.password])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!form.full_name.trim()) {
      return setError('Please enter your full name')
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      return setError('Please enter a valid email address')
    }
    
    if (form.password !== form.confirm) {
      return setError('Passwords do not match')
    }
    
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    
    if (passwordStrength.score < 2) {
      return setError('Password is too weak. Please use a stronger password.')
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      console.log('📝 Register attempt:', { 
        email: form.email, 
        full_name: form.full_name,
        referral_code: form.referral_code || 'none'
      })
      
      const res = await api.post('/auth/register', {
        full_name: form.full_name.trim(),
        email: form.email,
        password: form.password,
        referral_code: form.referral_code || undefined
      })
      
      console.log('✅ Register response:', res.data)
      
      // 🔥 EMAIL VERIFICATION FLOW - No auto-login
      // Show success message and redirect to login
      setSuccess(`✅ Account created! Please check ${form.email} for the verification link.`)
      
      // Clear password fields
      setForm(prev => ({ ...prev, password: '', confirm: '' }))
      
      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login')
      }, 5000)
      
    } catch (err) {
      console.error('❌ Register error:', err.response?.data || err.message)
      
      // Better error messages
      if (err.response?.status === 400) {
        if (err.response?.data?.error?.includes('Email already')) {
          setError('This email is already registered. Please login instead.')
        } else {
          setError(err.response?.data?.error || 'Invalid registration details')
        }
      } else if (err.response?.status === 409) {
        setError('This email is already registered. Please login.')
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
    setSocialMsg(`${provider} sign-up is coming soon — use email for now.`)
    setTimeout(() => setSocialMsg(''), 4000)
  }

  // Get password strength color
  const getStrengthColor = () => {
    const colors = ['', '#f87171', '#facc15', '#60A5FA', '#4ade80', '#22c55e']
    return colors[passwordStrength.score] || ''
  }

  // Get password strength width
  const getStrengthWidth = () => {
    return `${(passwordStrength.score / 5) * 100}%`
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
              <h1 className={styles.brandTitle}>Join the future<br /><span>of trading.</span></h1>
              <p className={styles.brandSub}>Create your account and start trading crypto and gift cards for the best rates in Nigeria.</p>
            </div>
            <ul className={styles.brandFeatures}>
              <li><span className={styles.featureCheck}>✓</span> Free to join, no hidden fees</li>
              <li><span className={styles.featureCheck}>✓</span> SEC regulated & compliant</li>
              <li><span className={styles.featureCheck}>✓</span> Payouts in under 15 minutes</li>
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

          <h1 className={styles.title}>Create account</h1>
          <p className={styles.sub}>Start trading with confidence</p>

          {error && <div className={styles.error}>{error}</div>}
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
              <label>Full name</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><UserIcon /></span>
                <input
                  className={styles.inputControl}
                  type="text"
                  name="full_name"
                  placeholder="Vincent Okeke"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" className={styles.toggleBtn} onClick={() => setShowPassword(s => !s)} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {/* Password strength indicator */}
              {form.password && (
                <div className={styles.strengthContainer}>
                  <div className={styles.strengthBar}>
                    <div 
                      className={styles.strengthFill} 
                      style={{ 
                        width: getStrengthWidth(), 
                        backgroundColor: getStrengthColor() 
                      }}
                    ></div>
                  </div>
                  <span className={styles.strengthLabel} style={{ color: getStrengthColor() }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label>Confirm password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><LockIcon /></span>
                <input
                  className={styles.inputControl}
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" className={styles.toggleBtn} onClick={() => setShowConfirm(s => !s)} aria-label="Toggle password visibility">
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {form.confirm && form.password !== form.confirm && (
                <div className={styles.matchError}>✗ Passwords do not match</div>
              )}
              {form.confirm && form.password === form.confirm && form.password.length >= 6 && (
                <div className={styles.matchSuccess}><CheckIcon /> Passwords match</div>
              )}
            </div>

            <div className={styles.field}>
              <label>Referral code (optional)</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><TagIcon /></span>
                <input
                  className={styles.inputControl}
                  type="text"
                  name="referral_code"
                  placeholder="Enter referral code if you have one"
                  value={form.referral_code}
                  onChange={handleChange}
                />
              </div>
              <p className={styles.helperText}>Have a friend at Vaulte? Enter their referral code.</p>
            </div>

            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? <span className={styles.spinner}></span> : 'Create account'}
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default Register