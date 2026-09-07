# Resumen de estudio: Test de Autenticación, Hashing y JWT

Este test valida tres cosas: que las contraseñas se hasheen bien con **bcrypt**, que los **JWT** se firmen y verifiquen correctamente, y que se rechacen tokens inválidos o manipulados.

---

## 1. Imports y setup

```typescript
import { test, describe } from 'node:test'
import assert from 'node:assert'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config/environment.js'
```

| Módulo | Para qué sirve |
|---|---|
| `node:test` | Motor de testing nativo de Node.js. `describe` agrupa tests relacionados, `test` define un caso individual. |
| `node:assert` | Librería nativa para comparar valores esperados vs reales. Si la comparación falla, el test falla. |
| `bcryptjs` | Librería para hashear (encriptar de forma irreversible) contraseñas. |
| `jsonwebtoken` (jwt) | Librería para firmar y verificar tokens JWT (JSON Web Tokens), usados para autenticación. |
| `config.jwtSecret` | La clave secreta del proyecto usada para firmar/verificar los tokens. Viene de un archivo de configuración centralizado. |

**Idea clave:** `describe()` es solo un contenedor organizativo; `test()` es cada prueba concreta que corre y puede pasar o fallar.

---

## 2. Test 1.1 — Hashing de contraseñas con bcrypt

```typescript
const hashedPassword = await bcrypt.hash(rawPassword, saltRounds)
```

- **`bcrypt.hash(password, saltRounds)`**: toma la contraseña en texto plano y la convierte en un hash. Es asíncrona (por eso `await`).
- **`saltRounds` (acá 10)**: cuántas veces se aplica el algoritmo internamente ("costo" del hash). Más rounds = más seguro pero más lento. 10 es un valor estándar razonable.
- El resultado (`hashedPassword`) **nunca** es igual al texto original, y siempre empieza con `$2a$`, `$2b$` o similar — esa es la "firma" que identifica el formato bcrypt.

```typescript
const isValid = await bcrypt.compare(rawPassword, hashedPassword)
```

- **`bcrypt.compare(passwordPlano, hashGuardado)`**: NO desencripta el hash (bcrypt es de un solo sentido, irreversible). En cambio, vuelve a hashear el texto plano internamente y compara si el resultado coincide con el hash guardado. Devuelve `true`/`false`.

**Qué se está probando:**
1. Que el hash sea distinto al texto original (`assert.notStrictEqual`).
2. Que tenga el formato correcto (`assert.ok(...startsWith('$2'))`).
3. Que comparar la contraseña correcta dé `true`.
4. Que comparar una contraseña incorrecta dé `false`.

> **Por qué importa:** nunca se guardan contraseñas en texto plano en una base de datos. Se guarda el hash, y en el login se usa `compare()` para validar.

---

## 3. Test 1.2 — Firmar y verificar un JWT válido

```typescript
const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' })
```

- **`jwt.sign(payload, secreto, opciones)`**: crea un token firmado digitalmente.
  - `payload`: los datos que vas a "meter" dentro del token (acá: `usuarioId`, `email`, `role`, `perfil`).
  - `secreto`: la clave privada del servidor, usada para firmar el token (nadie sin esa clave puede generar un token válido).
  - `expiresIn: '1h'`: el token deja de ser válido en 1 hora.

Un JWT tiene 3 partes separadas por puntos: `header.payload.signature`. Por eso se verifica que `token.length > 20` y que sea un string.

```typescript
const decoded = jwt.verify(token, config.jwtSecret) as any
```

- **`jwt.verify(token, secreto)`**: valida la firma del token usando la misma clave secreta, y si es válida, **decodifica** el payload devolviendo un objeto con los datos originales + campos automáticos:
  - `iat` (*issued at*): timestamp de cuándo se creó el token.
  - `exp` (*expiration*): timestamp de cuándo expira.

