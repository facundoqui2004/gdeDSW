# Diccionario de Entidades, Atributos y Relaciones — SuperGestor Backend

Este documento detalla todas las entidades definidas en el backend con **MikroORM** y **TypeScript**, sus columnas en la base de datos MySQL, sus tipos de datos, restricciones y el mapeo completo de relaciones entre tablas.

---

## 🗺️ Mapa Conceptual de Relaciones (Diagrama ER)

```text
                   ┌──────────────┐
                   │   Usuario    │
                   └──┬────────┬──┘
         (1:1 opcional│        │1:1 opcional)
                      ▼        ▼
       ┌─────────────────┐  ┌─────────────────┐
       │   Metahumano    │  │    Burocrata    │◄──────────┐ (N:1 autor)
       │ (STI: Heroe/Vil)│  └──┬──────────────┘           │
       └──┬───────────┬──┘     │ (1:N)                    │
    (1:N) │           │ (1:N)  ▼                          │
          ▼           │     ┌──────────────┐              │
┌──────────────────┐  │     │   Carpeta    │        ┌─────┴──────┐
│    MetaPoder     │  │     └──┬───────────┘        │  Noticia   │
└──┬───────────────┘  │        │ (1:N)              └────────────┘
   │ (N:1)            └───────►▼
   ▼                        ┌──────────────┐
┌──────────────────┐        │  Evidencia   │
│      Poder       │        └──┬───────────┘
└──────────────────┘           │ (1:N)
                               ▼
                            ┌──────────────┐
                            │    Multa     │
                            └──────────────┘
```

---

## 🏛️ 1. Entidad Base: `BaseEntity` (Clase Abstracta)
*Archivo:* `Backend/src/shared/db/baseEntity.entity.ts`  
Todas las entidades del proyecto extienden de esta clase para reutilizar el identificador primario.

| Atributo | Tipo TypeScript | Tipo SQL / Decorador | Restricciones / Opciones | Descripción |
|---|---|---|---|---|
| `id` | `number` | `INT` / `@PrimaryKey()` | `PRIMARY KEY AUTO_INCREMENT` | Identificador único autoincremental de la entidad |

---

## 👤 2. Entidad: `Usuario` (Tabla: `usuario`)
*Archivo:* `Backend/src/auth/usuario.entity.ts`  
Gestiona las credenciales de autenticación, hash de contraseña y rol central del sistema.

### Atributos
| Atributo | Tipo TypeScript | Tipo SQL | Restricciones / Opciones | Descripción |
|---|---|---|---|---|
| `id` | `number` | `INT` | `PK`, `AUTO_INCREMENT` | Heredado de `BaseEntity` |
| `email` | `string` | `VARCHAR(255)` | `unique: true`, `nullable: false` | Correo electrónico / Credencial de inicio de sesión |
| `telefono` | `string` | `VARCHAR(255)` | `nullable: false` | Teléfono de contacto |
| `passwordHash` | `string` | `VARCHAR(255)` | `nullable: false` | Hash irreversible generado con `bcrypt` |
| `role` | `UserRole` | `VARCHAR(255)` / `@Enum` | `METAHUMANO` \| `BUROCRATA` \| `ADMIN` | Rol de sistema para permisos y JWT |
| `verificado` | `boolean` | `TINYINT(1)` | `default: false` | Estado de verificación de la cuenta |
| `createdAt` | `Date` | `DATETIME` | `onCreate: () => new Date()` | Fecha y hora de creación |
| `updatedAt` | `Date` | `DATETIME` | `onCreate`, `onUpdate` | Fecha y hora de última modificación |

### Relaciones
| Propiedad | Tipo | Entidad Destino | FK / Mapeo | Opciones |
|---|---|---|---|---|
| `metahumano` | `1:1` (`@OneToOne`) | `Metahumano` | `mappedBy: 'usuario'` (Lado inverso) | `nullable: true` |
| `burocrata` | `1:1` (`@OneToOne`) | `Burocrata` | `mappedBy: 'usuario'` (Lado inverso) | `nullable: true` |

