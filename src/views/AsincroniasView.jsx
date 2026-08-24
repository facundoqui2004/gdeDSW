import React, { useState, useEffect, useRef } from 'react';
import CodeBlock from '../components/CodeBlock';
import Callout from '../components/Callout';

/* ============================================================
   AsincroniasView.jsx
   Vista completa sobre Sincronía, Asincronía, Promesas,
   Async/Await y Manejo de Errores en Node.js — con ejemplos
   del código real del SuperGestor Backend.
   ============================================================ */

// ── Visual: Estado de Promise animado ──────────────────────────────────────
function PromiseStateVisual() {
  const [estado, setEstado] = useState('pending');
  const timer = useRef(null);

  const simular = (exito) => {
    setEstado('pending');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setEstado(exito ? 'fulfilled' : 'rejected');
    }, 1500);
  };

  const colores = {
    pending:   { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '⏳' },
    fulfilled: { bg: '#d1fae5', border: '#10b981', text: '#065f46', icon: '✅' },
    rejected:  { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '❌' },
  };

  const c = colores[estado];

  return (
    <div style={{
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      background: 'var(--code-bg)'
    }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text-muted)' }}>
        🧪 Simulador de estados de Promise
      </h4>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Burbuja de estado */}
        <div style={{
          padding: '16px 32px',
          borderRadius: '50px',
          backgroundColor: c.bg,
          border: `2px solid ${c.border}`,
          color: c.text,
          fontSize: '18px',
          fontWeight: 700,
          fontFamily: 'var(--font-family-mono)',
          transition: 'all 0.4s ease',
          minWidth: '220px',
          textAlign: 'center'
        }}>
          {c.icon} {estado.toUpperCase()}
        </div>

        {/* Diagrama de flujo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ padding: '6px 14px', borderRadius: '6px', background: '#fef3c7', border: '1px solid #f59e0b', fontSize: '12px', fontWeight: 600 }}>
            ⏳ pending
          </div>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <div style={{ padding: '6px 14px', borderRadius: '6px', background: '#d1fae5', border: '1px solid #10b981', fontSize: '12px', fontWeight: 600 }}>
            ✅ fulfilled
          </div>
          <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>|</span>
          <div style={{ padding: '6px 14px', borderRadius: '6px', background: '#fee2e2', border: '1px solid #ef4444', fontSize: '12px', fontWeight: 600 }}>
            ❌ rejected
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => simular(true)}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#10b981',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            resolve() ✅
          </button>
          <button
            onClick={() => simular(false)}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#ef4444',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            reject() ❌
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          Pulsá un botón para simular la resolución de una promesa (1.5s de delay)
        </p>
      </div>
    </div>
  );
}

// ── Visual: Comparación Síncrono vs Asíncrono ─────────────────────────────
function SyncAsyncVisual() {
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState(null); // 'sync' | 'async'
  const [log, setLog] = useState([]);
  const [step, setStep] = useState(0);

  const syncSteps = [
    { t: 0,    msg: '▶ Inicio del script', color: '#6366f1' },
    { t: 500,  msg: '🔒 BLOQUEANDO: esperando operación lenta (3s)...', color: '#f59e0b' },
    { t: 3500, msg: '✅ Operación lenta terminada', color: '#10b981' },
    { t: 3600, msg: '▶ Fin del script', color: '#6366f1' },
    { t: 3700, msg: '⚡ Total: 3.5 segundos bloqueado', color: '#ef4444' },
  ];

  const asyncSteps = [
    { t: 0,    msg: '▶ Inicio del script', color: '#6366f1' },
    { t: 100,  msg: '📤 Delegando operación lenta al sistema operativo...', color: '#8b5cf6' },
    { t: 200,  msg: '▶ Siguiente línea — NO bloqueado', color: '#6366f1' },
    { t: 300,  msg: '▶ Fin del script síncrono', color: '#6366f1' },
    { t: 1500, msg: '📥 [Callback] Operación lenta terminada', color: '#10b981' },
    { t: 1600, msg: '⚡ Total: 1.5s — Event Loop siempre libre', color: '#10b981' },
  ];

  const run = (modeToRun) => {
    if (running) return;
    setMode(modeToRun);
    setLog([]);
    setStep(0);
    setRunning(true);

    const steps = modeToRun === 'sync' ? syncSteps : asyncSteps;
    steps.forEach(({ t, msg, color }) => {
      setTimeout(() => {
        setLog(prev => [...prev, { msg, color }]);
      }, t);
    });

    const last = steps[steps.length - 1];
    setTimeout(() => setRunning(false), last.t + 200);
  };

  return (
    <div style={{
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      background: 'var(--code-bg)'
    }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text-muted)' }}>
        🎬 Simulador: Síncrono vs Asíncrono
      </h4>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => run('sync')}
          disabled={running}
          style={{
            padding: '8px 20px', borderRadius: '8px', border: 'none',
            background: running ? '#ccc' : '#f59e0b',
            color: running ? '#666' : '#fff',
            fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer', fontSize: '14px'
          }}
        >
          🔒 Ejecutar Síncrono (bloquea 3.5s)
        </button>
        <button
          onClick={() => run('async')}
          disabled={running}
          style={{
            padding: '8px 20px', borderRadius: '8px', border: 'none',
            background: running ? '#ccc' : '#6366f1',
            color: running ? '#666' : '#fff',
            fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer', fontSize: '14px'
          }}
        >
          ⚡ Ejecutar Asíncrono (no bloquea)
        </button>
      </div>

      {/* Terminal */}
      <div style={{
        background: '#0d1117',
        borderRadius: '8px',
        padding: '16px',
        minHeight: '140px',
        fontFamily: 'var(--font-family-mono)',
        fontSize: '13px'
      }}>
        {log.length === 0 && (
          <span style={{ color: '#4b5563' }}>// Pulsá un botón para ver la simulación...</span>
        )}
        {log.map((entry, i) => (
          <div key={i} style={{ color: entry.color, marginBottom: '4px' }}>
            <span style={{ color: '#4b5563', marginRight: '8px' }}>[{String(i + 1).padStart(2, '0')}]</span>
            {entry.msg}
          </div>
        ))}
        {running && (
          <span style={{ color: '#f59e0b', animation: 'none' }}>█</span>
        )}
      </div>
    </div>
  );
}

