import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import Callout from '../components/Callout';

/* ============================================================
   MetahumanoRoutesView.jsx — Estudio completo de metahumano.routes.ts
   ============================================================ */

// Mini componente para mostrar una ruta de forma visual
function RouteRow({ method, path, middlewares = [], handler, description, isProtected }) {
  const badgeClass = {
    GET: 'badge-get',
    POST: 'badge-post',
    PUT: 'badge-put',
    DELETE: 'badge-delete',
  }[method] || 'badge-get';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '72px 1fr',
      gap: '16px',
      padding: '16px',
      borderBottom: '1px solid var(--border-subtle)',
      alignItems: 'start'
    }}>
      <span className={`http-badge ${badgeClass}`} style={{ justifySelf: 'start', marginTop: '2px' }}>
        {method}
      </span>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
          <code style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', background: 'none', padding: 0 }}>
            /api/metahumanos{path}
          </code>
          {isProtected && (
            <span style={{
              fontSize: '10.5px', fontWeight: 700, background: '#fef3c7', color: '#92400e',
              padding: '1px 6px', borderRadius: '3px', border: '1px solid #fcd34d'
            }}>
              🔒 requireAuth
            </span>
          )}
        </div>
        {middlewares.length > 0 && (
          <div style={{ marginBottom: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {middlewares.map((m, i) => (
              <code key={i} style={{
                fontSize: '11.5px', background: 'var(--inline-code-bg)',
                color: 'var(--inline-code-color)', padding: '1px 6px', borderRadius: '3px'
              }}>
                {m}
              </code>
            ))}
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>→</span>
            <code style={{
              fontSize: '11.5px', background: 'var(--sidebar-bg)',
              color: 'var(--accent-color)', padding: '1px 6px', borderRadius: '3px',
              border: '1px solid var(--border-color)'
            }}>
              {handler}()
            </code>
          </div>
        )}
        {middlewares.length === 0 && (
          <div style={{ marginBottom: '6px' }}>
            <code style={{
              fontSize: '11.5px', background: 'var(--sidebar-bg)',
              color: 'var(--accent-color)', padding: '1px 6px', borderRadius: '3px',
              border: '1px solid var(--border-color)'
            }}>
              {handler}()
            </code>
          </div>
        )}
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{description}</p>
      </div>
    </div>
  );
}

