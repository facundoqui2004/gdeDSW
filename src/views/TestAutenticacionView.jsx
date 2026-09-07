import React from 'react';
import CodeBlock from '../components/CodeBlock';
import Callout from '../components/Callout';
import Quiz from '../components/Quiz';

const IMPORTS_CODE = `import { test, describe } from 'node:test'
import assert from 'node:assert'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config/environment.js'`;

const HASH_CODE = `describe('Test 1 — Autenticación', () => {

  const rawPassword = 'password123';
  const saltRounds = 10;

  test('1.1 — Hashing de contraseñas con bcrypt', async () => {
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    // El hash nunca es igual al texto plano
    assert.notStrictEqual(hashedPassword, rawPassword);

    // Siempre empieza con $2 (formato bcrypt)
    assert.ok(hashedPassword.startsWith('$2'), 'Formato bcrypt inválido');

    // Comparar contraseña correcta → true
    const isValid = await bcrypt.compare(rawPassword, hashedPassword);
    assert.strictEqual(isValid, true);

    // Comparar contraseña incorrecta → false
    const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
    assert.strictEqual(isInvalid, false);
  });
});`;

const JWT_SIGN_CODE = `test('1.2 — Firmar y verificar un JWT válido', () => {
  const payload = {
    usuarioId: 1,
    email: 'heroe@supergestor.com',
    role: 'METAHUMANO',
    perfil: 'HEROE',
  };

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

  // El token es un string de más de 20 caracteres (header.payload.signature)
  assert.strictEqual(typeof token, 'string');
  assert.ok(token.length > 20);

  const decoded = jwt.verify(token, config.jwtSecret);

  // Todos los campos del payload deben salir intactos
  assert.strictEqual(decoded.usuarioId, payload.usuarioId);
  assert.strictEqual(decoded.email, payload.email);
  assert.strictEqual(decoded.role, payload.role);
  assert.strictEqual(decoded.perfil, payload.perfil);

  // La expiración debe ser posterior a la emisión
  assert.ok(decoded.exp > decoded.iat);
});`;

const FAKE_SECRET_CODE = `test('1.3 — Rechazar token firmado con clave incorrecta', () => {
  const fakeSecret = 'not-the-real-secret';

  const payload = { usuarioId: 99, email: 'impostor@supergestor.com' };
  const tokenInvalido = jwt.sign(payload, fakeSecret, { expiresIn: '1h' });

  // jwt.verify lanza JsonWebTokenError — nunca devuelve false, EXPLOTA
  assert.throws(
    () => { jwt.verify(tokenInvalido, config.jwtSecret); },
    (err) => err.name === 'JsonWebTokenError',
    'Debería rechazar un token con firma inválida'
  );
});`;

const MALFORMED_CODE = `test('1.4 — Rechazar tokens mal formados', () => {
  const malformedTokens = ['', 'token.invalido', '12345', 'Bearer xyz'];

  for (const malformed of malformedTokens) {
    assert.throws(
      () => { jwt.verify(malformed, config.jwtSecret); },
      /jwt malformed|jwt must be provided/,
      \`Debería fallar con: "\${malformed}"\`
    );
  }
});`;

