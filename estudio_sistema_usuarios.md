# Guía de estudio: Sistema de Usuarios (Metahumano / Burócrata)

> Stack detectado: **Node.js + TypeScript + Express + MikroORM + JWT**
> Patrón general: **Router → Controller → Service → Entity (ORM)**

---

## 1. Panorama general de la arquitectura

Tu backend está dividido en capas, cada una con una responsabilidad única. Es el mismo principio que separar en una empresa "atención al cliente", "gerencia" y "depósito": cada una habla con la siguiente, pero nunca se saltan pasos.

```
Cliente (frontend / Postman)
        │
        ▼
usuario.routes.ts      → define QUÉ URL dispara QUÉ función (el "menú" de la API)
        │
        ▼
auth.middleware.ts     → el "portero": revisa el carnet (JWT) antes de dejar pasar
        │
        ▼
usuario.controller.ts  → traduce HTTP (req/res) a llamadas de negocio
        │
        ▼
usuario.service.ts     → la lógica real: reglas de negocio, transacciones
        │
        ▼
usuario.entity.ts      → la "forma" de los datos y las reglas que la base de datos debe cumplir
        │
        ▼
Base de datos (vía MikroORM / EntityManager)
```

**Analogía completa:** pensá en un hospital.
- La **ruta** es la recepción: te dice a qué consultorio ir según lo que necesitás.
- El **middleware de auth** es el guardia de seguridad que pide tu DNI antes de dejarte entrar a un piso.
- El **controller** es el/la recepcionista del consultorio: recibe tu pedido, no diagnostica.
- El **service** es el médico: aplica las reglas (¿podés operarte? ¿tenés alergias?).
- La **entity** es la ficha médica: define qué campos existen y qué combinaciones son válidas.

---

## 2. La entidad `Usuario` (usuario.entity.ts)

### 2.1 ¿Qué es una Entity en MikroORM?

Una `@Entity()` es una clase de TypeScript que MikroORM traduce a una tabla SQL. Cada `@Property()` es una columna.

```ts
@Entity()
export class Usuario extends BaseEntity {
  @Property({ unique: true, nullable: false })
  email!: string
  ...
}
```

**Analogía:** es como llenar una planilla de Excel donde vos definís los encabezados de columna (`email`, `telefono`, `role`...) y el ORM se encarga de que cada fila (cada usuario real) respete ese formato.

### 2.2 Relaciones One-to-One opcionales (herencia por composición)

```ts
@OneToOne({ entity: () => 'Metahumano', mappedBy: 'usuario', nullable: true })
metahumano?: Rel<any>

@OneToOne({ entity: () => 'Burocrata', mappedBy: 'usuario', nullable: true })
burocrata?: Rel<any>
```

Acá no estás usando herencia de clases (`extends`), sino **composición**: `Usuario` es la entidad "genérica" (email, password, rol) y `Metahumano`/`Burocrata` son "extensiones" opcionales conectadas por relación 1 a 1.

**¿Por qué no herencia directa (`Metahumano extends Usuario`)?**
Porque un usuario puede *cambiar* de perfil en tiempo de ejecución (ver `convertirMetahumanoABurocrata` en el service). Con herencia de clases eso es rígido; con composición, simplemente creás/borrás el objeto relacionado.

**Analogía:** pensá en un empleado de una empresa. El "legajo" (`Usuario`) siempre existe. Pero además puede tener una "ficha de vendedor" o una "ficha de técnico" — nunca las dos a la vez. Si lo cambian de puesto, le borran una ficha y le arman la otra, pero el legajo central sigue siendo el mismo.

### 2.3 Hooks de validación: `@BeforeCreate` / `@BeforeUpdate`

```ts
@BeforeCreate()
@BeforeUpdate()
validateRoleConsistency() {
  if (this.metahumano && this.burocrata) {
    throw new Error('Un usuario no puede tener ambos perfiles...')
  }
  ...
}
```

Estos decoradores hacen que MikroORM ejecute automáticamente esta función **antes de insertar o actualizar** la fila en la base. Es una validación a nivel de dominio, no a nivel de base de datos (no es un `CHECK` de SQL).

**Analogía:** es como un guardia que revisa tu mochila *antes* de que entres al estadio, no después. Si algo está mal, ni siquiera llegás a la puerta (no se ejecuta el `INSERT`/`UPDATE`).

⚠️ **Punto para reforzar en el parcial/exposición:** esta validación corre en la capa de aplicación (Node), así que si alguien manipula la base directamente con SQL crudo, esta regla NO se aplica. Es una limitación típica de las validaciones "en el ORM" vs. constraints reales de base de datos.

---

## 3. La capa de servicio (usuario.service.ts)

