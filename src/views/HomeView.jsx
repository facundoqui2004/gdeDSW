import React, { useState } from 'react';
import Callout from '../components/Callout';

export default function HomeView({ setActiveView }) {
  const [activeTab, setActiveTab] = useState('em');

  return (
    <div className="doc-section">
      <h1>Arquitectura Backend del SuperGestor</h1>
      <p className="page-lead">
        Guía integral de aprendizaje diseñada para comprender desde cero el funcionamiento, flujo de datos y lógica interna del backend del sistema SuperGestor, basado en <strong>Express.js</strong>, <strong>TypeScript</strong> y <strong>MikroORM</strong>.
      </p>

      <Callout type="note" title="¿Cuál es el objetivo de esta documentación?">
        <p>
          Esta web interactiva está construida en <strong>React.js</strong> para estudiar paso a paso cada línea de código, entender el por qué de cada función, dominar los conceptos de bases de datos relacionales con ORM y cómo se orquestan la seguridad, validaciones y lógica de negocio.
        </p>
      </Callout>

      <h2 id="section-home-stack">El Stack Tecnológico Principal</h2>
      <div className="concept-grid">
        <div className="concept-card">
          <div className="card-icon">🚀</div>
          <h4>Express.js 4.x</h4>
          <p>Framework minimalista y flexible de Node.js para construir APIs REST. Administra el enrutamiento, middlewares, peticiones HTTP (<code>req</code>) y respuestas (<code>res</code>).</p>
        </div>
        <div className="concept-card">
          <div className="card-icon">🔷</div>
          <h4>TypeScript</h4>
          <p>Superconjunto tipado de JavaScript que añade tipado estático, decoradores de metadatos y detección temprana de errores antes de la ejecución.</p>
        </div>
        <div className="concept-card">
          <div className="card-icon">🗄️</div>
          <h4>MikroORM 6.x</h4>
          <p>ORM moderno basado en <em>Data Mapper</em>, <em>Unit of Work</em> e <em>Identity Map</em>. Permite manipular tablas de MySQL usando clases y decoradores.</p>
        </div>
        <div className="concept-card">
          <div className="card-icon">🔐</div>
          <h4>JWT & Cookies</h4>
          <p>Mecanismo de autenticación sin estado (Stateless) con tokens firmados vía cookies seguras o encabezados <code>Authorization: Bearer</code>.</p>
        </div>
      </div>

      <h2 id="section-home-flow">El Ciclo de Vida de una Petición HTTP</h2>
      <p>
        Cuando un cliente (como el Frontend en React o Postman) envía una petición al backend, la solicitud pasa por una serie de capas ordenadas antes de llegar a la base de datos:
      </p>

      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Paso</th>
              <th>Capa / Componente</th>
              <th>Responsabilidad</th>
              <th>Archivo Clave</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1</strong></td>
              <td><strong>Servidor HTTP</strong></td>
              <td>Recibe la conexión TCP, parsea headers y puerto 3000.</td>
              <td><code>server.ts</code></td>
            </tr>
            <tr>
              <td><strong>2</strong></td>
              <td><strong>Middlewares Globales</strong></td>
              <td>CORS, parseo de JSON en body, cookies y creación del <code>RequestContext</code> de MikroORM.</td>
              <td><code>app.ts</code></td>
            </tr>
            <tr>
              <td><strong>3</strong></td>
              <td><strong>Enrutador (Router)</strong></td>
              <td>Mapea el prefijo de URL (ej: <code>/api/metahumanos</code>) hacia el archivo de rutas correspondiente.</td>
              <td><code>app.ts</code> → <code>metahumano.routes.ts</code></td>
            </tr>
            <tr>
              <td><strong>4</strong></td>
              <td><strong>Middlewares de Ruta</strong></td>
              <td>Autenticación (<code>requireAuth</code>), roles (<code>requireRoles</code>) y sanitización (<code>sanitizeMetahumanoInput</code>).</td>
              <td><code>auth.middleware.ts</code></td>
            </tr>
            <tr>
              <td><strong>5</strong></td>
              <td><strong>Controlador (Controller)</strong></td>
              <td>Aplica las reglas de negocio, consulta al ORM y prepara la respuesta JSON.</td>
              <td><code>metahumano.controller.ts</code></td>
            </tr>
            <tr>
              <td><strong>6</strong></td>
              <td><strong>EntityManager (ORM)</strong></td>
              <td>Traduce operaciones de objetos en consultas SQL (SELECT, INSERT, UPDATE, DELETE) seguras.</td>
              <td><code>orm.ts</code> / MySQL</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="section-home-orm">Conceptos Clave de MikroORM que Debes Dominar</h2>
      
      <div className="breakdown-box">
        <div className="breakdown-header">
          <span className="breakdown-title">Patrones Arquitectónicos de MikroORM</span>
          <div className="tabs-nav">
            <button 
              className={`tab-btn ${activeTab === 'em' ? 'active' : ''}`}
              onClick={() => setActiveTab('em')}
            >
              EntityManager (em)
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reqctx' ? 'active' : ''}`}
              onClick={() => setActiveTab('reqctx')}
            >
              RequestContext
            </button>
            <button 
              className={`tab-btn ${activeTab === 'sti' ? 'active' : ''}`}
              onClick={() => setActiveTab('sti')}
            >
              Herencia (STI)
            </button>
          </div>
        </div>

        {activeTab === 'em' && (
          <div className="tab-content active">
            <h4>¿Qué es el EntityManager?</h4>
            <p>Es el objeto central con el que interactuamos para leer y escribir en la base de datos. Funciona bajo el patrón <strong>Unit of Work</strong> (Unidad de Trabajo):</p>
            <ul>
              <li><code>em.find(Entidad, filtro, opciones)</code>: Trae múltiples registros coincidentes.</li>
              <li><code>em.findOne(Entidad, filtro)</code>: Trae un único registro o <code>null</code> si no existe.</li>
              <li><code>em.findOneOrFail(Entidad, filtro)</code>: Trae un registro y si no existe lanza una excepción inmediata.</li>
              <li><code>em.create(Entidad, datos)</code>: Crea una nueva instancia de la clase en memoria.</li>
              <li><code>em.assign(entidadExistente, datos)</code>: Sobrescribe propiedades en un objeto cargado.</li>
              <li><code>em.persistAndFlush(entidad)</code>: Marca el objeto y envía inmediatamente la consulta INSERT/UPDATE a SQL.</li>
              <li><code>em.flush()</code>: Sincroniza todos los cambios pendientes en una sola transacción.</li>
              <li><code>em.clear()</code>: Limpia la memoria caché (Identity Map) del EntityManager.</li>
            </ul>
          </div>
        )}

        {activeTab === 'reqctx' && (
          <div className="tab-content active">
            <h4>¿Por qué usamos RequestContext en app.ts?</h4>
            <p>
              Node.js es asíncrono y atiende cientos de peticiones de usuarios concurrentemente en el mismo proceso.
              Si todos usaran el mismo <code>EntityManager</code> global, los datos en memoria de una petición podrían mezclarse con otra.
            </p>
            <Callout type="tip" title="Aislamiento por Petición">
              <p>
                <code>RequestContext.create(orm.em, next)</code> crea un EntityManager <em>forkeado</em> y aislado para cada llamada HTTP entrante. Así, cada usuario tiene su propia memoria sin interferir con los demás.
              </p>
            </Callout>
          </div>
        )}

        {activeTab === 'sti' && (
          <div className="tab-content active">
            <h4>Herencia de Tabla Única (Single Table Inheritance)</h4>
            <p>
              En la base de datos solo existe una tabla llamada <code>metahumano</code>, pero en TypeScript tenemos tres clases: <code>Metahumano</code> (padre), <code>Heroe</code> (hija) y <code>Villano</code> (hija).
            </p>
            <p>
              MikroORM utiliza una columna discriminadora <code>tipo_meta</code>:
            </p>
            <ul>
              <li>Si <code>tipo_meta = 'heroe'</code> → MikroORM instancia un objeto de clase <code>Heroe</code> (con campos como <code>nivelFama</code>, <code>numeroVictorias</code>).</li>
              <li>Si <code>tipo_meta = 'villano'</code> → Instancia la clase <code>Villano</code> (con <code>nivelPeligrosidad</code>, <code>recompensa</code>).</li>
              <li>Si <code>tipo_meta = 'metahumano'</code> → Instancia la clase base genérica.</li>
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button 
          onClick={() => {
            setActiveView('metahumano-controller');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{
            backgroundColor: 'var(--accent-color)',
            color: '#fff',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer'
          }}
        >
          Comenzar con el Estudio del Controlador de Metahumanos →
        </button>
      </div>
    </div>
  );
}
