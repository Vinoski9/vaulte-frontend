import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from '../pages/Dashboard.module.css'

function Sidebar({ active }) {
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
 {/* MOBILE TOP BAR */}
<div className={styles.mobileTopBar}>
  <div className={styles.mobileLogo}>
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#2A4AB5"/>
      <path d="M16 21L19 24L25 18" stroke="#A8D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span>Vaulte</span>
  </div>
  <button className={styles.hamburger} onClick={() => setIsOpen(true)}>
    <span></span>
    <span></span>
    <span></span>
  </button>
</div>

      {/* OVERLAY */}
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)}></div>}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#2A4AB5"/>
            <path d="M20 8L32 14V22C32 28.6 26.8 34.6 20 36C13.2 34.6 8 28.6 8 22V14L20 8Z" fill="#3D64E0"/>
            <path d="M16 21L19 24L25 18" stroke="#A8D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Vaulte</span>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <nav className={styles.nav}>
          <a href="/dashboard" className={`${styles.navItem} ${active === 'dashboard' ? styles.active : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="7" height="7"/>
  <rect x="14" y="3" width="7" height="7"/>
  <rect x="14" y="14" width="7" height="7"/>
  <rect x="3" y="14" width="7" height="7"/>
</svg> Dashboard
          </a>
          <a href="/sell-gift-card" className={`${styles.navItem} ${active === 'giftcards' ? styles.active : ''}`}>
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="7" width="20" height="14" rx="2"/>
  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
</svg> Gift Cards
          </a>
          <a href="/crypto-coming-soon" className={`${styles.navItem} ${active === 'coming-soon' ? styles.active : ''}`}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 12l4 6 4-6-4-6z"/>
  </svg>
  Coming Soon 
</a>
          <a href="/transactions" className={`${styles.navItem} ${active === 'transactions' ? styles.active : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 6h18M6 3v3M18 3v3M3 12h18M3 18h18M6 21v-3M18 21v-3"/>
</svg> Transactions
          </a>
          <a href="/profile" className={`${styles.navItem} ${active === 'profile' ? styles.active : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="8" r="4"/>
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
</svg> Profile
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <a href="/" className={styles.logout} onClick={() => logout()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
  <polyline points="16 17 21 12 16 7"/>
  <line x1="21" x2="9" y1="12" y2="12"/>
</svg> Sign out
          </a>
        </div>
      </aside>
    </>
  )
}

export default Sidebar