### Validaciones (Lifecycle Hooks)
- `@BeforeCreate()` y `@BeforeUpdate()` en `validateRoleConsistency()`:
  - Un usuario **no puede tener ambos perfiles** (`metahumano` y `burocrata` a la vez).
  - Si `role === 'METAHUMANO'` no puede tener perfil de burócrata.
  - Si `role === 'BUROCRATA'` no puede tener perfil de metahumano.

---

## 🧬 3. Entidad: `Metahumano` (Tabla: `metahumano` — Herencia STI)
*Archivo:* `Backend/src/metahumano/metahumano.entity.ts`  
Utiliza el patrón **Single Table Inheritance (STI)** mediante la columna discriminadora `tipo_meta`.

### Atributos
| Atributo | Tipo TypeScript | Tipo SQL | Restricciones / Opciones | Descripción |
|---|---|---|---|---|
| `id` | `number` | `INT` | `PK`, `AUTO_INCREMENT` | Heredado de `BaseEntity` |
| `nombre` | `string` | `VARCHAR(255)` | `nullable: false` | Nombre real |
| `alias` | `string` | `VARCHAR(255)` | `nullable: false` | Nombre público o alias de combate |
| `origen` | `string` | `VARCHAR(255)` | `nullable: false` | Procedencia / origen de sus poderes |
| `latitud` | `number` | `DOUBLE` | `nullable: true` | Coordenada geográfica (Latitud) |
| `longitud` | `number` | `DOUBLE` | `nullable: true` | Coordenada geográfica (Longitud) |
| `tipo_meta` | `string` | `VARCHAR(255)` | Discriminador STI | Valores: `'metahumano'`, `'heroe'`, `'villano'` |
| `tipoMeta` | `string` | *(Calculado)* | `@Property({ persist: false })` | Getter en memoria (`this.constructor.name.toLowerCase()`) |

### Relaciones
| Propiedad | Tipo | Entidad Destino | FK / Mapeo | Opciones |
|---|---|---|---|---|
| `usuario` | `1:1` (`@OneToOne`) | `Usuario` | Dueña de la FK `usuario_id` (`owner: true`) | `inversedBy: 'metahumano'` |
| `carpetas` | `1:N` (`@OneToMany`) | `Carpeta` | `carpeta.metahumano` | `cascade: [Cascade.ALL]` |
| `poderes` | `1:N` (`@OneToMany`) | `MetaPoder` | `metaPoder.metahumano` | `cascade: [Cascade.ALL]` |

---

## 🦸 4. Subclase: `Heroe` (Hereda de `Metahumano`)
*Archivo:* `Backend/src/heroe/heroe.entity.ts`  
Persiste en la tabla `metahumano` cuando `tipo_meta = 'heroe'`.

### Atributos específicos
| Atributo | Tipo TypeScript | Tipo SQL | Restricciones / Opciones | Descripción |
|---|---|---|---|---|
| `nivelFama` | `string` | `VARCHAR(255)` | `nullable: true` | Nivel de fama (`Alto`, `Medio`, `Bajo`) |
| `mision` | `string` | `VARCHAR(255)` | `nullable: true` | Misión activa asignada |
| `fechaUltimaVictoria` | `Date` | `DATETIME` | `nullable: true` | Fecha de la última victoria registrada |
| `estatus` | `string` | `VARCHAR(255)` | `default: 'activo'`, `nullable: true` | `activo`, `retirado`, `desaparecido`, `fallecido` |
| `numeroVictorias` | `number` | `INT` | `nullable: true` | Cantidad total de victorias en combate |

---

## 🦹 5. Subclase: `Villano` (Hereda de `Metahumano`)
*Archivo:* `Backend/src/villano/villano.entity.ts`  
Persiste en la tabla `metahumano` cuando `tipo_meta = 'villano'`.

