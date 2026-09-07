import React from 'react';
import CodeBlock from '../components/CodeBlock';
import Callout from '../components/Callout';
import Quiz from '../components/Quiz';
import TestTrace from '../components/TestTrace';

const FULL_CODE = `import { test, describe, after } from 'node:test'
import assert from 'node:assert'
import { app } from '../app.js'
import { orm } from '../shared/db/orm.js'

describe('Backend Express API Architecture', () => {
  after(async () => {
    try {
      await orm.close(true)
    } catch {}
  })

  test('App Instance is initialized properly', () => {
    assert.strictEqual(typeof app, 'function')
    assert.strictEqual(typeof app.listen, 'function')
    assert.strictEqual(typeof app.use, 'function')
  })

  test('Main API endpoints are registered on express router', () => {
    const routerStack = (app as any)._router?.stack || []
    const paths = routerStack
      .filter((layer: any) => layer.route || layer.regexp)
      .map((layer: any) => layer.route?.path || layer.regexp?.toString())

    assert.ok(routerStack.length > 0)
  })
})`;

const IMPORTS_CODE = `import { test, describe, after } from 'node:test'
import assert from 'node:assert'
import { app } from '../app.js'
import { orm } from '../shared/db/orm.js'`;

const AFTER_CODE = `after(async () => {
  try {
    await orm.close(true)
  } catch {}
})`;

const TEST1_CODE = `test('App Instance is initialized properly', () => {
  assert.strictEqual(typeof app, 'function')
  assert.strictEqual(typeof app.listen, 'function')
  assert.strictEqual(typeof app.use, 'function')
})`;

const TEST2_CODE = `test('Main API endpoints are registered on express router', () => {
  const routerStack = (app as any)._router?.stack || []
  const paths = routerStack
    .filter((layer: any) => layer.route || layer.regexp)
    .map((layer: any) => layer.route?.path || layer.regexp?.toString())

  assert.ok(routerStack.length > 0)
})`;

const OR_CODE = `// Si _router?.stack existe y no es falsy → lo usa
// Si es undefined (router no inicializado) → usa [] como valor por defecto
const routerStack = (app as any)._router?.stack || []

// Equivalente más largo:
const raw = (app as any)._router?.stack
const routerStack2 = raw !== undefined && raw !== null ? raw : []`;

const AS_ANY_CODE = `// ❌ Error de TypeScript — _router no figura en los tipos de Express:
const stack = app._router?.stack  // Property '_router' does not exist on type 'Express'

// ✅ Con (app as any) TypeScript se "calla" y deja pasar:
const stack = (app as any)._router?.stack  // OK`;

const LAZY_CODE = `// Estado al ejecutar express():
const app = express()
console.log(app._router)  // → undefined  ← El router AÚN NO EXISTE

// Después de registrar el primer middleware:
app.use(cors())
console.log(app._router)  // → Router { stack: [...] }  ← Ahora sí existe`;

const ORDER_CODE = `// ❌ ORDEN INCORRECTO — lees el stack ANTES de registrar rutas:
const app = express()
const stack = (app as any)._router?.stack || []
console.log(stack.length)  // → 0  ← Vacío, las rutas no se leyeron todavía

app.use('/api/auth', authRouter)  // esto vino DESPUÉS

// ✅ ORDEN CORRECTO — en app.test.ts, app.ts ya se ejecutó completo al importarse:
import { app } from '../app.js'   // ← app.ts corrió, registró TODO
const stack = (app as any)._router?.stack || []
console.log(stack.length)  // → 19  ← Todas las capas están ahí`;

const FILTER_MAP_CODE = `// El stack crudo tiene capas "de ruido" internas de Express:
// [Query, init, cors, json, urlencoded, cookieParser, RequestContext,
//  usuariosLegacyRouter, metahumanosRoutes, ... , 404handler, errorHandler]

// .filter() — se queda solo con capas que tienen ruta real o regexp:
const filtradas = routerStack.filter((layer) => layer.route || layer.regexp)

// .map() — extrae solo el texto del path o la regexp como string:
const paths = filtradas.map((layer) => layer.route?.path || layer.regexp?.toString())

// Resultado final limpio:
// ['/api/usuarios', '/api/metahumanos', '/api/poderes', '/api/auth', ...]`;

