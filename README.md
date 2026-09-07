# SuperGestor Backend - Portal de Aprendizaje (React.js + Node.js)

Portal web interactivo desarrollado con **React.js** y servido con **Node.js**, diseñado para aprender y dominar la arquitectura backend del proyecto **SuperGestor** ([Express.js](https://expressjs.com/) + [MikroORM](https://mikro-orm.io/)), replicando la estética visual oficial de la documentación de Express.js.

---

## 🚀 ¿Cómo ejecutar la aplicación?

Abre tu terminal en la carpeta del proyecto:
```bash
cd "/home/quinio/Documentos/Documentación ayuda supergestor"
```

### Opción 1: Modo Desarrollo con React + Vite (Hot Reload)
```bash
npm run dev
```
Abre la URL indicada en la consola (por defecto: `http://localhost:3000` o `http://localhost:5173`).

---

### Opción 2: Ejecutar con el servidor Node.js
```bash
npm run build
npm start
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

---

## 📚 Estructura de la Aplicación en React

* **`src/`**
  * **`components/`**
    * `Navbar.jsx`: Barra superior oficial de Express con selector de tema claro/oscuro y buscador.
    * `Sidebar.jsx`: Menú lateral de navegación con categorías colapsables y badges.
    * `Breadcrumb.jsx`: Migas de pan de navegación con versión del framework.
    * `TableOfContents.jsx`: Índice lateral derecho con seguimiento de scroll.
    * `CodeBlock.jsx`: Bloques de código con resaltado y botón de copiado animado.
    * `Callout.jsx`: Alertas educativas (*Note*, *Tip*, *Warn*, *Deep Dive*).
    * `ApiTester.jsx`: Simulador interactivo de endpoints de API con validaciones en tiempo real.
    * `Quiz.jsx`: Sistema de evaluación interactivo con explicaciones detalladas.
  * **`views/`**
    * `HomeView.jsx`: Introducción, ciclo de vida de peticiones HTTP y patrones de MikroORM.
    * `MetahumanoControllerView.jsx`: Estudio integral y exhaustivo de `metahumano.controller.ts`.
    * `TestAutenticacionView.jsx`: Tests de autenticación — hashing con bcrypt, firma y verificación de JWT, rechazo de tokens inválidos y mal formados.
  * `App.jsx`: Componente maestro que orquesta vistas, temas y buscador.
  * `index.css`: Sistema de diseño basado en la estética de Express.js.
* **`server.js`**: Servidor Node.js para producción.
* **`package.json`**: Configuración de dependencias y scripts de Node.js.

---

## ⚡ Módulos Explicados en Detalle

1. **Dependencias & Imports:** `Request`, `Response`, `NextFunction`, entidades, y `AuthedRequest`.
2. **El EntityManager (`orm.em`):** Operaciones atómicas y Unit of Work.
3. **Middleware `sanitizeMetahumanoInput`:** Limpieza de `req.body`, conversión con `Number()` y eliminación de `undefined`.
4. **Función `crearPerfilMetahumano`:** Validaciones, roles de usuario, instanciación polimórfica (`Heroe`, `Villano`, `Metahumano`) y `em.persistAndFlush()`.
5. **Operaciones CRUD:**
   * `findAll`: Relaciones anidadas con `populate: ['usuario', 'poderes.poder']`.
   * `findOne`: `em.findOneOrFail()` y parámetros de URL `req.params.id`.
   * `add`: Inserción genérica con `em.create()` y `em.flush()`.
   * `update`: Asignación con `em.assign()`.
   * `remove`: Borrado eficiente con `em.getReference()` (sin SELECT previo).
6. **Función `actualizarPoderesMetahumano`:** Patrón *UPSERT* en la tabla intermedia `MetaPoder`.
7. **Función `obtenerNotificacionesMetahumano`:** Consultas de 3 niveles (`Multa -> Evidencia -> Carpeta -> Metahumano`) y proyecciones con `.map()`.
8. **Función `definirEstiloVida`:** SQL nativo con `connection.execute`, cálculo de recompensa con `.filter()` y `.reduce()`, y limpieza de caché con `em.clear()`.
9. **Rutas & Middlewares:** `metahumano.routes.ts`.
10. **Códigos de Estado HTTP:** 200, 201, 400, 401, 404, 500.
11. **🧪 Simulador de API:** Prueba interactiva de payloads JSON.
12. **📝 Quiz:** Preguntas para comprobar lo aprendido.

### 🧪 Tests de Autenticación (TestAutenticacionView)
1. **Imports & Setup:** `node:test`, `node:assert`, `bcryptjs`, `jsonwebtoken`, `config.jwtSecret`.
2. **Test 1.1 — bcrypt Hashing:** `bcrypt.hash()`, `bcrypt.compare()`, `saltRounds`, formato `$2`.
3. **Test 1.2 — JWT válido:** `jwt.sign()` con payload de SuperGestor (`usuarioId`, `email`, `role`, `perfil`), `jwt.verify()`, claims `iat`/`exp`.
4. **Test 1.3 — Clave incorrecta:** `assert.throws()`, `JsonWebTokenError`, simulación de ataque de falsificación de token.
5. **Test 1.4 — Tokens mal formados:** regex en `assert.throws`, robustez ante inputs basura en el header `Authorization`.
6. **Referencia assert:** `notStrictEqual`, `strictEqual`, `ok`, `throws`.
7. **Conceptos clave:** Hashing vs Encriptación, JWT stateless, Claims, Firma digital.
8. **📝 Quiz:** 5 preguntas sobre seguridad y testing.

---

## 🧪 Cómo correr los tests del proyecto SuperGestor

El proyecto está dividido en **Backend** y **Frontend**, cada uno con su propio sistema de testing.

---

### Backend (`/Proyecto Desarrollo/Backend`)

El backend usa el **test runner nativo de Node.js** junto con **Supertest** para hacer pruebas de integración HTTP.

**Correr todos los tests de una:**
```bash
cd "/home/quinio/Documentos/Proyecto Desarrollo/Backend"
npm test
```

Esto ejecuta internamente:
```bash
npm run build && node --test dist/__tests__/*.test.js
```

> ⚠️ El script primero **compila TypeScript** a JavaScript (`dist/`) y luego corre todos los archivos `.test.js` del directorio `__tests__/`.

**Correr un test individual:**
```bash
# Compilar primero (solo hace falta una vez)
npm run build

# Luego ejecutar el test que querés
node --test dist/__tests__/integrante1_auth.test.js
node --test dist/__tests__/integrante2_roles_middleware.test.js
node --test dist/__tests__/integrante3_domain_rules.test.js
node --test dist/__tests__/integrante4_environment.test.js
node --test dist/__tests__/integracion_api.test.js
node --test dist/__tests__/app.test.js
```

**Archivos de test disponibles:**

| Archivo | Descripción |
|--------|-------------|
| `app.test.ts` | Tests generales de la aplicación |
| `integracion_api.test.ts` | Tests de integración de la API |
| `integrante1_auth.test.ts` | Autenticación (bcrypt + JWT) |
| `integrante2_roles_middleware.test.ts` | Roles y middleware de autorización |
| `integrante3_domain_rules.test.ts` | Reglas de dominio y lógica de negocio |
| `integrante4_environment.test.ts` | Configuración y variables de entorno |

> 📄 Las variables de entorno para testing están en el archivo `.env.test` del Backend.

---

### Frontend (`/Proyecto Desarrollo/Front`)

El frontend usa **Vitest** junto con **React Testing Library**.

**Correr todos los tests una vez:**
```bash
cd "/home/quinio/Documentos/Proyecto Desarrollo/Front"
npm test
```

**Modo watch** (re-corre automáticamente al guardar cambios):
```bash
npm run test:watch
```

---

### Resumen rápido

| Parte | Comando | Framework |
|-------|---------|-----------|
| Backend (todos) | `npm test` | Node test runner + Supertest |
| Backend (uno solo) | `node --test dist/__tests__/<archivo>.test.js` | Node test runner |
| Frontend (una vez) | `npm test` | Vitest + Testing Library |
| Frontend (watch) | `npm run test:watch` | Vitest interactivo |
