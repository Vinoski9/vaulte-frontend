import styles from './Transactions.module.css'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

const STATUS_STYLES = {
  completed: { label: 'Completed', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)' },
  pending: { label: 'Pending', color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.2)' },
  failed: { label: 'Failed', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
}

function Transactions() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/transactions')
        setTransactions(res.data)
      } catch {
        console.error('Failed to fetch transactions')
      }
    }
    fetchTransactions()
  }, [])

  const filteredTx = transactions.filter(tx => {
    if (filter === 'All') return true
    return tx.status === filter.toLowerCase()
  })

  const totalEarned = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.naira_value), 0)

  return (
    <div className={styles.layout}>
    <Sidebar active="transactions" />
      <main className={styles.main}>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Transactions</h1>
            <p className={styles.sub}>Your full trading history</p>
          </div>
          <button className={styles.newBtn} onClick={() => navigate('/sell-gift-card')}>
            + New trade
          </button>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total trades</div>
            <div className={styles.statVal}>{transactions.length}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Completed</div>
            <div className={styles.statVal} style={{color: '#4ade80'}}>
              {transactions.filter(t => t.status === 'completed').length}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Pending</div>
            <div className={styles.statVal} style={{color: '#facc15'}}>
              {transactions.filter(t => t.status === 'pending').length}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total earned</div>
            <div className={styles.statVal}>
              ₦{totalEarned.toLocaleString('en-NG')}
            </div>
          </div>
        </div>

        <div className={styles.filterRow}>
          {['All', 'Completed', 'Pending', 'Failed'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}>
            <span>Transaction</span>
            <span>Amount</span>
            <span>Naira value</span>
            <span>Date</span>
            <span>Status</span>
          </div>
          {filteredTx.length === 0 ? (
            <div style={{textAlign:'center', padding:'3rem', color:'#7A90B8', fontSize:'14px'}}>
              No transactions yet
            </div>
          ) : (
            filteredTx.map(tx => (
              <div key={tx.id} className={styles.tableRow}>
                <div className={styles.txInfo}>
                  <div className={styles.txIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="7" width="20" height="14" rx="2"/>
  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
</svg></div>
                  <div>
                    <div className={styles.txName}>{tx.card_name}</div>
                    <div className={styles.txId}>TXN-{tx.id}</div>
                  </div>
                </div>
                <div className={styles.txAmount}>${tx.card_value}</div>
                <div className={styles.txNaira}>₦{Number(tx.naira_value).toLocaleString('en-NG')}</div>
                <div className={styles.txDate}>
                  <div>{new Date(tx.created_at).toLocaleDateString('en-NG')}</div>
                  <div className={styles.txTime}>{new Date(tx.created_at).toLocaleTimeString('en-NG', {hour:'2-digit', minute:'2-digit'})}</div>
                </div>
                <div>
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
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  )
}

export default Transactions