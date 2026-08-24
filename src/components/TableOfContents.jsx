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

  const headings = activeView === 'home'
    ? homeHeadings
    : activeView === 'middlewares'
      ? middlewareHeadings
      : activeView === 'app-ts'
        ? appTsHeadings
        : activeView === 'metahumano-entity'
          ? entityHeadings
          : activeView === 'metahumano-routes'
            ? routesHeadings
            : controllerHeadings;

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
