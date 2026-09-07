# 📋 Clases y Relaciones — Supergestor de Metahumanos

---

## 🗂 Índice de Clases

1. [BaseEntity](#1-baseentity)
2. [Usuario](#2-usuario)
3. [Metahumano](#3-metahumano)
4. [Heroe](#4-heroe)
5. [Villano](#5-villano)
6. [Burocrata](#6-burocrata)
7. [Poder](#7-poder)
8. [MetaPoder](#8-metapoder)
9. [Carpeta](#9-carpeta)
10. [Evidencia](#10-evidencia)
11. [Multa](#11-multa)
12. [Noticia](#12-noticia)
13. [Relaciones](#-relaciones)

---

## 1. `BaseEntity`
> Clase **abstracta** de la que heredan todas las demás entidades.

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| `id` | `number` | PK, auto | Clave primaria autogenerada |

---

## 2. `Usuario`
> Entidad de autenticación. Puede representar a un Metahumano, un Burócrata o un Admin.

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| `id` | `number` | PK | De BaseEntity |
| `email` | `string` | NOT NULL, UNIQUE | Correo electrónico único |
| `telefono` | `string` | NOT NULL | Número de teléfono |
| `passwordHash` | `string` | NOT NULL | Contraseña encriptada |
| `role` | `enum` | NOT NULL | `METAHUMANO` / `BUROCRATA` / `ADMIN` |
| `verificado` | `boolean` | default: `false` | Si el usuario está verificado |
| `createdAt` | `Date` | auto | Fecha de creación |
| `updatedAt` | `Date` | auto-update | Fecha de última actualización |

---

## 3. `Metahumano`
> Clase base para Héroes y Villanos. Usa **Single Table Inheritance (STI)** con la columna discriminadora `tipo_meta`.

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| `id` | `number` | PK | De BaseEntity |
| `nombre` | `string` | NOT NULL | Nombre real |
| `alias` | `string` | NOT NULL | Alias o nombre de combate |
| `origen` | `string` | NOT NULL | Lugar o historia de origen |
| `latitud` | `number` (double) | NULLABLE | Coordenada de ubicación |
| `longitud` | `number` (double) | NULLABLE | Coordenada de ubicación |
| `tipo_meta` | `string` | discriminador | `'metahumano'` / `'heroe'` / `'villano'` |

---

## 4. `Heroe`
> Extiende `Metahumano`. **Hereda todos sus atributos** más los propios.

| Atributo propio | Tipo | Restricción | Descripción |
|-----------------|------|-------------|-------------|
| `nivelFama` | `string` | NULLABLE | `Alto` / `Medio` / `Bajo` |
| `mision` | `string` | NULLABLE | Misión activa del héroe |
| `fechaUltimaVictoria` | `Date` | NULLABLE | Fecha de la última victoria registrada |
| `estatus` | `string` | default: `'activo'` | `activo` / `retirado` / `desaparecido` / `fallecido` |
| `numeroVictorias` | `number` | NULLABLE | Contador de victorias |

---

## 5. `Villano`
> Extiende `Metahumano`. **Hereda todos sus atributos** más los propios.

| Atributo propio | Tipo | Restricción | Descripción |
|-----------------|------|-------------|-------------|
| `nivelPeligrosidad` | `string` | NULLABLE | Nivel de peligro que representa |
| `motivacion` | `string` | NULLABLE | Motivación o objetivo del villano |
| `fechaCaptura` | `Date` | NULLABLE | Fecha de la última captura |
| `estado` | `string` | default: `'activo'` | `activo` / `capturado` / `rehabilitado` / `fugitivo` |
| `recompensa` | `number` | NULLABLE | Monto de la recompensa por su captura |

---

## 6. `Burocrata`
> Perfil de empleado gubernamental que gestiona carpetas y publica noticias.

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| `id` | `number` | PK | De BaseEntity |
| `nombre` | `string` | NOT NULL | Nombre real |
| `alias` | `string` | NOT NULL | Nombre de trabajo o apodo |
| `origen` | `string` | NOT NULL | Sector o dependencia de origen |
| `latitud` | `number` (double) | NULLABLE | Coordenada de ubicación |
| `longitud` | `number` (double) | NULLABLE | Coordenada de ubicación |

---

## 7. `Poder`
> Catálogo de poderes disponibles en el sistema.

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| `id` | `number` | PK | De BaseEntity |
| `nomPoder` | `string` | NOT NULL, UNIQUE | Nombre del poder |
| `debilidad` | `string` | NOT NULL | Nombre de su debilidad |
| `descPoder` | `string` | NOT NULL | Descripción detallada del poder |
| `descDebilidad` | `string` | NOT NULL | Descripción de la debilidad |
| `categoria` | `string` | NOT NULL | Categoría o tipo de poder |
| `costoMulta` | `number` | NULLABLE | Costo de multa si se usa indebidamente |

---

## 8. `MetaPoder`
> **Tabla intermedia** que resuelve la relación M:M entre `Metahumano` y `Poder`. Agrega atributos propios de la relación.

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| `id` | `number` | PK | De BaseEntity |
| `dominio` | `string` | NOT NULL | `NOVATO` / `INTERMEDIO` / `AVANZADO` / `EXPERTO` / `MAESTRO` |
| `fechaAdquisicion` | `Date` | NULLABLE | Cuándo adquirió el poder |
| `nivelControl` | `number` | NULLABLE (1–100) | Porcentaje de control del poder |
| `estado` | `string` | NULLABLE | `ACTIVO` / `INACTIVO` / `BLOQUEADO` |
| `certificado` | `string` | NULLABLE | Referencia al certificado oficial |
| `metahumano_id` | `number` | FK → `Metahumano`, NOT NULL | Metahumano que posee el poder |
| `poder_id` | `number` | FK → `Poder`, NOT NULL | Poder poseído |

---

## 9. `Carpeta`
> Expediente administrativo vinculado a un Metahumano y/o Burócrata.

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| `id` | `number` | PK | De BaseEntity |
| `estado` | `string` | NOT NULL | Estado del expediente |
| `descripcion` | `string` | NOT NULL | Descripción del caso |
| `tipo` | `string` | NOT NULL | Tipo de carpeta/expediente |
| `targetVillanoId` | `number` | NULLABLE | ID del villano objetivo (si aplica) |
| `latitud` | `number` (double) | NULLABLE | Coordenada del caso |
| `longitud` | `number` (double) | NULLABLE | Coordenada del caso |
| `radio` | `number` (int) | NULLABLE | Radio de zona de interés (metros) |
| `metahumano_id` | FK → `Metahumano` | NULLABLE | Metahumano involucrado |
| `burocrata_id` | FK → `Burocrata` | NULLABLE | Burócrata a cargo |

---

## 10. `Evidencia`
> Pieza de evidencia recolectada dentro de una Carpeta.

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| `id` | `number` | PK | De BaseEntity |
| `descripcion` | `string` | NOT NULL | Descripción de la evidencia |
| `fechaRecoleccion` | `Date` | NOT NULL | Fecha en que fue recolectada |
| `imagen` | `string` (longtext) | NULLABLE | Imagen en base64 o URL |
| `latitud` | `number` (double) | NULLABLE | Coordenada del hallazgo |
| `longitud` | `number` (double) | NULLABLE | Coordenada del hallazgo |
| `carpeta_id` | FK → `Carpeta` | NULLABLE | Carpeta a la que pertenece |

---

## 11. `Multa`
> Sanción económica generada a partir de una Evidencia.

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| `id` | `number` | PK | De BaseEntity |
| `motivoMulta` | `string` | NOT NULL | Motivo de la sanción |
| `montoMulta` | `number` | NULLABLE | Monto a pagar |
| `lugarDePago` | `string` | NOT NULL | Dónde debe realizarse el pago |
| `fechaEmision` | `Date` | NOT NULL | Fecha en que se emitió |
| `estado` | `string` | NULLABLE | Estado de la multa (pendiente, pagada, etc.) |
| `fechaVencimiento` | `Date` | NOT NULL | Fecha límite de pago |
| `formaPago` | `string` | NULLABLE | Método de pago (efectivo, transferencia, etc.) |
| `evidencia_id` | FK → `Evidencia` | NULLABLE | Evidencia que la originó |

---

## 12. `Noticia`
> Publicación informativa creada por un Burócrata.

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| `id` | `number` | PK | De BaseEntity |
| `titulo` | `string` | NOT NULL | Título de la noticia |
| `descripcion` | `string` (text) | NOT NULL | Cuerpo de la noticia |
| `imagen` | `string` (longtext) | NULLABLE | Imagen en base64 o URL |
| `fecha` | `Date` | NOT NULL | Fecha de publicación |
| `clasificacion` | `string` | NOT NULL, default: `'GENERAL'` | `ALERTA` / `INFORMATIVA` / `URGENTE` / `OFICIAL` / `GENERAL` |
| `estado` | `string` | NOT NULL, default: `'BORRADOR'` | `BORRADOR` / `PUBLICADA` / `ARCHIVADA` |
| `fechaActualizacion` | `Date` | NULLABLE, auto-update | Última vez que se editó |
| `destacada` | `boolean` | NOT NULL, default: `false` | Si está fijada como noticia destacada |
| `autor_id` | FK → `Burocrata` | NOT NULL | Burócrata autor de la noticia |

---

## 🔗 Relaciones

### Tabla de relaciones con cardinalidad

| # | Clase A | Cardinalidad | Clase B | FK en | Tipo ORM | Obligatoria |
|---|---------|:---:|---------|--------|----------|:-----------:|
| 1 | `Metahumano` | **1 : 1** | `Usuario` | `Metahumano` | `@OneToOne` (owner) | ✅ Sí |
| 2 | `Burocrata` | **1 : 1** | `Usuario` | `Burocrata` | `@OneToOne` (owner) | ✅ Sí |
| 3 | `Metahumano` | **1 : 0..M** | `Carpeta` | `Carpeta` | `@OneToMany / @ManyToOne` | ⬜ Opcional |
| 4 | `Burocrata` | **1 : 0..M** | `Carpeta` | `Carpeta` | `@OneToMany / @ManyToOne` | ⬜ Opcional |
| 5 | `Carpeta` | **1 : 0..M** | `Evidencia` | `Evidencia` | `@OneToMany / @ManyToOne` | ⬜ Opcional |
| 6 | `Evidencia` | **1 : 0..M** | `Multa` | `Multa` | `@OneToMany / @ManyToOne` | ⬜ Opcional |
| 7 | `Burocrata` | **1 : 0..M** | `Noticia` | `Noticia` | `@ManyToOne` en Noticia | ✅ Sí |
| 8 | `Metahumano` | **M : M** | `Poder` | `MetaPoder` (tabla intermedia) | vía `@ManyToOne` doble | ✅ Sí (ambas FK) |

---

### Detalle de cada relación

#### 1. `Metahumano` — `Usuario` (1:1)
- Un `Metahumano` **tiene exactamente un** `Usuario` (no puede existir sin él).
- Un `Usuario` puede tener como máximo un `Metahumano`.
- FK `usuario_id` vive en la tabla `metahumano`.

#### 2. `Burocrata` — `Usuario` (1:1)
- Un `Burocrata` **tiene exactamente un** `Usuario`.
- FK `usuario_id` vive en la tabla `burocrata`.
- Un mismo `Usuario` **no puede ser** Metahumano y Burócrata al mismo tiempo (validado en código).

#### 3. `Metahumano` — `Carpeta` (1:0..M)
- Un `Metahumano` puede tener **cero o muchas** carpetas/expedientes.
- Una `Carpeta` pertenece a **como máximo un** Metahumano (FK nullable).

#### 4. `Burocrata` — `Carpeta` (1:0..M)
- Un `Burocrata` puede gestionar **cero o muchas** carpetas.
- Una `Carpeta` está asignada a **como máximo un** Burócrata (FK nullable).

#### 5. `Carpeta` — `Evidencia` (1:0..M)
- Una `Carpeta` puede contener **cero o muchas** evidencias.
- Una `Evidencia` pertenece a **una sola** carpeta.

#### 6. `Evidencia` — `Multa` (1:0..M)
- Una `Evidencia` puede originar **cero o muchas** multas.
- Una `Multa` está vinculada a **una sola** evidencia.

#### 7. `Burocrata` — `Noticia` (1:0..M)
- Un `Burocrata` puede publicar **cero o muchas** noticias.
- Una `Noticia` tiene **exactamente un** autor (Burócrata), FK obligatoria.

#### 8. `Metahumano` — `Poder` (M:M vía `MetaPoder`)
- Un `Metahumano` puede dominar **muchos** poderes.
- Un `Poder` puede ser dominado por **muchos** metahumanos.
- La tabla `MetaPoder` guarda atributos propios: `dominio`, `nivelControl`, `certificado`, etc.

---

### Árbol de herencia

```
BaseEntity  (abstracta)
    ├── Usuario
    ├── Metahumano          ← tabla única con discriminador tipo_meta
    │       ├── Heroe       (tipo_meta = 'heroe')
    │       └── Villano     (tipo_meta = 'villano')
    ├── Burocrata
    ├── Poder
    ├── MetaPoder
    ├── Carpeta
    ├── Evidencia
    ├── Multa
    └── Noticia
```

> **Heroe** y **Villano** no tienen tabla propia. Comparten la tabla `metahumano` con
> una columna `tipo_meta` que actúa como discriminador (Single Table Inheritance).
