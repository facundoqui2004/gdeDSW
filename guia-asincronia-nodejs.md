# Guía Completa: Sincronía, Asincronía, Promesas, Async/Await y Manejo de Errores en Node.js

## Índice
1. [Introducción: ¿Por qué existe la asincronía?](#1-introducción-por-qué-existe-la-asincronía)
2. [Código Síncrono](#2-código-síncrono)
3. [Código Asíncrono](#3-código-asíncrono)
4. [El Event Loop (muy resumido)](#4-el-event-loop-muy-resumido)
5. [Callbacks: el origen de todo](#5-callbacks-el-origen-de-todo)
6. [Promesas (Promises)](#6-promesas-promises)
7. [Async / Await](#7-async--await)
8. [Try / Catch / Finally](#8-try--catch--finally)
9. [Errores comunes y buenas prácticas](#9-errores-comunes-y-buenas-prácticas)
10. [Funciones útiles relacionadas](#10-funciones-útiles-relacionadas)
11. [Resumen final / Cheatsheet](#11-resumen-final--cheatsheet)

---

## 1. Introducción: ¿Por qué existe la asincronía?

Node.js corre en un **único hilo** (single thread) de ejecución de JavaScript. Esto significa que, en principio, solo puede hacer **una cosa a la vez**.

El problema es que muchas operaciones (leer un archivo, consultar una base de datos, hacer un `fetch` a una API, esperar un temporizador) **tardan tiempo**. Si Node tuviera que "congelarse" esperando cada una de esas operaciones, el servidor no podría atender a nadie más mientras tanto.

La solución de Node.js es: **delegar las tareas lentas a otro lugar** (el sistema operativo, threads internos de la librería `libuv`, etc.) y **seguir ejecutando el resto del código** mientras esa tarea lenta se resuelve "en segundo plano". Cuando la tarea termina, Node es avisado y ejecuta el código que corresponde a esa respuesta.

Eso es, en esencia, la **asincronía**.

---

## 2. Código Síncrono

El código **síncrono** se ejecuta **línea por línea, en orden**, y **cada línea debe terminar antes de que empiece la siguiente**. Si una línea tarda 5 segundos, todo lo demás queda "bloqueado" esperando.

```js
console.log("Inicio");

function sumar(a, b) {
  return a + b;
}

const resultado = sumar(2, 3);
console.log(resultado); // 5

console.log("Fin");
```

**Salida:**
```
Inicio
5
Fin
```

Todo ocurre en el orden exacto en que está escrito. No hay sorpresas. Esto se llama ejecución **bloqueante (blocking)**.

### Ejemplo de código síncrono "lento" (bloqueante)

```js
function tareaPesada() {
  const inicio = Date.now();
  while (Date.now() - inicio < 3000) {
    // bucle vacío que "traba" el hilo por 3 segundos
  }
  console.log("Tarea pesada terminada");
}

console.log("Antes");
tareaPesada(); // el programa entero se congela 3 segundos acá
console.log("Después");
```

Mientras `tareaPesada()` se ejecuta, **Node.js no puede hacer absolutamente nada más**: no puede responder otras peticiones HTTP, no puede procesar otros eventos. Por eso el código bloqueante es peligroso en un servidor.

---

## 3. Código Asíncrono

El código **asíncrono** permite decirle a Node: *"Iniciá esta tarea, pero no te quedes esperando. Seguí con lo demás, y cuando la tarea termine, avisame."*

```js
console.log("Inicio");

setTimeout(() => {
  console.log("Esto se ejecuta después de 2 segundos");
}, 2000);

console.log("Fin");
```

**Salida:**
```
Inicio
Fin
Esto se ejecuta después de 2 segundos
```

Fijate que **"Fin" se imprime antes** que el mensaje del `setTimeout`, aunque esté escrito antes en el código. Esto pasa porque `setTimeout` es asíncrono: Node "agenda" esa tarea y sigue ejecutando el resto del script sin esperarla.

Esto se llama ejecución **no bloqueante (non-blocking)**, y es la clave de por qué Node.js puede manejar miles de conexiones simultáneas con un solo hilo.

---

## 4. El Event Loop (muy resumido)

El **Event Loop** es el mecanismo interno de Node que:
1. Ejecuta el código síncrono primero (el "hilo principal" o *call stack*).
2. Cuando encuentra una operación asíncrona (timer, lectura de archivo, petición de red, etc.), la delega y sigue de largo.
3. Cuando esa operación termina, coloca su callback (función de respuesta) en una **cola (queue)**.
4. Una vez que el call stack está vacío, el Event Loop toma las funciones de la cola y las ejecuta.

No hace falta memorizar todos los detalles internos, pero es fundamental entender esta idea: **el código síncrono siempre se ejecuta primero, completo, antes de que se procese cualquier callback asíncrono pendiente.**

---

## 5. Callbacks: el origen de todo

Antes de que existieran las Promesas, la asincronía en Node se manejaba con **callbacks**: funciones que se pasan como argumento y que se ejecutan cuando la tarea asíncrona termina.

```js
const fs = require('fs');

console.log("Leyendo archivo...");

fs.readFile('archivo.txt', 'utf-8', (error, contenido) => {
  if (error) {
    console.error("Ocurrió un error:", error.message);
    return;
  }
  console.log("Contenido del archivo:", contenido);
});

console.log("Esto se imprime antes de leer el archivo");
```

### El problema de los callbacks: "Callback Hell"

Cuando hay que encadenar varias operaciones asíncronas dependientes entre sí, el código empieza a anidarse cada vez más, volviéndose difícil de leer y mantener:

```js
fs.readFile('archivo1.txt', 'utf-8', (err1, data1) => {
  if (err1) return console.error(err1);
  fs.readFile('archivo2.txt', 'utf-8', (err2, data2) => {
    if (err2) return console.error(err2);
    fs.readFile('archivo3.txt', 'utf-8', (err3, data3) => {
      if (err3) return console.error(err3);
      console.log(data1, data2, data3);
      // y así sucesivamente... esto se vuelve un "pyramid of doom"
    });
  });
});
```

Esto se conoce como **"Callback Hell"** o **"Pyramid of Doom"**. Las Promesas nacieron justamente para solucionar este problema.

---

## 6. Promesas (Promises)

Una **Promesa** es un objeto que representa el resultado eventual (futuro) de una operación asíncrona. Una promesa puede estar en 3 estados:

- **Pending (pendiente):** todavía no se resolvió.
- **Fulfilled (cumplida):** la operación terminó con éxito.
- **Rejected (rechazada):** la operación falló.

### Crear una promesa

```js
const miPromesa = new Promise((resolve, reject) => {
  const exito = true;

  setTimeout(() => {
    if (exito) {
      resolve("¡Todo salió bien!"); // se cumple
    } else {
      reject(new Error("Algo salió mal")); // se rechaza
    }
  }, 1000);
});
```

### Consumir una promesa con `.then()`, `.catch()` y `.finally()`

```js
miPromesa
  .then((resultado) => {
    console.log("Éxito:", resultado);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  })
  .finally(() => {
    console.log("Esto se ejecuta siempre, haya éxito o error");
  });
```

- `.then()` se ejecuta si la promesa se resuelve (`resolve`).
- `.catch()` se ejecuta si la promesa se rechaza (`reject`) o si ocurre una excepción dentro de un `.then()`.
- `.finally()` se ejecuta siempre, sin importar el resultado (ideal para limpiar recursos, cerrar loaders, etc.).

### Encadenar promesas

```js
function obtenerUsuario(id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, nombre: "Juan" }), 1000);
  });
}

function obtenerPedidos(usuario) {
  return new Promise((resolve) => {
    setTimeout(() => resolve([`Pedido 1 de ${usuario.nombre}`]), 1000);
  });
}

obtenerUsuario(1)
  .then((usuario) => obtenerPedidos(usuario))
  .then((pedidos) => console.log(pedidos))
  .catch((error) => console.error(error));
```

### `Promise.all`, `Promise.race`, `Promise.allSettled`

```js
const p1 = Promise.resolve(10);
const p2 = new Promise((resolve) => setTimeout(() => resolve(20), 500));
const p3 = Promise.resolve(30);

// Espera a que TODAS terminen. Si UNA falla, rechaza todo el conjunto.
Promise.all([p1, p2, p3]).then((resultados) => {
  console.log(resultados); // [10, 20, 30]
});

// Devuelve el resultado de la que termine PRIMERO (ganadora)
Promise.race([p1, p2, p3]).then((resultado) => {
  console.log("Ganadora:", resultado);
});

// Espera a que TODAS terminen, pero informa el estado de cada una
// (no falla aunque alguna sea rechazada)
Promise.allSettled([p1, p2, p3]).then((resultados) => {
  console.log(resultados);
  // [{status: 'fulfilled', value: 10}, {status: 'fulfilled', value: 20}, ...]
});
```

---

## 7. Async / Await

`async` y `await` son **azúcar sintáctico** sobre las Promesas: permiten escribir código asíncrono con una **apariencia síncrona**, mucho más legible.

### Reglas básicas

- La palabra clave `async` se coloca antes de una función y hace que **esa función siempre devuelva una Promesa**.
- Dentro de una función `async`, se puede usar `await` para "pausar" la ejecución **de esa función** (no de todo el programa) hasta que la promesa se resuelva.
- `await` **solo puede usarse dentro de una función `async`** (o en el nivel superior de un módulo ES en versiones modernas de Node, conocido como *top-level await*).

### Ejemplo básico

```js
function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ejemplo() {
  console.log("Inicio");
  await esperar(2000); // pausa la función 2 segundos
  console.log("Pasaron 2 segundos");
}

ejemplo();
console.log("Esto se imprime ANTES de 'Pasaron 2 segundos'");
```

**Salida:**
```
Inicio
Esto se imprime ANTES de 'Pasaron 2 segundos'
Pasaron 2 segundos
```

### Reescribiendo el ejemplo de callbacks anidados con async/await

Comparado con el "Callback Hell" del punto 5, esto es mucho más limpio:

```js
const fs = require('fs/promises'); // versión de fs basada en promesas

async function leerArchivos() {
  try {
    const data1 = await fs.readFile('archivo1.txt', 'utf-8');
    const data2 = await fs.readFile('archivo2.txt', 'utf-8');
    const data3 = await fs.readFile('archivo3.txt', 'utf-8');
    console.log(data1, data2, data3);
  } catch (error) {
    console.error("Error leyendo los archivos:", error.message);
  }
}

leerArchivos();
```

### `await` con múltiples promesas en paralelo

Un error común es usar `await` uno detrás del otro cuando las tareas **no dependen entre sí**, haciendo que se ejecuten en serie (más lento de lo necesario):

```js
// ❌ Lento: espera una y después arranca la otra (secuencial)
async function malEjemplo() {
  const usuario = await obtenerUsuario(1);
  const productos = await obtenerProductos(); // arranca recién cuando termina la anterior
  return { usuario, productos };
}

// ✅ Mejor: si no dependen entre sí, lanzarlas en paralelo con Promise.all
async function buenEjemplo() {
  const [usuario, productos] = await Promise.all([
    obtenerUsuario(1),
    obtenerProductos(),
  ]);
  return { usuario, productos };
}
```

---

## 8. Try / Catch / Finally

El bloque `try/catch` es la forma estándar de **manejar errores** en JavaScript, y es la manera natural de capturar errores cuando se usa `async/await` (ya que no existen `.then()/.catch()` explícitos).

### Sintaxis básica

```js
try {
  // código que puede fallar
} catch (error) {
  // se ejecuta si algo dentro del try lanza una excepción
} finally {
  // se ejecuta siempre, haya error o no
}
```

### Ejemplo con función asíncrona

```js
async function obtenerDatos() {
  try {
    const respuesta = await fetch("https://api.ejemplo.com/datos");

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    console.log("Datos recibidos:", datos);
    return datos;

  } catch (error) {
    console.error("Falló la petición:", error.message);
    // acá se puede reintentar, devolver un valor por defecto, etc.

  } finally {
    console.log("Petición finalizada (con o sin éxito)");
  }
}
```

### Puntos clave sobre `try/catch` con `async/await`

- Si una función `await`-eada **rechaza** su promesa (o lanza un `throw`), el control salta inmediatamente al bloque `catch`.
- Si no hay ningún `try/catch` alrededor de un `await` que falla, el error se propaga hacia arriba como una promesa rechazada. Si nadie la captura, Node puede terminar mostrando un `UnhandledPromiseRejection`.
- `finally` es ideal para tareas de limpieza: cerrar conexiones a bases de datos, ocultar un *spinner* de carga, liberar archivos, etc.
- Se pueden anidar varios `try/catch`, o usar uno solo que envuelva varios `await` seguidos.

### Manejo de errores personalizados

```js
class ErrorDeValidacion extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDeValidacion";
  }
}

async function validarEdad(edad) {
  if (edad < 0) {
    throw new ErrorDeValidacion("La edad no puede ser negativa");
  }
  return edad;
}

async function ejecutar() {
  try {
    await validarEdad(-5);
  } catch (error) {
    if (error instanceof ErrorDeValidacion) {
      console.error("Error de validación:", error.message);
    } else {
      console.error("Error inesperado:", error);
    }
  }
}

ejecutar();
```

---

## 9. Errores comunes y buenas prácticas

1. **Olvidarse el `await`**
   ```js
   // ❌ Esto no espera la promesa, devuelve el objeto Promise sin resolver
   async function mal() {
     const datos = obtenerDatos(); // falta await
     console.log(datos); // Promise { <pending> }
   }
   ```

2. **No manejar errores en promesas sueltas**
   ```js
   // ❌ Si falla, se pierde el error silenciosamente (o crashea el proceso)
   obtenerDatos();

   // ✅ Mejor:
   obtenerDatos().catch((err) => console.error(err));
   ```

3. **Mezclar `.then()` con `async/await` sin necesidad** — elegir un estilo y mantenerlo consistente dentro de la misma función.

4. **Bloquear el hilo principal con bucles pesados síncronos** dentro de funciones que deberían ser rápidas (como manejadores de rutas HTTP).

5. **No usar `Promise.all` cuando las tareas son independientes**, perdiendo la ventaja de la ejecución en paralelo (ver punto 7).

6. **No capturar errores en el nivel más externo de la aplicación.** Es buena práctica tener un manejador global, por ejemplo:
   ```js
   process.on('unhandledRejection', (error) => {
     console.error('Promesa no manejada:', error);
   });
   ```

---

## 10. Funciones útiles relacionadas

| Función / Concepto | Descripción |
|---|---|
| `setTimeout(fn, ms)` | Ejecuta `fn` una vez, después de `ms` milisegundos. |
| `setInterval(fn, ms)` | Ejecuta `fn` repetidamente cada `ms` milisegundos. |
| `clearTimeout(id)` / `clearInterval(id)` | Cancela un timer antes de que se dispare. |
| `setImmediate(fn)` | Ejecuta `fn` apenas termine la fase actual del event loop. |
| `process.nextTick(fn)` | Ejecuta `fn` inmediatamente después de la operación actual, antes que cualquier otra fase del event loop. |
| `fs.promises` / `fs/promises` | Versión de las funciones del módulo `fs` que devuelven promesas en lugar de usar callbacks. |
| `util.promisify()` | Convierte una función basada en callbacks (estilo `(err, data) => {}`) en una función que devuelve una promesa. |
| `Promise.resolve(valor)` | Crea una promesa ya resuelta con ese valor. |
| `Promise.reject(error)` | Crea una promesa ya rechazada con ese error. |

### Ejemplo de `util.promisify`

```js
const util = require('util');
const fs = require('fs');

const readFileAsync = util.promisify(fs.readFile);

async function leer() {
  try {
    const contenido = await readFileAsync('archivo.txt', 'utf-8');
    console.log(contenido);
  } catch (error) {
    console.error(error);
  }
}
```

---

## 11. Resumen final / Cheatsheet

| Concepto | Idea clave |
|---|---|
| **Síncrono** | Se ejecuta línea por línea, bloqueando el hilo hasta terminar. |
| **Asíncrono** | Delega tareas lentas y sigue ejecutando el resto; el resultado llega "después". |
| **Callback** | Función pasada como argumento, ejecutada cuando termina una tarea asíncrona. Puede derivar en "Callback Hell". |
| **Promise** | Objeto que representa un valor futuro. Estados: *pending*, *fulfilled*, *rejected*. |
| **`.then() / .catch() / .finally()`** | Formas de reaccionar al resultado de una promesa. |
| **`async`** | Convierte una función en una que siempre devuelve una Promesa. |
| **`await`** | Pausa la ejecución de la función `async` actual hasta que la promesa se resuelva (no bloquea todo el programa). |
| **`try / catch / finally`** | Forma estándar de capturar errores, esencial junto con `async/await`. |
| **`Promise.all`** | Ejecuta promesas en paralelo, espera a todas, falla si una falla. |
| **`Promise.allSettled`** | Ejecuta en paralelo, espera a todas, nunca falla, informa el estado de cada una. |
| **`Promise.race`** | Devuelve el resultado de la primera promesa en resolverse o rechazarse. |

> **Regla de oro:** si una función usa `await` dentro, tiene que estar declarada como `async`. Y si hay un `await` que puede fallar, siempre conviene envolverlo en un `try/catch` para evitar errores no controlados.
