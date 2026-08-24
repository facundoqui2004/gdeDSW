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