// ── Visual: Event Loop simplificado ───────────────────────────────────────
function EventLoopVisual() {
  const [phase, setPhase] = useState(0);

  const phases = [
    { label: 'Call Stack', desc: 'Se ejecuta el código síncrono línea a línea. Solo puede hacer una cosa a la vez.', color: '#6366f1', icon: '📚' },
    { label: 'Web APIs / libuv', desc: 'Las operaciones lentas (timers, I/O, fetch) se delegan aquí. Node sigue ejecutando.', color: '#f59e0b', icon: '⚙️' },
    { label: 'Callback Queue', desc: 'Cuando la operación termina, su callback se pone en cola esperando su turno.', color: '#8b5cf6', icon: '📋' },
    { label: 'Event Loop', desc: 'Cuando el Call Stack está vacío, el Event Loop toma callbacks de la cola y los empuja al Stack.', color: '#10b981', icon: '🔄' },
  ];

  return (
    <div style={{
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      background: 'var(--code-bg)'
    }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text-muted)' }}>
        🔄 El Event Loop — Explorá cada componente
      </h4>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {phases.map((p, i) => (
          <button
            key={i}
            onClick={() => setPhase(i)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: `2px solid ${phase === i ? p.color : 'var(--border-color)'}`,
              background: phase === i ? p.color : 'transparent',
              color: phase === i ? '#fff' : 'var(--text-body)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* Diagrama */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {phases.map((p, i) => (
          <React.Fragment key={i}>
            <div style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: phase === i ? p.color : 'var(--inline-code-bg)',
              color: phase === i ? '#fff' : 'var(--text-muted)',
              border: `2px solid ${phase === i ? p.color : 'var(--border-color)'}`,
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.3s',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px' }}>{p.icon}</div>
              <div>{p.label}</div>
            </div>
            {i < phases.length - 1 && (
              <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Descripción del paso seleccionado */}
      <div style={{
        padding: '16px',
        borderRadius: '8px',
        background: phases[phase].color + '22',
        border: `1px solid ${phases[phase].color}`,
        color: 'var(--text-body)',
        fontSize: '14px'
      }}>
        <strong style={{ color: phases[phase].color }}>{phases[phase].icon} {phases[phase].label}:</strong>{' '}
        {phases[phase].desc}
      </div>
    </div>
  );
}

// ── Visual: Try/Catch/Finally animado ─────────────────────────────────────
function TryCatchVisual() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const simular = (caso) => {
    setResultado(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResultado(caso);
    }, 1000);
  };

  const escenarios = {
    ok: {
      pasos: [
        { bloque: 'try', msg: 'await em.findOne(Usuario, { email }) → ✅ encontrado', color: '#10b981' },
        { bloque: 'try', msg: 'await bcrypt.compare(password, hash) → ✅ válida', color: '#10b981' },
        { bloque: 'try', msg: 'jwt.sign(...) → token generado', color: '#10b981' },
        { bloque: 'try', msg: 'res.json({ token }) → 200 OK', color: '#10b981' },
        { bloque: 'finally', msg: 'Petición finalizada', color: '#6b7280' },
      ]
    },
    notFound: {
      pasos: [
        { bloque: 'try', msg: 'await em.findOne(Usuario, { email }) → null (no existe)', color: '#f59e0b' },
        { bloque: 'try', msg: 'return res.status(401).json({ message: "Credenciales inválidas" })', color: '#f59e0b' },
        { bloque: 'finally', msg: 'Petición finalizada', color: '#6b7280' },
      ]
    },
    dbError: {
      pasos: [
        { bloque: 'try', msg: 'await em.findOne(...) → 💥 SequelizeConnectionError', color: '#ef4444' },
        { bloque: 'catch', msg: 'error capturado: "Connection refused"', color: '#ef4444' },
        { bloque: 'catch', msg: 'res.status(500).json({ message: "Error interno" })', color: '#ef4444' },
        { bloque: 'finally', msg: 'Petición finalizada', color: '#6b7280' },
      ]
    }
  };

  const bloqueBg = { try: '#d1fae5', catch: '#fee2e2', finally: 'var(--inline-code-bg)' };
  const bloqueBorder = { try: '#10b981', catch: '#ef4444', finally: 'var(--border-color)' };

  return (
    <div style={{
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      background: 'var(--code-bg)'
    }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text-muted)' }}>
        🛡️ Simulador: Try/Catch en el Login del SuperGestor
      </h4>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button
          onClick={() => simular('ok')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
        >
          ✅ Login exitoso
        </button>
        <button
          onClick={() => simular('notFound')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
        >
          ⚠️ Usuario no encontrado
        </button>
        <button
          onClick={() => simular('dbError')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
        >
          💥 Error de base de datos
        </button>
      </div>

      {loading && (
        <div style={{ color: '#f59e0b', fontFamily: 'var(--font-family-mono)', fontSize: '13px', marginBottom: '12px' }}>
          ⏳ Ejecutando función async login()...
        </div>
      )}

      {resultado && escenarios[resultado] && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {escenarios[resultado].pasos.map((paso, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: bloqueBg[paso.bloque],
                border: `1px solid ${bloqueBorder[paso.bloque]}`,
                animation: `fadeInDown 0.3s ease ${i * 0.1}s both`
              }}
            >
              <span style={{
                fontFamily: 'var(--font-family-mono)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: bloqueBorder[paso.bloque],
                color: '#fff',
                flexShrink: 0
              }}>
                {paso.bloque}
              </span>
              <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', color: paso.color }}>
                {paso.msg}
              </span>
            </div>
          ))}
        </div>
      )}

      {!resultado && !loading && (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
          Elegí un escenario para ver cómo fluye la ejecución por try / catch / finally
        </p>
      )}
    </div>
  );
}

// ── Visual: Promise.all vs secuencial ─────────────────────────────────────
function ParallelVsSerialVisual() {
  const [mode, setMode] = useState(null);
  const [bars, setBars] = useState([]);
  const [total, setTotal] = useState(null);
  const [running, setRunning] = useState(false);

  const tareas = [
    { name: 'em.findOne(Usuario, email)', dur: 300 },
    { name: 'bcrypt.compare(password, hash)', dur: 500 },
    { name: 'jwt.sign(payload, secret)', dur: 100 },
  ];

  const runSerial = () => {
    if (running) return;
    setMode('serial');
    setBars([]);
    setTotal(null);
    setRunning(true);

    let acc = 0;
    tareas.forEach((t, i) => {
      setTimeout(() => {
        setBars(prev => [...prev, { ...t, start: acc, done: false }]);
        acc += t.dur;
        setTimeout(() => {
          setBars(prev => prev.map((b, j) => j === i ? { ...b, done: true } : b));
          if (i === tareas.length - 1) {
            setTotal(tareas.reduce((s, x) => s + x.dur, 0));
            setRunning(false);
          }
        }, t.dur);
      }, i === 0 ? 0 : tareas.slice(0, i).reduce((s, x) => s + x.dur, 0));
    });
  };

  const runParallel = () => {
    if (running) return;
    setMode('parallel');
    setBars(tareas.map(t => ({ ...t, done: false })));
    setTotal(null);
    setRunning(true);

    const maxDur = Math.max(...tareas.map(t => t.dur));
    tareas.forEach((t, i) => {
      setTimeout(() => {
        setBars(prev => prev.map((b, j) => j === i ? { ...b, done: true } : b));
      }, t.dur);
    });
    setTimeout(() => {
      setTotal(maxDur);
      setRunning(false);
    }, maxDur + 50);
  };

  const maxDur = Math.max(...tareas.map(t => t.dur));

  return (
    <div style={{
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      background: 'var(--code-bg)'
    }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text-muted)' }}>
        ⚡ Simulador: await en serie vs Promise.all en paralelo
      </h4>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Tareas independientes del SuperGestor: buscar usuario, verificar password y generar token
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={runSerial}
          disabled={running}
          style={{
            padding: '8px 20px', borderRadius: '8px', border: 'none',
            background: running ? '#ccc' : '#f59e0b',
            color: running ? '#666' : '#fff',
            fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer'
          }}
        >
          ❌ await en serie (lento)
        </button>
        <button
          onClick={runParallel}
          disabled={running}
          style={{
            padding: '8px 20px', borderRadius: '8px', border: 'none',
            background: running ? '#ccc' : '#6366f1',
            color: running ? '#666' : '#fff',
            fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer'
          }}
        >
          ✅ Promise.all (paralelo)
        </button>
      </div>

      {bars.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {bars.map((b, i) => (
            <div key={i}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--font-family-mono)' }}>
                {b.name} ({b.dur}ms)
              </div>
              <div style={{ background: 'var(--border-color)', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: '4px',
                  background: b.done ? '#10b981' : '#6366f1',
                  width: `${(b.dur / maxDur) * 100}%`,
                  transition: `width ${b.dur}ms linear`,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '8px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  {b.done ? '✅' : '⏳'}
                </div>
              </div>
            </div>
          ))}

          {total !== null && (
            <div style={{
              marginTop: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              background: mode === 'parallel' ? '#d1fae5' : '#fef3c7',
              border: `1px solid ${mode === 'parallel' ? '#10b981' : '#f59e0b'}`,
              fontWeight: 700,
              fontSize: '14px',
              color: mode === 'parallel' ? '#065f46' : '#92400e'
            }}>
              {mode === 'parallel'
                ? `✅ Promise.all: ${total}ms (lo que tarde la más lenta)`
                : `⚠️ Serie: ${total}ms (suma de todas)`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente Principal ───────────────────────────────────────────────────
export default function AsincroniasView() {
  const [conceptoTab, setConceptoTab] = useState('sincrono');
  const [promisaTab, setPromisaTab] = useState('crear');
  const [awaitTab, setAwaitTab] = useState('basico');
  const [errorTab, setErrorTab] = useState('patron');

  return (
    <div className="doc-section">
      <h1>Asincronía en Node.js — Guía completa</h1>
      <p className="page-lead">
        Node.js corre en un <strong>único hilo</strong>. Sin asincronía, un servidor que espera una consulta a la base de datos bloquea a todos los demás usuarios. Esta guía explica cómo funciona la asincronía desde cero y la analiza en el código real del <strong>SuperGestor Backend</strong>.
      </p>

      <Callout type="note" title="¿Cómo está estructurado este módulo?">
        <p>Cada sección avanza un nivel de abstracción: <strong>Síncrono → Asíncrono → Event Loop → Callbacks → Promesas → Async/Await → Try/Catch</strong>. Al final encontrarás el cheatsheet y los errores comunes.</p>
      </Callout>

      {/* ================================================================
          1. SÍNCRONO vs ASÍNCRONO
          ================================================================ */}
      <div id="async-sinc-vs-asinc" style={{ marginTop: '48px', marginBottom: '64px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '36px', lineHeight: 1 }}>⚡</div>
          <div>
            <h2 style={{ fontSize: '24px', margin: 0, border: 'none', paddingBottom: 0 }}>
              1. Síncrono vs Asíncrono
            </h2>
            <p style={{ marginBottom: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
              La diferencia fundamental que gobierna todo en Node.js
            </p>
          </div>
        </div>

        <div className="breakdown-box">
          <div className="breakdown-header">
            <span className="breakdown-title">Concepto Base</span>
            <div className="tabs-nav">
              <button className={`tab-btn ${conceptoTab === 'sincrono' ? 'active' : ''}`} onClick={() => setConceptoTab('sincrono')}>Código Síncrono</button>
              <button className={`tab-btn ${conceptoTab === 'asincrono' ? 'active' : ''}`} onClick={() => setConceptoTab('asincrono')}>Código Asíncrono</button>
              <button className={`tab-btn ${conceptoTab === 'comparacion' ? 'active' : ''}`} onClick={() => setConceptoTab('comparacion')}>Comparación</button>
            </div>
          </div>

          {conceptoTab === 'sincrono' && (
            <div className="tab-content active">
              <h4>Código Síncrono (bloqueante)</h4>
              <p>El código síncrono se ejecuta <strong>línea por línea, en orden</strong>. Cada línea debe terminar antes de que empiece la siguiente. Si una línea tarda 5 segundos, todo lo demás queda bloqueado.</p>
              <CodeBlock
                title="Código síncrono simple"
                language="JavaScript"
                code={`console.log("Inicio");

function sumar(a, b) {
  return a + b;
}

const resultado = sumar(2, 3);
console.log(resultado); // 5

console.log("Fin");

// Salida en orden exacto:
// Inicio
// 5
// Fin`}
              />
              <Callout type="warn" title="El problema: código síncrono lento bloquea todo">
                <CodeBlock
                  title="Bucle bloqueante — NUNCA hacer esto en un servidor"
                  language="JavaScript"
                  code={`function tareaPesada() {
  const inicio = Date.now();
  while (Date.now() - inicio < 3000) {
    // bucle vacío que "traba" el hilo por 3 segundos
  }
  console.log("Tarea pesada terminada");
}

console.log("Antes");
tareaPesada(); // ❌ el servidor entero se congela 3 segundos
console.log("Después");

// Mientras tareaPesada() se ejecuta, Node.js NO puede:
// - responder otras peticiones HTTP
// - procesar eventos pendientes
// - hacer absolutamente nada más`}
                />
              </Callout>
            </div>
          )}

          {conceptoTab === 'asincrono' && (
            <div className="tab-content active">
              <h4>Código Asíncrono (no bloqueante)</h4>
              <p>El código asíncrono le dice a Node: <em>"Iniciá esta tarea, pero no te quedes esperando. Seguí con lo demás y cuando termine, avisame."</em></p>
              <CodeBlock
                title="setTimeout — el ejemplo más simple de asincronía"
                language="JavaScript"
                code={`console.log("Inicio");

setTimeout(() => {
  console.log("Esto se ejecuta después de 2 segundos");
}, 2000);

console.log("Fin");

// Salida:
// Inicio
// Fin
// Esto se ejecuta después de 2 segundos  ← llega después!`}
              />
              <Callout type="tip" title="¿Por qué 'Fin' sale antes?">
                <p>
                  <code>setTimeout</code> es asíncrono: Node <strong>agenda</strong> esa tarea y sigue ejecutando el resto del script sin esperarla. Eso es la ejecución <strong>no bloqueante</strong>, y es la clave de por qué Node.js puede manejar miles de conexiones simultáneas con un solo hilo.
                </p>
              </Callout>
            </div>
          )}

          {conceptoTab === 'comparacion' && (
            <div className="tab-content active">
              <SyncAsyncVisual />
              <div className="table-wrapper">
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th>Característica</th>
                      <th>Síncrono</th>
                      <th>Asíncrono</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Ejecución</td>
                      <td>Línea por línea, en orden</td>
                      <td>Delega y continúa</td>
                    </tr>
                    <tr>
                      <td>Hilo</td>
                      <td>🔒 Bloqueado durante operaciones lentas</td>
                      <td>✅ Libre siempre</td>
                    </tr>
                    <tr>
                      <td>Concurrencia</td>
                      <td>Un usuario a la vez</td>
                      <td>Miles de usuarios simultáneos</td>
                    </tr>
                    <tr>
                      <td>Dónde se usa</td>
                      <td>Cálculos rápidos en memoria</td>
                      <td>BD, APIs, archivos, timers</td>
                    </tr>
                    <tr>
                      <td>Riesgo</td>
                      <td>Bloquear el servidor completo</td>
                      <td>Olvidar await, no capturar errores</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
          2. EVENT LOOP
          ================================================================ */}
      <div id="async-event-loop" style={{ marginBottom: '64px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '16px',
          marginBottom: '24px',
          marginTop: '48px'
        }}>
          <div style={{ fontSize: '36px', lineHeight: 1 }}>🔄</div>
          <div>
            <h2 style={{ fontSize: '24px', margin: 0, border: 'none', paddingBottom: 0 }}>
              2. El Event Loop
            </h2>
            <p style={{ marginBottom: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
              El mecanismo que hace posible la asincronía en Node.js
            </p>
          </div>
        </div>

        <p>El <strong>Event Loop</strong> es el mecanismo interno de Node que orquesta todo:</p>

        <ol>
          <li>Ejecuta el código síncrono primero (el <em>call stack</em>).</li>
          <li>Cuando encuentra una operación asíncrona, la <strong>delega</strong> y sigue de largo.</li>
          <li>Cuando esa operación termina, coloca su callback en una <strong>cola (queue)</strong>.</li>
          <li>Una vez que el call stack está vacío, el Event Loop toma las funciones de la cola y las ejecuta.</li>
        </ol>

        <EventLoopVisual />

        <Callout type="note" title="La regla de oro del Event Loop">
          <p>
            El código síncrono <strong>siempre se ejecuta primero, completo</strong>, antes de que se procese cualquier callback asíncrono pendiente. Nunca interrumpirá el código que ya está corriendo.
          </p>
        </Callout>
      </div>

      {/* ================================================================
          3. CALLBACKS
          ================================================================ */}
      <div id="async-callbacks" style={{ marginBottom: '64px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '16px',
          marginBottom: '24px',
          marginTop: '48px'
        }}>
          <div style={{ fontSize: '36px', lineHeight: 1 }}>📞</div>
          <div>
            <h2 style={{ fontSize: '24px', margin: 0, border: 'none', paddingBottom: 0 }}>
              3. Callbacks — el origen de todo
            </h2>
            <p style={{ marginBottom: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
              La primera solución al problema asíncrono — y sus problemas
            </p>
          </div>
        </div>

        <p>
          Antes de que existieran las Promesas, la asincronía en Node se manejaba con <strong>callbacks</strong>: funciones que se pasan como argumento y se ejecutan cuando la tarea asíncrona termina. El <code>server.js</code> del SuperGestor mismo usa un callback para leer archivos.
        </p>

        <CodeBlock
          title="server.js del SuperGestor — fs.readFile con callback"
          language="JavaScript"
          code={`import fs from 'fs';

// Ejemplo del server.js del SuperGestor
fs.readFile(filePath, (err, content) => {
  //                  ^^^^^^^^^^^^^^^^^^^ callback
  if (err) {
    // Si algo falla, el error llega como primer argumento
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Error interno del servidor al cargar el archivo.');
  } else {
    // Si todo salió bien, el contenido llega como segundo argumento
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content); // Enviamos el archivo al navegador
  }
});
// ← Node.js sigue ejecutando código aquí mientras lee el archivo`}
        />

        <h3>El problema: "Callback Hell"</h3>
        <p>Cuando hay que encadenar varias operaciones asíncronas dependientes entre sí, el código se empieza a anidar cada vez más:</p>

        <div className="concept-grid">
          <div className="concept-card" style={{ borderLeft: '4px solid var(--danger-border)' }}>
            <div className="card-icon">😱</div>
            <h4>Callback Hell (MAL)</h4>
            <CodeBlock
              title=""
              language="JavaScript"
              code={`fs.readFile('usuarios.txt', (err1, data1) => {
  if (err1) return console.error(err1);
  db.query('SELECT...', (err2, rows) => {
    if (err2) return console.error(err2);
    bcrypt.hash(pass, 10, (err3, hash) => {
      if (err3) return console.error(err3);
      // ...y así hasta el infinito 😰
      // Esto se llama "Pyramid of Doom"
    });
  });
});`}
            />
          </div>
          <div className="concept-card" style={{ borderLeft: '4px solid var(--tip-border)' }}>
            <div className="card-icon">😌</div>
            <h4>Con Async/Await (BIEN)</h4>
            <CodeBlock
              title=""
              language="TypeScript"
              code={`// El mismo flujo, pero legible y lineal
async function registrar(data) {
  const data1 = await fs.readFile('usuarios.txt');
  const rows = await db.query('SELECT...');
  const hash = await bcrypt.hash(pass, 10);
  // ✅ Lineal, fácil de leer y debuggear
}`}
            />
          </div>
        </div>
      </div>

      {/* ================================================================
          4. PROMESAS
          ================================================================ */}
      <div id="async-promesas" style={{ marginBottom: '64px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '16px',
          marginBottom: '24px',
          marginTop: '48px'
        }}>
          <div style={{ fontSize: '36px', lineHeight: 1 }}>🤝</div>
          <div>
            <h2 style={{ fontSize: '24px', margin: 0, border: 'none', paddingBottom: 0 }}>
              4. Promesas (Promises)
            </h2>
            <p style={{ marginBottom: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
              Un objeto que representa el resultado futuro de una operación asíncrona
            </p>
          </div>
        </div>

        <PromiseStateVisual />

        <div className="breakdown-box">
          <div className="breakdown-header">
            <span className="breakdown-title">Estudio en profundidad de las Promesas</span>
            <div className="tabs-nav">
              <button className={`tab-btn ${promisaTab === 'crear' ? 'active' : ''}`} onClick={() => setPromisaTab('crear')}>Crear</button>
              <button className={`tab-btn ${promisaTab === 'consumir' ? 'active' : ''}`} onClick={() => setPromisaTab('consumir')}>Consumir</button>
              <button className={`tab-btn ${promisaTab === 'combinadores' ? 'active' : ''}`} onClick={() => setPromisaTab('combinadores')}>Combinadores</button>
              <button className={`tab-btn ${promisaTab === 'supergestor' ? 'active' : ''}`} onClick={() => setPromisaTab('supergestor')}>En el SuperGestor</button>
            </div>
          </div>

          {promisaTab === 'crear' && (
            <div className="tab-content active">
              <h4>Anatomía de una Promesa</h4>
              <CodeBlock
                title="Crear una Promise manualmente"
                language="JavaScript"
                code={`const miPromesa = new Promise((resolve, reject) => {
  // El executor se ejecuta inmediatamente (de forma síncrona)
  const exito = true;

  setTimeout(() => {
    if (exito) {
      resolve("¡Todo salió bien!"); // → estado: fulfilled
    } else {
      reject(new Error("Algo salió mal")); // → estado: rejected
    }
  }, 1000);
});

// En el SuperGestor no creamos Promesas manualmente así:
// MikroORM y bcryptjs ya devuelven Promesas internamente.
// Solo necesitamos consumirlas con await.`}
              />
              <div className="table-wrapper">
                <table className="doc-table">
                  <thead>
                    <tr><th>Estado</th><th>Cuándo ocurre</th><th>Qué devuelve</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>⏳ pending</span></td>
                      <td>Estado inicial, la operación no terminó</td>
                      <td>Nada todavía</td>
                    </tr>
                    <tr>
                      <td><span style={{ background: '#d1fae5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>✅ fulfilled</span></td>
                      <td>La operación terminó con éxito (<code>resolve()</code>)</td>
                      <td>El valor pasado a <code>resolve()</code></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: '#fee2e2', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>❌ rejected</span></td>
                      <td>La operación falló (<code>reject()</code> o excepción)</td>
                      <td>El error pasado a <code>reject()</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {promisaTab === 'consumir' && (
            <div className="tab-content active">
              <h4>Consumir una Promesa: <code>.then()</code>, <code>.catch()</code>, <code>.finally()</code></h4>
              <CodeBlock
                title="Encadenamiento de .then/.catch/.finally"
                language="JavaScript"
                code={`miPromesa
  .then((resultado) => {
    // Se ejecuta si la promesa se resuelve (resolve)
    console.log("Éxito:", resultado);
    return resultado.toUpperCase(); // Se puede transformar y devolver
  })
  .then((transformado) => {
    // Los .then() se encadenan — recibe lo que devuelve el anterior
    console.log("Transformado:", transformado);
  })
  .catch((error) => {
    // Se ejecuta si la promesa se rechaza O si algún .then() lanza error
    console.error("Error:", error.message);
  })
  .finally(() => {
    // Siempre se ejecuta, haya éxito o error
    // Ideal para: cerrar conexiones, ocultar loaders, liberar recursos
    console.log("Petición finalizada");
  });`}
              />
              <Callout type="tip" title="¿Cuándo usar .then() vs await?">
                <p>
                  En el SuperGestor (y en cualquier codebase moderno) se prefiere <code>async/await</code> por legibilidad. El <code>.then()/.catch()</code> es útil cuando no estás dentro de una función <code>async</code> o cuando querés encadenar transformaciones de datos de forma funcional.
                </p>
              </Callout>
            </div>
          )}

          {promisaTab === 'combinadores' && (
            <div className="tab-content active">
              <h4>Ejecutar múltiples Promesas</h4>
              <CodeBlock
                title="Promise.all, Promise.race y Promise.allSettled"
                language="JavaScript"
                code={`const p1 = Promise.resolve(10);
const p2 = new Promise((resolve) => setTimeout(() => resolve(20), 500));
const p3 = Promise.resolve(30);

// ✅ Promise.all — espera que TODAS terminen
// Si UNA falla, rechaza todo el conjunto
Promise.all([p1, p2, p3]).then((resultados) => {
  console.log(resultados); // [10, 20, 30]
});

// 🏁 Promise.race — devuelve el resultado de la que termine PRIMERO
Promise.race([p1, p2, p3]).then((resultado) => {
  console.log("Ganadora:", resultado); // 10 (p1 ya estaba resuelta)
});

// 🛡️ Promise.allSettled — espera a TODAS, nunca rechaza
// Informa el estado de cada una (útil cuando querés todos los resultados
// sin que una falla cancele las demás)
Promise.allSettled([p1, p2, p3]).then((resultados) => {
  console.log(resultados);
  // [
  //   { status: 'fulfilled', value: 10 },
  //   { status: 'fulfilled', value: 20 },
  //   { status: 'fulfilled', value: 30 }
  // ]
});`}
              />
            </div>
          )}

          {promisaTab === 'supergestor' && (
            <div className="tab-content active">
              <h4>¿Dónde están las Promesas en el SuperGestor?</h4>
              <p>En el SuperGestor no creamos Promesas manualmente. Estas librerías ya devuelven Promesas que consumimos con <code>await</code>:</p>
              <div className="table-wrapper">
                <table className="doc-table">
                  <thead>
                    <tr><th>Llamada</th><th>¿Qué devuelve?</th><th>Dónde se usa</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>em.findOne()</code></td>
                      <td><code>Promise&lt;Entity | null&gt;</code></td>
                      <td>Todos los controllers</td>
                    </tr>
                    <tr>
                      <td><code>em.persistAndFlush()</code></td>
                      <td><code>Promise&lt;void&gt;</code></td>
                      <td>Operaciones de escritura en BD</td>
                    </tr>
                    <tr>
                      <td><code>bcrypt.hash()</code></td>
                      <td><code>Promise&lt;string&gt;</code></td>
                      <td><code>registrarMetahumano()</code>, <code>login()</code></td>
                    </tr>
                    <tr>
                      <td><code>bcrypt.compare()</code></td>
                      <td><code>Promise&lt;boolean&gt;</code></td>
                      <td><code>login()</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <CodeBlock
                title="usuario.controller.ts — las promesas que usamos"
                language="TypeScript"
                code={`// Cada una de estas líneas es una Promesa que awaiteamos:

const existeUsuario = await em.findOne(Usuario, { email })
//    ^^^^^^^^^^^^^^ Promise<Usuario | null>

const passwordHash = await bcrypt.hash(password, 10)
//    ^^^^^^^^^^^^^ Promise<string>

await em.persistAndFlush([usuario, metahumano])
// Promise<void> — solo esperamos que termine

const passwordValida = await bcrypt.compare(password, usuario.passwordHash)
//    ^^^^^^^^^^^^^^^ Promise<boolean>`}
              />
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
          5. ASYNC / AWAIT
          ================================================================ */}
      <div id="async-async-await" style={{ marginBottom: '64px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '16px',
          marginBottom: '24px',
          marginTop: '48px'
        }}>
          <div style={{ fontSize: '36px', lineHeight: 1 }}>✨</div>
          <div>
            <h2 style={{ fontSize: '24px', margin: 0, border: 'none', paddingBottom: 0 }}>
              5. Async / Await
            </h2>
            <p style={{ marginBottom: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
              La forma moderna de escribir código asíncrono como si fuera síncrono
            </p>
          </div>
        </div>

        <p>
          <code>async</code> y <code>await</code> son <strong>azúcar sintáctico</strong> sobre las Promesas. Permiten escribir código asíncrono con una <strong>apariencia síncrona</strong> — mucho más legible y mantenible.
        </p>

        <div className="breakdown-box">
          <div className="breakdown-header">
            <span className="breakdown-title">Async/Await en profundidad</span>
            <div className="tabs-nav">
              <button className={`tab-btn ${awaitTab === 'basico' ? 'active' : ''}`} onClick={() => setAwaitTab('basico')}>Reglas básicas</button>
              <button className={`tab-btn ${awaitTab === 'supergestor' ? 'active' : ''}`} onClick={() => setAwaitTab('supergestor')}>En el SuperGestor</button>
              <button className={`tab-btn ${awaitTab === 'paralelo' ? 'active' : ''}`} onClick={() => setAwaitTab('paralelo')}>Paralelo vs Serie</button>
            </div>
          </div>

          {awaitTab === 'basico' && (
            <div className="tab-content active">
              <h4>Las 3 reglas fundamentales</h4>
              <div className="concept-grid">
                <div className="concept-card">
                  <div className="card-icon">1️⃣</div>
                  <h4><code>async</code> antes de la función</h4>
                  <p>Hace que la función <strong>siempre devuelva una Promesa</strong>. Incluso si devuelve un valor normal, lo envuelve en una Promesa resuelta.</p>
                </div>
                <div className="concept-card">
                  <div className="card-icon">2️⃣</div>
                  <h4><code>await</code> pausa la función</h4>
                  <p>Pausa la ejecución <strong>de esa función</strong> (no de todo el programa) hasta que la promesa se resuelva. El Event Loop sigue libre.</p>
                </div>
                <div className="concept-card">
                  <div className="card-icon">3️⃣</div>
                  <h4><code>await</code> solo dentro de <code>async</code></h4>
                  <p>No se puede usar <code>await</code> en funciones normales. Solo en funciones declaradas con <code>async</code>.</p>
                </div>
              </div>
              <CodeBlock
                title="Demostración de async/await"
                language="JavaScript"
                code={`function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ejemplo() {
  console.log("Inicio de la función async");
  await esperar(2000); // pausa ESTA función 2 segundos — Node sigue libre
  console.log("Pasaron 2 segundos");
  return "hecho"; // devuelve una Promise<"hecho">
}

ejemplo();
console.log("Esto se imprime ANTES de 'Pasaron 2 segundos'");

// Salida:
// Inicio de la función async
// Esto se imprime ANTES de 'Pasaron 2 segundos'
// Pasaron 2 segundos`}
              />
            </div>
          )}

          {awaitTab === 'supergestor' && (
            <div className="tab-content active">
              <h4>Async/Await en el SuperGestor — función <code>login()</code></h4>
              <p>
                Todos los handlers del backend del SuperGestor son funciones <code>async</code>. Esto es lo que les permite usar <code>await</code> para esperar las respuestas de MikroORM y bcryptjs sin bloquear el servidor.
              </p>
              <CodeBlock
                title="usuario.controller.ts — login() completo con async/await"
                language="TypeScript"
                code={`// ← 'async' convierte esta función en una que devuelve Promise<void>
export async function login(req: Request, res: Response) {
  // Cada 'await' pausa ESTA función y libera el Event Loop
  
  // 1. await: espera la respuesta de la base de datos
  const usuario = await em.findOne(Usuario, { email }, {
    populate: ['metahumano', 'burocrata']
  })
  //           ↑ em.findOne() devuelve Promise<Usuario | null>
  //             await extrae el valor: 'usuario' es Usuario | null

  if (!usuario) {
    return res.status(401).json({ message: 'Credenciales inválidas' })
  }

  // 2. await: espera el cálculo criptográfico de bcrypt
  const passwordValida = await bcrypt.compare(password, usuario.passwordHash)
  //    ↑ Promise<boolean> → boolean
  
  if (!passwordValida) {
    return res.status(401).json({ message: 'Credenciales inválidas' })
  }

  // jwt.sign() es síncrono (no necesita await)
  const token = jwt.sign({ usuarioId: usuario.id, role: usuario.role }, JWT_SECRET)

  res.json({ message: 'Login exitoso', token })
}`}
              />
              <Callout type="deep-dive" title="🔍 ¿Por qué em.findOne() necesita await?">
                <p>
                  MikroORM hace una consulta SQL a la base de datos. Eso implica una petición de red (o disco) que puede tardar decenas de milisegundos. Si Node se quedara bloqueado esperando, no podría atender ninguna otra petición en ese tiempo. Con <code>await</code>, delega la espera al Event Loop y queda libre para servir a otros usuarios.
                </p>
              </Callout>
            </div>
          )}

          {awaitTab === 'paralelo' && (
            <div className="tab-content active">
              <h4>Error común: await en serie cuando las tareas son independientes</h4>
              <ParallelVsSerialVisual />
              <div className="concept-grid">
                <div className="concept-card" style={{ borderLeft: '4px solid var(--danger-border)' }}>
                  <div className="card-icon">❌</div>
                  <h4>Serie (lento)</h4>
                  <CodeBlock
                    title=""
                    language="TypeScript"
                    code={`// ❌ Lento: espera uno, luego empieza el otro
async function login() {
  const usuario = await em.findOne(...)   // 300ms
  const hash = await bcrypt.compare(...)  // 500ms ← arranca recién acá
  // Total: ~800ms
}`}
                  />
                </div>
                <div className="concept-card" style={{ borderLeft: '4px solid var(--tip-border)' }}>
                  <div className="card-icon">✅</div>
                  <h4>Paralelo (rápido)</h4>
                  <CodeBlock
                    title=""
                    language="TypeScript"
                    code={`// ✅ Si son independientes, usá Promise.all
async function login() {
  const [usuario, config] = await Promise.all([
    em.findOne(Usuario, { email }),
    em.findOne(Config, { active: true })
  ]);
  // Total: ~300ms (el más lento de los dos)
}`}
                  />
                </div>
              </div>
              <Callout type="warn" title="Cuándo NO usar Promise.all">
                <p>
                  Si la segunda tarea depende del resultado de la primera (como en el login: primero buscamos el usuario y <em>con ese usuario</em> verificamos la contraseña), <strong>debés mantenerlas en serie</strong> con <code>await</code> uno tras otro. <code>Promise.all</code> solo aplica cuando las tareas son completamente independientes entre sí.
                </p>
              </Callout>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
          6. TRY / CATCH / FINALLY
          ================================================================ */}
      <div id="async-try-catch" style={{ marginBottom: '64px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '16px',
          marginBottom: '24px',
          marginTop: '48px'
        }}>
          <div style={{ fontSize: '36px', lineHeight: 1 }}>🛡️</div>
          <div>
            <h2 style={{ fontSize: '24px', margin: 0, border: 'none', paddingBottom: 0 }}>
              6. Try / Catch / Finally
            </h2>
            <p style={{ marginBottom: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
              La forma estándar de capturar errores en código async/await
            </p>
          </div>
        </div>

        <p>
          Cuando una Promesa se rechaza dentro de un bloque <code>await</code>, lanza una excepción. El <code>try/catch</code> es el mecanismo estándar para capturarla.
        </p>

        <TryCatchVisual />

        <div className="breakdown-box">
          <div className="breakdown-header">
            <span className="breakdown-title">Try/Catch en el SuperGestor</span>
            <div className="tabs-nav">
              <button className={`tab-btn ${errorTab === 'patron' ? 'active' : ''}`} onClick={() => setErrorTab('patron')}>El patrón</button>
              <button className={`tab-btn ${errorTab === 'registro' ? 'active' : ''}`} onClick={() => setErrorTab('registro')}>registrarMetahumano()</button>
              <button className={`tab-btn ${errorTab === 'claves' ? 'active' : ''}`} onClick={() => setErrorTab('claves')}>Puntos clave</button>
            </div>
          </div>

          {errorTab === 'patron' && (
            <div className="tab-content active">
              <h4>El patrón estándar de todos los controllers</h4>
              <p>
                <strong>Todos</strong> los handlers del SuperGestor siguen exactamente el mismo patrón: envuelven todo el código en un <code>try/catch</code>. Esto garantiza que ningún error inesperado crashee el servidor.
              </p>
              <CodeBlock
                title="Patrón universal de handler en el SuperGestor"
                language="TypeScript"
                code={`export async function miHandler(req: Request, res: Response) {
  try {
    // ─── ZONA FELIZ ──────────────────────────────────────────
    // Todo el código de negocio va acá.
    // Si algún await falla, salta INMEDIATAMENTE al catch.
    
    const datos = await em.findOne(...)        // await 1
    const hash  = await bcrypt.hash(pass, 10)  // await 2
    await em.persistAndFlush(entidad)          // await 3
    
    res.status(201).json({ message: 'OK', datos })
    
  } catch (error: any) {
    // ─── ZONA DE ERROR ───────────────────────────────────────
    // Se ejecuta si CUALQUIER await dentro del try falla.
    // También captura errores síncronos (throw, TypeError, etc.)
    
    console.error('Error en miHandler:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
  // No hay finally en estos handlers porque Express no tiene
  // recursos que limpiar entre peticiones (MikroORM lo maneja solo).
}`}
              />
            </div>
          )}

          {errorTab === 'registro' && (
            <div className="tab-content active">
              <h4>Flujo completo de <code>registrarMetahumano()</code></h4>
              <CodeBlock
                title="usuario.controller.ts — registrarMetahumano() con manejo de errores"
                language="TypeScript"
                code={`export async function registrarMetahumano(req: Request, res: Response) {
  try {
    const { email, telefono, password, nombre, alias, origen } = req.body

    // ── Validaciones síncronas (sin await) ─────────────────
    if (!email || !password || !nombre) {
      // return + res.status() corta la función y responde 400
      return res.status(400).json({ 
        message: 'Campos requeridos: email, password, nombre' 
      })
    }

    // ── await 1: Verificar unicidad del email en BD ─────────
    // Si la BD no responde → catch lo captura con 500
    const existeUsuario = await em.findOne(Usuario, { email })
    if (existeUsuario) {
      return res.status(400).json({ message: 'Email ya registrado' })
    }

    // ── await 2: Hash de la contraseña ─────────────────────
    // bcrypt.hash() puede fallar si la password es undefined
    const passwordHash = await bcrypt.hash(password, 10)

    // ── Operaciones síncronas: crear las entidades ──────────
    const usuario = new Usuario()
    usuario.email     = email
    usuario.passwordHash = passwordHash
    usuario.role      = UserRole.METAHUMANO

    const metahumano = new Metahumano()
    metahumano.nombre  = nombre
    metahumano.alias   = alias
    metahumano.usuario = usuario
    usuario.metahumano = metahumano

    // ── await 3: Guardar en la base de datos ────────────────
    // Si hay un error de BD (constraint, conexión), catch lo captura
    await em.persistAndFlush([usuario, metahumano])

    // ── jwt.sign() es síncrono ──────────────────────────────
    const token = jwt.sign(
      { usuarioId: usuario.id, role: usuario.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.cookie('auth_token', token, { httpOnly: true, sameSite: 'lax' })
    res.status(201).json({ message: 'Metahumano registrado', token })

  } catch (error: any) {
    // Captura CUALQUIER fallo de los 3 awaits anteriores
    console.error('Error en registro de metahumano:', error)
    res.status(500).json({ 
      message: 'Error interno del servidor', 
      error: error.message  // Solo en desarrollo; quitar en producción
    })
  }
}`}
              />
            </div>
          )}

          {errorTab === 'claves' && (
            <div className="tab-content active">
              <h4>Puntos clave sobre try/catch con async/await</h4>
              <div className="table-wrapper">
                <table className="doc-table">
                  <thead>
                    <tr><th>Concepto</th><th>Explicación</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Si un <code>await</code> falla</td>
                      <td>El control salta <strong>inmediatamente</strong> al bloque <code>catch</code>. El código que hay después de ese <code>await</code> dentro del <code>try</code> no se ejecuta.</td>
                    </tr>
                    <tr>
                      <td>Sin <code>try/catch</code></td>
                      <td>Si nadie captura el error, Node puede mostrar un <code>UnhandledPromiseRejection</code> y crashear el proceso.</td>
                    </tr>
                    <tr>
                      <td><code>finally</code></td>
                      <td>Ideal para limpiar recursos: cerrar conexiones, ocultar loaders, liberar archivos. <strong>Siempre se ejecuta</strong>, haya error o no.</td>
                    </tr>
                    <tr>
                      <td>Errores síncronos</td>
                      <td><code>try/catch</code> también captura errores síncronos dentro del bloque <code>try</code>, no solo los de <code>await</code>.</td>
                    </tr>
                    <tr>
                      <td>Manejo global</td>
                      <td>Buena práctica: agregar un manejador global para lo que se escape: <code>process.on('unhandledRejection', handler)</code>.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <CodeBlock
                title="Manejador global de promesas no capturadas"
                language="TypeScript"
                code={`// Agregar en el punto de entrada del servidor (server.ts / app.ts)
process.on('unhandledRejection', (error) => {
  console.error('⚠️ Promesa no manejada:', error);
  // En producción podrías: notificar a Sentry, hacer graceful shutdown, etc.
});`}
              />
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
          7. ERRORES COMUNES Y CHEATSHEET
          ================================================================ */}
      <div id="async-errores-comunes" style={{ marginBottom: '64px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '16px',
          marginBottom: '24px',
          marginTop: '48px'
        }}>
          <div style={{ fontSize: '36px', lineHeight: 1 }}>⚠️</div>
          <div>
            <h2 style={{ fontSize: '24px', margin: 0, border: 'none', paddingBottom: 0 }}>
              7. Errores comunes
            </h2>
            <p style={{ marginBottom: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
              Los 5 errores más frecuentes al trabajar con asincronía en Node.js
            </p>
          </div>
        </div>

        <div className="concept-grid">
          <div className="concept-card" style={{ borderLeft: '4px solid var(--danger-border)' }}>
            <div className="card-icon">❌</div>
            <h4>1. Olvidarse el <code>await</code></h4>
            <CodeBlock
              title=""
              language="TypeScript"
              code={`// ❌ Esto devuelve la Promise sin resolver:
async function mal() {
  const datos = obtenerDatos(); // falta await
  console.log(datos); // Promise { <pending> }
}

// ✅ Con await:
async function bien() {
  const datos = await obtenerDatos();
  console.log(datos); // { nombre: 'Tony Stark', ... }
}`}
            />
          </div>

          <div className="concept-card" style={{ borderLeft: '4px solid var(--danger-border)' }}>
            <div className="card-icon">❌</div>
            <h4>2. Promesas sueltas sin captura</h4>
            <CodeBlock
              title=""
              language="TypeScript"
              code={`// ❌ Si falla, el error se pierde silenciosamente
em.persistAndFlush(usuario);

// ✅ Siempre await o .catch():
await em.persistAndFlush(usuario);
// o si no podés hacer await:
em.persistAndFlush(usuario).catch(console.error);`}
            />
          </div>

          <div className="concept-card" style={{ borderLeft: '4px solid var(--danger-border)' }}>
            <div className="card-icon">❌</div>
            <h4>3. await en serie innecesario</h4>
            <CodeBlock
              title=""
              language="TypeScript"
              code={`// ❌ Lento si son independientes:
const a = await tarea1(); // 300ms
const b = await tarea2(); // 200ms → empieza después

// ✅ Paralelo con Promise.all:
const [a, b] = await Promise.all([tarea1(), tarea2()]);
// Total: solo 300ms`}
            />
          </div>

          <div className="concept-card" style={{ borderLeft: '4px solid var(--danger-border)' }}>
            <div className="card-icon">❌</div>
            <h4>4. Código bloqueante en handlers</h4>
            <CodeBlock
              title=""
              language="TypeScript"
              code={`// ❌ Un while síncrono en un handler bloquea el servidor completo
app.get('/procesar', (req, res) => {
  while(calcular()) {} // bloquea Node.js para TODOS
  res.json({ ok: true });
});

// ✅ Mover cálculos pesados a worker threads o
//    a una queue de trabajos`}
            />
          </div>

          <div className="concept-card" style={{ borderLeft: '4px solid var(--danger-border)' }}>
            <div className="card-icon">❌</div>
            <h4>5. No tener manejador global</h4>
            <CodeBlock
              title=""
              language="TypeScript"
              code={`// ❌ Sin esto, un error no capturado crashea el proceso:
// UnhandledPromiseRejectionWarning

// ✅ Agregar al inicio del servidor:
process.on('unhandledRejection', (error) => {
  console.error('Promesa no manejada:', error);
});`}
            />
          </div>
        </div>
      </div>

      {/* ================================================================
          8. CHEATSHEET
          ================================================================ */}
      <div id="async-cheatsheet" style={{ marginBottom: '64px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '16px',
          marginBottom: '24px',
          marginTop: '48px'
        }}>
          <div style={{ fontSize: '36px', lineHeight: 1 }}>📋</div>
          <div>
            <h2 style={{ fontSize: '24px', margin: 0, border: 'none', paddingBottom: 0 }}>
              8. Cheatsheet / Resumen final
            </h2>
            <p style={{ marginBottom: 0, color: 'var(--text-muted)', fontSize: '15px' }}>
              Todo lo que necesitás recordar en una tabla
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Idea clave</th>
                <th>En el SuperGestor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Síncrono</strong></td>
                <td>Línea por línea, bloquea el hilo hasta terminar</td>
                <td>Validaciones, <code>jwt.sign()</code>, lógica en memoria</td>
              </tr>
              <tr>
                <td><strong>Asíncrono</strong></td>
                <td>Delega tareas lentas, el Event Loop sigue libre</td>
                <td>Consultas a BD, bcrypt, I/O de archivos</td>
              </tr>
              <tr>
                <td><strong>Callback</strong></td>
                <td>Función pasada como argumento, ejecutada cuando termina la tarea</td>
                <td><code>fs.readFile(path, callback)</code> en <code>server.js</code></td>
              </tr>
              <tr>
                <td><strong>Promise</strong></td>
                <td>Objeto con estados: <em>pending → fulfilled | rejected</em></td>
                <td>Devuelta por <code>em.findOne()</code>, <code>bcrypt.hash()</code>, etc.</td>
              </tr>
              <tr>
                <td><strong><code>async</code></strong></td>
                <td>Convierte una función en una que siempre devuelve una Promesa</td>
                <td>Todos los handlers: <code>export async function login()</code></td>
              </tr>
              <tr>
                <td><strong><code>await</code></strong></td>
                <td>Pausa la función async actual, no bloquea el proceso</td>
                <td><code>await em.findOne()</code>, <code>await bcrypt.compare()</code></td>
              </tr>
              <tr>
                <td><strong><code>try/catch</code></strong></td>
                <td>Captura errores de awaits fallidos y código síncrono</td>
                <td>Envuelve todos los handlers del backend</td>
              </tr>
              <tr>
                <td><strong><code>Promise.all</code></strong></td>
                <td>Ejecuta promesas en paralelo, espera a todas, falla si una falla</td>
                <td>Para operaciones BD independientes entre sí</td>
              </tr>
              <tr>
                <td><strong><code>Promise.allSettled</code></strong></td>
                <td>Igual pero nunca falla — informa el estado de cada una</td>
                <td>Cuando querés todos los resultados sin que una falla detenga las demás</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip" title="Regla de oro">
          <p>
            Si una función usa <code>await</code> dentro, tiene que estar declarada como <code>async</code>. Y si hay un <code>await</code> que puede fallar, siempre conviene envolverlo en un <code>try/catch</code> para evitar errores no controlados que crasheen el servidor.
          </p>
        </Callout>

        <h3>Funciones útiles relacionadas</h3>
        <div className="table-wrapper">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Función / Concepto</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>setTimeout(fn, ms)</code></td><td>Ejecuta <code>fn</code> una vez, después de <code>ms</code> milisegundos.</td></tr>
              <tr><td><code>setInterval(fn, ms)</code></td><td>Ejecuta <code>fn</code> repetidamente cada <code>ms</code> milisegundos.</td></tr>
              <tr><td><code>clearTimeout(id)</code></td><td>Cancela un timer antes de que se dispare.</td></tr>
              <tr><td><code>setImmediate(fn)</code></td><td>Ejecuta <code>fn</code> apenas termine la fase actual del event loop.</td></tr>
              <tr><td><code>process.nextTick(fn)</code></td><td>Ejecuta <code>fn</code> inmediatamente después de la operación actual, antes de cualquier otra fase.</td></tr>
              <tr><td><code>fs/promises</code></td><td>Versión de las funciones de <code>fs</code> que devuelven promesas en vez de usar callbacks.</td></tr>
              <tr><td><code>util.promisify()</code></td><td>Convierte una función basada en callbacks en una que devuelve una Promesa.</td></tr>
              <tr><td><code>Promise.resolve(valor)</code></td><td>Crea una promesa ya resuelta con ese valor.</td></tr>
              <tr><td><code>Promise.reject(error)</code></td><td>Crea una promesa ya rechazada con ese error.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
