import React, { useState } from 'react';

export default function ApiTester({ method = 'POST', endpoint, initialPayload, testType }) {
  const [payloadText, setPayloadText] = useState(JSON.stringify(initialPayload, null, 2));
  const [response, setResponse] = useState('// Haz clic en "Probar Endpoint" para ejecutar...');
  const [statusColor, setStatusColor] = useState('transparent');

  const handleRun = () => {
    try {
      const data = JSON.parse(payloadText);

      if (testType === 'registro') {
        if (!data.usuarioId || !data.nombre || !data.alias || !data.origen) {
          setResponse(JSON.stringify({
            status: 400,
            error: "Bad Request",
            message: "Campos requeridos: usuarioId, nombre, alias, origen"
          }, null, 2));
          setStatusColor('#dc3545');
          return;
        }

        const tipo = (data.tipoMeta || '').toUpperCase();
        let entity = {};

        if (tipo === 'HEROE' || tipo === 'HERÓE') {
          entity = {
            id: 24,
            nombre: data.nombre,
            alias: data.alias,
            origen: data.origen,
            tipoMeta: "heroe",
            nivelFama: data.nivelFama || "Bajo",
            estatus: "activo",
            numeroVictorias: data.numeroVictorias || 0,
            usuarioId: data.usuarioId,
            email: "heroe.nuevo@supergestor.gov",
            telefono: "+54 11 4455-6677",
            latitud: data.latitud ? Number(data.latitud) : null,
            longitud: data.longitud ? Number(data.longitud) : null
          };
        } else if (tipo === 'VILLANO') {
          entity = {
            id: 25,
            nombre: data.nombre,
            alias: data.alias,
            origen: data.origen,
            tipoMeta: "villano",
            nivelPeligrosidad: data.nivelPeligrosidad || "Baja",
            estado: "activo",
            recompensa: 0,
            usuarioId: data.usuarioId,
            email: "villano.nuevo@supergestor.gov",
            telefono: "+54 11 9988-1122",
            latitud: data.latitud ? Number(data.latitud) : null,
            longitud: data.longitud ? Number(data.longitud) : null
          };
        } else {
          entity = {
            id: 26,
            nombre: data.nombre,
            alias: data.alias,
            origen: data.origen,
            tipoMeta: "metahumano",
            usuarioId: data.usuarioId,
            email: "metahumano@supergestor.gov",
            telefono: "+54 11 1234-5678"
          };
        }

        setResponse(JSON.stringify({
          status: 201,
          message: "Perfil de metahumano creado exitosamente",
          data: entity
        }, null, 2));
        setStatusColor('#28a745');

      } else if (testType === 'estilo-vida') {
        const tipoMeta = (data.tipoMeta || '').toUpperCase();
        if (!tipoMeta) {
          setResponse(JSON.stringify({
            status: 400,
            message: "El campo tipoMeta es requerido (HEROE o VILLANO)"
          }, null, 2));
          setStatusColor('#dc3545');
          return;
        }

        if (tipoMeta !== 'HEROE' && tipoMeta !== 'HERÓE' && tipoMeta !== 'VILLANO') {
          setResponse(JSON.stringify({
            status: 400,
            message: "tipoMeta inválido. Debe ser HEROE o VILLANO"
          }, null, 2));
          setStatusColor('#dc3545');
          return;
        }

        let respData = {};
        if (tipoMeta === 'HEROE' || tipoMeta === 'HERÓE') {
          respData = {
            id: 12,
            nombre: "Barry Allen",
            alias: "The Flash",
            origen: "Accidente con acelerador de partículas",
            tipoMeta: "heroe",
            nivelFama: data.nivelFama || "Alto",
            estatus: data.estatus || "activo",
            numeroVictorias: data.numeroVictorias || 15,
            mision: data.mision || "Proteger Central City"
          };
        } else {
          respData = {
            id: 12,
            nombre: "Leonard Snart",
            alias: "Captain Cold",
            origen: "Armamento criogénico avanzado",
            tipoMeta: "villano",
            nivelPeligrosidad: data.nivelPeligrosidad || "Alta",
            estado: data.estado || "activo",
            recompensa: 50000,
            motivacion: data.motivacion || "El control del bajo mundo criminal",
            _notaNegocio: "Recompensa calculada automáticamente sumando multas impagas ($50,000)"
          };
        }

        setResponse(JSON.stringify({
          status: 200,
          message: `Estilo de vida definido como ${tipoMeta} exitosamente`,
          data: respData
        }, null, 2));
        setStatusColor('#28a745');
      }

    } catch (err) {
      setResponse(JSON.stringify({
        status: 400,
        error: "JSON Parse Error",
        message: "El cuerpo de la petición no tiene un formato JSON válido"
      }, null, 2));
      setStatusColor('#dc3545');
    }
  };

  const getBadgeClass = (m) => {
    switch (m.toUpperCase()) {
      case 'GET': return 'badge-get';
      case 'POST': return 'badge-post';
      case 'PUT': return 'badge-put';
      case 'DELETE': return 'badge-delete';
      default: return 'badge-get';
    }
  };

  return (
    <div className="api-tester">
      <div className="api-tester-header">
        <span className={`http-badge ${getBadgeClass(method)}`}>{method}</span>
        <div className="endpoint-display">
          <span>URL:</span>
          <span className="endpoint-url">{endpoint}</span>
        </div>
        <button onClick={handleRun} className="run-test-btn">▶ Probar Endpoint</button>
      </div>

      <div className="tester-grid">
        <div>
          <div className="tester-panel-title">Body de la Petición (JSON)</div>
          <textarea 
            className="tester-textarea"
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
          />
        </div>
        <div>
          <div className="tester-panel-title">Respuesta Simulada del Controlador</div>
          <pre className="tester-response" style={{ borderLeft: `4px solid ${statusColor}` }}>
            {response}
          </pre>
        </div>
      </div>
    </div>
  );
}
