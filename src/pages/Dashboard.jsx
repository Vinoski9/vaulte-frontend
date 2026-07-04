import styles from './Dashboard.module.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import api from '../api/axios'

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [recentTx, setRecentTx] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_earned: 0,
    pending_value: 0,
    pending_count: 0,
    total_trades: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, statsRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/transactions/stats')
        ])
        setRecentTx(txRes.data.slice(0, 3))
        setStats(statsRes.data)
      } catch {
        console.error('Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getDate = () => {
    return new Date().toLocaleDateString('en-NG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  return (
    <div className={styles.layout}>

      {/* SIDEBAR */}
      <Sidebar active="dashboard" />
      {/* MAIN CONTENT */}
      <main className={styles.main}>

        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.greeting}>{getGreeting()}, {user?.full_name} </h1>
            <p className={styles.date}>{getDate()}</p>
          </div>
        </div>

        {/* BALANCE CARDS */}
        <div className={styles.balanceGrid}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonBalanceCard} style={{ animationDelay: `${i * 80}ms` }}>
                <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
                <div className={styles.skeletonLineLg}></div>
                <div className={styles.skeletonLine} style={{ width: '75%' }}></div>
              </div>
            ))
          ) : (
            <>
              <div className={styles.balanceCard} style={{ animationDelay: '0ms' }}>
                <div className={styles.balanceLabel}>Total earned</div>
                <div className={styles.balanceAmount}>₦{Number(stats.total_earned).toLocaleString('en-NG')}</div>
                <div className={styles.balanceSub}>From completed trades</div>
              </div>
              <div className={styles.balanceCard} style={{ animationDelay: '80ms' }}>
                <div className={styles.balanceLabel}>Total traded</div>
                <div className={styles.balanceAmount}>{stats.total_trades}</div>
                <div className={styles.balanceSub}>All time trades</div>
              </div>
              <div className={styles.balanceCard} style={{ animationDelay: '160ms' }}>
                <div className={styles.balanceLabel}>Pending</div>
                <div className={styles.balanceAmount}>{stats.pending_count}</div>
                <div className={styles.balanceSub}>Transactions in review</div>
              </div>
            </>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick actions</h2>
          <div className={styles.actionGrid}>
            <button className={styles.actionBtn} onClick={() => navigate('/sell-gift-card')}>
              <span className={styles.actionIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </span>
              <span>Sell gift card</span>
            </button>
            <button className={styles.actionBtn} onClick={() => navigate('/crypto')}>
              <span className={styles.actionIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 12l4 6 4-6-4-6z"/>
                </svg>
              </span>
              <span>Trade crypto</span>
            </button>
            <button className={styles.actionBtn} onClick={() => navigate('/transactions')}>
              <span className={styles.actionIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M16 10h-4a2 2 0 0 0 0 4h4"/>
                  <circle cx="18" cy="12" r="1" fill="currentColor"/>
                  <path d="M10 20l-4-4 4-4"/>
                  <path d="M6 16h8"/>
                </svg>
              </span>
              <span>Withdraw</span>
            </button>
            <button className={styles.actionBtn} onClick={() => navigate('/transactions')}>
              <span className={styles.actionIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M6 3v3M18 3v3M3 12h18M3 18h18M6 21v-3M18 21v-3"/>
                </svg>
              </span>
              <span>History</span>
            </button>
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent transactions</h2>
            <a href="/transactions" className={styles.seeAll}>See all →</a>
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonTxRow} style={{ animationDelay: `${i * 80}ms` }}>
                <div className={styles.skeletonTxLeft}>
                  <div className={styles.skeletonIcon}></div>
                  <div>
                    <div className={styles.skeletonLine} style={{ width: '120px', height: '12px' }}></div>
                    <div className={styles.skeletonLine} style={{ width: '80px', height: '9px', marginTop: '6px' }}></div>
                  </div>
                </div>
                <div className={styles.skeletonTxRight}>
                  <div className={styles.skeletonLine} style={{ width: '70px', height: '12px' }}></div>
                  <div className={styles.skeletonLine} style={{ width: '50px', height: '9px', marginTop: '6px', marginLeft: 'auto' }}></div>
                </div>
              </div>
            ))
          ) : recentTx.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💳</div>
              <p>No transactions yet</p>
              <span>
                <a href="/sell-gift-card" className={styles.emptyLink}>Make your first trade</a> to see it here
              </span>
            </div>
          ) : (
            recentTx.map((tx, i) => (
              <div key={tx.id} className={styles.txRow} style={{ animationDelay: `${i * 60}ms` }}>
                <div className={styles.txLeft}>
                  <div className={styles.txIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.txName}>{tx.card_name}</div>
                    <div className={styles.txDate}>{new Date(tx.created_at).toLocaleDateString('en-NG')} · TXN-{tx.id}</div>
                  </div>
                </div>
                <div className={styles.txRight}>
                  <div className={styles.txNaira}>₦{Number(tx.naira_value).toLocaleString('en-NG')}</div>
                  <div className={styles.txStatus} style={{
                    color: tx.status === 'completed' ? '#4ade80' : tx.status === 'failed' ? '#f87171' : '#facc15'
                  }}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  )
}

export default Dashboard