### 3.1 Patrón Service Layer

El `UsuarioService` concentra **toda** la lógica de negocio: verificación de duplicados, transacciones multi-entidad, conversión de perfiles, validación de integridad. El controller nunca debería tener estas reglas.

**Analogía:** el controller es el mozo que toma el pedido; el service es la cocina, donde realmente se combinan los ingredientes según la receta.

### 3.2 Creación de usuario compuesto (transacción implícita)

```ts
async crearMetahumano(datos: {...}) {
  const usuarioExistente = await this.em.findOne(Usuario, { email: datos.email })
  if (usuarioExistente) throw new Error('Ya existe un usuario con este email')

  const usuario = this.em.create(Usuario, { ... })
  const metahumano = this.em.create(Metahumano, { ..., usuario })
  usuario.metahumano = metahumano

  await this.em.persistAndFlush([usuario, metahumano])
  return { usuario, metahumano }
}
```

Puntos clave:
1. **Chequeo de unicidad manual** antes de crear (además del `unique: true` de la entidad — doble capa de seguridad).
2. `em.create()` **no** guarda nada todavía; solo arma el objeto en memoria (managed pero no persistido).
3. La relación se setea en **ambos sentidos** (`metahumano.usuario` y `usuario.metahumano`) para mantener la consistencia del grafo de objetos en memoria — MikroORM no siempre infiere el lado inverso automáticamente en objetos recién creados.
4. `persistAndFlush([...])` hace **una sola transacción** para ambas entidades: o se guardan las dos, o ninguna (atomicidad).

**Analogía:** es como firmar un contrato de alquiler: no existe "medio contrato". O firman inquilino y garante juntos (ambas entidades se persisten), o se cae toda la operación.

### 3.3 `convertirMetahumanoABurocrata`: el patrón "swap de perfil"

```ts
this.em.remove(metahumano)
usuario.role = UserRole.BUROCRATA
usuario.metahumano = undefined
const burocrata = this.em.create(Burocrata, { ..., usuario })
usuario.burocrata = burocrata
await this.em.flush()
```

Es un ejemplo de **Unit of Work**: acumulás varios cambios (un `remove`, una modificación de propiedad, un `create`) y recién al final hacés **un solo** `flush()`, que MikroORM traduce al SQL necesario (DELETE + UPDATE + INSERT) dentro de una transacción.

**Analogía:** es como editar un documento colaborativo offline y recién al final apretar "Guardar": todos los cambios viajan juntos, no uno por uno.

### 3.4 `validarIntegridad`: auditoría de consistencia

Este método no modifica nada; busca **usuarios huérfanos** (rol sin perfil, o perfil sin usuario) — algo que en teoría no debería pasar gracias a los hooks del punto 2.3, pero sirve como red de seguridad ante datos legados, migraciones fallidas o bypasses directos a la base.

**Analogía:** es el arqueo de caja al final del turno: no evita el error, lo detecta después.

### 3.5 `eliminarUsuario`: borrado en cascada manual

```ts
populate: ['metahumano', 'metahumano.poderes', 'metahumano.carpetas', 'burocrata', 'burocrata.carpetas']
...
if (usuario.metahumano) this.em.remove(usuario.metahumano)
if (usuario.burocrata) this.em.remove(usuario.burocrata)
this.em.remove(usuario)
```

Aunque MikroORM podría manejar cascadas automáticas (`cascade: [Cascade.REMOVE]` en la relación), acá se hace **explícito**. Es más código, pero es más fácil de leer y depurar: cualquiera que lea el método entiende exactamente qué se borra, sin tener que ir a revisar la configuración de la entidad.

---

## 4. Rutas (usuario.routes.ts)

```ts
router.post('/register/metahumano', registrarMetahumano)
router.get('/perfil', requireAuth, obtenerPerfil)
router.get('/admin/usuarios', requireAuth, requireRoles(['ADMIN']), listarUsuarios)
```

Notá el patrón de **middlewares encadenados**: Express ejecuta cada función en orden y solo sigue a la siguiente si la anterior llama a `next()`.

**Analogía:** es una fila de control en un aeropuerto: primero control de pasaporte (`requireAuth`), después control de aduana específico según tu vuelo (`requireRoles`). Si no pasás el primer control, ni siquiera llegás al segundo.

Clasificación de las rutas:
| Tipo | Ejemplo | Middleware |
|---|---|---|
| Pública | `/register/*`, `/login` | ninguno |
| Protegida (cualquier usuario logueado) | `/perfil`, `/contacto` | `requireAuth` |
| Protegida por rol | `/admin/usuarios` | `requireAuth` + `requireRoles(['ADMIN'])` |

---

