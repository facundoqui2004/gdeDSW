import React from 'react';
import CodeBlock from '../components/CodeBlock';
import Callout from '../components/Callout';
import Quiz from '../components/Quiz';

export default function UsuarioEntityView() {
  const quizQuestions = [
    {
      question: '¿Por qué email tiene unique: true y telefono no en la entidad Usuario?',
      options: [
        'Porque la base de datos no soporta múltiples campos unique.',
        'Porque el email es el identificador único de inicio de sesión (credencial de login), mientras que el teléfono puede compartirse o repetirse.',
        'Porque telefono es un número y email es un string.',
        'Es un error de tipeo en el código del modelo.'
      ],
      correct: 1,
      explanation: 'El email se usa como credencial principal de autenticación en el login, por lo que debe ser estrictamente único en toda la tabla. El teléfono es solo un dato de contacto secundario.'
    },
    {
      question: '¿Qué pasaría si sacaras @BeforeUpdate() y dejaras solo @BeforeCreate()?',
      options: [
        'No cambiaría nada porque MikroORM valida todo al inicio.',
        'Solo se validaría la consistencia al insertar; si luego un UPDATE le asigna ambos perfiles o un rol incompatible, la base de datos quedaría inconsistente sin arrojar error.',
        'La entidad no podría guardarse por primera vez.',
        'MikroORM lanzaría un error de compilación de TypeScript.'
      ],
      correct: 1,
      explanation: 'Si solo está @BeforeCreate(), al hacer em.flush() sobre un usuario existente que fue modificado (UPDATE), el hook no se dispararía, permitiendo guardar inconsistencias de rol/perfil.'
    },
    {
      question: '¿Por qué metahumano y burocrata no tienen @Property() sino @OneToOne()?',
      options: [
        'Porque @Property() solo se usa para fechas.',
        'Porque no son columnas escalares simples (como string o number), sino referencias a otras entidades (tablas) vinculadas por clave foránea.',
        'Porque @OneToOne() hace que los campos sean obligatorios.',
        'Porque @Property() no funciona con tipos TypeScript complejos.'
      ],
      correct: 1,
      explanation: '@Property() mapea tipos de datos primitivos de columnas SQL (VARCHAR, INT, DATETIME). Las asociaciones entre tablas requieren decoradores de relación como @OneToOne, @OneToMany o @ManyToMany.'
    },
    {
      question: '¿Qué diferencia hay entre default: false en @Property() y el = false al final de la propiedad verificado?',
      options: [
        'Son exactamente lo mismo y se pueden omitir.',
        'default: false es la instrucción DDL para la columna SQL en la base de datos; = false es el valor inicial en memoria dentro del runtime de JavaScript/TypeScript al instanciar new Usuario().',
        'default: false es para TypeScript y = false es para la base de datos.',
        '= false se ejecuta al hacer flush() y default: false al hacer find().'
      ],
      correct: 1,
      explanation: 'Es una buena práctica tener ambos: uno le dice al motor de base de datos qué valor poner si no se envía en el INSERT SQL, y el otro le da un valor por defecto al objeto en memoria apenas hacés new Usuario().'
    },
    {
      question: '¿Por qué las entidades relacionadas (\'Metahumano\', \'Burocrata\') se referencian como string () => \'Metahumano\' en vez de importar la clase directamente?',
      options: [
        'Porque MikroORM no acepta clases de TypeScript.',
        'Para evitar problemas de referencias circulares durante la carga de módulos en tiempo de ejecución.',
        'Porque las clases Metahumano y Burocrata no existen en el proyecto.',
        'Para mejorar la velocidad de las consultas SELECT en MySQL.'
      ],
      correct: 1,
      explanation: 'Como Metahumano importa a Usuario y Usuario necesita referenciar a Metahumano, usar una función con string () => \'Metahumano\' rompe el ciclo de dependencias circulares de Node.js/ESModules.'
    }
  ];

  return (
    <div className="doc-section">
      <h1>
        <code style={{ fontSize: '26px' }}>usuario.entity.ts</code> — Guía de Estudio MikroORM + TypeScript
      </h1>
      <p className="page-lead">
        Estudio exhaustivo y paso a paso de la entidad <strong>Usuario</strong>. 
        Comprende cómo MikroORM mapea clases de TypeScript a tablas relacionales de MySQL, cómo se estructura la seguridad, 
        el uso de decoradores, tipos utilitarios, relaciones <code>OneToOne</code> y validación de reglas de negocio con hooks de ciclo de vida.
      </p>

      <Callout type="note" title="💡 ¿Qué es este archivo?">
        <p>
          Este archivo define una <strong>entidad</strong> de base de datos usando <strong>MikroORM</strong>, un ORM (Object-Relational Mapper) para TypeScript y Node.js. 
          Un ORM te permite manipular la base de datos mediante clases y objetos tipados en lugar de escribir SQL crudo a mano.
        </p>
        <p style={{ marginTop: '8px' }}>
          Esta entidad en particular modela la cuenta de acceso de un usuario que puede tener uno de tres roles (<code>METAHUMANO</code>, <code>BUROCRATA</code>, <code>ADMIN</code>), 
          y que opcionalmente está vinculado a un perfil de Metahumano o de Burócrata — <strong>pero nunca a los dos a la vez</strong>.
        </p>
      </Callout>

      {/* ── SECCIÓN 1: CÓDIGO COMPLETO ── */}
      <h2 id="uent-codigo">1. Código Completo de la Entidad</h2>
      <CodeBlock
        title="Backend/src/auth/usuario.entity.ts"
        language="TypeScript"
        code={`import {
  Entity,
  Property,
  OneToOne,
  Rel,
  BeforeCreate,
  BeforeUpdate,
  Enum,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

export enum UserRole {
  METAHUMANO = 'METAHUMANO',
  BUROCRATA = 'BUROCRATA',
  ADMIN = 'ADMIN'
}

@Entity()
export class Usuario extends BaseEntity {
  @Property({ unique: true, nullable: false })
  email!: string

  @Property({ nullable: false })
  telefono!: string

  @Property({ nullable: false })
  passwordHash!: string

  @Enum(() => UserRole)
  role!: UserRole

  @Property({ default: false })
  verificado: boolean = false

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date()

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  // Relaciones One-to-One opcionales
  @OneToOne({ entity: () => 'Metahumano', mappedBy: 'usuario', nullable: true })
  metahumano?: Rel<any>

  @OneToOne({ entity: () => 'Burocrata', mappedBy: 'usuario', nullable: true })
  burocrata?: Rel<any>

  @BeforeCreate()
  @BeforeUpdate()
  validateRoleConsistency() {
    // Validar que no tenga ambos perfiles
    if (this.metahumano && this.burocrata) {
      throw new Error('Un usuario no puede tener ambos perfiles (metahumano y burocrata)')
    }
    
    // Validar que el role coincida con el perfil existente
    if (this.role === UserRole.METAHUMANO && this.burocrata) {
      throw new Error('Usuario con role METAHUMANO no puede tener perfil de burocrata')
    }
    if (this.role === UserRole.BUROCRATA && this.metahumano) {
      throw new Error('Usuario con role BUROCRATA no puede tener perfil de metahumano')
    }
  }
}`}
      />

      {/* ── SECCIÓN 2: IMPORTS ── */}
      <h2 id="uent-imports">2. Los Imports y el Concepto de Decoradores</h2>
      <CodeBlock
        title="usuario.entity.ts — Imports principales"
        language="TypeScript"
        code={`import {
  Entity,
  Property,
  OneToOne,
  Rel,
  BeforeCreate,
  BeforeUpdate,
  Enum,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'`}
      />

      <div className="breakdown-box">
        <div className="breakdown-header"><span className="breakdown-title">Análisis de las dependencias</span></div>
        <div className="tab-content active">
          <ul className="step-list">
            <li className="step-item">
              <span className="step-badge">1</span>
              <div>
                <h5><code>@mikro-orm/core</code></h5>
                <p>
                  Todo lo importado con mayúscula inicial son <strong>decoradores</strong> (<code>@Entity</code>, <code>@Property</code>, <code>@OneToOne</code>, <code>@Enum</code>, <code>@BeforeCreate</code>, <code>@BeforeUpdate</code>) o <strong>tipos utilitarios</strong> (<code>Rel</code>).
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">2</span>
              <div>
                <h5><code>BaseEntity</code></h5>
                <p>
                  Es una clase base abstracta propia del proyecto (en <code>shared/db/baseEntity.entity.ts</code>) que declara la clave primaria <code>id?: number</code> con <code>@PrimaryKey()</code>. Al extenderla con <code>extends BaseEntity</code>, <code>Usuario</code> hereda automáticamente la columna de ID sin duplicar código.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <Callout type="tip" title="💡 Concepto clave: Decoradores en TypeScript">
        <p>
          Un <strong>decorador</strong> es una función especial que se antepone con un símbolo <code>@</code> sobre una clase, propiedad o método. Su propósito es adjuntar metadatos en tiempo de ejecución. 
          MikroORM inspecciona estos metadatos para saber exactamente qué clase es una tabla, qué propiedades son columnas, sus tipos y sus restricciones de clave foránea.
        </p>
      </Callout>

      {/* ── SECCIÓN 3: ENUM USERROLE ── */}
      <h2 id="uent-enum">3. El Enum <code>UserRole</code></h2>
      <CodeBlock
        title="usuario.entity.ts — Definición del Enum"
        language="TypeScript"
        code={`export enum UserRole {
  METAHUMANO = 'METAHUMANO',
  BUROCRATA = 'BUROCRATA',
  ADMIN = 'ADMIN'
}`}
      />
      <p>
        Un <strong>enum</strong> (enumeración) restringe el valor de una variable a un catálogo cerrado de opciones válidas.
      </p>
      <div className="two-col-grid">
        <div className="concept-card">
          <div className="card-icon">🛡️</div>
          <h4>Seguridad de Tipos</h4>
          <p>Impide errores tipográficos como escribir <code>"admin"</code> en minúsculas o <code>"MetaHumano"</code>. TypeScript marcará error antes de ejecutar el código.</p>
        </div>
        <div className="concept-card">
          <div className="card-icon">📦</div>
          <h4>Exportable y Reutilizable</h4>
          <p>Al llevar <code>export</code>, se importa en controladores (<code>usuario.controller.ts</code>), servicios y middlewares de autorización (<code>auth.middleware.ts</code>).</p>
        </div>
      </div>

      {/* ── SECCIÓN 4: DECLARACIÓN DE CLASE ── */}
      <h2 id="uent-clase">4. Declaración de la Clase</h2>
      <CodeBlock
        title="usuario.entity.ts — Clase Usuario"
        language="TypeScript"
        code={`@Entity()
export class Usuario extends BaseEntity {`}
      />
      <ul>
        <li><code>@Entity()</code>: Le indica a MikroORM que esta clase representa una tabla en MySQL. Sin este decorador, el ORM ignoraría la clase por completo.</li>
        <li><code>export class Usuario</code>: Define el modelo de la entidad y permite instanciarla (<code>new Usuario()</code>) en cualquier módulo del backend.</li>
        <li><code>extends BaseEntity</code>: Herencia orientada a objetos para reutilizar la definición de la clave primaria (<code>id</code>).</li>
      </ul>

      {/* ── SECCIÓN 5: PROPIEDADES ── */}
      <h2 id="uent-propiedades">5. Propiedades y Columnas de la Tabla</h2>
      <p>
        Cada atributo decorado con <code>@Property()</code> o <code>@Enum()</code> se convierte en una columna dentro de la tabla <code>usuario</code>:
      </p>

      <CodeBlock
        title="usuario.entity.ts — Definición de columnas"
        language="TypeScript"
        code={`@Property({ unique: true, nullable: false })
email!: string

@Property({ nullable: false })
telefono!: string

@Property({ nullable: false })
passwordHash!: string

@Enum(() => UserRole)
role!: UserRole

@Property({ default: false })
verificado: boolean = false

@Property({ onCreate: () => new Date() })
createdAt: Date = new Date()

@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
updatedAt: Date = new Date()`}
      />

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Propiedad</th>
              <th>Decorador / Opciones</th>
              <th>Propósito & Explicación Técnica</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>email</code></td>
              <td><code>{"@Property({ unique: true, nullable: false })"}</code></td>
              <td>
                Columna obligatoria (<code>NOT NULL</code>) e irrepetible (<code>UNIQUE INDEX</code>). 
                El signo <code>!</code> es el operador de <em>Definite Assignment Assertion</em> de TypeScript.
              </td>
            </tr>
            <tr>
              <td><code>telefono</code></td>
              <td><code>{"@Property({ nullable: false })"}</code></td>
              <td>Número de contacto obligatorio para trámites y notificaciones del sistema.</td>
            </tr>
            <tr>
              <td><code>passwordHash</code></td>
              <td><code>{"@Property({ nullable: false })"}</code></td>
              <td>
                Guarda el resultado del hash generado con <code>bcrypt.hash(pass, 10)</code>. <strong>Nunca se almacena la contraseña en texto plano</strong> por seguridad.
              </td>
            </tr>
            <tr>
              <td><code>role</code></td>
              <td><code>{"@Enum(() => UserRole)"}</code></td>
              <td>
                Mapea el enum en MySQL. La función flecha <code>{"() => UserRole"}</code> es una evaluación diferida que previene problemas de importación circular.
              </td>
            </tr>
            <tr>
              <td><code>verificado</code></td>
              <td><code>{"@Property({ default: false })"}</code></td>
              <td>
                <code>default: false</code> define el valor por defecto en la tabla SQL, mientras que <code>= false</code> inicializa la propiedad en la memoria de JavaScript.
              </td>
            </tr>
            <tr>
              <td><code>createdAt</code></td>
              <td><code>{"@Property({ onCreate: () => new Date() })"}</code></td>
              <td>Hook a nivel de campo: MikroORM calcula la fecha actual al momento del <code>INSERT</code>.</td>
            </tr>
            <tr>
              <td><code>updatedAt</code></td>
              <td><code>{"@Property({ onCreate: ..., onUpdate: ... })"}</code></td>
              <td>Se calcula al insertar y se recalcula automáticamente cada vez que se efectúa un <code>UPDATE</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── SECCIÓN 6: RELACIONES ONE TO ONE ── */}
      <h2 id="uent-relaciones">6. Relaciones <code>@OneToOne</code> y Composición</h2>
      <CodeBlock
        title="usuario.entity.ts — Relaciones One-to-One opcionales"
        language="TypeScript"
        code={`@OneToOne({ entity: () => 'Metahumano', mappedBy: 'usuario', nullable: true })
metahumano?: Rel<any>

@OneToOne({ entity: () => 'Burocrata', mappedBy: 'usuario', nullable: true })
burocrata?: Rel<any>`}
      />

      <div className="breakdown-box">
        <div className="breakdown-header"><span className="breakdown-title">Desglose de la configuración de relación</span></div>
        <div className="tab-content active">
          <ul className="step-list">
            <li className="step-item">
              <span className="step-badge">1</span>
              <div>
                <h5><code>entity: () =&gt; 'Metahumano'</code></h5>
                <p>Usa un string con función flecha para evitar importar la clase <code>Metahumano</code> directamente, rompiendo dependencias circulares entre archivos.</p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">2</span>
              <div>
                <h5><code>mappedBy: 'usuario'</code> — Lado Inverso</h5>
                <p>
                  Indica que la <strong>clave foránea (Foreign Key)</strong> no se encuentra en la tabla <code>usuario</code>, sino del otro lado en la columna <code>usuario_id</code> de la tabla <code>metahumano</code> o <code>burocrata</code>.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">3</span>
              <div>
                <h5><code>nullable: true</code> y <code>?</code></h5>
                <p>Un usuario puede ser creado antes de completar su ficha de metahumano o burócrata (o ser simplemente un usuario administrador).</p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">4</span>
              <div>
                <h5><code>Rel&lt;any&gt;</code></h5>
                <p>Tipo utilitario de MikroORM que ayuda al compilador de TypeScript a tipar la relación sin cargar de forma recursiva pesados árboles de tipos.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <Callout type="info" title="💡 Concepto clave: Relación Uno a Uno (1:1)">
        <p>
          Una relación 1:1 significa que un registro de <code>Usuario</code> puede asociarse a lo sumo con <strong>un único</strong> registro de <code>Metahumano</code> (o <code>Burocrata</code>), y viceversa.
        </p>
      </Callout>

      {/* ── SECCIÓN 7: HOOKS DE VALIDACIÓN ── */}
      <h2 id="uent-hooks">7. Hooks de Validación (<code>@BeforeCreate</code> / <code>@BeforeUpdate</code>)</h2>
      <CodeBlock
        title="usuario.entity.ts — Validación de consistencia de roles y perfiles"
        language="TypeScript"
        code={`@BeforeCreate()
@BeforeUpdate()
validateRoleConsistency() {
  // Regla 1: Validar que no tenga ambos perfiles simultáneamente
  if (this.metahumano && this.burocrata) {
    throw new Error('Un usuario no puede tener ambos perfiles (metahumano y burocrata)')
  }
  
  // Regla 2: Validar que el role coincida con el perfil asignado
  if (this.role === UserRole.METAHUMANO && this.burocrata) {
    throw new Error('Usuario con role METAHUMANO no puede tener perfil de burocrata')
  }
  if (this.role === UserRole.BUROCRATA && this.metahumano) {
    throw new Error('Usuario con role BUROCRATA no puede tener perfil de metahumano')
  }
}`}
      />

      <div className="breakdown-box">
        <div className="breakdown-header"><span className="breakdown-title">¿Cómo funcionan los Lifecycle Hooks?</span></div>
        <div className="tab-content active">
          <ul className="step-list">
            <li className="step-item">
              <span className="step-badge">🔄</span>
              <div>
                <h5>Decoradores Apilados</h5>
                <p>
                  Al apilar <code>@BeforeCreate()</code> y <code>@BeforeUpdate()</code>, el método <code>validateRoleConsistency()</code> se ejecuta <strong>siempre</strong> que MikroORM intenta insertar una nueva fila o actualizar una existente durante un <code>em.flush()</code>.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">⛔</span>
              <div>
                <h5>Cancelación con <code>throw new Error()</code></h5>
                <p>
                  Si alguna condición se transgrede, se lanza una excepción que <strong>aborta la transacción</strong> de guardado en el ORM, evitando que datos inconsistentes lleguen a la base de datos.
                </p>
              </div>
            </li>
            <li className="step-item">
              <span className="step-badge">⚖️</span>
              <div>
                <h5>Integridad a Nivel de Aplicación</h5>
                <p>
                  Esta regla de exclusión mutua cruzada entre dos relaciones y un enum sería compleja de expresar con constraints SQL puros en MySQL. Los hooks del ORM permiten expresar lógica de negocio avanzada en TypeScript.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ── SECCIÓN 8: GLOSARIO ── */}
      <h2 id="uent-glosario">8. Glosario Rápido</h2>
      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Término</th>
              <th>Qué significa en este contexto</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>ORM</strong></td><td>Librería que traduce clases y objetos de código a tablas y filas de base de datos.</td></tr>
            <tr><td><strong>Entidad</strong></td><td>Una clase decorada con <code>@Entity()</code> que representa una tabla en MySQL.</td></tr>
            <tr><td><strong>Decorador</strong></td><td>Función con <code>@</code> que agrega metadatos o comportamiento especial a una clase, propiedad o método.</td></tr>
            <tr><td><strong>Enum</strong></td><td>Tipo con un conjunto cerrado y tipado de valores posibles (ej. <code>METAHUMANO</code>, <code>BUROCRATA</code>, <code>ADMIN</code>).</td></tr>
            <tr><td><strong><code>nullable</code></strong></td><td>Indica si una columna admite valores <code>NULL</code> o si es obligatoria (<code>nullable: false</code>).</td></tr>
            <tr><td><strong><code>unique</code></strong></td><td>Restricción que impide duplicados en toda la columna de la tabla (ej. <code>email</code>).</td></tr>
            <tr><td><strong>Relación 1:1</strong></td><td>Cada registro se vincula con, como máximo, un único registro de la otra entidad.</td></tr>
            <tr><td><strong><code>mappedBy</code></strong></td><td>Indica que la clave foránea (FK) reside en la otra entidad y no en esta tabla.</td></tr>
            <tr><td><strong>Hook de ciclo de vida</strong></td><td>Método que el ORM ejecuta automáticamente en un momento determinado (crear, actualizar, etc.).</td></tr>
            <tr><td><strong><code>!</code> (Definite Assignment)</strong></td><td>Aserción que le asegura a TypeScript que la propiedad tendrá valor antes de ser leída.</td></tr>
            <tr><td><strong><code>?</code> (Optional)</strong></td><td>Marca una propiedad como opcional en TypeScript (puede valer <code>undefined</code>).</td></tr>
          </tbody>
        </table>
      </div>

      {/* ── SECCIÓN 9: QUIZ ── */}
      <h2 id="uent-quiz">9. Quiz de Estudio y Repaso</h2>
      <p>Pon a prueba lo aprendido sobre <code>usuario.entity.ts</code> con este cuestionario interactivo:</p>
      <Quiz questions={quizQuestions} />
    </div>
  );
}
