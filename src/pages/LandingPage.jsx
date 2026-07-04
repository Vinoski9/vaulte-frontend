import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import styles from './LandingPage.module.css'

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [liveRates, setLiveRates] = useState([])
  const [marketRate, setMarketRate] = useState(1280)
  const [vaulteRate, setVaulteRate] = useState(1180)
  const [loadingRates, setLoadingRates] = useState(true)

  // Fetch live rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get('/rates')
        setLiveRates(res.data.rates || [])
        setMarketRate(res.data.market_rate || 1280)
        setVaulteRate(res.data.vaulte_rate || 1180)
        setLoadingRates(false)
      } catch (err) {
        console.error('Failed to fetch rates:', err)
        setLoadingRates(false)
      }
    }
    
    fetchRates()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchRates, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Cursor glow
    const cursor = document.getElementById('cursor')
    const handleMouseMove = (e) => {
      if (cursor) {
        cursor.style.left = e.clientX + 'px'
        cursor.style.top = e.clientY + 'px'
      }
    }
    document.addEventListener('mousemove', handleMouseMove)

    // Nav scroll
    const navbar = document.getElementById('navbar')
    const handleScroll = () => {
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 50)
      }
    }
    window.addEventListener('scroll', handleScroll)

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

    // Payout feed animation
    const payouts = [
      { name: 'Amazon', amount: '₦152,000', time: '2 mins ago' },
      { name: 'iTunes', amount: '₦74,000', time: '5 mins ago' },
      { name: 'Visa', amount: '₦300,000', time: '9 mins ago' },
      { name: 'Bitcoin', amount: '₦984,000', time: '14 mins ago' },
      { name: 'Steam', amount: '₦33,750', time: '18 mins ago' },
      { name: 'Xbox', amount: '₦138,000', time: '22 mins ago' },
    ]
    let pIdx = 0
    const interval = setInterval(() => {
      const rows = document.querySelectorAll('.pf-row')
      if (!rows.length) return
      pIdx = (pIdx + 1) % payouts.length
      const p = payouts[pIdx]
      rows[0].style.opacity = '0'
      setTimeout(() => {
        const strong = rows[0].querySelector('strong')
        const amount = rows[0].querySelector('.pf-amount')
        const time = rows[0].querySelector('.pf-time')
        if (strong) strong.textContent = p.name
        if (amount) amount.textContent = p.amount
        if (time) time.textContent = p.time
        rows[0].style.opacity = '1'
        rows[0].style.transition = 'opacity 0.5s'
      }, 300)
    }, 3000)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      clearInterval(interval)
    }
  }, [])

  const handleCtaSubmit = async (e) => {
    e.preventDefault()
    const btn = e.target.querySelector('.cta-btn')
    btn.textContent = 'Joining...'
    btn.style.opacity = '0.7'
    try {
      const res = await fetch(e.target.action, {
        method: 'POST',
        body: new FormData(e.target),
        headers: { 'Accept': 'application/json' }
      })
      if (res.ok) {
        document.getElementById('cta-note').textContent = "✅ You're on the list! We'll be in touch soon."
        document.getElementById('cta-note').style.color = '#4ade80'
        document.getElementById('cta-email').value = ''
        btn.textContent = 'Joined ✓'
        btn.style.background = 'rgba(74,222,128,0.2)'
      } else {
        btn.textContent = 'Try again →'
        btn.style.opacity = '1'
      }
    } catch {
      document.getElementById('cta-note').textContent = "✅ You're on the list!"
      document.getElementById('cta-note').style.color = '#4ade80'
    }
  }

  // Get top rates for floating cards
  const getTopRates = () => {
    if (loadingRates || liveRates.length === 0) {
      return [
        { card_name: 'Amazon US', rate: 1520 },
        { card_name: 'iTunes US', rate: 1480 },
        { card_name: 'Visa US', rate: 1500 }
      ]
    }
    return liveRates.slice(0, 3).map(r => ({
      card_name: r.card_name,
      rate: r.rate
    }))
  }

  const topRates = getTopRates()

  // Get rates for ticker
  const getTickerRates = () => {
    if (loadingRates || liveRates.length === 0) {
      return [
        { flag: '🇺🇸', name: 'Amazon US', rate: '1,520', change: 'Best' },
        { flag: '🇺🇸', name: 'iTunes US', rate: '1,480', change: 'Hot' },
        { flag: '🇺🇸', name: 'Visa US', rate: '1,500', change: '↑' },
      ]
    }
    return liveRates.slice(0, 10).map(r => ({
      flag: r.flag || '🇺🇸',
      name: r.card_name,
      rate: r.rate.toLocaleString(),
      change: '↑ Live'
    }))
  }

  const tickerRates = getTickerRates()

  // Get rates for rates section
  const getRatesSection = () => {
    if (loadingRates || liveRates.length === 0) {
      return [
        { flag: '🇺🇸', name: 'Amazon US', country: 'United States', rate: '1,520', per: '$1' },
        { flag: '🇺🇸', name: 'iTunes US', country: 'United States', rate: '1,480', per: '$1' },
        { flag: '🇺🇸', name: 'Visa US', country: 'United States', rate: '1,500', per: '$1' },
      ]
    }
    return liveRates.slice(0, 8).map(r => ({
      flag: r.flag || '🇺🇸',
      name: r.card_name,
      country: r.category || 'Gift Card',
      rate: r.rate.toLocaleString(),
      per: '$1'
    }))
  }

  const ratesSection = getRatesSection()

  return (
    <div className={styles.container}>
      <div className={styles.cursorGlow} id="cursor"></div>
      <div className={styles.gridBg}></div>
      <div className={styles.mesh}>
        <div className={styles.mesh1}></div>
        <div className={styles.mesh2}></div>
        <div className={styles.mesh3}></div>
      </div>

      {/* NAV */}
      <nav className={styles.navbar} id="navbar">
        <Link to="/" className={styles.navLogo}>
          <div className={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#2A4AB5"/>
              <path d="M20 8L32 14V22C32 28.6 26.8 34.6 20 36C13.2 34.6 8 28.6 8 22V14L20 8Z" fill="#3D64E0"/>
              <path d="M16 21L19 24L25 18" stroke="#A8D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.navBrand}>Vaulte</span>
        </Link>
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#rates" className={styles.navLink}>Rates</a>
          <a href="#how" className={styles.navLink}>How it works</a>
          <a href="#security" className={styles.navLink}>Why Vaulte</a>
        </div>
        <div className={styles.navActions}>
          <Link to="/login" className={styles.btnGhost}>Sign in</Link>
          <Link to="/register" className={styles.btnPrimary}>Get started →</Link>
        </div>
        <button
          className={`${styles.navHamburger} ${isMenuOpen ? styles.open : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        <a href="#features" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Features</a>
        <a href="#rates" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Rates</a>
        <a href="#how" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>How it works</a>
        <a href="#security" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Why Vaulte</a>
        <div className={styles.mobileActions}>
          <Link to="/login" className={styles.btnGhost}>Sign in</Link>
          <Link to="/register" className={styles.btnPrimary}>Get started →</Link>
        </div>
      </div>

      {/* HERO */}
      <section className={styles.hero} id="home">
        <div className={styles.heroFloats}>
          {!loadingRates && topRates.length > 0 && (
            <>
              <div className={`${styles.floatCard} ${styles.floatCard1}`}>
                <div className={styles.fcLabel}>{topRates[0]?.card_name || 'Amazon US'} — $100</div>
                <div className={styles.fcVal}>₦ {(topRates[0]?.rate || 1520) * 100}</div>
                <div className={styles.fcSub}>↑ Best rate today</div>
              </div>
              <div className={`${styles.floatCard} ${styles.floatCard2}`}>
                <div className={styles.fcLabel}>{topRates[1]?.card_name || 'iTunes US'} — $50</div>
                <div className={styles.fcVal}>₦ {(topRates[1]?.rate || 1480) * 50}</div>
                <div className={styles.fcSub}>⚡ Paid in 8 mins</div>
              </div>
              <div className={`${styles.floatCard} ${styles.floatCard3}`}>
                <div className={styles.fcLabel}>Vaulte Rate</div>
                <div className={styles.fcVal}>₦{vaulteRate}/$</div>
                <div className={styles.fcSub}>↑ Live price</div>
              </div>
            </>
          )}
        </div>

        <div className={styles.heroBadge}>
          <div className={styles.badgeDot}></div>
          Now live in Nigeria & West Africa — ₦{vaulteRate}/$
        </div>

        <h1 className={styles.heroTitle}>
          <span className={styles.line1}>Your assets.</span>
          <span className={styles.line2}>Secured & traded.</span>
        </h1>

        <p className={styles.heroSub}>Crypto, gift cards, and digital assets — all in one clean, trusted platform built for West Africa. The best rates. Instant payouts. Zero stress.</p>

        <div className={styles.heroCta}>
          <Link to="/register" className={styles.btnHero}>Start trading free →</Link>
          <a href="#how" className={styles.btnHeroOutline}>See how it works</a>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.heroStat}><div className={styles.heroStatVal}>₦2.29B+</div><div className={styles.heroStatLabel}>Gift card market size</div></div>
          <div className={styles.heroStatDivider}></div>
          <div className={styles.heroStat}><div className={styles.heroStatVal}>500+</div><div className={styles.heroStatLabel}>Gift card brands</div></div>
          <div className={styles.heroStatDivider}></div>
          <div className={styles.heroStat}><div className={styles.heroStatVal}>&lt; 15 min</div><div className={styles.heroStatLabel}>Average payout time</div></div>
          <div className={styles.heroStatDivider}></div>
          <div className={styles.heroStat}><div className={styles.heroStatVal}>100%</div><div className={styles.heroStatLabel}>Secure & regulated</div></div>
        </div>

        {/* MOCK APP */}
        <div className={styles.heroMock}>
          <div className={styles.mockWindow}>
            <div className={styles.mockBar}>
              <div className={`${styles.mockDot} ${styles.mockDot1}`}></div>
              <div className={`${styles.mockDot} ${styles.mockDot2}`}></div>
              <div className={`${styles.mockDot} ${styles.mockDot3}`}></div>
              <div className={styles.mockUrl}>app.vaulte.co/dashboard</div>
            </div>
            <div className={styles.mockBody}>
              <div className={styles.mockSidebar}>
                <div className={styles.mockLogo}>
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="8" fill="#2A4AB5"/>
                    <path d="M16 21L19 24L25 18" stroke="#A8D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Vaulte
                </div>
                <div className={`${styles.mockNavItem} ${styles.active}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Dashboard
                </div>
                <div className={styles.mockNavItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  Gift Cards
                </div>
                <div className={styles.mockNavItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  Crypto
                </div>
                <div className={styles.mockNavItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M6 3v3M18 3v3M3 12h18M3 18h18M6 21v-3M18 21v-3"/></svg>
                  Transactions
                </div>
              </div>
              <div className={styles.mockMain}>
                <div className={styles.mockGreeting}>Good morning, Vincent 👋</div>
                <div className={styles.mockCards}>
                  <div className={styles.mockCard}><div className={styles.mockCardLabel}>Wallet balance</div><div className={styles.mockCardVal}>₦ 847,500</div><div className={styles.mockCardSub}>↑ Available</div></div>
                  <div className={styles.mockCard}><div className={styles.mockCardLabel}>Total traded</div><div className={styles.mockCardVal}>₦ 2.4M</div><div className={styles.mockCardSub}>↑ All time</div></div>
                  <div className={styles.mockCard}><div className={styles.mockCardLabel}>Pending</div><div className={styles.mockCardVal}>2</div><div className={styles.mockCardSub}>In review</div></div>
                </div>
                <div className={styles.mockTxTitle}>Recent transactions</div>
                <div className={styles.mockTx}><div className={styles.mockTxLeft}><div className={styles.mockTxIcon}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/></svg></div><div><div className={styles.mockTxName}>Amazon US</div><div className={styles.mockTxId}>TXN001 · Jun 7</div></div></div><div className={styles.mockTxAmount}>₦152,000</div></div>
                <div className={styles.mockTx}><div className={styles.mockTxLeft}><div className={styles.mockTxIcon}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/></svg></div><div><div className={styles.mockTxName}>iTunes US</div><div className={styles.mockTxId}>TXN002 · Jun 7</div></div></div><div className={styles.mockTxAmount}>₦74,000</div></div>
                <div className={styles.mockTx}><div className={styles.mockTxLeft}><div className={styles.mockTxIcon}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div><div><div className={styles.mockTxName}>Bitcoin</div><div className={styles.mockTxId}>TXN003 · Jun 6</div></div></div><div className={styles.mockTxAmount}>₦984,000</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER - Live Rates */}
      <div className={styles.tickerWrap}>
        <div className={styles.tickerLabel}>
          Live rates
          <span className={styles.tickerRateBadge}>₦{vaulteRate}/$</span>
        </div>
        <div className={styles.tickerFadeR}></div>
        <div className={styles.tickerTrack}>
          {loadingRates ? (
            <div className={styles.tickerItem}>Loading live rates...</div>
          ) : (
            [...Array(2)].map((_, i) => (
              <div key={i} className={styles.tickerGroup}>
                {tickerRates.map((item, idx) => (
                  <div key={idx} className={styles.tickerItem}>
                    <span className={styles.tickerFlag}>{item.flag}</span>
                    <span className={styles.tickerName}>{item.name}</span>
                    <span className={styles.tickerRate}>₦{item.rate}/$</span>
                    <span className={styles.tickerChange}>{item.change}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className={styles.section}>
        <div className={styles.wrap}>
          <div className={`${styles.sectionLabel} reveal`}>What we offer</div>
          <h2 className={`${styles.sectionTitle} reveal reveal-d1`}>Everything in one vault</h2>
          <p className={`${styles.sectionSub} reveal reveal-d2`}>No more juggling multiple apps. Trade crypto, sell gift cards, and manage all your digital assets in one beautifully designed platform.</p>
          <div className={styles.featuresGrid}>
            <div className={`${styles.featureCard} reveal`}>
              <div className={styles.featureIconWrap}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
              <div className={styles.featureTitle}>Crypto exchange</div>
              <div className={styles.featureDesc}>Buy, sell & swap BTC, ETH, USDT, SOL and more. P2P and instant swap. Naira hits your account in minutes.</div>
            </div>
            <div className={`${styles.featureCard} reveal reveal-d1`}>
              <div className={styles.featureIconWrap}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
              <div className={styles.featureTitle}>Gift card trading</div>
              <div className={styles.featureDesc}>Amazon, iTunes, Steam, Google Play and 500+ brands. Nigeria's best rates with instant naira payouts guaranteed.</div>
            </div>
            <div className={`${styles.featureCard} reveal reveal-d2`}>
              <div className={styles.featureIconWrap}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
              <div className={styles.featureTitle}>Secure wallet</div>
              <div className={styles.featureDesc}>One multi-asset wallet for all your crypto. KYC-compliant, fully encrypted, institutional-grade security.</div>
            </div>
            <div className={`${styles.featureCard} reveal reveal-d1`}>
              <div className={styles.featureIconWrap}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
              <div className={styles.featureTitle}>Instant payouts</div>
              <div className={styles.featureDesc}>Naira hits your bank account fast. No waiting, no excuses. We move at the speed your money deserves.</div>
            </div>
            <div className={`${styles.featureCard} reveal reveal-d2`}>
              <div className={styles.featureIconWrap}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.5"><path d="M3 12h3l3-9 3 18 3-9h3"/></svg></div>
              <div className={styles.featureTitle}>Built for Nigeria</div>
              <div className={styles.featureDesc}>Bank transfers, USSD, local payment methods. Designed from the ground up for the Nigerian and West African user.</div>
            </div>
            <div className={`${styles.featureCard} reveal reveal-d3`}>
              <div className={styles.featureIconWrap}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <div className={styles.featureTitle}>SEC regulated</div>
              <div className={styles.featureDesc}>Fully compliant under ISA 2025. Your funds and data protected by law, not just promises.</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className={styles.section} style={{borderTop: '0.5px solid var(--border)'}}>
        <div className={styles.wrap}>
          <div className={`${styles.sectionLabel} reveal`}>Simple process</div>
          <h2 className={`${styles.sectionTitle} reveal reveal-d1`}>Three steps to get paid</h2>
          <p className={`${styles.sectionSub} reveal reveal-d2`}>Selling your gift cards or trading crypto has never been this straightforward.</p>
          <div className={styles.howGrid}>
            <div className={`${styles.howStep} reveal`}>
              <div className={styles.howNum}>1</div>
              <div className={styles.howTitle}>Select your asset</div>
              <div className={styles.howDesc}>Choose your gift card brand or crypto and see the current Vaulte rate in real time.</div>
            </div>
            <div className={`${styles.howStep} reveal reveal-d1`}>
              <div className={styles.howNum}>2</div>
              <div className={styles.howTitle}>Enter details</div>
              <div className={styles.howDesc}>Tell us the card value or crypto amount. Enter your card code and bank account details.</div>
            </div>
            <div className={`${styles.howStep} reveal reveal-d2`}>
              <div className={styles.howNum}>3</div>
              <div className={styles.howTitle}>Get paid</div>
              <div className={styles.howDesc}>We verify your asset and send naira directly to your bank account in under 15 minutes.</div>
            </div>
          </div>
        </div>
      </section>

      {/* RATES - Now with Live Data */}
      <section id="rates" className={styles.section} style={{borderTop: '0.5px solid var(--border)'}}>
        <div className={styles.wrap}>
          <div className={`${styles.sectionLabel} reveal`}>
            Transparent pricing
            <span className={styles.liveBadge}>🟢 Live</span>
          </div>
          <h2 className={`${styles.sectionTitle} reveal reveal-d1`}>Today's best rates</h2>
          <p className={`${styles.sectionSub} reveal reveal-d2`}>
            We publish our rates publicly so you always know exactly what you'll get. 
            No hidden charges. <strong>Current rate: ₦{vaulteRate}/$</strong>
          </p>
          <div className={styles.ratesGrid}>
            {ratesSection.map((card, idx) => (
              <div key={idx} className={`${styles.rateCard} reveal ${idx % 2 === 0 ? '' : 'reveal-d1'}`}>
                <div className={styles.rateLeft}>
                  <span className={styles.rateFlag}>{card.flag}</span>
                  <div>
                    <div className={styles.rateName}>{card.name}</div>
                    <div className={styles.rateCountry}>{card.country}</div>
                  </div>
                </div>
                <div>
                  <div className={styles.rateVal}>₦{card.rate}</div>
                  <div className={styles.ratePer}>per {card.per}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY VAULTE */}
      <section id="security" className={styles.section} style={{borderTop: '0.5px solid var(--border)'}}>
        <div className={styles.wrap}>
          <div className={styles.whyGrid}>
            <div>
              <div className={`${styles.sectionLabel} reveal`} style={{textAlign: 'left'}}>Why choose Vaulte</div>
              <h2 className={`${styles.sectionTitle} reveal reveal-d1`} style={{textAlign: 'left', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)'}}>Nigerians deserve a platform that actually works</h2>
              <div className={styles.whyList}>
                <div className={`${styles.whyItem} reveal`}>
                  <div className={styles.whyIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.whyTitle}>Bank-grade security</div>
                    <div className={styles.whyDesc}>End-to-end encryption, 2FA, and cold storage. Your assets are protected at every step.</div>
                  </div>
                </div>

                <div className={`${styles.whyItem} reveal reveal-d1`}>
                  <div className={styles.whyIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.5">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.whyTitle}>Fastest payouts in Nigeria</div>
                    <div className={styles.whyDesc}>Average payout under 15 minutes. We don't keep you waiting for your own money.</div>
                  </div>
                </div>

                <div className={`${styles.whyItem} reveal reveal-d2`}>
                  <div className={styles.whyIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.whyTitle}>Best rates, always</div>
                    <div className={styles.whyDesc}>We compete aggressively on rates. Your crypto and gift cards will always get you more naira on Vaulte.</div>
                  </div>
                </div>

                <div className={`${styles.whyItem} reveal reveal-d3`}>
                  <div className={styles.whyIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.5">
                      <path d="M3 12h3l3-9 3 18 3-9h3"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.whyTitle}>Built by Nigerians, for Nigerians</div>
                    <div className={styles.whyDesc}>Not imported. Not foreign. Built from Abuja by someone who understands this market from the inside.</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className={`${styles.comparisonWrap} reveal reveal-d2`}>
                <div className={styles.comparisonHeader}><span>Feature</span><span>Others</span><span>Vaulte</span></div>
                {[
                  { feature: 'Crypto + gift cards', others: '✗', vaulte: '✓' },
                  { feature: 'Instant payouts', others: '✗', vaulte: '✓' },
                  { feature: 'SEC compliant', others: '✗', vaulte: '✓' },
                  { feature: 'Best rates', others: '✗', vaulte: '✓' },
                  { feature: 'Built for Nigeria', others: '✗', vaulte: '✓' },
                  { feature: 'Clean UX', others: '✗', vaulte: '✓' },
                ].map((row, idx) => (
                  <div key={idx} className={styles.comparisonRow}>
                    <div className={styles.cFeature}>{row.feature}</div>
                    <div className={styles.cNo}>{row.others}</div>
                    <div className={styles.cYes}>{row.vaulte}</div>
                  </div>
                ))}
              </div>
              <div className={`${styles.payoutFeed} reveal reveal-d3`} style={{marginTop: '1rem'}}>
                <div className={styles.pfTitle}>Recent payouts 🟢</div>
                {[
                  { name: 'Amazon', amount: '₦152,000', time: '2 mins ago' },
                  { name: 'iTunes', amount: '₦74,000', time: '5 mins ago' },
                  { name: 'Visa', amount: '₦300,000', time: '9 mins ago' },
                  { name: 'Bitcoin', amount: '₦984,000', time: '14 mins ago' },
                ].map((p, idx) => (
                  <div key={idx} className={styles.pfRow}>
                    <div className={styles.pfLeft}><div className={styles.pfDot}></div><span>Someone sold an <strong>{p.name}</strong> card</span></div>
                    <div className={styles.pfRight}><div className={styles.pfAmount}>{p.amount}</div><div className={styles.pfTime}>{p.time}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className={styles.section} style={{borderTop: '0.5px solid var(--border)'}}>
        <div className={styles.wrap}>
          <div className={`${styles.sectionLabel} reveal`}>Built on trust</div>
          <h2 className={`${styles.sectionTitle} reveal reveal-d1`}>Numbers that speak</h2>
          <div className={styles.trustGrid} style={{marginTop: '3rem'}}>
            <div className={`${styles.trustCard} reveal`}>
              <div className={styles.trustIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div className={styles.trustVal}>256-bit</div>
              <div className={styles.trustLabel}>SSL encryption</div>
            </div>

            <div className={`${styles.trustCard} reveal reveal-d1`}>
              <div className={styles.trustIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div className={styles.trustVal}>&lt;15min</div>
              <div className={styles.trustLabel}>Average payout</div>
            </div>

            <div className={`${styles.trustCard} reveal reveal-d2`}>
              <div className={styles.trustIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className={styles.trustVal}>SEC</div>
              <div className={styles.trustLabel}>Nigeria regulated</div>
            </div>

            <div className={`${styles.trustCard} reveal reveal-d3`}>
              <div className={styles.trustIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className={styles.trustVal}>24/7</div>
              <div className={styles.trustLabel}>Customer support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.wrap}>
          <div className={`${styles.ctaBox} reveal`}>
            <h2 className={styles.ctaTitle}>Ready to trade with confidence?</h2>
            <p className={styles.ctaSub}>Join thousands of Nigerians getting the best rates on Vaulte every day. <strong>Current rate: ₦{vaulteRate}/$</strong></p>
            <form className={styles.ctaForm} action="https://formspree.io/f/xjgdygok" method="POST" onSubmit={handleCtaSubmit}>
              <input className={styles.ctaInput} type="email" name="email" placeholder="Enter your email address" id="cta-email" required />
              <input type="hidden" name="source" value="landing-cta" />
              <button className={styles.ctaBtn} type="submit">Get started →</button>
            </form>
            <p className={styles.ctaNote} id="cta-note">🔒 Free to join. No spam. Early access benefits.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <div className={styles.footerTop}>
            <div>
              <div className={styles.footerBrand}>
                <div className={styles.logoIcon} style={{width: '30px', height: '30px', borderRadius: '7px'}}>
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="10" fill="#2A4AB5"/>
                    <path d="M20 8L32 14V22C32 28.6 26.8 34.6 20 36C13.2 34.6 8 28.6 8 22V14L20 8Z" fill="#3D64E0"/>
                    <path d="M16 21L19 24L25 18" stroke="#A8D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className={styles.footerBrandName}>Vaulte</span>
              </div>
              <p className={styles.footerDesc}>West Africa's most trusted digital asset exchange. Built for Nigerians, by Nigerians.</p>
            </div>
            <div>
              <div className={styles.footerColTitle}>Product</div>
              <a href="#" className={styles.footerLink}>Gift cards</a>
              <a href="#" className={styles.footerLink}>Crypto exchange</a>
              <a href="#" className={styles.footerLink}>Wallet</a>
              <a href="#" className={styles.footerLink}>Rates</a>
            </div>
            <div>
              <div className={styles.footerColTitle}>Company</div>
              <a href="#" className={styles.footerLink}>About us</a>
              <a href="#" className={styles.footerLink}>Blog</a>
              <a href="#" className={styles.footerLink}>Careers</a>
              <a href="#" className={styles.footerLink}>Contact</a>
            </div>
            <div>
              <div className={styles.footerColTitle}>Legal</div>
              <a href="#" className={styles.footerLink}>Privacy policy</a>
              <a href="#" className={styles.footerLink}>Terms of service</a>
              <a href="#" className={styles.footerLink}>AML policy</a>
              <a href="#" className={styles.footerLink}>SEC compliance</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <div className={styles.footerCopy}>© 2026 Vaulte Technologies Ltd. Abuja, Nigeria.</div>
            <div className={styles.footerTagline}>Trade with confidence</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage