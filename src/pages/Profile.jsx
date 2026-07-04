import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'
import styles from './Profile.module.css'

function Profile() {
  const { user } = useAuth()
  const [bankDetails, setBankDetails] = useState(null)
  const [form, setForm] = useState({
    bank_name: '',
    account_number: '',
    account_name: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [stats, setStats] = useState({
    total_earned: 0,
    pending_value: 0,
    pending_count: 0,
    total_trades: 0
  })
  const [recentTx, setRecentTx] = useState([])
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [activeSection, setActiveSection] = useState('bank')

  const NIGERIAN_BANKS = [
    'Access Bank', 'GTBank', 'First Bank', 'Zenith Bank',
    'UBA', 'Fidelity Bank', 'Sterling Bank', 'Kuda Bank',
    'Opay', 'Palmpay', 'Moniepoint', 'Stanbic IBTC',
    'Union Bank', 'Wema Bank', 'Polaris Bank', 'Ecobank'
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bankRes, statsRes, txRes] = await Promise.all([
          api.get('/auth/bank-details'),
          api.get('/transactions/stats'),
          api.get('/transactions')
        ])
        if (bankRes.data.account_number) {
          setBankDetails(bankRes.data)
          setForm(bankRes.data)
        }
        setStats(statsRes.data)
        setRecentTx(txRes.data.slice(0, 5))
      } catch {
        console.error('Failed to fetch profile data')
      }
    }
    fetchData()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess(false)
  }

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
    setPasswordError('')
    setPasswordSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/auth/bank-details', form)
      setSuccess(true)
      setBankDetails(form)
    } catch {
      setError('Failed to save bank details. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return setPasswordError('New passwords do not match')
    }
    if (passwordForm.new_password.length < 6) {
      return setPasswordError('New password must be at least 6 characters')
    }
    setPasswordLoading(true)
    try {
      await api.put('/auth/change-password', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      })
      setPasswordSuccess(true)
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar active="profile" />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Profile</h1>
            <p className={styles.sub}>Manage your account and settings</p>
          </div>
        </div>

        <div className={styles.twoCol}>

          {/* LEFT COLUMN */}
          <div className={styles.leftCol}>

            {/* ACCOUNT INFO */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>Account info</div>
              <div className={styles.infoRow}>
                <div className={styles.avatar}>{user?.full_name?.charAt(0).toUpperCase()}</div>
                <div>
                  <div className={styles.userName}>{user?.full_name}</div>
                  <div className={styles.userEmail}>{user?.email}</div>
                </div>
                <div className={styles.kycBadge}>
                  <span className={styles.kycDot}></span>
                  Verification coming soon
                </div>
              </div>
            </div>

            {/* ATM CARD */}
            {bankDetails?.account_number ? (
              <div className={styles.atmCard}>
                <div className={styles.atmTop}>
                  <div className={styles.atmLogo}>
                    <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.15)"/>
                      <path d="M20 8L32 14V22C32 28.6 26.8 34.6 20 36C13.2 34.6 8 28.6 8 22V14L20 8Z" fill="rgba(255,255,255,0.3)"/>
                      <path d="M16 21L19 24L25 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Vaulte</span>
                  </div>
                  <div className={styles.atmLabel}>Payout Account</div>
                </div>
                <div className={styles.atmNumber}>{bankDetails.account_number}</div>
                <div className={styles.atmBottom}>
                  <div>
                    <div className={styles.atmName}>{bankDetails.account_name}</div>
                    <div className={styles.atmBank}>{bankDetails.bank_name}</div>
                  </div>
                  <div className={styles.atmChip}>
                    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
                      <rect width="32" height="24" rx="4" fill="rgba(255,255,255,0.2)"/>
                      <rect x="10" y="0" width="12" height="24" fill="rgba(255,255,255,0.1)"/>
                      <rect x="0" y="8" width="32" height="8" fill="rgba(255,255,255,0.1)"/>
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.atmEmpty}>
                <div className={styles.atmEmptyIcon}>💳</div>
                <p>No payout account saved yet</p>
                <span>Add your bank details below to receive payouts</span>
              </div>
            )}

            {/* TABS */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeSection === 'bank' ? styles.tabActive : ''}`}
                onClick={() => setActiveSection('bank')}
              >
                Bank details
              </button>
              <button
                className={`${styles.tab} ${activeSection === 'password' ? styles.tabActive : ''}`}
                onClick={() => setActiveSection('password')}
              >
                Change password
              </button>
            </div>

            {/* BANK DETAILS FORM */}
            {activeSection === 'bank' && (
              <div className={styles.card}>
                <div className={styles.cardTitle}>
                  {bankDetails?.account_number ? 'Update bank details' : 'Add bank details'}
                </div>
                <p className={styles.cardSub}>This is where your naira payouts will be sent when you sell gift cards.</p>

                {success && <div className={styles.success}>✅ Bank details saved successfully</div>}
                {error && <div className={styles.error}>{error}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.field}>
                    <label>Bank name</label>
                    <select
                      name="bank_name"
                      value={form.bank_name}
                      onChange={handleChange}
                      className={styles.select}
                      required
                    >
                      <option value="">Select your bank</option>
                      {NIGERIAN_BANKS.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Account number</label>
                    <input
                      type="text"
                      name="account_number"
                      placeholder="0123456789"
                      value={form.account_number}
                      onChange={handleChange}
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Account name</label>
                    <input
                      type="text"
                      name="account_name"
                      placeholder="As it appears on your bank account"
                      value={form.account_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button className={styles.btn} type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save bank details'}
                  </button>
                </form>
              </div>
            )}

            {/* CHANGE PASSWORD FORM */}
            {activeSection === 'password' && (
              <div className={styles.card}>
                <div className={styles.cardTitle}>Change password</div>
                <p className={styles.cardSub}>Make sure your new password is at least 6 characters.</p>

                {passwordSuccess && <div className={styles.success}>✅ Password changed successfully</div>}
                {passwordError && <div className={styles.error}>{passwordError}</div>}

                <form className={styles.form} onSubmit={handlePasswordSubmit}>
                  <div className={styles.field}>
                    <label>Current password</label>
                    <input
                      type="password"
                      name="old_password"
                      placeholder="••••••••"
                      value={passwordForm.old_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>New password</label>
                    <input
                      type="password"
                      name="new_password"
                      placeholder="••••••••"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Confirm new password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      placeholder="••••••••"
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <button className={styles.btn} type="submit" disabled={passwordLoading}>
                    {passwordLoading ? 'Updating...' : 'Update password'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — TRANSACTION SUMMARY */}
          <div className={styles.rightCol}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Transaction summary</div>

              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Total earned</div>
                  <div className={styles.summaryVal}>₦{Number(stats.total_earned).toLocaleString('en-NG')}</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Total trades</div>
                  <div className={styles.summaryVal}>{stats.total_trades}</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Pending</div>
                  <div className={styles.summaryVal} style={{color:'#facc15'}}>{stats.pending_count}</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Pending value</div>
                  <div className={styles.summaryVal} style={{color:'#facc15'}}>₦{Number(stats.pending_value).toLocaleString('en-NG')}</div>
                </div>
              </div>
            </div>

            {/* RECENT TRANSACTIONS */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>Recent transactions</div>
              {recentTx.length === 0 ? (
                <div className={styles.emptyTx}>
                  <span>No transactions yet</span>
                </div>
              ) : (
                recentTx.map(tx => (
                  <div key={tx.id} className={styles.txRow}>
                    <div className={styles.txLeft}>
                      <div className={styles.txIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="7" width="20" height="14" rx="2"/>
  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
</svg></div>
                      <div>
                        <div className={styles.txName}>{tx.card_name}</div>
                        <div className={styles.txDate}>{new Date(tx.created_at).toLocaleDateString('en-NG')}</div>
                      </div>
                    </div>
                    <div className={styles.txRight}>
                      <div className={styles.txAmount}>₦{Number(tx.naira_value).toLocaleString('en-NG')}</div>
                      <div className={styles.txStatus} style={{
                        color: tx.status === 'completed' ? '#4ade80' : tx.status === 'failed' ? '#f87171' : '#facc15'
                      }}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {recentTx.length > 0 && (
                <a href="/transactions" className={styles.seeAll}>See all transactions →</a>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Profile