**Qué se está probando:** que todos los datos que metiste en el `payload` salgan intactos al decodificar, y que `exp > iat` (o sea, que la expiración sea posterior a la emisión — tiene sentido temporal).

---

## 4. Test 1.3 — Rechazo de tokens firmados con clave incorrecta

```typescript
const tokenInvalido = jwt.sign(payload, fakeSecret, { expiresIn: '1h' })

assert.throws(() => {
  jwt.verify(tokenInvalido, config.jwtSecret)
}, (err) => err.name === 'JsonWebTokenError')
```

- Se genera un token firmado con una clave **distinta** a la oficial (`fakeSecret`).
- Al intentar verificarlo con la clave real (`config.jwtSecret`), la firma no coincide → `jwt.verify` **lanza una excepción** (no devuelve `false`, directamente explota).
- **`assert.throws(funcion, validador, mensaje)`**: es el assert especial para casos donde se espera que el código lance un error. Recibe:
  1. Una función que envuelve el código que debería fallar.
  2. Un validador (acá, una función que chequea que el error tenga `name === 'JsonWebTokenError'`).
  3. Un mensaje descriptivo si el assert falla.

**Por qué importa:** esto simula un intento de falsificación de token — alguien que no conoce la clave secreta del servidor no puede crear tokens válidos, ni aunque el formato "parezca" correcto.

---

## 5. Test 1.4 — Rechazo de strings mal formados

```typescript
const malformedTokens = ['', 'token.invalido', '12345', 'Bearer xyz']

for (const malformed of malformedTokens) {
  assert.throws(() => {
    jwt.verify(malformed, config.jwtSecret)
  }, /jwt malformed|jwt must be provided/, `...`)
}
```

- Se prueba una lista de strings que **no son JWTs reales** (vacío, texto random, solo números, con la palabra "Bearer" mal puesta).
- Para cada uno, se espera que `jwt.verify` explote.
- Acá el segundo argumento de `assert.throws` es una **expresión regular** (`/jwt malformed|jwt must be provided/`) en vez de una función: si el mensaje de error generado coincide con ese patrón (contiene "jwt malformed" **o** "jwt must be provided"), el assert pasa.

**Por qué importa:** valida que la librería sea robusta ante inputs basura, no solo ante tokens "casi válidos".

---

## 6. Métodos de `assert` usados (referencia rápida)

| Método | Qué hace |
|---|---|
| `assert.notStrictEqual(a, b)` | Falla si `a === b` (se espera que sean distintos). |
| `assert.strictEqual(a, b)` | Falla si `a !== b` (se espera que sean iguales, comparación estricta `===`). |
| `assert.ok(valor, msg)` | Falla si `valor` es falsy (`false`, `0`, `''`, `null`, `undefined`). |
| `assert.throws(fn, validador, msg)` | Falla si `fn()` **no** lanza un error, o si el error no cumple el validador (regex o función). |

---

## 7. Conceptos generales a repasar

- **Hashing vs Encriptación**: hashing (bcrypt) es de un solo sentido — no se puede "deshacer". Encriptación sí se puede revertir con una clave. Las contraseñas se hashean, nunca se encriptan reversiblemente.
- **Salt rounds**: cada ronda extra duplica el trabajo computacional necesario para hashear (y para un atacante que intente fuerza bruta).
- **JWT (JSON Web Token)**: estándar para transmitir información de forma segura y verificable entre partes, típicamente usado para sesiones de autenticación sin guardar estado en el servidor (*stateless*).
- **Claims**: los campos dentro del payload de un JWT (ej: `usuarioId`, `role`).
- **Async/await**: `bcrypt.hash` y `bcrypt.compare` son asíncronas porque el cálculo puede tardar; `jwt.sign`/`jwt.verify` son síncronas.
- **Firma digital**: lo que hace que un JWT sea confiable es que está firmado con una clave secreta que solo el servidor conoce — si alguien cambia el payload sin la clave, la firma no coincide y `verify()` falla.
