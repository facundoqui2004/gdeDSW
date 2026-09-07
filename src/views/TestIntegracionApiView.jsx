import React from 'react';
import CodeBlock from '../components/CodeBlock';
import Callout from '../components/Callout';
import Quiz from '../components/Quiz';
import TestTrace from '../components/TestTrace';

const FULL_CODE = `import { test, describe, after } from 'node:test'
import assert from 'node:assert'
import request from 'supertest'
import { app } from '../app.js'
import { orm } from '../shared/db/orm.js'
import jwt from 'jsonwebtoken'
import { config } from '../config/environment.js'

describe('Test de Integración - Flujo Completo de Autenticación, Roles y Rutas Protegidas', () => {

  after(async () => {
    try {
      await orm.close(true)
    } catch {
      // Ignore if already closed
    }
  })

  const adminToken = jwt.sign(
    { usuarioId: 1, email: 'admin_test@supergestor.com', role: 'ADMIN', perfil: 'admin' },
    config.jwtSecret,
    { expiresIn: '1h' }
  )

  const metahumanoToken = jwt.sign(
    { usuarioId: 2, email: 'meta_test@supergestor.com', role: 'METAHUMANO', perfil: 'metahumano' },
    config.jwtSecret,
    { expiresIn: '1h' }
  )

  test('INT-1: Debería bloquear acceso a rutas protegidas sin credenciales (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/auth/perfil')
    assert.strictEqual(res.status, 401, 'Debe retornar 401 al consultar perfil sin token')
    assert.ok(res.body.message.includes('No autenticado'), 'El mensaje debe indicar falta de autenticación')
  })

  test('INT-2: Debería denegar acceso con 403 Forbidden cuando un METAHUMANO intenta acceder a rutas de ADMIN', async () => {
    const res = await request(app)
      .get('/api/auth/admin/usuarios')
      .set('Authorization', \`Bearer \${metahumanoToken}\`)

    assert.strictEqual(res.status, 403, 'Debe retornar 403 al no tener rol ADMIN')
    assert.ok(res.body.message.includes('Acceso denegado'), 'El mensaje debe indicar permisos insuficientes')
  })

  test('INT-3: Debería permitir a un ADMIN consultar endpoints de administración de usuarios', async () => {
    const res = await request(app)
      .get('/api/auth/admin/usuarios')
      .set('Authorization', \`Bearer \${adminToken}\`)

    assert.strictEqual(res.status, 200, 'El administrador debe recibir estado 200')
    assert.ok(Array.isArray(res.body.usuarios), 'La respuesta debe contener la lista de usuarios')
    assert.ok(res.body.pagination, 'La respuesta debe contener metadatos de paginación')
  })

  test('INT-4: Debería procesar correctamente el cierre de sesión (Logout) limpiando cookies', async () => {
    const res = await request(app).post('/api/auth/logout')
    assert.strictEqual(res.status, 200, 'Logout debe retornar 200')
    assert.strictEqual(res.body.message, 'Logout exitoso')
  })

  test('INT-5: Debería responder con 404 Resource not found para rutas inexistentes', async () => {
    const res = await request(app).get('/api/ruta-que-no-existe-en-el-sistema')
    assert.strictEqual(res.status, 404)
    assert.strictEqual(res.body.message, 'Resource not found')
  })
})`;

const SUPERTEST_CODE = `import request from 'supertest'
import { app } from '../app.js'

// Así se hace un request HTTP real al servidor en tests:
const res = await request(app).get('/api/auth/perfil')`;

const TOKENS_CODE = `// Tokens generados ANTES de los tests (fuera de bloques test())
const adminToken = jwt.sign(
  { usuarioId: 1, email: 'admin_test@supergestor.com', role: 'ADMIN', perfil: 'admin' },
  config.jwtSecret,
  { expiresIn: '1h' }
)

const metahumanoToken = jwt.sign(
  { usuarioId: 2, email: 'meta_test@supergestor.com', role: 'METAHUMANO', perfil: 'metahumano' },
  config.jwtSecret,
  { expiresIn: '1h' }
)`;

const INT1_CODE = `test('INT-1: Debería bloquear acceso a rutas protegidas sin credenciales (401 Unauthorized)', async () => {
  const res = await request(app).get('/api/auth/perfil')
  assert.strictEqual(res.status, 401, 'Debe retornar 401 al consultar perfil sin token')
  assert.ok(res.body.message.includes('No autenticado'), 'El mensaje debe indicar falta de autenticación')
})`;

const INT2_CODE = `test('INT-2: Debería denegar acceso con 403 Forbidden cuando un METAHUMANO intenta acceder a rutas de ADMIN', async () => {
  const res = await request(app)
    .get('/api/auth/admin/usuarios')
    .set('Authorization', \`Bearer \${metahumanoToken}\`)

  assert.strictEqual(res.status, 403, 'Debe retornar 403 al no tener rol ADMIN')
  assert.ok(res.body.message.includes('Acceso denegado'), 'El mensaje debe indicar permisos insuficientes')
})`;

const INT3_CODE = `test('INT-3: Debería permitir a un ADMIN consultar endpoints de administración de usuarios', async () => {
  const res = await request(app)
    .get('/api/auth/admin/usuarios')
    .set('Authorization', \`Bearer \${adminToken}\`)

  assert.strictEqual(res.status, 200, 'El administrador debe recibir estado 200')
  assert.ok(Array.isArray(res.body.usuarios), 'La respuesta debe contener la lista de usuarios')
  assert.ok(res.body.pagination, 'La respuesta debe contener metadatos de paginación')
})`;

const INT4_CODE = `test('INT-4: Debería procesar correctamente el cierre de sesión (Logout) limpiando cookies', async () => {
  const res = await request(app).post('/api/auth/logout')
  assert.strictEqual(res.status, 200, 'Logout debe retornar 200')
  assert.strictEqual(res.body.message, 'Logout exitoso')
})`;

const INT5_CODE = `test('INT-5: Debería responder con 404 Resource not found para rutas inexistentes', async () => {
  const res = await request(app).get('/api/ruta-que-no-existe-en-el-sistema')
  assert.strictEqual(res.status, 404)
  assert.strictEqual(res.body.message, 'Resource not found')
})`;

// ─── TRAZAS DE SIMULACIÓN ─────────────────────────────────────────

const traceINT1 = [
  {
    icon: '📡',
    actor: 'supertest',
    action: 'Crea un servidor HTTP temporal con la instancia app de Express y lanza: GET /api/auth/perfil — SIN ningún token en headers ni cookies.',
    result: 'Request: GET /api/auth/perfil  |  Authorization: (ninguno)  |  Cookie: (ninguna)',
    type: 'lib',
  },
  {
    icon: '🧩',
    actor: 'Middleware cors, json, cookieParser',
    action: 'El request pasa por los middlewares globales de app.ts. Ninguno lo detiene.',
    result: 'Continúa al siguiente middleware →',
    type: 'code',
  },
  {
    icon: '🔐',
    actor: 'Middleware autenticación JWT',
    action: 'Busca el token en cookie "auth_token" y en header "Authorization". No encuentra nada.',
    result: 'Sin token detectado → lanza error 401 "No autenticado"',
    type: 'lib',
  },
  {
    icon: '🚨',
    actor: 'Express error handler (handleErrors)',
    action: 'Captura el error 401 y construye la respuesta JSON de error.',
    result: 'res.status(401).json({ message: "No autenticado" })',
    type: 'code',
  },
  {
    icon: '🔍',
    actor: 'assert.strictEqual',
    action: 'Evalúa: res.status === 401',
    result: 'res.status = 401 ✓',
    type: 'assert',
  },
  {
    icon: '🔍',
    actor: 'assert.ok',
    action: 'Evalúa: res.body.message.includes("No autenticado")',
    result: '"No autenticado".includes("No autenticado") → true ✓',
    type: 'assert',
  },
  {
    icon: '✅',
    actor: 'node:test runner',
    action: 'Ambos asserts pasaron. INT-1 marcado como PASS.',
    result: null,
    type: 'ok',
  },
];

const traceINT2 = [
  {
    icon: '🔑',
    actor: 'jwt.sign (setup del describe)',
    action: 'Al inicializar el suite, se generó metahumanoToken con payload: { role: "METAHUMANO", perfil: "metahumano" }, firmado con config.jwtSecret.',
    result: 'metahumanoToken = "eyJhbGciOiJIUzI1Ni..."  (JWT válido, firmado con la clave real)',
    type: 'lib',
  },
  {
    icon: '📡',
    actor: 'supertest',
    action: 'Lanza: GET /api/auth/admin/usuarios con el header Authorization: Bearer {metahumanoToken}',
    result: 'Request: GET /api/auth/admin/usuarios  |  Authorization: Bearer eyJ...',
    type: 'lib',
  },
  {
    icon: '🔐',
    actor: 'Middleware autenticación JWT',
    action: 'Lee el header Authorization, extrae el token, llama a jwt.verify(). La firma es válida → decodifica el payload.',
    result: 'Usuario autenticado: { usuarioId: 2, role: "METAHUMANO" } → req.user asignado',
    type: 'lib',
  },
  {
    icon: '🛡️',
    actor: 'Middleware autorización (requireRole "ADMIN")',
    action: 'Lee req.user.role. Compara: "METAHUMANO" !== "ADMIN". El usuario NO tiene el rol requerido.',
    result: 'Lanza error 403 "Acceso denegado — rol insuficiente"',
    type: 'lib',
  },
  {
    icon: '🚨',
    actor: 'Express error handler',
    action: 'Captura el error 403 y responde con JSON.',
    result: 'res.status(403).json({ message: "Acceso denegado" })',
    type: 'code',
  },
  {
    icon: '🔍',
    actor: 'assert.strictEqual',
    action: 'Evalúa: res.status === 403',
    result: 'res.status = 403 ✓',
    type: 'assert',
  },
  {
    icon: '🔍',
    actor: 'assert.ok',
    action: 'Evalúa: res.body.message.includes("Acceso denegado")',
    result: '"Acceso denegado".includes("Acceso denegado") → true ✓',
    type: 'assert',
  },
  {
    icon: '✅',
    actor: 'node:test runner',
    action: 'Ambos asserts pasaron. INT-2 marcado como PASS.',
    result: null,
    type: 'ok',
  },
];

