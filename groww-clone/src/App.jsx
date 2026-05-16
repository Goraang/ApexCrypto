import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './AuthContext'; // Added Auth Imports
import LoginPage from './LoginPage';                   // Added Login Import
import './App.css';

// ── Data ────────────────────────────────────────────────────────────────────

const COINS = [
  { sym: 'BTC', pair: 'BTCUSDT', color: '#f7931a', base: 104200, vol: 72 },
  { sym: 'ETH', pair: 'ETHUSDT', color: '#627eea', base: 3820,   vol: 58 },
  { sym: 'SOL', pair: 'SOLUSDT', color: '#9945ff', base: 178,    vol: 65 },
  { sym: 'DOGE',pair: 'DOGEUSDT',color: '#c2a633', base: 0.185,  vol: 81 },
  { sym: 'BNB', pair: 'BNBUSDT', color: '#f3ba2f', base: 612,    vol: 44 },
  { sym: 'XRP', pair: 'XRPUSDT', color: '#00aae4', base: 2.31,   vol: 69 },
  { sym: 'ADA', pair: 'ADAUSDT', color: '#0d67f8', base: 0.86,   vol: 52 },
  { sym: 'AVAX',pair: 'AVAXUSDT',color: '#e84142', base: 37.4,   vol: 61 },
];

const NEWS = [
  { tag: 'BULLISH',    type: 'bull',    headline: 'Bitcoin breaks $104K resistance — analysts eye $110K target as institutional demand surges',         src: 'CoinDesk',      time: '3m ago',  impact: 'HIGH', impactColor: '#10b981' },
  { tag: 'BEARISH',    type: 'bear',    headline: 'Fed minutes hint at prolonged high rates, crypto markets facing potential liquidity squeeze',          src: 'Reuters',       time: '11m ago', impact: 'HIGH', impactColor: '#ef4444' },
  { tag: 'NEUTRAL',    type: 'neutral', headline: 'Ethereum Layer-2 transaction volume hits all-time high, Arbitrum leads with 40% market share',        src: 'The Block',     time: '28m ago', impact: 'MED',  impactColor: '#f59e0b' },
  { tag: 'REGULATORY', type: 'reg',     headline: 'EU MiCA framework enters enforcement phase — exchanges given 6-month compliance window',               src: 'CoinTelegraph', time: '1h ago',  impact: 'MED',  impactColor: '#f59e0b' },
  { tag: 'BULLISH',    type: 'bull',    headline: 'Solana DeFi TVL surpasses $18B for first time, new DEX protocols driving record activity',            src: 'DeFiLlama',     time: '1h ago',  impact: 'MED',  impactColor: '#10b981' },
  { tag: 'BULLISH',    type: 'bull',    headline: 'BlackRock Bitcoin ETF records $800M single-day inflow — largest since January launch',                src: 'Bloomberg',     time: '2h ago',  impact: 'HIGH', impactColor: '#10b981' },
  { tag: 'BEARISH',    type: 'bear',    headline: 'On-chain data shows long-term holders distributing BTC near all-time highs — caution advised',        src: 'Glassnode',     time: '3h ago',  impact: 'MED',  impactColor: '#ef4444' },
  { tag: 'NEUTRAL',    type: 'neutral', headline: 'XRP legal clarity boosts Ripple institutional partnerships — 12 new banks onboarded Q1',              src: 'Ripple Blog',   time: '4h ago',  impact: 'LOW',  impactColor: '#6b7280' },
  { tag: 'REGULATORY', type: 'reg',     headline: 'India proposes 15% flat tax on crypto gains under new digital asset framework for FY2026',            src: 'Economic Times',time: '5h ago',  impact: 'MED',  impactColor: '#f59e0b' },
];

const TICKER_ITEMS = [
  { label: 'BTC/USDT',   val: '$104,287', chg: '+2.41%', up: true  },
  { label: 'ETH/USDT',   val: '$3,821',   chg: '+1.87%', up: true  },
  { label: 'SOL/USDT',   val: '$178.4',   chg: '+3.12%', up: true  },
  { label: 'DOGE/USDT',  val: '$0.1852',  chg: '-0.93%', up: false },
  { label: 'BNB/USDT',   val: '$612.3',   chg: '+0.44%', up: true  },
  { label: 'XRP/USDT',   val: '$2.311',   chg: '+1.22%', up: true  },
  { label: 'ADA/USDT',   val: '$0.862',   chg: '-1.44%', up: false },
  { label: 'AVAX/USDT',  val: '$37.42',   chg: '+2.87%', up: true  },
  { label: 'MATIC/USDT', val: '$0.541',   chg: '-2.11%', up: false },
  { label: 'LINK/USDT',  val: '$14.87',   chg: '+1.63%', up: true  },
  { label: 'DOT/USDT',   val: '$6.92',    chg: '+0.77%', up: true  },
  { label: 'UNI/USDT',   val: '$8.34',    chg: '-0.38%', up: false },
];

