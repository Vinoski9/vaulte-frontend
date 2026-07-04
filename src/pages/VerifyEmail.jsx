import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import styles from './Login.module.css'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [status, setStatus] = useState('verifying')
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const hasVerified = useRef(false)

  useEffect(() => {
    // Guard: only ever run the verification request once per mount,
    // no matter how many times this effect gets re-triggered
    if (hasVerified.current) return
    hasVerified.current = true

    const token = searchParams.get('token')

    console.log('🔍 Verification token:', token)

    if (!token) {
      setStatus('error')
      setError('No verification token provided')
      return
    }

    const verify = async () => {
      try {
        console.log('📤 Sending verification request...')
        const res = await api.get(`/auth/verify/${token}`)
        console.log('📥 Verification response:', res.data)

        if (res.data.success === true) {
          console.log('✅ Verification successful!')

          login(res.data.user, res.data.token)

          setStatus('success')
          setMessage(res.data.message || '✅ Email verified successfully! Redirecting to dashboard...')

          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        } else {
          console.log('❌ Verification failed:', res.data.error)
          setStatus('error')
          setError(res.data.error || 'Verification failed. Please try again.')
        }
      } catch (err) {
        console.error('❌ Verification error:', err.response?.data || err.message)
        setStatus('error')
        setError(err.response?.data?.error || 'Something went wrong. Please try again.')
      }
    }

    verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setResending(true)
    setError('')

    try {
      await api.post('/auth/resend-verification', { email })
      setMessage(`✅ Verification email resent to ${email}! Check your inbox. Link expires in 5 minutes.`)
      setTimeout(() => setMessage(''), 5000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  if (status === 'verifying') {
    return (
      <div className={styles.page}>
        <div className={styles.formPanel} style={{ margin: '0 auto', maxWidth: '480px' }}>
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <div className={styles.spinner} style={{ margin: '0 auto 20px', width: '40px', height: '40px' }}></div>
            <h2 className={styles.title}>Verifying your email...</h2>
            <p className={styles.sub}>Please wait while we confirm your account.</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className={styles.page}>
        <div className={styles.formPanel} style={{ margin: '0 auto', maxWidth: '480px' }}>
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h2 className={styles.title} style={{ color: '#4ade80' }}>Email Verified!</h2>
            <p className={styles.sub} style={{ color: '#7A90B8', fontSize: '16px' }}>{message}</p>
            <p className={styles.sub} style={{ color: '#4A5E80', marginTop: '8px' }}>
              <span className={styles.spinner} style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }}></span>
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.formPanel} style={{ margin: '0 auto', maxWidth: '480px' }}>
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 className={styles.title}>Verification Failed</h2>
          <p className={styles.sub} style={{ color: '#f87171' }}>{error}</p>
          <p className={styles.sub} style={{ color: '#4A5E80', fontSize: '13px' }}>
            ⏰ Link expires in <strong>5 minutes</strong>. Request a new one below.
          </p>

          {message && (
            <p className={styles.sub} style={{ color: '#4ade80', marginTop: '8px' }}>{message}</p>
          )}

          <div style={{ marginTop: '24px' }}>
            <div className={styles.field}>
              <label style={{ textAlign: 'left', display: 'block', marginBottom: '6px' }}>
                Enter your email to resend verification
              </label>
              <input
                className={styles.inputControl}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '0.5px solid rgba(96,165,250,0.2)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: 'white',
                  width: '100%'
                }}
              />
            </div>
            <button
              className={styles.btn}
              onClick={handleResend}
              disabled={!email || resending}
              style={{ marginTop: '12px', width: '100%' }}
            >
              {resending ? 'Sending...' : '📧 Resend Verification Email (5 min expiry)'}
            </button>
          </div>

          <p className={styles.footer} style={{ marginTop: '20px' }}>
            <a href="/login">Back to Login</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail