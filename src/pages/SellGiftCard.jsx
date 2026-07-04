import styles from './SellGiftCard.module.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

const CATEGORIES = ['All', 'Shopping', 'Gaming', 'Entertainment', 'Finance', 'Food']

const POPULARITY_ORDER = [
  'Amazon US', 'Amazon UK', 'Apple', 'Visa US', 'Mastercard US',
  'iTunes US', 'iTunes UK', 'Google Play US', 'Steam', 'PlayStation',
  'Xbox', 'Netflix', 'Spotify', 'Disney+', 'Walmart',
  'Target', 'Best Buy', 'Nike', 'Hulu', 'iTunes AU'
]

// Category-based accent colors — this is the real legend now
const CATEGORY_COLORS = {
  Shopping: { accent: '#FF9900', glow: 'rgba(255,153,0,0.4)' },
  Gaming: { accent: '#8B5CF6', glow: 'rgba(139,92,246,0.4)' },
  Entertainment: { accent: '#F6414D', glow: 'rgba(246,65,77,0.4)' },
  Finance: { accent: '#4ADE80', glow: 'rgba(74,222,128,0.4)' },
  Food: { accent: '#FFC845', glow: 'rgba(255,200,69,0.4)' },
}
const DEFAULT_COLOR = { accent: '#60A5FA', glow: 'rgba(96,165,250,0.35)' }

function getCategoryAccent(category) {
  return CATEGORY_COLORS[category] || DEFAULT_COLOR
}

