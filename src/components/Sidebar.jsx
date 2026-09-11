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
        <div className="sidebar-heading">Testing</div>
        <ul className="sidebar-menu">
          <li>
            <button
              className={`sidebar-btn ${activeView === 'test-autenticacion' ? 'active' : ''}`}
              onClick={() => handleNav('test-autenticacion')}
            >
              <span>🔑 Tests de Autenticación</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
            {activeView === 'test-autenticacion' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#auth-imports" onClick={(e) => { e.preventDefault(); scrollToAnchor('auth-imports'); }} className="sidebar-sub-link">1. Imports y setup</a></li>
                <li><a href="#auth-hashing" onClick={(e) => { e.preventDefault(); scrollToAnchor('auth-hashing'); }} className="sidebar-sub-link">2. bcrypt — Hashing</a></li>
                <li><a href="#auth-jwt-valid" onClick={(e) => { e.preventDefault(); scrollToAnchor('auth-jwt-valid'); }} className="sidebar-sub-link">3. JWT — Firmar & Verificar</a></li>
                <li><a href="#auth-jwt-invalid" onClick={(e) => { e.preventDefault(); scrollToAnchor('auth-jwt-invalid'); }} className="sidebar-sub-link">4. JWT — Clave incorrecta</a></li>
                <li><a href="#auth-jwt-malformed" onClick={(e) => { e.preventDefault(); scrollToAnchor('auth-jwt-malformed'); }} className="sidebar-sub-link">5. JWT — Mal formados</a></li>
                <li><a href="#auth-assert-ref" onClick={(e) => { e.preventDefault(); scrollToAnchor('auth-assert-ref'); }} className="sidebar-sub-link">6. Referencia assert</a></li>
                <li><a href="#auth-concepts" onClick={(e) => { e.preventDefault(); scrollToAnchor('auth-concepts'); }} className="sidebar-sub-link">7. Conceptos clave</a></li>
                <li><a href="#auth-quiz" onClick={(e) => { e.preventDefault(); scrollToAnchor('auth-quiz'); }} className="sidebar-sub-link">8. 📝 Quiz de Estudio</a></li>
              </ul>
            )}
          </li>

          <li>
            <button
              className={`sidebar-btn ${activeView === 'test-app' ? 'active' : ''}`}
              onClick={() => handleNav('test-app')}
            >
              <span>🏗️ Tests de Arquitectura</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
            {activeView === 'test-app' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#tapp-full" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-full'); }} className="sidebar-sub-link">1. Código completo</a></li>
                <li><a href="#tapp-imports" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-imports'); }} className="sidebar-sub-link">2. Imports</a></li>
                <li><a href="#tapp-after" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-after'); }} className="sidebar-sub-link">3. Hook after()</a></li>
                <li><a href="#tapp-test1" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-test1'); }} className="sidebar-sub-link">4. Test 1 — Instancia Express</a></li>
                <li><a href="#tapp-test2" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-test2'); }} className="sidebar-sub-link">5. Test 2 — Router stack</a></li>
                <li><a href="#tapp-or" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-or'); }} className="sidebar-sub-link">6. Operador ||</a></li>
                <li><a href="#tapp-as-any" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-as-any'); }} className="sidebar-sub-link">7. Aserción as any</a></li>
                <li><a href="#tapp-router-stack" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-router-stack'); }} className="sidebar-sub-link">8. _router.stack completo</a></li>
                <li><a href="#tapp-lazy" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-lazy'); }} className="sidebar-sub-link">9. Lazy initialization</a></li>
                <li><a href="#tapp-order" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-order'); }} className="sidebar-sub-link">10. Orden de ejecución</a></li>
                <li><a href="#tapp-filter-map" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-filter-map'); }} className="sidebar-sub-link">11. .filter() y .map()</a></li>
                <li><a href="#tapp-assert-ok" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-assert-ok'); }} className="sidebar-sub-link">12. assert.ok()</a></li>
                <li><a href="#tapp-concepts" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-concepts'); }} className="sidebar-sub-link">13. Resumen conceptos</a></li>
                <li><a href="#tapp-quiz" onClick={(e) => { e.preventDefault(); scrollToAnchor('tapp-quiz'); }} className="sidebar-sub-link">14. 📝 Quiz de Estudio</a></li>
              </ul>
            )}
          </li>

          <li>
            <button
              className={`sidebar-btn ${activeView === 'test-integracion-api' ? 'active' : ''}`}
              onClick={() => handleNav('test-integracion-api')}
            >
              <span>🔗 Tests de Integración</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
            {activeView === 'test-integracion-api' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#tint-full" onClick={(e) => { e.preventDefault(); scrollToAnchor('tint-full'); }} className="sidebar-sub-link">1. Código completo</a></li>
                <li><a href="#tint-supertest" onClick={(e) => { e.preventDefault(); scrollToAnchor('tint-supertest'); }} className="sidebar-sub-link">2. supertest</a></li>
                <li><a href="#tint-tokens" onClick={(e) => { e.preventDefault(); scrollToAnchor('tint-tokens'); }} className="sidebar-sub-link">3. Tokens de prueba</a></li>
                <li><a href="#tint-1" onClick={(e) => { e.preventDefault(); scrollToAnchor('tint-1'); }} className="sidebar-sub-link">4. INT-1 — 401 Sin credenciales</a></li>
                <li><a href="#tint-2" onClick={(e) => { e.preventDefault(); scrollToAnchor('tint-2'); }} className="sidebar-sub-link">5. INT-2 — 403 Rol insuficiente</a></li>
                <li><a href="#tint-3" onClick={(e) => { e.preventDefault(); scrollToAnchor('tint-3'); }} className="sidebar-sub-link">6. INT-3 — 200 ADMIN ok</a></li>
                <li><a href="#tint-4" onClick={(e) => { e.preventDefault(); scrollToAnchor('tint-4'); }} className="sidebar-sub-link">7. INT-4 — Logout</a></li>
                <li><a href="#tint-5" onClick={(e) => { e.preventDefault(); scrollToAnchor('tint-5'); }} className="sidebar-sub-link">8. INT-5 — 404 Ruta inexistente</a></li>
                <li><a href="#tint-flow" onClick={(e) => { e.preventDefault(); scrollToAnchor('tint-flow'); }} className="sidebar-sub-link">9. Flujo completo</a></li>
                <li><a href="#tint-concepts" onClick={(e) => { e.preventDefault(); scrollToAnchor('tint-concepts'); }} className="sidebar-sub-link">10. Conceptos clave</a></li>
                <li><a href="#tint-guia" onClick={(e) => { e.preventDefault(); scrollToAnchor('tint-guia'); }} className="sidebar-sub-link">11. 📖 Guía conceptual</a></li>
                <li><a href="#tint-quiz" onClick={(e) => { e.preventDefault(); scrollToAnchor('tint-quiz'); }} className="sidebar-sub-link">12. 📝 Quiz de Estudio</a></li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      <div className="sidebar-group">
        <div className="sidebar-heading">Autenticación y Usuarios</div>
        <ul className="sidebar-menu">
          <li>
            <button
              className={`sidebar-btn ${activeView === 'usuario-sistema' ? 'active' : ''}`}
              onClick={() => handleNav('usuario-sistema')}
            >
              <span>👤 Sistema de Usuarios</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
            {activeView === 'usuario-sistema' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#usr-arquitectura" onClick={(e) => { e.preventDefault(); scrollToAnchor('usr-arquitectura'); }} className="sidebar-sub-link">🏗️ Arquitectura en capas</a></li>
                <li><a href="#usr-entity" onClick={(e) => { e.preventDefault(); scrollToAnchor('usr-entity'); }} className="sidebar-sub-link">🗄️ Entidad Usuario</a></li>
                <li><a href="#usr-routes" onClick={(e) => { e.preventDefault(); scrollToAnchor('usr-routes'); }} className="sidebar-sub-link">🔀 Rutas</a></li>
                <li><a href="#usr-controller" onClick={(e) => { e.preventDefault(); scrollToAnchor('usr-controller'); }} className="sidebar-sub-link">🎮 Controller</a></li>
                <li><a href="#usr-service" onClick={(e) => { e.preventDefault(); scrollToAnchor('usr-service'); }} className="sidebar-sub-link">⚙️ Service</a></li>
                <li><a href="#usr-middleware" onClick={(e) => { e.preventDefault(); scrollToAnchor('usr-middleware'); }} className="sidebar-sub-link">🔐 Middleware de Auth</a></li>
                <li><a href="#usr-seguridad" onClick={(e) => { e.preventDefault(); scrollToAnchor('usr-seguridad'); }} className="sidebar-sub-link">🛡️ Seguridad</a></li>
                <li><a href="#usr-quiz" onClick={(e) => { e.preventDefault(); scrollToAnchor('usr-quiz'); }} className="sidebar-sub-link">📝 Quiz de Estudio</a></li>
              </ul>
            )}
          </li>
          <li>
            <button
              className={`sidebar-btn ${activeView === 'usuario-entity' ? 'active' : ''}`}
              onClick={() => handleNav('usuario-entity')}
            >
              <span>🧬 usuario.entity.ts</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-btn ${activeView === 'auth-middleware' ? 'active' : ''}`}
              onClick={() => handleNav('auth-middleware')}
            >
              <span>🔐 auth.middleware.ts</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
            {activeView === 'auth-middleware' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#amw-concepto" onClick={(e) => { e.preventDefault(); scrollToAnchor('amw-concepto'); }} className="sidebar-sub-link">1. Concepto & Flujo</a></li>
                <li><a href="#amw-codigo" onClick={(e) => { e.preventDefault(); scrollToAnchor('amw-codigo'); }} className="sidebar-sub-link">2. Código completo</a></li>
                <li><a href="#amw-imports" onClick={(e) => { e.preventDefault(); scrollToAnchor('amw-imports'); }} className="sidebar-sub-link">3. Imports & JWT</a></li>
                <li><a href="#amw-interface" onClick={(e) => { e.preventDefault(); scrollToAnchor('amw-interface'); }} className="sidebar-sub-link">4. AuthedRequest</a></li>
                <li><a href="#amw-requireauth" onClick={(e) => { e.preventDefault(); scrollToAnchor('amw-requireauth'); }} className="sidebar-sub-link">5. requireAuth</a></li>
                <li><a href="#amw-requireroles" onClick={(e) => { e.preventDefault(); scrollToAnchor('amw-requireroles'); }} className="sidebar-sub-link">6. requireRoles</a></li>
                <li><a href="#amw-codigos" onClick={(e) => { e.preventDefault(); scrollToAnchor('amw-codigos'); }} className="sidebar-sub-link">7. 401 vs 403</a></li>
                <li><a href="#amw-glosario" onClick={(e) => { e.preventDefault(); scrollToAnchor('amw-glosario'); }} className="sidebar-sub-link">8. Glosario Rápido</a></li>
                <li><a href="#amw-quiz" onClick={(e) => { e.preventDefault(); scrollToAnchor('amw-quiz'); }} className="sidebar-sub-link">9. 📝 Quiz de Estudio</a></li>
              </ul>
            )}
          </li>
          <li>
            <button
              className={`sidebar-btn ${activeView === 'seguridad' ? 'active' : ''}`}
              onClick={() => handleNav('seguridad')}
            >
              <span>🛡️ Seguridad Front & Back</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
            {activeView === 'seguridad' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#sec-panorama" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-panorama'); }} className="sidebar-sub-link">1. Mapa de Seguridad</a></li>
                <li><a href="#sec-front" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-front'); }} className="sidebar-sub-link">2. Roles en Frontend</a></li>
                <li><a href="#sec-back" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-back'); }} className="sidebar-sub-link">3. Seguridad en Backend</a></li>
                <li><a href="#sec-matriz" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-matriz'); }} className="sidebar-sub-link">4. Matriz de Rutas API</a></li>
                <li><a href="#sec-cookies" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-cookies'); }} className="sidebar-sub-link">5. Cookies Anti-XSS/CSRF</a></li>
                <li><a href="#sec-idor" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-idor'); }} className="sidebar-sub-link">6. Prevención IDOR / BOLA</a></li>
                <li><a href="#sec-bcrypt" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-bcrypt'); }} className="sidebar-sub-link">7. bcrypt & Contraseñas</a></li>
                <li><a href="#sec-sqli" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-sqli'); }} className="sidebar-sub-link">8. Inyección SQL & Sanitización</a></li>
                <li><a href="#sec-dominio" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-dominio'); }} className="sidebar-sub-link">9. Integridad de Dominio</a></li>
                <li><a href="#sec-tests" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-tests'); }} className="sidebar-sub-link">10. Tests de Seguridad</a></li>
                <li><a href="#sec-por-que-es-buena" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-por-que-es-buena'); }} className="sidebar-sub-link">11. Mitigación OWASP</a></li>
                <li><a href="#sec-quiz" onClick={(e) => { e.preventDefault(); scrollToAnchor('sec-quiz'); }} className="sidebar-sub-link">12. 📝 Quiz de Estudio</a></li>
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

          <li>
            <button
              className={`sidebar-btn ${activeView === 'usuario-entity' ? 'active' : ''}`}
              onClick={() => handleNav('usuario-entity')}
            >
              <span>🧬 usuario.entity</span>
              <span className="status-badge status-ready">Nuevo</span>
            </button>
            {activeView === 'usuario-entity' && (
              <ul className="sidebar-sub-menu">
                <li><a href="#uent-codigo" onClick={(e) => { e.preventDefault(); scrollToAnchor('uent-codigo'); }} className="sidebar-sub-link">1. Código completo</a></li>
                <li><a href="#uent-imports" onClick={(e) => { e.preventDefault(); scrollToAnchor('uent-imports'); }} className="sidebar-sub-link">2. Imports & Decoradores</a></li>
                <li><a href="#uent-enum" onClick={(e) => { e.preventDefault(); scrollToAnchor('uent-enum'); }} className="sidebar-sub-link">3. Enum UserRole</a></li>
                <li><a href="#uent-clase" onClick={(e) => { e.preventDefault(); scrollToAnchor('uent-clase'); }} className="sidebar-sub-link">4. Declaración de Clase</a></li>
                <li><a href="#uent-propiedades" onClick={(e) => { e.preventDefault(); scrollToAnchor('uent-propiedades'); }} className="sidebar-sub-link">5. Propiedades y Columnas</a></li>
                <li><a href="#uent-relaciones" onClick={(e) => { e.preventDefault(); scrollToAnchor('uent-relaciones'); }} className="sidebar-sub-link">6. Relaciones OneToOne</a></li>
                <li><a href="#uent-hooks" onClick={(e) => { e.preventDefault(); scrollToAnchor('uent-hooks'); }} className="sidebar-sub-link">7. Hooks de Validación</a></li>
                <li><a href="#uent-glosario" onClick={(e) => { e.preventDefault(); scrollToAnchor('uent-glosario'); }} className="sidebar-sub-link">8. Glosario Rápido</a></li>
                <li><a href="#uent-quiz" onClick={(e) => { e.preventDefault(); scrollToAnchor('uent-quiz'); }} className="sidebar-sub-link">9. 📝 Quiz de Estudio</a></li>
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