const traceINT3 = [
  {
    icon: '🔑',
    actor: 'jwt.sign (setup del describe)',
    action: 'Al inicializar el suite, se generó adminToken con payload: { role: "ADMIN", perfil: "admin" }, firmado con config.jwtSecret.',
    result: 'adminToken = "eyJhbGciOiJIUzI1Ni..."  (JWT válido con rol ADMIN)',
    type: 'lib',
  },
  {
    icon: '📡',
    actor: 'supertest',
    action: 'Lanza: GET /api/auth/admin/usuarios con Authorization: Bearer {adminToken}',
    result: 'Request: GET /api/auth/admin/usuarios  |  Authorization: Bearer eyJ...',
    type: 'lib',
  },
  {
    icon: '🔐',
    actor: 'Middleware autenticación JWT',
    action: 'Verifica y decodifica el token. Asigna req.user.',
    result: 'req.user = { usuarioId: 1, role: "ADMIN" }',
    type: 'lib',
  },
  {
    icon: '🛡️',
    actor: 'Middleware autorización (requireRole "ADMIN")',
    action: 'Lee req.user.role. Compara: "ADMIN" === "ADMIN". El usuario SÍ tiene el rol requerido.',
    result: 'Autorizado → next() → continúa al controlador',
    type: 'lib',
  },
  {
    icon: '⚙️',
    actor: 'authController.getUsuarios()',
    action: 'Consulta la base de datos y devuelve la lista de usuarios con paginación.',
    result: 'res.json({ usuarios: [...], pagination: { total: 15, page: 1, limit: 10 } })',
    type: 'code',
  },
  {
    icon: '🔍',
    actor: 'assert.strictEqual',
    action: 'Evalúa: res.status === 200',
    result: 'res.status = 200 ✓',
    type: 'assert',
  },
  {
    icon: '🔍',
    actor: 'assert.ok',
    action: 'Evalúa: Array.isArray(res.body.usuarios)',
    result: 'Array.isArray([...]) → true ✓',
    type: 'assert',
  },
  {
    icon: '🔍',
    actor: 'assert.ok',
    action: 'Evalúa: res.body.pagination (que sea truthy)',
    result: '{ total: 15, page: 1, limit: 10 } → truthy ✓',
    type: 'assert',
  },
  {
    icon: '✅',
    actor: 'node:test runner',
    action: 'Los 3 asserts pasaron. INT-3 marcado como PASS.',
    result: null,
    type: 'ok',
  },
];

const traceINT4 = [
  {
    icon: '📡',
    actor: 'supertest',
    action: 'Lanza: POST /api/auth/logout — sin body ni token. El logout no requiere autenticación previa.',
    result: 'Request: POST /api/auth/logout',
    type: 'lib',
  },
  {
    icon: '⚙️',
    actor: 'authController.logout()',
    action: 'El controlador llama a res.clearCookie("auth_token") para eliminar la cookie de sesión del cliente.',
    result: 'Cookie "auth_token" eliminada del navegador/cliente',
    type: 'code',
  },
  {
    icon: '📤',
    actor: 'authController.logout()',
    action: 'Responde con 200 y el mensaje estandarizado.',
    result: 'res.status(200).json({ message: "Logout exitoso" })',
    type: 'code',
  },
  {
    icon: '🔍',
    actor: 'assert.strictEqual',
    action: 'Evalúa: res.status === 200',
    result: 'res.status = 200 ✓',
    type: 'assert',
  },
  {
    icon: '🔍',
    actor: 'assert.strictEqual',
    action: 'Evalúa: res.body.message === "Logout exitoso"',
    result: '"Logout exitoso" === "Logout exitoso" ✓  (comparación exacta con ===)',
    type: 'assert',
  },
  {
    icon: '✅',
    actor: 'node:test runner',
    action: 'Ambos asserts pasaron. INT-4 marcado como PASS.',
    result: null,
    type: 'ok',
  },
];