function SellGiftCard() {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState(null)
  const [amount, setAmount] = useState('')
  const [cardCode, setCardCode] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showAll, setShowAll] = useState(false)
  const [giftCards, setGiftCards] = useState([])
  const [marketRate, setMarketRate] = useState(1280)
  const [vaulteRate, setVaulteRate] = useState(1180)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get('/rates')
        const rates = res.data.rates || []
        const sortedRates = sortByPopularity(rates)

        setGiftCards(sortedRates)
        setMarketRate(res.data.market_rate || 1280)
        setVaulteRate(res.data.vaulte_rate || 1180)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch rates:', err)
        setLoading(false)
      }
    }
    fetchRates()

    const interval = setInterval(fetchRates, 60000)
    return () => clearInterval(interval)
  }, [])

  const sortByPopularity = (cards) => {
    return [...cards].sort((a, b) => {
      const indexA = POPULARITY_ORDER.indexOf(a.card_name)
      const indexB = POPULARITY_ORDER.indexOf(b.card_name)
      if (indexA !== -1 && indexB !== -1) return indexA - indexB
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1
      return a.card_name.localeCompare(b.card_name)
    })
  }

  const getPopularCards = () => giftCards.slice(0, 6)

  const filtered = giftCards.filter(card => {
    const matchSearch = card.card_name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || card.category === category
    return matchSearch && matchCat
  })

  const nairaValue = selected && amount
    ? (parseFloat(amount) * selected.rate).toLocaleString('en-NG')
    : '0.00'

  const handleSubmit = async () => {
    try {
      await api.post('/transactions', {
        card_name: selected.card_name,
        card_value: parseFloat(amount),
        card_code: cardCode,
        naira_value: parseFloat(amount) * selected.rate
      })
      navigate('/transactions')
    } catch {
      alert('Something went wrong. Please try again.')
    }
  }

  const renderCardTile = (card, index) => {
    const { accent, glow } = getCategoryAccent(card.category)
    const isSelected = selected?.card_id === card.card_id
    return (
      <button
        key={card.card_id}
        className={`${styles.cardOption} ${isSelected ? styles.cardSelected : ''}`}
        style={{ '--accent': accent, '--glow': glow, animationDelay: `${index * 35}ms` }}
        onClick={() => setSelected(card)}
      >
        <span className={styles.cardShine}></span>
        {isSelected && <span className={styles.selectedBadge}>✓</span>}
        <span className={styles.categoryDot} style={{ background: accent }}></span>
        <span className={styles.cardFlag}>{card.flag || '💳'}</span>
        <span className={styles.cardName}>{card.card_name}</span>
        <span className={styles.cardRate}>₦{card.rate}/$</span>
      </button>
    )
  }

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar active="giftcards" />
        <main className={styles.main}>
          <div className={styles.header}>
            <a href="/dashboard" className={styles.back}>← Back</a>
            <h1 className={styles.title}>Sell gift card</h1>
            <p className={styles.sub}>Get the best naira rates instantly</p>
          </div>
          <div className={styles.card}>
            <div className={styles.skeletonLabel}></div>
            <div className={styles.cardGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className={styles.skeletonFlag}></div>
                  <div className={styles.skeletonLine}></div>
                  <div className={styles.skeletonLineSm}></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <Sidebar active="giftcards" />

      <main className={styles.main}>
        <div className={styles.header}>
          <a href="/dashboard" className={styles.back}>← Back</a>
          <h1 className={styles.title}>Sell gift card</h1>
          <p className={styles.sub}>Get the best naira rates instantly</p>
        </div>

        {/* LIVE RATE BAR */}
        <div className={styles.liveRateBar} key={selected?.card_id || 'none'}>
          <span className={styles.liveDot}></span>
          <span className={styles.liveRateText}>
            {selected ? (
              <>
                <strong>{selected.card_name}</strong>: <strong>₦{selected.rate}</strong> per $1
                {amount ? (
                  <span className={styles.marginBadge}>
                    You get ₦{(selected.rate * parseFloat(amount)).toLocaleString('en-NG')}
                  </span>
                ) : (
                  <span className={styles.marginBadge}>Enter amount to calculate</span>
                )}
              </>
            ) : (
              <>
                Select a gift card to see your rate
                <span className={styles.marginBadge}>Base rate: ₦{vaulteRate}/$</span>
              </>
            )}
          </span>
        </div>

        {/* CATEGORY LEGEND */}
        <div className={styles.legendRow}>
          {CATEGORIES.filter(c => c !== 'All').map(cat => (
            <div key={cat} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: getCategoryAccent(cat).accent }}></span>
              {cat}
            </div>
          ))}
        </div>

        <div className={styles.twoCol}>
          <div className={styles.formCol}>
            <div className={styles.steps}>
              {['Select card', 'Enter details', 'Confirm'].map((s, i) => (
                <div key={i} className={`${styles.step} ${step === i + 1 ? styles.stepActive : ''} ${step > i + 1 ? styles.stepDone : ''}`}>
                  <div className={styles.stepDot}>{step > i + 1 ? '✓' : i + 1}</div>
                  <span>{s}</span>
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Which gift card are you selling?</h2>

                {!showAll && (
                  <div className={styles.popularLabel}>
                    <span className={styles.flameIcon}>🔥</span> Popular
                  </div>
                )}

                {showAll && (
                  <>
                    <div className={styles.searchWrap}>
                      <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Search gift cards..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                    <div className={styles.catFilter}>
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          className={`${styles.catBtn} ${category === cat ? styles.catActive : ''}`}
                          onClick={() => setCategory(cat)}
                        >
                          {cat !== 'All' && (
                            <span className={styles.catBtnDot} style={{ background: getCategoryAccent(cat).accent }}></span>
                          )}
                          {cat}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className={styles.cardGrid}>
                  {(showAll ? filtered : getPopularCards()).map((card, i) => renderCardTile(card, i))}
                  {showAll && filtered.length === 0 && (
                    <div className={styles.noResults}>No cards found for "{search}"</div>
                  )}
                </div>

                {!showAll && (
                  <button className={styles.seeAllBtn} onClick={() => setShowAll(true)}>
                    See all cards ({giftCards.length}) ↓
                  </button>
                )}

                {showAll && (
                  <button className={styles.seeAllBtn} onClick={() => { setShowAll(false); setSearch(''); setCategory('All') }}>
                    ↑ Show less
                  </button>
                )}

                <button className={styles.btn} disabled={!selected} onClick={() => setStep(2)}>
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Enter card details</h2>
                <div className={styles.rateBox}>
                  <span>Current rate</span>
                  <span className={styles.rateVal}>₦{selected?.rate} per $1</span>
                </div>
                <div className={styles.form}>
                  <div className={styles.field}>
                    <label>Card value (USD)</label>
                    <input type="number" placeholder="e.g. 100" value={amount} onChange={e => setAmount(e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label>Card code / PIN</label>
                    <input type="text" placeholder="Enter your gift card code" value={cardCode} onChange={e => setCardCode(e.target.value)} />
                  </div>
                  {amount && (
                    <div className={styles.calcBox}>
                      <span>You will receive</span>
                      <span className={styles.calcVal}>₦ {nairaValue}</span>
                    </div>
                  )}
                  <div className={styles.btnRow}>
                    <button className={styles.btnOutline} onClick={() => setStep(1)}>← Back</button>
                    <button className={styles.btn} disabled={!amount || !cardCode} onClick={() => setStep(3)}>Continue →</button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Confirm your trade</h2>
                <div className={styles.summary}>
                  <div className={styles.summaryRow}><span>Gift card</span><span>{selected?.flag} {selected?.card_name}</span></div>
                  <div className={styles.summaryRow}><span>Card value</span><span>${amount}</span></div>
                  <div className={styles.summaryRow}><span>Rate</span><span>₦{selected?.rate}/$</span></div>
                  <div className={styles.summaryRow}><span>Card code</span><span className={styles.code}>{cardCode}</span></div>
                  <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                    <span>You receive</span>
                    <span className={styles.totalVal}>₦ {nairaValue}</span>
                  </div>
                </div>
                <p className={styles.notice}>⏱ Your card will be reviewed within 5–15 minutes. Naira will be sent to your registered bank account.</p>
                <div className={styles.btnRow}>
                  <button className={styles.btnOutline} onClick={() => setStep(2)}>← Back</button>
                  <button className={styles.btn} onClick={handleSubmit}>Submit trade ✓</button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.rightCol}>
            <div className={styles.ratesPanel}>
              <div className={styles.ratesPanelHeader}>
                <span className={styles.ratesPanelTitle}>Today's rates</span>
                <span className={styles.liveTag}>
                  <span className={styles.liveTagDot}></span> Live
                </span>
              </div>
              {giftCards.slice(0, 8).map(card => {
                const { accent } = getCategoryAccent(card.category)
                return (
                  <div
                    key={card.card_id}
                    className={`${styles.rateRow} ${selected?.card_id === card.card_id ? styles.rateRowActive : ''}`}
                    onClick={() => { setSelected(card); setStep(1) }}
                  >
                    <div className={styles.rateRowLeft}>
                      <span className={styles.rateRowDot} style={{ background: accent }}></span>
                      <span className={styles.rateRowFlag}>{card.flag || '💳'}</span>
                      <span className={styles.rateRowName}>{card.card_name}</span>
                    </div>
                    <span className={styles.rateRowVal}>₦{card.rate}/$</span>
                  </div>
                )
              })}
            </div>

            <div className={styles.trustPanel}>
              <div className={styles.trustTitle}>How it works</div>
              <div className={styles.trustStep}>
                <div className={styles.trustNum}>1</div>
                <div>
                  <div className={styles.trustStepTitle}>Select your card</div>
                  <div className={styles.trustStepDesc}>Choose the gift card brand and see the current rate</div>
                </div>
              </div>
              <div className={styles.trustStep}>
                <div className={styles.trustNum}>2</div>
                <div>
                  <div className={styles.trustStepTitle}>Enter details</div>
                  <div className={styles.trustStepDesc}>Tell us the card value and enter your card code</div>
                </div>
              </div>
              <div className={styles.trustStep}>
                <div className={styles.trustNum}>3</div>
                <div>
                  <div className={styles.trustStepTitle}>Get paid</div>
                  <div className={styles.trustStepDesc}>We verify the card and send naira to your account in minutes</div>
                </div>
              </div>
            </div>

            <div className={styles.payoutFeed}>
              <div className={styles.trustTitle}>Recent payouts</div>
              {[
                { card: 'Amazon', amount: '₦76,000', time: '2 mins ago' },
                { card: 'iTunes', amount: '₦44,400', time: '5 mins ago' },
                { card: 'Steam', amount: '₦27,000', time: '11 mins ago' },
                { card: 'Google Play', amount: '₦56,000', time: '18 mins ago' },
              ].map((p, i) => (
                <div key={i} className={styles.payoutRow}>
                  <div className={styles.payoutLeft}>
                    <div className={styles.payoutDot}></div>
                    <span>Someone sold a <strong>{p.card}</strong> card</span>
                  </div>
                  <div className={styles.payoutRight}>
                    <span className={styles.payoutAmount}>{p.amount}</span>
                    <span className={styles.payoutTime}>{p.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SellGiftCard