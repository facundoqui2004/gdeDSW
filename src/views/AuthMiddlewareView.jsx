import React from 'react';
import CodeBlock from '../components/CodeBlock';
import Callout from '../components/Callout';
import Quiz from '../components/Quiz';

export default function AuthMiddlewareView() {
  const quizQuestions = [
    {
      question: '¿Por qué requireAuth no es async pero requireRoles sí devuelve una función async?',
      options: [
        'Porque requireAuth no usa next() y requireRoles sí.',
        'requireAuth solo verifica el token JWT en memoria con jwt.verify() (operación síncrona de CPU). requireRoles puede necesitar consultar la BD con em.findOne() para obtener tipoMeta (I/O asíncrono).',
        'Porque Express 4 prohíbe que el primer middleware sea asíncrono.',
        'Es solo una preferencia de formateo de código sin impacto técnico.'
      ],
      correct: 1,
      explanation: 'jwt.verify valida la firma criptográfica en memoria sin tocar la red ni el disco (síncrono). En cambio, requireRoles realiza una consulta SQL asíncrona a la base de datos cuando debe validar subtipos HEROE o VILLANO.'
    },
    {
      question: '¿Qué pasaría si sacás el return antes de res.status(401).json(...) en requireAuth?',
      options: [
        'Nada, Express detiene la ejecución automáticamente al llamar a res.json().',
        'El código continuaría ejecutándose, llamaría a jwt.verify(token, ...) con token en undefined, generaría un error de runtime e intentaría enviar una segunda respuesta HTTP (ERR_HTTP_HEADERS_SENT).',
        'El usuario ingresaría a la ruta protegida como anónimo.',
        'Se crearía un bucle infinito en el servidor.'
      ],
      correct: 1,
      explanation: 'res.json() NO detiene la ejecución de la función de JavaScript. El return es imprescindible para salir de la función y evitar ejecutar las líneas siguientes.'
    },
    {
      question: '¿Por qué conviene soportar tanto la cookie auth_token como el header Authorization: Bearer?',
      options: [
        'Porque así se duplica la seguridad de la clave secreta.',
        'Para dar flexibilidad: las cookies httpOnly son ideales para el frontend web en navegador (protección contra XSS), mientras que el header Bearer permite la integración con Postman, apps móviles o servicios externos.',
        'Porque algunos navegadores no soportan el protocolo HTTP.',
        'Porque Express no puede leer cookies sin el header Bearer.'
      ],
      correct: 1,
      explanation: 'Soportar ambos canales permite una arquitectura híbrida: el navegador web aprovecha cookies automáticas y seguras, mientras que clientes programáticos (Postman, scripts, mobile) usan headers estándar.'
    },
    {
      question: '¿Qué diferencia práctica hay entre responder res.status(403)... directamente y llamar a next(err)?',
      options: [
        'res.status(403) envía una respuesta inmediata de rechazo por permisos al cliente; next(err) delega errores inesperados (como caída de BD) al middleware centralizado de manejo de errores de Express.',
        'next(err) borra la sesión del usuario.',
        'res.status(403) solo funciona en producción.',
        'No hay diferencia, ambos devuelven el mismo código de estado.'
      ],
      correct: 0,
      explanation: 'El 403 es una respuesta de negocio esperada cuando el rol no alcanza. next(err) en el catch se reserva para excepciones técnicas imprevistas (fallo de base de datos), permitiendo que el error handler global las capture y registre.'
    },
    {
      question: 'Si un usuario tiene role: \'METAHUMANO\' pero no tiene perfilId en su token, ¿qué ocurre en requireRoles([\'HEROE\'])?',
      options: [
        'El middleware le otorga acceso como héroe por defecto.',
        'No entra al bloque del Nivel 2 (omite la query a BD) y termina devolviendo 403 Forbidden por permisos insuficientes.',
        'El servidor arroja un error 500 fatal.',
        'Se crea automáticamente un perfil de héroe en la base de datos.'
      ],
      correct: 1,
      explanation: 'La condición evalúa authedReq.role === \'METAHUMANO\' && authedReq.perfilId. Al no haber perfilId, no puede consultar la BD y llega al final retornando 403 Forbidden de forma segura.'
    },
    {
      question: '¿Cómo se conecta este middleware con la entidad Usuario y el enum UserRole?',
      options: [
        'No tienen relación alguna.',
        'El payload del JWT se genera en el login a partir de usuario.role (del enum UserRole), y requireRoles compara las cadenas normalizadas en mayúsculas contra los roles permitidos.',
        'El middleware modifica la tabla usuario en cada petición GET.',
        'UserRole solo se usa en el frontend.'
      ],
      correct: 1,
      explanation: 'Durante el login, el backend firma el token incluyendo el rol proveniente de la base de datos (instancia del enum UserRole). Luego, requireRoles lee ese string del payload para autorizar el acceso.'
    }
  ];

  return (
    <div className="doc-section">
      <h1>
        <code style={{ fontSize: '26px' }}>auth.middleware.ts</code> — Autenticación y Autorización en Express + JWT
      </h1>
      <p className="page-lead">
        Guía de estudio exhaustiva sobre la capa de seguridad de <strong>SuperGestor</strong>. 
        Analizamos cómo Express intercepta las peticiones HTTP, la verificación criptográfica de tokens <strong>JWT</strong> (JSON Web Tokens), 
        la extensión de tipos con TypeScript (<code>AuthedRequest</code>), el soporte híbrido de <strong>Cookies vs Bearer</strong>, y el patrón 
        <strong>Higher-Order Function</strong> para el control de acceso por roles en dos niveles.
      </p>

      <Callout type="tip" title="🛡️ El guardián de la API">
        <p>
          Prácticamente toda ruta protegida de la aplicación (crear, modificar o eliminar registros, consultar perfiles privados o ejecutar funciones de administración) 
          pasa primero por estos middlewares. Si esta capa posee una falla, toda la seguridad del sistema queda comprometida.
        </p>
      </Callout>

      {/* ── SECCIÓN 1: QUÉ ES ESTE ARCHIVO ── */}
      <h2 id="amw-concepto">1. ¿Qué es este archivo y cómo funciona un Middleware?</h2>
      <p>
        Un <strong>middleware</strong> es una función que se ejecuta <em>en el medio</em> del flujo de procesamiento, entre la llegada del request del cliente y la ejecución final del controlador que devuelve la respuesta.
      </p>

      <CodeBlock
        title="Ciclo de vida de un Middleware en Express"
        language="text"
        code={`Cliente envía Request HTTP (con Cookie o Header Authorization)
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    auth.middleware.ts                           │
│                                                                 │
│  1. requireAuth:                                                │
│     ¿Tiene JWT válido? ── NO ──► return res.status(401).json() │
│            │                                                    │
│           SÍ                                                    │
│            ▼                                                    │
│     Inyecta datos en req (usuarioId, role, perfilId)            │
│     Llama a next()                                              │
│            │                                                    │
│            ▼                                                    │
│  2. requireRoles(['ADMIN', 'HEROE']):                           │
│     ¿Tiene el rol requerido? ── NO ──► res.status(403).json()   │
│            │                                                    │
│           SÍ                                                    │
│            ▼                                                    │
│     Llama a next()                                              │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
         Controlador final (ej. metahumano.controller.ts)`}
      />

      <div className="breakdown-box">
        <div className="breakdown-header"><span className="breakdown-title">Las 3 capacidades de un Middleware</span></div>
        <div className="tab-content active">
          <ul className="step-list">
            <li className="step-item">
              <span className="step-badge">1</span>
              <div>
                <h5>Dejar pasar el request (<code>next()</code>)</h5>
                <p>Si la validación es exitosa, invoca a <code>next()</code> sin argumentos para delegar el control al siguiente middleware o controlador.</p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">2</span>
              <div>
                <h5>Cortar la petición y responder de inmediato</h5>
                <p>Si faltan credenciales o el rol no alcanza, responde con un código de error HTTP (<code>401</code> o <code>403</code>) y <strong>corta el flujo</strong> mediante <code>return</code>.</p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">3</span>
              <div>
                <h5>Mutar / enriquecer el objeto <code>req</code></h5>
                <p>Extrae la identidad del usuario desde el JWT y la adjunta en <code>req.usuarioId</code>, <code>req.role</code>, etc., para que los controladores posteriores la usen directamente.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ── SECCIÓN 2: CÓDIGO COMPLETO ── */}
      <h2 id="amw-codigo">2. Código Completo de <code>auth.middleware.ts</code></h2>
      <CodeBlock
        title="Backend/src/auth/auth.middleware.ts"
        language="TypeScript"
        code={`import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { orm } from '../shared/db/orm.js';
import { Metahumano } from '../metahumano/metahumano.entity.js';
import { config } from '../config/environment.js';

export interface AuthedRequest extends Request {
  usuarioId?: number;
  role?: string;
  perfil?: string;
  perfilId?: number;
  tokenPayload?: any;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.auth_token;

    // Soportar también header Authorization: Bearer <token>
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'No autenticado (falta auth_token o token Bearer)' });
    }

    const payload = jwt.verify(token, config.jwtSecret) as any;

    (req as AuthedRequest).usuarioId = payload.usuarioId;
    (req as AuthedRequest).role      = payload.role;
    (req as AuthedRequest).perfil    = payload.perfil;
    (req as AuthedRequest).perfilId  = payload.perfilId;
    (req as AuthedRequest).tokenPayload = payload;

    if (!payload.usuarioId) {
      return res.status(400).json({ message: 'Token sin usuarioId' });
    }

    next();
  } catch (err: any) {
    return res.status(401).json({ message: 'Token inválido o expirado', error: err.message });
  }
}

export function requireRoles(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authedReq = req as AuthedRequest;
      if (!authedReq.usuarioId) {
        return res.status(401).json({ message: 'No autenticado' });
      }

      const roleUpper = (authedReq.role || '').toUpperCase();
      const allowedUpper = allowedRoles.map(r => r.toUpperCase());

      // Si el rol de usuario directo está permitido (NIVEL 1: JWT en memoria)
      if (allowedUpper.includes(roleUpper)) {
        return next();
      }

      // Si es METAHUMANO, verificar su subtipo (Heroe o Villano) en BD (NIVEL 2: Query BD)
      if (authedReq.role === 'METAHUMANO' && authedReq.perfilId) {
        const em = orm.em;
        const metahumano = await em.findOne(Metahumano, { id: authedReq.perfilId });
        if (metahumano) {
          const tipo = metahumano.tipoMeta.toUpperCase(); // HEROE o VILLANO
          if (allowedRoles.includes(tipo)) {
            return next();
          }
        }
      }

      return res.status(403).json({ message: 'Acceso denegado: rol o permisos insuficientes' });
    } catch (err: any) {
      next(err);
    }
  };
}`}
      />

      {/* ── SECCIÓN 3: IMPORTS ── */}
      <h2 id="amw-imports">3. Imports y Fundamentos de JWT</h2>
      <CodeBlock
        title="auth.middleware.ts — Dependencias principales"
        language="TypeScript"
        code={`import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { orm } from '../shared/db/orm.js';
import { Metahumano } from '../metahumano/metahumano.entity.js';
import { config } from '../config/environment.js';`}
      />

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Import</th>
              <th>Origen</th>
              <th>Función y Rol en el Sistema</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>Request, Response, NextFunction</code></td>
              <td><code>express</code></td>
              <td>Tipos fundamentales de Express para tipar los parámetros del middleware.</td>
            </tr>
            <tr>
              <td><code>jwt</code></td>
              <td><code>jsonwebtoken</code></td>
              <td>Librería utilizada aquí para verificar (<code>jwt.verify</code>) la firma criptográfica del token.</td>
            </tr>
            <tr>
              <td><code>orm</code></td>
              <td><code>../shared/db/orm.js</code></td>
              <td>Instancia global de MikroORM que expone el <code>EntityManager</code> (<code>orm.em</code>).</td>
            </tr>
            <tr>
              <td><code>Metahumano</code></td>
              <td><code>../metahumano/...</code></td>
              <td>Entidad consultada para averiguar si el metahumano es subtipo <code>Heroe</code> o <code>Villano</code>.</td>
            </tr>
            <tr>
              <td><code>config</code></td>
              <td><code>../config/...</code></td>
              <td>Provee <code>config.jwtSecret</code>, la clave secreta con la que se valida la firma del token.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="info" title="🔑 Concepto clave: JSON Web Token (JWT)">
        <p>
          Un <strong>JWT</strong> es una cadena de texto estructurada en tres partes separadas por puntos (<code>Header.Payload.Signature</code>).
          Contiene datos del usuario (payload) y está sellada criptográficamente con la clave privada del servidor. 
          Permite una arquitectura <em>Stateless</em> (sin estado): el servidor puede saber quién hace la petición sin consultar la base de datos en cada request.
        </p>
      </Callout>

      {/* ── SECCIÓN 4: INTERFAZ AUTHEDREQUEST ── */}
      <h2 id="amw-interface">4. La Interfaz <code>AuthedRequest</code></h2>
      <CodeBlock
        title="auth.middleware.ts — Extensión del Request de Express"
        language="TypeScript"
        code={`export interface AuthedRequest extends Request {
  usuarioId?: number;
  role?: string;
  perfil?: string;
  perfilId?: number;
  tokenPayload?: any;
}`}
      />

      <div className="breakdown-box">
        <div className="breakdown-header"><span className="breakdown-title">¿Por qué extender Request con TypeScript?</span></div>
        <div className="tab-content active">
          <ul className="step-list">
            <li className="step-item">
              <span className="step-badge">TS</span>
              <div>
                <h5>Seguridad y Chequeo Estricto de Tipos</h5>
                <p>
                  El objeto <code>Request</code> estándar de Express no tiene propiedades como <code>usuarioId</code> o <code>role</code>. 
                  Si intentas escribir <code>req.usuarioId = 5</code>, el compilador de TypeScript arrojará un error. 
                  La interfaz <code>AuthedRequest</code> le enseña a TypeScript que nuestro request autenticado contiene estos atributos inyectados.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">?</span>
              <div>
                <h5>Propiedades Opcionales (<code>?</code>)</h5>
                <p>
                  Son opcionales porque antes de que <code>requireAuth</code> se ejecute y valide el token, las propiedades son <code>undefined</code>.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ── SECCIÓN 5: REQUIREAUTH ── */}
      <h2 id="amw-requireauth">5. Desglose Paso a Paso de <code>requireAuth</code></h2>
      <p>
        <code>requireAuth</code> es una función <strong>sincrónica</strong> encargada de validar la autenticidad del token y cargar la identidad en el request.
      </p>

      <CodeBlock
        title="auth.middleware.ts — requireAuth completo"
        language="TypeScript"
        code={`export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Lectura de cookie segura httpOnly (Frontend Web)
    let token = req.cookies?.auth_token;

    // 2. Soporte fallback para Header Authorization: Bearer <token> (Postman / Mobile)
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    // 3. Si no llegó ningún token, rechazar con 401
    if (!token) {
      return res.status(401).json({ message: 'No autenticado (falta auth_token o token Bearer)' });
    }

    // 4. Verificación criptográfica con la clave secreta
    const payload = jwt.verify(token, config.jwtSecret) as any;

    // 5. Inyección de datos en el Request mediante type assertion
    (req as AuthedRequest).usuarioId = payload.usuarioId;
    (req as AuthedRequest).role      = payload.role;
    (req as AuthedRequest).perfil    = payload.perfil;
    (req as AuthedRequest).perfilId  = payload.perfilId;
    (req as AuthedRequest).tokenPayload = payload;

    // 6. Validación de integridad del payload
    if (!payload.usuarioId) {
      return res.status(400).json({ message: 'Token sin usuarioId' });
    }

    // 7. Continuar al siguiente eslabón
    next();
  } catch (err: any) {
    return res.status(401).json({ message: 'Token inválido o expirado', error: err.message });
  }
}`}
      />

      <div className="breakdown-box">
        <div className="breakdown-header"><span className="breakdown-title">Análisis técnico de requireAuth</span></div>
        <div className="tab-content active">
          <ul className="step-list">
            <li className="step-item">
              <span className="step-badge">1</span>
              <div>
                <h5><code>req.cookies?.auth_token</code> con Optional Chaining</h5>
                <p>El operador <code>?.</code> evita que la aplicación arroje un error fatal si <code>req.cookies</code> es <code>undefined</code> (por ejemplo, si faltara inicializar el middleware <code>cookie-parser</code>).</p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">2</span>
              <div>
                <h5>Estrategia Híbrida Cookie vs Bearer</h5>
                <p>Permite que el navegador web use cookies protegidas con <code>httpOnly</code> (inmunes a robos vía XSS), mientras que herramientas como Postman o apps móviles envían el token en el encabezado <code>Authorization: Bearer &lt;token&gt;</code>.</p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">3</span>
              <div>
                <h5><code>jwt.verify()</code> y Manejo de Excepciones</h5>
                <p><code>jwt.verify</code> no retorna <code>false</code> si el token es falso o expiró; <strong>arroja una excepción (throw)</strong>. El bloque <code>try/catch</code> atrapa cualquier fallo y responde <code>401 Unauthorized</code> sin tumbar el servidor.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ── SECCIÓN 6: REQUIREROLES ── */}
      <h2 id="amw-requireroles">6. <code>requireRoles</code> — Higher-Order Function & Autorización en Dos Niveles</h2>
      
      <Callout type="tip" title="💡 Patrón Higher-Order Function (Factory de Middlewares)">
        <p>
          <code>requireRoles</code> <strong>no es un middleware en sí mismo</strong>, sino una fábrica (factory). Recibe el arreglo <code>allowedRoles</code> y <strong>retorna una función middleware asíncrona</strong> que recuerda esos roles gracias al mecanismo de <em>closures</em> de JavaScript.
        </p>
        <p style={{ marginTop: '8px' }}>
          Por eso en las rutas se escribe: <code>router.delete('/admin/:id', requireAuth, requireRoles(['ADMIN']), handler)</code>.
        </p>
      </Callout>

      <CodeBlock
        title="auth.middleware.ts — requireRoles y consulta asíncrona"
        language="TypeScript"
        code={`export function requireRoles(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authedReq = req as AuthedRequest;
      if (!authedReq.usuarioId) {
        return res.status(401).json({ message: 'No autenticado' });
      }

      const roleUpper = (authedReq.role || '').toUpperCase();
      const allowedUpper = allowedRoles.map(r => r.toUpperCase());

      // ── NIVEL 1: Rol de sistema directo desde el JWT (En memoria, 0 queries)
      if (allowedUpper.includes(roleUpper)) {
        return next();
      }

      // ── NIVEL 2: Subtipo de Metahumano (Heroe / Villano) consultando la BD
      if (authedReq.role === 'METAHUMANO' && authedReq.perfilId) {
        const em = orm.em;
        const metahumano = await em.findOne(Metahumano, { id: authedReq.perfilId });
        if (metahumano) {
          const tipo = metahumano.tipoMeta.toUpperCase(); // 'HEROE' o 'VILLANO'
          if (allowedRoles.includes(tipo)) {
            return next();
          }
        }
      }

      return res.status(403).json({ message: 'Acceso denegado: rol o permisos insuficientes' });
    } catch (err: any) {
      next(err); // Delega errores inesperados al Error Handler global de Express
    }
  };
}`}
      />

      <div className="two-col-grid">
        <div className="concept-card">
          <div className="card-icon">⚡</div>
          <h4>Nivel 1: Rol de Sistema</h4>
          <p>Valida roles generales como <code>ADMIN</code>, <code>BUROCRATA</code> o <code>METAHUMANO</code> directamente desde el payload del JWT. <strong>Cero consultas SQL</strong>, rendimiento instantáneo.</p>
        </div>
        <div className="concept-card">
          <div className="card-icon">🗄️</div>
          <h4>Nivel 2: Subtipo Polimórfico</h4>
          <p>Para subtipos de negocio como <code>HEROE</code> o <code>VILLANO</code> (que pueden cambiar dinámicamente o pertenecer a la jerarquía STI), consulta a MySQL mediante <code>em.findOne()</code>.</p>
        </div>
      </div>

      {/* ── SECCIÓN 7: 401 VS 403 ── */}
      <h2 id="amw-codigos">7. 401 Unauthorized vs 403 Forbidden</h2>
      <p>
        Distinguir correctamente estos dos códigos de estado HTTP es esencial para exámenes y diseño de APIs profesionales:
      </p>

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Código HTTP</th>
              <th>Concepto Clave</th>
              <th>Significado en Palabras Simples</th>
              <th>Ejemplo en SuperGestor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="status-badge" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' }}>401 Unauthorized</span></td>
              <td><strong>Identidad / Autenticación</strong></td>
              <td><em>"No sé quién sos"</em> (Falta token, token corrupto, firma inválida o expirada).</td>
              <td>Un usuario no logueado intenta ver <code>GET /api/usuarios/perfil</code>.</td>
            </tr>
            <tr>
              <td><span className="status-badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fbbf24' }}>403 Forbidden</span></td>
              <td><strong>Permisos / Autorización</strong></td>
              <td><em>"Sé quién sos, pero no tenés autorización para este recurso"</em>.</td>
              <td>Un usuario con rol <code>BUROCRATA</code> intenta llamar a <code>DELETE /api/usuarios/admin/usuarios/:id</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── SECCIÓN 8: GLOSARIO ── */}
      <h2 id="amw-glosario">8. Glosario Rápido</h2>
      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Término</th>
              <th>Definición en el Contexto del Proyecto</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Middleware</strong></td><td>Función interceptora de Express que procesa el request antes de llegar al controlador final.</td></tr>
            <tr><td><strong>JWT</strong></td><td>JSON Web Token: credencial firmada con clave secreta que almacena datos de identidad.</td></tr>
            <tr><td><strong><code>jwt.verify()</code></strong></td><td>Método síncrono que valida la firma criptográfica y la vigencia temporal del token.</td></tr>
            <tr><td><strong>Optional Chaining (<code>?.</code>)</strong></td><td>Operador seguro de acceso a propiedades que retorna <code>undefined</code> en lugar de arrojar error.</td></tr>
            <tr><td><strong>Type Assertion (<code>as</code>)</strong></td><td>Casting de TypeScript para tratar un tipo genérico como uno más específico (ej. <code>req as AuthedRequest</code>).</td></tr>
            <tr><td><strong>Higher-Order Function</strong></td><td>Función que retorna otra función (usada como factory en <code>requireRoles</code>).</td></tr>
            <tr><td><strong>Closure</strong></td><td>Habilidad de la función interna de recordar las variables de su entorno léxico (<code>allowedRoles</code>).</td></tr>
            <tr><td><strong>Entity Manager (<code>em</code>)</strong></td><td>Servicio de MikroORM para ejecutar operaciones y consultas sobre la base de datos.</td></tr>
            <tr><td><strong><code>next(err)</code></strong></td><td>Invocación especial de <code>next</code> que salta inmediatamente al middleware global de errores.</td></tr>
          </tbody>
        </table>
      </div>

      {/* ── SECCIÓN 9: QUIZ ── */}
      <h2 id="amw-quiz">9. Quiz de Repaso y Autoevaluación</h2>
      <p>Verifica tu comprensión de <code>auth.middleware.ts</code> con este test interactivo:</p>
      <Quiz questions={quizQuestions} />
    </div>
  );
}