const traceINT5 = [
  {
    icon: '📡',
    actor: 'supertest',
    action: 'Lanza: GET /api/ruta-que-no-existe-en-el-sistema',
    result: 'Request: GET /api/ruta-que-no-existe-en-el-sistema',
    type: 'lib',
  },
  {
    icon: '🔀',
    actor: 'Express Router',
    action: 'Recorre TODO el stack del router buscando una ruta que coincida con el path y método. No encuentra ninguna.',
    result: 'Ningún handler matchea → Express llama a next() sin ruta asignada',
    type: 'code',
  },
  {
    icon: '🚨',
    actor: 'Middleware 404 (al final de app.ts)',
    action: 'El último middleware de app.ts captura cualquier request sin handler y responde 404.',
    result: 'res.status(404).json({ message: "Resource not found" })',
    type: 'code',
  },
  {
    icon: '🔍',
    actor: 'assert.strictEqual',
    action: 'Evalúa: res.status === 404',
    result: 'res.status = 404 ✓',
    type: 'assert',
  },
  {
    icon: '🔍',
    actor: 'assert.strictEqual',
    action: 'Evalúa: res.body.message === "Resource not found"',
    result: '"Resource not found" === "Resource not found" ✓',
    type: 'assert',
  },
  {
    icon: '✅',
    actor: 'node:test runner',
    action: 'Ambos asserts pasaron. INT-5 marcado como PASS.',
    result: null,
    type: 'ok',
  },
];

// ─── QUIZ ────────────────────────────────────────────────────────
const quizQuestions = [
  {
    question: '¿Qué hace la librería `supertest` que no puede hacer una llamada `fetch()` directa?',
    options: [
      'Hace requests HTTP más rápidos que fetch()',
      'Permite hacer requests HTTP directamente a la instancia de Express sin necesitar que el servidor esté escuchando en un puerto real',
      'Soporta WebSockets además de HTTP',
      'Genera automáticamente tokens JWT para los tests',
    ],
    correct: 1,
    explanation: 'supertest recibe la instancia de Express directamente (request(app)) y genera un servidor temporal interno. No hay que hacer app.listen() ni apuntar a localhost:3000 — el request va directo al handler de Express.',
  },
  {
    question: '¿Cuál es la diferencia entre un error 401 y un 403 en el SuperGestor?',
    options: [
      '401 es para errores del servidor, 403 es para errores del cliente',
      '401 significa que el usuario no está autenticado (sin token), 403 significa que está autenticado pero no tiene permisos para ese recurso',
      '401 es para rutas inexistentes, 403 es para rutas protegidas',
      'No hay diferencia práctica, son intercambiables',
    ],
    correct: 1,
    explanation: '401 Unauthorized = "¿Quién sos? No tengo idea" — falta el token o es inválido. 403 Forbidden = "Sé quién sos, pero no podés entrar acá" — el token es válido pero el rol no tiene permiso. INT-1 prueba 401; INT-2 prueba 403.',
  },
  {
    question: '¿Por qué los tokens de prueba se generan FUERA de los bloques `test()`?',
    options: [
      'Porque jwt.sign() no puede ejecutarse dentro de funciones async',
      'Para que los tokens sean generados una sola vez y compartidos entre todos los tests, ahorrando tiempo de ejecución',
      'Porque node:test no permite código sincrónico dentro de test()',
      'Para que TypeScript pueda inferir su tipo correctamente',
    ],
    correct: 1,
    explanation: 'Los tokens se generan una vez al inicializar el módulo del describe y se reutilizan en INT-2 e INT-3. Si se generaran dentro de cada test, se crearían tokens diferentes cada vez (aunque igualmente válidos). Generarlos afuera es una optimización y hace el código más legible.',
  },
  {
    question: '¿Qué verifica `assert.ok(Array.isArray(res.body.usuarios))` en INT-3?',
    options: [
      'Que el array tenga al menos un usuario',
      'Que la respuesta sea un array JSON y no un objeto, string u otro tipo',
      'Que todos los usuarios sean del rol ADMIN',
      'Que la respuesta venga con Content-Type: application/json',
    ],
    correct: 1,
    explanation: 'Array.isArray() retorna true solo si el valor es un Array. assert.ok() falla si recibe un valor falsy. Combinados, verifican que el campo "usuarios" en el body de la respuesta sea efectivamente un array (no null, undefined, string, objeto, etc.).',
  },
  {
    question: '¿Qué prueba INT-4 (Logout)?',
    options: [
      'Que el usuario sea redirigido al login después de hacer logout',
      'Que el endpoint POST /api/auth/logout retorne 200 y el mensaje "Logout exitoso", confirmando que la limpieza de cookies funciona',
      'Que el token JWT sea invalidado en la base de datos',
      'Que el usuario no pueda volver a hacer requests después del logout',
    ],
    correct: 1,
    explanation: 'El SuperGestor usa JWT stateless + cookies. El logout no invalida el token en el servidor (no hay sesiones guardadas) sino que limpia la cookie del cliente. INT-4 confirma que el endpoint responde correctamente con 200 y el mensaje esperado.',
  },
  {
    question: '¿Qué es un "Test de Integración" y en qué se diferencia de un "Test Unitario"?',
    options: [
      'Un test de integración es más rápido que un test unitario',
      'Un test unitario prueba piezas aisladas; un test de integración prueba cómo múltiples partes del sistema funcionan juntas (router + middlewares + auth + BD)',
      'Los tests de integración solo se usan en frontend',
      'Un test de integración no necesita base de datos para correr',
    ],
    correct: 1,
    explanation: 'Los tests unitarios aíslan una función o módulo y prueban solo esa lógica. Los tests de integración (como integracion_api.test.ts) verifican el flujo completo: un request HTTP pasa por el router, los middlewares de autenticación y autorización, y llega al controlador — todo junto, como en producción.',
  },
];