const ASSERT_OK_CODE = `// assert.ok(expresion) — falla si la expresión es falsy
assert.ok(routerStack.length > 0)

// Equivalente a:
if (!(routerStack.length > 0)) {
  throw new AssertionError('El routerStack está vacío — no hay rutas registradas')
}

// ¿Qué pasa si falla?
// El test para en seco, el runner lo marca como FAIL y muestra el error.
// El servidor nunca debería arrancar si no tiene rutas.`;

// ─── SIMULACIONES ────────────────────────────────────────────────
const traceTest1 = [
  {
    icon: '🚀',
    actor: 'node:test runner',
    action: 'Inicia el describe "Backend Express API Architecture" y ejecuta el primer test.',
    result: null,
    type: 'runner',
  },
  {
    icon: '📦',
    actor: 'Módulo app.ts',
    action: 'Se importó al arrancar el archivo. La constante `app` ya está en memoria como el valor que devolvió express().',
    result: 'app = express()  →  tipo: function',
    type: 'code',
  },
  {
    icon: '🔍',
    actor: 'assert.strictEqual',
    action: 'Evalúa: typeof app === "function"',
    result: 'typeof app → "function" ✓  (Express internamente es una función Node.js request handler)',
    type: 'assert',
  },
  {
    icon: '🔍',
    actor: 'assert.strictEqual',
    action: 'Evalúa: typeof app.listen === "function"',
    result: 'typeof app.listen → "function" ✓  (método para arrancar el servidor en un puerto)',
    type: 'assert',
  },
  {
    icon: '🔍',
    actor: 'assert.strictEqual',
    action: 'Evalúa: typeof app.use === "function"',
    result: 'typeof app.use → "function" ✓  (método para registrar middlewares y routers)',
    type: 'assert',
  },
  {
    icon: '✅',
    actor: 'node:test runner',
    action: 'Los 3 asserts pasaron. El test se marca como PASS.',
    result: null,
    type: 'ok',
  },
];

const traceTest2 = [
  {
    icon: '🚀',
    actor: 'node:test runner',
    action: 'Ejecuta el segundo test: verifica que el router de Express tenga capas registradas.',
    result: null,
    type: 'runner',
  },
  {
    icon: '🏗️',
    actor: '(app as any)',
    action: 'TypeScript no expone _router en sus tipos. El cast "as any" desactiva el chequeo para esta línea.',
    result: 'TypeScript acepta el acceso a _router sin error de compilación',
    type: 'code',
  },
  {
    icon: '🔗',
    actor: '_router?.stack',
    action: 'Optional chaining: si _router existe, accede a .stack. Si es undefined (router lazy no inicializado), devuelve undefined sin explotar.',
    result: '_router existe (app.ts ya registró rutas) → _router.stack = [ 19 capas ]',
    type: 'code',
  },
  {
    icon: '🔄',
    actor: 'Operador ||',
    action: '_router?.stack devolvió el array de 19 capas — es truthy, así que || no activa el fallback.',
    result: 'routerStack = [ cors, json, cookieParser, RequestContext, /api/usuarios, /api/metahumanos, ... ]',
    type: 'code',
  },
  {
    icon: '🧹',
    actor: '.filter()',
    action: 'Descarta capas internas sin ruta real. Se queda solo con las que tienen .route o .regexp.',
    result: 'Capas filtradas = rutas montadas con app.use() + sub-routers',
    type: 'code',
  },
  {
    icon: '🗺️',
    actor: '.map()',
    action: 'Transforma cada capa en un texto legible extrayendo el path o convirtiendo la regexp a string.',
    result: 'paths = [ "/api/usuarios", "/api/metahumanos", "/api/auth", ... ]',
    type: 'code',
  },
  {
    icon: '🔍',
    actor: 'assert.ok',
    action: 'Evalúa: routerStack.length > 0',
    result: 'routerStack.length = 19  →  19 > 0 es true ✓',
    type: 'assert',
  },
  {
    icon: '✅',
    actor: 'node:test runner',
    action: 'El assert pasó. El test se marca como PASS.',
    result: null,
    type: 'ok',
  },
];

