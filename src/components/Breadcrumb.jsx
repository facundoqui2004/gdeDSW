import React from 'react';

export default function Breadcrumb({ activeView, setActiveView }) {
  return (
    <div id="breadcrumb-bar">
      <div className="breadcrumbs">
        <button onClick={() => setActiveView('home')}>SuperGestor</button>
        <span className="sep">/</span>
        <button onClick={() => setActiveView('home')}>Backend</button>
        <span className="sep">/</span>
        <span className="current">
          {activeView === 'home'
            ? 'Introducción & Arquitectura'
            : activeView === 'middlewares'
              ? 'Middlewares Externos'
              : activeView === 'app-ts'
                ? 'app.ts — El Núcleo'
                : activeView === 'metahumano-entity'
                  ? 'metahumano.entity.ts'
                  : activeView === 'metahumano-routes'
                    ? 'metahumano.routes.ts'
                    : activeView === 'asincronias'
                      ? 'Asincronía en Node.js'
                      : activeView === 'test-autenticacion'
                        ? 'Test — Autenticación'
                        : activeView === 'test-app'
                          ? 'Test — app.ts'
                          : activeView === 'test-integracion-api'
                            ? 'Test — Integración API'
                            : activeView === 'usuario-sistema'
                              ? 'Sistema de Usuarios'
                              : 'metahumano.controller.ts'}
        </span>
      </div>
      <div>
        <span className="doc-version-badge">React 18 + Express Docs v1.0.0</span>
      </div>
    </div>
  );
}