export default function TestIntegracionApiView() {
  return (
    <article id="test-integracion-view">

      {/* ── HEADER ── */}
      <div id="tint-header">
        <div className="module-header">
          <span className="module-tag">Testing</span>
          <h1>🔗 Tests de Integración — integracion_api.test.ts</h1>
          <p className="module-subtitle">
            Cómo el SuperGestor verifica el flujo completo de autenticación, autorización
            por roles y comportamiento de rutas protegidas usando <code>supertest</code>.
          </p>
        </div>
      </div>

      <Callout type="note">
        Este es un <strong>test de integración</strong>: en lugar de probar partes aisladas,
        verifica que el router de Express, los middlewares de JWT, el control de roles ADMIN/METAHUMANO
        y el manejo de errores funcionen correctamente <em>juntos</em>, como en producción real.
      </Callout>

      {/* ── SECCIÓN 1: CÓDIGO COMPLETO ── */}
      <section id="tint-full" className="doc-section">
        <h2>1. Código completo</h2>
        <CodeBlock code={FULL_CODE} language="typescript" />
      </section>

      {/* ── SECCIÓN 2: SUPERTEST ── */}
      <section id="tint-supertest" className="doc-section">
        <h2>2. La librería <code>supertest</code></h2>
        <p>
          La diferencia clave de este archivo respecto al de autenticación es el uso de{' '}
          <code>supertest</code>. Esta librería permite hacer <strong>requests HTTP reales</strong>{' '}
          a la instancia de Express sin necesitar que el servidor esté escuchando en un puerto.
        </p>
        <CodeBlock code={SUPERTEST_CODE} language="typescript" />

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Enfoque</th>
                <th>Cómo funciona</th>
                <th>Cuándo usarlo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>supertest</code></td>
                <td>Recibe la instancia Express, crea un servidor temporal interno y lanza el request directamente</td>
                <td>Tests de integración — verificar el pipeline completo de un endpoint</td>
              </tr>
              <tr>
                <td><code>fetch()</code> / <code>axios</code></td>
                <td>Hace un request HTTP real a una URL (requiere servidor corriendo en un puerto)</td>
                <td>Tests E2E contra un servidor ya levantado, o cliente real</td>
              </tr>
              <tr>
                <td>Llamada directa a la función</td>
                <td>Invoca el controlador/servicio sin pasar por Express</td>
                <td>Tests unitarios — probar solo la lógica aislada</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip">
          Con <code>supertest</code>, el servidor <strong>nunca</strong> escucha en un puerto real.
          No hay que hacer <code>app.listen(3000)</code> en los tests. Esto los hace más rápidos
          y evita conflictos de puertos entre tests paralelos.
        </Callout>
      </section>

      {/* ── SECCIÓN 3: TOKENS DE PRUEBA ── */}
      <section id="tint-tokens" className="doc-section">
        <h2>3. Tokens de prueba por roles</h2>
        <p>
          Antes de los tests, el archivo genera dos JWTs válidos firmados con la clave real del
          SuperGestor: uno para un ADMIN y otro para un METAHUMANO. Estos tokens se reutilizan
          en múltiples tests.
        </p>
        <CodeBlock code={TOKENS_CODE} language="typescript" />

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Role en el payload</th>
                <th>Qué puede hacer</th>
                <th>Usado en</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>adminToken</code></td>
                <td><code>ADMIN</code></td>
                <td>Acceder a endpoints de administración de usuarios</td>
                <td>INT-3</td>
              </tr>
              <tr>
                <td><code>metahumanoToken</code></td>
                <td><code>METAHUMANO</code></td>
                <td>Acceder a endpoints propios del metahumano (perfil, poderes)</td>
                <td>INT-2 — para verificar que un METAHUMANO NO puede acceder a rutas de ADMIN</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN 4: INT-1 ── */}
      <section id="tint-1" className="doc-section">
        <h2>4. INT-1 — Sin credenciales → 401 Unauthorized</h2>
        <CodeBlock code={INT1_CODE} language="typescript" />

        <TestTrace
          testName="INT-1 — GET /api/auth/perfil sin token"
          steps={traceINT1}
          verdict="pass"
        />

        <Callout type="warn">
          <strong>401 vs 403:</strong> El 401 significa "No sé quién sos — falta autenticación".
          El middleware de JWT detecta que no hay cookie ni header Authorization y responde 401
          antes de siquiera ejecutar el controlador.
        </Callout>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código HTTP</th>
                <th>Significado</th>
                <th>Causa en el SuperGestor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>401</strong> Unauthorized</td>
                <td>No autenticado — falta identidad</td>
                <td>No hay token JWT (ni en cookie ni en header Bearer)</td>
              </tr>
              <tr>
                <td><strong>403</strong> Forbidden</td>
                <td>Autenticado pero sin permiso</td>
                <td>El token es válido pero el rol no tiene acceso a ese endpoint</td>
              </tr>
              <tr>
                <td><strong>404</strong> Not Found</td>
                <td>El recurso no existe</td>
                <td>La ruta no está registrada en el router de Express</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN 5: INT-2 ── */}
      <section id="tint-2" className="doc-section">
        <h2>5. INT-2 — METAHUMANO intenta acceder a ruta de ADMIN → 403 Forbidden</h2>
        <CodeBlock code={INT2_CODE} language="typescript" />

        <TestTrace
          testName="INT-2 — GET /api/auth/admin/usuarios con token METAHUMANO"
          steps={traceINT2}
          verdict="pass"
        />

        <Callout type="note">
          El SuperGestor soporta autenticación tanto por <strong>cookie</strong> (para el
          frontend) como por <strong>header Bearer</strong> (para clientes API). El middleware
          de JWT verifica ambas fuentes. Acá se usa Bearer porque es más directo en tests.
        </Callout>
      </section>

      {/* ── SECCIÓN 6: INT-3 ── */}
      <section id="tint-3" className="doc-section">
        <h2>6. INT-3 — ADMIN accede a endpoint de administración → 200 OK</h2>
        <CodeBlock code={INT3_CODE} language="typescript" />

        <TestTrace
          testName="INT-3 — GET /api/auth/admin/usuarios con token ADMIN"
          steps={traceINT3}
          verdict="pass"
        />

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Assert</th>
                <th>Qué verifica</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>res.status === 200</code></td>
                <td>El endpoint procesó el request exitosamente</td>
              </tr>
              <tr>
                <td><code>Array.isArray(res.body.usuarios)</code></td>
                <td>El campo <code>usuarios</code> del JSON de respuesta es un array (no null, objeto, etc.)</td>
              </tr>
              <tr>
                <td><code>res.body.pagination</code></td>
                <td>La respuesta incluye metadatos de paginación (existe el campo, aunque sea vacío)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN 7: INT-4 ── */}
      <section id="tint-4" className="doc-section">
        <h2>7. INT-4 — Logout limpia la sesión → 200 OK</h2>
        <CodeBlock code={INT4_CODE} language="typescript" />

        <TestTrace
          testName="INT-4 — POST /api/auth/logout"
          steps={traceINT4}
          verdict="pass"
        />

        <Callout type="note">
          Como el SuperGestor usa JWT <strong>stateless</strong>, el "logout" real consiste en
          eliminar la cookie del cliente. El servidor no guarda una lista de tokens invalidados
          — si alguien capturó el token antes del logout, seguirá siendo válido hasta que expire.
          Esta es la limitación conocida del JWT stateless.
        </Callout>
      </section>

      {/* ── SECCIÓN 8: INT-5 ── */}
      <section id="tint-5" className="doc-section">
        <h2>8. INT-5 — Ruta inexistente → 404 Resource not found</h2>
        <CodeBlock code={INT5_CODE} language="typescript" />

        <TestTrace
          testName="INT-5 — GET /api/ruta-que-no-existe-en-el-sistema"
          steps={traceINT5}
          verdict="pass"
        />

        <p>
          En <code>app.ts</code>, al final de todos los middlewares, hay un handler que captura
          cualquier request que no matcheó ninguna ruta y responde con 404 estandarizado.
        </p>
      </section>

      {/* ── SECCIÓN 9: FLUJO COMPLETO ── */}
      <section id="tint-flow" className="doc-section">
        <h2>9. Flujo completo de un request de integración</h2>
        <p>
          Cuando <code>supertest</code> ejecuta un request, pasa por el mismo pipeline que
          en producción:
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Paso</th>
                <th>Qué ocurre</th>
                <th>Qué puede responder</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1. CORS</td>
                <td>Verifica el origen del request</td>
                <td>403 si el origen no está permitido</td>
              </tr>
              <tr>
                <td>2. cookieParser</td>
                <td>Parsea las cookies de la request</td>
                <td>—</td>
              </tr>
              <tr>
                <td>3. express.json</td>
                <td>Parsea el body JSON</td>
                <td>400 si el JSON está malformado</td>
              </tr>
              <tr>
                <td>4. RequestContext</td>
                <td>Abre el EntityManager de MikroORM para este request</td>
                <td>—</td>
              </tr>
              <tr>
                <td>5. Router match</td>
                <td>Busca la ruta registrada que coincida con el método + path</td>
                <td>404 si no hay match → INT-5</td>
              </tr>
              <tr>
                <td>6. Middleware autenticación</td>
                <td>Verifica el JWT (cookie o header Bearer)</td>
                <td>401 si no hay token → INT-1</td>
              </tr>
              <tr>
                <td>7. Middleware autorización</td>
                <td>Verifica que el rol tenga permiso</td>
                <td>403 si el rol no alcanza → INT-2</td>
              </tr>
              <tr>
                <td>8. Controlador</td>
                <td>Ejecuta la lógica de negocio y retorna la respuesta</td>
                <td>200 con datos → INT-3, INT-4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN 10: CONCEPTOS CLAVE ── */}
      <section id="tint-concepts" className="doc-section">
        <h2>10. Conceptos clave</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Explicación aplicada al SuperGestor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Test de integración</strong></td>
                <td>Verifica múltiples componentes juntos (router + auth + autorización). Más lento que unitario pero más realista.</td>
              </tr>
              <tr>
                <td><strong>supertest</strong></td>
                <td>Permite testear endpoints Express sin un servidor real. Recibe la instancia de app y genera requests HTTP internamente.</td>
              </tr>
              <tr>
                <td><strong>Bearer Token</strong></td>
                <td>Estándar para enviar JWT en el header: <code>Authorization: Bearer {'<token>'}</code>. El SuperGestor acepta también cookies.</td>
              </tr>
              <tr>
                <td><strong>Autorización por roles</strong></td>
                <td>El middleware lee el campo <code>role</code> del payload JWT y decide si el usuario puede acceder al endpoint.</td>
              </tr>
              <tr>
                <td><strong>Logout stateless</strong></td>
                <td>Sin sesiones en el servidor, el logout elimina la cookie del cliente. El token sigue siendo válido hasta expirar.</td>
              </tr>
              <tr>
                <td><strong>Paginación en respuestas</strong></td>
                <td>Los endpoints de listado incluyen un campo <code>pagination</code> con metadatos (total, página, límite).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN 11: GUÍA CONCEPTUAL COMPLETA ── */}
      <section id="tint-guia" className="doc-section">
        <h2>11. 📖 Guía conceptual completa</h2>

        <p>
          Este archivo es un <strong>Test de Integración</strong>: no evalúa funciones aisladas,
          sino cómo interactúan <em>todas las piezas</em> de tu servidor Express (rutas,
          middlewares, base de datos y autenticación) ante peticiones HTTP simuladas.
        </p>

        <h3>11.1 Las herramientas (Imports)</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Herramienta</th>
                <th>Rol en el archivo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>node:test</code> (<code>test</code>, <code>describe</code>, <code>after</code>)</td>
                <td>
                  Corredor de pruebas nativo de Node.js. <code>describe</code> agrupa pruebas de
                  una misma categoría, <code>test</code> define cada prueba individual y{' '}
                  <code>after</code> es un <em>hook</em> que se ejecuta al finalizar todo el suite.
                </td>
              </tr>
              <tr>
                <td><code>node:assert</code></td>
                <td>
                  El juez. Verifica que los resultados obtenidos sean los esperados.{' '}
                  <code>assert.strictEqual(a, b)</code> asegura que <code>a</code> sea exactamente
                  igual a <code>b</code>. Si la condición no se cumple, la prueba falla y te avisa.
                </td>
              </tr>
              <tr>
                <td><code>supertest</code> (<code>request</code>)</td>
                <td>
                  Como un Postman automatizado integrado en el código. Levanta tu app Express en
                  memoria y le dispara peticiones HTTP (<code>GET</code>, <code>POST</code>)
                  internamente, <strong>sin necesitar un servidor en un puerto real</strong>.
                </td>
              </tr>
              <tr>
                <td><code>jsonwebtoken</code> (<code>jwt</code>)</td>
                <td>
                  Se usa para fabricar tokens <strong>falsos pero válidos
                  criptográficamente</strong>, ahorrando la necesidad de programar un login real
                  antes de cada prueba.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>11.2 Preparación del entorno</h3>

        <h4>El bloque <code>after</code></h4>
        <p>
          Se asegura de cerrar la conexión a la base de datos (<code>orm.close()</code>) cuando
          terminan los tests. Si omitís esto, el proceso de Node.js se queda{' '}
          <strong>colgado</strong> esperando y la terminal nunca finaliza la ejecución.
        </p>

        <h4>Generación de tokens (<code>adminToken</code> y <code>metahumanoToken</code>)</h4>
        <p>
          En lugar de simular que un usuario tipea su email y contraseña, el código{' '}
          <strong>firma sus propios tokens directamente</strong> usando la clave secreta de tu
          configuración (<code>config.jwtSecret</code>). Crea un token con rol{' '}
          <code>ADMIN</code> y otro con rol <code>METAHUMANO</code>. Esto permite inyectarlos en
          las peticiones inmediatamente, sin pasar por el flujo de login real.
        </p>

        <Callout type="tip">
          Los tokens se generan <strong>fuera</strong> de los bloques <code>test()</code> para que
          sean creados una única vez al inicializar el <code>describe</code> y compartidos entre
          todos los tests. Es una optimización y hace el código más legible.
        </Callout>

        <h3>11.3 Anatomía de los casos de prueba</h3>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Ruta</th>
                <th>Token enviado</th>
                <th>Código esperado</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>INT-1</strong></td>
                <td><code>/api/auth/perfil</code></td>
                <td>❌ Ninguno</td>
                <td><strong>401</strong></td>
                <td>Sin credenciales — el middleware ni siquiera llega al controlador</td>
              </tr>
              <tr>
                <td><strong>INT-2</strong></td>
                <td><code>/api/auth/admin/usuarios</code></td>
                <td><code>metahumanoToken</code></td>
                <td><strong>403</strong></td>
                <td>Autenticado, pero rol insuficiente</td>
              </tr>
              <tr>
                <td><strong>INT-3</strong></td>
                <td><code>/api/auth/admin/usuarios</code></td>
                <td><code>adminToken</code></td>
                <td><strong>200</strong></td>
                <td>Token válido con rol correcto → acceso completo</td>
              </tr>
              <tr>
                <td><strong>INT-4</strong></td>
                <td><code>/api/auth/logout</code></td>
                <td>❌ Ninguno</td>
                <td><strong>200</strong></td>
                <td>Ruta pública — limpia la cookie de sesión</td>
              </tr>
              <tr>
                <td><strong>INT-5</strong></td>
                <td><code>/api/ruta-que-no-existe</code></td>
                <td>❌ Ninguno</td>
                <td><strong>404</strong></td>
                <td>El middleware <em>fallback</em> al final del router captura rutas fantasma</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>11.4 Analogías de la vida real</h3>

        <p>
          Las analogías son la mejor forma de fijar la lógica de los sistemas en la mente.
          Cada test traducido a una situación cotidiana:
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Analogía</th>
                <th>Concepto clave</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>INT-1 · 401</strong></td>
                <td>
                  🏋️ <strong>El molinete del gimnasio.</strong> Llegás sin tu carnet y el
                  molinete no gira. El sistema no sabe quién sos ni si tenés la cuota al día.
                </td>
                <td>El servidor te detiene en la puerta porque <strong>no presentaste ninguna credencial</strong>.</td>
              </tr>
              <tr>
                <td><strong>INT-2 · 403</strong></td>
                <td>
                  🎓 <strong>El campus virtual de la facultad.</strong> Entrás con tu usuario de
                  estudiante (credencial válida, superaste el 401), pero intentás cargar notas
                  finales. El sistema te reconoce, pero te bloquea: <em>"Eres estudiante, no
                  profesor"</em>.
                </td>
                <td>Estás <strong>identificado</strong>, pero tenés el <strong>rol equivocado</strong>.</td>
              </tr>
              <tr>
                <td><strong>INT-3 · 200</strong></td>
                <td>
                  🏪 <strong>El panel de control de tu tienda.</strong> Un cliente normal jamás
                  puede ver la base de datos de compradores. Pero vos, como dueño con tu llave de
                  administrador, abrís la oficina trasera y recibís la lista completa.
                </td>
                <td>El servidor confirma que <strong>tenés permiso</strong> y entrega lo que pediste.</td>
              </tr>
              <tr>
                <td><strong>INT-4 · Logout</strong></td>
                <td>
                  🔑 <strong>Devolver la llave del casillero.</strong> Terminaste la jornada, vas
                  a recepción y devolvés la llave. El sistema destruye tu pase temporal. Si cinco
                  minutos después intentás volver sin registrarte de nuevo, no podés.
                </td>
                <td>El logout limpia tu cookie — el <strong>pase antiguo ya no tiene validez</strong>.</td>
              </tr>
              <tr>
                <td><strong>INT-5 · 404</strong></td>
                <td>
                  🚪 <strong>El aula inexistente.</strong> Tu horario dice "Aula 99" pero el
                  edificio solo llega al 50. Caminás por el pasillo hasta que el empleado de
                  mantenimiento te dice: <em>"Esa puerta no fue construida en este edificio"</em>.
                </td>
                <td>El servidor te avisa que la dirección que escribiste <strong>no existe en su mapa de rutas</strong>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── QUIZ ── */}
      <section id="tint-quiz" className="doc-section">
        <h2>12. 📝 Quiz de Estudio</h2>
        <p>Verificá que entendiste el flujo de integración del SuperGestor:</p>
        <Quiz questions={quizQuestions} />
      </section>

    </article>
  );
}