const traceAfter = [
  {
    icon: '🏁',
    actor: 'node:test runner',
    action: 'Todos los tests del describe terminaron. Se dispara el hook after().',
    result: null,
    type: 'runner',
  },
  {
    icon: '🗄️',
    actor: 'orm.close(true)',
    action: 'Cierra la conexión a la base de datos. El parámetro true fuerza el cierre aunque haya operaciones pendientes.',
    result: 'Conexión cerrada correctamente',
    type: 'lib',
  },
  {
    icon: '🔇',
    actor: 'catch vacío',
    action: 'Si orm.close() lanza un error (ej: conexión ya cerrada), el catch lo ignora silenciosamente.',
    result: 'El proceso Node.js puede terminar limpiamente sin quedar "colgado"',
    type: 'code',
  },
  {
    icon: '✅',
    actor: 'node:test runner',
    action: 'Suite finalizada. El proceso termina con código 0.',
    result: null,
    type: 'ok',
  },
];

// ─── QUIZ ────────────────────────────────────────────────────────
const quizQuestions = [
  {
    question: '¿Qué hace el operador || en `(app as any)._router?.stack || []`?',
    options: [
      'Combina dos arrays en uno solo',
      'Si _router?.stack es undefined o falsy, devuelve [] como valor por defecto en lugar de explotar',
      'Verifica que el stack tenga más de un elemento',
      'Es el operador OR lógico que compara dos booleanos',
    ],
    correct: 1,
    explanation: '|| devuelve el valor de la izquierda si es truthy, o el de la derecha si es falsy. Acá: si el router aún no fue inicializado y stack es undefined (falsy), en vez de seguir con undefined se usa [] como fallback seguro.',
  },
  {
    question: '¿Por qué se necesita `(app as any)` para acceder a `_router`?',
    options: [
      'Porque _router es una variable global de Node.js',
      'Porque TypeScript no incluye _router en los tipos oficiales de Express — es una propiedad interna. El cast "as any" desactiva el chequeo de tipos para esa línea.',
      'Porque app es de tipo unknown por defecto',
      'Para convertir app de clase a objeto plano',
    ],
    correct: 1,
    explanation: 'TypeScript solo conoce la API pública de Express (get, use, listen, etc.). _router es un detalle interno que no figura en los tipos, por lo tanto el compilador da error si intentás acceder directamente. "as any" le dice a TypeScript que ignore el chequeo en esa expresión.',
  },
  {
    question: '¿Qué significa que Express inicialice su router de forma "lazy"?',
    options: [
      'Que el router tarda varios segundos en inicializarse',
      'Que Express pospone la creación de _router hasta que se registra el primer middleware o ruta — antes de eso, _router es undefined',
      'Que el router se crea en un hilo separado',
      'Que el router solo funciona en producción, no en desarrollo',
    ],
    correct: 1,
    explanation: 'Lazy (perezoso) significa "lo creo cuando lo necesito". Al ejecutar express(), _router no existe todavía. Express lo crea automáticamente en el momento en que se llama app.use() o app.get() por primera vez. Es una optimización de memoria.',
  },
  {
    question: '¿Por qué importa el orden de ejecución del código con la inicialización lazy?',
    options: [
      'No importa el orden, Express siempre tiene el stack completo',
      'Si lees _router.stack ANTES de registrar rutas, el stack estará vacío. En el test funciona porque app.ts ya se ejecutó completo al importarse.',
      'El orden solo importa en producción',
      'Express ejecuta los middlewares en orden inverso al que fueron registrados',
    ],
    correct: 1,
    explanation: 'Si intentaras leer el stack antes de que app.ts corriera sus app.use(), obtendrías un array vacío o undefined. En el test esto no es un problema porque al hacer `import { app } from "../app.js"`, Node.js ejecuta app.ts completo — incluyendo todos los app.use() — antes de que el test corra.',
  },
  {
    question: '¿Qué hacen juntos `.filter()` y `.map()` sobre el routerStack?',
    options: [
      '.filter() ordena las rutas alfabéticamente y .map() las cuenta',
      '.filter() elimina las capas internas de Express sin ruta real, y .map() extrae el path de cada capa que sí quedó',
      '.filter() busca errores en el stack y .map() los formatea',
      'Son redundantes, cualquiera de los dos sería suficiente',
    ],
    correct: 1,
    explanation: 'El stack crudo mezcla capas internas de Express (Query, init) con tus rutas reales. .filter() limpia ese ruido conservando solo capas con .route o .regexp. .map() luego transforma esas capas en strings legibles extrayendo el path o la regexp como texto.',
  },
  {
    question: '¿Qué garantiza `assert.ok(routerStack.length > 0)` al final del test?',
    options: [
      'Que todas las rutas responden con 200',
      'Que el servidor tiene al menos una ruta o middleware registrado — si el stack estuviera vacío, el test falla y detiene la ejecución',
      'Que el número de rutas sea exactamente mayor a cero y menor a cien',
      'Que los paths estén en formato correcto /api/...',
    ],
    correct: 1,
    explanation: 'assert.ok() falla si recibe un valor falsy. Si routerStack.length fuera 0 (stack vacío), la expresión 0 > 0 sería false y el test explotaría con un AssertionError. Es la garantía mínima: el servidor no está en blanco.',
  },
  {
    question: '¿Por qué se usa `after()` en lugar de `afterEach()` para cerrar la conexión a la base de datos?',
    options: [
      'Porque afterEach() no existe en node:test',
      'Porque after() corre UNA sola vez al terminar todos los tests del describe, evitando cerrar la BD entre cada test',
      'Porque after() es más rápido que afterEach()',
      'Porque orm.close() solo puede llamarse una vez en todo el proceso',
    ],
    correct: 1,
    explanation: 'after() ejecuta la limpieza solo cuando TODOS los tests del describe terminaron. afterEach() lo haría entre cada test, cerrando la BD y rompiendo los siguientes. Es el hook de teardown global del suite.',
  },
];

