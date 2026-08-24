import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import Callout from '../components/Callout';

/* ============================================================
   MiddlewaresView.jsx
   Vista completa de todos los middlewares externos usados en
   el backend de SuperGestor (app.ts + auth.middleware.ts)
   ============================================================ */

// Mini componente para badges de npm con enlace a npmjs
function NpmBadge({ pkg, version }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
      <a
        href={`https://www.npmjs.com/package/${pkg}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          backgroundColor: '#cb3837',
          color: '#fff',
          padding: '3px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 700,
          fontFamily: 'var(--font-family-mono)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        <span style={{ opacity: 0.8 }}>npm</span>
        <span>{pkg}</span>
        <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '1px 5px', borderRadius: '3px' }}>
          {version}
        </span>
      </a>
    </span>
  );
}

// Mini componente para badge de "Dónde se usa"
function WhereUsed({ file, line }) {
  return (
    <span style={{
      display: 'inline-block',
      background: 'var(--inline-code-bg)',
      border: '1px solid var(--border-color)',
      color: 'var(--text-muted)',
      fontSize: '11.5px',
      padding: '2px 8px',
      borderRadius: '4px',
      fontFamily: 'var(--font-family-mono)',
      marginRight: '6px',
      marginBottom: '4px'
    }}>
      📁 {file}:{line}
    </span>
  );
}

// Sección de middleware individual con tarjeta visual
function MiddlewareSection({ id, icon, name, pkg, version, tagline, children }) {
  return (
    <div id={id} style={{ marginBottom: '64px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '16px',
        marginBottom: '24px',
        marginTop: '48px'
      }}>
        <div style={{
          fontSize: '36px',
          lineHeight: 1,
          flexShrink: 0
        }}>
          {icon}
        </div>
        <div>
          <h2 style={{
            fontSize: '24px',
            margin: 0,
            border: 'none',
            paddingBottom: 0
          }}>
            <code style={{ background: 'none', color: 'inherit', fontSize: 'inherit' }}>{name}</code>
          </h2>
          <p style={{ marginBottom: '8px', color: 'var(--text-muted)', fontSize: '15px' }}>{tagline}</p>
          <NpmBadge pkg={pkg} version={version} />
        </div>
      </div>
      {children}
    </div>
  );
}

export default function MiddlewaresView() {
  const [corsTab, setCorsTab] = useState('que-es');
  const [jwtTab, setJwtTab] = useState('que-es');

  return (
    <div className="doc-section">
      <h1>Middlewares Externos en el Backend</h1>
      <p className="page-lead">
        Un middleware en Express es una función que intercepta cada petición HTTP antes de que llegue al controlador. El backend de SuperGestor usa <strong>7 middlewares y librerías externas</strong> que resuelven problemas comunes como seguridad, parseo de datos, autenticación y variables de entorno. Aquí estudiamos cada uno desde cero.
      </p>

      <Callout type="note" title="¿Qué es un Middleware en Express?">
        <p>
          Una función middleware recibe <code>(req, res, next)</code>. Puede leer/modificar el objeto <code>req</code> o <code>res</code>, y <strong>debe</strong> llamar a <code>next()</code> para pasar el control al siguiente middleware. Si no llama a <code>next()</code>, la petición queda congelada.
        </p>
        <CodeBlock
          title="Anatomía de un Middleware"
          language="TypeScript"
          code={`// Middleware genérico de Express
function miMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. Hacer algo con req o res
  console.log('Método HTTP:', req.method, '| URL:', req.url);

  // 2. Modificar el objeto req (para pasar datos a controladores)
  req.body.timestamp = Date.now();

  // 3. Llamar a next() para continuar al siguiente middleware/controlador
  next();
}

// Registrar el middleware globalmente en Express
app.use(miMiddleware);`}
        />
      </Callout>

      {/* ================================================================
          1. CORS
          ================================================================ */}
      <MiddlewareSection
        id="mw-cors"
        icon="🌐"
        name="cors"
        pkg="cors"
        version="^2.8.5"
        tagline="Cross-Origin Resource Sharing — Control de acceso entre dominios"
      >
        <h3>¿Qué problema resuelve?</h3>
        <p>
          Los navegadores implementan la política de <strong>Same-Origin Policy</strong>: por seguridad, bloquean las peticiones JavaScript que van desde un dominio (ej: <code>http://localhost:5173</code>) hacia otro dominio diferente (ej: <code>http://localhost:3000</code>). Esto se llama petición <strong>Cross-Origin</strong>.
        </p>
        <p>
          Sin configurar CORS, el Frontend del SuperGestor (corriendo en el puerto del Vite) <strong>no podría hablar con el Backend</strong> (corriendo en otro puerto), aunque ambos estén en la misma máquina.
        </p>

        <Callout type="warn" title="¿Cuándo aparece el error de CORS?">
          <p>Cuando el navegador lanza este error en la consola:</p>
          <pre style={{ background: 'var(--danger-bg)', padding: '10px', borderRadius: '4px', fontSize: '12.5px', color: 'var(--danger-text)', overflow: 'auto', marginTop: '8px' }}>
{`Access to fetch at 'http://localhost:3000/api/metahumanos' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.`}
          </pre>
        </Callout>

        <div className="breakdown-box">
          <div className="breakdown-header">
            <span className="breakdown-title">Estudio en Profundidad del Middleware cors</span>
            <div className="tabs-nav">
              <button className={`tab-btn ${corsTab === 'que-es' ? 'active' : ''}`} onClick={() => setCorsTab('que-es')}>¿Cómo funciona?</button>
              <button className={`tab-btn ${corsTab === 'headers' ? 'active' : ''}`} onClick={() => setCorsTab('headers')}>Headers HTTP</button>
              <button className={`tab-btn ${corsTab === 'codigo' ? 'active' : ''}`} onClick={() => setCorsTab('codigo')}>En el Proyecto</button>
            </div>
          </div>

          {corsTab === 'que-es' && (
            <div className="tab-content active">
              <h4>¿Cómo funciona internamente?</h4>
              <p>
                El middleware <code>cors</code> agrega automáticamente los <strong>headers de respuesta</strong> necesarios para que el navegador permita la petición. En el caso del SuperGestor, solo se permiten peticiones desde localhost (cualquier puerto).
              </p>
              <p>Las opciones más importantes del paquete <code>cors</code> son:</p>
              <div className="table-wrapper">
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th>Opción</th>
                      <th>Tipo</th>
                      <th>Descripción</th>
                      <th>Ejemplo en el Proyecto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>origin</code></td>
                      <td><code>string | boolean | RegExp | Function</code></td>
                      <td>Especifica qué orígenes pueden acceder a la API. Si es <code>true</code>, permite cualquier origen.</td>
                      <td>Función que valida con RegExp: permite cualquier <code>localhost:&lt;puerto&gt;</code></td>
                    </tr>
                    <tr>
                      <td><code>credentials</code></td>
                      <td><code>boolean</code></td>
                      <td>Habilita el envío de cookies en peticiones cross-origin (<code>Access-Control-Allow-Credentials: true</code>).</td>
                      <td><code>true</code> — necesario para enviar la cookie <code>auth_token</code></td>
                    </tr>
                    <tr>
                      <td><code>methods</code></td>
                      <td><code>string | string[]</code></td>
                      <td>Métodos HTTP permitidos.</td>
                      <td>Por defecto: <code>GET, HEAD, PUT, PATCH, POST, DELETE</code></td>
                    </tr>
                    <tr>
                      <td><code>allowedHeaders</code></td>
                      <td><code>string[]</code></td>
                      <td>Headers que el cliente puede enviar.</td>
                      <td>Por defecto: todos los que el cliente solicite</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {corsTab === 'headers' && (
            <div className="tab-content active">
              <h4>Headers HTTP que agrega el middleware</h4>
              <p>Cuando una petición cross-origin llega al servidor, <code>cors</code> inyecta en la respuesta:</p>
              <CodeBlock
                title="Headers de respuesta que genera cors"
                language="HTTP"
                code={`HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Vary: Origin`}
              />
              <p>
                El navegador lee estos headers y, si el origen del frontend coincide con lo permitido, <strong>ejecuta la petición</strong>. De lo contrario, la bloquea antes de que siquiera llegue al controlador.
              </p>
              <Callout type="note" title="Petición Preflight (OPTIONS)">
                <p>
                  Antes de peticiones con cuerpo (POST/PUT) o con headers personalizados, el navegador envía una petición <strong>OPTIONS</strong> (preflight) para preguntar al servidor si el origen está permitido. El middleware <code>cors</code> responde automáticamente a estas peticiones preflight con el código <strong>204 No Content</strong>.
                </p>
              </Callout>
            </div>
          )}

          {corsTab === 'codigo' && (
            <div className="tab-content active">
              <h4>¿Cómo está configurado en el Proyecto?</h4>
              <p>Ubicación: <WhereUsed file="app.ts" line="33-48" /></p>
              <CodeBlock
                title="app.ts — Configuración de cors en SuperGestor"
                language="TypeScript"
                code={`import cors from 'cors'

app.use(cors({
  // Función personalizada: permite CUALQUIER puerto de localhost o 127.0.0.1
  origin: (origin, callback) => {
    // Si no hay origen (ej: Postman, curl, server-to-server) → permitir
    if (!origin) return callback(null, true);

    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,   // http://localhost:CUALQUIER_PUERTO
      /^http:\/\/127\.0\.0\.1:\d+$/ // http://127.0.0.1:CUALQUIER_PUERTO
    ];

    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      callback(null, true);  // Aprobar el origen
    } else {
      callback(new Error('No permitido por CORS')); // Rechazar con error
    }
  },
  credentials: true // CRÍTICO: permite el envío de cookies (auth_token)
}))`}
              />
              <Callout type="tip" title="¿Por qué credentials: true?">
                <p>
                  Sin <code>credentials: true</code>, el navegador <strong>no envía las cookies</strong> en peticiones cross-origin. Como el sistema de autenticación usa una cookie llamada <code>auth_token</code> para identificar al usuario, esta opción es <strong>obligatoria</strong> para que el login funcione correctamente.
                </p>
              </Callout>
            </div>
          )}
        </div>
        <p>
          <a href="https://expressjs.com/en/resources/middleware/cors.html" target="_blank" rel="noopener noreferrer">
            📖 Documentación oficial del paquete cors →
          </a>
        </p>
      </MiddlewareSection>

      {/* ================================================================
          2. cookie-parser
          ================================================================ */}
      <MiddlewareSection
        id="mw-cookie-parser"
        icon="🍪"
        name="cookie-parser"
        pkg="cookie-parser"
        version="^1.4.7"
        tagline="Parseo automático de cookies HTTP en req.cookies"
      >
        <h3>¿Qué problema resuelve?</h3>
        <p>
          Las cookies son pequeños textos que el servidor envía al navegador (<code>Set-Cookie</code>) y el navegador devuelve en cada petición siguiente (<code>Cookie: auth_token=eyJ...</code>). Pero ese string llega en crudo en el header HTTP; Express por sí solo no lo interpreta.
        </p>
        <p>
          <code>cookie-parser</code> lee el header <code>Cookie</code> de la petición, lo parsea y lo convierte en el objeto <code>req.cookies</code>, accesible desde cualquier middleware o controlador.
        </p>

        <CodeBlock
          title="Flujo de funcionamiento de cookie-parser"
          language="TypeScript"
          code={`// Sin cookie-parser:
req.headers.cookie  // "auth_token=eyJhbGciOiJIUzI1NiJ9...; other=value"
// → Solo un string crudo, hay que parsearlo manualmente

// CON cookie-parser:
req.cookies         // { auth_token: "eyJhbGciOiJIUzI1NiJ9...", other: "value" }
// → Objeto JavaScript listo para usar`}
        />

        <h3>Uso en el Proyecto</h3>
        <p>Ubicación: <WhereUsed file="app.ts" line="51" /> y <WhereUsed file="auth.middleware.ts" line="17" /></p>

        <CodeBlock
          title="app.ts — Registro de cookie-parser"
          language="TypeScript"
          code={`import cookieParser from 'cookie-parser'

// Se registra después de cors y antes del RequestContext
app.use(cookieParser())`}
        />

        <CodeBlock
          title="auth.middleware.ts — Lectura del token desde req.cookies"
          language="TypeScript"
          code={`export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Gracias a cookie-parser, podemos acceder al token como un campo de objeto
  let token = req.cookies?.auth_token;
  //          ^^^^^^^^^^^^ Sin cookie-parser esto daría undefined

  // Alternativa: también acepta Authorization: Bearer <token>
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  // ...
}`}
        />

        <Callout type="note" title="¿Cómo se crea la cookie en el login?">
          <p>
            El controlador de usuario llama a <code>res.cookie('auth_token', token, {'{ httpOnly: true, sameSite: "lax" }'} )</code>.
            El flag <code>httpOnly: true</code> impide que JavaScript del navegador pueda leer la cookie (protección contra ataques XSS).
            Luego, en cada petición siguiente, el navegador la devuelve automáticamente y <code>cookie-parser</code> la hace disponible en <code>req.cookies.auth_token</code>.
          </p>
        </Callout>

        <p>
          <a href="https://www.npmjs.com/package/cookie-parser" target="_blank" rel="noopener noreferrer">
            📖 Documentación oficial de cookie-parser →
          </a>
        </p>
      </MiddlewareSection>

      {/* ================================================================
          3. express.json() y express.urlencoded()
          ================================================================ */}
      <MiddlewareSection
        id="mw-express-json"
        icon="📦"
        name="express.json() & express.urlencoded()"
        pkg="express"
        version="^4.18.2"
        tagline="Parseo del cuerpo (body) de peticiones HTTP — incluido en Express"
      >
        <h3>¿Qué problema resuelven?</h3>
        <p>
          Cuando un cliente envía datos en el cuerpo de una petición POST o PUT (por ejemplo, un formulario de registro), Express recibe la información como un <strong>stream de bytes en crudo</strong>. Sin parsear ese stream, <code>req.body</code> sería <code>undefined</code>.
        </p>
        <p>
          Estos dos middlewares, incluidos directamente en Express desde la versión 4.16+, resuelven ese problema para dos formatos distintos:
        </p>

        <div className="concept-grid">
          <div className="concept-card">
            <div className="card-icon">🔷</div>
            <h4><code>express.json()</code></h4>
            <p>Parsea el cuerpo de peticiones cuyo <code>Content-Type</code> sea <code>application/json</code>. Convierte el JSON string en un objeto JavaScript y lo asigna a <code>req.body</code>.</p>
          </div>
          <div className="concept-card">
            <div className="card-icon">📝</div>
            <h4><code>express.urlencoded()</code></h4>
            <p>Parsea formularios HTML clásicos (<code>Content-Type: application/x-www-form-urlencoded</code>). Procesa strings como <code>nombre=Juan&edad=25</code> y los convierte en objetos.</p>
          </div>
        </div>

        <h3>Uso en el Proyecto</h3>
        <p>Ubicación: <WhereUsed file="app.ts" line="49-50" /></p>

        <CodeBlock
          title="app.ts — Configuración de body parsers"
          language="TypeScript"
          code={`// Parsea cuerpos JSON. Límite de 50MB para permitir imágenes en base64
app.use(express.json({ limit: '50mb' }))

// Parsea formularios URL-encoded. extended: true permite objetos anidados
app.use(express.urlencoded({ limit: '50mb', extended: true }))`}
        />

        <Callout type="deep-dive" title="🔍 Opciones Detalladas de express.json()">
          <div className="table-wrapper">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Opción</th>
                  <th>Por Defecto</th>
                  <th>Descripción</th>
                  <th>En SuperGestor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>limit</code></td>
                  <td><code>'100kb'</code></td>
                  <td>Tamaño máximo del body. Evita ataques de <em>payload flooding</em>.</td>
                  <td><code>'50mb'</code> — para permitir fotos codificadas en base64</td>
                </tr>
                <tr>
                  <td><code>strict</code></td>
                  <td><code>true</code></td>
                  <td>Si es <code>true</code>, solo acepta arrays y objetos JSON. Si es <code>false</code>, acepta cualquier valor JSON válido.</td>
                  <td>No especificado → usa <code>true</code></td>
                </tr>
                <tr>
                  <td><code>type</code></td>
                  <td><code>'application/json'</code></td>
                  <td>El <code>Content-Type</code> que activa el middleware.</td>
                  <td>No especificado → usa el por defecto</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Callout>

        <CodeBlock
          title="Ejemplo de petición y cómo la transforma"
          language="TypeScript"
          code={`// PETICIÓN HTTP que llega al servidor:
// POST /api/metahumanos/registro HTTP/1.1
// Content-Type: application/json
//
// { "nombre": "Tony Stark", "alias": "Iron Man", "tipoMeta": "HEROE" }

// SIN express.json():
console.log(req.body); // undefined ❌

// CON express.json():
console.log(req.body); 
// { nombre: 'Tony Stark', alias: 'Iron Man', tipoMeta: 'HEROE' } ✅

// Ahora en el controlador podemos hacer:
const { nombre, alias, tipoMeta } = req.body; // Desestructuración directa`}
        />

        <p>
          <a href="https://expressjs.com/en/4x/api.html#express.json" target="_blank" rel="noopener noreferrer">
            📖 Documentación oficial de express.json() →
          </a>
        </p>
      </MiddlewareSection>

      {/* ================================================================
          4. dotenv
          ================================================================ */}
      <MiddlewareSection
        id="mw-dotenv"
        icon="⚙️"
        name="dotenv"
        pkg="dotenv"
        version="^17.4.2"
        tagline="Variables de entorno desde archivos .env — elimina datos sensibles del código"
      >
        <h3>¿Qué problema resuelve?</h3>
        <p>
          Nunca debemos escribir contraseñas, claves de API o secretos directamente en el código fuente, porque ese código va a un repositorio Git y queda expuesto. <code>dotenv</code> carga un archivo <code>.env</code> (que se excluye del control de versiones) y hace que su contenido esté disponible en <code>process.env</code>.
        </p>

        <div className="concept-grid">
          <div className="concept-card" style={{ borderLeft: '4px solid var(--danger-border)' }}>
            <div className="card-icon">❌</div>
            <h4>Sin dotenv (MAL)</h4>
            <CodeBlock
              title=""
              language="TypeScript"
              code={`// Contraseña hardcodeada en el código
const orm = await MikroORM.init({
  password: 'miPasswordSecreta123',
  user: 'dsw',
  dbName: 'metahumano',
})`}
            />
          </div>
          <div className="concept-card" style={{ borderLeft: '4px solid var(--tip-border)' }}>
            <div className="card-icon">✅</div>
            <h4>Con dotenv (BIEN)</h4>
            <CodeBlock
              title=""
              language="TypeScript"
              code={`// Solo una referencia a variable de entorno
const orm = await MikroORM.init({
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
  dbName: process.env.DB_NAME,
})`}
            />
          </div>
        </div>

        <h3>Uso en el Proyecto</h3>
        <p>Ubicación: <WhereUsed file="app.ts" line="1" /> (primera línea del archivo)</p>

        <CodeBlock
          title="app.ts — Inicialización de dotenv (usando import ESM)"
          language="TypeScript"
          code={`// La primera línea de app.ts. 'dotenv/config' se auto-ejecuta al importarse.
// Carga el archivo .env del directorio raíz del proyecto
import 'dotenv/config'

// Ahora process.env.JWT_SECRET, process.env.DB_HOST, etc. están disponibles
// en cualquier lugar del código Node.js`}
        />

        <CodeBlock
          title=".env — Archivo de variables (NUNCA subir a Git)"
          language="bash"
          code={`# .env (está en el .gitignore para no subirse a GitHub)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=metahumano
DB_USER=dsw
DB_PASSWORD=dsw
JWT_SECRET=mi_clave_secreta_muy_larga_y_aleatoria
NODE_ENV=development`}
        />

        <Callout type="warn" title="⚠️ Siempre agregar .env al .gitignore">
          <p>
            Si publicas el archivo <code>.env</code> en GitHub, cualquier persona puede ver tus contraseñas de base de datos y clave JWT. Agrega esta línea en tu <code>.gitignore</code>:
          </p>
          <pre style={{ background: 'var(--code-bg)', padding: '10px', borderRadius: '4px', fontSize: '13px', marginTop: '8px' }}>.env{'\n'}.env.local{'\n'}.env.production</pre>
        </Callout>

        <p>
          <a href="https://www.npmjs.com/package/dotenv" target="_blank" rel="noopener noreferrer">
            📖 Documentación oficial de dotenv →
          </a>
        </p>
      </MiddlewareSection>

      {/* ================================================================
          5. jsonwebtoken (JWT)
          ================================================================ */}
      <MiddlewareSection
        id="mw-jwt"
        icon="🔑"
        name="jsonwebtoken"
        pkg="jsonwebtoken"
        version="^9.0.2"
        tagline="Creación y verificación de tokens JWT para autenticación sin estado"
      >
        <h3>¿Qué es un JWT?</h3>
        <p>
          Un <strong>JSON Web Token</strong> es una cadena de texto en formato <code>Header.Payload.Signature</code> que el servidor crea al hacer login y envía al cliente. En cada petición siguiente, el cliente adjunta ese token, y el servidor lo <strong>verifica criptográficamente</strong> para saber quién está haciendo la petición, sin consultar la base de datos.
        </p>

        <div className="breakdown-box">
          <div className="breakdown-header">
            <span className="breakdown-title">Anatomía de un JWT</span>
            <div className="tabs-nav">
              <button className={`tab-btn ${jwtTab === 'que-es' ? 'active' : ''}`} onClick={() => setJwtTab('que-es')}>Estructura</button>
              <button className={`tab-btn ${jwtTab === 'firma' ? 'active' : ''}`} onClick={() => setJwtTab('firma')}>Firma HMAC</button>
              <button className={`tab-btn ${jwtTab === 'codigo' ? 'active' : ''}`} onClick={() => setJwtTab('codigo')}>En el Proyecto</button>
            </div>
          </div>

          {jwtTab === 'que-es' && (
            <div className="tab-content active">
              <p>Un token JWT tiene 3 partes separadas por puntos <code>.</code>, cada una en Base64URL:</p>
              <CodeBlock
                title="Ejemplo de token JWT"
                language="bash"
                code={`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9    ← HEADER (Base64)
.
eyJ1c3VhcmlvSWQiOjUsInJvbGUiOiJNRVRBSFVNQU5PIiwicGVyZmlsIjoiaGVyb2UiLCJwZXJmaWxJZCI6MTJ9
                                                       ← PAYLOAD (Base64)
.
dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk         ← SIGNATURE (HMAC-SHA256)`}
              />
              <div className="table-wrapper">
                <table className="doc-table">
                  <thead>
                    <tr><th>Parte</th><th>Contenido</th><th>¿Se puede leer sin la clave?</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Header</strong></td>
                      <td>Algoritmo de firma (<code>HS256</code>) y tipo (<code>JWT</code>)</td>
                      <td>✅ Sí — es solo Base64, decodificable públicamente</td>
                    </tr>
                    <tr>
                      <td><strong>Payload</strong></td>
                      <td>Claims: <code>usuarioId</code>, <code>role</code>, <code>perfil</code>, <code>perfilId</code>, <code>exp</code></td>
                      <td>✅ Sí — es solo Base64. <strong>¡No guardar contraseñas aquí!</strong></td>
                    </tr>
                    <tr>
                      <td><strong>Signature</strong></td>
                      <td>HMAC-SHA256 de header+payload usando el <code>JWT_SECRET</code></td>
                      <td>❌ No — sin el secreto, no se puede falsificar</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {jwtTab === 'firma' && (
            <div className="tab-content active">
              <h4>¿Por qué la firma lo hace seguro?</h4>
              <p>
                La firma se calcula así:
              </p>
              <CodeBlock
                title="Cómo se calcula la firma"
                language="pseudocode"
                code={`signature = HMAC_SHA256(
  base64url(header) + "." + base64url(payload),
  JWT_SECRET  // la clave secreta solo el servidor conoce
)`}
              />
              <p>
                Si alguien intercepta el token e intenta modificar el payload (ej: cambiar su <code>role</code> de <code>METAHUMANO</code> a <code>ADMIN</code>), la <strong>firma ya no va a coincidir</strong> porque no conoce el <code>JWT_SECRET</code>. Al verificar con <code>jwt.verify()</code>, el servidor detecta la manipulación y rechaza el token.
              </p>
              <Callout type="warn" title="Diferencia JWT vs Sesión de Servidor">
                <p>
                  En las sesiones tradicionales, el servidor guarda el estado en memoria o en una base de datos. Con JWT, el servidor es <strong>stateless</strong>: no guarda nada. Solo verifica la firma matemáticamente. Esto permite escalar horizontalmente a múltiples servidores sin compartir estado.
                </p>
              </Callout>
            </div>
          )}

          {jwtTab === 'codigo' && (
            <div className="tab-content active">
              <h4>Uso real en el proyecto</h4>
              <p>Ubicación: <WhereUsed file="auth.middleware.ts" line="31" /></p>
              <CodeBlock
                title="auth.middleware.ts — Verificación del token JWT"
                language="TypeScript"
                code={`import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';

// En requireAuth:
const payload = jwt.verify(token, config.jwtSecret) as any;
// jwt.verify():
//  ✅ Si el token es válido y no expiró → devuelve el payload decodificado
//  ❌ Si el token está alterado → lanza JsonWebTokenError
//  ❌ Si el token expiró → lanza TokenExpiredError

// El payload contiene los datos que el controlador de login guardó:
// { usuarioId: 5, role: 'METAHUMANO', perfil: 'heroe', perfilId: 12, iat: 1..., exp: 1... }

// Se inyectan en req para que controladores los usen:
(req as AuthedRequest).usuarioId = payload.usuarioId;
(req as AuthedRequest).role      = payload.role;
(req as AuthedRequest).perfilId  = payload.perfilId;`}
              />
              <CodeBlock
                title="usuario.controller.ts — Creación del token en el Login"
                language="TypeScript"
                code={`import jwt from 'jsonwebtoken';

// Al hacer login exitoso, se crea el token con los datos del usuario:
const token = jwt.sign(
  {
    usuarioId: usuario.id,
    role: usuario.role,
    perfil: metahumano?.tipoMeta || null,
    perfilId: metahumano?.id || null,
  },
  config.jwtSecret,   // Clave secreta desde .env
  { expiresIn: '7d' } // El token expira en 7 días
);

// Se envía al cliente como cookie httpOnly (no accesible por JS del navegador)
res.cookie('auth_token', token, {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos
});`}
              />
            </div>
          )}
        </div>
        <p>
          <a href="https://www.npmjs.com/package/jsonwebtoken" target="_blank" rel="noopener noreferrer">
            📖 Documentación oficial de jsonwebtoken →
          </a>
        </p>
      </MiddlewareSection>

      {/* ================================================================
          6. bcryptjs
          ================================================================ */}
      <MiddlewareSection
        id="mw-bcrypt"
        icon="🔒"
        name="bcryptjs"
        pkg="bcryptjs"
        version="^3.0.2"
        tagline="Hash seguro de contraseñas con salt — nunca guardar passwords en texto plano"
      >
        <h3>¿Por qué nunca guardar contraseñas en texto plano?</h3>
        <p>
          Si la base de datos es comprometida por un ataque, el atacante obtendría todas las contraseñas directamente. <code>bcryptjs</code> resuelve esto convirtiendo la contraseña en un <strong>hash irreversible</strong> con un factor de costo adaptable.
        </p>

        <Callout type="danger" title="❌ Nunca hacer esto">
          <CodeBlock
            title="MAL — Contraseña en texto plano en la BD"
            language="TypeScript"
            code={`// ❌ PELIGROSO: Si hackean la BD, tienen todas las contraseñas
await em.create(Usuario, {
  email: 'heroe@mail.com',
  password: 'MiContraseña123'  // texto plano en la base de datos
})`}
          />
        </Callout>

        <CodeBlock
          title="¿Cómo funciona bcrypt internamente?"
          language="TypeScript"
          code={`import bcrypt from 'bcryptjs';

// 1. HASHEAR al registrar (salt rounds = 10)
//    bcrypt genera un "salt" aleatorio y lo incluye en el hash resultante
const plainPassword = 'MiContraseña123';
const hashedPassword = await bcrypt.hash(plainPassword, 10);
// hashedPassword → "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
//                   ^^^^ versión
//                      ^^^ costo (2^10 = 1024 iteraciones)
//                        ^^^^^^^^^^^^^^^^^^^ salt (22 chars)
//                                           ^^^^^^^^^^^^^^^^ hash real (31 chars)

// 2. VERIFICAR al hacer login
//    bcrypt extrae el salt del hash guardado, aplica la misma función y compara
const esValida = await bcrypt.compare(plainPassword, hashedPassword);
// → true si la contraseña coincide
// → false si no coincide (o si fue alterada)`}
        />

        <h3>El concepto de Salt Rounds</h3>
        <div className="table-wrapper">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Salt Rounds</th>
                <th>Iteraciones (2^n)</th>
                <th>Tiempo aproximado</th>
                <th>Seguridad</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>8</code></td><td>256</td><td>~1ms</td><td>🔶 Mínimo aceptable</td></tr>
              <tr><td><code>10</code></td><td>1.024</td><td>~65ms</td><td>✅ Recomendado en producción</td></tr>
              <tr><td><code>12</code></td><td>4.096</td><td>~250ms</td><td>✅ Para datos muy sensibles</td></tr>
              <tr><td><code>14</code></td><td>16.384</td><td>~1 segundo</td><td>⚠️ Puede afectar UX</td></tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip" title="¿Por qué se usa bcryptjs en vez de bcrypt?">
          <p>
            <code>bcrypt</code> es una implementación en C++ que requiere compilar código nativo. <code>bcryptjs</code> es una implementación 100% en JavaScript que no requiere compilación y es compatible con cualquier entorno Node.js sin dependencias de sistema operativo.
          </p>
        </Callout>

        <p>
          <a href="https://www.npmjs.com/package/bcryptjs" target="_blank" rel="noopener noreferrer">
            📖 Documentación oficial de bcryptjs →
          </a>
        </p>
      </MiddlewareSection>

      {/* ================================================================
          7. reflect-metadata
          ================================================================ */}
      <MiddlewareSection
        id="mw-reflect"
        icon="🔮"
        name="reflect-metadata"
        pkg="reflect-metadata"
        version="0.1.13"
        tagline="API de metadatos en tiempo de ejecución — base de los decoradores de TypeScript"
      >
        <h3>¿Qué problema resuelve?</h3>
        <p>
          Los <strong>decoradores de TypeScript</strong> como <code>@Entity()</code>, <code>@Property()</code>, <code>@ManyToOne()</code> que usa MikroORM necesitan una forma de almacenar información (<em>metadatos</em>) sobre las clases y sus propiedades en tiempo de ejecución. <code>reflect-metadata</code> es el polyfill que implementa la propuesta de API <code>Reflect</code> del estándar TC39 para hacerlo posible.
        </p>

        <CodeBlock
          title="app.ts — Importación de reflect-metadata (segunda línea)"
          language="TypeScript"
          code={`// DEBE ser la segunda importación (después de dotenv)
// y ANTES de cualquier importación de entidades de MikroORM
import 'reflect-metadata'

// Esto activa la API global Reflect.metadata() que MikroORM usa internamente`}
        />

        <CodeBlock
          title="Cómo usan los decoradores esta API (simplificado)"
          language="TypeScript"
          code={`// En metahumano.entity.ts, @Entity() hace internamente:
Reflect.defineMetadata('mikro-orm:entity', true, Metahumano);

// @Property() sobre una propiedad hace:
Reflect.defineMetadata('mikro-orm:property', { type: 'string' }, Metahumano, 'nombre');

// Cuando MikroORM inicializa el ORM, lee todos esos metadatos con:
const entityMeta = Reflect.getMetadata('mikro-orm:entity', Metahumano);
// → { tableName: 'metahumano', discriminatorColumn: 'tipo_meta', ... }`}
        />

        <Callout type="note" title="¿Por qué debe ser la segunda importación?">
          <p>
            Si <code>reflect-metadata</code> se importa <em>después</em> de las entidades, el polyfill no estará listo cuando los decoradores se ejecuten (TypeScript ejecuta los decoradores en el momento en que se define la clase). La API <code>Reflect</code> global debe existir antes de que se cargue cualquier archivo que tenga decoradores.
          </p>
        </Callout>

        <p>
          <a href="https://www.npmjs.com/package/reflect-metadata" target="_blank" rel="noopener noreferrer">
            📖 Documentación oficial de reflect-metadata →
          </a>
        </p>
      </MiddlewareSection>

      {/* ================================================================
          8. RequestContext de MikroORM
          ================================================================ */}
      <MiddlewareSection
        id="mw-request-context"
        icon="🗃️"
        name="RequestContext (MikroORM)"
        pkg="@mikro-orm/core"
        version="5.8.10"
        tagline="Aislamiento del EntityManager por petición HTTP — evita contaminación entre usuarios"
      >
        <h3>¿Qué problema resuelve?</h3>
        <p>
          Node.js es <strong>single-threaded y asíncrono</strong>: atiende miles de peticiones de usuarios diferentes concurrentemente en el mismo proceso. Si todas compartieran el mismo <code>EntityManager</code> global, los datos en memoria (el <em>Identity Map</em>) de una petición de un usuario podrían <strong>contaminar los datos de otro usuario</strong>.
        </p>

        <CodeBlock
          title="app.ts — Registro del RequestContext como middleware"
          language="TypeScript"
          code={`import { RequestContext } from '@mikro-orm/core'
import { orm } from './shared/db/orm.js'

// Se registra DESPUÉS de cors, express.json y cookie-parser
// pero ANTES de las rutas de la API
app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
  // ↑ Crea un "fork" del EntityManager para CADA petición HTTP
  // ↑ Ese fork vive solo durante la vida de esa petición
  // ↑ Al terminar la petición, su Identity Map se destruye
})`}
        />

        <div className="concept-grid">
          <div className="concept-card">
            <div className="card-icon">👤</div>
            <h4>Petición de Usuario A</h4>
            <p>Obtiene su propio <code>em</code> forkeado. Carga a <code>Metahumano id=1</code> en su Identity Map privado. Modifica sus datos. Solo sus cambios se persisten.</p>
          </div>
          <div className="concept-card">
            <div className="card-icon">👥</div>
            <h4>Petición de Usuario B (simultánea)</h4>
            <p>Obtiene <strong>otro</strong> <code>em</code> forkeado completamente independiente. Carga a <code>Metahumano id=2</code>. Sus datos no interfieren con los del Usuario A.</p>
          </div>
        </div>

        <Callout type="tip" title="¿Qué es el Identity Map?">
          <p>
            El Identity Map es un registro interno de MikroORM donde guarda en memoria todos los objetos que ya se cargaron desde la base de datos durante la petición actual. Si haces dos <code>em.findOne(Metahumano, {'{ id: 5 }'})</code> en la misma petición, el segundo <strong>no hace otra consulta SQL</strong>; devuelve el objeto ya cargado en el mapa. Esto es una optimización de rendimiento fundamental, pero require que cada petición tenga su propio mapa aislado.
          </p>
        </Callout>

        <p>
          <a href="https://mikro-orm.io/docs/identity-map" target="_blank" rel="noopener noreferrer">
            📖 Documentación oficial de Identity Map en MikroORM →
          </a>
        </p>
      </MiddlewareSection>

      {/* ================================================================
          9. ORDEN DE LOS MIDDLEWARES (RESUMEN)
          ================================================================ */}
      <h2 id="mw-order">El Orden de los Middlewares en app.ts</h2>
      <p>
        El orden en que se registran los middlewares con <code>app.use()</code> es <strong>crítico</strong>. Express los ejecuta en el orden en que fueron declarados:
      </p>

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Línea app.ts</th>
              <th>Middleware</th>
              <th>¿Por qué este orden?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1°</strong></td>
              <td>1</td>
              <td><code>import 'dotenv/config'</code></td>
              <td>Variables de entorno deben existir antes de que cualquier otro módulo las lea.</td>
            </tr>
            <tr>
              <td><strong>2°</strong></td>
              <td>2</td>
              <td><code>import 'reflect-metadata'</code></td>
              <td>Debe cargarse antes de cualquier archivo con decoradores de MikroORM.</td>
            </tr>
            <tr>
              <td><strong>3°</strong></td>
              <td>33</td>
              <td><code>cors()</code></td>
              <td>Primero se manejan los headers CORS para que las peticiones preflight (OPTIONS) sean respondidas antes de cualquier otra lógica.</td>
            </tr>
            <tr>
              <td><strong>4°</strong></td>
              <td>49</td>
              <td><code>express.json()</code></td>
              <td>Parsea el body antes de que cualquier controlador lo necesite.</td>
            </tr>
            <tr>
              <td><strong>5°</strong></td>
              <td>50</td>
              <td><code>express.urlencoded()</code></td>
              <td>Parsea formularios. Va junto a express.json.</td>
            </tr>
            <tr>
              <td><strong>6°</strong></td>
              <td>51</td>
              <td><code>cookieParser()</code></td>
              <td>Parsea cookies antes de que el middleware de auth las lea con <code>req.cookies.auth_token</code>.</td>
            </tr>
            <tr>
              <td><strong>7°</strong></td>
              <td>55-57</td>
              <td><code>RequestContext.create()</code></td>
              <td>Crea el EntityManager aislado por petición antes de que las rutas y controladores lo usen.</td>
            </tr>
            <tr>
              <td><strong>8°</strong></td>
              <td>73-84</td>
              <td>Rutas (<code>app.use('/api/...')</code>)</td>
              <td>Solo después de que toda la infraestructura está lista se procesan las rutas.</td>
            </tr>
            <tr>
              <td><strong>9°</strong></td>
              <td>87-89</td>
              <td>Handler 404</td>
              <td>Si ninguna ruta hizo match, se responde con 404. Siempre al final de las rutas.</td>
            </tr>
            <tr>
              <td><strong>10°</strong></td>
              <td>93</td>
              <td><code>errorHandler</code></td>
              <td>El manejador de errores Express tiene 4 parámetros <code>(err, req, res, next)</code>. Express lo identifica así y <strong>debe ser el último</strong>.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <CodeBlock
        title="app.ts — Visualización del orden completo (resumido)"
        language="TypeScript"
        code={`import 'dotenv/config'         // 1. Variables de entorno
import 'reflect-metadata'       // 2. Soporte de decoradores TypeScript
import express from 'express'

const app = express()

// ─── Middlewares de Infraestructura ─────────────────────────
app.use(cors({ ... }))          // 3. CORS
app.use(express.json())         // 4. Body parser JSON
app.use(express.urlencoded())   // 5. Body parser form
app.use(cookieParser())         // 6. Cookie parser

// ─── Contexto de Base de Datos ───────────────────────────────
app.use((req, res, next) => {
  RequestContext.create(orm.em, next)  // 7. EntityManager aislado
})

// ─── Rutas de la API ─────────────────────────────────────────
app.use('/api/metahumanos', metahumanosRoutes)  // 8. Rutas
app.use('/api/poderes', poderesRoutes)
// ... más rutas

// ─── Manejo de Errores ───────────────────────────────────────
app.use((req, res) => res.status(404).json(...))  // 9. 404
app.use(errorHandler)                              // 10. Error handler`}
      />
    </div>
  );
}