### Atributos específicos
| Atributo | Tipo TypeScript | Tipo SQL | Restricciones / Opciones | Descripción |
|---|---|---|---|---|
| `nivelPeligrosidad` | `string` | `VARCHAR(255)` | `nullable: true` | Clasificación de peligrosidad |
| `motivacion` | `string` | `VARCHAR(255)` | `nullable: true` | Motivación de sus actos delictivos |
| `fechaCaptura` | `Date` | `DATETIME` | `nullable: true` | Fecha de captura o arresto |
| `estado` | `string` | `VARCHAR(255)` | `default: 'activo'`, `nullable: true` | `activo`, `capturado`, `rehabilitado`, `fugitivo` |
| `recompensa` | `number` | `DECIMAL/FLOAT` | `nullable: true` | Monto de recompensa por su captura |

---

## 📋 6. Entidad: `Burocrata` (Tabla: `burocrata`)
*Archivo:* `Backend/src/Burocratas/Burocrata.entity.ts`  
Agentes y funcionarios encargados de los expedientes, multas y noticias oficiales.

### Atributos
| Atributo | Tipo TypeScript | Tipo SQL | Restricciones / Opciones | Descripción |
|---|---|---|---|---|
| `id` | `number` | `INT` | `PK`, `AUTO_INCREMENT` | Heredado de `BaseEntity` |
| `nombre` | `string` | `VARCHAR(255)` | `nullable: false` | Nombre del burócrata |
| `alias` | `string` | `VARCHAR(255)` | `nullable: false` | Alias o identificación institucional |
| `origen` | `string` | `VARCHAR(255)` | `nullable: false` | Departamento o división |
| `latitud` | `number` | `DOUBLE` | `nullable: true` | Ubicación geográfica |
| `longitud` | `number` | `DOUBLE` | `nullable: true` | Ubicación geográfica |

### Relaciones
| Propiedad | Tipo | Entidad Destino | FK / Mapeo | Opciones |
|---|---|---|---|---|
| `usuario` | `1:1` (`@OneToOne`) | `Usuario` | Dueña de la FK `usuario_id` (`owner: true`) | `inversedBy: 'burocrata'` |
| `carpetas` | `1:N` (`@OneToMany`) | `Carpeta` | `carpeta.burocrata` | `cascade: [Cascade.ALL]` |

---

## 📂 7. Entidad: `Carpeta` (Tabla: `carpeta`)
*Archivo:* `Backend/src/carpeta/carpeta.entity.ts`  
Expedientes de trámites, misiones o incidentes gestionados en el sistema.

### Atributos
| Atributo | Tipo TypeScript | Tipo SQL | Restricciones / Opciones | Descripción |
|---|---|---|---|---|
| `id` | `number` | `INT` | `PK`, `AUTO_INCREMENT` | Heredado de `BaseEntity` |
| `estado` | `string` | `VARCHAR(255)` | `nullable: false` | Estado del trámite |
| `descripcion` | `string` | `VARCHAR(255)` | `nullable: false` | Descripción o motivo de la carpeta |
| `tipo` | `string` | `VARCHAR(255)` | `nullable: false` | Categoría del trámite o expediente |
| `targetVillanoId` | `number` | `INT` | `nullable: true` | ID del villano objetivo si aplica |
| `latitud` | `number` | `DOUBLE` | `nullable: true` | Ubicación geográfica del incidente |
| `longitud` | `number` | `DOUBLE` | `nullable: true` | Ubicación geográfica del incidente |
| `radio` | `number` | `INT` | `nullable: true` | Radio de alcance en metros |

### Relaciones
| Propiedad | Tipo | Entidad Destino | FK / Mapeo | Opciones |
|---|---|---|---|---|
| `metahumano` | `N:1` (`@ManyToOne`) | `Metahumano` | FK `metahumano_id` | `nullable: true` |
| `burocrata` | `N:1` (`@ManyToOne`) | `Burocrata` | FK `burocrata_id` | `nullable: true` |
| `evidencias` | `1:N` (`@OneToMany`) | `Evidencia` | `evidencia.carpeta` | `cascade: [Cascade.ALL]`, `nullable: true` |

---

