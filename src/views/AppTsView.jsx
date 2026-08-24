import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import Callout from '../components/Callout';

/* ============================================================
   AppTsView.jsx — Estudio completo de app.ts
   ============================================================ */

export default function AppTsView() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="doc-section">
      <h1>
        <code style={{ fontSize: '26px' }}>app.ts</code> — El Núcleo de la Aplicación Express
      </h1>
      <p className="page-lead">
        <code>app.ts</code> es el archivo de configuración central del backend de SuperGestor. Aquí se crea la instancia de Express, se registran todos los middlewares en el orden correcto, y se conectan todos los routers de la API. Es el "tablero de control" que orquesta cómo funciona el servidor.
      </p>

      <Callout type="note" title="📂 Ubicación del Archivo">
        <code>Backend/src/app.ts</code> — 97 líneas que configuran todo el servidor Express.
      </Callout>

      {/* ── CÓDIGO COMPLETO ── */}
      <h2 id="appts-full">El Archivo Completo (Anotado)</h2>
      <p>Veamos el archivo completo antes de diseccionarlo en partes:</p>

      <CodeBlock
        title="app.ts — Código completo"
        language="TypeScript"
        code={`import 'dotenv/config'           // [1] Carga variables de entorno PRIMERO
import 'reflect-metadata'         // [2] Habilita decoradores de TypeScript
import express from 'express'
import { RequestContext } from '@mikro-orm/core'
import { orm } from './shared/db/orm.js'

// Importar todos los routers de cada módulo
import metahumanosRoutes   from './metahumano/metahumano.routes.js'
import poderesRoutes       from './poder/poder.routes.js'
import metaPoderesRoutes   from './metaPoder/metaPoder.routes.js'
import { burocratasRouter }   from './Burocratas/Burocrata.routes.js'
import { evidenciaRouter }    from './evidencia/evidencia.routes.js'
import { multasRouter }       from './Multas/Multa.routes.js'
import { carpetaRouter }      from './carpeta/carpeta.routes.js'
import usuarioRouter          from './auth/usuario.routes.js'
import villanoRoutes          from './villano/villano.routes.js'
import heroeRoutes            from './heroe/heroe.routes.js'
import { noticiaRouter }      from './noticia/noticia.routes.js'
import cookieParser           from 'cookie-parser'
import cors                   from 'cors'
import { requireAuth }        from './auth/auth.middleware.js'

// Importar funciones del controlador de usuarios (router legacy)
import {
  crearUsuarioBasico as registrarUsuario,
  login as loginUsuario,
  obtenerPerfil as obtenerUsuarioActual,
  logout as logoutUsuario,
  listarUsuarios as obtenerTodosLosUsuarios,
  obtenerUsuarioPorId
} from './auth/usuario.controller.js'

// [3] Crear la instancia central de Express
const app = express()

// [4] Middlewares globales (se ejecutan en CADA petición)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ];
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())

// [5] Contexto de EntityManager aislado por petición (MikroORM)
app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

// [6] Router de usuarios "legacy" (rutas antiguas que todavía se usan)
const usuariosLegacyRouter = express.Router()
usuariosLegacyRouter.get('/', obtenerTodosLosUsuarios)
usuariosLegacyRouter.get('/me', requireAuth, obtenerUsuarioActual)
usuariosLegacyRouter.get('/:id(\\d+)', obtenerUsuarioPorId)
usuariosLegacyRouter.post('/register', registrarUsuario)
usuariosLegacyRouter.post('/login', loginUsuario)
usuariosLegacyRouter.post('/logout', logoutUsuario)

// [7] Rutas principales de la API — prefijo /api
app.use('/api/usuarios',    usuariosLegacyRouter)
app.use('/api/metahumanos', metahumanosRoutes)
app.use('/api/poderes',     poderesRoutes)
app.use('/api/metapoderes', metaPoderesRoutes)
app.use('/api/burocratas',  burocratasRouter)
app.use('/api/multas',      multasRouter)
app.use('/api/evidencias',  evidenciaRouter)
app.use('/api/carpetas',    carpetaRouter)
app.use('/api/auth',        usuarioRouter)
app.use('/api/villanos',    villanoRoutes)
app.use('/api/heroes',      heroeRoutes)
app.use('/api/noticias',    noticiaRouter)

// [8] Handler 404 — si ninguna ruta hizo match
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' })
})

// [9] Middleware centralizado de errores (4 parámetros = error handler)
import { errorHandler } from './shared/middlewares/error.middleware.js'
app.use(errorHandler)

export { app }
export default app`}
      />

      {/* ── SECCIONES DETALLADAS ── */}

      <h2 id="appts-instance">1. La Instancia de Express: <code>const app = express()</code></h2>
      <p>
        Esta única línea crea la <strong>aplicación Express</strong>, que es el objeto central que maneja todo el servidor. <code>app</code> es una función de Node.js que puede recibir peticiones HTTP y responderlas. A través de <code>app.use()</code>, <code>app.get()</code>, <code>app.post()</code> etc., le vamos agregando comportamiento.
      </p>

      <CodeBlock
        title="Anatomía del objeto app"
        language="TypeScript"
        code={`const app = express()

// app es un objeto con métodos clave:
app.use(middleware)          // Registra middleware para TODAS las rutas
app.use('/prefijo', router)  // Registra un router bajo un prefijo de URL
app.get('/ruta', handler)    // Maneja peticiones GET directamente
app.post('/ruta', handler)   // Maneja peticiones POST directamente
app.listen(3000, callback)   // Inicia el servidor HTTP (esto va en server.ts)

// La app en sí es exportada para ser usada en server.ts y en tests:
export default app`}
      />

      <Callout type="note" title="¿Por qué app.ts NO llama a listen()?">
        <p>
          La separación entre <code>app.ts</code> (configuración) y <code>server.ts</code> (inicio del servidor) es una buena práctica que permite importar <code>app</code> en los tests sin que se abra un puerto real. Así se pueden testear las rutas con <strong>supertest</strong> sin necesitar un servidor corriendo.
        </p>
      </Callout>

      <h2 id="appts-middlewares">2. La Cadena de Middlewares Globales</h2>
      <p>
        Todos los <code>app.use()</code> sin prefijo de ruta se ejecutan para <strong>cada petición HTTP</strong> que llegue al servidor, independientemente de la URL. El orden es secuencial y crítico:
      </p>

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Llamada en app.ts</th>
              <th>¿Qué hace?</th>
              <th>¿Por qué en este orden?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1</strong></td>
              <td><code>cors({'{...}'})</code></td>
              <td>Agrega headers CORS a la respuesta. Responde a peticiones <code>OPTIONS</code> preflight antes de cualquier otra lógica.</td>
              <td>Primero porque el navegador envía el preflight antes de la petición real. Si CORS falla, el resto no importa.</td>
            </tr>
            <tr>
              <td><strong>2</strong></td>
              <td><code>express.json()</code></td>
              <td>Lee el body de la petición y lo parsea como JSON, poniéndolo en <code>req.body</code>.</td>
              <td>Antes de que cualquier controlador intente leer <code>req.body</code>.</td>
            </tr>
            <tr>
              <td><strong>3</strong></td>
              <td><code>express.urlencoded()</code></td>
              <td>Parsea formularios HTML (<code>application/x-www-form-urlencoded</code>).</td>
              <td>Junto al JSON parser, para cubrir ambos formatos de body.</td>
            </tr>
            <tr>
              <td><strong>4</strong></td>
              <td><code>cookieParser()</code></td>
              <td>Parsea el header <code>Cookie</code> y lo convierte en <code>req.cookies</code>.</td>
              <td>Antes del <code>RequestContext</code> y rutas, ya que el middleware de auth lee <code>req.cookies.auth_token</code>.</td>
            </tr>
            <tr>
              <td><strong>5</strong></td>
              <td><code>RequestContext.create(orm.em, next)</code></td>
              <td>Crea un <code>EntityManager</code> aislado y único para esta petición específica.</td>
              <td>Antes de las rutas porque los controladores usan <code>orm.em</code> para consultas.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="appts-legacy">3. El Router Legacy de Usuarios</h2>
      <p>
        Un router "legacy" es uno que mantiene rutas antiguas por compatibilidad, aunque ya exista una versión nueva. El comentario en el código dice <em>"TODO: El usuario legacy ta difícil Mano"</em>, lo que indica que estas rutas son difíciles de migrar sin romper el frontend existente.
      </p>

      <CodeBlock
        title="Router legacy construido directamente en app.ts"
        language="TypeScript"
        code={`// Se crea un Router de Express, igual que en los archivos .routes.ts
const usuariosLegacyRouter = express.Router()

// Rutas de Usuarios Legacy — se montan en /api/usuarios
usuariosLegacyRouter.get('/',              obtenerTodosLosUsuarios)
usuariosLegacyRouter.get('/me',            requireAuth, obtenerUsuarioActual)
usuariosLegacyRouter.get('/:id(\\d+)',      obtenerUsuarioPorId) // ← Regex: solo IDs numéricos
usuariosLegacyRouter.post('/register',     registrarUsuario)
usuariosLegacyRouter.post('/login',        loginUsuario)
usuariosLegacyRouter.post('/logout',       logoutUsuario)

// Las funciones se importan con alias (renombradas con 'as'):
// crearUsuarioBasico as registrarUsuario
// login as loginUsuario`}
      />

      <Callout type="tip" title="El patrón /:id(\\d+) — Regex en parámetros de ruta">
        <p>
          Express permite agregar una expresión regular directamente en los parámetros de ruta. <code>/:id(\d+)</code> significa que el parámetro <code>:id</code> solo va a hacer match si el valor son <strong>dígitos numéricos</strong> (<code>\d+</code>). Así, <code>/api/usuarios/5</code> funciona pero <code>/api/usuarios/me</code> va a la ruta <code>/me</code> y no intenta parsear "me" como un ID.
        </p>
      </Callout>

      <h2 id="appts-api">4. El Montaje de Rutas de la API</h2>
      <p>
        Con <code>app.use('/prefijo', router)</code>, Express delega todas las peticiones que empiecen con ese prefijo al router correspondiente. El prefijo se <strong>descarta</strong> antes de pasar al router, por eso en <code>metahumano.routes.ts</code> las rutas empiezan con <code>'/'</code> y no con <code>'/api/metahumanos'</code>.
      </p>

      <CodeBlock
        title="Cómo funciona el montaje de rutas"
        language="TypeScript"
        code={`// En app.ts:
app.use('/api/metahumanos', metahumanosRoutes)

// Cuando llega: GET /api/metahumanos/5
// Express stripea el prefijo → el router recibe: GET /5
// En metahumano.routes.ts hay: router.get('/:id', findOne)
// → ¡Match! Se ejecuta findOne con req.params.id = "5"

// Cuando llega: POST /api/metahumanos/registro
// Express stripea el prefijo → el router recibe: POST /registro
// En metahumano.routes.ts hay: router.post('/registro', crearPerfilMetahumano)
// → ¡Match! Se ejecuta crearPerfilMetahumano`}
      />

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Prefijo</th>
              <th>Router / Módulo</th>
              <th>Responsabilidad</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>/api/usuarios</code></td><td><code>usuariosLegacyRouter</code></td><td>Registro, login, logout y perfil de usuarios</td></tr>
            <tr><td><code>/api/metahumanos</code></td><td><code>metahumanosRoutes</code></td><td>CRUD de metahumanos, poderes, notificaciones</td></tr>
            <tr><td><code>/api/poderes</code></td><td><code>poderesRoutes</code></td><td>Catálogo de superpoderes disponibles</td></tr>
            <tr><td><code>/api/metapoderes</code></td><td><code>metaPoderesRoutes</code></td><td>Asignación directa de poderes a metahumanos</td></tr>
            <tr><td><code>/api/burocratas</code></td><td><code>burocratasRouter</code></td><td>Gestión de burócratas del sistema</td></tr>
            <tr><td><code>/api/multas</code></td><td><code>multasRouter</code></td><td>Multas asignadas a metahumanos</td></tr>
            <tr><td><code>/api/evidencias</code></td><td><code>evidenciaRouter</code></td><td>Evidencias asociadas a carpetas</td></tr>
            <tr><td><code>/api/carpetas</code></td><td><code>carpetaRouter</code></td><td>Expedientes/trámites de metahumanos</td></tr>
            <tr><td><code>/api/auth</code></td><td><code>usuarioRouter</code></td><td>Autenticación nueva (JWT, cookies)</td></tr>
            <tr><td><code>/api/villanos</code></td><td><code>villanoRoutes</code></td><td>Operaciones específicas de villanos</td></tr>
            <tr><td><code>/api/heroes</code></td><td><code>heroeRoutes</code></td><td>Operaciones específicas de héroes</td></tr>
            <tr><td><code>/api/noticias</code></td><td><code>noticiaRouter</code></td><td>Feed de noticias del sistema</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="appts-errors">5. El Manejo Centralizado de Errores</h2>
      <p>
        Express tiene un mecanismo especial para el manejo de errores: un middleware con <strong>cuatro parámetros</strong> <code>(err, req, res, next)</code>. Express lo reconoce por la aridad (número de parámetros) y lo usa solo cuando ocurre un error.
      </p>

      <CodeBlock
        title="Cómo se propaga un error hasta el handler centralizado"
        language="TypeScript"
        code={`// En un controlador cualquiera, si algo falla:
async function findOne(req, res) {
  try {
    const metahumano = await em.findOneOrFail(Metahumano, { id: 999 })
    // findOneOrFail lanza NotFoundError si no existe
  } catch (error) {
    // Opción A: Manejar el error localmente
    res.status(500).json({ message: error.message })
    
    // Opción B: Pasar el error al handler centralizado
    next(error)  // Express lo detecta y llama a errorHandler(error, req, res, next)
  }
}

// errorHandler en error.middleware.ts:
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode
    || (err.name === 'NotFoundError' ? 404 : 500)
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message
  })
}

// IMPORTANTE: debe ser el ÚLTIMO app.use() registrado
app.use(errorHandler)`}
      />

      <h2 id="appts-export">6. La Exportación del Módulo</h2>

      <CodeBlock
        title="¿Por qué exportar de dos formas?"
        language="TypeScript"
        code={`// Exportación nombrada — para importar por nombre específico
export { app }

// Exportación por defecto — para importar con cualquier nombre
export default app

// En server.ts:
import app from './app.js'        // usa el export default
app.listen(3000, () => console.log('Servidor en puerto 3000'))

// En tests (usando supertest):
import { app } from './app.js'    // usa el export nombrado
import request from 'supertest'
const res = await request(app).get('/api/metahumanos')
// → No se abre un puerto real, solo se testea la lógica`}
      />

      <Callout type="deep-dive" title="🔍 ¿Por qué importar errorHandler al final del archivo?">
        <p>
          En la línea 92 del archivo real, <code>import {'{ errorHandler }'} from './shared/middlewares/error.middleware.js'</code> está al final, no al principio. Esto es válido en ESModules (los módulos se resuelven antes de ejecutar el código), pero es una práctica inusual que probablemente fue agregada después. Lo importante es que <code>app.use(errorHandler)</code> siga siendo el <strong>último middleware registrado</strong>.
        </p>
      </Callout>
    </div>
  );
}
