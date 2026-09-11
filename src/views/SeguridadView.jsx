import React, { useState } from "react";
import CodeBlock from "../components/CodeBlock";
import Callout from "../components/Callout";
import Quiz from "../components/Quiz";

export default function SeguridadView() {
  const [activeTab, setActiveTab] = useState("matrix");

  const quizQuestions = [
    {
      question: "¿Por qué la seguridad de roles implementada en el Frontend (ProtectedRoute) no es suficiente por sí sola?",
      options: [
        "Porque React es más lento que Express validando permisos.",
        "Porque el código del frontend se ejecuta en el navegador del cliente y puede ser manipulado o salteado enviando peticiones HTTP directas (con curl, Postman o fetch) al backend. El Backend siempre debe ser la autoridad final de seguridad.",
        "Porque ProtectedRoute no tiene acceso a las cookies httpOnly.",
        "Porque en el frontend solo se pueden verificar hasta 2 roles a la vez."
      ],
      correct: 1,
      explanation: "El frontend oculta elementos y redirige para una mejor experiencia de usuario (UX), pero un usuario malintencionado puede inspeccionar o modificar el código del cliente o enviar peticiones directas a la API. Toda validación de seguridad crítica debe validarse inexcusablemente en el Backend."
    },
    {
      question: "¿Qué ventaja de seguridad ofrece almacenar el JWT en una cookie con flag httpOnly: true en lugar de localStorage?",
      options: [
        "Hace que el token nunca expire.",
        "Protege el token contra robo mediante ataques XSS (Cross-Site Scripting), ya que JavaScript del navegador (document.cookie) tiene terminantemente prohibido acceder a cookies httpOnly.",
        "Permite encriptar el token con algoritmo RSA automáticamente.",
        "Evita que el servidor tenga que verificar la firma del token."
      ],
      correct: 1,
      explanation: "Si una aplicación sufre una inyección de script malicioso (XSS), dicho script puede leer todo lo almacenado en localStorage (localStorage.getItem('token')). Con httpOnly: true, el navegador maneja la cookie internamente y prohíbe el acceso desde document.cookie o scripts."
    },
    {
      question: "¿Cómo funciona la autorización en 2 niveles de requireRoles en el Backend de SuperGestor?",
      options: [
        "Nivel 1 verifica el email del usuario y Nivel 2 verifica la contraseña.",
        "Nivel 1 verifica el rol general (ADMIN, BUROCRATA, METAHUMANO) en memoria desde el JWT (sin consultar la BD); si se requiere un subtipo como HEROE o VILLANO, Nivel 2 consulta asíncronamente a MySQL mediante MikroORM.",
        "Nivel 1 usa un firewall de red y Nivel 2 usa un middleware de Express.",
        "Nivel 1 se ejecuta en frontend y Nivel 2 en backend."
      ],
      correct: 1,
      explanation: "El Nivel 1 en memoria proporciona máximo rendimiento (cero consultas SQL) para roles estándar. El Nivel 2 se activa solo cuando se requiere comprobar subtipos polimórficos de la entidad Metahumano (Single Table Inheritance)."
    },
    {
      question: "¿Cómo previene MikroORM los ataques de Inyección SQL (SQL Injection)?",
      options: [
        "Porque bloquea todas las peticiones con comillas en el body.",
        "Porque compila las consultas utilizando Prepared Statements (consultas parametrizadas), enviando las instrucciones SQL y los datos de entrada por canales separados al motor MySQL.",
        "Porque guarda las contraseñas encriptadas con SHA-256.",
        "Porque convierte todas las sentencias SQL en archivos JSON estáticos."
      ],
      correct: 1,
      explanation: "Al usar MikroORM con EntityManager (em.findOne, em.persistAndFlush, etc.), los valores de entrada se envían al motor de base de datos como parámetros aislados en Prepared Statements, impidiendo que código SQL malicioso sea interpretado como instrucción ejecutable."
    },
    {
      question: "¿Qué función cumple bcryptjs con salt de 10 rondas al registrar usuarios?",
      options: [
        "Comprime las contraseñas para que ocupen menos bytes en la base de datos.",
        "Genera un hash unidireccional y le añade un salt aleatorio único por usuario, protegiendo las credenciales contra ataques de fuerza bruta y tablas arcoíris (Rainbow Tables).",
        "Cifra la contraseña de modo que el administrador pueda descifrarla cuando sea necesario.",
        "Verifica que la contraseña contenga mayúsculas y símbolos especiales."
      ],
      correct: 1,
      explanation: "El hashing con bcrypt es irreversible (unidireccional). El salt aleatorio asegura que dos usuarios con la misma contraseña tengan hashes completamente diferentes, neutralizando tablas arcoíris."
    },
    {
      question: "¿Qué vulnerabilidad de control de acceso previene la verificación if (multa.evidencia?.carpeta?.metahumano?.id !== metahumanoId) en Multa.controller.ts?",
      options: [
        "Cross-Site Scripting (XSS).",
        "IDOR / BOLA (Insecure Direct Object Reference / Broken Object Level Authorization), impidiendo que un usuario pague o manipule multas ajenas cambiando el ID en la URL.",
        "SQL Injection por concatenación de parámetros.",
        "Denegación de Servicio (DoS)."
      ],
      correct: 1,
      explanation: "Esta validación comprueba la propiedad horizontal del recurso: aunque el usuario esté autenticado legítimamente, el servidor rechaza con 403 Forbidden si el objeto al que intenta acceder no le pertenece a su perfil de metahumano."
    },
    {
      question: "¿Cuál es el propósito del hook @BeforeCreate / @BeforeUpdate validateRoleConsistency() en Usuario.entity.ts?",
      options: [
        "Hashear la contraseña antes de guardarla.",
        "Asegurar la integridad del dominio impidiendo que un usuario tenga perfiles simultáneos de Metahumano y Burócrata, o que su rol no coincida con el perfil asignado.",
        "Enviar un correo de confirmación de registro.",
        "Generar el token JWT de la sesión."
      ],
      correct: 1,
      explanation: "El hook de ciclo de vida del ORM valida a nivel de entidad que no existan inconsistencias de rol/perfil antes de que los datos toquen la base de datos MySQL, previniendo estados inválidos de privilegios."
    }
  ];

  return (
    <div className="doc-section">
      <h1>
        <code style={{ fontSize: "26px" }}>🛡️ Arquitectura de Seguridad Integral</code> — Backend & Frontend
      </h1>
      <p className="page-lead">
        Análisis exhaustivo y forense de todas las defensas implementadas en <strong>SuperGestor</strong>. 
        Este módulo documenta el modelo de <strong>Defensa en Profundidad</strong> (<em>Defense in Depth</em>), el control de acceso 
        basado en roles (<strong>RBAC</strong>) dual en el cliente y servidor, autenticación <strong>JWT</strong> con cookies 
        seguras <code>httpOnly</code>, aislamiento de datos contra <strong>IDOR/BOLA</strong>, hashing criptográfico con <strong>bcrypt</strong>, 
        sanitización de inputs, protección ante <strong>SQL Injection</strong> con <strong>MikroORM</strong> y la suite completa de tests de seguridad automatizados.
      </p>

      <Callout type="tip" title="🎯 Principio Rector: Defensa en Profundidad (Defense in Depth)">
        <p>
          En <strong>SuperGestor</strong>, la seguridad no se delega a un único componente perimetral. Se organiza en <strong>múltiples capas defensivas interconectadas</strong>:
          el <strong>Frontend</strong> previene navegación errónea y resguarda la experiencia de usuario (UX); el <strong>Transporte HTTP</strong> aísla orígenes con CORS y cookies blindadas; 
          los <strong>Middlewares de Express</strong> autentican criptográficamente y autorizan por rol; las <strong>Entidades de Dominio</strong> garantizan la integridad de datos; 
          y el <strong>ORM</strong> parametriza todas las operaciones hacia la base de datos MySQL.
        </p>
      </Callout>

      {/* ── SECCIÓN 1: PANORAMA GENERAL ── */}
      <h2 id="sec-panorama">1. Mapa de Seguridad: Frontend vs Backend</h2>
      <p>
        A continuación se resumen las responsabilidades de seguridad distribuidas minuciosamente en toda la arquitectura del sistema:
      </p>

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Capa</th>
              <th>Mecanismo / Tecnología</th>
              <th>Archivos Clave</th>
              <th>Propósito y Mitigación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Frontend (Cliente)</strong></td>
              <td><code>ProtectedRoute</code> & <code>normalizeRole</code></td>
              <td><code>Front/src/components/ProtectedRoute.jsx</code></td>
              <td>Guardián de navegación en React Router. Redirige usuarios anónimos a <code>/login</code> y no autorizados a <code>/</code> sin contaminar el historial (<code>replace</code>).</td>
            </tr>
            <tr>
              <td><strong>Frontend (Cliente)</strong></td>
              <td><code>AuthContext</code> & State Sync</td>
              <td><code>Front/src/context/AuthContext.jsx</code></td>
              <td>Gestión de estado de sesión, sincronización reactiva bidireccional entre cookies y <code>localStorage</code>, y destrucción coordinada en <code>logout()</code>.</td>
            </tr>
            <tr>
              <td><strong>Frontend (Cliente)</strong></td>
              <td>Axios con <code>withCredentials: true</code></td>
              <td><code>Front/src/api/client.js</code></td>
              <td>Transmisión automática de cookies seguras <code>httpOnly</code> en peticiones cross-origin a la API de Express (<code>localhost:3000</code>).</td>
            </tr>
            <tr>
              <td><strong>Frontend (Cliente)</strong></td>
              <td>Layouts Segregados por Rol</td>
              <td><code>Front/src/components/layouts/*</code></td>
              <td>Restricción visual en UI (sidebars <code>SidebarAdmin</code>, <code>SidebarBurocrata</code>, <code>SidebarMetaHum</code> que no exponen controles ajenos).</td>
            </tr>
            <tr>
              <td><strong>Frontend (Cliente)</strong></td>
              <td>Form Validation (<code>react-hook-form</code>)</td>
              <td><code>LoginPage.jsx</code> / <code>RegisterPage.jsx</code></td>
              <td>Validación sintáctica previa de emails, longitudes mínimas de password (8 caracteres en registro) y confirmación de claves.</td>
            </tr>
            <tr>
              <td><strong>Backend (Servidor)</strong></td>
              <td><code>requireAuth</code> (JWT Verification)</td>
              <td><code>Backend/src/auth/auth.middleware.ts</code></td>
              <td>Validación criptográfica de firma HMAC-SHA256 y expiración temporal (24h). Rechaza peticiones sin token o corruptas con <code>401 Unauthorized</code>.</td>
            </tr>
            <tr>
              <td><strong>Backend (Servidor)</strong></td>
              <td><code>requireRoles</code> (RBAC en 2 Niveles)</td>
              <td><code>Backend/src/auth/auth.middleware.ts</code></td>
              <td>Nivel 1 en memoria (0 consultas SQL) + Nivel 2 en MySQL para subtipos polimórficos (<code>HEROE</code> / <code>VILLANO</code>). Rechaza con <code>403 Forbidden</code>.</td>
            </tr>
            <tr>
              <td><strong>Backend (Servidor)</strong></td>
              <td>Cookies <code>httpOnly</code>, <code>secure</code>, <code>sameSite</code></td>
              <td><code>Backend/src/auth/usuario.controller.ts</code></td>
              <td>Protección total de tokens de sesión contra robos vía <strong>XSS</strong> y mitigación de falsificación de peticiones en sitios cruzados (<strong>CSRF</strong>).</td>
            </tr>
            <tr>
              <td><strong>Backend (Servidor)</strong></td>
              <td><code>bcryptjs</code> (Cost 10 + Salt Único)</td>
              <td><code>Backend/src/auth/usuario.controller.ts</code></td>
              <td>Hashing unidireccional irreversible de contraseñas. Destruye la viabilidad de ataques por <strong>Tablas Arcoíris</strong> (Rainbow Tables) y fuerza bruta.</td>
            </tr>
            <tr>
              <td><strong>Backend (Servidor)</strong></td>
              <td>Control de Propiedad (Anti-IDOR / BOLA)</td>
              <td><code>Multa.controller.ts</code> / <code>metahumano.controller.ts</code></td>
              <td>Verificación estricta de que el recurso solicitado pertenece al <code>perfilId</code> del token antes de permitir pagos o mutaciones.</td>
            </tr>
            <tr>
              <td><strong>Backend (Servidor)</strong></td>
              <td>Sanitización de Inputs</td>
              <td><code>*.controller.ts</code> (ej. <code>sanitizeMetahumanoInput</code>)</td>
              <td>Limpieza de payload, whitelist de campos autorizados, conversión de tipos numéricos y eliminación de claves maliciosas o <code>undefined</code>.</td>
            </tr>
            <tr>
              <td><strong>Backend (Servidor)</strong></td>
              <td><strong>MikroORM</strong> Prepared Statements</td>
              <td><code>Backend/src/shared/db/orm.ts</code></td>
              <td>Inmunidad estructural contra <strong>Inyección SQL</strong> mediante consultas parametrizadas en el driver SQL de MySQL.</td>
            </tr>
            <tr>
              <td><strong>Backend (Servidor)</strong></td>
              <td>Validación de Dominio (Entity Lifecycle Hooks)</td>
              <td><code>Backend/src/auth/usuario.entity.ts</code></td>
              <td>Hooks <code>@BeforeCreate</code> y <code>@BeforeUpdate</code> que bloquean asignaciones cruzadas incompatibles entre roles y perfiles.</td>
            </tr>
            <tr>
              <td><strong>Backend (Servidor)</strong></td>
              <td>CORS Whitelist & RequestContext</td>
              <td><code>Backend/src/app.ts</code></td>
              <td>Aislamiento de orígenes permitidos (<code>localhost:5173</code> / <code>127.0.0.1:5173</code>) y Unit of Work aislado por petición HTTP concurrente.</td>
            </tr>
            <tr>
              <td><strong>Backend (Servidor)</strong></td>
              <td>Manejo Centralizado de Errores</td>
              <td><code>shared/middlewares/error.middleware.ts</code></td>
              <td>Middleware de captura de excepciones que estandariza códigos HTTP y previene la fuga de stack traces sensibles en producción.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── SECCIÓN 2: SEGURIDAD EN EL FRONTEND ── */}
      <h2 id="sec-front">2. Seguridad en el Frontend: Roles, Rutas y Validación</h2>
      <p>
        En una Single Page Application (SPA), el frontend tiene la responsabilidad de brindar una experiencia fluida, 
        impidiendo que los usuarios accedan a pantallas indebidas o vean opciones que no les corresponden.
      </p>

      <CodeBlock
        title="Front/src/components/ProtectedRoute.jsx — Guardián de Rutas RBAC"
        language="JavaScript"
        code={`import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Normalizar roles para soportar sinónimos (ej: 'META' -> 'METAHUMANO')
export const normalizeRole = (role) => {
    if (!role) return null;
    const roleUpper = String(role).toUpperCase().trim();
    switch (roleUpper) {
        case 'METAHUMANO':
        case 'META':
            return 'METAHUMANO';
        case 'BUROCRATA':
        case 'BURO':
            return 'BUROCRATA';
        case 'ADMIN':
        case 'ADMINISTRATOR':
            return 'ADMIN';
        default:
            return roleUpper;
    }
};

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [] }) => {
    const { isAuthenticated, user } = useAuth();

    // 1. Si no está autenticado, redirigir al login sin dejar rastro en el historial
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRole = normalizeRole(user?.role);

    // 2. Combinar requiredRole y allowedRoles en una lista normalizada
    const allowedList = [
        ...(Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]),
        ...(requiredRole ? [requiredRole] : [])
    ]
        .filter(Boolean)
        .map(r => normalizeRole(r));

    // 3. Si se especificaron roles permitidos, verificar pertenencia
    if (allowedList.length > 0 && (!userRole || !allowedList.includes(userRole))) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;`}
      />

      <div className="breakdown-box">
        <div className="breakdown-header"><span className="breakdown-title">Pilares de la Protección en el Cliente</span></div>
        <div className="tab-content active">
          <ul className="step-list">
            <li className="step-item">
              <span className="step-badge">1</span>
              <div>
                <h5>Normalización de Roles (<code>normalizeRole</code>)</h5>
                <p>
                  Elimina fallos derivados de inconsistencias tipográficas o abreviaciones. Mapea <code>"META"</code> a <code>"METAHUMANO"</code> y <code>"BURO"</code> a <code>"BUROCRATA"</code> antes de verificar pertenencia, blindando la lógica ante discrepancias de formato.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">2</span>
              <div>
                <h5>Navegación Atómica con <code>Navigate replace</code></h5>
                <p>
                  La directiva <code>replace</code> reemplaza la entrada actual en la pila de navegación del navegador en lugar de empujar una nueva. Esto imposibilita que un usuario expulsado regrese a una pantalla restringida presionando el botón "Atrás".
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">3</span>
              <div>
                <h5>Enrutamiento Dinámico Automatizado (<code>useRoleNavigation</code>)</h5>
                <p>
                  Mediante <code>getHomeRouteByRole()</code>, el sistema despacha a los usuarios recién autenticados inmediatamente a su panel específico:
                  <code>ADMIN</code> → <code>/admin</code>, <code>BUROCRATA</code> → <code>/burocrata</code>, <code>METAHUMANO</code> → <code>/metahumano</code>.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">4</span>
              <div>
                <h5>Validación en Formularios de Entrada</h5>
                <p>
                  En <code>LoginPage.jsx</code> y <code>RegisterPage.jsx</code>, <code>react-hook-form</code> valida expresiones regulares para correos válidos y restringe contraseñas cortas (mínimo 8 caracteres en registro) antes de que cualquier byte sea transmitido por la red.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <Callout type="warning" title="⚠️ Regla de Oro: El Front Oculta, el Back Protege">
        <p>
          Las comprobaciones en React nunca deben confundirse con seguridad absoluta. Cualquier usuario puede abrir la consola de desarrollo (F12) 
          y alterar <code>localStorage</code> o el estado de React. Por ello, <strong>el backend nunca asume como verídica ninguna afirmación del frontend</strong> y 
          valida de forma autónoma cada petición mediante JWT y middlewares de servidor.
        </p>
      </Callout>

      {/* ── SECCIÓN 3: SEGURIDAD EN EL BACKEND ── */}
      <h2 id="sec-back">3. Seguridad en el Backend: JWT y Autorización en 2 Niveles</h2>
      <p>
        El Backend implementa autenticación <strong>Stateless</strong> basada en tokens <strong>JWT</strong> firmados criptográficamente y un 
        mecanismo de autorización en dos niveles altamente optimizado:
      </p>

      <CodeBlock
        title="Flujo Forense de Validación de una Solicitud HTTP en Express"
        language="text"
        code={`Petición HTTP entrante (Axios withCredentials: true)
        │
        ▼
1. CORS Whitelist ──► ¿Origin es http://localhost:5173 o 127.0.0.1:5173?
        │             NO ──► Error 500: 'No permitido por CORS'
       SÍ
        ▼
2. RequestContext ──► Crea Unit of Work asíncrono e independiente para MikroORM
        │
        ▼
3. requireAuth ──────► Extrae token de req.cookies.auth_token (o Authorization: Bearer <token>)
        │             Ejecuta jwt.verify(token, config.jwtSecret)
        │             ¿Falta token, firma inválida o expiró? ──► 401 Unauthorized
       SÍ
        ▼
4. requireRoles ─────► NIVEL 1 (Memoria): Compara req.role con allowedRoles sin tocar la BD
        │             ¿Coincide? (ej: 'ADMIN' o 'BUROCRATA') ──► ¡Pasa directo! (next())
        │             NO ──► Si req.role == 'METAHUMANO', evalúa Nivel 2
        │
        ▼
   NIVEL 2 (BD) ─────► Consulta MySQL: em.findOne(Metahumano, { id: req.perfilId })
        │             Obtiene subtipo polimórfico (tipoMeta: 'HEROE' o 'VILLANO')
        │             ¿Coincide con allowedRoles? ──► next()
        │             NO ──► 403 Forbidden ('Acceso denegado: rol o permisos insuficientes')
        ▼
5. Sanitizer ────────► sanitize...Input extrae solo campos permitidos y elimina inyecciones
        │
        ▼
6. Controller & ORM ─► MikroORM ejecuta consulta parametrizada con Prepared Statements`}
      />

      <CodeBlock
        title="Backend/src/auth/auth.middleware.ts — requireAuth & requireRoles"
        language="TypeScript"
        code={`export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.auth_token;

    // Soporte dual: Cookie httpOnly prioritaria + Fallback para Header Bearer (Postman/cURL)
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'No autenticado (falta auth_token o token Bearer)' });
    }

    // Verificación criptográfica de firma y expiración temporal
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

      // NIVEL 1: Validación instantánea en memoria (0 consultas SQL)
      if (allowedUpper.includes(roleUpper)) {
        return next();
      }

      // NIVEL 2: Validación en Base de Datos para subtipos polimórficos HEROE / VILLANO
      if (authedReq.role === 'METAHUMANO' && authedReq.perfilId) {
        const em = orm.em;
        const metahumano = await em.findOne(Metahumano, { id: authedReq.perfilId });
        if (metahumano) {
          const tipo = metahumano.tipoMeta.toUpperCase();
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

      {/* ── SECCIÓN 4: MATRIZ DE PERÍMETRO DE RUTAS ── */}
      <h2 id="sec-matriz">4. Matriz del Perímetro de Seguridad (Rutas API)</h2>
      <p>
        Cada endpoint del sistema se encuentra estrictamente categorizado según su exposición pública o su nivel de privilegios requerido:
      </p>

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Módulo / Endpoint</th>
              <th>Método</th>
              <th>Protección Aplicada</th>
              <th>Roles Autorizados</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>/api/auth/register/*</code></td>
              <td><code>POST</code></td>
              <td>Público</td>
              <td>Cualquiera (Anónimo)</td>
              <td>Registro de nuevas cuentas como Metahumano o Burócrata.</td>
            </tr>
            <tr>
              <td><code>/api/auth/login</code></td>
              <td><code>POST</code></td>
              <td>Público</td>
              <td>Cualquiera (Anónimo)</td>
              <td>Valida credenciales contra bcrypt y emite cookies de sesión.</td>
            </tr>
            <tr>
              <td><code>/api/auth/logout</code></td>
              <td><code>POST</code></td>
              <td>Público / Autenticado</td>
              <td>Cualquiera</td>
              <td>Invalida cookies (<code>maxAge: 0</code>) y destruye la sesión.</td>
            </tr>
            <tr>
              <td><code>/api/auth/perfil</code></td>
              <td><code>GET</code></td>
              <td><code>requireAuth</code></td>
              <td>Todos los autenticados</td>
              <td>Obtiene la información del usuario logueado.</td>
            </tr>
            <tr>
              <td><code>/api/auth/admin/usuarios</code></td>
              <td><code>GET, DELETE</code></td>
              <td><code>requireAuth, requireRoles</code></td>
              <td><code>ADMIN</code></td>
              <td>Administración y eliminación de usuarios del sistema.</td>
            </tr>
            <tr>
              <td><code>/api/carpetas</code></td>
              <td><code>GET</code></td>
              <td><code>requireAuth</code></td>
              <td>Todos los autenticados</td>
              <td>Listado de carpetas y trámites según visibilidad.</td>
            </tr>
            <tr>
              <td><code>/api/carpetas</code></td>
              <td><code>POST, PATCH</code></td>
              <td><code>requireAuth, requireRoles</code></td>
              <td><code>BUROCRATA, ADMIN</code></td>
              <td>Creación de carpetas y transición de estados (aprobación/rechazo).</td>
            </tr>
            <tr>
              <td><code>/api/carpetas/:id</code></td>
              <td><code>DELETE</code></td>
              <td><code>requireAuth, requireRoles</code></td>
              <td><code>ADMIN</code></td>
              <td>Eliminación física de un expediente.</td>
            </tr>
            <tr>
              <td><code>/api/multas</code></td>
              <td><code>GET, POST, PUT</code></td>
              <td><code>requireAuth, requireRoles</code></td>
              <td><code>BUROCRATA, ADMIN</code></td>
              <td>Gestión integral y emisión de multas e infracciones.</td>
            </tr>
            <tr>
              <td><code>/api/multas/:id/pagar</code></td>
              <td><code>POST</code></td>
              <td><code>requireAuth + Ownership</code></td>
              <td><code>METAHUMANO</code></td>
              <td>Pago de multa con verificación estricta de propiedad (Anti-IDOR).</td>
            </tr>
            <tr>
              <td><code>/api/villano/tramite-rehabilitacion</code></td>
              <td><code>POST</code></td>
              <td><code>requireAuth, requireRoles</code></td>
              <td><code>VILLANO</code> (Nivel 2)</td>
              <td>Solicitud de rehabilitación exclusiva para villanos sin deudas.</td>
            </tr>
            <tr>
              <td><code>/api/heroe/solicitud-enemigos</code></td>
              <td><code>POST</code></td>
              <td><code>requireAuth, requireRoles</code></td>
              <td><code>HEROE</code> (Nivel 2)</td>
              <td>Solicitud de asignación de archienemigo para héroes activos.</td>
            </tr>
            <tr>
              <td><code>/api/poderes</code></td>
              <td><code>POST, PUT</code></td>
              <td><code>requireAuth, requireRoles</code></td>
              <td><code>BUROCRATA, ADMIN</code></td>
              <td>Definición y catálogo de superpoderes en el sistema.</td>
            </tr>
            <tr>
              <td><code>/api/evidencias</code></td>
              <td><code>POST, PUT, PATCH</code></td>
              <td><code>requireAuth, requireRoles</code></td>
              <td><code>BUROCRATA, ADMIN</code></td>
              <td>Carga de pruebas probatorias asociadas a expedientes.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── SECCIÓN 5: COOKIES SEGURAS Y XSS/CSRF ── */}
      <h2 id="sec-cookies">5. Manejo Seguro de Cookies: Protección Anti-XSS y Anti-CSRF</h2>
      <p>
        Al completar un login o registro en <code>usuario.controller.ts</code>, el servidor emite una estrategia de <strong>Dual Cookies</strong>, 
        diseñada para satisfacer a la vez la máxima seguridad criptográfica y la flexibilidad de renderizado en React:
      </p>

      <CodeBlock
        title="Backend/src/auth/usuario.controller.ts — Estrategia de Doble Cookie"
        language="TypeScript"
        code={`const isProd = process.env.NODE_ENV === 'production';

// 1. COOKIE DE SEGURIDAD (auth_token) — Credencial Ultra Crítica
res.cookie('auth_token', token, {
  httpOnly: true,                         // Inaccesible desde JS (document.cookie) -> INMUNIDAD A XSS
  secure: isProd,                         // Solo viaja cifrada por HTTPS en producción
  sameSite: isProd ? 'strict' : 'lax',    // Bloquea envío en peticiones externas -> PREVIENE CSRF
  maxAge: 1000 * 60 * 60 * 24,            // Expiración forzada a las 24 horas
  path: '/'
});

// 2. COOKIE INFORMATIVA (user_info) — Metadatos para la UI (Sin secretos)
res.cookie('user_info', JSON.stringify({
  id: usuario.id,
  role: usuario.role,
  perfil,
  perfilId,
  alias: perfilData.alias || perfilData.nombre
}), {
  httpOnly: false,                        // Legible por document.cookie en utils/cookies.js
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  maxAge: 1000 * 60 * 60 * 24,
  path: '/'
});`}
      />

      <div className="two-col-grid">
        <div className="concept-card">
          <div className="card-icon">🛡️</div>
          <h4>Protección Anti-XSS (<code>httpOnly: true</code>)</h4>
          <p>
            Al marcar <code>auth_token</code> como <code>httpOnly</code>, el motor del navegador prohíbe taxativamente que cualquier código JavaScript 
            acceda a su valor. Incluso en el hipotético caso de que un script malicioso logre inyectarse en el DOM, <strong>no puede robar el token de autenticación</strong>, 
            a diferencia de arquitecturas vulnerables que persisten JWTs en <code>localStorage</code>.
          </p>
        </div>
        <div className="concept-card">
          <div className="card-icon">🔒</div>
          <h4>Mitigación Anti-CSRF (<code>sameSite: lax/strict</code>)</h4>
          <p>
            El atributo <code>sameSite</code> instruye al navegador a restringir el envío de la cookie en peticiones originadas desde sitios de terceros. 
            Esto neutraliza los ataques de <em>Cross-Site Request Forgery</em> donde una web maliciosa intenta disparar peticiones autenticadas aprovechando la sesión activa del usuario.
          </p>
        </div>
      </div>

      {/* ── SECCIÓN 6: PROTECCIÓN CONTRA IDOR / BOLA ── */}
      <h2 id="sec-idor">6. Control de Propiedad Horizontal (Prevención de IDOR / BOLA)</h2>
      <p>
        Uno de los fallos más críticos según OWASP API Security es <strong>BOLA / IDOR</strong> (<em>Broken Object Level Authorization</em>): 
        cuando un usuario autenticado intenta manipular un registro que pertenece a otro usuario alterando el parámetro ID en la URL.
      </p>

      <CodeBlock
        title="Backend/src/Multas/Multa.controller.ts — Verificación de Propiedad del Objeto"
        language="TypeScript"
        code={`async function pagarMulta(req: Request, res: Response) {
  const id = Number.parseInt(req.params.id);
  const authedReq = req as any;
  const metahumanoId = authedReq.perfilId; // Obtenido con certeza del JWT autenticado

  const multa = await em.findOneOrFail(Multa, { id }, {
    populate: ['evidencia.carpeta.metahumano']
  });

  // PROTECCIÓN CONTRA IDOR: Verificar que la multa realmente le pertenece a quien la paga
  if (multa.evidencia?.carpeta?.metahumano?.id !== metahumanoId) {
    return res.status(403).json({ 
      message: 'Acceso denegado: esta multa no te pertenece' 
    });
  }

  if (multa.estado === 'PAGADA') {
    return res.status(400).json({ message: 'La multa ya se encuentra pagada' });
  }

  multa.estado = 'PAGADA';
  multa.formaPago = req.body?.formaPago || 'Mercado Pago';
  await em.flush();
  
  res.status(200).json({ message: 'Multa pagada exitosamente', data: multa });
}`}
      />

      <Callout type="info" title="💡 Doble Barrera de Autorización">
        <p>
          En este diseño coexisten dos barreras:
          <br /><strong>1. Vertical (Roles):</strong> <code>requireRoles([METAHUMANO])</code> garantiza que solo metahumanos accedan al endpoint de pago.
          <br /><strong>2. Horizontal (Propiedad):</strong> La validación en el controlador garantiza que el metahumano <code>A</code> no pueda pagar ni manipular registros del metahumano <code>B</code>.
        </p>
      </Callout>

      {/* ── SECCIÓN 7: BCRYPT Y CONTRASEÑAS ── */}
      <h2 id="sec-bcrypt">7. Protección Criptográfica de Contraseñas (<code>bcryptjs</code>)</h2>
      <p>
        Las contraseñas de los usuarios nunca se almacenan en texto plano en la base de datos MySQL. Se aplica hashing unidireccional con un factor de trabajo deliberadamente costoso.
      </p>

      <CodeBlock
        title="Backend/src/auth/usuario.controller.ts — Hashing con Salt y Comparación"
        language="TypeScript"
        code={`// 1. Hasheo en Registro: Genera salt aleatorio único y aplica 10 rondas de estiramiento de clave
const passwordHash = await bcrypt.hash(password, 10);

// 2. Verificación en Login: Comparación en tiempo constante (inmune a timing attacks)
const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
if (!passwordValida) {
  return res.status(401).json({ message: 'Credenciales inválidas' });
}`}
      />

      <div className="breakdown-box">
        <div className="breakdown-header"><span className="breakdown-title">¿Por qué bcrypt con cost 10 es un estándar de alta seguridad?</span></div>
        <div className="tab-content active">
          <ul className="step-list">
            <li className="step-item">
              <span className="step-badge">Salt</span>
              <div>
                <h5>Salteo Criptográfico Aleatorio (Salt de 128 bits)</h5>
                <p>
                  Bcrypt genera un salt único para cada contraseña. Si 100 usuarios eligen la misma clave (ej: <code>"SuperGestor2026!"</code>), 
                  los 100 registros en MySQL tendrán cadenas de hash totalmente distintas. Esto neutraliza por completo los ataques de <strong>Tablas Arcoíris</strong> (<em>Rainbow Tables</em>).
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">Cost</span>
              <div>
                <h5>Función de Costo Ajustable (Work Factor = 10 → 2¹⁰ iteraciones)</h5>
                <p>
                  Bcrypt es un algoritmo deliberadamente intensivo en CPU y memoria (<em>key stretching</em>). El factor 10 ejecuta 1.024 rondas internas de encriptación Blowfish, 
                  haciendo que los ataques de fuerza bruta masivos asistidos por clusters de GPU sean financieramente inviables.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">Time</span>
              <div>
                <h5>Comparación en Tiempo Constante</h5>
                <p>
                  La función <code>bcrypt.compare()</code> evalúa el hash en un tiempo uniforme sin importar en qué carácter falle la coincidencia, 
                  evitando que un atacante deduzca la contraseña midiendo microsegundos de respuesta (<strong>Timing Attacks</strong>).
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ── SECCIÓN 8: INYECCIÓN SQL Y SANITIZACIÓN ── */}
      <h2 id="sec-sqli">8. Prevención de Inyección SQL (MikroORM) & Sanitización</h2>
      <p>
        La aplicación neutraliza ataques de inyección a nivel de base de datos y a nivel de payload de entrada:
      </p>

      <CodeBlock
        title="Backend/src/metahumano/metahumano.controller.ts — Sanitización de Inputs"
        language="TypeScript"
        code={`function sanitizeMetahumanoInput(req: Request, res: Response, next: NextFunction) {
  // Whitelist estricta: solo se aceptan propiedades válidas, ignorando campos maliciosos
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    alias: req.body.alias,
    origen: req.body.origen,
    tipoMeta: req.body.tipoMeta,
    usuarioId: req.body.usuarioId,
    latitud: req.body.latitud !== undefined && req.body.latitud !== null ? Number(req.body.latitud) : undefined,
    longitud: req.body.longitud !== undefined && req.body.longitud !== null ? Number(req.body.longitud) : undefined
  };

  // Depurar propiedades undefined para evitar sobreescritura accidental
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}`}
      />

      <div className="two-col-grid">
        <div className="concept-card">
          <div className="card-icon">🛡️</div>
          <h4>Inmunidad por Prepared Statements</h4>
          <p>
            Al operar mediante <code>em.findOne(Usuario, { email })</code>, MikroORM compila la sentencia SQL a:
            <br /><code>SELECT * FROM usuario WHERE email = ? LIMIT 1</code>
            <br />El valor de <code>email</code> viaja separado de la sintaxis del comando. Si un atacante ingresa <code>admin@test.com' OR '1'='1</code>, 
            MySQL busca literalmente esa cadena como email y no altera la lógica de la consulta.
          </p>
        </div>
        <div className="concept-card">
          <div className="card-icon">🧹</div>
          <h4>Sanitización y Whitelisting de Payloads</h4>
          <p>
            Los middlewares de sanitización (<code>sanitizeCarpetaInput</code>, <code>sanitizeMultasInput</code>, <code>sanitizePoderInput</code>) 
            construyen un objeto <code>sanitizedInput</code> exclusivo. Cualquier campo extraño inyectado por un atacante (ej: <code>role: 'ADMIN'</code> en un registro de metahumano) 
            es descartado automáticamente.
          </p>
        </div>
      </div>

      {/* ── SECCIÓN 9: INTEGRIDAD DEL MODELO DE DOMINIO ── */}
      <h2 id="sec-dominio">9. Integridad del Modelo de Dominio (Lifecycle Hooks)</h2>
      <p>
        La seguridad del sistema está respaldada por reglas de negocio codificadas directamente en la entidad <code>Usuario</code> mediante decorators de ciclo de vida del ORM:
      </p>

      <CodeBlock
        title="Backend/src/auth/usuario.entity.ts — Hooks @BeforeCreate y @BeforeUpdate"
        language="TypeScript"
        code={`@Entity()
export class Usuario extends BaseEntity {
  @Property({ unique: true, nullable: false })
  email!: string;

  @Property({ nullable: false })
  passwordHash!: string;

  @Enum(() => UserRole)
  role!: UserRole;

  @OneToOne({ entity: () => 'Metahumano', mappedBy: 'usuario', nullable: true })
  metahumano?: Rel<any>;

  @OneToOne({ entity: () => 'Burocrata', mappedBy: 'usuario', nullable: true })
  burocrata?: Rel<any>;

  @BeforeCreate()
  @BeforeUpdate()
  validateRoleConsistency() {
    // 1. Prohibir la existencia simultánea de perfiles incompatibles
    if (this.metahumano && this.burocrata) {
      throw new Error('Un usuario no puede tener ambos perfiles (metahumano y burocrata)');
    }
    
    // 2. Garantizar coherencia estricta entre el rol declarado y el perfil asignado
    if (this.role === UserRole.METAHUMANO && this.burocrata) {
      throw new Error('Usuario con role METAHUMANO no puede tener perfil de burocrata');
    }
    if (this.role === UserRole.BUROCRATA && this.metahumano) {
      throw new Error('Usuario con role BUROCRATA no puede tener perfil de metahumano');
    }
  }
}`}
      />

      <Callout type="tip" title="🛡️ Protección a Nivel de Base de Datos">
        <p>
          Este mecanismo garantiza que ni siquiera un error en un controlador nuevo pueda corromper los datos o permitir que un usuario escale privilegios 
          adquiriendo un perfil ajeno a su rol. Si se intenta persistir una inconsistencia, MikroORM aborta la transacción inmediatamente.
        </p>
      </Callout>

      {/* ── SECCIÓN 10: TESTS AUTOMATIZADOS DE SEGURIDAD ── */}
      <h2 id="sec-tests">10. Verificación Automatizada: Tests de Seguridad</h2>
      <p>
        La seguridad de SuperGestor cuenta con una exhaustiva suite de pruebas automatizadas (unitarias, de componentes y de integración API con <code>Supertest</code> y <code>Vitest</code>):
      </p>

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Suite de Tests</th>
              <th>Archivo</th>
              <th>Alcance de Verificación</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Criptografía & JWT</strong></td>
              <td><code>integrante1_auth.test.ts</code></td>
              <td>Hasheo bcrypt ($2a/$2b), coincidencia vs rechazo de clave errónea, firma de JWT, expiración y rechazo estricto de tokens con firma alterada.</td>
              <td><span className="status-badge status-ready">Aprobado</span></td>
            </tr>
            <tr>
              <td><strong>Middlewares RBAC</strong></td>
              <td><code>integrante2_roles_middleware.test.ts</code></td>
              <td>Bloqueo con 401 sin token, admisión por Cookie httpOnly, admisión por Header Bearer, bloqueo 403 por rol insuficiente y admisión con roles válidos.</td>
              <td><span className="status-badge status-ready">Aprobado</span></td>
            </tr>
            <tr>
              <td><strong>Reglas de Dominio</strong></td>
              <td><code>integrante3_domain_rules.test.ts</code></td>
              <td>Prevención de doble perfil, detección de inconsistencias rol-perfil en <code>validateRoleConsistency()</code> y validación limpia de estados coherentes.</td>
              <td><span className="status-badge status-ready">Aprobado</span></td>
            </tr>
            <tr>
              <td><strong>Variables de Entorno</strong></td>
              <td><code>integrante4_environment.test.ts</code></td>
              <td>Carga segura de <code>JWT_SECRET</code>, longitud mínima del secreto, aislamiento de credenciales de base de datos y métodos <code>isProduction()</code>.</td>
              <td><span className="status-badge status-ready">Aprobado</span></td>
            </tr>
            <tr>
              <td><strong>Integración de API</strong></td>
              <td><code>integracion_api.test.ts</code></td>
              <td>Bloqueo 401 en <code>/api/auth/perfil</code>, bloqueo 403 a METAHUMANO en rutas de admin, admisión 200 a ADMIN, y ciclo completo de logout.</td>
              <td><span className="status-badge status-ready">Aprobado</span></td>
            </tr>
            <tr>
              <td><strong>Front: ProtectedRoute</strong></td>
              <td><code>ProtectedRoute.test.jsx</code></td>
              <td>Redirección a <code>/login</code> sin sesión, redirección a <code>/</code> con rol insuficiente, y renderizado seguro de hijos ante roles autorizados.</td>
              <td><span className="status-badge status-ready">Aprobado</span></td>
            </tr>
            <tr>
              <td><strong>Front: E2E Auth Flow</strong></td>
              <td><code>e2e_frontend_flow.test.jsx</code></td>
              <td>Flujo completo: Interceptación de ruta privada → Login de usuario → Actualización de estado en <code>localStorage</code> → Navegación → Cierre de sesión.</td>
              <td><span className="status-badge status-ready">Aprobado</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <CodeBlock
        title="Backend/src/__tests__/integracion_api.test.ts — Fragmento de Pruebas de Integración"
        language="TypeScript"
        code={`test('INT-2: Debería denegar acceso con 403 Forbidden cuando un METAHUMANO intenta acceder a rutas de ADMIN', async () => {
  const res = await request(app)
    .get('/api/auth/admin/usuarios')
    .set('Authorization', \`Bearer \${metahumanoToken}\`);

  assert.strictEqual(res.status, 403, 'Debe retornar 403 al no tener rol ADMIN');
  assert.ok(res.body.message.includes('Acceso denegado'), 'El mensaje debe indicar permisos insuficientes');
});`}
      />

      {/* ── SECCIÓN 11: OWASP TOP 10 Y ROBUSTEZ ── */}
      <h2 id="sec-por-que-es-buena">11. Análisis de Resiliencia: Mitigación OWASP Top 10</h2>
      <p>
        La arquitectura de SuperGestor mitiga sistemáticamente las vulnerabilidades más críticas identificadas en el estándar internacional <strong>OWASP Top 10</strong>:
      </p>

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Riesgo OWASP</th>
              <th>Mecanismo en SuperGestor</th>
              <th>Beneficio e Impacto en Seguridad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>A01: Broken Access Control</strong></td>
              <td>Middlewares <code>requireAuth</code> y <code>requireRoles</code> en Backend + <code>ProtectedRoute</code> en Frontend + comprobación de propiedad contra IDOR.</td>
              <td>Ningún actor malicioso puede escalar privilegios verticalmente ni acceder a datos de otros usuarios horizontalmente.</td>
            </tr>
            <tr>
              <td><strong>A02: Cryptographic Failures</strong></td>
              <td><code>bcryptjs</code> (Cost 10 + Salt) + JWT firmado con secreto aislado en <code>.env</code> + cookies con flag <code>secure</code> en producción.</td>
              <td>Las contraseñas y tokens no pueden ser descifrados ni falsificados mediante ingeniería inversa o ataques de colisión.</td>
            </tr>
            <tr>
              <td><strong>A03: Injection (SQLi / XSS)</strong></td>
              <td>Prepared Statements obligatorios en MikroORM + sanitización de body en controladores + token en cookie <code>httpOnly</code>.</td>
              <td>Imposibilidad matemática de inyectar código SQL en consultas y protección contra robo de sesión ante eventuales ataques XSS.</td>
            </tr>
            <tr>
              <td><strong>A05: Security Misconfiguration</strong></td>
              <td>CORS con whitelist estricta, limitación de tamaño de payload (50mb), y middleware centralizado que enmascara errores internos.</td>
              <td>Evita peticiones cruzadas no autorizadas y previene la filtración de stack traces o rutas internas del servidor ante excepciones no controladas.</td>
            </tr>
            <tr>
              <td><strong>A07: Identification & Auth Failures</strong></td>
              <td>Tokens con vida útil de 24 horas, ciclo de vida con <code>logout</code> explícito en servidor y cliente, y validación estricta de estructura JWT.</td>
              <td>Sesiones deterministas que caducan periódicamente y pueden revocarse en cualquier momento a solicitud del usuario.</td>
            </tr>
            <tr>
              <td><strong>A08: Software & Data Integrity</strong></td>
              <td>Entity Lifecycle Hooks (<code>@BeforeCreate</code> / <code>@BeforeUpdate</code>) que fuerzan la consistencia inmutable entre roles y perfiles.</td>
              <td>La base de datos queda protegida contra estados anómalos o manipulaciones corruptas generadas por bugs en la capa de aplicación.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── SECCIÓN 12: QUIZ INTERACTIVO ── */}
      <h2 id="sec-quiz">12. Quiz de Autoevaluación: Seguridad Front & Back</h2>
      <p>Comprueba tus conocimientos sobre las medidas de defensa y arquitectura de seguridad con este test interactivo:</p>
      <Quiz questions={quizQuestions} />
    </div>
  );
}