const MSTATS = [
  { label: 'TOTAL MCAP',    val: '$3.42T', sub: '+1.8% 24h',    subColor: '#10b981' },
  { label: '24H VOLUME',    val: '$182B',  sub: '↑ Above avg',  subColor: '#10b981' },
  { label: 'BTC DOMINANCE', val: '54.2%',  sub: '-0.3% shift',  subColor: '#ef4444' },
  { label: 'DEFI TVL',      val: '$118B',  sub: '+2.1% week',   subColor: '#10b981' },
  { label: 'FEAR & GREED',  val: '61',     sub: 'GREED zone',   subColor: '#f59e0b' },
  { label: 'ACTIVE ADDRS',  val: '1.24M',  sub: 'BTC chain',    subColor: '#6b7280' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n, dec = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtPrice(n) {
  return n >= 1000 ? fmt(n, 2) : n >= 1 ? fmt(n, 3) : fmt(n, 5);
}

function initHistory(base) {
  const h = [];
  let p = base;
  for (let i = 0; i < 30; i++) { p = p * (1 + (Math.random() - 0.5) * 0.008); h.push(p); }
  return h;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ApexLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8L92 82H8L50 8Z" stroke="#22d3ee" strokeWidth="7" strokeLinejoin="round" />
      <path d="M33 62L50 42L67 62" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="26" r="4" fill="#22d3ee" />
    </svg>
  );
}

function SparkLine({ history, color }) {
  const vals = history.slice(-20);
  if (vals.length < 2) return null;
  const mn = Math.min(...vals), mx = Math.max(...vals), range = mx - mn || 1;
  const W = 240, H = 60;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${H - ((v - mn) / range) * (H - 4) - 2}`).join(' ');
  const gradId = `grad-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${W},${H} 0,${H}`} fill={`url(#${gradId})`} />
      <polyline points={pts} stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

function Topbar({ clock }) {
  return (
    <div className="topbar">
      <div className="brand">
        <ApexLogo size={28} />
        <span className="brand-name">Apex<span>Crypto</span></span>
      </div>
      <div className="topbar-center">
        <div className="dot-live" />
        <span className="text-muted">TERMINAL ACTIVE</span>
        <span className="divider">|</span>
        <span className="text-accent">{clock}</span>
      </div>
      <div className="topbar-right">
        <span>BTC DOMINANCE: <strong className="text-amber">54.2%</strong></span>
        <span className="divider">|</span>
        <span>FEAR INDEX: <strong className="text-green">61 GREED</strong></span>
        <div className="user-badge">GN ADMIN</div>
      </div>
    </div>
  );
}

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker-wrap">
      <span className="ticker-label">MARKETS</span>
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="ticker-item">
            <strong style={{ color: item.up ? '#10b981' : '#ef4444' }}>{item.label}</strong>
            <span className="ticker-sep">·</span>
            {item.val}
            <span className={item.up ? 'up' : 'dn'}>{item.chg}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Sidebar({ cash, invested, holdings, prices, changes, onAddSymbol }) {
  const [newSym, setNewSym] = useState('');
  const activeHoldings = Object.keys(holdings).filter(s => holdings[s] > 0);

  const handleAdd = (e) => {
    e.preventDefault();
    if (newSym.trim()) { onAddSymbol(newSym.trim()); setNewSym(''); }
  };

  return (
    <div className="sidebar">
      <div className="net-worth-block">
        <div className="nw-label">NET WORTH</div>
        <div className="nw-val">${fmt(cash + invested)}</div>
        <div className="nw-change">↑ +2.34% today</div>
      </div>

      <div className="mini-stats">
        <div className="mini-stat"><label>CASH</label><div className="val text-accent">${fmt(cash)}</div></div>
        <div className="mini-stat"><label>INVESTED</label><div className="val text-green">${fmt(invested)}</div></div>
        <div className="mini-stat"><label>P&amp;L TODAY</label><div className="val text-green">+$381</div></div>
        <div className="mini-stat"><label>POSITIONS</label><div className="val">{activeHoldings.length}</div></div>
      </div>

      <div className="sidebar-section">PORTFOLIO</div>

      {activeHoldings.length === 0
        ? <div className="no-positions">No positions yet</div>
        : activeHoldings.map(s => {
            const coin = COINS.find(c => c.pair === s) || { color: '#22d3ee', sym: s.replace('USDT', '') };
            const val = (holdings[s] * (prices[s] || 0));
            const ch = changes[s] || 0;
            return (
              <div key={s} className="holding-row">
                <div className="hr-left">
                  <div className="coin-dot" style={{ background: coin.color }} />
                  <div>
                    <div className="hr-sym">{coin.sym}</div>
                    <div className="hr-amt">{holdings[s].toFixed(4)}</div>
                  </div>
                </div>
                <div className="hr-right">
                  <div className="hr-val">${fmt(val)}</div>
                  <div className="hr-chg" style={{ color: ch >= 0 ? '#10b981' : '#ef4444' }}>
                    {ch >= 0 ? '+' : ''}{ch.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })
      }

      <form className="add-sym-form" onSubmit={handleAdd}>
        <input
          className="add-sym-input"
          value={newSym}
          onChange={e => setNewSym(e.target.value)}
          placeholder="BNBUSDT…"
        />
        <button type="submit" className="add-sym-btn">+</button>
      </form>

      <div className="sidebar-section" style={{ marginTop: 12 }}>INFO</div>
      <div className="sidebar-info">
        BUY/SELL = $500/trade<br />
        Cards scroll sideways →<br />
        Page scrolls up/down ↕
      </div>

      <div className="sidebar-footer">GORAANG NAYYAR · ADMIN</div>
    </div>
  );
}

function MarketStats() {
  return (
    <div className="market-stats">
      {MSTATS.map(s => (
        <div key={s.label} className="mstat-card">
          <div className="mstat-label">{s.label}</div>
          <div className="mstat-val">{s.val}</div>
          <div className="mstat-sub" style={{ color: s.subColor }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── CONNECTED: WebSocket AssetCard ──────────────────────────────────────────

function AssetCard({ pair, coin, holding, onBuy, onSell, onPriceUpdate }) {
  const [price, setPrice] = useState(coin.base);
  const [history, setHistory] = useState([coin.base]);
  const [change, setChange] = useState(0);

  useEffect(() => {
    // Connect to your FastAPI Python Backend
    const ws = new WebSocket(`ws://localhost:8000/ws/live/${pair.toLowerCase()}`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const newPrice = data.price;
      const newChange = ((newPrice / coin.base) - 1) * 100; // Calculate live % change
      
      setPrice(newPrice);
      setChange(newChange);
      onPriceUpdate(pair, newPrice, newChange); // Send up to parent for Net Worth

      setHistory(prev => {
        const next = [...prev, newPrice];
        if (next.length > 30) next.shift();
        return next;
      });
    };

    return () => ws.close();
  }, [pair, coin.base, onPriceUpdate]);

  const up = change >= 0;
  const color = up ? '#10b981' : '#ef4444';
  const vol = coin?.vol || 50;

  return (
    <div className={`asset-card ${up ? 'up' : 'down'}`}>
      <div className="card-top">
        <div className="coin-info">
          <div className="coin-icon" style={{ background: `${coin.color}22`, color: coin.color }}>
            {coin.sym.charAt(0)}
          </div>
          <div>
            <div className="coin-name">{coin.sym}</div>
            <div className="coin-pair">{coin.sym}/USDT</div>
          </div>
        </div>
        <div className="price-block">
          <div className="card-price" style={{ color }}>${fmtPrice(price)}</div>
          <div className="card-change" style={{ color }}>
            {up ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="vol-info">
        <span>VOL</span><span>{vol}%</span>
      </div>
      <div className="vol-bar">
        <div className="vol-fill" style={{ width: `${vol}%`, background: color }} />
      </div>

      <div className="spark-area">
        <SparkLine history={history} color={coin.color} />
      </div>

      <div className="card-bottom">
        <div className="holding-tag">
          HELD: <strong>{holding > 0 ? holding.toFixed(4) : '—'}</strong>
        </div>
        <div className="trade-btns">
          <button className="tbtn buy" onClick={() => onBuy(pair, price)}>BUY</button>
          <button className="tbtn sell" onClick={() => onSell(pair, price)}>SELL</button>
        </div>
      </div>
    </div>
  );
}

function NewsGrid() {
  const tagClass = type =>
    type === 'bull' ? 'tag-bull' : type === 'bear' ? 'tag-bear' : type === 'reg' ? 'tag-reg' : 'tag-neutral';

  return (
    <div className="news-grid">
      {NEWS.map((n, i) => (
        <div key={i} className="news-card">
          <span className={`news-tag ${tagClass(n.type)}`}>{n.tag}</span>
          <div className="news-headline">{n.headline}</div>
          <div className="news-meta">
            <span>{n.src}</span>
            <span>{n.time}</span>
          </div>
          <div className="news-impact">
            <div className="impact-dot" style={{ background: n.impactColor }} />
            <span style={{ color: n.impactColor, fontWeight: 700 }}>{n.impact} IMPACT</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CONNECTED: Terminal Component ───────────────────────────────────────────

function TerminalApp() {
  const [clock, setClock] = useState('');
  const [filter, setFilter] = useState('all');
  const [cash, setCash] = useState(10000);
  const [holdings, setHoldings] = useState({});
  const [coinList, setCoinList] = useState(COINS);
  const [watchlist, setWatchlist] = useState(COINS.map(c => c.pair));

  // Initialize central state to track Net Worth and Sidebar info
  const [prices, setPrices] = useState(() => {
    const p = {}; COINS.forEach(c => { p[c.pair] = c.base; }); return p;
  });
  const [changes, setChanges] = useState(() => {
    const ch = {}; COINS.forEach(c => { ch[c.pair] = 0; }); return ch;
  });

  // Clock
  useEffect(() => {
    const id = setInterval(() => {
      setClock(new Date().toUTCString().split(' ')[4] + ' UTC');
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Update central state from WebSocket child components
  const handlePriceUpdate = useCallback((pair, price, change) => {
    setPrices(prev => ({ ...prev, [pair]: price }));
    setChanges(prev => ({ ...prev, [pair]: change }));
  }, []);

  // Trade handler
  const trade = useCallback((pair, price, type) => {
    const amt = 500;
    if (type === 'buy' && cash >= amt) {
      setCash(c => c - amt);
      setHoldings(h => ({ ...h, [pair]: (h[pair] || 0) + (amt / price) }));
    } else if (type === 'sell') {
      const held = holdings[pair] || 0;
      const sv = held * price;
      if (sv >= amt) {
        setCash(c => c + amt);
        setHoldings(h => ({ ...h, [pair]: h[pair] - (amt / price) }));
      } else if (held > 0) {
        setCash(c => c + sv);
        setHoldings(h => ({ ...h, [pair]: 0 }));
      }
    }
  }, [cash, holdings]);

  // Add symbol
  const addSymbol = useCallback((raw) => {
    let sym = raw.toUpperCase();
    if (!sym.endsWith('USDT')) sym += 'USDT';
    if (watchlist.includes(sym)) return;
    const base = Math.random() * 500 + 0.5;
    const newCoin = { sym: sym.replace('USDT', ''), pair: sym, color: '#22d3ee', base, vol: Math.floor(Math.random() * 60 + 20) };
    
    setCoinList(prev => [...prev, newCoin]);
    setWatchlist(prev => [...prev, sym]);
    setPrices(prev => ({ ...prev, [sym]: base }));
    setChanges(prev => ({ ...prev, [sym]: 0 }));
  }, [watchlist]);

  const invested = Object.keys(holdings).reduce((t, s) => t + (holdings[s] || 0) * (prices[s] || 0), 0);

  const activePairs = watchlist.filter(pair => {
    if (filter === 'gainers') return (changes[pair] || 0) > 0;
    if (filter === 'losers')  return (changes[pair] || 0) < 0;
    if (filter === 'holdings') return (holdings[pair] || 0) > 0;
    return true;
  });

  return (
    <div className="root">
      <Topbar clock={clock} />
      <Ticker />

      <div className="main-layout">
        <Sidebar
          cash={cash}
          invested={invested}
          holdings={holdings}
          prices={prices}
          changes={changes}
          onAddSymbol={addSymbol}
        />

        <div className="content-area">
          <div className="content-header">
            <div className="ch-left">
              <h2>Market Overview</h2>
              <p>Live data · WebSocket Streams</p>
            </div>
            <div className="ch-filters">
              {['all', 'gainers', 'losers', 'holdings'].map(f => (
                <button
                  key={f}
                  className={`filter-btn${filter === f ? ' active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="scrollable-content">
            <MarketStats />

            <div className="cards-section-label">LIVE ASSETS · HORIZONTAL SCROLL →</div>
            <div className="cards-stream">
              {activePairs.map(pair => {
                const coin = coinList.find(c => c.pair === pair) || { sym: pair.replace('USDT', ''), color: '#22d3ee', vol: 50 };
                return (
                  <AssetCard
                    key={pair}
                    pair={pair}
                    coin={coin}
                    holding={holdings[pair] || 0}
                    onBuy={(p, pr) => trade(p, pr, 'buy')}
                    onSell={(p, pr) => trade(p, pr, 'sell')}
                    onPriceUpdate={handlePriceUpdate}
                  />
                );
              })}
            </div>

            <div className="news-section">
              <div className="cards-section-label" style={{ marginTop: 4, marginBottom: 12 }}>
                MARKET INTELLIGENCE · CRYPTO NEWS
              </div>
              <NewsGrid />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CONNECTED: Main App Wrapper (Auth Logic) ────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AuthManager />
    </AuthProvider>
  );
}

function AuthManager() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '20vh', fontFamily: 'system-ui' }}>Initializing Secure Terminal...</div>;
  }
  
  // Show terminal if logged in, otherwise show login page
  return user ? <TerminalApp /> : <LoginPage />;}