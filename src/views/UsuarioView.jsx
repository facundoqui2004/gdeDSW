import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import Callout from '../components/Callout';
import Quiz from '../components/Quiz';

export default function UsuarioView() {
  const [controllerTab, setControllerTab] = useState('registro');

  const quizQuestions = [
    {
      question: '¿Por qué en registrarMetahumano se llama a persistAndFlush([usuario, metahumano]) con un array?',
      options: [
        'Porque MikroORM solo acepta arrays como argumento.',
        'Para que ambas entidades se guarden en una sola transacción atómica: o se insertan las dos, o ninguna.',
        'Porque es más rápido que dos operaciones separadas.',
        'Porque así se evita crear la tabla en la base de datos.'
      ],
      correct: 1,
      explanation: 'La atomicidad garantiza consistencia: nunca puede quedar un Usuario sin su Metahumano asociado ni viceversa. Es como un contrato donde deben firmar ambas partes a la vez.'
    },
    {
      question: 'En requireRoles, ¿qué diferencia hay entre el rol de sistema y el subtipo de negocio?',
      options: [
        'No hay diferencia, son exactamente lo mismo.',
        'El rol de sistema (METAHUMANO, ADMIN) viene en el JWT sin consultar la BD. El subtipo (HEROE/VILLANO) requiere una consulta adicional a la base de datos.',
        'El subtipo viene en el JWT y el rol de sistema se consulta en la BD.',
        'Ninguno consulta la base de datos, ambos vienen en la cookie user_info.'
      ],
      correct: 1,
      explanation: 'requireRoles primero verifica el rol del JWT (sin BD). Si es METAHUMANO y se necesita verificar HEROE o VILLANO, hace una consulta a la BD para leer tipoMeta.'
    },
    {
      question: '¿Por qué la contraseña nunca se guarda en texto plano?',
      options: [
        'Porque la base de datos no acepta strings largos.',
        'Porque Express la encripta automáticamente al parsear el JSON.',
        'Porque bcrypt genera un hash irreversible con salt. Si la base se filtra, el atacante no puede obtener la contraseña original.',
        'Porque el protocolo HTTP no permite texto plano.'
      ],
      correct: 2,
      explanation: 'bcrypt.hash(password, 10) aplica hashing con 10 rondas de salt. No se puede revertir: solo verificar comparando con bcrypt.compare().'
    },
    {
      question: '¿Qué problema resuelve el chequeo manual de email único en el service si ya existe unique: true en la entidad?',
      options: [
        'Ninguno, es código redundante e inútil.',
        'Permite capturar el caso y responder un error 400 legible en lugar de una excepción cruda de constraint de SQL.',
        'Evita que la base de datos se caiga por sobrecarga.',
        'Fuerza la creación de un nuevo índice en tiempo de ejecución.'
      ],
      correct: 1,
      explanation: 'El unique: true lanzaría una excepción de MikroORM/SQL difícil de manejar. El findOne previo permite controlar el error y devolver un mensaje 400 claro y amigable al cliente.'
    },
    {
      question: '¿Qué hace em.remove(metahumano) seguido de em.flush() en convertirMetahumanoABurocrata?',
      options: [
        'Borra el metahumano de la base de datos inmediatamente al llamar a remove().',
        'Marca el metahumano para eliminación en la Unit of Work; el DELETE SQL real ocurre en flush() junto con el UPDATE y el INSERT en una sola transacción.',
        'Cancela todos los cambios pendientes en memoria y restablece el estado anterior.',
        'Desconecta al usuario de la sesión activa.'
      ],
      correct: 1,
      explanation: 'MikroORM acumula cambios en una Unit of Work. Al llamar flush() todos viajan a la BD en una sola transacción coordinada: DELETE + UPDATE + INSERT.'
    },
    {
      question: '¿Por qué requireAuth es sincrónica pero requireRoles es una función async?',
      options: [
        'Por preferencia de estilo de código, no hay razón técnica.',
        'requireAuth solo verifica el JWT en memoria con jwt.verify() (síncrono). requireRoles puede necesitar consultar la BD para obtener tipoMeta (I/O asíncrono).',
        'requireAuth no necesita next() y requireRoles sí.',
        'Porque Express 4 no soporta funciones asíncronas en middlewares normales.'
      ],
      correct: 1,
      explanation: 'jwt.verify() es síncrono: decodifica la firma en memoria sin I/O. em.findOne() es una query a la BD (I/O async), por eso requireRoles retorna una función async/await.'
    },
    {
      question: '¿Qué valida el hook @BeforeCreate() / @BeforeUpdate() de la entidad Usuario?',
      options: [
        'Hashea la contraseña antes de guardarla.',
        'Verifica que el usuario no tenga ambos perfiles a la vez y que el role coincida con el perfil asignado.',
        'Genera el JWT y las cookies automáticamente.',
        'Verifica que el email tenga formato válido con regex.'
      ],
      correct: 1,
      explanation: 'El hook corre antes de cada INSERT o UPDATE. Si el usuario tuviera metahumano Y burocrata, o si el role dijera METAHUMANO pero tuviera un burocrata, lanza un Error que cancela la operación.'
    }
  ];

  return (
    <div className="doc-section">
      <h1>Sistema de Usuarios — Autenticación & Autorización</h1>
      <p className="page-lead">
        Guía integral del sistema de usuarios y autenticación de <strong>SuperGestor</strong>. 
        Analizamos en profundidad las cinco capas: la <strong>Entidad</strong> (modelo de datos y validaciones), 
        las <strong>Rutas</strong> (endpoints de la API), el <strong>Controller</strong> (manejo HTTP y respuestas), 
        el <strong>Service</strong> (reglas de negocio y transacciones), y el <strong>Middleware de Auth</strong> (protección con JWT y roles).
      </p>

      <Callout type="tip" title="📂 Archivos analizados en esta sección">
        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li><code>Backend/src/auth/usuario.entity.ts</code> — Modelo de datos con decoradores MikroORM</li>
          <li><code>Backend/src/auth/usuario.routes.ts</code> — Definición de endpoints y middlewares</li>
          <li><code>Backend/src/auth/usuario.controller.ts</code> — Lógica de presentación y peticiones HTTP</li>
          <li><code>Backend/src/auth/usuario.service.ts</code> — Reglas de negocio y operaciones de persistencia</li>
          <li><code>Backend/src/auth/auth.middleware.ts</code> — Middlewares de verificación JWT y control de roles</li>
        </ul>
      </Callout>

      <h2 id="usr-arquitectura">1. Arquitectura en Capas</h2>
      <p>
        Cada petición que interactúa con la autenticación o gestión de usuarios atraviesa una cadena de componentes bien estructurados:
      </p>

      <CodeBlock
        title="Flujo de una petición al sistema de usuarios"
        language="text"
        code={`Cliente (React Frontend / Postman / Mobile)
        │
        ▼
usuario.routes.ts      → Define el método HTTP y la URL correspondiente
        │
        ▼
auth.middleware.ts     → Verifica el token JWT y los permisos de rol
        │
        ▼
usuario.controller.ts  → Valida parámetros de entrada, extrae req.body y maneja res
        │
        ▼
usuario.service.ts     → Ejecuta reglas de negocio complejas y transacciones
        │
        ▼
usuario.entity.ts      → Mapea propiedades a la base de datos y ejecuta hooks
        │
        ▼
Base de datos (MySQL vía MikroORM EntityManager)`}
      />

      <Callout type="info" title="🏥 Analogía del Hospital">
        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li><strong>Ruta:</strong> Recepción que te indica a qué consultorio dirigirte según tu necesidad.</li>
          <li><strong>Middleware:</strong> Seguridad en la puerta que comprueba tu credencial (JWT) antes de ingresar.</li>
          <li><strong>Controller:</strong> Asistente que toma tu turno, anota tus datos y te entrega el resultado.</li>
          <li><strong>Service:</strong> El médico especialista que ejecuta el procedimiento clínico (lógica de negocio).</li>
          <li><strong>Entity:</strong> El historial clínico y su estructura estandarizada de datos.</li>
        </ul>
      </Callout>

      <h2 id="usr-entity">2. La Entidad Usuario (<code>usuario.entity.ts</code>)</h2>
      <p>
        Define la estructura de la tabla <code>usuario</code> en la base de datos mediante decoradores de MikroORM.
      </p>

      <h3>2.1 El Enum <code>UserRole</code></h3>
      <CodeBlock
        title="usuario.entity.ts — Enum de roles del sistema"
        language="TypeScript"
        code={`export enum UserRole {
  METAHUMANO = 'METAHUMANO',
  BUROCRATA  = 'BUROCRATA',
  ADMIN      = 'ADMIN'
}`}
      />
      
      <div className="breakdown-box">
        <div className="breakdown-header"><span className="breakdown-title">¿Por qué usar un enum en lugar de strings libres?</span></div>
        <div className="tab-content active">
          <ul className="step-list">
            <li className="step-item">
              <span className="step-badge">✓</span>
              <div>
                <h5>Tipado estricto en tiempo de compilación</h5>
                <p>Evita errores tipográficos comunes (como escribir <code>"metahumano"</code> en minúscula o <code>"admin"</code>) que provocarían fallos silenciosos en las comprobaciones de seguridad.</p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">✓</span>
              <div>
                <h5>Persistencia clara en Base de Datos</h5>
                <p>El decorador <code>@Enum(() =&gt; UserRole)</code> almacena el string correspondiente en la columna de MySQL, facilitando la legibilidad en consultas SQL directas.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <h3>2.2 Propiedades de la Clase <code>Usuario</code></h3>
      <CodeBlock
        title="usuario.entity.ts — Definición de campos"
        language="TypeScript"
        code={`@Entity()
export class Usuario extends BaseEntity {
  @Property({ unique: true, nullable: false })
  email!: string

  @Property({ nullable: false })
  telefono!: string

  @Property({ nullable: false })
  passwordHash!: string        // Hash bcrypt irreversible

  @Enum(() => UserRole)
  role!: UserRole

  @Property({ default: false })
  verificado: boolean = false

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date()

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}`}
      />

      <div className="breakdown-box">
        <div className="breakdown-header"><span className="breakdown-title">Detalles de las propiedades</span></div>
        <div className="tab-content active">
          <ul className="step-list">
            <li className="step-item">
              <span className="step-badge">1</span>
              <div>
                <h5><code>email</code> (unique: true)</h5>
                <p>Crea un índice único en MySQL para garantizar a nivel de motor que no existan correos duplicados. El signo de admiración <code>!</code> indica asignación obligatoria en TypeScript.</p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">2</span>
              <div>
                <h5><code>passwordHash</code></h5>
                <p>Almacena exclusivamente el hash generado con <code>bcrypt.hash()</code>. Nunca se guarda ni procesa la contraseña en texto plano en la base de datos.</p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">3</span>
              <div>
                <h5><code>createdAt</code> y <code>updatedAt</code> con hooks automáticos</h5>
                <p><code>onCreate</code> se invoca en el INSERT inicial, mientras que <code>onUpdate</code> se dispara en cada UPDATE, asegurando marcas temporales consistentes.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <h3>2.3 Relaciones <code>@OneToOne</code> y Composición</h3>
      <CodeBlock
        title="usuario.entity.ts — Relaciones OneToOne con perfiles específicos"
        language="TypeScript"
        code={`@OneToOne({ entity: () => 'Metahumano', mappedBy: 'usuario', nullable: true })
metahumano?: Rel<any>

@OneToOne({ entity: () => 'Burocrata', mappedBy: 'usuario', nullable: true })
burocrata?: Rel<any>`}
      />

      <Callout type="info" title="🧩 ¿Por qué Composición en lugar de Herencia directa?">
        <p>
          Si usáramos herencia de clases tradicional (<code>Metahumano extends Usuario</code>), un usuario quedaría atado para siempre a su tabla y no podría transferir su cuenta ni cambiar de perfil en tiempo de ejecución.
        </p>
        <p>
          Con <strong>composición</strong>, <code>Usuario</code> funciona como la cuenta de acceso y credenciales del sistema, pudiendo vincularse opcionalmente a una ficha de <code>Metahumano</code> o de <code>Burocrata</code>.
        </p>
      </Callout>

      <h3>2.4 Hooks de Validación de Integridad (<code>@BeforeCreate</code> / <code>@BeforeUpdate</code>)</h3>
      <CodeBlock
        title="usuario.entity.ts — Validación de consistencia de roles"
        language="TypeScript"
        code={`@BeforeCreate()
@BeforeUpdate()
validateRoleConsistency() {
  // Regla 1: Un usuario no puede poseer ambos perfiles al mismo tiempo
  if (this.metahumano && this.burocrata) {
    throw new Error('Un usuario no puede tener ambos perfiles')
  }

  // Regla 2: El role del usuario debe coincidir con el perfil asignado
  if (this.role === UserRole.METAHUMANO && this.burocrata) {
    throw new Error('Usuario con role METAHUMANO no puede tener perfil de burocrata')
  }
  if (this.role === UserRole.BUROCRATA && this.metahumano) {
    throw new Error('Usuario con role BUROCRATA no puede tener perfil de metahumano')
  }
}`}
      />

      <Callout type="warning" title="⚠️ Alcance del ciclo de vida del ORM">
        <p>
          Estos hooks se ejecutan en la <strong>capa de Node.js</strong> antes de que MikroORM envíe la consulta SQL. Si se realiza una inserción directa con comandos SQL en la consola de MySQL sin pasar por el ORM, estos hooks no se dispararán.
        </p>
      </Callout>

      <h2 id="usr-routes">3. Las Rutas de Usuario (<code>usuario.routes.ts</code>)</h2>
      <CodeBlock
        title="usuario.routes.ts — Definición completa de rutas"
        language="TypeScript"
        code={`const router = express.Router()

// ── Rutas Públicas (Sin autenticación previa) ────────────────────────
router.post('/register/basic',      crearUsuarioBasico)
router.post('/register/metahumano', registrarMetahumano)
router.post('/register/burocrata',  registrarBurocrata)
router.post('/register/admin',      registrarAdmin)
router.post('/login',               login)
router.post('/logout',              logout)

// ── Rutas Protegidas (Requieren JWT válido) ───────────────────────────
router.get ('/perfil',   requireAuth, obtenerPerfil)
router.put ('/contacto', requireAuth, actualizarContacto)

// ── Rutas Administrativas (Requieren JWT con rol ADMIN) ───────────────
router.get   ('/admin/usuarios',     requireAuth, requireRoles(['ADMIN']), listarUsuarios)
router.delete('/admin/usuarios/:id', requireAuth, requireRoles(['ADMIN']), eliminarUsuario)`}
      />

      <h3>3.1 Mapa de Rutas y Niveles de Protección</h3>
      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Acceso</th>
              <th>Método</th>
              <th>Endpoint</th>
              <th>Middlewares Requeridos</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="status-badge status-ready">Público</span></td>
              <td><code>POST</code></td>
              <td><code>/api/usuarios/register/metahumano</code></td>
              <td>Ninguno</td>
              <td>Crea cuenta de usuario y perfil de metahumano atómicamente.</td>
            </tr>
            <tr>
              <td><span className="status-badge status-ready">Público</span></td>
              <td><code>POST</code></td>
              <td><code>/api/usuarios/login</code></td>
              <td>Ninguno</td>
              <td>Verifica contraseña con bcrypt y entrega cookies con JWT.</td>
            </tr>
            <tr>
              <td><span className="status-badge status-soon">Protegido</span></td>
              <td><code>GET</code></td>
              <td><code>/api/usuarios/perfil</code></td>
              <td><code>requireAuth</code></td>
              <td>Devuelve los datos del usuario autenticado actual.</td>
            </tr>
            <tr>
              <td><span className="status-badge status-soon">Protegido</span></td>
              <td><code>PUT</code></td>
              <td><code>/api/usuarios/contacto</code></td>
              <td><code>requireAuth</code></td>
              <td>Permite modificar email y teléfono del usuario activo.</td>
            </tr>
            <tr>
              <td><span className="status-badge" style={{ background: 'var(--warn-bg)', color: 'var(--warn-text)', border: '1px solid var(--warn-border)' }}>Admin</span></td>
              <td><code>GET</code></td>
              <td><code>/api/usuarios/admin/usuarios</code></td>
              <td><code>requireAuth, requireRoles(['ADMIN'])</code></td>
              <td>Lista todos los usuarios registrados en el sistema.</td>
            </tr>
            <tr>
              <td><span className="status-badge" style={{ background: 'var(--warn-bg)', color: 'var(--warn-text)', border: '1px solid var(--warn-border)' }}>Admin</span></td>
              <td><code>DELETE</code></td>
              <td><code>/api/usuarios/admin/usuarios/:id</code></td>
              <td><code>requireAuth, requireRoles(['ADMIN'])</code></td>
              <td>Elimina un usuario y todas sus relaciones en cascada.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="usr-controller">4. El Controlador (<code>usuario.controller.ts</code>)</h2>
      <p>
        El controlador recibe el objeto <code>req</code> de Express, valida la presencia de parámetros, invoca al servicio o al <code>EntityManager</code>, y genera la respuesta HTTP adecuada.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
        {[
          { id: 'registro', label: '1. Registro de Metahumano' },
          { id: 'login', label: '2. Login & JWT' },
          { id: 'perfil', label: '3. Obtener Perfil' },
          { id: 'contacto', label: '4. Actualizar Contacto' },
          { id: 'eliminar', label: '5. Eliminar Usuario' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setControllerTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: controllerTab === tab.id ? 'var(--accent-color)' : 'var(--bg-secondary)',
              color: controllerTab === tab.id ? '#fff' : 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: controllerTab === tab.id ? 600 : 400,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {controllerTab === 'registro' && (
        <div>
          <h3>4.1 Registro Compuesto — <code>registrarMetahumano</code></h3>
          <CodeBlock
            title="usuario.controller.ts — Registro atómico"
            language="TypeScript"
            code={`export async function registrarMetahumano(req: Request, res: Response) {
  const { email, telefono, password, nombre, alias, origen } = req.body

  // 1. Validación de campos obligatorios
  if (!email || !telefono || !password || !nombre || !alias || !origen) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' })
  }

  // 2. Comprobar que no exista otro usuario con el mismo email
  const existeUsuario = await em.findOne(Usuario, { email })
  if (existeUsuario) {
    return res.status(400).json({ message: 'Ya existe un usuario con este email' })
  }

  // 3. Generar hash irreversible de la contraseña
  const passwordHash = await bcrypt.hash(password, 10)

  // 4. Instanciar entidades y enlazar la relación bidireccional
  const usuario = new Usuario()
  usuario.email = email
  usuario.telefono = telefono
  usuario.passwordHash = passwordHash
  usuario.role = UserRole.METAHUMANO

  const metahumano = new Metahumano()
  metahumano.nombre = nombre
  metahumano.alias = alias
  metahumano.origen = origen
  metahumano.usuario = usuario
  usuario.metahumano = metahumano

  // 5. Persistir ambas entidades en una única transacción atómica
  await em.persistAndFlush([usuario, metahumano])

  // 6. Emitir token JWT
  const token = jwt.sign(
    {
      usuarioId: usuario.id,
      email: usuario.email,
      role: usuario.role,
      perfilId: metahumano.id,
      perfil: 'metahumano',
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  // 7. Configurar cookies seguras
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  })

  res.status(201).json({
    message: 'Metahumano registrado exitosamente',
    token,
    usuario: { id: usuario.id, email: usuario.email, role: usuario.role },
  })
}`}
          />
        </div>
      )}

      {controllerTab === 'login' && (
        <div>
          <h3>4.2 Inicio de Sesión — <code>login</code></h3>
          <CodeBlock
            title="usuario.controller.ts — Autenticación con bcrypt y generación de JWT"
            language="TypeScript"
            code={`export async function login(req: Request, res: Response) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña requeridos' })
  }

  // 1. Cargar el usuario con sus relaciones de perfil mediante populate
  const usuario = await em.findOne(Usuario, { email }, {
    populate: ['metahumano', 'burocrata']
  })

  // 2. Mismo mensaje de error para evitar ataques de enumeración de usuarios
  if (!usuario) {
    return res.status(401).json({ message: 'Credenciales inválidas' })
  }

  // 3. Comparación segura del hash
  const passwordValida = await bcrypt.compare(password, usuario.passwordHash)
  if (!passwordValida) {
    return res.status(401).json({ message: 'Credenciales inválidas' })
  }

  // 4. Identificar el perfil activo para el payload
  let perfil: string
  let perfilId: number | undefined

  if (usuario.role === UserRole.ADMIN) {
    perfil = 'admin'
    perfilId = usuario.id
  } else if (usuario.metahumano) {
    perfil = 'metahumano'
    perfilId = usuario.metahumano.id
  } else if (usuario.burocrata) {
    perfil = 'burocrata'
    perfilId = usuario.burocrata.id
  } else {
    return res.status(400).json({ message: 'Usuario sin perfil válido asociado' })
  }

  // 5. Generación del JWT
  const token = jwt.sign(
    {
      usuarioId: usuario.id,
      email: usuario.email,
      role: usuario.role,
      perfilId,
      perfil,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  // 6. Cookie httpOnly (protección XSS)
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  })

  res.json({ message: 'Login exitoso', token })
}`}
          />
        </div>
      )}

      {controllerTab === 'perfil' && (
        <div>
          <h3>4.3 Consulta de Datos Propios — <code>obtenerPerfil</code></h3>
          <CodeBlock
            title="usuario.controller.ts — Extracción del id inyectado por el middleware"
            language="TypeScript"
            code={`export async function obtenerPerfil(req: Request, res: Response) {
  // El ID proviene del token decodificado por requireAuth en req.usuarioId
  const usuarioId = (req as any).usuarioId

  const usuario = await em.findOne(Usuario, { id: usuarioId }, {
    populate: ['metahumano', 'burocrata']
  })

  if (!usuario) {
    return res.status(404).json({ message: 'Usuario no encontrado' })
  }

  const response: any = {
    id: usuario.id,
    email: usuario.email,
    telefono: usuario.telefono,
    role: usuario.role,
    verificado: usuario.verificado,
  }

  if (usuario.metahumano) {
    response.perfil = 'METAHUMANO'
    response.metahumano = {
      id: usuario.metahumano.id,
      nombre: usuario.metahumano.nombre,
      alias: usuario.metahumano.alias,
      tipoMeta: usuario.metahumano.tipoMeta,
    }
  } else if (usuario.burocrata) {
    response.perfil = 'BUROCRATA'
    response.burocrata = {
      id: usuario.burocrata.id,
      nombre: usuario.burocrata.nombre,
      departamento: usuario.burocrata.departamento,
    }
  }

  return res.json({ message: 'Perfil obtenido correctamente', data: response })
}`}
          />
        </div>
      )}

      {controllerTab === 'contacto' && (
        <div>
          <h3>4.4 Modificación Parcial — <code>actualizarContacto</code></h3>
          <CodeBlock
            title="usuario.controller.ts — Detección de cambios y flush"
            language="TypeScript"
            code={`export async function actualizarContacto(req: Request, res: Response) {
  const usuarioId = (req as any).usuarioId
  const { email, telefono } = req.body

  const usuario = await em.findOne(Usuario, { id: usuarioId })
  if (!usuario) {
    return res.status(404).json({ message: 'Usuario no encontrado' })
  }

  // Solo valida unicidad si el email enviado es distinto al actual
  if (email && email !== usuario.email) {
    const existeEmail = await em.findOne(Usuario, { email })
    if (existeEmail) {
      return res.status(400).json({ message: 'Este email ya está en uso por otra cuenta' })
    }
    usuario.email = email
  }

  if (telefono) {
    usuario.telefono = telefono
  }

  // flush detecta automáticamente las propiedades modificadas
  await em.flush()

  res.json({ message: 'Datos de contacto actualizados exitosamente' })
}`}
          />
        </div>
      )}

      {controllerTab === 'eliminar' && (
        <div>
          <h3>4.5 Borrado de Cuenta — <code>eliminarUsuario</code></h3>
          <CodeBlock
            title="usuario.controller.ts — Delegación al Service"
            language="TypeScript"
            code={`export async function eliminarUsuario(req: Request, res: Response) {
  const id = Number.parseInt(req.params.id)

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' })
  }

  // Medida de seguridad: impedir que un admin se autoelimine
  const usuarioId = (req as any).usuarioId
  if (usuarioId === id) {
    return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta de administrador' })
  }

  const usuarioService = new UsuarioService(em)
  const eliminado = await usuarioService.eliminarUsuario(id)

  if (!eliminado) {
    return res.status(404).json({ message: 'Usuario no encontrado' })
  }

  res.json({ message: 'Usuario y perfiles asociados eliminados correctamente' })
}`}
          />
        </div>
      )}

      <h2 id="usr-service">5. El Service (<code>usuario.service.ts</code>)</h2>
      <p>
        El <code>UsuarioService</code> contiene las operaciones complejas del dominio, desacopladas del protocolo HTTP.
      </p>

      <h3>5.1 Transición de Rol: <code>convertirMetahumanoABurocrata</code></h3>
      <CodeBlock
        title="usuario.service.ts — Swap de perfil bajo Unit of Work"
        language="TypeScript"
        code={`async convertirMetahumanoABurocrata(metahumanoId: number, datosBurocrata: any) {
  const metahumano = await this.em.findOne(Metahumano, { id: metahumanoId }, {
    populate: ['usuario']
  })

  if (!metahumano) {
    throw new Error('Metahumano no encontrado')
  }

  const usuario = metahumano.usuario

  // 1. Eliminar perfil de metahumano (DELETE en BD al hacer flush)
  this.em.remove(metahumano)

  // 2. Actualizar rol de la cuenta central (UPDATE en BD)
  usuario.role = UserRole.BUROCRATA
  usuario.metahumano = undefined

  // 3. Crear el nuevo perfil burocrático (INSERT en BD)
  const burocrata = this.em.create(Burocrata, {
    ...datosBurocrata,
    usuario,
  })
  usuario.burocrata = burocrata

  // Un solo flush ejecuta DELETE + UPDATE + INSERT dentro de una transacción
  await this.em.flush()

  return { usuario, burocrata }
}`}
      />

      <h3>5.2 Auditoría de Integridad: <code>validarIntegridad</code></h3>
      <CodeBlock
        title="usuario.service.ts — Detección de estados inconsistentes"
        language="TypeScript"
        code={`async validarIntegridad(): Promise<string[]> {
  const errores: string[] = []

  // Buscar usuarios con rol METAHUMANO pero sin perfil asociado
  const sinPerfil = await this.em.find(Usuario, {
    role: UserRole.METAHUMANO,
    metahumano: null,
  })
  sinPerfil.forEach((u) =>
    errores.push(\`Usuario \${u.id} tiene role METAHUMANO pero carece de entidad Metahumano\`)
  )

  // Buscar metahumanos sin cuenta de usuario asignada
  const huerfanos = await this.em.find(Metahumano, { usuario: null })
  huerfanos.forEach((m) =>
    errores.push(\`Metahumano \${m.id} no tiene un usuario asignado\`)
  )

  return errores
}`}
      />

      <h2 id="usr-middleware">6. Middlewares de Autenticación (<code>auth.middleware.ts</code>)</h2>

      <h3>6.1 <code>requireAuth</code> — Comprobación del Token JWT</h3>
      <CodeBlock
        title="auth.middleware.ts — Verificación síncrona en memoria"
        language="TypeScript"
        code={`export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Modo 1: Cookie segura httpOnly (Frontend Web)
    let token = req.cookies?.auth_token

    // Modo 2: Header Authorization Bearer (Postman / APIs)
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ')
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1]
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'No autenticado' })
    }

    // jwt.verify valida la firma criptográfica de forma síncrona
    const payload = jwt.verify(token, config.jwtSecret) as any

    // Inyectar datos en el objeto req para los controladores subsiguientes
    ;(req as AuthedRequest).usuarioId = payload.usuarioId
    ;(req as AuthedRequest).role      = payload.role
    ;(req as AuthedRequest).perfil    = payload.perfil
    ;(req as AuthedRequest).perfilId  = payload.perfilId

    next()
  } catch (err: any) {
    return res.status(401).json({ message: 'Token inválido o expirado' })
  }
}`}
      />

      <h3>6.2 <code>requireRoles</code> — Autorización en Dos Niveles</h3>
      <CodeBlock
        title="auth.middleware.ts — Factory de control de acceso por roles y subtipos"
        language="TypeScript"
        code={`export function requireRoles(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authedReq = req as AuthedRequest
    const roleUpper    = (authedReq.role || '').toUpperCase()
    const allowedUpper = allowedRoles.map(r => r.toUpperCase())

    // NIVEL 1: Validación instantánea en memoria mediante el rol del JWT
    if (allowedUpper.includes(roleUpper)) {
      return next()
    }

    // NIVEL 2: Validación por subtipo de negocio (HEROE / VILLANO) consultando la BD
    if (authedReq.role === 'METAHUMANO' && authedReq.perfilId) {
      const metahumano = await orm.em.findOne(Metahumano, { id: authedReq.perfilId })
      if (metahumano) {
        const tipo = metahumano.tipoMeta.toUpperCase()
        if (allowedUpper.includes(tipo)) {
          return next()
        }
      }
    }

    return res.status(403).json({ message: 'Acceso denegado: rol insuficiente' })
  }
}`}
      />

      <h2 id="usr-seguridad">7. Resumen de Seguridad para Exámenes</h2>
      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Mecanismo Técnico</th>
              <th>Propósito de Seguridad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Hashing con Salting</strong></td>
              <td><code>bcrypt.hash(pass, 10)</code></td>
              <td>Evita ataques de diccionario y rainbow tables; irreversible.</td>
            </tr>
            <tr>
              <td><strong>Protección XSS</strong></td>
              <td>Cookie <code>httpOnly: true</code></td>
              <td>Impide que scripts maliciosos de JavaScript accedan al JWT.</td>
            </tr>
            <tr>
              <td><strong>Ataques de Enumeración</strong></td>
              <td>Mensaje <code>401 "Credenciales inválidas"</code> genérico</td>
              <td>No revela si un email existe o no en la base de datos.</td>
            </tr>
            <tr>
              <td><strong>Aislamiento de Memoria</strong></td>
              <td><code>RequestContext.create()</code></td>
              <td>Garantiza que peticiones concurrentes no compartan el EntityManager.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="usr-quiz">8. Quiz de Repaso</h2>
      <p>Comprueba tus conocimientos sobre el sistema de usuarios y autenticación:</p>
      <Quiz questions={quizQuestions} />
    </div>
  );
}
