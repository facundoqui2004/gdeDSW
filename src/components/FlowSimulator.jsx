import React, { useState, useEffect } from 'react';

export default function FlowSimulator({ title, scenarios }) {
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0]?.id);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  useEffect(() => {
    let timer;
    if (isRunning && currentStepIndex < activeScenario.steps.length) {
      timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 600);
    } else if (isRunning && currentStepIndex >= activeScenario.steps.length) {
      setIsRunning(false);
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentStepIndex, activeScenario.steps.length]);

  const handleRun = () => {
    setCurrentStepIndex(0);
    setIsRunning(true);
  };

  const handleReset = () => {
    setCurrentStepIndex(-1);
    setIsRunning(false);
  };

  const getTypeColor = (type) => {
    const colors = {
      info: '#3b82f6',
      query: '#8b5cf6',
      success: '#22c55e',
      error: '#ef4444',
      create: '#f97316',
      db: '#06b6d4',
      check: '#eab308',
    };
    return colors[type] || '#6b7280';
  };

  const getStatusColor = (status) => {
    if (status === 200 || status === 201) return '#22c55e';
    if (status === 400 || status === 404) return '#ef4444';
    if (status === 401 || status === 403) return '#f59e0b';
    return '#6b7280';
  };

  const getScenarioButtonColor = (colorCode) => {
    if (colorCode === 'success') return '#dcfce7'; // green-100
    if (colorCode === 'warning') return '#fef3c7'; // yellow-100
    if (colorCode === 'danger') return '#fee2e2'; // red-100
    return '#f3f4f6';
  };

  const getScenarioButtonBorderColor = (colorCode) => {
    if (colorCode === 'success') return '#22c55e';
    if (colorCode === 'warning') return '#f59e0b';
    if (colorCode === 'danger') return '#ef4444';
    return '#d1d5db';
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '24px',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.25rem', color: '#111827' }}>
        {title}
      </h3>

      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => {
              if (isRunning) return;
              setActiveScenarioId(scenario.id);
              setCurrentStepIndex(-1);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              border: `1px solid ${activeScenarioId === scenario.id ? getScenarioButtonBorderColor(scenario.color) : '#e5e7eb'}`,
              backgroundColor: activeScenarioId === scenario.id ? getScenarioButtonColor(scenario.color) : '#f9fafb',
              color: '#374151',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontWeight: activeScenarioId === scenario.id ? '600' : '400',
              opacity: isRunning && activeScenarioId !== scenario.id ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Top panel: Input and controls */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '6px', padding: '12px', overflow: 'auto' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Input (req.body)</div>
            <pre style={{ margin: 0, color: '#e2e8f0', fontSize: '0.875rem' }}>
              {JSON.stringify(activeScenario.input, null, 2)}
            </pre>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '120px' }}>
            <button
              onClick={handleRun}
              disabled={isRunning}
              style={{
                backgroundColor: isRunning ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isRunning ? 'Ejecutando...' : '▶ Ejecutar'}
            </button>
            <button
              onClick={handleReset}
              disabled={isRunning || currentStepIndex === -1}
              style={{
                backgroundColor: 'transparent',
                color: '#4b5563',
                border: '1px solid #d1d5db',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: (isRunning || currentStepIndex === -1) ? 'not-allowed' : 'pointer',
                opacity: (isRunning || currentStepIndex === -1) ? 0.5 : 1
              }}
            >
              Reiniciar
            </button>
          </div>
        </div>

        {/* Steps List */}
        <div style={{ marginTop: '10px', borderLeft: '2px solid #e5e7eb', paddingLeft: '20px', marginLeft: '10px', minHeight: '100px' }}>
          {currentStepIndex >= 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeScenario.steps.slice(0, currentStepIndex + 1).map((step, idx) => (
                <div key={idx} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.3s ease-in-out' }}>
                  {/* Step circle */}
                  <div style={{
                    position: 'absolute',
                    left: '-31px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: getTypeColor(step.type),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    boxShadow: '0 0 0 4px white'
                  }}>
                    {idx + 1}
                  </div>
                  
                  {/* Step content */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>Línea {step.line}</span>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: getTypeColor(step.type) + '20',
                        color: getTypeColor(step.type),
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {step.type}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#334155' }}>{step.desc}</span>
                  </div>
                </div>
              ))}
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </div>
          ) : (
            <div style={{ color: '#9ca3af', fontStyle: 'italic', padding: '10px 0' }}>
              Presiona "Ejecutar" para ver la simulación del flujo...
            </div>
          )}
        </div>

        {/* Response Panel */}
        {currentStepIndex >= activeScenario.steps.length && (
          <div style={{
            marginTop: '10px',
            backgroundColor: '#1e293b',
            borderRadius: '6px',
            padding: '12px',
            animation: 'fadeIn 0.5s ease-in-out',
            borderLeft: `4px solid ${getStatusColor(activeScenario.response.status)}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Response</span>
              <span style={{
                fontSize: '0.875rem',
                backgroundColor: getStatusColor(activeScenario.response.status),
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}>
                Status {activeScenario.response.status}
              </span>
            </div>
            <pre style={{ margin: 0, color: '#e2e8f0', fontSize: '0.875rem' }}>
              {JSON.stringify(activeScenario.response.body, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
