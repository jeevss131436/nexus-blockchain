import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cryptoData, setCryptoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  
  // Popular cryptocurrencies for autocomplete
  const popularCryptos = [
    'bitcoin', 'ethereum', 'tether', 'binancecoin', 'ripple', 'cardano',
    'solana', 'polkadot', 'dogecoin', 'avalanche', 'chainlink', 'litecoin',
    'uniswap', 'stellar', 'vechain', 'filecoin', 'tron', 'cosmos',
    'ethereum-classic', 'monero', 'eos', 'aave', 'maker', 'compound',
    'algorand', 'tezos', 'dash', 'zcash', 'decentraland', 'fantom'
  ];

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('cryptoSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('cryptoSearchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('cryptoWatchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem('cryptoWatchlist', JSON.stringify(watchlist));
    }
  }, [watchlist]);

  // Filter suggestions based on search term
  const filteredSuggestions = popularCryptos.filter(crypto =>
    crypto.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm.length > 0
  ).slice(0, 8);

  const addToHistory = (coinName) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== coinName);
      return [coinName, ...filtered].slice(0, 6);
    });
  };

  const addToCompare = (crypto) => {
    if (compareList.length < 4 && !compareList.some(item => item.name === crypto.name)) {
      setCompareList(prev => [...prev, crypto]);
    }
  };

  const removeFromCompare = (cryptoName) => {
    setCompareList(prev => prev.filter(item => item.name !== cryptoName));
  };

  const clearComparison = () => {
    setCompareList([]);
  };

  const fetchCryptoData = async (coinName = searchTerm) => {
    const searchQuery = coinName || searchTerm;
    
    if (!searchQuery.trim()) {
      setError('Please enter a cryptocurrency name');
      return;
    }

    setError('');
    setCryptoData(null);
    setLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch(`http://localhost:5000/crypto/${searchQuery.toLowerCase()}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setCryptoData(data);
        addToHistory(searchQuery.toLowerCase());
        setSearchTerm('');
      }
    } catch (err) {
      setError('Failed to fetch data. Make sure your Flask backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchCryptoData();
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (crypto) => {
    setSearchTerm(crypto);
    setShowSuggestions(false);
    fetchCryptoData(crypto);
  };

  const handleHistoryClick = (crypto) => {
    fetchCryptoData(crypto);
  };

  const addToWatchlist = (crypto) => {
    if (!watchlist.some(item => item.name.toLowerCase() === crypto.name.toLowerCase())) {
      setWatchlist(prev => [...prev, crypto]);
    }
  };

  const removeFromWatchlist = (cryptoName) => {
    setWatchlist(prev => prev.filter(item => item.name.toLowerCase() !== cryptoName.toLowerCase()));
  };

  const isInWatchlist = (cryptoName) => {
    return watchlist.some(item => item.name.toLowerCase() === cryptoName.toLowerCase());
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header Section */}
        <header className="header">
          <h1 className="title">
            <span className="gradient-text">Nexus</span> BlockChain
          </h1>
          <p className="subtitle">Real-time cryptocurrency data at your fingertips</p>
        </header>

        {/* Search and History Wrapper */}
        <div style={{display: 'flex', flexDirection: 'column'}}>
          {/* Search Section with Autocomplete */}
          <div className="search-container">
            <div className="search-wrapper">
              <input 
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Enter cryptocurrency"
                className="search-input"
              />
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {filteredSuggestions.map((crypto, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(crypto)}
                    >
                      <span className="suggestion-icon">🪙</span>
                      {crypto}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button onClick={() => fetchCryptoData()} className="search-button" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <span>🔍 Search</span>
              )}
            </button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="history-container">
              <p className="history-label">Recent Searches:</p>
              <div className="history-chips">
                {searchHistory.map((crypto, index) => (
                  <button
                    key={index}
                    className="history-chip"
                    onClick={() => handleHistoryClick(crypto)}
                  >
                    {crypto}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Watchlist Display */}
        {watchlist.length > 0 && (
          <div className="watchlist-section">
            <h2 className="watchlist-title">⭐ My Watchlist</h2>
            <div className="watchlist-list">
              {watchlist.map((crypto, index) => (
                <button 
                  key={index} 
                  className="watchlist-item"
                  onClick={() => fetchCryptoData( crypto.name.toLowerCase())}
                >
                  <div className="watchlist-item-left">
                    <span className="watchlist-item-name">{crypto.name}</span>
                    <span className="watchlist-item-symbol">{crypto.symbol}</span>
                  </div>
                  
                  <div className="watchlist-item-center">
                    <span className="watchlist-item-price">
                      ${crypto.current_price?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                    <span className={`watchlist-item-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                      {crypto.price_change_percentage_24h >= 0 ? '↑' : '↓'} 
                      {Math.abs(crypto.price_change_percentage_24h)?.toFixed(2)}%
                    </span>
                  </div>
                  
                  <button 
                    className="watchlist-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(crypto.name);
                    }}
                  >
                    ✕
                  </button>
                </button>
              ))}
            </div>
          </div>
)}  

        {/* Comparison View */}
        {compareList.length > 0 && (
          <div className="compare-section">
            <div className="compare-header">
              <h2 className="compare-title">📊 Comparison View</h2>
              <button className="clear-compare-btn" onClick={clearComparison}>
                Clear All
              </button>
            </div>
            
            <div className="compare-grid">
              {compareList.map((crypto, index) => (
                <div key={index} className="compare-card">
                  <button 
                    className="compare-remove-btn"
                    onClick={() => removeFromCompare(crypto.name)}
                  >
                    ✕
                  </button>
                  
                  <h3 className="compare-crypto-name">{crypto.name}</h3>
                  <span className="compare-symbol">{crypto.symbol}</span>
                  
                  <div className="compare-price">
                    ${crypto.current_price?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  
                  <div className={`compare-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                    {crypto.price_change_percentage_24h >= 0 ? '↑' : '↓'} 
                    {Math.abs(crypto.price_change_percentage_24h)?.toFixed(2)}% (24h)
                  </div>
                  
                  <div className="compare-stats">
                    <div className="compare-stat">
                      <span className="compare-stat-label">Market Cap</span>
                      <span className="compare-stat-value">${(crypto.market_cap / 1e9).toFixed(2)}B</span>
                    </div>
                    <div className="compare-stat">
                      <span className="compare-stat-label">Volume</span>
                      <span className="compare-stat-value">${(crypto.volume / 1e9).toFixed(2)}B</span>
                    </div>
                    <div className="compare-stat">
                      <span className="compare-stat-label">24h High</span>
                      <span className="compare-stat-value">${crypto.high_24h?.toLocaleString()}</span>
                    </div>
                    <div className="compare-stat">
                      <span className="compare-stat-label">24h Low</span>
                      <span className="compare-stat-value">${crypto.low_24h?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}





        

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Crypto Data Display */}
        {cryptoData && (
          <div className="crypto-card">
            {/* Header Info */}
            <div className="crypto-header">
              <div>
                <h2 className="crypto-name">{cryptoData.name}</h2>
                <span className="crypto-symbol">{cryptoData.symbol}</span>
              </div>
              <div className="crypto-price">
                ${cryptoData.current_price?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>

            {/* 24h Change Badge */}
            <div className={`change-badge ${cryptoData.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
              {cryptoData.price_change_percentage_24h >= 0 ? '↑' : '↓'} 
              {Math.abs(cryptoData.price_change_percentage_24h)?.toFixed(2)}% (24h)
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Market Cap</div>
                <div className="stat-value">${(cryptoData.market_cap / 1e9).toFixed(2)}B</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">24h Volume</div>
                <div className="stat-value">${(cryptoData.volume / 1e9).toFixed(2)}B</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">24h High</div>
                <div className="stat-value">${cryptoData.high_24h?.toLocaleString()}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">24h Low</div>
                <div className="stat-value">${cryptoData.low_24h?.toLocaleString()}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">All-Time High</div>
                <div className="stat-value">${cryptoData.ath?.toLocaleString()}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">All-Time Low</div>
                <div className="stat-value">${cryptoData.atl?.toLocaleString()}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Circulating Supply</div>
                <div className="stat-value">{(cryptoData.circulating_supply / 1e6).toFixed(2)}M</div>
              </div>

              {cryptoData.max_supply && (
                <div className="stat-card">
                  <div className="stat-label">Max Supply</div>
                  <div className="stat-value">{(cryptoData.max_supply / 1e6).toFixed(2)}M</div>
                </div>
              )}
            </div>

            {/* Watchlist and Compare Buttons */}
            <div style={{textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '12px', justifyContent: 'center'}}>
              {isInWatchlist(cryptoData.name) ? (
                <button 
                  className="watchlist-button remove"
                  onClick={() => removeFromWatchlist(cryptoData.name)}
                >
                  ❌ Remove from Watchlist
                </button>
              ) : (
                <button 
                  className="watchlist-button add"
                  onClick={() => addToWatchlist(cryptoData)}
                >
                  ⭐ Add to Watchlist
                </button>
              )}
              
              {compareList.length < 4 && !compareList.some(item => item.name === cryptoData.name) && (
                <button 
                  className="compare-button"
                  onClick={() => addToCompare(cryptoData)}
                >
                  📊 Add to Compare
                </button>
              )}
            </div>

            {/* Last Updated */}
            <div className="last-updated">
              Last updated: {new Date(cryptoData.last_updated).toLocaleString()}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!cryptoData && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>Search for any cryptocurrency to view real-time data</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App