export default function MetahumanoRoutesView() {
  const [activeTab, setActiveTab] = useState('cadena');

  return (
    <div className="doc-section">
      <h1>
        <code style={{ fontSize: '26px' }}>metahumano.routes.ts</code> — El Enrutador de Metahumanos
      </h1>
      <p className="page-lead">
        El archivo de rutas (<em>router</em>) es el mapa de la API: define qué <strong>combinación de método HTTP + URL</strong> activa qué función del controlador, y qué middlewares de seguridad o validación se ejecutan antes. Es el puente entre las peticiones del cliente y la lógica del controlador.
      </p>

      <Callout type="note" title="📂 Ubicación del Archivo">
        <code>Backend/src/metahumano/metahumano.routes.ts</code> — Montado en <code>app.ts</code> bajo el prefijo <code>/api/metahumanos</code>
      </Callout>

      {/* ── CÓDIGO COMPLETO ── */}
      <h2 id="routes-full">El Código Completo Anotado</h2>

      <CodeBlock
        title="metahumano.routes.ts — Código completo"
        language="TypeScript"
        code={`import express from 'express'

// Importar funciones del controlador de metahumanos
import {
  sanitizeMetahumanoInput,       // Middleware de limpieza del body
  crearPerfilMetahumano,         // POST /registro
  actualizarPoderesMetahumano,   // PUT /poderes
  obtenerNotificacionesMetahumano, // GET /notificaciones
  definirEstiloVida,             // POST /estilo-vida
  findAll,                       // GET /
  findOne,                       // GET /:id
  add,                           // POST /
  update,                        // PUT /:id
  remove,                        // DELETE /:id
} from './metahumano.controller.js'

// Importar funciones del controlador de MetaPoder (relación M:N)
import {
  findAllForMetahumano,          // GET /:id/metapoder
  sanitizeMetaPoderInput,        // Middleware de limpieza para metapoder
  assignPoderToMetahumano        // POST /:id/metapoder
} from '../metaPoder/metaPoder.controller.js'

// Importar los middlewares de autenticación
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'

// ─── Crear la instancia del Router ───────────────────────────────────────
const router = express.Router()
// Un Router es un "mini-app" de Express que maneja sus propias rutas.
// Se conecta a la app principal en app.ts con:
//   app.use('/api/metahumanos', router)

// ─── Rutas CRUD de Metahumano ────────────────────────────────────────────

// GET /api/metahumanos/
// Lista todos los metahumanos con sus poderes y usuario. Sin autenticación.
router.get('/', findAll)

// GET /api/metahumanos/notificaciones
// Devuelve trámites y multas del metahumano logueado.
// requireAuth verifica el token JWT de la cookie y agrega datos en req
router.get('/notificaciones', requireAuth, obtenerNotificacionesMetahumano)

// GET /api/metahumanos/:id
// Busca un metahumano por su ID numérico. Sin autenticación.
router.get('/:id', findOne)

// POST /api/metahumanos/registro
// Crea un perfil de metahumano asociado a un Usuario existente.
router.post('/registro', crearPerfilMetahumano)

// POST /api/metahumanos/estilo-vida
// Convierte al metahumano en HEROE o VILLANO definitivamente.
// Solo usuarios autenticados pueden llamarla.
router.post('/estilo-vida', requireAuth, definirEstiloVida)

// POST /api/metahumanos/
// Crea un metahumano genérico (ruta legacy de CRUD básico).
// sanitizeMetahumanoInput limpia y valida el body antes del controlador.
router.post('/', sanitizeMetahumanoInput, add)

// PUT /api/metahumanos/poderes
// Asigna o actualiza el nivel de dominio de un poder.
// Solo el metahumano propietario puede modificar sus propios poderes.
router.put('/poderes', requireAuth, actualizarPoderesMetahumano)

// PUT /api/metahumanos/:id
// Actualiza campos de un metahumano por ID (CRUD básico).
router.put('/:id', sanitizeMetahumanoInput, update)

// DELETE /api/metahumanos/:id
// Elimina un metahumano. Requiere estar logueado Y tener rol 'ADMIN'.
router.delete('/:id', requireAuth, requireRoles(['ADMIN']), remove)

// ─── Rutas de MetaPoder relacionadas al Metahumano ───────────────────────

// GET /api/metahumanos/:id/metapoder
// Lista todos los poderes asignados a un metahumano específico.
router.get('/:id/metapoder', findAllForMetahumano)

// POST /api/metahumanos/:id/metapoder
// Asigna un poder nuevo a un metahumano específico.
router.post('/:id/metapoder', sanitizeMetaPoderInput, assignPoderToMetahumano)

export default router`}
      />

      {/* ── TABLA VISUAL DE RUTAS ── */}
      <h2 id="routes-table">Mapa Visual de todas las Rutas</h2>

      <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', marginTop: '20px' }}>
        <div style={{ background: 'var(--sidebar-bg)', padding: '12px 16px', borderBottom: '2px solid var(--border-color)', fontWeight: 700, fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Prefijo base: <code style={{ color: 'var(--accent-color)' }}>/api/metahumanos</code>
        </div>

        <RouteRow method="GET" path="/" handler="findAll"
          description="Lista todos los metahumanos con sus poderes y usuario. Acceso público." />
        <RouteRow method="GET" path="/notificaciones" handler="obtenerNotificacionesMetahumano"
          isProtected middlewares={['requireAuth']}
          description="Devuelve trámites (Carpetas) y multas pendientes del metahumano autenticado. El token JWT identifica qué usuario es." />
        <RouteRow method="GET" path="/:id" handler="findOne"
          description="Busca un metahumano por ID numérico. Popula usuario y poderes. Acceso público." />
        <RouteRow method="POST" path="/registro" handler="crearPerfilMetahumano"
          description="Crea un perfil de Metahumano, Heroe o Villano asociado a un Usuario. Verifica rol METAHUMANO y que no tenga perfil previo." />
        <RouteRow method="POST" path="/estilo-vida" handler="definirEstiloVida"
          isProtected middlewares={['requireAuth']}
          description="Define el bando del metahumano (HEROE o VILLANO). Operación irreversible. Solo el propietario autenticado." />
        <RouteRow method="POST" path="/" handler="add"
          middlewares={['sanitizeMetahumanoInput']}
          description="Crea un metahumano genérico (ruta de CRUD básico). El middleware limpia el body antes." />
        <RouteRow method="PUT" path="/poderes" handler="actualizarPoderesMetahumano"
          isProtected middlewares={['requireAuth']}
          description="Asigna o actualiza el dominio de un poder (UPSERT en MetaPoder). Solo el metahumano dueño." />
        <RouteRow method="PUT" path="/:id" handler="update"
          middlewares={['sanitizeMetahumanoInput']}
          description="Actualiza campos de un metahumano por ID (CRUD básico). Sanitiza el input primero." />
        <RouteRow method="DELETE" path="/:id" handler="remove"
          isProtected middlewares={['requireAuth', "requireRoles(['ADMIN'])"]}
          description="Elimina un metahumano. Doble protección: token JWT + rol ADMIN. Solo administradores." />
        <RouteRow method="GET" path="/:id/metapoder" handler="findAllForMetahumano"
          description="Lista todos los poderes asignados al metahumano con ese ID. Acceso público." />
        <RouteRow method="POST" path="/:id/metapoder" handler="assignPoderToMetahumano"
          middlewares={['sanitizeMetaPoderInput']}
          description="Asigna un poder nuevo al metahumano con ese ID. Sanitiza el input antes." />
      </div>

      {/* ── CADENA DE MIDDLEWARES ── */}
      <h2 id="routes-chain">¿Cómo Funciona la Cadena de Middlewares en una Ruta?</h2>

      <div className="breakdown-box">
        <div className="breakdown-header">
          <span className="breakdown-title">Cadena de Ejecución por Tipo de Ruta</span>
          <div className="tabs-nav">
            <button className={`tab-btn ${activeTab === 'cadena' ? 'active' : ''}`} onClick={() => setActiveTab('cadena')}>Ruta con Auth</button>
            <button className={`tab-btn ${activeTab === 'sanitize' ? 'active' : ''}`} onClick={() => setActiveTab('sanitize')}>Ruta con Sanitize</button>
            <button className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>Ruta con Roles</button>
          </div>
        </div>

        {activeTab === 'cadena' && (
          <div className="tab-content active">
            <h4>DELETE <code>/api/metahumanos/5</code> — Ruta solo para ADMIN</h4>
            <CodeBlock
              title="Definición en routes.ts"
              language="TypeScript"
              code={`router.delete('/:id', requireAuth, requireRoles(['ADMIN']), remove)
//                     ^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^
//                     Paso 1     Paso 2                       Paso 3`}
            />
            <ul className="step-list">
              <li className="step-item">
                <span className="step-badge">1</span>
                <h5><code>requireAuth(req, res, next)</code></h5>
                <p>Lee <code>req.cookies.auth_token</code>, lo verifica con <code>jwt.verify()</code>. Si el token es válido, agrega <code>usuarioId</code>, <code>role</code> y <code>perfilId</code> al objeto <code>req</code> y llama a <code>next()</code>. Si el token falta o es inválido, responde con <strong>401 Unauthorized</strong> y la cadena se detiene.</p>
              </li>
              <li className="step-item">
                <span className="step-badge">2</span>
                <h5><code>requireRoles(['ADMIN'])(req, res, next)</code></h5>
                <p>Lee <code>req.role</code> (que fue puesto por <code>requireAuth</code>). Si el rol coincide con alguno de los permitidos, llama a <code>next()</code>. Si no, responde con <strong>403 Forbidden</strong> y la cadena se detiene.</p>
              </li>
              <li className="step-item">
                <span className="step-badge">3</span>
                <h5><code>remove(req, res)</code></h5>
                <p>Solo llega aquí si los dos middlewares anteriores aprobaron. Lee <code>req.params.id</code>, borra el metahumano con <code>em.getReference()</code> + <code>em.removeAndFlush()</code> y responde con <strong>200 OK</strong>.</p>
              </li>
            </ul>
          </div>
        )}

        {activeTab === 'sanitize' && (
          <div className="tab-content active">
            <h4>PUT <code>/api/metahumanos/5</code> — Ruta con sanitización</h4>
            <CodeBlock
              title="Definición en routes.ts"
              language="TypeScript"
              code={`router.put('/:id', sanitizeMetahumanoInput, update)
//                  ^^^^^^^^^^^^^^^^^^^^    ^^^^^^
//                  Paso 1 (middleware)    Paso 2 (controlador)`}
            />
            <ul className="step-list">
              <li className="step-item">
                <span className="step-badge">1</span>
                <h5><code>sanitizeMetahumanoInput(req, res, next)</code></h5>
                <p>
                  Crea <code>req.body.sanitizedInput</code> con solo los campos permitidos (<code>nombre</code>, <code>alias</code>, <code>origen</code>, <code>latitud</code>, <code>longitud</code>). Convierte las coordenadas a <code>Number()</code>. Elimina los campos con valor <code>undefined</code>. Llama a <code>next()</code>.
                </p>
              </li>
              <li className="step-item">
                <span className="step-badge">2</span>
                <h5><code>update(req, res)</code></h5>
                <p>
                  Lee <code>req.params.id</code> y <code>req.body.sanitizedInput</code>. Busca el metahumano con <code>findOneOrFail</code>, le aplica <code>em.assign()</code> con el input limpio, y llama a <code>em.flush()</code> para persistir los cambios.
                </p>
              </li>
            </ul>
            <Callout type="tip" title="¿Por qué sanitizar en el middleware y no en el controlador?">
              <p>
                La separación de responsabilidades: el middleware de sanitización hace una <em>única tarea</em> (limpiar el input) y el controlador hace otra <em>única tarea</em> (aplicar la lógica de negocio). Esto también permite <strong>reutilizar</strong> <code>sanitizeMetahumanoInput</code> en múltiples rutas (como en <code>POST /</code> y <code>PUT /:id</code>) sin duplicar código.
              </p>
            </Callout>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="tab-content active">
            <h4>¿Cómo funciona <code>requireRoles()</code> internamente?</h4>
            <CodeBlock
              title="auth.middleware.ts — requireRoles"
              language="TypeScript"
              code={`// requireRoles es una función que DEVUELVE un middleware (Higher-Order Function)
export function requireRoles(allowedRoles: string[]) {
  // El middleware que devuelve cierra sobre 'allowedRoles'
  return async (req: Request, res: Response, next: NextFunction) => {
    const authedReq = req as AuthedRequest;

    if (!authedReq.usuarioId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const roleUpper = (authedReq.role || '').toUpperCase();
    const allowedUpper = allowedRoles.map(r => r.toUpperCase());

    // Verificar rol directo del usuario
    if (allowedUpper.includes(roleUpper)) {
      return next();  // ✅ Rol permitido → continúa
    }

    // Caso especial: si es METAHUMANO, verificar subtipo en BD
    // (Heroe o Villano podrían tener rutas específicas)
    if (authedReq.role === 'METAHUMANO' && authedReq.perfilId) {
      const metahumano = await em.findOne(Metahumano, { id: authedReq.perfilId });
      if (metahumano) {
        const tipo = metahumano.tipoMeta.toUpperCase(); // 'HEROE' o 'VILLANO'
        if (allowedRoles.includes(tipo)) {
          return next();  // ✅ Subtipo permitido → continúa
        }
      }
    }

    return res.status(403).json({ message: 'Acceso denegado' }); // ❌
  };
}

// Uso en routes.ts:
router.delete('/:id', requireAuth, requireRoles(['ADMIN']), remove)
//                                 ^^^^^^^^^^^^^^^^^^^^^^^^
//                                 Llama a requireRoles con el array de roles
//                                 y el resultado (un middleware) se pasa a Express`}
            />
            <Callout type="note" title="Higher-Order Function (Función de Orden Superior)">
              <p>
                <code>requireRoles(['ADMIN'])</code> es una <strong>función que devuelve otra función</strong>. Esta técnica se llama <em>Higher-Order Function</em> o <em>Middleware Factory</em>. La ventaja es que permite <strong>parametrizar</strong> el middleware: puedes usar <code>requireRoles(['ADMIN'])</code> en unas rutas y <code>requireRoles(['ADMIN', 'BUROCRATA'])</code> en otras, sin repetir código.
              </p>
            </Callout>
          </div>
        )}
      </div>

      {/* ── ORDEN CRÍTICO DE RUTAS ── */}
      <h2 id="routes-order">El Orden de las Rutas Importa</h2>
      <p>
        Express evalúa las rutas en el <strong>orden en que fueron definidas</strong>. Si una ruta más general está definida antes que una más específica, puede capturar la petición incorrectamente.
      </p>

      <CodeBlock
        title="¿Por qué /notificaciones va ANTES de /:id?"
        language="TypeScript"
        code={`// ✅ CORRECTO — Orden en el proyecto:
router.get('/notificaciones', requireAuth, obtenerNotificacionesMetahumano)  // línea 25
router.get('/:id', findOne)                                                  // línea 26

// Si se invierte el orden:
// ❌ MAL — /:id capturaría /notificaciones porque 'notificaciones' coincide con :id
router.get('/:id', findOne)                                                  // ← captura /notificaciones
router.get('/notificaciones', requireAuth, obtenerNotificacionesMetahumano)  // ← nunca llega aquí

// La regla: las rutas ESPECÍFICAS (literales) deben ir ANTES que las DINÁMICAS (con /:param)`}
      />

      <Callout type="warn" title="⚠️ Regla de Oro del Enrutamiento">
        <p>
          Siempre define las rutas con <strong>paths literales</strong> (<code>/registro</code>, <code>/notificaciones</code>, <code>/estilo-vida</code>, <code>/poderes</code>) <strong>antes</strong> que las rutas con <strong>parámetros dinámicos</strong> (<code>/:id</code>). De lo contrario, Express interpretará el path literal como el valor del parámetro dinámico.
        </p>
      </Callout>

      {/* ── RESUMEN DE DECISIONES DE DISEÑO ── */}
      <h2 id="routes-design">Decisiones de Diseño Importantes</h2>

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Decisión</th>
              <th>¿Por qué se hizo así?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>POST /registro</code> en vez de <code>POST /</code></td>
              <td>El endpoint de creación de perfil tiene reglas de negocio complejas (validar rol del usuario, evitar duplicados). Se separa del CRUD genérico para mayor claridad semántica.</td>
            </tr>
            <tr>
              <td><code>POST /estilo-vida</code> con <code>requireAuth</code></td>
              <td>Definir si eres héroe o villano es una operación personal e irreversible. Solo el metahumano propietario (autenticado) puede hacerla.</td>
            </tr>
            <tr>
              <td><code>PUT /poderes</code> en vez de <code>PUT /poderes/:poderId</code></td>
              <td>El controlador recibe el <code>poderId</code> en el body y también el <code>perfilId</code> del token JWT. La URL no necesita el ID del metahumano porque ya está en el token.</td>
            </tr>
            <tr>
              <td><code>DELETE /:id</code> solo con <code>requireRoles(['ADMIN'])</code></td>
              <td>Borrar un metahumano es una operación administrativa crítica. Solo los ADMIN del sistema pueden hacerlo, no el propio metahumano.</td>
            </tr>
            <tr>
              <td>Rutas de MetaPoder bajo <code>/:id/metapoder</code></td>
              <td>Seguir convenciones REST de recursos anidados: <em>"los metapoderes del metahumano con ese id"</em>. Hace la API más intuitiva y autodocumentada.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── EXPRESS.ROUTER() ── */}
      <h2 id="routes-router">¿Qué es <code>express.Router()</code>?</h2>
      <p>
        Un <code>Router</code> de Express es una instancia que agrupa rutas relacionadas y puede ser montada en la aplicación principal con un prefijo. Es la forma de modularizar las rutas de una API grande.
      </p>

      <CodeBlock
        title="Cómo se conecta el Router con la app principal"
        language="TypeScript"
        code={`// ── En metahumano.routes.ts: ────────────────────────────────────────────────
const router = express.Router()    // Mini-aplicación con sus propias rutas
router.get('/', findAll)           // Se define relativa al Router
router.get('/:id', findOne)
// ...
export default router              // Se exporta para usarla en app.ts

// ── En app.ts: ───────────────────────────────────────────────────────────────
import metahumanosRoutes from './metahumano/metahumano.routes.js'

app.use('/api/metahumanos', metahumanosRoutes)
//      ^^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^^^^
//      Prefijo             Router de metahumanos

// Resultado:
// router.get('/')    → app atiende GET /api/metahumanos/
// router.get('/:id') → app atiende GET /api/metahumanos/:id
// etc.`}
      />
    </div>
  );
}