## 🔍 8. Entidad: `Evidencia` (Tabla: `evidencia`)
*Archivo:* `Backend/src/evidencia/evidencia.entity.ts`  
Pruebas y registros fotográficos/periciales asociados a una carpeta de investigación.

### Atributos
| Atributo | Tipo TypeScript | Tipo SQL | Restricciones / Opciones | Descripción |
|---|---|---|---|---|
| `id` | `number` | `INT` | `PK`, `AUTO_INCREMENT` | Heredado de `BaseEntity` |
| `descripcion` | `string` | `VARCHAR(255)` | `nullable: false` | Descripción detallada de la prueba |
| `fechaRecoleccion` | `Date` | `DATETIME` | `nullable: false` | Fecha y hora en que fue recolectada |
| `imagen` | `string` | `LONGTEXT` | `nullable: true` | Imagen en Base64 o URL |
| `latitud` | `number` | `DOUBLE` | `nullable: true` | Coordenada del hallazgo |
| `longitud` | `number` | `DOUBLE` | `nullable: true` | Coordenada del hallazgo |

### Relaciones
| Propiedad | Tipo | Entidad Destino | FK / Mapeo | Opciones |
|---|---|---|---|---|
| `carpeta` | `N:1` (`@ManyToOne`) | `Carpeta` | FK `carpeta_id` | `nullable: true` |
| `multas` | `1:N` (`@OneToMany`) | `Multa` | `multa.evidencia` | `nullable: true` |

---

## 💸 9. Entidad: `Multa` (Tabla: `multa`)
*Archivo:* `Backend/src/Multas/Multa.entity.ts`  
Sanciones económicas emitidas a partir de una evidencia.

### Atributos
| Atributo | Tipo TypeScript | Tipo SQL | Restricciones / Opciones | Descripción |
|---|---|---|---|---|
| `id` | `number` | `INT` | `PK`, `AUTO_INCREMENT` | Heredado de `BaseEntity` |
| `motivoMulta` | `string` | `VARCHAR(255)` | `nullable: false` | Causa de la infracción |
| `montoMulta` | `number` | `DECIMAL/FLOAT` | `nullable: true` | Valor monetario a abonar |
| `lugarDePago` | `string` | `VARCHAR(255)` | `nullable: false` | Entidad o ventanilla de cobro |
| `fechaEmision` | `Date` | `DATETIME` | `nullable: false` | Fecha de confección del acta |
| `estado` | `string` | `VARCHAR(255)` | `nullable: true` | Estado (`PENDIENTE`, `PAGADA`, etc.) |
| `fechaVencimiento`| `Date` | `DATETIME` | `nullable: false` | Fecha límite de pago |
| `formaPago` | `string` | `VARCHAR(255)` | `nullable: true` | Método de pago efectuado |

### Relaciones
| Propiedad | Tipo | Entidad Destino | FK / Mapeo | Opciones |
|---|---|---|---|---|
| `evidencia` | `N:1` (`@ManyToOne`) | `Evidencia` | FK `evidencia_id` | `nullable: true` |

---

## ⚡ 10. Entidad: `Poder` (Tabla: `poder`)
*Archivo:* `Backend/src/poder/poder.entity.ts`  
Catálogo maestro de superpoderes y debilidades.

### Atributos
| Atributo | Tipo TypeScript | Tipo SQL | Restricciones / Opciones | Descripción |
|---|---|---|---|---|
| `id` | `number` | `INT` | `PK`, `AUTO_INCREMENT` | Heredado de `BaseEntity` |
| `nomPoder` | `string` | `VARCHAR(255)` | `unique: true`, `nullable: false` | Nombre único de la habilidad |
| `debilidad` | `string` | `VARCHAR(255)` | `nullable: false` | Debilidad asociada |
| `descPoder` | `string` | `VARCHAR(255)` | `nullable: false` | Descripción funcional del poder |
| `descDebilidad` | `string` | `VARCHAR(255)` | `nullable: false` | Detalle del punto vulnerable |
| `categoria` | `string` | `VARCHAR(255)` | `nullable: false` | Categoría (*Elemental*, *Físico*, etc.) |
| `costoMulta` | `number` | `DECIMAL/FLOAT` | `nullable: true` | Tarifa base por mal uso |

