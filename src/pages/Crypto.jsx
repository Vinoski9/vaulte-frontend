import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'
import styles from './Crypto.module.css'

const ASSETS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'ripple', symbol: 'XRP', name: 'Ripple' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { id: 'the-open-network', symbol: 'TON', name: 'Toncoin' },
]

const TIME_RANGES = ['1H', '24H', '7D', '30D', '1Y']

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

function Crypto() {
  const navigate = useNavigate()
  const [selectedAsset, setSelectedAsset] = useState('BTC')
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [prices, setPrices] = useState({})
  const [candles, setCandles] = useState([])
  const [candlesLoading, setCandlesLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24H')
  const [tradeType, setTradeType] = useState('buy')
  const [amount, setAmount] = useState('')
  const [total, setTotal] = useState(0)
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] })
  const [recentTrades, setRecentTrades] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [assetBalances, setAssetBalances] = useState({})
  const [pricesLoading, setPricesLoading] = useState(true)
  const [watchlistSearch, setWatchlistSearch] = useState('')
  const [hoverCandle, setHoverCandle] = useState(null)
  const chartWrapRef = useRef(null)

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await api.get('/withdrawals/balance')
        setBalance(res.data.balance || 0)
      } catch {
        console.error('Failed to fetch balance')
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [])

  // Fetch real prices from Coingecko
  useEffect(() => {
    const fetchPrices = async () => {
      setPricesLoading(true)
      try {
        const ids = ASSETS.map(a => a.id).join(',')
        const res = await fetch(`${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=ngn`)
        const data = await res.json()

        const newPrices = {}
        ASSETS.forEach(asset => {
          newPrices[asset.symbol] = data[asset.id]?.ngn || 0
        })
        setPrices(newPrices)
      } catch (error) {
        console.error('Failed to fetch prices:', error)
      } finally {
        setPricesLoading(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch real OHLC candles from Coingecko
  useEffect(() => {
    const fetchCandles = async () => {
      setCandlesLoading(true)
      try {
        const days = timeRange === '1H' ? 1 : timeRange === '24H' ? 1 : timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : 365
        const coinId = ASSETS.find(a => a.symbol === selectedAsset)?.id || 'bitcoin'
        const res = await fetch(`${COINGECKO_BASE}/coins/${coinId}/ohlc?vs_currency=ngn&days=${days}`)
        const data = await res.json()

        if (Array.isArray(data)) {
          const parsed = data.map(([time, open, high, low, close]) => ({
            time, open, high, low, close
          }))
          setCandles(parsed)
        }
      } catch (error) {
        console.error('Failed to fetch candles:', error)
      } finally {
        setCandlesLoading(false)
      }
    }

    fetchCandles()
  }, [selectedAsset, timeRange])

  // Generate mock order book and recent trades (for demo)
  useEffect(() => {
    const generateRecentTrades = () => {
      const trades = []
      const types = ['buy', 'sell']
      const basePrice = prices[selectedAsset] || 87450000
      for (let i = 0; i < 14; i++) {
        trades.push({
          id: i,
          type: types[Math.floor(Math.random() * types.length)],
          price: basePrice + (Math.random() - 0.5) * basePrice * 0.01,
          amount: (Math.random() * 0.1 + 0.01).toFixed(4),
          time: new Date(Date.now() - i * 60000).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        })
      }
      return trades
    }

    const generateOrderBook = () => {
      const bids = []
      const asks = []
      const basePrice = prices[selectedAsset] || 87450000
      for (let i = 0; i < 10; i++) {
        const price = basePrice - i * 50000
        bids.push({
          price,
          amount: (Math.random() * 0.15 + 0.01).toFixed(4),
          total: (price * (Math.random() * 0.15 + 0.01)).toFixed(0)
        })
      }
      for (let i = 0; i < 10; i++) {
        const price = basePrice + i * 50000
        asks.push({
          price,
          amount: (Math.random() * 0.15 + 0.01).toFixed(4),
          total: (price * (Math.random() * 0.15 + 0.01)).toFixed(0)
        })
      }
      return { bids, asks }
    }

    setRecentTrades(generateRecentTrades())
    setOrderBook(generateOrderBook())
  }, [prices, selectedAsset])

  const currentPrice = prices[selectedAsset] || 0

  const handleAmountChange = (e) => {
    const val = e.target.value
    setAmount(val)
    if (val && currentPrice) {
      setTotal(parseFloat(val) * currentPrice)
    } else {
      setTotal(0)
    }
  }

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return setError('Please enter a valid amount')
    }

    if (tradeType === 'buy' && total > balance) {
      return setError('Insufficient wallet balance')
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSuccess(`${tradeType === 'buy' ? 'Bought' : 'Sold'} ${amount} ${selectedAsset} successfully!`)
      setAmount('')
      setTotal(0)

      setAssetBalances(prev => ({
        ...prev,
        [selectedAsset]: (prev[selectedAsset] || 0) + (tradeType === 'buy' ? parseFloat(amount) : -parseFloat(amount))
      }))

      const newTrade = {
        id: Date.now(),
        type: tradeType,
        price: currentPrice,
        amount: parseFloat(amount),
        time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
      setRecentTrades(prev => [newTrade, ...prev.slice(0, 13)])

    } catch {
      setError('Trade failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset)
    setAmount('')
    setTotal(0)
    setError('')
    setSuccess('')
    setHoverCandle(null)
  }

  const formatPrice = (price) => {
    if (!price) return '₦0'
    if (price >= 1000000) return `₦${(price / 1000000).toFixed(2)}M`
    return `₦${price.toLocaleString('en-NG')}`
  }

  const formatPriceFull = (price) => {
    if (!price) return '₦0'
    return `₦${Number(price).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
  }

  const getPriceChange = (symbol) => {
    if (symbol !== selectedAsset || candles.length < 2) {
      const seed = symbol.charCodeAt(0) + symbol.charCodeAt(symbol.length - 1)
      return ((seed % 13) - 6) * 0.4
    }
    const firstOpen = candles[0]?.open || 0
    const lastClose = candles[candles.length - 1]?.close || 0
    if (firstOpen === 0) return 0
    return ((lastClose - firstOpen) / firstOpen) * 100
  }

  const isPositive = (change) => change >= 0
  const selectedChange = getPriceChange(selectedAsset)

  const chartStats = useMemo(() => {
    if (candles.length === 0) return { high: 0, low: 0 }
    const highs = candles.map(c => c.high)
    const lows = candles.map(c => c.low)
    return { high: Math.max(...highs), low: Math.min(...lows) }
  }, [candles])

  const filteredAssets = ASSETS.filter(a =>
    a.symbol.toLowerCase().includes(watchlistSearch.toLowerCase()) ||
    a.name.toLowerCase().includes(watchlistSearch.toLowerCase())
  )

  // ===== CANDLESTICK GEOMETRY =====
  const CHART_W = 800
  const CHART_H = 300
  const PAD_TOP = 16
  const PAD_BOTTOM = 16

  const candleGeometry = useMemo(() => {
    if (candles.length === 0) return { bars: [], gridLines: [] }

    const highs = candles.map(c => c.high)
    const lows = candles.map(c => c.low)
    const max = Math.max(...highs)
    const min = Math.min(...lows)
    const range = (max - min) || 1
    const usableH = CHART_H - PAD_TOP - PAD_BOTTOM

    const slot = CHART_W / candles.length
    const bodyWidth = Math.max(2, slot * 0.6)

    const yFor = (val) => PAD_TOP + usableH - ((val - min) / range) * usableH

    const bars = candles.map((c, i) => {
      const xCenter = slot * i + slot / 2
      const up = c.close >= c.open
      const yHigh = yFor(c.high)
      const yLow = yFor(c.low)
      const yOpen = yFor(c.open)
      const yClose = yFor(c.close)
      const bodyTop = Math.min(yOpen, yClose)
      const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen))

      return {
        index: i,
        xCenter,
        yHigh,
        yLow,
        bodyTop,
        bodyHeight,
        bodyWidth,
        up,
        ...c
      }
    })

    const gridCount = 4
    const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
      const y = PAD_TOP + (usableH / gridCount) * i
      const val = min + range * (1 - i / gridCount)
      return { y, val }
    })

    return { bars, gridLines, min, max }
  }, [candles])

  const handleChartMouseMove = (e) => {
    if (candleGeometry.bars.length === 0) return
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * CHART_W
    const slot = CHART_W / candleGeometry.bars.length
    let idx = Math.floor(relX / slot)
    idx = Math.max(0, Math.min(candleGeometry.bars.length - 1, idx))
    setHoverCandle(candleGeometry.bars[idx])
  }

  const handleChartMouseLeave = () => setHoverCandle(null)

  return (
    <div className={styles.layout}>
      <Sidebar active="crypto" />
      <main className={styles.main}>

        {/* TOP STATS BAR */}
        <div className={styles.statsBar}>
          <div className={styles.statsBarLeft}>
            <div className={styles.assetBadge}>
              <span className={styles.assetSymbolBig}>{selectedAsset}</span>
              <span className={styles.assetPair}>/NGN</span>
            </div>
            <div className={styles.statBlock}>
              <span className={`${styles.statPrice} ${isPositive(selectedChange) ? styles.textUp : styles.textDown}`}>
                {formatPriceFull(currentPrice)}
              </span>
              <span className={`${styles.statChangeBadge} ${isPositive(selectedChange) ? styles.badgeUp : styles.badgeDown}`}>
                {isPositive(selectedChange) ? '+' : ''}{selectedChange.toFixed(2)}%
              </span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statBlock}>
              <span className={styles.statLabel}>24h High</span>
              <span className={styles.statVal}>{formatPriceFull(chartStats.high)}</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statLabel}>24h Low</span>
              <span className={styles.statVal}>{formatPriceFull(chartStats.low)}</span>
            </div>
          </div>
          <div className={styles.statsBarRight}>
            <div className={styles.balanceDisplay}>
              <span className={styles.balanceLabel}>Wallet</span>
              <span className={styles.balanceAmount}>
                {loading ? '...' : `₦${balance.toLocaleString('en-NG')}`}
              </span>
            </div>
            <button className={styles.withdrawBtn} onClick={() => navigate('/withdraw')}>
              Withdraw →
            </button>
          </div>
        </div>

        {/* TERMINAL GRID */}
        <div className={styles.terminal}>

          {/* WATCHLIST (left) */}
          <div className={styles.watchlist}>
            <div className={styles.watchlistSearch}>
              <input
                type="text"
                placeholder="Search market..."
                value={watchlistSearch}
                onChange={e => setWatchlistSearch(e.target.value)}
              />
            </div>
            <div className={styles.watchlistHeader}>
              <span>Pair</span>
              <span>Price / 24h</span>
            </div>
            <div className={styles.watchlistBody}>
              {filteredAssets.map(asset => {
                const change = getPriceChange(asset.symbol)
                return (
                  <div
                    key={asset.symbol}
                    className={`${styles.watchRow} ${selectedAsset === asset.symbol ? styles.watchRowActive : ''}`}
                    onClick={() => handleAssetSelect(asset.symbol)}
                  >
                    <div className={styles.watchLeft}>
                      <span className={styles.watchSymbol}>{asset.symbol}</span>
                      <span className={styles.watchName}>{asset.name}</span>
                    </div>
                    <div className={styles.watchRight}>
                      <span className={styles.watchPrice}>
                        {pricesLoading ? '...' : formatPrice(prices[asset.symbol])}
                      </span>
                      <span className={`${styles.watchChange} ${isPositive(change) ? styles.textUp : styles.textDown}`}>
                        {isPositive(change) ? '+' : ''}{change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CHART (center) */}
          <div className={styles.chartPanel}>
            <div className={styles.chartHeader}>
              <div className={styles.chartTimeButtons}>
                {TIME_RANGES.map(range => (
                  <button
                    key={range}
                    className={`${styles.timeBtn} ${timeRange === range ? styles.timeActive : ''}`}
                    onClick={() => setTimeRange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <div className={styles.chartLegend}>
                <span className={`${styles.legendDot} ${isPositive(selectedChange) ? styles.dotUp : styles.dotDown}`}></span>
                {selectedAsset}/NGN · OHLC
              </div>
            </div>

            <div className={styles.chartContainer} ref={chartWrapRef}>
              {candlesLoading ? (
                <div className={styles.chartLoading}>Loading candles...</div>
              ) : (
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                  preserveAspectRatio="none"
                  className={styles.chartSvg}
                  onMouseMove={handleChartMouseMove}
                  onMouseLeave={handleChartMouseLeave}
                >
                  {/* grid lines + price labels */}
                  {candleGeometry.gridLines.map((g, i) => (
                    <g key={i}>
                      <line x1="0" y1={g.y} x2={CHART_W} y2={g.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <text x={CHART_W - 6} y={g.y - 4} textAnchor="end" fontSize="9" fill="rgba(122,144,184,0.7)">
                        {formatPriceFull(g.val)}
                      </text>
                    </g>
                  ))}

                  {/* candles */}
                  {candleGeometry.bars.map(bar => (
                    <g key={bar.index} opacity={hoverCandle && hoverCandle.index !== bar.index ? 0.55 : 1}>
                      <line
                        x1={bar.xCenter}
                        x2={bar.xCenter}
                        y1={bar.yHigh}
                        y2={bar.yLow}
                        stroke={bar.up ? '#4ade80' : '#f87171'}
                        strokeWidth="1"
                      />
                      <rect
                        x={bar.xCenter - bar.bodyWidth / 2}
                        y={bar.bodyTop}
                        width={bar.bodyWidth}
                        height={bar.bodyHeight}
                        fill={bar.up ? '#4ade80' : '#f87171'}
                        rx="0.5"
                      />
                    </g>
                  ))}

                  {/* crosshair */}
                  {hoverCandle && (
                    <line
                      x1={hoverCandle.xCenter}
                      x2={hoverCandle.xCenter}
                      y1="0"
                      y2={CHART_H}
                      stroke="rgba(96,165,250,0.35)"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                  )}
                </svg>
              )}

              {/* HOVER TOOLTIP */}
              {hoverCandle && (
                <div className={styles.candleTooltip}>
                  <div className={styles.tooltipTime}>
                    {new Date(hoverCandle.time).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className={styles.tooltipRow}>
                    <span>O</span><span>{formatPriceFull(hoverCandle.open)}</span>
                  </div>
                  <div className={styles.tooltipRow}>
                    <span>H</span><span>{formatPriceFull(hoverCandle.high)}</span>
                  </div>
                  <div className={styles.tooltipRow}>
                    <span>L</span><span>{formatPriceFull(hoverCandle.low)}</span>
                  </div>
                  <div className={styles.tooltipRow}>
                    <span>C</span>
                    <span className={hoverCandle.up ? styles.textUp : styles.textDown}>
                      {formatPriceFull(hoverCandle.close)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ORDER BOOK + TRADE TICKET (right) */}
          <div className={styles.rightRail}>

            {/* ORDER BOOK */}
            <div className={styles.orderBook}>
              <div className={styles.railHeader}>Order Book</div>
              <div className={styles.orderBookHeader}>
                <span>Price</span>
                <span>Amount</span>
                <span>Total</span>
              </div>
              <div className={styles.orderBookAsks}>
                {orderBook.asks.slice().reverse().map((ask, i) => (
                  <div key={`ask-${i}`} className={styles.orderBookRow}>
                    <span className={styles.askPrice}>{formatPriceFull(ask.price)}</span>
                    <span>{ask.amount}</span>
                    <span className={styles.obTotal}>{formatPriceFull(ask.total)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.orderBookSpread}>
                <span className={isPositive(selectedChange) ? styles.textUp : styles.textDown}>
                  {formatPriceFull(currentPrice)}
                </span>
                <span className={styles.spreadLabel}>Last price</span>
              </div>
              <div className={styles.orderBookBids}>
                {orderBook.bids.map((bid, i) => (
                  <div key={`bid-${i}`} className={styles.orderBookRow}>
                    <span className={styles.bidPrice}>{formatPriceFull(bid.price)}</span>
                    <span>{bid.amount}</span>
                    <span className={styles.obTotal}>{formatPriceFull(bid.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TRADE TICKET */}
            <div className={styles.tradePanel}>
              <div className={styles.tradeTabs}>
                <button
                  className={`${styles.tradeTab} ${tradeType === 'buy' ? styles.tabBuy : ''}`}
                  onClick={() => setTradeType('buy')}
                >
                  Buy
                </button>
                <button
                  className={`${styles.tradeTab} ${tradeType === 'sell' ? styles.tabSell : ''}`}
                  onClick={() => setTradeType('sell')}
                >
                  Sell
                </button>
              </div>

              <div className={styles.tradeForm}>
                <div className={styles.priceDisplay}>
                  <span className={styles.priceLabel}>Price</span>
                  <span className={styles.priceValue}>{formatPriceFull(currentPrice)}</span>
                </div>

                <div className={styles.formGroup}>
                  <label>Amount ({selectedAsset})</label>
                  <div className={styles.amountInputWrap}>
                    <input
                      type="number"
                      className={styles.amountInput}
                      placeholder="0.00"
                      value={amount}
                      onChange={handleAmountChange}
                      min="0"
                      step="0.001"
                    />
                    <div className={styles.quickAmounts}>
                      <button className={styles.quickBtn} onClick={() => setAmount('0.01')}>0.01</button>
                      <button className={styles.quickBtn} onClick={() => setAmount('0.05')}>0.05</button>
                      <button className={styles.quickBtn} onClick={() => setAmount('0.1')}>0.1</button>
                      <button className={styles.quickBtn} onClick={() => setAmount('0.5')}>0.5</button>
                      <button className={styles.quickBtn} onClick={() => setAmount('1')}>1</button>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Total (NGN)</label>
                  <div className={styles.totalDisplay}>
                    {total > 0 ? `₦${total.toLocaleString('en-NG')}` : '₦0.00'}
                  </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <button
                  className={`${styles.tradeBtn} ${tradeType === 'buy' ? styles.buyBtn : styles.sellBtn}`}
                  onClick={handleTrade}
                  disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                >
                  {isSubmitting ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedAsset}`}
                </button>

                <div className={styles.balanceInfo}>
                  Balance: {assetBalances[selectedAsset] || 0} {selectedAsset}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT TRADES STRIP */}
        <div className={styles.tradeHistory}>
          <div className={styles.railHeader}>Market Trades</div>
          <div className={styles.tradeHistoryHeader}>
            <span>Price (NGN)</span>
            <span>Amount</span>
            <span>Time</span>
          </div>
          <div className={styles.tradeHistoryBody}>
            {recentTrades.map((trade, i) => (
              <div key={i} className={styles.tradeHistoryRow}>
                <span className={trade.type === 'buy' ? styles.buyColor : styles.sellColor}>
                  {formatPriceFull(trade.price)}
                </span>
                <span>{trade.amount}</span>
                <span className={styles.tradeTime}>{trade.time}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}

export default Crypto