## 5. Middleware de autenticación (auth.middleware.ts)

### 5.1 `requireAuth`: validar el JWT

```ts
let token = req.cookies?.auth_token
if (!token && req.headers.authorization) { ... } // fallback a Bearer

const payload = jwt.verify(token, config.jwtSecret) as any
req.usuarioId = payload.usuarioId
req.role = payload.role
...
next()
```

**Analogía del JWT:** un JWT es como una **pulsera de un boliche**. Cuando entrás (login), te la ponen y queda "firmada" con un sello especial (la `jwtSecret`) que solo el boliche conoce reproducir. Después, en cualquier punto de la noche, el personal solo mira la pulsera —no te vuelve a pedir el documento— para saber que ya pasaste el control. Si alguien intenta falsificar la pulsera sin conocer el sello, `jwt.verify()` lo detecta y tira error.

Soporta **dos formas** de mandar el token (cookie o header `Authorization: Bearer`), lo cual es útil si el frontend web usa cookies pero un cliente externo (Postman, una app móvil) prefiere headers.

### 5.2 `requireRoles`: autorización con caso especial

```ts
export function requireRoles(allowedRoles: string[]) {
  return async (req, res, next) => {
    if (allowedUpper.includes(roleUpper)) return next()

    if (authedReq.role === 'METAHUMANO' && authedReq.perfilId) {
      const metahumano = await em.findOne(Metahumano, { id: authedReq.perfilId })
      const tipo = metahumano.tipoMeta.toUpperCase() // HEROE o VILLANO
      if (allowedRoles.includes(tipo)) return next()
    }

    return res.status(403).json({ message: 'Acceso denegado...' })
  }
}
```

Esto es una **función que devuelve una función** (factory de middleware) — patrón muy común en Express para parametrizar middlewares (`requireRoles(['ADMIN'])` es distinto de `requireRoles(['HEROE'])` pero ambos son "el mismo" middleware genérico).

Lo interesante: distingue entre **rol de sistema** (`METAHUMANO`, `BUROCRATA`, `ADMIN` — viene directo del JWT) y **subtipo de negocio** (`HEROE`/`VILLANO` — requiere ir a buscar el dato a la base, porque no viene en el token). Es una autorización de dos niveles.

**Analogía:** es como un cine que deja entrar a "todo mayor de 13" (rol de sistema) pero además, para la función de terror, exige que además seas "mayor de 18" (subtipo verificado con más detalle, no alcanza con el carnet general).

⚠️ **Costo de performance:** esta segunda verificación pega contra la base de datos en **cada request** a una ruta protegida por rol de subtipo. Si `tipoMeta` casi no cambia, se podría meter directamente en el payload del JWT al loguearse y evitar la consulta — trade-off entre "dato siempre actualizado" vs. "menos queries".

---

## 6. Errores y riesgos a tener en cuenta (para preguntas de examen)

1. **Contraseñas y `passwordHash`**: el nombre sugiere que ya llega hasheada desde el controller — repasá con qué librería (bcrypt, argon2) se genera, porque seguramente te pregunten por qué nunca se guarda la contraseña en texto plano.
2. **Doble chequeo de unicidad de email**: existe tanto a nivel de entidad (`unique: true`) como a nivel de service (`findOne` antes de crear). Es redundante pero intencional: el chequeo en el service te permite lanzar un error de negocio *legible* (`"Ya existe un usuario con este email"`) en vez de que MikroORM tire una excepción cruda de constraint de base de datos.
3. **`role` desincronizado del perfil real**: los hooks de la entidad y `validarIntegridad()` existen justamente para blindarse contra ese bug — es un buen ejemplo para explicar *por qué* se necesitan ambas cosas (prevención + auditoría).
4. **`jwtSecret`**: si en algún momento te preguntan por seguridad, este es el punto crítico — todo el sistema de autenticación depende de que ese secreto nunca se filtre.

---

## 7. Glosario rápido

| Término | Definición corta |
|---|---|
| **ORM** | Traduce clases de TypeScript ↔ tablas SQL, para no escribir SQL a mano |
| **EntityManager (`em`)** | El objeto que orquesta consultas, creación y persistencia contra la base |
| **`persistAndFlush`** | Marca objeto(s) para guardar + ejecuta el `INSERT`/`UPDATE` ya mismo |
| **`flush`** | Ejecuta todos los cambios pendientes acumulados en la Unit of Work |
| **Middleware** | Función que se ejecuta *entre* la request y el controller final |
| **JWT** | Token firmado que prueba "quién sos" sin necesitar guardar sesión en el servidor |
| **Cascade** | Que una operación (ej. borrar) se propague automáticamente a entidades relacionadas |
