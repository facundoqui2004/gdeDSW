import React, { useState, useEffect } from 'react';

/**
 * TestTrace — Simulación animada paso a paso de lo que ocurre cuando corre un test.
 * Props:
 *   testName: string — Nombre del test (ej: "Test 1.1 — Hashing con bcrypt")
 *   steps: Array<{
 *     icon: string,         — Emoji o símbolo del paso
 *     actor: string,        — Quién ejecuta (ej: "Node:test runner", "bcrypt", "assert")
 *     action: string,       — Qué hace
 *     result: string,       — Qué produce / devuelve
 *     type: 'runner'|'code'|'lib'|'assert'|'ok'|'fail'
 *   }>
 *   verdict: 'pass' | 'fail'
 */
export default function TestTrace({ testName, steps, verdict = 'pass' }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const typeStyles = {
    runner: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8', label: 'RUNNER' },
    code:   { bg: '#f3f4f6', border: '#6b7280', text: '#374151', label: 'CÓDIGO' },
    lib:    { bg: '#ede9fe', border: '#7c3aed', text: '#5b21b6', label: 'LIBRERÍA' },
    assert: { bg: '#fef3c7', border: '#d97706', text: '#92400e', label: 'ASSERT' },
    ok:     { bg: '#dcfce7', border: '#16a34a', text: '#15803d', label: 'OK ✓' },
    fail:   { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', label: 'FALLA ✗' },
  };

  const run = () => {
    setVisibleCount(0);
    setDone(false);
    setRunning(true);
  };

  const reset = () => {
    setVisibleCount(0);
    setDone(false);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    if (visibleCount < steps.length) {
      const t = setTimeout(() => setVisibleCount(v => v + 1), 550);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setDone(true); setRunning(false); }, 400);
      return () => clearTimeout(t);
    }
  }, [running, visibleCount, steps.length]);

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: '#1e293b',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🧪 Simulación
        </span>
        <span style={{ color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 600, flex: 1, marginLeft: '8px' }}>
          {testName}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={run}
            disabled={running}
            style={{
              background: running ? '#475569' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '5px 12px',
              cursor: running ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            {running ? '⏳ Corriendo...' : '▶ Correr test'}
          </button>
          {(visibleCount > 0 && !running) && (
            <button
              onClick={reset}
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {/* Steps */}
      <div style={{ padding: '16px 20px', background: '#f8fafc', minHeight: '60px' }}>
        {visibleCount === 0 && !done && (
          <p style={{ color: '#9ca3af', fontStyle: 'italic', margin: 0, fontSize: '0.875rem' }}>
            Presioná "Correr test" para ver qué pasa internamente...
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {steps.slice(0, visibleCount).map((step, i) => {
            const s = typeStyles[step.type] || typeStyles.code;
            return (
              <div key={i} style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                animation: 'trace-in 0.3s ease-out',
              }}>
                {/* Step number */}
                <div style={{
                  minWidth: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: s.border,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginTop: '2px',
                }}>
                  {i + 1}
                </div>

                {/* Content */}
                <div style={{
                  flex: 1,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  borderRadius: '6px',
                  padding: '8px 12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: s.text }}>
                      {step.icon} {step.actor}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: s.text,
                      background: s.border + '22',
                      border: `1px solid ${s.border}`,
                      borderRadius: '4px',
                      padding: '1px 6px',
                      textTransform: 'uppercase',
                    }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#1e293b', marginBottom: step.result ? '4px' : 0 }}>
                    {step.action}
                  </div>
                  {step.result && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#475569',
                      fontFamily: 'monospace',
                      background: '#ffffff88',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      marginTop: '4px',
                      wordBreak: 'break-all',
                    }}>
                      → {step.result}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Verdict */}
        {done && (
          <div style={{
            marginTop: '14px',
            padding: '10px 16px',
            borderRadius: '8px',
            background: verdict === 'pass' ? '#dcfce7' : '#fee2e2',
            border: `2px solid ${verdict === 'pass' ? '#16a34a' : '#dc2626'}`,
            color: verdict === 'pass' ? '#15803d' : '#991b1b',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'trace-in 0.4s ease-out',
          }}>
            {verdict === 'pass' ? '✅ TEST PASSED' : '❌ TEST FAILED'}
          </div>
        )}
      </div>

      <style>{`
        @keyframes trace-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