export default function TestAppView() {
  return (
    <article id="test-app-view">

      {/* ── HEADER ── */}
      <div id="tapp-header">
        <div className="module-header">
          <span className="module-tag">Testing</span>
          <h1>🏗️ Tests de Arquitectura — app.test.ts</h1>
          <p className="module-subtitle">
            Cómo el SuperGestor verifica que la instancia Express se construya correctamente
            y que todos los endpoints estén registrados antes de servir cualquier request.
          </p>
        </div>
      </div>

      <Callout type="note">
        Este archivo no testea rutas de negocio ni autenticación — su objetivo es confirmar
        que la <strong>infraestructura base</strong> de la API funciona: la instancia Express
        se inicializa y el router tiene middlewares montados.
      </Callout>

      {/* ── SECCIÓN 1: CÓDIGO COMPLETO ── */}
      <section id="tapp-full" className="doc-section">
        <h2>1. Código completo</h2>
        <CodeBlock code={FULL_CODE} language="typescript" />
      </section>

      {/* ── SECCIÓN 2: IMPORTS Y SETUP ── */}
      <section id="tapp-imports" className="doc-section">
        <h2>2. Imports y configuración</h2>
        <CodeBlock code={IMPORTS_CODE} language="typescript" />

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Import</th>
                <th>Rol en el test</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>test, describe, after</code></td>
                <td>
                  Motor de testing nativo de Node.js. <code>describe</code> agrupa los tests del
                  módulo; <code>test</code> define cada caso; <code>after</code> es el hook de
                  <em>teardown</em> que corre una vez al finalizar todos los tests.
                </td>
              </tr>
              <tr>
                <td><code>assert</code></td>
                <td>Librería nativa de Node.js para comparar valores esperados vs reales. Si una comparación falla, el test falla inmediatamente.</td>
              </tr>
              <tr>
                <td><code>app</code></td>
                <td>
                  La instancia de Express del SuperGestor — el valor que devolvió <code>const app = express()</code>{' '}
                  en <code>app.ts</code>. Es lo que se inspecciona en los tests.
                </td>
              </tr>
              <tr>
                <td><code>orm</code></td>
                <td>
                  La instancia de MikroORM. Se importa únicamente para cerrar la conexión a la BD al finalizar
                  los tests y evitar que el proceso quede colgado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN 3: AFTER HOOK ── */}
      <section id="tapp-after" className="doc-section">
        <h2>3. Hook <code>after()</code> — Limpieza de recursos</h2>
        <p>
          Cuando los tests terminan, es necesario cerrar la conexión a la base de datos.
          Si no se hace, el proceso de Node.js queda "colgado" esperando que se cierren
          las conexiones activas.
        </p>
        <CodeBlock code={AFTER_CODE} language="typescript" />

        <TestTrace
          testName="Simulación — Hook after() al finalizar todos los tests"
          steps={traceAfter}
          verdict="pass"
        />

        <Callout type="warn">
          <strong>¿Por qué <code>after()</code> y no <code>afterEach()</code>?</strong>{' '}
          <code>after()</code> corre <em>una sola vez</em> cuando todos los tests del{' '}
          <code>describe</code> terminaron. <code>afterEach()</code> correría entre cada test,
          cerrando la BD y rompiendo los tests siguientes.
        </Callout>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Hook</th>
                <th>Cuándo corre</th>
                <th>Uso típico</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>before()</code></td>
                <td>Una vez, antes de todos los tests del <code>describe</code></td>
                <td>Inicializar conexiones, crear datos de prueba globales</td>
              </tr>
              <tr>
                <td><code>after()</code></td>
                <td>Una vez, después de todos los tests del <code>describe</code></td>
                <td>Cerrar conexiones, limpiar recursos (teardown global)</td>
              </tr>
              <tr>
                <td><code>beforeEach()</code></td>
                <td>Antes de <em>cada</em> test individual</td>
                <td>Resetear estado, preparar datos frescos por test</td>
              </tr>
              <tr>
                <td><code>afterEach()</code></td>
                <td>Después de <em>cada</em> test individual</td>
                <td>Limpiar mocks, revertir cambios por test</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN 4: TEST 1 ── */}
      <section id="tapp-test1" className="doc-section">
        <h2>4. Test 1 — La instancia Express se inicializa correctamente</h2>
        <CodeBlock code={TEST1_CODE} language="typescript" />

        <TestTrace
          testName="Test 1 — App Instance is initialized properly"
          steps={traceTest1}
          verdict="pass"
        />

        <h3>¿Qué se prueba?</h3>
        <p>Se verifica que la instancia de Express importada desde <code>app.ts</code> sea válida y tenga los métodos esperados:</p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Assert</th>
                <th>Qué verifica</th>
                <th>Por qué importa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>typeof app === 'function'</code></td>
                <td>La instancia Express es una función</td>
                <td>
                  Express retorna una función request handler de Node.js —
                  la función que Node.js llama cada vez que llega un request HTTP.
                  Si el import falló y <code>app</code> es <code>undefined</code>, este assert lo detecta.
                </td>
              </tr>
              <tr>
                <td><code>typeof app.listen === 'function'</code></td>
                <td>El método <code>listen()</code> existe</td>
                <td>
                  <code>listen()</code> es el que arranca el servidor en un puerto.
                  Sin él, el servidor existe en memoria pero nadie puede conectarse.
                </td>
              </tr>
              <tr>
                <td><code>typeof app.use === 'function'</code></td>
                <td>El método <code>use()</code> existe</td>
                <td>
                  <code>use()</code> registra middlewares y sub-routers.
                  Toda la cadena CORS → auth → rutas pasa por <code>use()</code>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip">
          Express internamente es una función con métodos adicionales adjuntos. Por eso{' '}
          <code>typeof app === 'function'</code> y <code>app.listen</code> coexisten sin
          contradicción: Express extiende una función de Node.js añadiéndole su propia API.
        </Callout>
      </section>

      {/* ── SECCIÓN 5: TEST 2 ── */}
      <section id="tapp-test2" className="doc-section">
        <h2>5. Test 2 — Los endpoints de la API están registrados</h2>
        <CodeBlock code={TEST2_CODE} language="typescript" />

        <TestTrace
          testName="Test 2 — Main API endpoints are registered on express router"
          steps={traceTest2}
          verdict="pass"
        />
      </section>

      {/* ── SECCIÓN 6: OPERADOR || ── */}
      <section id="tapp-or" className="doc-section">
        <h2>6. El operador <code>||</code> — Valor por defecto</h2>
        <p>
          En la línea <code>const routerStack = (app as any)._router?.stack || []</code>,
          el <code>||</code> actúa como un <strong>seguro de valor por defecto</strong>.
        </p>
        <CodeBlock code={OR_CODE} language="typescript" />

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Valor de la izquierda</th>
                <th>¿Es truthy?</th>
                <th>Resultado de <code>||</code></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>[ cors, json, ... ]</code> (array con elementos)</td>
                <td>✅ Sí</td>
                <td>Devuelve el array — se usa ese</td>
              </tr>
              <tr>
                <td><code>undefined</code> (router no inicializado)</td>
                <td>❌ No</td>
                <td>Devuelve <code>[]</code> — el fallback seguro</td>
              </tr>
              <tr>
                <td><code>[]</code> (array vacío)</td>
                <td>❌ No (array vacío es falsy en este contexto... ¡ojo!)</td>
                <td>Devuelve <code>[]</code> — igual, no importa</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="note">
          El <code>||</code> es el operador lógico <strong>OR</strong>. Su uso más común en
          Node.js es exactamente este: asignar un valor por defecto si la variable principal
          no existe o está vacía. Lo ves también en cosas como{' '}
          <code>const PORT = process.env.PORT || 3000</code>.
        </Callout>
      </section>

      {/* ── SECCIÓN 7: AS ANY ── */}
      <section id="tapp-as-any" className="doc-section">
        <h2>7. La aserción de tipo <code>as any</code></h2>
        <p>
          TypeScript sabe qué métodos y propiedades tiene Express — pero solo los
          que están en sus <em>definiciones de tipos oficiales</em>. <code>_router</code>{' '}
          es una propiedad interna que Express <strong>no publica</strong> en esas definiciones,
          así que TypeScript la desconoce y da error si intentás acceder.
        </p>
        <CodeBlock code={AS_ANY_CODE} language="typescript" />

        <Callout type="warn">
          <code>as any</code> es una herramienta de escape del sistema de tipos. Se usa en
          tests para inspeccionar internos de librerías. <strong>En código de producción</strong>{' '}
          hay que evitarlo — indica que TypeScript no puede ayudarte con ese valor y los
          errores se descubren en runtime, no en compilación.
        </Callout>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Técnica</th>
                <th>Cuándo usarla</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>as any</code></td>
                <td>Desactiva todos los chequeos para esa expresión. Usar solo cuando sabés exactamente qué estructura tiene el valor.</td>
              </tr>
              <tr>
                <td><code>as unknown</code></td>
                <td>Más seguro que <code>any</code>: TypeScript te obliga a verificar el tipo antes de usarlo.</td>
              </tr>
              <tr>
                <td>Tipos personalizados / <code>interface</code></td>
                <td>La solución correcta en código de producción: declarar la forma exacta del objeto.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN 8: _ROUTER STACK ── */}
      <section id="tapp-router-stack" className="doc-section">
        <h2>8. Qué contiene <code>_router.stack</code> en el SuperGestor</h2>
        <p>
          Cada llamada a <code>app.use()</code> en <code>app.ts</code> agrega una capa
          al stack. El SuperGestor tiene exactamente estas 19 capas:
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Capa</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1', 'cors({ origin: fn, credentials: true })', 'Middleware'],
                ['2', 'express.json({ limit: "50mb" })', 'Middleware'],
                ['3', 'express.urlencoded({ limit: "50mb", extended: true })', 'Middleware'],
                ['4', 'cookieParser()', 'Middleware'],
                ['5', 'RequestContext.create(orm.em, next)', 'Middleware'],
                ['6', '/api/usuarios → usuariosLegacyRouter', 'Router'],
                ['7', '/api/metahumanos → metahumanosRoutes', 'Router'],
                ['8', '/api/poderes → poderesRoutes', 'Router'],
                ['9', '/api/metapoderes → metaPoderesRoutes', 'Router'],
                ['10', '/api/burocratas → burocratasRouter', 'Router'],
                ['11', '/api/multas → multasRouter', 'Router'],
                ['12', '/api/evidencias → evidenciaRouter', 'Router'],
                ['13', '/api/carpetas → carpetaRouter', 'Router'],
                ['14', '/api/auth → usuarioRouter', 'Router'],
                ['15', '/api/villanos → villanoRoutes', 'Router'],
                ['16', '/api/heroes → heroeRoutes', 'Router'],
                ['17', '/api/noticias → noticiaRouter', 'Router'],
                ['18', '404 handler → res.status(404).json(...)', 'Catch-all'],
                ['19', 'errorHandler (4 parámetros)', 'Error handler'],
              ].map(([n, capa, tipo]) => (
                <tr key={n}>
                  <td><strong>{n}</strong></td>
                  <td><code>{capa}</code></td>
                  <td>{tipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout type="tip">
          El <code>assert.ok(routerStack.length {'>'} 0)</code> pasa porque encuentra 19 capas.
          Si <code>app.ts</code> estuviera vacío, el stack tendría 0 capas y el test fallaría,
          alertando que el servidor no tiene rutas montadas.
        </Callout>
      </section>

      {/* ── SECCIÓN 9: LAZY INIT ── */}
      <section id="tapp-lazy" className="doc-section">
        <h2>9. Inicialización lazy del router de Express</h2>
        <p>
          Express no crea el objeto <code>_router</code> al instanciarse — lo hace{' '}
          <em>en el momento en que se necesita</em>, la primera vez que se registra
          un middleware o ruta.
        </p>
        <CodeBlock code={LAZY_CODE} language="typescript" />

        <Callout type="note">
          <strong>Lazy</strong> (perezoso) es un patrón de optimización: no gastes memoria
          creando algo hasta que alguien realmente lo use. Express aplica esto al router interno
          para que instancias de Express que nunca usen rutas no paguen ese costo.
        </Callout>
      </section>

      {/* ── SECCIÓN 10: ORDEN DE CÓDIGO ── */}
      <section id="tapp-order" className="doc-section">
        <h2>10. Por qué importa el orden de ejecución</h2>
        <p>
          La lazy initialization hace que el <em>orden</em> en que corre el código sea crítico.
          Si lees el stack antes de registrar rutas, estará vacío.
        </p>
        <CodeBlock code={ORDER_CODE} language="typescript" />

        <p>
          En el test esto no es un problema porque al hacer{' '}
          <code>import {'{ app }'} from '../app.js'</code>, Node.js ejecuta{' '}
          <code>app.ts</code> <strong>completo</strong> — incluyendo todos los{' '}
          <code>app.use()</code> — antes de que el primer test corra. Cuando el test
          accede al stack, ya tiene las 19 capas listas.
        </p>

        <Callout type="warn">
          Si alguna vez vieras <code>routerStack.length === 0</code> en tus tests, la primera
          causa a revisar es el orden: ¿el import de <code>app.ts</code> corre antes de que
          el test lea el stack?
        </Callout>
      </section>

      {/* ── SECCIÓN 11: FILTER Y MAP ── */}
      <section id="tapp-filter-map" className="doc-section">
        <h2>11. <code>.filter()</code> y <code>.map()</code> sobre el stack</h2>
        <p>
          El stack crudo de Express mezcla capas internas del framework (como{' '}
          <code>Query</code> e <code>init</code>) con tus middlewares y rutas. Los
          métodos de array permiten limpiar y transformar esa lista.
        </p>
        <CodeBlock code={FILTER_MAP_CODE} language="typescript" />

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Método</th>
                <th>Qué hace</th>
                <th>Qué devuelve</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>.filter(condición)</code></td>
                <td>Recorre el array y se queda solo con los elementos donde la condición es <code>true</code></td>
                <td>Un nuevo array — nunca modifica el original</td>
              </tr>
              <tr>
                <td><code>.map(transformación)</code></td>
                <td>Recorre el array y transforma cada elemento según la función dada</td>
                <td>Un nuevo array del mismo tamaño con los valores transformados</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip">
          <code>.filter()</code> y <code>.map()</code> son <em>métodos puros</em>: nunca
          modifican el array original, siempre crean uno nuevo. Podés encadenarlos
          (como acá) porque cada uno devuelve un array.
        </Callout>
      </section>

      {/* ── SECCIÓN 12: ASSERT.OK ── */}
      <section id="tapp-assert-ok" className="doc-section">
        <h2>12. <code>assert.ok()</code> — La validación final</h2>
        <p>
          El último paso del test es verificar que el stack no esté vacío. Si todo lo
          anterior falló silenciosamente y <code>routerStack</code> tuviera 0 elementos,
          este assert lo detecta y detiene todo.
        </p>
        <CodeBlock code={ASSERT_OK_CODE} language="typescript" />

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Método assert</th>
                <th>Qué hace</th>
                <th>Usado en</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>assert.ok(valor)</code></td>
                <td>Falla si <code>valor</code> es <em>falsy</em> (<code>false</code>, <code>0</code>, <code>''</code>, <code>null</code>, <code>undefined</code>)</td>
                <td>Test 2 — verificar que el stack tiene capas</td>
              </tr>
              <tr>
                <td><code>assert.strictEqual(a, b)</code></td>
                <td>Falla si <code>a !== b</code> (comparación estricta <code>===</code>)</td>
                <td>Test 1 — verificar tipos exactos</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="note">
          <code>assert.ok(routerStack.length {'>'} 0)</code> es una <strong>garantía mínima</strong>.
          No verifica que las rutas correctas estén — eso sería un test de integración.
          Solo verifica que el servidor no está en blanco.
        </Callout>
      </section>

      {/* ── SECCIÓN 13: CONCEPTOS CLAVE ── */}
      <section id="tapp-concepts" className="doc-section">
        <h2>13. Resumen de conceptos clave</h2>
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
                <td><strong>Operador <code>||</code></strong></td>
                <td>Devuelve el valor de la izquierda si es truthy, o el de la derecha como fallback. Acá: usa <code>[]</code> si el router no existe.</td>
              </tr>
              <tr>
                <td><strong>Aserción <code>as any</code></strong></td>
                <td>Desactiva los chequeos de TypeScript para esa expresión. Necesario para acceder a <code>_router</code>, que no está en los tipos oficiales de Express.</td>
              </tr>
              <tr>
                <td><strong><code>_router.stack</code></strong></td>
                <td>Array interno de Express con todas las capas registradas (middlewares + routers + error handlers). El SuperGestor tiene 19.</td>
              </tr>
              <tr>
                <td><strong>Lazy initialization</strong></td>
                <td>Express crea <code>_router</code> solo cuando se registra el primer middleware. Antes de eso, es <code>undefined</code>.</td>
              </tr>
              <tr>
                <td><strong>Orden de ejecución</strong></td>
                <td>El stack solo tiene datos si se lee DESPUÉS de que <code>app.ts</code> corrió sus <code>app.use()</code>. Los imports de Node.js garantizan esto.</td>
              </tr>
              <tr>
                <td><strong><code>.filter() + .map()</code></strong></td>
                <td><code>.filter()</code> limpia el stack descartando capas internas; <code>.map()</code> extrae los paths legibles de las capas que quedan.</td>
              </tr>
              <tr>
                <td><strong><code>assert.ok()</code></strong></td>
                <td>Falla si recibe un valor falsy. Garantiza que el stack no esté vacío — el servidor tiene rutas montadas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── QUIZ ── */}
      <section id="tapp-quiz" className="doc-section">
        <h2>14. 📝 Quiz de Estudio</h2>
        <p>Verificá que entendiste todos los conceptos del archivo:</p>
        <Quiz questions={quizQuestions} />
      </section>

    </article>
  );
}
