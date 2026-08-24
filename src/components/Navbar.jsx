import React from 'react';

export default function Navbar({ activeView, setActiveView, theme, setTheme, onToggleMobileMenu, searchQuery, setSearchQuery }) {
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('sg_docs_theme', newTheme);
  };

  return (
    <header id="top-header">
      <div className="header-container">
        <div className="brand-section">
          <button className="mobile-menu-btn" onClick={onToggleMobileMenu} aria-label="Abrir menú">☰</button>
          <div className="logo-link" onClick={() => setActiveView('home')}>
            <span className="logo-express">express<span className="dot">.js</span></span>
            <span className="logo-tag">SuperGestor React</span>
            <span className="logo-sub">Backend Learning Portal</span>
          </div>
        </div>

        <nav className="header-nav">
          <ul className="nav-links">
            <li>
              <button 
                className={activeView === 'home' ? 'active' : ''} 
                onClick={() => setActiveView('home')}
              >
                Inicio
              </button>
            </li>
            <li>
              <button 
                className={activeView === 'metahumano-controller' ? 'active' : ''} 
                onClick={() => setActiveView('metahumano-controller')}
              >
                Controlador Metahumano
              </button>
            </li>
            <li>
              <a href="https://expressjs.com/" target="_blank" rel="noopener noreferrer">Express Docs ↗</a>
            </li>
            <li>
              <a href="https://mikro-orm.io/docs/" target="_blank" rel="noopener noreferrer">MikroORM Docs ↗</a>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar en la guía..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Alternar tema">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}