const quizQuestions = [
  {
    question: '¿Qué hace bcrypt.compare() internamente?',
    options: [
      'Desencripta el hash guardado y lo compara con el texto plano',
      'Vuelve a hashear el texto plano y compara si coincide con el hash guardado',
      'Compara ambos strings directamente con ===',
      'Genera un nuevo hash y reemplaza el almacenado',
    ],
    correct: 1,
    explanation: 'bcrypt es de un solo sentido — no se puede desencriptar. En cambio, vuelve a aplicar el mismo algoritmo al texto plano y compara el resultado con el hash almacenado.',
  },
  {
    question: '¿Qué ocurre cuando jwt.verify() recibe un token firmado con otra clave?',
    options: [
      'Devuelve null',
      'Devuelve false',
      'Lanza una excepción JsonWebTokenError',
      'Devuelve el payload igualmente',
    ],
    correct: 2,
    explanation: 'jwt.verify() NO devuelve false. Si la firma no coincide, lanza directamente una excepción. Por eso se usa assert.throws() en el test.',
  },
  {
    question: 'En el SuperGestor, ¿qué datos viajan dentro del payload del JWT?',
    options: [
      'Solo el email del usuario',
      'usuarioId, email, role y perfil',
      'La contraseña hasheada y el salt',
      'El token de sesión de la base de datos',
    ],
    correct: 1,
    explanation: 'El payload del JWT en el SuperGestor contiene: usuarioId, email, role (ej: METAHUMANO) y perfil (ej: HEROE / VILLANO). Nunca se guarda la contraseña.',
  },
  {
    question: '¿Qué método de assert se usa para verificar que una función lanza un error?',
    options: [
      'assert.strictEqual(fn(), Error)',
      'assert.ok(fn throws)',
      'assert.throws(fn, validador, mensaje)',
      'assert.rejects(fn)',
    ],
    correct: 2,
    explanation: 'assert.throws() recibe: 1) la función que debería fallar, 2) un validador (función o regex para el error), 3) un mensaje descriptivo si el assert no se cumple.',
  },
  {
    question: '¿Por qué se usan saltRounds = 10 en bcrypt?',
    options: [
      'Es el máximo que soporta bcrypt',
      'Es obligatorio por estándar ISO',
      'Es el valor de equilibrio entre seguridad y rendimiento — más rounds = más lento para ataques de fuerza bruta',
      'Para garantizar que el hash sea exactamente de 60 caracteres',
    ],
    correct: 2,
    explanation: 'Cada round extra duplica el trabajo computacional. 10 es el valor estándar que equilibra seguridad (resistencia a fuerza bruta) con velocidad aceptable para el servidor.',
  },
];

