import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import Callout from '../components/Callout';

/* ============================================================
   MetahumanoEntityView.jsx — Estudio completo de metahumano.entity.ts
   ============================================================ */

export default function MetahumanoEntityView() {
  const [stiTab, setStiTab] = useState('concepto');
  const [relTab, setRelTab] = useState('oneToOne');

  return (
    <div className="doc-section">
      <h1>
        <code style={{ fontSize: '26px' }}>metahumano.entity.ts</code> — Modelado de Datos con MikroORM
      </h1>
      <p className="page-lead">
        Una <strong>Entidad</strong> en MikroORM es una clase TypeScript decorada que representa una tabla en la base de datos MySQL. Cada instancia de la clase es una fila de esa tabla. <code>metahumano.entity.ts</code> define la tabla base del polimorfismo de SuperGestor y conecta a <code>Heroe</code> y <code>Villano</code> mediante el patrón de Herencia de Tabla Única (STI).
      </p>

      <Callout type="note" title="📂 Archivos involucrados en la jerarquía de entidades">
        <ul>
          <li><code>shared/db/baseEntity.entity.ts</code> → Clase abstracta base con solo <code>id</code></li>
          <li><code>metahumano/metahumano.entity.ts</code> → Clase padre con campos compartidos</li>
          <li><code>heroe/heroe.entity.ts</code> → Subclase especializada (hereda de Metahumano)</li>
          <li><code>villano/villano.entity.ts</code> → Subclase especializada (hereda de Metahumano)</li>
        </ul>
      </Callout>

      {/* ── CÓDIGO COMPLETO ── */}
      <h2 id="entity-full">El Código Completo de la Entidad</h2>

      <CodeBlock
        title="metahumano.entity.ts — Código completo"
        language="TypeScript"
        code={`import {
  Entity,       // Marca la clase como tabla de base de datos
  Property,     // Marca una propiedad como columna de tabla
  OneToMany,    // Relación: un metahumano → muchas carpetas/poderes
  OneToOne,     // Relación: un metahumano ↔ un usuario
  Cascade,      // Define qué operaciones se propagan (ALL, REMOVE, etc.)
  Collection,   // Contenedor lazy de relaciones OneToMany/ManyToMany
  Rel,          // Tipo auxiliar para evitar referencias circulares
} from '@mikro-orm/core'
import { BaseEntity }  from '../shared/db/baseEntity.entity.js'  // Provee el 'id'
import { MetaPoder }   from '../metaPoder/metaPoder.entity.js'
import { Carpeta }     from '../carpeta/carpeta.entity.js'
import { Usuario }     from '../auth/usuario.entity.js'

// ↓ El decorador @Entity() con discriminatorColumn activa el patrón STI
@Entity({
  discriminatorColumn: 'tipo_meta',   // ← Columna en MySQL que decide la subclase
  discriminatorMap: {
    'metahumano': 'Metahumano',       // tipo_meta='metahumano' → clase Metahumano
    'villano': 'Villano',             // tipo_meta='villano'    → clase Villano
    'heroe': 'Heroe'                  // tipo_meta='heroe'      → clase Heroe
  }
})
export class Metahumano extends BaseEntity {
  // Campos obligatorios (nullable: false → NOT NULL en SQL)
  @Property({ nullable: false })
  nombre!: string   // El '!' indica que TypeScript no requiere inicializarlo aquí

  @Property({ nullable: false })
  alias!: string

  @Property({ nullable: false })
  origen!: string

  // Campos opcionales de geolocalización
  @Property({ type: 'double', nullable: true })
  latitud?: number  // El '?' indica que puede ser undefined en TypeScript

  @Property({ type: 'double', nullable: true })
  longitud?: number

  // ── RELACIONES ──────────────────────────────────────────────────────────

  // OneToOne: Un Metahumano ↔ Un Usuario (clave foránea en metahumano)
  @OneToOne({ entity: () => Usuario, inversedBy: 'metahumano', owner: true })
  usuario!: Rel<Usuario>

  // OneToMany: Un Metahumano → Muchas Carpetas (trámites)
  @OneToMany(() => Carpeta, carpeta => carpeta.metahumano, {
    cascade: [Cascade.ALL]   // Si se borra el metahumano, se borran sus carpetas
  })
  carpetas = new Collection<Carpeta>(this)

  // OneToMany: Un Metahumano → Muchos MetaPoderes (tabla pivote M:N con Poder)
  @OneToMany(() => MetaPoder, (metaPoder) => metaPoder.metahumano, {
    cascade: [Cascade.ALL],  // Si se borra el metahumano, se borran sus metapoderes
  })
  poderes = new Collection<MetaPoder>(this)

  // ── MÉTODOS DE INSTANCIA ─────────────────────────────────────────────────

  // Navega a la relación Usuario para acceder a su email
  getEmail(): string {
    return this.usuario?.email || ''
  }

  // Navega a la relación Usuario para acceder a su teléfono
  getTelefono(): string {
    return this.usuario?.telefono || ''
  }

  // Getter calculado: NO se persiste en la BD (persist: false)
  // Lee el nombre de la clase en runtime para saber si es heroe, villano o metahumano
  @Property({ persist: false })
  get tipoMeta(): string {
    return this.constructor.name.toLowerCase()
    // → new Heroe()    → tipoMeta = 'heroe'
    // → new Villano()  → tipoMeta = 'villano'
    // → new Metahumano() → tipoMeta = 'metahumano'
  }

  constructor() {
    super()  // Llama al constructor de BaseEntity (inicializa el 'id')
  }
}`}
      />

      {/* ── BASE ENTITY ── */}
      <h2 id="entity-base">1. La Clase Base: <code>BaseEntity</code></h2>
      <p>
        Todas las entidades del proyecto heredan de <code>BaseEntity</code>, una clase abstracta que provee el <strong>identificador primario</strong> de la tabla.
      </p>

      <CodeBlock
        title="shared/db/baseEntity.entity.ts"
        language="TypeScript"
        code={`import { PrimaryKey } from '@mikro-orm/core'

// 'abstract' significa que no se puede instanciar directamente.
// Solo puede ser usada como clase base.
export abstract class BaseEntity {
  @PrimaryKey()
  id?: number   // Autoincremental en MySQL (INT AUTO_INCREMENT PRIMARY KEY)

  // Columnas de auditoría (comentadas en el proyecto):
  // @Property({ type: DateTimeType })
  // createdAt? = new Date()
  //
  // @Property({ type: DateTimeType, onUpdate: () => new Date() })
  // updatedAt? = new Date()
}`}
      />

      <Callout type="tip" title="¿Por qué el id es opcional (id?)">
        <p>
          El signo <code>?</code> en <code>id?: number</code> indica que puede ser <code>undefined</code> en TypeScript. Esto es correcto porque cuando se crea un objeto con <code>em.create(Metahumano, {'{ nombre: "..." }'})</code> antes de persistirlo, el <code>id</code> todavía no existe — MySQL lo genera en el momento del <code>INSERT</code>. Después del <code>flush()</code>, MikroORM puebla el <code>id</code> automáticamente.
        </p>
      </Callout>

      {/* ── DECORADORES ── */}
      <h2 id="entity-decorators">2. Los Decoradores de MikroORM</h2>
      <p>
        Los decoradores son funciones especiales que se aplican <strong>antes de una clase, propiedad o método</strong> usando la sintaxis <code>@NombreDecorador()</code>. MikroORM los usa para registrar metadatos sobre cómo mapear la clase a una tabla SQL.
      </p>

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Decorador</th>
              <th>Se aplica sobre</th>
              <th>¿Qué le dice a MikroORM?</th>
              <th>Equivalente SQL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>@Entity()</code></td>
              <td>Clase</td>
              <td>Esta clase es una tabla en la BD</td>
              <td><code>CREATE TABLE metahumano (...)</code></td>
            </tr>
            <tr>
              <td><code>@PrimaryKey()</code></td>
              <td>Propiedad</td>
              <td>Esta columna es la clave primaria</td>
              <td><code>id INT AUTO_INCREMENT PRIMARY KEY</code></td>
            </tr>
            <tr>
              <td><code>@Property()</code></td>
              <td>Propiedad</td>
              <td>Esta propiedad es una columna de la tabla</td>
              <td><code>nombre VARCHAR(255) NOT NULL</code></td>
            </tr>
            <tr>
              <td><code>@OneToOne()</code></td>
              <td>Propiedad</td>
              <td>Relación 1:1 con otra entidad</td>
              <td><code>usuario_id INT UNIQUE FOREIGN KEY</code></td>
            </tr>
            <tr>
              <td><code>@OneToMany()</code></td>
              <td>Propiedad</td>
              <td>Relación 1:N con otra entidad (colección)</td>
              <td>La FK vive en la otra tabla</td>
            </tr>
            <tr>
              <td><code>@ManyToOne()</code></td>
              <td>Propiedad</td>
              <td>Relación N:1 (clave foránea aquí)</td>
              <td><code>metahumano_id INT FOREIGN KEY</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Opciones del decorador <code>@Property()</code></h3>
      <CodeBlock
        title="Opciones más usadas en el proyecto"
        language="TypeScript"
        code={`// nullable: false → columna NOT NULL en MySQL (el valor es obligatorio)
@Property({ nullable: false })
nombre!: string

// nullable: true → columna permite NULL (el valor es opcional)
@Property({ nullable: true })
latitud?: number

// type: 'double' → especifica el tipo SQL explícitamente (DOUBLE en MySQL)
@Property({ type: 'double', nullable: true })
longitud?: number

// persist: false → NO crea una columna. Es un campo calculado solo en memoria.
@Property({ persist: false })
get tipoMeta(): string { return this.constructor.name.toLowerCase() }

// default → valor por defecto en la base de datos
@Property({ nullable: true, default: 'activo' })
estatus!: string`}
      />

      {/* ── HERENCIA STI ── */}
      <h2 id="entity-sti">3. Herencia de Tabla Única (Single Table Inheritance)</h2>

      <div className="breakdown-box">
        <div className="breakdown-header">
          <span className="breakdown-title">El Patrón STI en Profundidad</span>
          <div className="tabs-nav">
            <button className={`tab-btn ${stiTab === 'concepto' ? 'active' : ''}`} onClick={() => setStiTab('concepto')}>¿Qué es STI?</button>
            <button className={`tab-btn ${stiTab === 'tabla' ? 'active' : ''}`} onClick={() => setStiTab('tabla')}>La Tabla en MySQL</button>
            <button className={`tab-btn ${stiTab === 'subclases' ? 'active' : ''}`} onClick={() => setStiTab('subclases')}>Heroe y Villano</button>
          </div>
        </div>

        {stiTab === 'concepto' && (
          <div className="tab-content active">
            <h4>¿Qué problema resuelve el patrón STI?</h4>
            <p>
              Tenemos tres tipos de metahumanos en el sistema: los genéricos, los héroes y los villanos. Los héroes tienen <code>nivelFama</code>, <code>numeroVictorias</code>, y <code>mision</code>. Los villanos tienen <code>nivelPeligrosidad</code>, <code>recompensa</code> y <code>motivacion</code>. Pero comparten <code>nombre</code>, <code>alias</code>, <code>origen</code>, <code>usuario</code>, etc.
            </p>
            <p>
              STI resuelve esto guardando <strong>todas las subclases en una sola tabla</strong> de MySQL, usando una columna especial llamada <strong>discriminador</strong> (<code>tipo_meta</code>) que le dice a MikroORM qué clase de objeto instanciar al leer un registro.
            </p>
            <CodeBlock
              title="Configuración STI en @Entity()"
              language="TypeScript"
              code={`@Entity({
  discriminatorColumn: 'tipo_meta',  // Nombre de la columna en MySQL
  discriminatorMap: {
    'metahumano': 'Metahumano',  // Valor 'metahumano' → instancia Metahumano
    'villano': 'Villano',        // Valor 'villano' → instancia Villano
    'heroe': 'Heroe'             // Valor 'heroe' → instancia Heroe
  }
})
export class Metahumano extends BaseEntity { ... }`}
            />
          </div>
        )}

        {stiTab === 'tabla' && (
          <div className="tab-content active">
            <h4>¿Cómo se ve la tabla <code>metahumano</code> en MySQL?</h4>
            <p>
              Una sola tabla almacena héroes, villanos y metahumanos genéricos. Las columnas de héroe (<code>nivel_fama</code>, etc.) están en <code>NULL</code> para los villanos y viceversa:
            </p>
            <div className="table-wrapper">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>id</th>
                    <th>tipo_meta</th>
                    <th>nombre</th>
                    <th>alias</th>
                    <th>nivel_fama</th>
                    <th>numero_victorias</th>
                    <th>nivel_peligrosidad</th>
                    <th>recompensa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td><code style={{ color: 'var(--tip-text)' }}>heroe</code></td>
                    <td>Barry Allen</td>
                    <td>Flash</td>
                    <td>Alto</td>
                    <td>15</td>
                    <td style={{ color: 'var(--text-light)' }}>NULL</td>
                    <td style={{ color: 'var(--text-light)' }}>NULL</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td><code style={{ color: 'var(--danger-text)' }}>villano</code></td>
                    <td>Lex Luthor</td>
                    <td>El Hombre</td>
                    <td style={{ color: 'var(--text-light)' }}>NULL</td>
                    <td style={{ color: 'var(--text-light)' }}>NULL</td>
                    <td>Extrema</td>
                    <td>250000</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td><code style={{ color: 'var(--text-muted)' }}>metahumano</code></td>
                    <td>John Doe</td>
                    <td>Desconocido</td>
                    <td style={{ color: 'var(--text-light)' }}>NULL</td>
                    <td style={{ color: 'var(--text-light)' }}>NULL</td>
                    <td style={{ color: 'var(--text-light)' }}>NULL</td>
                    <td style={{ color: 'var(--text-light)' }}>NULL</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Cuando MikroORM lee la fila con <code>id=1</code> y ve que <code>tipo_meta='heroe'</code>, devuelve un objeto de clase <code>Heroe</code> con todos sus métodos específicos. Para la fila <code>id=2</code> devuelve un objeto <code>Villano</code>.
            </p>
          </div>
        )}

        {stiTab === 'subclases' && (
          <div className="tab-content active">
            <h4>Las Subclases: Heroe y Villano</h4>

            <div className="two-col-grid">
              <div>
                <CodeBlock
                  title="heroe/heroe.entity.ts"
                  language="TypeScript"
                  code={`@Entity()
export class Heroe extends Metahumano {
  // Campos exclusivos de héroes
  @Property({ nullable: true })
  nivelFama?: string
  // 'Alto', 'Medio', 'Bajo'

  @Property({ nullable: true })
  mision?: string

  @Property({ nullable: true })
  fechaUltimaVictoria?: Date

  @Property({ nullable: true, default: 'activo' })
  estatus!: string
  // 'activo', 'retirado', 'desaparecido', 'fallecido'

  @Property({ nullable: true })
  numeroVictorias?: number

  constructor() {
    super() // Llama a Metahumano → BaseEntity
  }
}`}
                />
              </div>
              <div>
                <CodeBlock
                  title="villano/villano.entity.ts"
                  language="TypeScript"
                  code={`@Entity()
export class Villano extends Metahumano {
  // Campos exclusivos de villanos
  @Property({ nullable: true })
  nivelPeligrosidad?: string

  @Property({ nullable: true })
  motivacion?: string

  @Property({ nullable: true })
  fechaCaptura?: Date

  @Property({ nullable: true, default: 'activo' })
  estado!: string
  // 'activo', 'capturado',
  // 'rehabilitado', 'fugitivo'

  @Property({ nullable: true })
  recompensa?: number

  constructor() {
    super()
  }
}`}
                />
              </div>
            </div>
            <Callout type="note" title="¿Por qué @Entity() sin argumentos en Heroe y Villano?">
              <p>
                MikroORM infiere que <code>Heroe</code> y <code>Villano</code> son subclases STI porque <strong>extienden</strong> de <code>Metahumano</code>, que ya tiene el <code>discriminatorMap</code> configurado. El decorador <code>@Entity()</code> vacío es suficiente para que MikroORM registre sus propiedades adicionales como columnas de la misma tabla.
              </p>
            </Callout>
          </div>
        )}
      </div>

      {/* ── RELACIONES ── */}
      <h2 id="entity-relations">4. Las Relaciones Entre Entidades</h2>

      <div className="breakdown-box">
        <div className="breakdown-header">
          <span className="breakdown-title">Los Tres Tipos de Relaciones en Metahumano</span>
          <div className="tabs-nav">
            <button className={`tab-btn ${relTab === 'oneToOne' ? 'active' : ''}`} onClick={() => setRelTab('oneToOne')}>OneToOne (Usuario)</button>
            <button className={`tab-btn ${relTab === 'oneToMany' ? 'active' : ''}`} onClick={() => setRelTab('oneToMany')}>OneToMany (Carpetas)</button>
            <button className={`tab-btn ${relTab === 'manyToMany' ? 'active' : ''}`} onClick={() => setRelTab('manyToMany')}>M:N → MetaPoder</button>
          </div>
        </div>

        {relTab === 'oneToOne' && (
          <div className="tab-content active">
            <h4>Relación OneToOne con Usuario</h4>
            <p>Un <code>Metahumano</code> siempre tiene exactamente <strong>un</strong> <code>Usuario</code> asociado (el dueño de la cuenta). Esta relación garantiza que cada cuenta de usuario solo puede tener un perfil de metahumano.</p>
            <CodeBlock
              title="Definición de la relación"
              language="TypeScript"
              code={`@OneToOne({
  entity: () => Usuario,     // Clase destino de la relación
  inversedBy: 'metahumano',  // Nombre del campo en Usuario que apunta de vuelta
  owner: true                // 'owner: true' = la FK (usuario_id) está en ESTA tabla
})
usuario!: Rel<Usuario>`}
            />
            <Callout type="tip" title="¿Qué hace Rel&lt;Usuario&gt;?">
              <p>
                <code>Rel{'<Usuario>'}</code> es un tipo auxiliar de MikroORM que evita referencias circulares en TypeScript. Sin él, como <code>Usuario</code> también tiene una referencia a <code>Metahumano</code>, TypeScript podría entrar en un loop infinito de tipos. <code>Rel</code> interrumpe ese ciclo de forma segura.
              </p>
            </Callout>
            <p>
              En la tabla MySQL de <code>metahumano</code>, esta relación genera una columna:
            </p>
            <CodeBlock title="SQL generado por la relación OneToOne" language="SQL" code={`ALTER TABLE metahumano
ADD COLUMN usuario_id INT NOT NULL UNIQUE,
ADD CONSTRAINT fk_metahumano_usuario
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
  ON DELETE CASCADE;`} />
          </div>
        )}

        {relTab === 'oneToMany' && (
          <div className="tab-content active">
            <h4>Relaciones OneToMany con Carpetas y MetaPoderes</h4>
            <p>Un <code>Metahumano</code> puede tener <strong>muchas</strong> <code>Carpeta</code>s (expedientes) y <strong>muchos</strong> <code>MetaPoder</code>es (poderes asignados).</p>
            <CodeBlock
              title="Definición de las relaciones OneToMany"
              language="TypeScript"
              code={`// Un metahumano → Muchas Carpetas
@OneToMany(() => Carpeta, carpeta => carpeta.metahumano, {
  cascade: [Cascade.ALL]
  // Si se borra el Metahumano → se borran TODAS sus Carpetas (CASCADE DELETE)
})
carpetas = new Collection<Carpeta>(this)
//         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Collection es un array lazy de MikroORM.
// Los datos NO se cargan automáticamente al leer el metahumano.
// Se necesita populate: ['carpetas'] para traerlos.

// Un metahumano → Muchos MetaPoderes (tabla pivote hacia Poder)
@OneToMany(() => MetaPoder, (metaPoder) => metaPoder.metahumano, {
  cascade: [Cascade.ALL],
})
poderes = new Collection<MetaPoder>(this)`}
            />
            <Callout type="note" title="¿Qué es Cascade.ALL?">
              <p>
                <code>Cascade.ALL</code> le dice a MikroORM que propague <strong>todas</strong> las operaciones (INSERT, UPDATE, DELETE) desde el padre hacia los hijos. Si se llama <code>em.removeAndFlush(metahumano)</code>, automáticamente se eliminan todas sus carpetas y metapoderes asociados sin necesidad de borrarlos manualmente.
              </p>
            </Callout>
          </div>
        )}

        {relTab === 'manyToMany' && (
          <div className="tab-content active">
            <h4>Relación Muchos a Muchos implementada con MetaPoder</h4>
            <p>
              Un metahumano puede tener <strong>muchos poderes</strong>, y un poder puede ser poseído por <strong>muchos metahumanos</strong>. Además, necesitamos guardar atributos adicionales como <code>dominio</code> y <code>nivelControl</code> en la relación misma. Esto se implementa con una <strong>entidad pivote</strong> (<code>MetaPoder</code>).
            </p>
            <CodeBlock
              title="metaPoder/metaPoder.entity.ts — La tabla pivote"
              language="TypeScript"
              code={`@Entity()
export class MetaPoder extends BaseEntity {
  // Atributos propios de la relación (no pertenecen ni a Metahumano ni a Poder)
  @Property({ nullable: false })
  dominio!: string           // 'NOVATO', 'INTERMEDIO', 'AVANZADO', 'EXPERTO', 'MAESTRO'

  @Property({ nullable: true })
  fechaAdquisicion?: Date    // ¿Cuándo adquirió el poder?

  @Property({ nullable: true })
  nivelControl?: number      // 1-100

  @Property({ nullable: true })
  estado?: string            // 'ACTIVO', 'INACTIVO', 'BLOQUEADO'

  @Property({ nullable: true })
  certificado?: string

  // FK hacia Metahumano
  @ManyToOne(() => Metahumano)
  metahumano!: Rel<Metahumano>

  // FK hacia Poder
  @ManyToOne(() => Poder)
  poder!: Rel<Poder>
}`}
            />
            <p>El diagrama de la relación en la base de datos sería:</p>
            <div style={{ background: 'var(--code-bg)', border: '1px solid var(--code-border)', borderRadius: '6px', padding: '16px', marginTop: '12px', fontFamily: 'var(--font-family-mono)', fontSize: '12.5px', lineHeight: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ background: 'var(--tip-bg)', color: 'var(--tip-text)', padding: '4px 12px', borderRadius: '4px', fontWeight: 600 }}>metahumano</span>
                <span style={{ color: 'var(--text-muted)' }}>──id──→</span>
                <span style={{ background: 'var(--warn-bg)', color: 'var(--warn-text)', padding: '4px 12px', borderRadius: '4px', fontWeight: 600 }}>meta_poder</span>
                <span style={{ color: 'var(--text-muted)' }}>←──id──</span>
                <span style={{ background: 'var(--note-bg)', color: 'var(--note-text)', padding: '4px 12px', borderRadius: '4px', fontWeight: 600 }}>poder</span>
              </div>
              <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '11.5px' }}>
                meta_poder: (id, metahumano_id FK, poder_id FK, dominio, nivel_control, estado, certificado, fecha_adquisicion)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── GETTER tipoMeta ── */}
      <h2 id="entity-getter">5. El Getter Calculado: <code>tipoMeta</code></h2>
      <p>
        Este es uno de los detalles más elegantes de la entidad. En lugar de guardar una columna extra con el tipo, se usa la <strong>introspección de clases de JavaScript</strong>:
      </p>

      <CodeBlock
        title="El getter tipoMeta en detalle"
        language="TypeScript"
        code={`// persist: false → MikroORM NO crea una columna para esto.
// Es solo un campo virtual que existe en memoria al leer el objeto.
@Property({ persist: false })
get tipoMeta(): string {
  // this.constructor.name → devuelve el nombre de la clase real del objeto
  // .toLowerCase()        → lo convierte a minúsculas
  return this.constructor.name.toLowerCase()
}

// Ejemplos en runtime:
const heroe = em.create(Heroe, { nombre: 'Barry Allen', ... })
console.log(heroe.tipoMeta)       // → 'heroe'

const villano = em.create(Villano, { nombre: 'Lex Luthor', ... })
console.log(villano.tipoMeta)     // → 'villano'

const meta = em.create(Metahumano, { nombre: 'John', ... })
console.log(meta.tipoMeta)        // → 'metahumano'

// Y este valor se usa en el controlador para tomar decisiones:
if (metahumano.tipoMeta !== 'metahumano') {
  return res.status(400).json({
    message: 'Tu estilo de vida ya está definido'
  })
}`}
      />

      <Callout type="deep-dive" title="🔍 ¿Por qué persist: false y no una columna normal?">
        <p>
          La columna <code>tipo_meta</code> en la tabla ya existe gracias al <strong>discriminadorColumn</strong> del decorador <code>@Entity()</code>. MikroORM la gestiona internamente. Si creáramos una propiedad adicional <code>tipoMeta</code> con persistencia, habría <strong>dos columnas</strong> con la misma información y posibles inconsistencias. Con <code>persist: false</code>, el getter solo lee el nombre de la clase en memoria, sin tocar la base de datos.
        </p>
      </Callout>
    </div>
  );
}
