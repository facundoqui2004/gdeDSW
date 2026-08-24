import React, { useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import Callout from '../components/Callout';
import ApiTester from '../components/ApiTester';
import Quiz from '../components/Quiz';
import FlowSimulator from '../components/FlowSimulator';

export default function MetahumanoControllerView() {
  const [crudTab, setCrudTab] = useState('findall');

  const quizQuestions = [
    {
      question: '1. ¿Por qué se utiliza em.getReference(Metahumano, id) en la función remove?',
      options: [
        { text: 'Porque valida primero que el metahumano no tenga superpoderes.', correct: false },
        { text: 'Porque crea una referencia liviana sin hacer una consulta SELECT previa, haciendo el borrado más eficiente.', correct: true },
        { text: 'Porque es el único método permitido por Express para borrar datos.', correct: false }
      ],
      explanation: 'em.getReference() evita hacer un SELECT a la base de datos cuando solo necesitamos el ID para ejecutar la sentencia SQL DELETE.'
    },
    {
      question: '2. En definirEstiloVida, ¿por qué es obligatorio llamar a em.clear() tras ejecutar la sentencia SQL nativa?',
      options: [
        { text: 'Para borrar todos los metahumanos de la base de datos.', correct: false },
        { text: 'Para cerrar la conexión con el servidor MySQL.', correct: false },
        { text: 'Para invalidar el Identity Map (caché en memoria) y permitir que MikroORM recargue la entidad con su nueva clase específica (Heroe o Villano).', correct: true }
      ],
      explanation: 'Como el discriminador tipo_meta se modificó directamente por SQL, el ORM todavía tendría en caché el objeto viejo como Metahumano genérico a menos que limpiemos la memoria con em.clear().'
    },
    {
      question: '3. ¿Qué hace la notación populate: [\'usuario\', \'poderes.poder\'] en findAll?',
      options: [
        { text: 'Carga los datos del Usuario y navega dos niveles en la relación (desde MetaPoder hacia el detalle del Poder).', correct: true },
        { text: 'Crea nuevos poderes aleatorios para todos los metahumanos.', correct: false },
        { text: 'Elimina los poderes duplicados en la base de datos.', correct: false }
      ],
      explanation: 'La notación de punto permite que MikroORM realice los JOINs necesarios para traer entidades anidadas a través de tablas intermedias.'
    }
  ];

  return (
    <div className="doc-section">
      <h1>Controlador de Metahumanos (metahumano.controller.ts)</h1>
      <p className="page-lead">
        Análisis exhaustivo, línea por línea y función por función del controlador central de Metahumanos. Aprenderemos cómo se reciben los datos, se validan las reglas de negocio y se persiste la información con MikroORM.
      </p>

      <Callout type="tip" title="📂 Ubicación en el Proyecto">
        <p>
          Archivo: <code>Backend/src/metahumano/metahumano.controller.ts</code><br />
          Rutas asociadas: <code>Backend/src/metahumano/metahumano.routes.ts</code> (Mapeadas bajo el prefijo <code>/api/metahumanos</code>).
        </p>
      </Callout>

      {/* 1. DEPENDENCIAS E IMPORTS */}
      <h2 id="sec-imports">1. Gestión de Dependencias e Importaciones</h2>
      <p>
        Al inicio del archivo, se importan los tipos de Express, las entidades del dominio, la instancia del ORM y los tipos de autenticación.
      </p>

      <CodeBlock 
        title="metahumano.controller.ts (Líneas 1-13)"
        language="TypeScript"
        code={`import { Request, Response, NextFunction } from 'express'
import { Metahumano } from './metahumano.entity.js'
import { Heroe } from '../heroe/heroe.entity.js'
import { Villano } from '../villano/villano.entity.js'
import { Usuario } from '../auth/usuario.entity.js'
import { orm } from '../shared/db/orm.js'
import { Carpeta } from '../carpeta/carpeta.entity.js'
import { MetaPoder } from '../metaPoder/metaPoder.entity.js'
import { Poder } from '../poder/poder.entity.js'
import { Multa } from '../Multas/Multa.entity.js'
import { AuthedRequest } from '../auth/auth.middleware.js'

const em = orm.em`}
      />

      <div className="breakdown-box">
        <div className="breakdown-header">
          <span className="breakdown-title">Desglose Detallado de las Importaciones</span>
        </div>
        <div className="tab-content active">
          <ul className="step-list">
            <li className="step-item">
              <span className="step-badge">1</span>
              <h5><code>Request, Response, NextFunction</code> (Express)</h5>
              <p>
                Son las tres interfaces clave de Express: <strong><code>req</code></strong> contiene los datos entrantes (cuerpo JSON, parámetros de URL, headers); <strong><code>res</code></strong> provee métodos para enviar la respuesta HTTP (<code>res.status(200).json(...)</code>); <strong><code>next</code></strong> delega la ejecución al siguiente middleware en la cadena.
              </p>
            </li>
            <li className="step-item">
              <span className="step-badge">2</span>
              <h5>Entidades de Base de Datos (<code>Metahumano, Heroe, Villano, Usuario, etc.</code>)</h5>
              <p>
                En MikroORM, cada entidad es una clase de TypeScript mapeada a una tabla SQL. <code>Heroe</code> y <code>Villano</code> extienden de <code>Metahumano</code> implementando polimorfismo.
              </p>
            </li>
            <li className="step-item">
              <span className="step-badge">3</span>
              <h5><code>AuthedRequest</code> (Middleware de Auth)</h5>
              <p>
                Interfaz personalizada que extiende <code>Request</code> agregando <code>usuarioId</code>, <code>role</code> y <code>perfilId</code> extraídos tras validar el token JWT.
              </p>
            </li>
            <li className="step-item">
              <span className="step-badge">4</span>
              <h5><code>const em = orm.em</code></h5>
              <p>
                Crea una referencia rápida al <strong>EntityManager</strong> central para ejecutar consultas como <code>find</code>, <code>create</code>, <code>flush</code> y <code>remove</code>.
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. MIDDLEWARE DE SANITIZACIÓN */}
      <h2 id="sec-sanitize">2. Middleware de Sanitización: <code>sanitizeMetahumanoInput</code></h2>
      <p>
        Este middleware actúa como un <strong>filtro de seguridad y consistencia</strong>. Limpia el <code>req.body</code> para asegurar que solo los campos válidos sean procesados, transformando tipos de datos y eliminando claves <code>undefined</code>.
      </p>

      <CodeBlock 
        title="metahumano.controller.ts (Líneas 15-34)"
        language="TypeScript"
        code={`function sanitizeMetahumanoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    alias: req.body.alias,
    origen: req.body.origen,
    tipoMeta: req.body.tipoMeta,
    usuarioId: req.body.usuarioId,
    latitud: req.body.latitud !== undefined && req.body.latitud !== null ? Number(req.body.latitud) : undefined,
    longitud: req.body.longitud !== undefined && req.body.longitud !== null ? Number(req.body.longitud) : undefined
  }

  // Eliminar claves undefined
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}`}
      />

      <Callout type="deep-dive" title="🔍 Análisis de Conceptos en esta Función:">
        <ul>
          <li><strong>Operador Ternario (<code>condición ? true : false</code>):</strong> Convierte los strings de coordenadas geográficas en números válidos usando <code>Number()</code>, o los deja como <code>undefined</code> si no se enviaron.</li>
          <li><strong>Limpieza de claves con <code>delete</code>:</strong> Si una propiedad tiene valor <code>undefined</code>, se elimina del objeto. Esto evita que MikroORM intente sobrescribir valores existentes en la base de datos con <code>undefined</code> en operaciones de actualización (UPDATE).</li>
          <li><strong>Llamada a <code>next()</code>:</strong> Imprescindible. Si no se llama a <code>next()</code>, la petición queda congelada y el cliente nunca recibe respuesta.</li>
        </ul>
      </Callout>

      {/* 3. CREACIÓN DE PERFILES */}
      <h2 id="sec-registro">3. Creación de Perfiles: <code>crearPerfilMetahumano</code></h2>
      <p>
        Esta función registra un nuevo perfil en el sistema asociándolo a un usuario existente, decidiendo dinámicamente si el registro instanciará una entidad <strong>Heroe</strong>, <strong>Villano</strong> o <strong>Metahumano</strong> genérico.
      </p>

      <CodeBlock 
        title="metahumano.controller.ts (Líneas 36-125)"
        language="TypeScript"
        code={`async function crearPerfilMetahumano(req: Request, res: Response) {
  try {
    const { usuarioId, nombre, alias, origen, tipoMeta } = req.body

    // 1. Validaciones básicas de campos obligatorios
    if (!usuarioId || !nombre || !alias || !origen) {
      return res.status(400).json({ 
        message: 'Campos requeridos: usuarioId, nombre, alias, origen' 
      })
    }

    // 2. Verificar que el usuario existe y no tiene ya un perfil
    const usuario = await em.findOne(Usuario, { id: usuarioId }, { populate: ['metahumano', 'burocrata'] })
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (usuario.metahumano) {
      return res.status(400).json({ message: 'El usuario ya tiene un perfil de metahumano' })
    }

    if (usuario.burocrata) {
      return res.status(400).json({ message: 'El usuario ya tiene un perfil de burócrata' })
    }

    if (usuario.role !== 'METAHUMANO') {
      return res.status(400).json({ message: 'El usuario debe tener role METAHUMANO' })
    }

    // 3. Instanciar subtipo según tipoMeta
    let metahumano: Metahumano
    const tipo = (tipoMeta || '').toUpperCase()
    const lat = req.body.latitud !== undefined && req.body.latitud !== null ? Number(req.body.latitud) : undefined
    const lng = req.body.longitud !== undefined && req.body.longitud !== null ? Number(req.body.longitud) : undefined

    if (tipo === 'HEROE' || tipo === 'HERÓE') {
      metahumano = em.create(Heroe, {
        nombre,
        alias,
        origen,
        nivelFama: req.body.nivelFama || 'Bajo',
        estatus: req.body.estatus || 'activo',
        numeroVictorias: req.body.numeroVictorias || 0,
        usuario: usuario,
        latitud: lat,
        longitud: lng
      } as any)
    } else if (tipo === 'VILLANO') {
      metahumano = em.create(Villano, {
        nombre,
        alias,
        origen,
        nivelPeligrosidad: req.body.nivelPeligrosidad || 'Baja',
        estado: req.body.estado || 'activo',
        recompensa: req.body.recompensa || 0,
        usuario: usuario,
        latitud: lat,
        longitud: lng
      } as any)
    } else {
      metahumano = em.create(Metahumano, {
        nombre,
        alias,
        origen,
        usuario: usuario,
        latitud: lat,
        longitud: lng
      } as any)
    }

    // 4. Persistir en la base de datos
    await em.persistAndFlush(metahumano)

    // 5. Responder con código 201 (Created)
    res.status(201).json({
      message: 'Perfil de metahumano creado exitosamente',
      data: {
        id: metahumano.id,
        nombre: metahumano.nombre,
        alias: metahumano.alias,
        origen: metahumano.origen,
        tipoMeta: metahumano.tipoMeta,
        usuarioId: usuario.id,
        email: usuario.email,
        telefono: usuario.telefono
      }
    })
  } catch (error: any) {
    console.error('Error al crear perfil de metahumano:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}`}
      />

      <Callout type="tip" title="Reglas de Negocio Verificadas:">
        <ol>
          <li><strong>Presencia de datos:</strong> Si falta <code>usuarioId</code>, <code>nombre</code>, <code>alias</code> u <code>origen</code>, retorna <strong>400 Bad Request</strong>.</li>
          <li><strong>Existencia del Usuario:</strong> Si el usuario no existe en la BD, retorna <strong>404 Not Found</strong>.</li>
          <li><strong>Unicidad de Perfil:</strong> Si el usuario ya posee un perfil de metahumano o de burócrata, se rechaza la creación (<strong>400</strong>).</li>
          <li><strong>Rol del Usuario:</strong> El usuario debe tener estrictamente <code>role: 'METAHUMANO'</code> en la tabla de autenticación.</li>
          <li><strong>Polimorfismo:</strong> Según el valor de <code>tipoMeta</code>, se ejecuta <code>em.create(Heroe, ...)</code> o <code>em.create(Villano, ...)</code>, guardando los atributos especializados de cada facción.</li>
        </ol>
      </Callout>

      <FlowSimulator
        title="crearPerfilMetahumano — Flujo Interactivo"
        scenarios={[
          {
            id: 'success',
            label: '✅ Registro exitoso',
            color: 'success',
            input: { nombre: 'Barry Allen', alias: 'Flash', origen: 'Central City', usuarioId: 5 },
            steps: [
              { line: 'L1-3', desc: 'Recibe req.body con nombre, alias, origen, usuarioId', type: 'info' },
              { line: 'L4', desc: 'em.findOneOrFail(Usuario, { id: 5 }) — busca el usuario en MySQL', type: 'query' },
              { line: 'L5', desc: 'Usuario encontrado: { id: 5, role: METAHUMANO }', type: 'success' },
              { line: 'L6', desc: 'Verifica: usuario.role === METAHUMANO ✔ y metahumano no tiene perfil previo ✔', type: 'check' },
              { line: 'L7', desc: 'em.create(Metahumano, sanitizedInput) — crea objeto en memoria (sin SQL)', type: 'create' },
              { line: 'L8', desc: 'em.flush() — ejecuta INSERT INTO metahumano (...) en MySQL', type: 'db' },
              { line: 'L9', desc: 'Responde 201 Created con el metahumano persistido', type: 'success' },
            ],
            response: { status: 201, body: { message: 'Metahumano creado', data: { id: 42, nombre: 'Barry Allen', alias: 'Flash', tipoMeta: 'metahumano' } } }
          },
          {
            id: 'already_exists',
            label: '⚠️ Ya tiene perfil',
            color: 'warning',
            input: { nombre: 'Bruce Wayne', alias: 'Batman', origen: 'Gotham', usuarioId: 3 },
            steps: [
              { line: 'L1-3', desc: 'Recibe req.body', type: 'info' },
              { line: 'L4', desc: 'em.findOneOrFail(Usuario, { id: 3 }) — busca el usuario', type: 'query' },
              { line: 'L5', desc: 'Usuario encontrado: tiene metahumano con tipoMeta = heroe', type: 'success' },
              { line: 'L6', desc: 'Verifica: ¿tipoMeta !== metahumano? SÍ — ya es HEROE, no se puede crear otro perfil', type: 'check' },
              { line: 'L-err', desc: 'Lanza NotFoundError / responde 400: Tu estilo de vida ya está definido', type: 'error' },
            ],
            response: { status: 400, body: { message: 'Tu estilo de vida ya está definido' } }
          },
          {
            id: 'wrong_role',
            label: '🔴 Role incorrecto',
            color: 'danger',
            input: { nombre: 'Clark Kent', alias: 'Reportero', origen: 'Metrópolis', usuarioId: 7 },
            steps: [
              { line: 'L1-3', desc: 'Recibe req.body', type: 'info' },
              { line: 'L4', desc: 'em.findOneOrFail(Usuario, { id: 7 }) — busca el usuario', type: 'query' },
              { line: 'L5', desc: 'Usuario encontrado: role = BUROCRATA', type: 'success' },
              { line: 'L6', desc: 'Verifica: ¿usuario.role !== METAHUMANO? SÍ — es BUROCRATA, no permitido', type: 'check' },
              { line: 'L-err', desc: 'Responde 400: El usuario no tiene rol de metahumano', type: 'error' },
            ],
            response: { status: 400, body: { message: 'El usuario no tiene rol de metahumano' } }
          }
        ]}
      />

      {/* 4. OPERACIONES CRUD BÁSICAS */}
      <h2 id="sec-crud">4. Operaciones CRUD Esenciales</h2>
      <p>
        El controlador expone los 5 métodos estándar de una API REST para lectura, creación genérica, actualización y eliminación de metahumanos.
      </p>

      <div className="breakdown-box">
        <div className="breakdown-header">
          <span className="breakdown-title">Las 5 Funciones CRUD en Detalle</span>
          <div className="tabs-nav">
            <button className={`tab-btn ${crudTab === 'findall' ? 'active' : ''}`} onClick={() => setCrudTab('findall')}>findAll</button>
            <button className={`tab-btn ${crudTab === 'findone' ? 'active' : ''}`} onClick={() => setCrudTab('findone')}>findOne</button>
            <button className={`tab-btn ${crudTab === 'add' ? 'active' : ''}`} onClick={() => setCrudTab('add')}>add</button>
            <button className={`tab-btn ${crudTab === 'update' ? 'active' : ''}`} onClick={() => setCrudTab('update')}>update</button>
            <button className={`tab-btn ${crudTab === 'remove' ? 'active' : ''}`} onClick={() => setCrudTab('remove')}>remove</button>
          </div>
        </div>

        {crudTab === 'findall' && (
          <div className="tab-content active">
            <CodeBlock 
              title="findAll"
              language="TypeScript"
              code={`async function findAll(req: Request, res: Response) {
  try {
    const metahumanos = await em.find(Metahumano, {}, {
      populate: ['usuario', 'poderes.poder'], 
    })
    res.status(200).json({ message: 'found all metahumanos', data: metahumanos })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}`}
            />
            <h4>Explicación:</h4>
            <ul>
              <li><code>em.find(Metahumano, {})</code>: Busca todas las filas de la tabla sin filtros (segundo parámetro <code>{}</code> vacío).</li>
              <li><code>populate: ['usuario', 'poderes.poder']</code>: Carga mediante <strong>JOIN</strong> las relaciones. La notación de punto <code>'poderes.poder'</code> es una <em>relación anidada</em>: va desde <code>Metahumano</code> hacia la tabla intermedia <code>MetaPoder</code> y de ahí al detalle del <code>Poder</code>.</li>
            </ul>
          </div>
        )}

        {crudTab === 'findone' && (
          <div className="tab-content active">
            <CodeBlock 
              title="findOne"
              language="TypeScript"
              code={`async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const metahumano = await em.findOneOrFail(Metahumano, { id }, {
      populate: ['usuario', 'poderes.poder'],
    })
    res.status(200).json({ message: 'found metahumano', data: metahumano })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}`}
            />
            <h4>Explicación:</h4>
            <ul>
              <li><code>req.params.id</code>: Captura el parámetro dinámico de la URL (ej: <code>/api/metahumanos/5</code> → <code>"5"</code>).</li>
              <li><code>Number.parseInt(...)</code>: Convierte el string a número entero.</li>
              <li><code>findOneOrFail</code>: Si el ID no existe en la base de datos, arroja una excepción automática (<code>NotFoundError</code>) que salta al bloque <code>catch</code>.</li>
            </ul>
          </div>
        )}

        {crudTab === 'add' && (
          <div className="tab-content active">
            <CodeBlock 
              title="add"
              language="TypeScript"
              code={`async function add(req: Request, res: Response) {
  try {
    const metahumano = em.create(Metahumano, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'metahumano created', data: metahumano })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}`}
            />
            <h4>Explicación:</h4>
            <p>
              Crea un metahumano genérico usando los datos previamente filtrados por <code>sanitizeMetahumanoInput</code> y ejecuta <code>em.flush()</code> para hacer el INSERT en SQL.
            </p>
          </div>
        )}

        {crudTab === 'update' && (
          <div className="tab-content active">
            <CodeBlock 
              title="update"
              language="TypeScript"
              code={`async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const metahumanoToUpdate = await em.findOneOrFail(Metahumano, { id })
    em.assign(metahumanoToUpdate, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'metahumano updated', data: metahumanoToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}`}
            />
            <h4>Explicación:</h4>
            <ul>
              <li><code>em.assign(entidad, nuevosDatos)</code>: Fusión inteligente de objetos. Copia solo los campos que vienen en <code>sanitizedInput</code> hacia la entidad cargada en memoria.</li>
              <li><code>em.flush()</code>: Detecta automáticamente cuáles campos cambiaron (Dirty Checking) y ejecuta un <code>UPDATE</code> optimizado.</li>
            </ul>
          </div>
        )}

        {crudTab === 'remove' && (
          <div className="tab-content active">
            <CodeBlock 
              title="remove"
              language="TypeScript"
              code={`async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const metahumano = em.getReference(Metahumano, id)
    await em.removeAndFlush(metahumano)
    res.status(200).json({ message: 'metahumano deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}`}
            />
            <Callout type="tip" title="⚡ Optimización con em.getReference">
              <p>
                A diferencia de <code>findOne</code>, <code>em.getReference()</code> <strong>NO hace una consulta SELECT</strong> a la base de datos. Solo crea una referencia ligera con el <code>id</code>. Luego <code>removeAndFlush()</code> ejecuta el <code>DELETE FROM metahumano WHERE id = ?</code> directamente, ahorrando una consulta completa.
              </p>
            </Callout>
          </div>
        )}
      </div>

      {/* 5. GESTIÓN DE HABILIDADES Y PODERES */}
      <h2 id="sec-poderes">5. Gestión de Habilidades: <code>actualizarPoderesMetahumano</code></h2>
      <p>
        Administra la relación <strong>Muchos a Muchos con Atributos Adicionales</strong> entre <code>Metahumano</code> y <code>Poder</code> mediante la entidad pivote <code>MetaPoder</code> (que guarda dominio, nivel de control y certificado).
      </p>

      <CodeBlock 
        title="metahumano.controller.ts (Líneas 187-250)"
        language="TypeScript"
        code={`async function actualizarPoderesMetahumano(req: Request, res: Response) {
  try {
    const authedReq = req as AuthedRequest
    const metahumanoId = authedReq.perfilId

    if (!metahumanoId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil de metahumano asociado' })
    }

    const { poderId, dominio, nivelControl, estado, certificado } = req.body

    if (!poderId || !dominio) {
      return res.status(400).json({ message: 'Campos requeridos: poderId, dominio' })
    }

    // 1. Verificar que el poder exista
    const poder = await em.findOne(Poder, { id: poderId })
    if (!poder) {
      return res.status(404).json({ message: 'Poder no encontrado' })
    }

    // 2. Cargar metahumano con su colección de poderes
    const metahumano = await em.findOneOrFail(Metahumano, { id: metahumanoId }, { populate: ['poderes'] })

    // 3. Patrón UPSERT: ¿Ya tiene este metapoder asignado?
    let metaPoder = await em.findOne(MetaPoder, { metahumano: metahumanoId, poder: poderId })

    if (metaPoder) {
      // Actualizar existente
      metaPoder.dominio = dominio
      if (nivelControl !== undefined) metaPoder.nivelControl = nivelControl
      if (estado !== undefined) metaPoder.estado = estado
      if (certificado !== undefined) metaPoder.certificado = certificado
    } else {
      // Crear nuevo metapoder y vincularlo a la colección
      metaPoder = em.create(MetaPoder, {
        metahumano,
        poder,
        dominio,
        nivelControl: nivelControl || 1,
        estado: estado || 'ACTIVO',
        certificado: certificado || '',
        fechaAdquisicion: new Date()
      })
      metahumano.poderes.add(metaPoder)
    }

    await em.flush()

    res.status(200).json({
      message: 'Habilidades/poderes del metahumano actualizados exitosamente',
      data: {
        id: metaPoder.id,
        poderId: poder.id,
        nomPoder: poder.nomPoder,
        dominio: metaPoder.dominio,
        nivelControl: metaPoder.nivelControl,
        estado: metaPoder.estado
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}`}
      />

      <Callout type="note" title="💡 Patrón UPSERT (Update or Insert)">
        <p>
          Esta función verifica si ya existe una fila de <code>MetaPoder</code> para el par <code>(metahumanoId, poderId)</code>.
          Si existe, la <strong>actualiza</strong>; si no existe, la <strong>crea</strong> y la vincula con <code>metahumano.poderes.add(metaPoder)</code>.
        </p>
      </Callout>

      {/* 6. ORQUESTACIÓN DE NOTIFICACIONES */}
      <h2 id="sec-notificaciones">6. Orquestación de Notificaciones: <code>obtenerNotificacionesMetahumano</code></h2>
      <p>
        Recupera todos los avisos del metahumano: sus <strong>trámites y expedientes</strong> (Carpetas) y sus <strong>multas pendientes</strong> a través de 3 niveles de relación.
      </p>

      <CodeBlock 
        title="metahumano.controller.ts (Líneas 252-298)"
        language="TypeScript"
        code={`async function obtenerNotificacionesMetahumano(req: Request, res: Response) {
  try {
    const authedReq = req as AuthedRequest
    const metahumanoId = authedReq.perfilId

    if (!metahumanoId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil de metahumano asociado' })
    }

    // 1. Obtener carpetas (trámites de este metahumano)
    const carpetas = await em.find(Carpeta, { metahumano: { id: metahumanoId } })

    // 2. Obtener multas: Multa -> Evidencia -> Carpeta -> Metahumano (3 niveles de profundidad)
    const multas = await em.find(
      Multa,
      {
        evidencia: {
          carpeta: {
            metahumano: { id: metahumanoId }
          }
        }
      },
      { populate: ['evidencia.carpeta'] }
    )

    res.status(200).json({
      message: 'Notificaciones obtenidas correctamente',
      data: {
        tramitesPendientes: carpetas.map(c => ({
          id: c.id,
          descripcion: c.descripcion,
          estado: c.estado,
          tipo: c.tipo
        })),
        multasAlertas: multas.map(m => ({
          id: m.id,
          motivoMulta: m.motivoMulta,
          montoMulta: m.montoMulta,
          fechaVencimiento: m.fechaVencimiento,
          estado: m.estado
        }))
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}`}
      />

      {/* 7. EVOLUCIÓN DE ESTILO DE VIDA */}
      <h2 id="sec-estilo">7. Evolución del Estilo de Vida: <code>definirEstiloVida</code></h2>
      <p>
        Es la función más avanzada del archivo. Convierte definitivamente a un Metahumano genérico en <strong>Héroe</strong> o <strong>Villano</strong>. Dado que cambiar la clase de una fila en tiempo de ejecución es complejo para los ORMs, combina una sentencia SQL nativa con la limpieza de caché <code>em.clear()</code>.
      </p>

      <CodeBlock 
        title="metahumano.controller.ts (Líneas 300-383)"
        language="TypeScript"
        code={`async function definirEstiloVida(req: Request, res: Response) {
  try {
    const authedReq = req as AuthedRequest
    const metahumanoId = authedReq.perfilId

    if (!metahumanoId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil de metahumano asociado' })
    }

    const { tipoMeta } = req.body
    if (!tipoMeta) {
      return res.status(400).json({ message: 'El campo tipoMeta es requerido (HEROE o VILLANO)' })
    }

    const tipo = tipoMeta.toUpperCase()
    if (tipo !== 'HEROE' && tipo !== 'HERÓE' && tipo !== 'VILLANO') {
      return res.status(400).json({ message: 'tipoMeta inválido. Debe ser HEROE o VILLANO' })
    }

    // 1. Buscar metahumano y validar que no tenga ya un bando
    const metahumano = await em.findOne(Metahumano, { id: metahumanoId })
    if (!metahumano) {
      return res.status(404).json({ message: 'Perfil de metahumano no encontrado' })
    }

    if (metahumano.tipoMeta !== 'metahumano') {
      return res.status(400).json({ 
        message: \`Tu estilo de vida ya está definido como \${metahumano.tipoMeta.toUpperCase()}. No se puede cambiar.\` 
      })
    }

    const connection = em.getConnection()

    if (tipo === 'HEROE' || tipo === 'HERÓE') {
      const nivelFama = req.body.nivelFama || 'Bajo'
      const estatus = req.body.estatus || 'activo'
      const numeroVictorias = req.body.numeroVictorias || 0
      const mision = req.body.mision || ''

      await connection.execute(
        'UPDATE metahumano SET tipo_meta = ?, nivel_fama = ?, estatus = ?, numero_victorias = ?, mision = ? WHERE id = ?',
        ['heroe', nivelFama, estatus, numeroVictorias, mision, metahumanoId]
      )
    } else {
      const nivelPeligrosidad = req.body.nivelPeligrosidad || 'Baja'
      const estado = req.body.estado || 'activo'
      const motivacion = req.body.motivacion || ''

      // Calcular recompensa sumando multas impagas
      const multas = await em.find(Multa, {
        evidencia: { carpeta: { metahumano: { id: metahumanoId } } }
      })

      const unpaidMultas = multas.filter(m => m.estado !== 'PAGADA' && m.estado !== 'RECHAZADA')
      const recompensa = unpaidMultas.reduce((acc, m) => acc + (m.montoMulta || 0), 0)

      await connection.execute(
        'UPDATE metahumano SET tipo_meta = ?, nivel_peligrosidad = ?, estado = ?, recompensa = ?, motivacion = ? WHERE id = ?',
        ['villano', nivelPeligrosidad, estado, recompensa, motivacion, metahumanoId]
      )
    }

    // 2. Limpiar el Identity Map para forzar recarga limpia
    em.clear()

    // 3. Recargar la entidad ahora con su nueva clase específica (Heroe o Villano)
    const entityClass = (tipo === 'HEROE' || tipo === 'HERÓE') ? Heroe : Villano
    const updatedMeta = await em.findOneOrFail(entityClass as any, { id: metahumanoId } as any, { populate: ['usuario'] } as any)

    res.status(200).json({
      message: \`Estilo de vida definido como \${tipo} exitosamente\`,
      data: updatedMeta
    })
  } catch (error: any) {
    console.error('Error al definir estilo de vida:', error)
    res.status(500).json({ message: error.message || 'Error interno del servidor' })
  }
}`}
      />

      <Callout type="warn" title="⚠️ ¿Por qué es obligatorio em.clear()?">
        <p>
          MikroORM tiene un <strong>Identity Map</strong> (caché en memoria de objetos ya cargados).
          Al inicio de la función cargamos al registro como un objeto de tipo <code>Metahumano</code> genérico.
          Luego modificamos la columna <code>tipo_meta</code> directamente en SQL con <code>connection.execute</code>.
          Si no llamamos a <code>em.clear()</code>, la siguiente consulta devolvería el objeto viejo de la caché sin sus nuevos campos de <code>Heroe</code> o <code>Villano</code>.
        </p>
      </Callout>

      <FlowSimulator
        title="definirEstiloVida — Flujo Interactivo"
        scenarios={[
          {
            id: 'become_heroe',
            label: '🦸 Se convierte en Héroe',
            color: 'success',
            input: { tipo: 'heroe', nivelFama: 'Alto', mision: 'Proteger Central City', numeroVictorias: 0 },
            steps: [
              { line: 'L1', desc: 'Lee req.tokenPayload — extrae perfilId = 42 del JWT', type: 'info' },
              { line: 'L2', desc: 'em.findOneOrFail(Metahumano, { id: 42 }) — busca el perfil base', type: 'query' },
              { line: 'L3', desc: 'metahumano.tipoMeta === metahumano ✔ — puede definir su bando', type: 'check' },
              { line: 'L4', desc: 'tipo = heroe → em.create(Heroe, { nivelFama: Alto, mision: ... })', type: 'create' },
              { line: 'L5', desc: 'Copia campos heredados: nombre, alias, origen, usuario, carpetas, poderes', type: 'info' },
              { line: 'L6', desc: 'em.removeAndFlush(metahumanoOriginal) — DELETE FROM metahumano WHERE id=42', type: 'db' },
              { line: 'L7', desc: 'em.persistAndFlush(heroe) — INSERT INTO metahumano (tipo_meta=heroe, ...)', type: 'db' },
              { line: 'L8', desc: 'Responde 201 con el nuevo Héroe', type: 'success' },
            ],
            response: { status: 201, body: { message: 'Estilo de vida definido', data: { id: 43, tipoMeta: 'heroe', nivelFama: 'Alto', mision: 'Proteger Central City' } } }
          },
          {
            id: 'become_villano',
            label: '🦹 Se convierte en Villano',
            color: 'warning',
            input: { tipo: 'villano', nivelPeligrosidad: 'Extremo', motivacion: 'Dominar el mundo', recompensa: 500000 },
            steps: [
              { line: 'L1', desc: 'Lee req.tokenPayload — extrae perfilId = 42 del JWT', type: 'info' },
              { line: 'L2', desc: 'em.findOneOrFail(Metahumano, { id: 42 }) — busca el perfil base', type: 'query' },
              { line: 'L3', desc: 'metahumano.tipoMeta === metahumano ✔ — puede definir su bando', type: 'check' },
              { line: 'L4', desc: 'tipo = villano → em.create(Villano, { nivelPeligrosidad: Extremo, ... })', type: 'create' },
              { line: 'L5', desc: 'Copia campos heredados del metahumano original', type: 'info' },
              { line: 'L6', desc: 'em.removeAndFlush(metahumanoOriginal) — DELETE del metahumano genérico', type: 'db' },
              { line: 'L7', desc: 'em.persistAndFlush(villano) — INSERT con tipo_meta=villano', type: 'db' },
              { line: 'L8', desc: 'Responde 201 con el nuevo Villano', type: 'success' },
            ],
            response: { status: 201, body: { message: 'Estilo de vida definido', data: { id: 44, tipoMeta: 'villano', nivelPeligrosidad: 'Extremo', recompensa: 500000 } } }
          },
          {
            id: 'already_defined',
            label: '⚠️ Bando ya definido',
            color: 'danger',
            input: { tipo: 'heroe' },
            steps: [
              { line: 'L1', desc: 'Lee req.tokenPayload — extrae perfilId = 42', type: 'info' },
              { line: 'L2', desc: 'em.findOneOrFail(Metahumano, { id: 42 }) — busca el perfil', type: 'query' },
              { line: 'L3', desc: 'metahumano.tipoMeta = heroe — ya tiene bando definido', type: 'check' },
              { line: 'L-err', desc: 'Responde 400: Tu estilo de vida ya está definido', type: 'error' },
            ],
            response: { status: 400, body: { message: 'Tu estilo de vida ya está definido' } }
          }
        ]}
      />

      {/* 8. RUTAS Y MIDDLEWARES */}
      <h2 id="sec-routes">8. Conexión de Rutas: <code>metahumano.routes.ts</code></h2>
      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Método</th>
              <th>Ruta</th>
              <th>Middlewares</th>
              <th>Controlador Destino</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="http-badge badge-get">GET</span></td>
              <td><code>/api/metahumanos/</code></td>
              <td>Ninguno</td>
              <td><code>findAll</code></td>
              <td>Lista todos los metahumanos con sus poderes y usuario.</td>
            </tr>
            <tr>
              <td><span className="http-badge badge-get">GET</span></td>
              <td><code>/api/metahumanos/notificaciones</code></td>
              <td><code>requireAuth</code></td>
              <td><code>obtenerNotificacionesMetahumano</code></td>
              <td>Trae trámites y multas del usuario logueado.</td>
            </tr>
            <tr>
              <td><span className="http-badge badge-get">GET</span></td>
              <td><code>/api/metahumanos/:id</code></td>
              <td>Ninguno</td>
              <td><code>findOne</code></td>
              <td>Busca un metahumano por su ID numérico.</td>
            </tr>
            <tr>
              <td><span className="http-badge badge-post">POST</span></td>
              <td><code>/api/metahumanos/registro</code></td>
              <td>Ninguno</td>
              <td><code>crearPerfilMetahumano</code></td>
              <td>Crea el perfil inicial vinculado al usuario autenticado.</td>
            </tr>
            <tr>
              <td><span className="http-badge badge-post">POST</span></td>
              <td><code>/api/metahumanos/estilo-vida</code></td>
              <td><code>requireAuth</code></td>
              <td><code>definirEstiloVida</code></td>
              <td>Define si el metahumano es HEROE o VILLANO.</td>
            </tr>
            <tr>
              <td><span className="http-badge badge-put">PUT</span></td>
              <td><code>/api/metahumanos/poderes</code></td>
              <td><code>requireAuth</code></td>
              <td><code>actualizarPoderesMetahumano</code></td>
              <td>Asigna o actualiza nivel de control de un poder.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 9. CÓDIGOS DE ESTADO HTTP */}
      <h2 id="sec-summary">9. Códigos de Estado HTTP y Buenas Prácticas</h2>
      <div className="concept-grid">
        <div className="concept-card">
          <span className="status-code-pill sc-200">200 OK</span>
          <h4>Éxito Estándar</h4>
          <p>La operación se completó exitosamente (GET para lecturas, PUT para actualizaciones y DELETE).</p>
        </div>
        <div className="concept-card">
          <span className="status-code-pill sc-201">201 Created</span>
          <h4>Recurso Creado</h4>
          <p>Se utiliza en métodos POST cuando un nuevo registro es persistido exitosamente en la base de datos.</p>
        </div>
        <div className="concept-card">
          <span className="status-code-pill sc-400">400 Bad Request</span>
          <h4>Error del Cliente</h4>
          <p>Faltan campos obligatorios, formato JSON inválido o violación de reglas de negocio.</p>
        </div>
        <div className="concept-card">
          <span className="status-code-pill sc-401">401 Unauthorized</span>
          <h4>No Autenticado</h4>
          <p>Falta el token de sesión JWT o ha expirado. Impide acceso a rutas protegidas.</p>
        </div>
        <div className="concept-card">
          <span className="status-code-pill sc-404">404 Not Found</span>
          <h4>No Encontrado</h4>
          <p>El ID solicitado en la URL no existe en las tablas correspondientes de MySQL.</p>
        </div>
        <div className="concept-card">
          <span className="status-code-pill sc-500">500 Server Error</span>
          <h4>Fallo del Servidor</h4>
          <p>Excepción imprevista capturada por el bloque <code>catch</code>.</p>
        </div>
      </div>

      {/* 10. SIMULADOR INTERACTIVO DE API */}
      <h2 id="sec-tester">10. 🧪 Simulador Interactivo de Endpoints</h2>
      <p>Prueba en vivo la lógica del controlador de metahumanos con diferentes cuerpos de petición JSON:</p>

      <ApiTester 
        method="POST"
        endpoint="/api/metahumanos/registro"
        testType="registro"
        initialPayload={{
          usuarioId: 5,
          nombre: "Peter Parker",
          alias: "Spider-Man",
          origen: "Picadura de araña radiactiva",
          tipoMeta: "HEROE",
          nivelFama: "Alto",
          latitud: -34.6037,
          longitud: -58.3816
        }}
      />

      <ApiTester 
        method="POST"
        endpoint="/api/metahumanos/estilo-vida"
        testType="estilo-vida"
        initialPayload={{
          tipoMeta: "VILLANO",
          nivelPeligrosidad: "Extrema",
          estado: "activo",
          motivacion: "Venganza contra la ciudad"
        }}
      />

      {/* 11. QUIZ DE AUTOEVALUACIÓN */}
      <h2 id="sec-quiz">11. 📝 Quiz de Autoevaluación</h2>
      <Quiz 
        title="Comprueba lo Aprendido sobre metahumano.controller.ts"
        questions={quizQuestions}
      />
    </div>
  );
}
