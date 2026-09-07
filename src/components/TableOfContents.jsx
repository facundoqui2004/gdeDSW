import React, { useState, useEffect } from 'react';

export default function TableOfContents({ activeView }) {
  const [activeId, setActiveId] = useState('');

  const homeHeadings = [
    { id: 'section-home-stack', title: 'Stack Tecnológico' },
    { id: 'section-home-flow', title: 'Ciclo de Petición HTTP' },
    { id: 'section-home-orm', title: 'Patrones de MikroORM' }
  ];

  const middlewareHeadings = [
    { id: 'mw-cors', title: '🌐 cors' },
    { id: 'mw-cookie-parser', title: '🍪 cookie-parser' },
    { id: 'mw-express-json', title: '📦 express.json/urlencoded' },
    { id: 'mw-dotenv', title: '⚙️ dotenv' },
    { id: 'mw-jwt', title: '🔑 jsonwebtoken (JWT)' },
    { id: 'mw-bcrypt', title: '🔒 bcryptjs' },
    { id: 'mw-reflect', title: '🔮 reflect-metadata' },
    { id: 'mw-request-context', title: '🗃️ RequestContext' },
    { id: 'mw-order', title: '📋 Orden de Ejecución' },
  ];

  const controllerHeadings = [
    { id: 'sec-imports', title: '1. Dependencias & Imports' },
    { id: 'sec-em', title: '2. EntityManager (em)' },
    { id: 'sec-sanitize', title: '3. sanitizeMetahumanoInput' },
    { id: 'sec-registro', title: '4. crearPerfilMetahumano' },
    { id: 'sec-crud', title: '5. Operaciones CRUD' },
    { id: 'sec-poderes', title: '6. actualizarPoderes' },
    { id: 'sec-notificaciones', title: '7. notificaciones' },
    { id: 'sec-estilo', title: '8. definirEstiloVida' },
    { id: 'sec-routes', title: '9. Rutas & Middlewares' },
    { id: 'sec-summary', title: '10. Códigos HTTP' },
    { id: 'sec-tester', title: '11. 🧪 Simulador de API' },
    { id: 'sec-quiz', title: '12. 📝 Quiz de Estudio' }
  ];

  const appTsHeadings = [
    { id: 'appts-full', title: 'Código completo' },
    { id: 'appts-instance', title: 'La Instancia Express' },
    { id: 'appts-middlewares', title: 'Cadena de Middlewares' },
    { id: 'appts-legacy', title: 'Router Legacy' },
    { id: 'appts-api', title: 'Montaje de Rutas API' },
    { id: 'appts-errors', title: 'Manejo de Errores' },
    { id: 'appts-export', title: 'Exportación del Módulo' },
  ];

  const entityHeadings = [
    { id: 'entity-full', title: 'Código completo' },
    { id: 'entity-base', title: 'BaseEntity' },
    { id: 'entity-decorators', title: 'Decoradores MikroORM' },
    { id: 'entity-sti', title: 'Herencia STI' },
    { id: 'entity-relations', title: 'Relaciones (1:1, 1:N, M:N)' },
    { id: 'entity-getter', title: 'Getter tipoMeta' },
  ];

  const routesHeadings = [
    { id: 'routes-full', title: 'Código completo' },
    { id: 'routes-table', title: 'Mapa visual de rutas' },
    { id: 'routes-chain', title: 'Cadena de Middlewares' },
    { id: 'routes-order', title: 'Orden de Rutas' },
    { id: 'routes-design', title: 'Decisiones de Diseño' },
    { id: 'routes-router', title: 'express.Router()' },
  ];

  const testAutenticacionHeadings = [
    { id: 'auth-imports', title: '1. Imports y setup' },
    { id: 'auth-hashing', title: '2. bcrypt — Hashing' },
    { id: 'auth-jwt-valid', title: '3. JWT — Firmar & Verificar' },
    { id: 'auth-jwt-invalid', title: '4. JWT — Clave incorrecta' },
    { id: 'auth-jwt-malformed', title: '5. JWT — Mal formados' },
    { id: 'auth-assert-ref', title: '6. Referencia assert' },
    { id: 'auth-concepts', title: '7. Conceptos clave' },
    { id: 'auth-quiz', title: '8. 📝 Quiz de Estudio' },
  ];

  const testAppHeadings = [
    { id: 'tapp-full', title: '1. Código completo' },
    { id: 'tapp-imports', title: '2. Imports' },
    { id: 'tapp-after', title: '3. Hook after()' },
    { id: 'tapp-test1', title: '4. Test 1 — Instancia Express' },
    { id: 'tapp-test2', title: '5. Test 2 — Router stack' },
    { id: 'tapp-or', title: '6. Operador ||' },
    { id: 'tapp-as-any', title: '7. Aserción as any' },
    { id: 'tapp-router-stack', title: '8. _router.stack completo' },
    { id: 'tapp-lazy', title: '9. Lazy initialization' },
    { id: 'tapp-order', title: '10. Orden de ejecución' },
    { id: 'tapp-filter-map', title: '11. .filter() y .map()' },
    { id: 'tapp-assert-ok', title: '12. assert.ok()' },
    { id: 'tapp-concepts', title: '13. Resumen conceptos' },
    { id: 'tapp-quiz', title: '14. 📝 Quiz de Estudio' },
  ];

  const testIntegracionHeadings = [
    { id: 'tint-full', title: '1. Código completo' },
    { id: 'tint-supertest', title: '2. supertest' },
    { id: 'tint-tokens', title: '3. Tokens de prueba' },
    { id: 'tint-1', title: '4. INT-1 — 401 Sin credenciales' },
    { id: 'tint-2', title: '5. INT-2 — 403 Rol insuficiente' },
    { id: 'tint-3', title: '6. INT-3 — 200 ADMIN ok' },
    { id: 'tint-4', title: '7. INT-4 — Logout' },
    { id: 'tint-5', title: '8. INT-5 — 404 Ruta inexistente' },
    { id: 'tint-flow', title: '9. Flujo completo' },
    { id: 'tint-concepts', title: '10. Conceptos clave' },
    { id: 'tint-quiz', title: '11. 📝 Quiz de Estudio' },
  ];

  const usuarioHeadings = [
    { id: 'usr-arquitectura', title: '1. Arquitectura en capas' },
    { id: 'usr-entity', title: '2. Entidad Usuario' },
    { id: 'usr-routes', title: '3. Rutas' },
    { id: 'usr-controller', title: '4. Controller' },
    { id: 'usr-service', title: '5. Service' },
    { id: 'usr-middleware', title: '6. Middleware de Auth' },
    { id: 'usr-seguridad', title: '7. Seguridad' },
    { id: 'usr-quiz', title: '8. 📝 Quiz de Estudio' },
  ];

  const headingsMap = {
    'home': homeHeadings,
    'middlewares': middlewareHeadings,
    'app-ts': appTsHeadings,
    'metahumano-entity': entityHeadings,
    'metahumano-routes': routesHeadings,
    'test-autenticacion': testAutenticacionHeadings,
    'test-app': testAppHeadings,
    'test-integracion-api': testIntegracionHeadings,
    'usuario-sistema': usuarioHeadings,
  };

  const headings = headingsMap[activeView] || controllerHeadings;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 100;
      let current = '';

      headings.forEach(h => {
        const el = document.getElementById(h.id);
        if (el && el.offsetTop <= scrollPos) {
          current = h.id;
        }
      });

      setActiveId(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside id="toc-aside">
      <div className="toc-title">En esta página</div>
      <ul className="toc-list">
        {headings.map(h => (
          <li key={h.id}>
            <a 
              href={`#${h.id}`}
              className={activeId === h.id ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(h.id);
              }}
            >
              {h.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
