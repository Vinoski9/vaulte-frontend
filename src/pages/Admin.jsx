import { useState, useEffect } from 'react'
import api from '../api/axios'
import styles from './Admin.module.css'

const STATUS_STYLES = {
  completed: { label: 'Completed', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)' },
  pending: { label: 'Pending', color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.2)' },
  failed: { label: 'Failed', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
}

function Admin() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('All')
  const [activeTab, setActiveTab] = useState('trades')
  const [rates, setRates] = useState([])
  const [editingRate, setEditingRate] = useState(null)
  const [newRate, setNewRate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalVolume: 0,
    todayTrades: 0,
    activeUsers: 0
  })
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState(false)

  const fetchAll = async () => {
    try {
      const res = await api.get('/transactions/admin/all')
      setTransactions(res.data)
    } catch {
      console.error('Failed to fetch')
    }
  }

  const fetchRates = async () => {
    try {
      const res = await api.get('/rates')
      setRates(res.data)
    } catch {
      console.error('Failed to fetch rates')
    }
  }

  const fetchSummary = async () => {
    setSummaryLoading(true)
    setSummaryError(false)
    try {
      const res = await api.get('/admin/summary')
      setSummary(res.data)
    } catch {
      setSummaryError(true)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    fetchRates()
    fetchSummary()
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 768 && sidebarOpen) {
        const sidebar = document.querySelector(`.${styles.sidebar}`)
        const hamburger = document.querySelector(`.${styles.hamburger}`)
        if (sidebar && !sidebar.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
          setSidebarOpen(false)
        }
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [sidebarOpen])

  // Rate calculator live update
  useEffect(() => {
    if (activeTab !== 'rates') return

    const timer = setTimeout(() => {
      const marketInput = document.getElementById('marketRateInput')
      const amountInput = document.getElementById('cardAmountInput')
      const userPayoutSpan = document.getElementById('userPayoutDisplay')
      const yourProfitSpan = document.getElementById('yourProfitDisplay')

      const updateCalculator = () => {
        const marketRate = parseFloat(marketInput?.value) || 0
        const cardAmount = parseFloat(amountInput?.value) || 0
        const yourRate = Math.max(0, marketRate - 100)
        const userPayout = cardAmount * yourRate
        const yourProfit = cardAmount * 100

        if (userPayoutSpan) userPayoutSpan.innerText = `₦${userPayout.toLocaleString('en-NG')}`
        if (yourProfitSpan) yourProfitSpan.innerText = `You keep ₦${yourProfit.toLocaleString('en-NG')}`
      }

      if (marketInput && amountInput) {
        marketInput.addEventListener('input', updateCalculator)
        amountInput.addEventListener('input', updateCalculator)
        updateCalculator()
      }

      return () => {
        if (marketInput) marketInput.removeEventListener('input', updateCalculator)
        if (amountInput) amountInput.removeEventListener('input', updateCalculator)
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [activeTab])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/transactions/admin/${id}`, { status })
      fetchAll()
    } catch {
      console.error('Failed to update')
    }
  }

  const updateRate = async (id) => {
    try {
      await api.patch(`/rates/${id}`, { rate: parseInt(newRate) })
      setEditingRate(null)
      setNewRate('')
      fetchRates()
    } catch {
      console.error('Failed to update rate')
    }
  }

  const filteredTx = transactions.filter(tx => {
    if (filter !== 'All' && tx.status !== filter.toLowerCase()) return false
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      return (
        String(tx.id).includes(term) ||
        tx.email?.toLowerCase().includes(term) ||
        tx.card_code?.toLowerCase().includes(term) ||
        tx.full_name?.toLowerCase().includes(term)
      )
    }
    return true
  })

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    failed: transactions.filter(t => t.status === 'failed').length,
  }

  return (
    <div className={styles.layout}>

      {/* HAMBURGER MENU (mobile only) */}
      <button 
        className={styles.hamburger}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {/* OVERLAY (mobile only) */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#2A4AB5"/>
            <path d="M20 8L32 14V22C32 28.6 26.8 34.6 20 36C13.2 34.6 8 28.6 8 22V14L20 8Z" fill="#3D64E0"/>
            <path d="M16 21L19 24L25 18" stroke="#A8D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Vaulte Admin</span>
        </div>
        <nav className={styles.nav}>
          <a
            className={`${styles.navItem} ${activeTab === 'trades' ? styles.active : ''}`}
            onClick={() => { setActiveTab('trades'); setSidebarOpen(false) }}
          >
            <span>📊</span> Trades
          </a>
          <a
            className={`${styles.navItem} ${activeTab === 'rates' ? styles.active : ''}`}
            onClick={() => { setActiveTab('rates'); setSidebarOpen(false) }}
          >
            <span>💰</span> Rates
          </a>
          <a href="/dashboard" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
            <span>🏠</span> User view
          </a>
        </nav>
      </aside>

      <main className={styles.main}>

        {/* TRADES TAB */}
        {activeTab === 'trades' && (
          <>
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>Trade reviews</h1>
                <p className={styles.sub}>Review and process incoming gift card trades</p>
              </div>
              <button className={styles.refreshBtn} onClick={fetchAll}>↻ Refresh</button>
            </div>

            {/* DASHBOARD SUMMARY CARDS */}
            {summaryError && (
              <div style={{
                background: 'rgba(248,113,113,0.08)',
                border: '0.5px solid rgba(248,113,113,0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#f87171',
                marginBottom: '1rem'
              }}>
                ⚠ Couldn't load live stats from the server. Showing 0 until reconnected.
              </div>
            )}
            <div className={styles.summaryRow}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>Total users</div>
                <div className={styles.summaryVal}>
                  {summaryLoading ? '...' : summary.totalUsers}
                </div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>Total volume</div>
                <div className={styles.summaryVal} style={{color: '#4ade80'}}>
                  {summaryLoading ? '...' : `₦${summary.totalVolume.toLocaleString('en-NG')}`}
                </div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>Today's trades</div>
                <div className={styles.summaryVal} style={{color: '#60A5FA'}}>
                  {summaryLoading ? '...' : summary.todayTrades}
                </div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>Active users (24h)</div>
                <div className={styles.summaryVal} style={{color: '#facc15'}}>
                  {summaryLoading ? '...' : summary.activeUsers}
                </div>
              </div>
            </div>

            {/* TRANSACTION STATS */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total</div>
                <div className={styles.statVal}>{stats.total}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Pending</div>
                <div className={styles.statVal} style={{color:'#facc15'}}>{stats.pending}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Completed</div>
                <div className={styles.statVal} style={{color:'#4ade80'}}>{stats.completed}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Failed</div>
                <div className={styles.statVal} style={{color:'#f87171'}}>{stats.failed}</div>
              </div>
            </div>

            {/* SEARCH BAR */}
            <div className={styles.searchRow}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by TXN ID, email, name, or card code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className={styles.clearSearch}
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* FILTER ROW */}
            <div className={styles.filterRow}>
              {['All', 'Pending', 'Completed', 'Failed'].map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className={styles.tableWrap}>
              {filteredTx.length === 0 ? (
                <div style={{textAlign:'center', padding:'3rem', color:'#7A90B8', fontSize:'14px'}}>
                  {searchTerm ? 'No transactions match your search' : 'No transactions found'}
                </div>
              ) : (
                filteredTx.map(tx => (
                  <div key={tx.id} className={styles.tradeCard}>
                    <div className={styles.tradeTop}>
                      <div className={styles.tradeInfo}>
                        <div className={styles.tradeName}>{tx.card_name}</div>
                        <div className={styles.tradeMeta}>TXN-{tx.id} · {tx.full_name} · {tx.email}</div>
                        <div className={styles.tradeMeta}>{new Date(tx.created_at).toLocaleString('en-NG')}</div>
                      </div>
                      <div className={styles.tradeAmounts}>
                        <div className={styles.tradeUsd}>${tx.card_value}</div>
                        <div className={styles.tradeNaira}>₦{Number(tx.naira_value).toLocaleString('en-NG')}</div>
                      </div>
                    </div>
                    <div className={styles.tradeCode}>
                      <span className={styles.codeLabel}>Card code:</span>
                      <span className={styles.codeVal}>{tx.card_code}</span>
                    </div>
                    <div className={styles.tradeActions}>
                      <span
                        className={styles.statusBadge}
                        style={{
                          color: STATUS_STYLES[tx.status]?.color,
                          background: STATUS_STYLES[tx.status]?.bg,
                          border: `0.5px solid ${STATUS_STYLES[tx.status]?.border}`
                        }}
                      >
                        {STATUS_STYLES[tx.status]?.label}
                      </span>
                      {tx.status === 'pending' && (
                        <div className={styles.btnGroup}>
                          <button
                            className={styles.approveBtn}
                            onClick={() => updateStatus(tx.id, 'completed')}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => updateStatus(tx.id, 'failed')}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* RATES TAB */}
        {activeTab === 'rates' && (
          <>
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>Gift card rates</h1>
                <p className={styles.sub}>Update rates in real time — changes reflect instantly for all users</p>
              </div>
              <button className={styles.refreshBtn} onClick={fetchRates}>↻ Refresh</button>
            </div>

            {/* RATE CALCULATOR */}
            <div className={styles.rateCalculator}>
              <div className={styles.calculatorHeader}>
                <h3 className={styles.calculatorTitle}>💰 Rate calculator</h3>
                <span className={styles.marginBadge}>Your margin: ₦100 per $1</span>
              </div>
              <div className={styles.calculatorGrid}>
                <div className={styles.calculatorField}>
                  <label className={styles.calculatorLabel}>Market rate (₦ per $1)</label>
                  <input
                    type="number"
                    id="marketRateInput"
                    className={styles.calculatorInput}
                    placeholder="e.g., 1200"
                    defaultValue="1200"
                  />
                </div>
                <div className={styles.calculatorField}>
                  <label className={styles.calculatorLabel}>Card value ($)</label>
                  <input
                    type="number"
                    id="cardAmountInput"
                    className={styles.calculatorInput}
                    placeholder="e.g., 100"
                    defaultValue="100"
                  />
                </div>
                <div className={styles.calculatorResult}>
                  <div className={styles.calculatorLabel}>User gets</div>
                  <div className={styles.resultAmount} id="userPayoutDisplay">₦110,000</div>
                  <div className={styles.resultProfit} id="yourProfitDisplay">You keep ₦10,000</div>
                </div>
              </div>
              <div className={styles.calculatorNote}>
                ⚡ Vaulte rate = Market rate - ₦100 per $1
              </div>
            </div>

            {/* RATES TABLE */}
            <div className={styles.tableWrap}>
              {rates.map(rate => (
                <div key={rate.id} className={styles.tradeCard}>
                  <div className={styles.tradeTop}>
                    <div className={styles.tradeInfo}>
                      <div className={styles.tradeName}>{rate.flag} {rate.card_name}</div>
                      <div className={styles.tradeMeta}>{rate.category} · ID: {rate.card_id}</div>
                    </div>
                    <div className={styles.tradeAmounts}>
                      {editingRate === rate.id ? (
                        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                          <input
                            type="number"
                            value={newRate}
                            onChange={e => setNewRate(e.target.value)}
                            placeholder={rate.rate}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '0.5px solid rgba(96,165,250,0.3)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: 'white',
                              width: '100px',
                              fontSize: '14px'
                            }}
                          />
                          <button className={styles.approveBtn} onClick={() => updateRate(rate.id)}>✓ Save</button>
                          <button className={styles.rejectBtn} onClick={() => { setEditingRate(null); setNewRate('') }}>✗</button>
                        </div>
                      ) : (
                        <div style={{textAlign:'right'}}>
                          <div className={styles.tradeUsd}>₦{rate.rate}/$</div>
                          <button
                            className={styles.editRateBtn}
                            onClick={() => { setEditingRate(rate.id); setNewRate(rate.rate) }}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </main>
    </div>
  )
}

export default Admin