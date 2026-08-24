import React from 'react';

export default function Sidebar({ activeView, setActiveView, isMobileOpen, onCloseMobile }) {
  const handleNav = (view) => {
    setActiveView(view);
    if (onCloseMobile) onCloseMobile();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToAnchor = (anchorId) => {
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (onCloseMobile) onCloseMobile();
    }
  };

  return (
    <aside id="sidebar" className={isMobileOpen ? 'open' : ''}>
      <div className="sidebar-group">
        <div className="sidebar-heading">Empezando</div>
        <ul className="sidebar-menu">
          <li>
            <button 
              className={`sidebar-btn ${activeView === 'home' ? 'active' : ''}`}
              onClick={() => handleNav('home')}
            >
              <span>🏠 1. Inicio & Arquitectura</span>
            </button>
          </li>
          {activeView === 'home' && (
            <ul className="sidebar-sub-menu">
              <li>
                <a href="#section-home-stack" onClick={(e) => { e.preventDefault(); scrollToAnchor('section-home-stack'); }} className="sidebar-sub-link">
                  Stack Tecnológico
                </a>
              </li>
              <li>
                <a href="#section-home-flow" onClick={(e) => { e.preventDefault(); scrollToAnchor('section-home-flow'); }} className="sidebar-sub-link">
                  Ciclo de Petición HTTP
                </a>
              </li>
              <li>
                <a href="#section-home-orm" onClick={(e) => { e.preventDefault(); scrollToAnchor('section-home-orm'); }} className="sidebar-sub-link">
                  Patrones de MikroORM
                </a>
              </li>
            </ul>
          )}
        </ul>
      </div>

      <div className="sidebar-group">
        <div className="sidebar-heading">JavaScript & Node.js</div>
        <ul className="sidebar-menu">
          <li>
            <button
              className={`sidebar-btn ${activeView === 'asincronias' ? 'active' : ''}`}
              onClick={() => handleNav('asincronias')}
            >
              <span>🔄 Asincronía en Node.js</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
            {activeView === 'asincronias' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#async-sinc-vs-asinc" onClick={(e) => { e.preventDefault(); scrollToAnchor('async-sinc-vs-asinc'); }} className="sidebar-sub-link">⚡ Síncrono vs Asíncrono</a></li>
                <li><a href="#async-event-loop" onClick={(e) => { e.preventDefault(); scrollToAnchor('async-event-loop'); }} className="sidebar-sub-link">🔄 El Event Loop</a></li>
                <li><a href="#async-callbacks" onClick={(e) => { e.preventDefault(); scrollToAnchor('async-callbacks'); }} className="sidebar-sub-link">📞 Callbacks</a></li>
                <li><a href="#async-promesas" onClick={(e) => { e.preventDefault(); scrollToAnchor('async-promesas'); }} className="sidebar-sub-link">🤝 Promesas (Promises)</a></li>
                <li><a href="#async-async-await" onClick={(e) => { e.preventDefault(); scrollToAnchor('async-async-await'); }} className="sidebar-sub-link">✨ Async / Await</a></li>
                <li><a href="#async-try-catch" onClick={(e) => { e.preventDefault(); scrollToAnchor('async-try-catch'); }} className="sidebar-sub-link">🛡️ Try / Catch / Finally</a></li>
                <li><a href="#async-errores-comunes" onClick={(e) => { e.preventDefault(); scrollToAnchor('async-errores-comunes'); }} className="sidebar-sub-link">⚠️ Errores comunes</a></li>
                <li><a href="#async-cheatsheet" onClick={(e) => { e.preventDefault(); scrollToAnchor('async-cheatsheet'); }} className="sidebar-sub-link">📋 Cheatsheet</a></li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      <div className="sidebar-group">
        <div className="sidebar-heading">Infraestructura y Middlewares</div>
        <ul className="sidebar-menu">
          <li>
            <button 
              className={`sidebar-btn ${activeView === 'middlewares' ? 'active' : ''}`}
              onClick={() => handleNav('middlewares')}
            >
              <span>🧩 Middlewares Externos</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
            {activeView === 'middlewares' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#mw-cors" onClick={(e) => { e.preventDefault(); scrollToAnchor('mw-cors'); }} className="sidebar-sub-link">🌐 cors</a></li>
                <li><a href="#mw-cookie-parser" onClick={(e) => { e.preventDefault(); scrollToAnchor('mw-cookie-parser'); }} className="sidebar-sub-link">🍪 cookie-parser</a></li>
                <li><a href="#mw-express-json" onClick={(e) => { e.preventDefault(); scrollToAnchor('mw-express-json'); }} className="sidebar-sub-link">📦 express.json/urlencoded</a></li>
                <li><a href="#mw-dotenv" onClick={(e) => { e.preventDefault(); scrollToAnchor('mw-dotenv'); }} className="sidebar-sub-link">⚙️ dotenv</a></li>
                <li><a href="#mw-jwt" onClick={(e) => { e.preventDefault(); scrollToAnchor('mw-jwt'); }} className="sidebar-sub-link">🔑 jsonwebtoken</a></li>
                <li><a href="#mw-bcrypt" onClick={(e) => { e.preventDefault(); scrollToAnchor('mw-bcrypt'); }} className="sidebar-sub-link">🔒 bcryptjs</a></li>
                <li><a href="#mw-reflect" onClick={(e) => { e.preventDefault(); scrollToAnchor('mw-reflect'); }} className="sidebar-sub-link">🔮 reflect-metadata</a></li>
                <li><a href="#mw-request-context" onClick={(e) => { e.preventDefault(); scrollToAnchor('mw-request-context'); }} className="sidebar-sub-link">🗃️ RequestContext</a></li>
                <li><a href="#mw-order" onClick={(e) => { e.preventDefault(); scrollToAnchor('mw-order'); }} className="sidebar-sub-link">📋 Orden de Ejecución</a></li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      <div className="sidebar-group">
        <div className="sidebar-heading">Archivos Clave del Proyecto</div>
        <ul className="sidebar-menu">
          <li>
            <button
              className={`sidebar-btn ${activeView === 'app-ts' ? 'active' : ''}`}
              onClick={() => handleNav('app-ts')}
            >
              <span>🗂️ app.ts</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
            {activeView === 'app-ts' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#appts-full" onClick={(e) => { e.preventDefault(); scrollToAnchor('appts-full'); }} className="sidebar-sub-link">Código completo</a></li>
                <li><a href="#appts-instance" onClick={(e) => { e.preventDefault(); scrollToAnchor('appts-instance'); }} className="sidebar-sub-link">express() — La instancia</a></li>
                <li><a href="#appts-middlewares" onClick={(e) => { e.preventDefault(); scrollToAnchor('appts-middlewares'); }} className="sidebar-sub-link">Cadena de Middlewares</a></li>
                <li><a href="#appts-legacy" onClick={(e) => { e.preventDefault(); scrollToAnchor('appts-legacy'); }} className="sidebar-sub-link">Router Legacy</a></li>
                <li><a href="#appts-api" onClick={(e) => { e.preventDefault(); scrollToAnchor('appts-api'); }} className="sidebar-sub-link">Montaje de Rutas API</a></li>
                <li><a href="#appts-errors" onClick={(e) => { e.preventDefault(); scrollToAnchor('appts-errors'); }} className="sidebar-sub-link">Manejo de Errores</a></li>
                <li><a href="#appts-export" onClick={(e) => { e.preventDefault(); scrollToAnchor('appts-export'); }} className="sidebar-sub-link">Exportación del Módulo</a></li>
              </ul>
            )}
          </li>

          <li>
            <button
              className={`sidebar-btn ${activeView === 'metahumano-entity' ? 'active' : ''}`}
              onClick={() => handleNav('metahumano-entity')}
            >
              <span>🧬 metahumano.entity</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
            {activeView === 'metahumano-entity' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#entity-full" onClick={(e) => { e.preventDefault(); scrollToAnchor('entity-full'); }} className="sidebar-sub-link">Código completo</a></li>
                <li><a href="#entity-base" onClick={(e) => { e.preventDefault(); scrollToAnchor('entity-base'); }} className="sidebar-sub-link">BaseEntity</a></li>
                <li><a href="#entity-decorators" onClick={(e) => { e.preventDefault(); scrollToAnchor('entity-decorators'); }} className="sidebar-sub-link">Decoradores MikroORM</a></li>
                <li><a href="#entity-sti" onClick={(e) => { e.preventDefault(); scrollToAnchor('entity-sti'); }} className="sidebar-sub-link">Herencia STI</a></li>
                <li><a href="#entity-relations" onClick={(e) => { e.preventDefault(); scrollToAnchor('entity-relations'); }} className="sidebar-sub-link">Relaciones (1:1, 1:N, M:N)</a></li>
                <li><a href="#entity-getter" onClick={(e) => { e.preventDefault(); scrollToAnchor('entity-getter'); }} className="sidebar-sub-link">Getter tipoMeta</a></li>
              </ul>
            )}
          </li>

          <li>
            <button
              className={`sidebar-btn ${activeView === 'metahumano-routes' ? 'active' : ''}`}
              onClick={() => handleNav('metahumano-routes')}
            >
              <span>🛣️ metahumano.routes</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
            {activeView === 'metahumano-routes' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#routes-full" onClick={(e) => { e.preventDefault(); scrollToAnchor('routes-full'); }} className="sidebar-sub-link">Código completo</a></li>
                <li><a href="#routes-table" onClick={(e) => { e.preventDefault(); scrollToAnchor('routes-table'); }} className="sidebar-sub-link">Mapa visual de rutas</a></li>
                <li><a href="#routes-chain" onClick={(e) => { e.preventDefault(); scrollToAnchor('routes-chain'); }} className="sidebar-sub-link">Cadena de Middlewares</a></li>
                <li><a href="#routes-order" onClick={(e) => { e.preventDefault(); scrollToAnchor('routes-order'); }} className="sidebar-sub-link">Orden de Rutas</a></li>
                <li><a href="#routes-design" onClick={(e) => { e.preventDefault(); scrollToAnchor('routes-design'); }} className="sidebar-sub-link">Decisiones de Diseño</a></li>
                <li><a href="#routes-router" onClick={(e) => { e.preventDefault(); scrollToAnchor('routes-router'); }} className="sidebar-sub-link">express.Router()</a></li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      <div className="sidebar-group">
        <div className="sidebar-heading">Controladores Backend</div>
        <ul className="sidebar-menu">
          <li>
            <button 
              className={`sidebar-btn ${activeView === 'metahumano-controller' ? 'active' : ''}`}
              onClick={() => handleNav('metahumano-controller')}
            >
              <span>⚡ metahumano.controller</span>
              <span className="status-badge status-ready">Activo</span>
            </button>
            {activeView === 'metahumano-controller' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#sec-imports" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-imports'); }} className="sidebar-sub-link">1. Dependencias & Imports</a></li>
                <li><a href="#sec-em" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-em'); }} className="sidebar-sub-link">2. EntityManager (em)</a></li>
                <li><a href="#sec-sanitize" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-sanitize'); }} className="sidebar-sub-link">3. sanitizeMetahumanoInput</a></li>
                <li><a href="#sec-registro" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-registro'); }} className="sidebar-sub-link">4. crearPerfilMetahumano</a></li>
                <li><a href="#sec-crud" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-crud'); }} className="sidebar-sub-link">5. Operaciones CRUD</a></li>
                <li><a href="#sec-poderes" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-poderes'); }} className="sidebar-sub-link">6. actualizarPoderes</a></li>
                <li><a href="#sec-notificaciones" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-notificaciones'); }} className="sidebar-sub-link">7. notificaciones</a></li>
                <li><a href="#sec-estilo" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-estilo'); }} className="sidebar-sub-link">8. definirEstiloVida</a></li>
                <li><a href="#sec-routes" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-routes'); }} className="sidebar-sub-link">9. Rutas & Middlewares</a></li>
                <li><a href="#sec-summary" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-summary'); }} className="sidebar-sub-link">10. Códigos HTTP</a></li>
                <li><a href="#sec-tester" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-tester'); }} className="sidebar-sub-link">11. 🧪 Simulador de API</a></li>
                <li><a href="#sec-quiz" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-quiz'); }} className="sidebar-sub-link">12. 📝 Quiz de Estudio</a></li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      <div className="sidebar-group">
        <div className="sidebar-heading">Próximos Módulos</div>
        <ul className="sidebar-menu">
          <li>
            <button className="sidebar-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              <span>🔒 usuario.controller</span>
              <span className="status-badge status-soon">Pronto</span>
            </button>
          </li>
          <li>
            <button className="sidebar-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              <span>🔒 burocrata.controller</span>
              <span className="status-badge status-soon">Pronto</span>
            </button>
          </li>
          <li>
            <button className="sidebar-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              <span>🔒 multa.controller</span>
              <span className="status-badge status-soon">Pronto</span>
            </button>
          </li>
          <li>
            <button className="sidebar-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              <span>🔒 carpeta.controller</span>
              <span className="status-badge status-soon">Pronto</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