### Relaciones
| Propiedad | Tipo | Entidad Destino | FK / Mapeo | Opciones |
|---|---|---|---|---|
| `metahumanos` | `1:N` (`@OneToMany`) | `MetaPoder` | `metaPoder.poder` | Tabla intermedia pivote `N:M` |

---

## 🔗 11. Entidad: `MetaPoder` (Tabla: `meta_poder` — Pivote N:M)
*Archivo:* `Backend/src/metaPoder/metaPoder.entity.ts`  
Tabla intermedia que relaciona a un `Metahumano` con un `Poder`, agregando atributos de nivel y dominio.

### Atributos
| Atributo | Tipo TypeScript | Tipo SQL | Restricciones / Opciones | Descripción |
|---|---|---|---|---|
| `id` | `number` | `INT` | `PK`, `AUTO_INCREMENT` | Heredado de `BaseEntity` |
| `dominio` | `string` | `VARCHAR(255)` | `nullable: false` | `NOVATO`, `INTERMEDIO`, `AVANZADO`, `EXPERTO`, `MAESTRO` |
| `fechaAdquisicion`| `Date` | `DATETIME` | `nullable: true` | Fecha en que obtuvo el poder |
| `nivelControl` | `number` | `INT` | `nullable: true` | Porcentaje de control (1 a 100) |
| `estado` | `string` | `VARCHAR(255)` | `nullable: true` | `ACTIVO`, `INACTIVO`, `BLOQUEADO` |
| `certificado` | `string` | `VARCHAR(255)` | `nullable: true` | Código o diploma de habilitación |

### Relaciones
| Propiedad | Tipo | Entidad Destino | FK / Mapeo | Opciones |
|---|---|---|---|---|
| `metahumano` | `N:1` (`@ManyToOne`) | `Metahumano` | FK `metahumano_id` | `nullable: false` |
| `poder` | `N:1` (`@ManyToOne`) | `Poder` | FK `poder_id` | `nullable: false` |

---

## 📰 12. Entidad: `Noticia` (Tabla: `noticia`)
*Archivo:* `Backend/src/noticia/noticia.entity.ts`  
Comunicados oficiales, alertas y novedades emitidas por los burócratas.

### Atributos
| Atributo | Tipo TypeScript | Tipo SQL | Restricciones / Opciones | Descripción |
|---|---|---|---|---|
| `id` | `number` | `INT` | `PK`, `AUTO_INCREMENT` | Heredado de `BaseEntity` |
| `titulo` | `string` | `VARCHAR(255)` | `nullable: false` | Titular de la publicación |
| `descripcion` | `string` | `TEXT` | `nullable: false` | Contenido completo de la noticia |
| `imagen` | `string` | `LONGTEXT` | `nullable: true` | Imagen en Base64 o URL |
| `fecha` | `Date` | `DATETIME` | `nullable: false` | Fecha de publicación |
| `clasificacion` | `ClasificacionNoticia` | `VARCHAR(255)` | `default: 'GENERAL'` | `ALERTA`, `INFORMATIVA`, `URGENTE`, `OFICIAL`, `GENERAL` |
| `estado` | `EstadoNoticia` | `VARCHAR(255)` | `default: 'BORRADOR'` | `BORRADOR`, `PUBLICADA`, `ARCHIVADA` |
| `fechaActualizacion`| `Date` | `DATETIME` | `onUpdate: () => new Date()` | Fecha de última edición |
| `destacada` | `boolean` | `TINYINT(1)` | `default: false` | Si se destaca en portada |

### Relaciones
| Propiedad | Tipo | Entidad Destino | FK / Mapeo | Opciones |
|---|---|---|---|---|
| `autor` | `N:1` (`@ManyToOne`) | `Burocrata` | FK `autor_id` | `nullable: false` |