export default function TestAutenticacionView() {
  return (
    <article id="test-autenticacion-view">

      {/* ── HEADER ── */}
      <div id="auth-header">
        <div className="module-header">
          <span className="module-tag">Testing</span>
          <h1>🧪 Tests de Autenticación</h1>
          <p className="module-subtitle">
            Cómo el SuperGestor verifica que las contraseñas se hasheen correctamente con{' '}
            <code>bcrypt</code> y que los JWT se firmen, verifiquen y rechacen según corresponda.
          </p>
        </div>
      </div>

      <Callout type="note">
        Este módulo de tests valida el núcleo de seguridad del SuperGestor: que ninguna contraseña
        se guarde en texto plano, y que solo los tokens firmados con la clave oficial del servidor
        sean aceptados.
      </Callout>

      {/* ── SECCIÓN 1: IMPORTS ── */}
      <section id="auth-imports" className="doc-section">
        <h2>1. Imports y configuración</h2>
        <p>
          El archivo de test importa las tres dependencias de seguridad del proyecto y la
          configuración centralizada del entorno:
        </p>
        <CodeBlock code={IMPORTS_CODE} language="typescript" />

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Rol en el SuperGestor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>node:test</code></td>
                <td>Motor de testing nativo de Node.js. <code>describe</code> agrupa los tests del módulo de autenticación; <code>test</code> define cada caso.</td>
              </tr>
              <tr>
                <td><code>node:assert</code></td>
                <td>Librería nativa para comparar valores esperados vs reales. Si falla, el test falla.</td>
              </tr>
              <tr>
                <td><code>bcryptjs</code></td>
                <td>Hashea las contraseñas antes de guardarlas en la BD. Declarado en <code>middlewares</code> del proyecto.</td>
              </tr>
              <tr>
                <td><code>jsonwebtoken</code></td>
                <td>Genera y valida los JWT que identifican a los usuarios (metahumanos, burócratas) en cada request.</td>
              </tr>
              <tr>
                <td><code>config.jwtSecret</code></td>
                <td>Clave secreta leída desde las variables de entorno del SuperGestor. Es la firma que hace que un JWT sea confiable.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip">
          <code>describe()</code> es solo un contenedor organizativo. <code>test()</code> es cada
          prueba concreta que corre y puede pasar o fallar.
        </Callout>
      </section>

      {/* ── SECCIÓN 2: HASHING ── */}
      <section id="auth-hashing" className="doc-section">
        <h2>2. Test 1.1 — Hashing de contraseñas con bcrypt</h2>
        <p>
          En el SuperGestor, cuando un usuario crea su cuenta, su contraseña <strong>nunca</strong>{' '}
          se guarda en texto plano. Se hashea con <code>bcrypt</code> antes de persistir en la BD.
        </p>
        <CodeBlock code={HASH_CODE} language="typescript" />

        <h3>¿Qué se prueba?</h3>
        <ol>
          <li>El hash es distinto al texto original (<code>assert.notStrictEqual</code>).</li>
          <li>Tiene el formato correcto de bcrypt — empieza con <code>$2</code>.</li>
          <li>Comparar la contraseña correcta da <code>true</code>.</li>
          <li>Comparar una contraseña incorrecta da <code>false</code>.</li>
        </ol>

        <Callout type="warn">
          <strong>bcrypt.compare() no desencripta.</strong> Es de un solo sentido: vuelve a hashear
          el texto plano internamente y compara si el resultado coincide con el hash guardado.
          Nunca verás la contraseña original.
        </Callout>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Explicación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>bcrypt.hash(password, saltRounds)</code></td>
                <td>Convierte la contraseña en texto plano a un hash irreversible. Es asíncrona → <code>await</code>.</td>
              </tr>
              <tr>
                <td><code>saltRounds = 10</code></td>
                <td>Cada ronda extra duplica el trabajo computacional. 10 es el estándar de equilibrio seguridad/velocidad.</td>
              </tr>
              <tr>
                <td><code>bcrypt.compare(plano, hash)</code></td>
                <td>Vuelve a hashear y compara. Devuelve <code>true</code>/<code>false</code>. También asíncrona.</td>
              </tr>
              <tr>
                <td>Prefijo <code>$2a$ / $2b$</code></td>
                <td>Identifica que el string es un hash bcrypt válido.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN 3: JWT VÁLIDO ── */}
      <section id="auth-jwt-valid" className="doc-section">
        <h2>3. Test 1.2 — Firmar y verificar un JWT válido</h2>
        <p>
          Cuando un metahumano o burócrata inicia sesión en el SuperGestor, el servidor firma un JWT
          con sus datos de identidad. Ese token viaja en cada request posterior para autenticar al
          usuario sin necesidad de ir a la BD en cada pedido.
        </p>
        <CodeBlock code={JWT_SIGN_CODE} language="typescript" />

        <Callout type="note">
          El payload del JWT en el SuperGestor incluye <code>usuarioId</code>, <code>email</code>,{' '}
          <code>role</code> (ej: <em>METAHUMANO</em>) y <code>perfil</code> (ej: <em>HEROE</em> /{' '}
          <em>VILLANO</em>). Esto permite que los middlewares de autorización tomen decisiones sin
          consultar la BD.
        </Callout>

        <h3>Estructura de un JWT</h3>
        <p>
          Un JWT tiene 3 partes separadas por puntos: <code>header.payload.signature</code>. Por eso
          el test verifica que <code>token.length &gt; 20</code> y que sea un string.
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Campo automático</th>
                <th>Significado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>iat</code> (<em>issued at</em>)</td>
                <td>Timestamp de cuándo se creó el token.</td>
              </tr>
              <tr>
                <td><code>exp</code> (<em>expiration</em>)</td>
                <td>Timestamp de cuándo expira (iat + 1h en este caso).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN 4: TOKEN CON CLAVE FALSA ── */}
      <section id="auth-jwt-invalid" className="doc-section">
        <h2>4. Test 1.3 — Rechazar token con clave incorrecta</h2>
        <p>
          Esto simula el ataque más directo: alguien intenta forjar un token de metahumano sin
          conocer la clave secreta del SuperGestor.
        </p>
        <CodeBlock code={FAKE_SECRET_CODE} language="typescript" />

        <Callout type="warn">
          <code>jwt.verify()</code> <strong>no devuelve false</strong> cuando la firma falla —
          lanza directamente una excepción. Por eso se usa <code>assert.throws()</code> y no{' '}
          <code>assert.strictEqual(result, false)</code>.
        </Callout>

        <h3>¿Por qué importa en el SuperGestor?</h3>
        <p>
          Un atacante que capture un JWT de otro usuario podría intentar modificar su{' '}
          <code>role</code> o <code>perfil</code>. Al cambiar cualquier parte del payload sin la
          clave secreta, la firma no coincide y <code>jwt.verify()</code> falla inmediatamente.
        </p>
      </section>

      {/* ── SECCIÓN 5: TOKENS MAL FORMADOS ── */}
      <section id="auth-jwt-malformed" className="doc-section">
        <h2>5. Test 1.4 — Rechazar strings mal formados</h2>
        <p>
          El SuperGestor debe ser robusto ante cualquier basura que llegue en el header{' '}
          <code>Authorization</code>: strings vacíos, texto random, números o el clásico "Bearer
          xyz" sin token real.
        </p>
        <CodeBlock code={MALFORMED_CODE} language="typescript" />

        <Callout type="tip">
          El segundo argumento de <code>assert.throws</code> puede ser una <strong>expresión
          regular</strong> en vez de una función. Si el mensaje de error coincide con el patrón,
          el assert pasa. Acá se aceptan dos mensajes posibles:{' '}
          <code>/jwt malformed|jwt must be provided/</code>.
        </Callout>
      </section>

      {/* ── SECCIÓN 6: REFERENCIA RÁPIDA ── */}
      <section id="auth-assert-ref" className="doc-section">
        <h2>6. Métodos de assert — Referencia rápida</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Método</th>
                <th>Qué hace</th>
                <th>Usado en</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>assert.notStrictEqual(a, b)</code></td>
                <td>Falla si <code>a === b</code> (se espera que sean distintos).</td>
                <td>Test 1.1 — hash ≠ texto plano</td>
              </tr>
              <tr>
                <td><code>assert.strictEqual(a, b)</code></td>
                <td>Falla si <code>a !== b</code> (comparación estricta <code>===</code>).</td>
                <td>Test 1.1 — compare true/false; Test 1.2 — tipo string</td>
              </tr>
              <tr>
                <td><code>assert.ok(valor, msg)</code></td>
                <td>Falla si <code>valor</code> es falsy.</td>
                <td>Test 1.1 — startsWith('$2'); Test 1.2 — token.length &gt; 20</td>
              </tr>
              <tr>
                <td><code>assert.throws(fn, validador, msg)</code></td>
                <td>Falla si <code>fn()</code> NO lanza un error, o si el error no cumple el validador.</td>
                <td>Tests 1.3 y 1.4 — tokens inválidos</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN 7: CONCEPTOS CLAVE ── */}
      <section id="auth-concepts" className="doc-section">
        <h2>7. Conceptos clave del módulo de seguridad</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Explicación aplicada al SuperGestor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Hashing vs Encriptación</strong></td>
                <td>bcrypt es de un solo sentido. Las contraseñas de usuarios siempre se hashean, nunca se encriptan reversiblemente.</td>
              </tr>
              <tr>
                <td><strong>Salt rounds</strong></td>
                <td>Cada ronda extra duplica el trabajo para un atacante de fuerza bruta. 10 es el estándar actual.</td>
              </tr>
              <tr>
                <td><strong>JWT stateless</strong></td>
                <td>El SuperGestor no guarda sesiones en el servidor. Toda la identidad del usuario viaja en el token.</td>
              </tr>
              <tr>
                <td><strong>Claims</strong></td>
                <td>Los campos del payload JWT (<code>usuarioId</code>, <code>role</code>, <code>perfil</code>). Los middlewares de autorización los leen para tomar decisiones.</td>
              </tr>
              <tr>
                <td><strong>Async/await</strong></td>
                <td><code>bcrypt.hash</code> y <code>bcrypt.compare</code> son asíncronas. <code>jwt.sign</code>/<code>jwt.verify</code> son síncronas.</td>
              </tr>
              <tr>
                <td><strong>Firma digital</strong></td>
                <td>Si alguien modifica el payload del JWT sin la clave secreta, la firma no coincide y <code>verify()</code> lanza una excepción.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── QUIZ ── */}
      <section id="auth-quiz" className="doc-section">
        <h2>8. 📝 Quiz de Estudio</h2>
        <p>Comprobá que entendiste el módulo de autenticación del SuperGestor:</p>
        <Quiz questions={quizQuestions} />
      </section>

    </article>
  );
}
